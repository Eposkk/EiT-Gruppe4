import aiohttp_cors
import asyncio
import bme688
import json
import logging
import numpy as np
import os
import pmsa003i
import time
from aiohttp import web
from aiortc import RTCPeerConnection, RTCSessionDescription
from contextlib import closing
from multiprocessing import Pipe, Process
from ouster import client
from smbus2 import SMBus

ROOT = os.path.dirname(__file__)

lidar_hostname = "os1-122013000119.local"
lidar_range_threshold = 1.0

pcs = set()
lidar_dcs = set()
sensors_dcs = set()


async def index(request):
    content = open(os.path.join(ROOT, "index.html"), "r").read()
    return web.Response(content_type="text/html", text=content)

async def offer(request):
    params = await request.json()
    offer = RTCSessionDescription(sdp=params["sdp"], type=params["type"])

    pc = RTCPeerConnection()
    pcs.add(pc)

    @pc.on("datachannel")
    def on_datachannel(dc):
        print("New DataChannel: ", dc.label)

        if dc.label == "lidar_scan":
            lidar_dcs.add(dc)
        elif dc.label == "sensor_data":
            sensors_dcs.add(dc)
        else:
            dc.close()

        @dc.on("close")
        def on_close():
            if dc in lidar_dcs:
                lidar_dcs.discard(dc)
            elif dc in sensors_dcs:
                sensors_dcs.discard(dc)

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

async def on_shutdown(app):
    coros = [pc.close() for pc in pcs]
    await asyncio.gather(*coros)
    pcs.clear()

lidar_recv, lidar_send = Pipe()
def lidar():
    with closing(client.Sensor(lidar_hostname, 7502, 7503)) as source:
        xyzlut = client.XYZLut(source.metadata)
        with closing(client.Scans(source)) as scans:
            for scan in scans:
                range = scan.field(client.ChanField.RANGE)
                range_destaggered = client.destagger(source.metadata, range)
                xyz_destaggered = client.destagger(source.metadata, xyzlut(scan))
                xyz_filtered = xyz_destaggered[range_destaggered > lidar_range_threshold]
                data = np.ascontiguousarray(xyz_filtered, dtype='<f4').tobytes()
                print(len(xyz_filtered))
                lidar_send.send_bytes(data)

async def lidar_sender():
    data_available = asyncio.Event()
    loop = asyncio.get_event_loop()
    loop.add_reader(lidar_recv.fileno(), data_available.set)
    
    while True:
        while not lidar_recv.poll():
            await data_available.wait()
            data_available.clear()

        data = lidar_recv.recv_bytes()
        for dc in lidar_dcs:
            dc.send(data)

sensors_recv, sensors_send = Pipe()
def sensors():
    with SMBus(1) as bus:
        bme688.init(bus)
        while True:
            bme688.trigger(bus)
            t = bme688.read_temperature(bus)
            # p = bme688.read_pressure(bus, t)
            pc = pmsa003i.read(bus)
            data = json.dumps({
                "seconds": time.time(),
                "temperature": t,
                "pressure": 10,
                "humidity": 10,
                "particles": pc
            }).encode("utf-8")
            sensors_send.send_bytes(data)            
            time.sleep(0.5)
       
async def sensors_sender():
    data_available = asyncio.Event()
    loop = asyncio.get_event_loop()
    loop.add_reader(sensors_recv.fileno(), data_available.set)
    
    while True:
        while not sensors_recv.poll():
            await data_available.wait()
            data_available.clear()

        data = sensors_recv.recv_bytes()
        for dc in sensors_dcs:
            dc.send(data)

app = web.Application()
app.on_shutdown.append(on_shutdown)
app.router.add_get("/", index)
app.router.add_post("/offer", offer)
cors = aiohttp_cors.setup(app, defaults={
    "*": aiohttp_cors.ResourceOptions(
        allow_credentials=True,
        expose_headers="*",
        allow_headers="*",
    )
})

for route in list(app.router.routes()):
    cors.add(route)

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    lidar_process = Process(target=lidar)
    lidar_process.daemon = True
    lidar_process.start()

    sensors_process = Process(target=sensors)
    sensors_process.daemon = True
    sensors_process.start()
    
    loop = asyncio.get_event_loop()
    loop.create_task(lidar_sender())
    loop.create_task(sensors_sender())
    web.run_app(app, loop=loop)
