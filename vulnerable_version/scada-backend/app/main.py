import mysql.connector
from mysql.connector import Error
import time
import yaml
import os
import logging
from pydantic import BaseModel
from typing import Optional
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

@app.get("/db-status")
def check_db():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT DATABASE();")
        db_name = cursor.fetchone()
        return {"database_connected": True, "db_name": db_name[0]}
    except Exception as e:
        return {"database_connected": False, "error": str(e)}

# Step 1.1: Default Credentials
@app.post("/api/v1/login/default")
def login_default(req: LoginRequest):
    default_user = CONFIG['default_credentials']['username']
    default_pass = CONFIG['default_credentials']['password']
    
    success = (req.username == default_user and req.password == default_pass)
    log_attempt("/api/v1/login/default", req.username, success)
    
    if success:
        return {"status": "success", "message": "Logged in with default credentials"}
    return {"status": "error", "message": "Invalid credentials"}

# Step 1.2 & 1.3: Insecure Password Reset (Brute-forceable) & Lack of Lockout
@app.post("/api/v1/reset-password")
def reset_password(req: PasswordResetRequest):
    log_attempt("/api/v1/reset-password", req.username, True, f"Resetting password for {req.username}")
    return {"status": "success", "message": f"Password for {req.username} has been reset"}

# Step 1.4: SQL Injection with Blacklist
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
def login_sqli(req: LoginRequest):
    if check_blacklist(req.username) or check_blacklist(req.password):
        log_attempt("/api/v1/login/sqli", req.username, False, "Blocked by blacklist")
        return {"status": "error", "message": "Malicious input detected"}

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = f"SELECT * FROM users WHERE username = '{req.username}' AND password = '{req.password}'"
        cursor.execute(query)
        user = cursor.fetchone()
        
        success = user is not None
        log_attempt("/api/v1/login/sqli", req.username, success, f"Query: {query}")
        
        if success:
            return {"status": "success", "message": "Logged in via SQLi", "user": user}
        return {"status": "error", "message": "Invalid credentials"}
    except Exception as e:
        log_attempt("/api/v1/login/sqli", req.username, False, f"SQL Error: {str(e)}")
        return {"status": "error", "message": str(e)}