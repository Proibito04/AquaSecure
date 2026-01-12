from pwn import *

def check_plc():
    context.log_level = 'error'
    modbus_host = "localhost"
    reg = 20
    # Modbus TCP Read Holding Registers (FC3)
    packet = p16(0x0002, endian='big') + p16(0x0000, endian='big') + p16(0x0006, endian='big') + p8(0x01) + p8(0x03) + p16(reg, endian='big') + p16(0x0001, endian='big')
    
    try:
        io = remote(modbus_host, 502, timeout=2)
        io.send(packet)
        response = io.recvn(11, timeout=2) # FC3 response with 1 register is 11 bytes
        if response:
            print(f"Response: {response.hex()}")
            if len(response) >= 11 and response[7] == 3:
                value = u16(response[9:11], endian='big')
                print(f"PLC Register 40021 Value: {value}")
            else:
                print(f"Unexpected response format or error code: {response[7] if len(response) > 7 else 'N/A'}")
        io.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_plc()
