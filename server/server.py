import aiohttp_cors
import asyncio
import logging
import os
from aiohttp import web
from aiortc import RTCPeerConnection, RTCSessionDescription


ROOT = os.path.dirname(__file__)


lidar_hostname = "os1-122013000119.local"
lidar_min_range = 1.0
lidar_max_range = 20.0
fake_lidar = False
fake_sensor = False


if fake_lidar:
    from fake import FakeLidarProducer as LidarProducer
else:
    from lidar import LidarProducer

if fake_sensor:
    from fake import FakeSensorProducer as SensorProducer
else:
    from sensors import SensorProducer


pcs = set()
producers = {
    "lidar_scan": LidarProducer(lidar_hostname, lidar_min_range, lidar_max_range),
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
