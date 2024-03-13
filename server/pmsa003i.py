import time
import board
import busio
from adafruit_pm25.i2c import PM25_I2C

# Create library object, use 'slow' 100KHz frequency!
i2c = busio.I2C(board.SCL, board.SDA, frequency=100000)
# Connect to a PM2.5 sensor over I2C
reset_pin = None # Optional, set to None if unused
pm25 = PM25_I2C(i2c, reset_pin)

def read():
    while True:
        try:
            aqdata = pm25.read()
            return aqdata
        except RuntimeError:
            print("Unable to read from sensor, retrying...")
        time.sleep(1)