import json
import pmsa003i
import time
from bme688 import BME680_I2C
from producer import RTCProducer


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
