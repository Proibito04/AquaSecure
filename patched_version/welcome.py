import time
import sys

def print_welcome():
    # Adding a small delay to ensure other logs have started
    time.sleep(2)
    
    cyan = "\033[96m"
    green = "\033[92m"
    yellow = "\033[93m"
    bold = "\033[1m"
    nc = "\033[0m" # No Color

    print(f"\n{cyan}{bold}  --------------------------------------------------{nc}")
    print(f"{cyan}{bold}        AquaSecure SCADA - Vulnerable Version{nc}")
    print(f"{cyan}{bold}  --------------------------------------------------{nc}")
    print(f"\n{green}  ➜  SCADA Web Interface:  {nc}{bold}http://localhost:3000{nc}")
    print(f"{green}  ➜  SCADA Backend API:    {nc}{bold}http://localhost:8000{nc}")
    print(f"{green}  ➜  PLC Simulator:        {nc}{bold}modbus://localhost:502{nc}")
    print(f"\n{yellow}  [!] Note: The system is INTENTIONALLY vulnerable.{nc}")
    print(f"{yellow}      Monitor logs in scada-backend/security.log{nc}")
    print(f"\n{cyan}{bold}  --------------------------------------------------{nc}\n")

if __name__ == "__main__":
    print_welcome()
    # Keep the container running if needed, or just exit
    # For docker-compose, if it exits it's fine as long as logs are visible
    # But to be sure the user sees it at the end of 'up', we can just wait or exit.
    # If we exit, docker-compose might show 'exited with code 0'.
    sys.exit(0)
