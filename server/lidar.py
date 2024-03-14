import numpy as np
from contextlib import closing
from ouster import client
from producer import RTCProducer


class LidarProducer(RTCProducer):
    def __init__(self, lidar_hostname, lidar_min_range, lidar_max_range):
        super().__init__()
        self.lidar_hostname = lidar_hostname
        self.lidar_min_range_mm = lidar_min_range * 1000
        self.lidar_max_range_mm = lidar_max_range * 1000

    def produce(self):
        with closing(client.Sensor(self.lidar_hostname, 7502, 7503)) as source:
            xyzlut = client.XYZLut(source.metadata)
            with closing(client.Scans(source)) as scans:
                for scan in scans:
                    range = scan.field(client.ChanField.RANGE)
                    range_destaggered = client.destagger(source.metadata, range)
                    mask = np.logical_and(
                        range_destaggered >= self.lidar_min_range_mm,
                        range_destaggered <= self.lidar_max_range_mm)
                    xyz_destaggered = client.destagger(source.metadata, xyzlut(scan))
                    data = np.ascontiguousarray(xyz_destaggered[mask], dtype='<f4').tobytes()
                    self.send(data)
