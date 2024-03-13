import asyncio
from multiprocessing import Pipe, Process

class RTCProducer:
    def __init__(self):
        self.dcs = set()
        self.process = Process(target=self.produce)
        self.process.daemon = True
        self.recv_, self.send_ = Pipe()

        asyncio.get_event_loop().create_task(self.consume())
    
    def __contains__(self, dc):
        return dc in self.dcs
    
    def add(self, dc):
        self.dcs.add(dc)
    
    def discard(self, dc):
        self.dcs.discard(dc)

    def start(self):
        self.process.start()
    
    def send(self, buf):
        self.send_.send_bytes(buf)

    async def consume(self):
        data_available = asyncio.Event()
        asyncio.get_event_loop().add_reader(
            self.recv_.fileno(), data_available.set)
        
        while True:
            while not self.recv_.poll():
                await data_available.wait()
                data_available.clear()

            data = self.recv_.recv_bytes()
            for dc in self.dcs:
                dc.send(data)
