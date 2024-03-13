import aiohttp_cors
import asyncio
import bme688
import json
import logging
import numpy as np
import os
import sys
import time
from aiohttp import web
from aiojobs.aiohttp import setup, spawn
from aiortc import RTCPeerConnection, RTCSessionDescription
from aiortc import RTCDataChannel
from contextlib import closing
from ouster import client
from smbus2 import SMBus
from typing import Set

ROOT = os.path.dirname(__file__)

lidar_hostname = "os1-122013000119.local"
lidar_range_threshold = 1.0

lidar = web.AppKey("lidar_worker", asyncio.Task[None])
lidar_dcs: Set[RTCDataChannel] = set()

sensor = web.AppKey("sensor_worker", asyncio.Task[None])
sensor_dcs: Set[RTCDataChannel] = set()

loop = asyncio.new_event_loop()
asyncio.set_event_loop(loop)

pcs = set()

async def index(request):
    print(request)
    content = open(os.path.join(ROOT, "index.html"), "r").read()
    return web.Response(content_type="text/html", text=content)

async def offer_async(request):
    params = await request.json()
    offer = RTCSessionDescription(sdp=params["sdp"], type=params["type"])

    pc = RTCPeerConnection()
    pcs.add(pc)

    @pc.on("datachannel")
    def on_datachannel(dc):
        print(f"Data channel {dc.label} opened.")

        if dc.label == "lidar_scan":
            lidar_dcs.add(dc)
        elif dc.label == "sensors":
            print("Sensors added")
            sensor_dcs.add(dc)

        @dc.on("close")
        def on_close():
            print(f"Data channel {dc.label} closed.")
            if dc in lidar_dcs:
                lidar_dcs.discard(dc)
            elif dc in sensor_dcs:
                sensor_dcs.discard(dc)

    @pc.on("iceconnectionstatechange")
    async def on_iceconnectionstatechange():
        if pc.iceConnectionState == "failed":
            await pc.close()
            pcs.discard(pc)

    

    await pc.setRemoteDescription(offer)
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    return web.json_response(
        {"sdp": pc.localDescription.sdp, "type": pc.localDescription.type}
    )

def offer():
    future = asyncio.run_coroutine_threadsafe(offer_async(), loop)
    return future.result()


async def on_shutdown(app):
    coros = [pc.close() for pc in pcs]
    await asyncio.gather(*coros)
    pcs.clear()

async def lidar_worker(app: web.Application):
    
    
    # Your blocking operation wrapped in a function
    def blocking_lidar_function(app):
        start_time = time.time()
        with closing(client.Sensor(lidar_hostname, 7502, 7503)) as source:
            # app.logger.info some useful info from
            app.logger.info("Retrieved metadata:")
            app.logger.info(f"  serial no:        {source.metadata.sn}")
            app.logger.info(f"  firmware version: {source.metadata.fw_rev}")
            app.logger.info(f"  product line:     {source.metadata.prod_line}")
            app.logger.info(f"  lidar mode:       {source.metadata.mode}")
            app.logger.info(f"Writing to: {lidar_hostname}.json")

            # write metadata to disk
            source.write_metadata(f"{lidar_hostname}.json")
        with closing(client.Scans.stream(lidar_hostname, 7502,
                                 complete=False)) as stream:
            xyzlut = client.XYZLut(source.metadata)
            show = True
            while show:
                for scan in stream:
                    app.logger.info("Scanning...")
                    # uncomment if you'd like to see frame id app.logger.infoed
                    # app.logger.info("frame id: {} ".format(scan.frame_id))
                    range = scan.field(client.ChanField.RANGE)
                    range_destaggered = client.destagger(source.metadata, range)
                    xyz_destaggered = client.destagger(source.metadata, xyzlut(scan))
                    xyz_filtered = xyz_destaggered[range_destaggered > lidar_range_threshold]
                    
                    # Schedule sending data to the event loop from the executor

                    async def send_frames():
                        for dc in list(lidar_dcs): 
                            data = np.array(xyz_filtered).tobytes()
                            dc.send(data)
                            await asyncio.sleep(0.01)  

                    asyncio.ensure_future(send_frames())
                   
    
    # Use run_in_executor for blocking operations
    loop = asyncio.get_running_loop()
    future = asyncio.run_coroutine_threadsafe(blocking_lidar_function(app), loop)

    app.logger.warning("Lidar thread stopped")


async def sensor_worker(app: web.Application):
    app.logger.info("Sensor worker started")

    async def send(data):
        for dc in sensor_dcs:
            await dc.send(json.dumps(data))

    async def main():
        with SMBus(1) as bus:
            bme688.init(bus)
            while True:
                await asyncio.sleep(0)  # Non-blocking sleep for cooperative multitasking
                bme688.trigger(bus)
                t = bme688.read_temperature(bus)
                p = bme688.read_pressure(bus, t)
                await send({"temperature": t, "pressure": p})

    loop = asyncio.get_running_loop()
    future = asyncio.run_coroutine_threadsafe(main(), loop)

async def start_background_tasks(app: web.Application) -> None:
    app[lidar] = asyncio.create_task(lidar_worker(app))
    app[sensor] = asyncio.create_task(sensor_worker(app))

async def cleanup_background_tasks(app: web.Application) -> None:
    app.logger.info("cleanup background tasks...")
    app[lidar].cancel()
    app[sensor].cancel()
    await app[lidar]
    await app[sensor]

def init() -> web.Application:
    app = web.Application()
    app.router.add_post("/offer", offer)
    app.router.add_get("/", index)
    cors = aiohttp_cors.setup(app, defaults={
        "*": aiohttp_cors.ResourceOptions(
            allow_credentials=True,
            expose_headers="*",
            allow_headers="*",
        )
    })

    for route in list(app.router.routes()):
        cors.add(route)

    app.on_startup.append(start_background_tasks)
    app.on_cleanup.append(cleanup_background_tasks)
    app.on_shutdown.append(on_shutdown)
    return app

web.run_app(init())
