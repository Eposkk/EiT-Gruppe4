import logging
from contextlib import closing
from flask import Flask, render_template
from flask_socketio import SocketIO
from ouster import client

lidar_hostname = "os1-122013000119.local"
lidar_range_threshold = 1.0

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route("/")
def home():
   return render_template("index.html")

def lidar():
    with closing(client.Sensor(lidar_hostname, 7502, 7503)) as source:
        xyzlut = client.XYZLut(source.metadata)
        with closing(client.Scans(source)) as scans:
            for scan in scans:
                range = scan.field(client.ChanField.RANGE)
                range_destaggered = client.destagger(source.metadata, range)
                xyz_destaggered = client.destagger(source.metadata, xyzlut(scan))
                xyz_filtered = xyz_destaggered[range_destaggered > lidar_range_threshold]
                socketio.emit("lidar_scan", xyz_filtered.flatten().tolist())
                app.logger.info("%d points sent", len(xyz_filtered))
    app.logger.warn("Lidar thread stopped")

if __name__ == "__main__":
    app.logger.setLevel(logging.INFO)
    socketio.start_background_task(target=lidar)
    socketio.run(app, host="0.0.0.0")
