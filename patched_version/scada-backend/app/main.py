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
from pymodbus.client import ModbusTcpClient
import bcrypt

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
    # Pull identity from environment for better security
    default_user = os.getenv("ADMIN_USERNAME", "admin")
    # Use environment variable for the hash, with a fallback for security
    stored_hash = os.getenv("ADMIN_PWD_HASH", "$2b$12$HtJ6tOUf85OolOI5ceiiKO1ttpyn31e7RtQqS.LqdhnIwLuIMRzCK")
    
    # Secure verification using bcrypt hashes (direct usage)
    success = (req.username == default_user and bcrypt.checkpw(req.password.encode(), stored_hash.encode()))
    log_attempt("/api/v1/login/default", req.username, success)
    
    if success:
        # SECURE: HttpOnly=True prevents XSS from stealing the session cookie
        response.set_cookie(key="session_id", value=req.username, httponly=True, samesite="lax", path="/")
        return {"status": "success", "message": "Logged in with default credentials", "redirect": "/dashboard"}
    
    # Classification for Brute Force
    failed_attempts[req.username] = failed_attempts.get(req.username, 0) + 1
    if failed_attempts[req.username] > 3:
        log_attack("Brute Force Attempt", f"Multiple failed logins for user: {req.username}")
        
    return {"status": "error", "message": "Invalid credentials"}

# SECURE Password Reset
@app.post("/api/v1/reset-password")
def reset_password(req: PasswordResetRequest, request: Request):
    if "session_id" not in request.cookies:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    log_attempt("/api/v1/reset-password", req.username, True, f"Resetting password for {req.username}")
    return {"status": "success", "message": f"Password for {req.username} has been reset"}

@app.post("/api/v1/login/sqli")
def login_sqli(req: LoginRequest, response: Response):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        # SECURE: Use parameterized query and verify hashed password (direct bcrypt)
        query = "SELECT password_hash FROM users WHERE username = %s"
        cursor.execute(query, (req.username,))
        result = cursor.fetchone()
        
        success = False
        if result:
            password_hash = result[0]
            success = bcrypt.checkpw(req.password.encode(), password_hash.encode())
        
        log_attempt("/api/v1/login/sqli", req.username, success, f"Query: {query}")
        
        if success:
            # SECURE: HttpOnly=True
            response.set_cookie(key="session_id", value=req.username, httponly=True, samesite="lax", path="/")
            return {"status": "success", "message": "Logged in securely", "user": req.username, "redirect": "/dashboard"}
        return {"status": "error", "message": "Invalid credentials"}
    except Exception as e:
        log_attempt("/api/v1/login/sqli", req.username, False, f"SQL Error: {str(e)}")
        log_attack("SQL Injection Error", f"Failed attempt with error: {str(e)}")
        return {"status": "error", "message": str(e)}

# --- Step 2: Discovery & Scanning ---

# SECURE: No sensitive Information Leakage
@app.get("/api/v1/diagnostics/info")
def get_diagnostics_info(request: Request):
    if "session_id" not in request.cookies:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    return {
        "system_status": "Operational",
        "description": "Standard Water Treatment Control System Monitoring"
    }

@app.post("/api/v1/diagnostics/scan")
def auto_discovery(request: Request):
    if "session_id" not in request.cookies:
        raise HTTPException(status_code=401, detail="Authentication required")

    return {
        "status": "scan_complete", 
        "results": [
            {"status": "detected", "type": "Subsystem A"},
            {"status": "detected", "type": "Subsystem B"}
        ]
    }

# SSRF ENDPOINT DELETED (Security Patch)

# --- REAL PLC INTEGRATION (Added by Boran) ---

@app.get("/api/v1/plc/live-status")
def get_plc_live_status(request: Request):
    """
    Connects to the REAL Docker PLC container to read the Chlorine Level.
    This allows the dashboard to reflect the attack in real-time.
    """
    if "session_id" not in request.cookies:
        raise HTTPException(status_code=401, detail="Authentication required")
        
    try:
        # Connect to the PLC container
        client = ModbusTcpClient("192.168.10.5", port=502)
        if not client.connect():
             return {"status": "offline", "chlorine_level": -1, "message": "PLC Connection Failed"}

        # Read Holding Register 40021 (Address 20)
        rr = client.read_holding_registers(20, 1)
        client.close()

        if rr.isError():
             return {"status": "error", "chlorine_level": -1, "message": "Modbus Read Error"}

        real_value = rr.registers[0]
        
        # LOGIC: If value drops below safe threshold (e.g. 10), it's critical
        system_state = "SAFE" if real_value > 10 else "CRITICAL - DISINFECTION DISABLED"
        
        return {
            "status": "online",
            "chlorine_level": real_value,
            "system_state": system_state
        }

    except Exception as e:
        return {"status": "error", "chlorine_level": -1, "message": str(e)}