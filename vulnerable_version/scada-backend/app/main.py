# scada-backend/app/main.py
from fastapi import FastAPI
import mysql.connector
from mysql.connector import Error
import time

app = FastAPI(title="SCADA Backend System")

def get_db_connection():
    """Establishes connection to the MySQL container"""
    while True:
        try:
            connection = mysql.connector.connect(
                host='scada-db', # Service name in docker-compose
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