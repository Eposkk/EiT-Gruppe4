import asyncio
import logging
import numpy as np
import os
from aiohttp import web
from aiortc import RTCPeerConnection, RTCSessionDescription

ROOT = os.path.dirname(__file__)

pcs = set()
dcs = set()

async def index(request):
    content = open(os.path.join(ROOT, "index.html"), "r").read()
    return web.Response(content_type="text/html", text=content)

async def offer(request):
    params = await request.json()
    offer = RTCSessionDescription(sdp=params["sdp"], type=params["type"])

    pc = RTCPeerConnection()
    pcs.add(pc)

    dc = pc.createDataChannel("lidar_scan")

    @pc.on("datachannel")
    def on_datachannel(dc):
        if dc.label != "lidar_scan":
            dc.close()

        dcs.add(dc)
        
        @dc.on("close")
        def on_close():
            dcs.discard(dc)

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

async def lidar():
    scan = np.zeros((16 * 1024, 3), dtype=np.float32)
    scan[:, 0] = np.linspace(-1, 1, 16 * 1024)
    t = 0.0

    while True:
        await asyncio.sleep(0.1)

        # scan = np.zeros((16 * 1024, 3), dtype=np.float32)
        # scan[:, 0] = np.linspace(-1, 1, 10000)
        scan[:, 1] = np.sin(scan[:, 0] * 10 + t)
        # scan[:, 2] = 0.0
        t += 0.1

        data = scan.tobytes()
        for dc in dcs:
            dc.send(data)

app = web.Application()
app.on_shutdown.append(on_shutdown)
app.router.add_get("/", index)
app.router.add_post("/offer", offer)

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    loop = asyncio.get_event_loop()
    loop.create_task(lidar())
    web.run_app(app, loop=loop)