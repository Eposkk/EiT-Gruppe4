import DracoPy
import json
import numpy as np
import time
from producer import RTCProducer

class FakeLidarProducer(RTCProducer):
    def __init__(self, *args, **kwargs):
        super().__init__()

    def produce(self):
        while True:
            xyz_destaggered = np.random.rand(16, 1024, 3)
            # data = xyz_destaggered.tobytes()
            data = DracoPy.encode(xyz_destaggered.reshape(-1, 3))
            self.send(data)
            time.sleep(0.1)


class FakeSensorProducer(RTCProducer):
    def produce(self):
        while True:
            data = json.dumps({
                "seconds": time.time(),
                "temperature": np.random.rand(),
                "pressure": np.random.rand(),
                "humidity": np.random.rand(),
                "gas": np.random.rand(),
                "particles": np.random.rand()
            }).encode("utf-8")
            self.send(data)
            time.sleep(1)
