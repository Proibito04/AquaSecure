# AquaSecure - SEC 537 Project 1
**Topic:** Honeypot for Unauthorized Write Access to PLC (Modbus FC6/FC16)  
**Students:** Boran & Edoardo  

## 📌 Project Overview
This project simulates a Water Treatment SCADA system vulnerable to **Unauthorized Modbus Write Access**. It demonstrates how an attacker can chain Web vulnerabilities (SQL Injection, SSRF) to discover an OT network and physically manipulate a Chlorine Dosing Controller (PLC), disabling the disinfection process.

## 🏗 Architecture
The system is deployed using Docker Compose with network isolation between the SCADA Web Interface and the OT components.

| Component | Port | Description | Vulnerabilities |
|:---|:---|:---|:---|
| **SCADA Frontend** | `80` | React Dashboard for Operators | Hardcoded Secrets, Insecure Session |
| **SCADA Backend** | `8000` | FastAPI Server | **SQL Injection**, **SSRF**, **Insecure Auth** |
| **PLC Simulator** | `502` | Python (Pymodbus) | **Unauthorized FC6 Writes**, **No Auth** |

---

## 🚀 Deployment Instructions

### 1. Prerequisites
* Docker & Docker Compose
* Python 3.x (for running the attack script)

### 2. Deploy the Vulnerable Version
To start the vulnerable environment:
```bash
cd vulnerable_version
docker-compose up --build -d