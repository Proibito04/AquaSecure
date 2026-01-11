import mysql.connector
from mysql.connector import Error
import time
import yaml
import os
import logging
import json
from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

app = FastAPI(title="SCADA Backend System")

# Step 1.7: Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup logging for Step 1.6: Monitoring
logging.basicConfig(
    filename='security.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# In-memory store for Brute Force tracking
failed_attempts = {}

# Attack logging to JSON for Step 1.6 & 2.x
ATTACKS_FILE = os.path.join(os.path.dirname(__file__), 'attacks.json')

def log_attack(vulnerability_type: str, details: str, severity: str = "High", ip: str = "Unknown", user_agent: str = "Unknown"):
    attack_entry = {
        "timestamp": datetime.now().isoformat(),
        "type": vulnerability_type,
        "details": details,
        "severity": severity,
        "ip": ip,
        "user_agent": user_agent
    }
    
    attacks = []
    if os.path.exists(ATTACKS_FILE):
        try:
            with open(ATTACKS_FILE, 'r') as f:
                attacks = json.load(f)
        except:
            attacks = []
    
    attacks.append(attack_entry)
    with open(ATTACKS_FILE, 'w') as f:
        json.dump(attacks, f, indent=4)

# Step 3: Monitoring & Attack Classification Middleware
class SecurityMonitoringMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Capture metadata
        ip = request.client.host
        user_agent = request.headers.get("user-agent", "Unknown")
        
        # We need to read the body without consuming it
        body = await request.body()
        payload = body.decode() if body else ""
        
        # Classification for SQL Injection Attempt
        sql_keywords = ["SELECT", "UNION", "OR", "DROP", "--", "INSERT"] # Subset for quick check
        if any(keyword in payload.upper() for keyword in sql_keywords) and "/login" in request.url.path:
            log_attack("SQL Injection Attempt", f"Payload: {payload}", "Critical", ip, user_agent)
        
        # Reset request state so the endpoint can read it again
        async def receive():
            return {"type": "http.request", "body": body}
        
        request._receive = receive
        
        response = await call_next(request)
        return response

app.add_middleware(SecurityMonitoringMiddleware)

def log_attempt(endpoint: str, username: str, success: bool, details: str = ""):
    status = "SUCCESS" if success else "FAILED"
    logging.info(f"Endpoint: {endpoint} | User: {username} | Status: {status} | Details: {details}")

# Load configuration for Step 1.1: Default Credentials
def load_config():
    config_path = os.path.join(os.path.dirname(__file__), "config.yaml")
    with open(config_path, "r") as f:
        return yaml.safe_load(f)

CONFIG = load_config()

class LoginRequest(BaseModel):
    username: str
    password: str

class PasswordResetRequest(BaseModel):
    username: str
    new_password: str

class HostCheckRequest(BaseModel):
    host: str

def get_db_connection():
    """Establishes connection to the MySQL container"""
    while True:
        try:
            connection = mysql.connector.connect(
                host='scada-db', 
                database='scada_system',
                user='operator',
                password='password123'
            )
            if connection.is_connected():
                return connection
        except Error as e:
            print(f"Error connecting to MySQL: {e}. Retrying in 5 seconds...")
            time.sleep(5)

@app.get("/")
def read_root():
    return {"status": "SCADA Backend is running", "network": "OT/Web Dual-Homed"}

# Step 1.1: Default Credentials with Vulnerable Session
@app.post("/api/v1/login/default")
def login_default(req: LoginRequest, response: Response):
    default_user = CONFIG['default_credentials']['username']
    default_pass = CONFIG['default_credentials']['password']
    
    success = (req.username == default_user and req.password == default_pass)
    log_attempt("/api/v1/login/default", req.username, success)
    
    if success:
        # Step 2: Vulnerable Session Management (No flags, predictable, accessible via JS)
        response.set_cookie(key="session_id", value=req.username, httponly=False, samesite="lax", path="/")
        return {"status": "success", "message": "Logged in with default credentials", "redirect": "/dashboard"}
    
    # Classification for Brute Force
    failed_attempts[req.username] = failed_attempts.get(req.username, 0) + 1
    if failed_attempts[req.username] > 3:
        log_attack("Brute Force Attempt", f"Multiple failed logins for user: {req.username}")
        
    return {"status": "error", "message": "Invalid credentials"}

# Step 1.2 & 1.3: Insecure Password Reset (Brute-forceable)
@app.post("/api/v1/reset-password")
def reset_password(req: PasswordResetRequest):
    log_attempt("/api/v1/reset-password", req.username, True, f"Resetting password for {req.username}")
    return {"status": "success", "message": f"Password for {req.username} has been reset"}

# Step 1.4: SQL Injection with Blacklist and Vulnerable Session
SQL_BLACKLIST = [
    "SELECT", "UNION", "OR", "DROP", "INSERT", "DELETE", "UPDATE", "WHERE", 
    "FROM", "LIMIT", "OFFSET", "HAVING", "GROUP", "ORDER", "BY", "LIKE", 
    "CAST", "CONVERT", "EXEC", "SLEEP", "BENCHMARK"
]

def check_blacklist(input_str: str):
    upper_input = input_str.upper()
    for word in SQL_BLACKLIST:
        if word in upper_input:
            return True
    return False

@app.post("/api/v1/login/sqli")
def login_sqli(req: LoginRequest, response: Response):
    if check_blacklist(req.username) or check_blacklist(req.password):
        log_attempt("/api/v1/login/sqli", req.username, False, "Blocked by blacklist")
        # Middleware already logs this as SQLi Attempt if keywords are found
        return {"status": "error", "message": "Malicious input detected"}

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        # VULNERABLE: Direct string concatenation
        query = f"SELECT * FROM users WHERE username = '{req.username}' AND password = '{req.password}'"
        cursor.execute(query)
        user = cursor.fetchone()
        
        success = user is not None
        log_attempt("/api/v1/login/sqli", req.username, success, f"Query: {query}")
        
        if success:
            response.set_cookie(key="session_id", value=req.username, httponly=False, samesite="lax", path="/")
            return {"status": "success", "message": "Logged in via SQLi", "user": user, "redirect": "/dashboard"}
        return {"status": "error", "message": "Invalid credentials"}
    except Exception as e:
        log_attempt("/api/v1/login/sqli", req.username, False, f"SQL Error: {str(e)}")
        log_attack("SQL Injection Error", f"Failed attempt with error: {str(e)}")
        return {"status": "error", "message": str(e)}

# --- Step 2: Discovery & Scanning ---

@app.get("/api/v1/diagnostics/info")
def get_diagnostics_info(request: Request):
    if "session_id" not in request.cookies:
        log_attack("Unauthorized Access Attempt", "Accessing diagnostics without session", "Medium")
        raise HTTPException(status_code=401, detail="Authentication required to access internal diagnostics")
    
    info = {
        "system_status": "Operational",
        "ot_network_config": {
            "remote_ips": ["192.168.10.50", "192.168.10.51", "10.0.0.12"],
            "plc_ids": ["PLC_CL01", "PLC_PUMP02"],
            "register_map": {
                "40021": "Chlorine Setpoint",
                "40022": "Flow Rate",
                "40023": "Pressure"
            },
            "supported_function_codes": [1, 2, 3, 4, 5, 6, 15, 16]
        },
        "internal_debug": {
            "gateway": "192.168.10.1",
            "subnet": "255.255.255.0"
        }
    }
    log_attack("Information Leak", "Access to sensitive diagnostics info", "Medium")
    return info

@app.post("/api/v1/diagnostics/scan")
def auto_discovery(request: Request):
    if "session_id" not in request.cookies:
        log_attack("Unauthorized Discovery Attempt", "Triggered OT discovery without session", "High")
        raise HTTPException(status_code=401, detail="Authentication required for network discovery")

    devices = [
        {"ip": "192.168.10.50", "port": 502, "status": "detected", "type": "Schneider Electric PLC"},
        {"ip": "192.168.10.51", "port": 502, "status": "detected", "type": "Siemens S7-1200 (Simulated)"},
        {"ip": "10.0.0.12", "port": 502, "status": "timeout", "type": "Unknown"}
    ]
    log_attack("Internal Scan", "Triggered OT network device discovery")
    return {"status": "scan_complete", "results": devices}

@app.post("/api/v1/diagnostics/check-host")
def check_host(req: HostCheckRequest, request: Request):
    if "session_id" not in request.cookies:
        log_attack("Unauthorized SSRF Attempt", "Attempted SSRF probe without session", "High")
        raise HTTPException(status_code=401, detail="Authentication required for host diagnostic tools")

    SSRF_BLACKLIST = ["127.0.0.1", "localhost", "0.0.0.0"]
    if req.host in SSRF_BLACKLIST:
        log_attack("SSRF Blocked", f"Blocked attempt to access {req.host}")
        raise HTTPException(status_code=403, detail="Forbidden: Host is in blacklist")
    
    if req.host == "192.168.10.50":
        detail = "Modbus Exception: ILLEGAL DATA ADDRESS (Unit ID: 1, Function: 3, Range: 40001-40100)"
        log_attack("SSRF / Information Gathering", f"Probed host {req.host} - Received verbose error")
        return {"status": "error", "detail": detail}
    
    if req.host == "192.168.10.51":
        log_attack("SSRF / Host Discovery", f"Successful probe of OT PLC at {req.host}", "High")
        return {"status": "up", "detail": "Connection established on port 502. Device identified as PLC-MODBUS-CHLORINE."}
    
    return {"status": "down", "detail": f"Connection to {req.host} timed out after 5000ms"}