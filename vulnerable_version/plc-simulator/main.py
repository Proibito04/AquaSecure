import logging
import asyncio
import signal
from pymodbus.server import StartAsyncTcpServer
from pymodbus.device import ModbusDeviceIdentification
from pymodbus.datastore import ModbusSequentialDataBlock, ModbusSlaveContext, ModbusServerContext

# --- ASSIGNMENT CONFIGURATION  ---
# Register 40021 is the "Chlorine concentration setpoint"
# In Pymodbus, address 0 = 40001. So address 20 = 40021.
REGISTER_ADDR = 20 
INITIAL_CHLORINE = 50 

# --- LOGGING SETUP ---
# We need this to prove "Unauthorized Write Access" for the report 
logging.basicConfig()
log = logging.getLogger()
log.setLevel(logging.INFO)

async def run_server():
    # 1. SETUP STORAGE
    # We create a memory block for Holding Registers (hr)
    # This simulates the PLC's internal memory
    block = [0] * 100
    block[REGISTER_ADDR] = INITIAL_CHLORINE # Set initial safe value
    
    store = ModbusSlaveContext(
        hr=ModbusSequentialDataBlock(0, block), # 40001 - 40100
        ir=ModbusSequentialDataBlock(0, [0]*100),
        co=ModbusSequentialDataBlock(0, [0]*100),
        di=ModbusSequentialDataBlock(0, [0]*100)
    )
    context = ModbusServerContext(slaves=store, single=True)

    # 2. IDENTITY CONFIGURATION 
    # "Make it look like plc or an OT device"
    identity = ModbusDeviceIdentification()
    identity.VendorName = 'AquaSecure Industrial'
    identity.ProductCode = 'CL-DOSING-2000' # Chlorine Dosing Controller
    identity.VendorUrl = 'http://aquasecure.local'
    identity.ProductName = 'Disinfection Unit PLC'
    identity.ModelName = 'AS-2025-V1'
    
    # 3. START SERVER
    # Listening on 0.0.0.0 means "Accept connections from ANY IP"
    # This satisfies "No Authentication"
    log.info("[-] OT SYSTEM STARTING: Chlorine Dosing Controller")
    log.info(f"[-] CRITICAL REGISTER: 40021 (Value: {INITIAL_CHLORINE})")
    log.info("[-] WAITING FOR COMMANDS on Port 502...")
    
    # Set up graceful shutdown
    stop_event = asyncio.Event()
    loop = asyncio.get_running_loop()

    def handle_signal():
        log.info("[-] RECEIVED TERMINATION SIGNAL. Shutting down...")
        stop_event.set()

    for sig in (signal.SIGTERM, signal.SIGINT):
        loop.add_signal_handler(sig, handle_signal)

    # Start server in a background task
    server_task = asyncio.create_task(
        StartAsyncTcpServer(
            context=context, 
            identity=identity, 
            address=("0.0.0.0", 502)
        )
    )

    # Wait for the stop event
    await stop_event.wait()

    # Cancel the server task and wait for it to finish
    server_task.cancel()
    try:
        await server_task
    except asyncio.CancelledError:
        pass
    
    log.info("[-] OT SYSTEM SHUTDOWN COMPLETE.")

if __name__ == "__main__":
    try:
        asyncio.run(run_server())
    except KeyboardInterrupt:
        pass