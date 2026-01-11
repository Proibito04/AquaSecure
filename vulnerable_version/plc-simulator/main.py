import logging
import asyncio
from pymodbus.server import StartAsyncTcpServer
from pymodbus.device import ModbusDeviceIdentification
from pymodbus.datastore import ModbusSequentialDataBlock, ModbusSlaveContext, ModbusServerContext

# Configure logging
logging.basicConfig()
log = logging.getLogger()
log.setLevel(logging.INFO)

async def run_server():
    # Define a default set of coils, discrete inputs, holding registers, and input registers
    # For a SCADA water treatment system, we can use holding registers for tank levels, etc.
    store = ModbusSlaveContext(
        di=ModbusSequentialDataBlock(0, [0]*100),
        co=ModbusSequentialDataBlock(0, [0]*100),
        hr=ModbusSequentialDataBlock(0, [100]*100), # 100 as default value (e.g., 1.00m level)
        ir=ModbusSequentialDataBlock(0, [0]*100)
    )
    context = ModbusServerContext(slaves=store, single=True)

    # Server identity
    identity = ModbusDeviceIdentification()
    identity.VendorName = 'AquaSecure'
    identity.ProductCode = 'AS-PLC-01'
    identity.VendorUrl = 'http://github.com/AquaSecure'
    identity.ProductName = 'Chlorine Dosing Controller'
    identity.ModelName = 'Vulnerable PLC Simulator'
    identity.MajorMinorRevision = '1.0.0'

    log.info("Starting PLC Simulator (Modbus Server) on 0.0.0.0:502")
    await StartAsyncTcpServer(context=context, identity=identity, address=("0.0.0.0", 502))

if __name__ == "__main__":
    asyncio.run(run_server())
