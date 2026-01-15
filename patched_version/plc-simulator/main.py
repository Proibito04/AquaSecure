import logging
import asyncio
import signal
from pymodbus.server import StartAsyncTcpServer, ModbusTcpRequestHandler
from pymodbus.device import ModbusDeviceIdentification
from pymodbus.datastore import ModbusSequentialDataBlock, ModbusSlaveContext, ModbusServerContext

# --- SECURITY CONFIGURATION (PATCH) ---
# Only allow the SCADA Backend (and the Docker Gateway) to connect
ALLOWED_IPS = ['192.168.10.10', '127.0.0.1'] 

# Register Configuration
REGISTER_ADDR = 20 
INITIAL_CHLORINE = 50 

logging.basicConfig()
log = logging.getLogger()
log.setLevel(logging.INFO)

class SecureModbusHandler(ModbusTcpRequestHandler):
    """
    This acts as a Firewall inside the Python script.
    It checks the client's IP address before processing the request.
    """
    def handle(self):
        client_ip = self.client_address[0]
        if client_ip not in ALLOWED_IPS:
            log.warning(f"[SECURITY ALERT] Blocked Unauthorized Connection from: {client_ip}")
            self.request.close()
            return
        
        log.info(f"[+] Authorized Connection from: {client_ip}")
        super().handle()

async def run_patched_server():
    # Setup DataBlock
    block = [0] * 100
    block[REGISTER_ADDR] = INITIAL_CHLORINE
    
    # Initialize Context
    store = ModbusSlaveContext(
        hr=ModbusSequentialDataBlock(0, block),
        ir=ModbusSequentialDataBlock(0, [0]*100),
        co=ModbusSequentialDataBlock(0, [0]*100),
        di=ModbusSequentialDataBlock(0, [0]*100)
    )
    context = ModbusServerContext(slaves=store, single=True)

    # Identity Configuration
    identity = ModbusDeviceIdentification()
    identity.VendorName = 'AquaSecure Industrial'
    identity.ProductCode = 'CL-DOSING-2000'
    identity.ProductName = 'Disinfection Unit PLC'

    log.info("[-] SECURE PLC RUNNING. IP Whitelist Enabled.")
    
    # Graceful shutdown setup
    stop_event = asyncio.Event()
    loop = asyncio.get_running_loop()
    def handle_signal():
        log.info("[-] RECEIVED TERMINATION SIGNAL. Shutting down...")
        stop_event.set()
    for sig in (signal.SIGTERM, signal.SIGINT):
        loop.add_signal_handler(sig, handle_signal)

    # Start Server with custom request handler
    server_task = asyncio.create_task(
        StartAsyncTcpServer(
            context=context, 
            identity=identity, 
            address=("0.0.0.0", 502),
            request_handler=SecureModbusHandler
        )
    )

    await stop_event.wait()
    server_task.cancel()
    try:
        await server_task
    except asyncio.CancelledError:
        pass
    
    log.info("[-] OT SYSTEM SHUTDOWN COMPLETE.")

if __name__ == "__main__":
    try:
        asyncio.run(run_patched_server())
    except KeyboardInterrupt:
        pass