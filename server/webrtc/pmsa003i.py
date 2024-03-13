PMSA003I_ADDR = 0x12

def read(bus):
    um003 = bus.read_byte_data(PMSA003I_ADDR, 0x11) | bus.read_byte_data(PMSA003I_ADDR, 0x10) << 8
    um005 = bus.read_byte_data(PMSA003I_ADDR, 0x13) | bus.read_byte_data(PMSA003I_ADDR, 0x12) << 8
    um010 = bus.read_byte_data(PMSA003I_ADDR, 0x15) | bus.read_byte_data(PMSA003I_ADDR, 0x14) << 8
    um025 = bus.read_byte_data(PMSA003I_ADDR, 0x17) | bus.read_byte_data(PMSA003I_ADDR, 0x16) << 8
    um050 = bus.read_byte_data(PMSA003I_ADDR, 0x19) | bus.read_byte_data(PMSA003I_ADDR, 0x18) << 8
    um100 = bus.read_byte_data(PMSA003I_ADDR, 0x1b) | bus.read_byte_data(PMSA003I_ADDR, 0x1a) << 8
    return (um003, um005, um010, um025, um050, um100)
