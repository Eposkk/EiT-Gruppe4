BME688_ADDR = 0x77

def init(bus):
    bus.write_byte_data(BME688_ADDR, 0x72, 0b00000001) # enable humidity
    bus.write_byte_data(BME688_ADDR, 0x74, 0b00100100) # enable temperature and pressure

def trigger(bus):
    ctrl_meas = bus.read_byte_data(BME688_ADDR, 0x74)
    bus.write_byte_data(BME688_ADDR, 0x74, ctrl_meas | 1) # trigger measurement

def read_temperature(bus):
    par_t1 = bus.read_byte_data(BME688_ADDR, 0xE9) | bus.read_byte_data(BME688_ADDR, 0xEA) << 8
    par_t2 = bus.read_byte_data(BME688_ADDR, 0x8A) | bus.read_byte_data(BME688_ADDR, 0x8B) << 8
    par_t3 = bus.read_byte_data(BME688_ADDR, 0x8C)
    temp_adc = bus.read_byte_data(BME688_ADDR, 0x24) >> 4 | bus.read_byte_data(BME688_ADDR, 0x23) << 4 | bus.read_byte_data(BME688_ADDR, 0x22) << 12
    var1 = (temp_adc / 16384.0 - par_t1 / 1024.0) * par_t2
    var2 = (temp_adc / 131072.0 - par_t1 / 8192.0) ** 2 * par_t3 * 16.0
    t_fine = var1 + var2
    return t_fine / 5120.0
