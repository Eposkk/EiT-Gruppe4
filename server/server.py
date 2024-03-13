import aiohttp_cors
import asyncio
import json
import logging
import numpy as np
import os
import pmsa003i
import time
from aiohttp import web
from aiortc import RTCPeerConnection, RTCSessionDescription
from bme688 import BME680_I2C
from contextlib import closing
from ouster import client
from producer import RTCProducer


ROOT = os.path.dirname(__file__)


lidar_hostname = "os1-122013000119.local"
lidar_min_range = 1.0
lidar_max_range = 20.0


class LidarProducer(RTCProducer):
    def produce(self):
        with closing(client.Sensor(lidar_hostname, 7502, 7503)) as source:
            xyzlut = client.XYZLut(source.metadata)
            with closing(client.Scans(source)) as scans:
                for scan in scans:
                    range = scan.field(client.ChanField.RANGE)
                    range_destaggered = client.destagger(source.metadata, range)
                    mask = np.logical_and(
                        range_destaggered >= lidar_min_range * 1000,
                        range_destaggered <= lidar_max_range * 1000)
                    xyz_destaggered = client.destagger(source.metadata, xyzlut(scan))
                    data = np.ascontiguousarray(xyz_destaggered[mask], dtype='<f4').tobytes()
                    self.send(data)


class SensorProducer(RTCProducer):
    def produce(self):
        sensor = BME680_I2C(i2c_bus=1)
        while True:
            data = json.dumps({
                "seconds": time.time(),
                "temperature": sensor.temperature,
                "pressure": sensor.pressure,
                "humidity": sensor.humidity,
                "gas": sensor.gas,
                "particles": pmsa003i.read()
            }).encode("utf-8")
            self.send(data)


pcs = set()
producers = {
    "lidar_scan": LidarProducer(),
    "sensor_data": SensorProducer()
}


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
        if dc.label not in producers:
            dc.close()
            return

        producers[dc.label].add(dc)

        @dc.on("close")
        def on_close():
            producers[dc.label].discard(dc)

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


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

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

    for route in app.router.routes():
        cors.add(route)

    for producer in producers.values():
        producer.start()
    
    web.run_app(app, loop=asyncio.get_event_loop())
