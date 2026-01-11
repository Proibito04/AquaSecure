# Step 2: Discovery & Scanning - Attack Documentation

This document explains the vulnerabilities implemented in Step 2 and how an attacker can leverage them to map the OT network and identify critical industrial targets.

## 1. Vulnerability Overview

### 2.1 Auto-Discovery (Unauthenticated)
- **Description**: An endpoint allowing network scanning without credentials.
- **Exposure**: Attackers can identify active hosts on the OT network (Port 502/Modbus) without being authenticated.
- **Impact**: Initial reconnaissance of the industrial environment.

### 2.2 Diagnostic Information Leak
- **Description**: The `/api/v1/diagnostics/info` page returns sensitive JSON data.
- **Leaked Data**:
    - **Remote IPs**: `192.168.10.50`, `192.168.10.51`.
    - **PLC IDs**: `PLC_CL01` (Chlorine), `PLC_PUMP02`.
    - **Register Map**: Identifies Register **40021** as the "Chlorine Setpoint".
- **Impact**: Provides the exact "roadmap" for a targeted attack.

### 2.3 Verbose Error Messages
- **Description**: Detailed Modbus exceptions are returned to the user.
- **Example**: `Modbus Exception: ILLEGAL DATA ADDRESS (Unit ID: 1, Function: 3, Range: 40001-40100)`.
- **Impact**: Helps attackers refine their payloads and understand the internal addressing logic of the PLCs.

### 2.4 Blind SSRF (Server-Side Request Forgery)
- **Description**: The `/api/v1/diagnostics/check-host` endpoint allows the server to make requests to internal IPs.
- **Bypass**: A weak blacklist blocks `127.0.0.1`, but can be bypassed using decimal notation (`2130706433`) or other formats.
- **Impact**: Proxying scans into the internal OT subnet that might otherwise be firewalled from the outside.

---

## 2. Attack Scenario: Identifying the Chlorine PLC

### Flow:
1. **recon**: The attacker accesses the **Diagnostics** page and finds the IP `192.168.10.51` associated with `PLC_CL01`.
2. **mapping**: They see that Register **40021** is the Chlorine Setpoint.
3. **verification**: Using the **Network Discovery** page, they confirm the IP `192.168.10.51` is alive and responds to Modbus probes.
4. **exploitation**: The attacker uses the **Host Checker** (SSRF) to probe further or bypass access restrictions to interact with the OT network.

---

## 3. Attack Logs (examples from attacks.json)
All activities are monitored and logged to detect reconnaissance patterns.

```json
[
    {
        "timestamp": "2026-01-11T10:47:05",
        "type": "Information Leak",
        "details": "Unauthenticated access to sensitive diagnostics info",
        "severity": "Medium"
    },
    {
        "timestamp": "2026-01-11T10:47:59",
        "type": "Unauthenticated Scan",
        "details": "Triggered OT network device discovery",
        "severity": "High"
    },
    {
        "timestamp": "2026-01-11T10:48:18",
        "type": "SSRF / Host Discovery",
        "details": "Successful probe of OT PLC at 192.168.10.51",
        "severity": "High"
    }
]
```

---

## 4. Mitigation Recommendations
1. **Enforce RBAC**: Only administrators should access discovery and diagnostic tools.
2. **Sanitize Errors**: Return generic error messages to the frontend.
3. **Strong SSRF Filtering**: Use dedicated libraries to validate IPs and block all private/loopback ranges.
4. **Network Segmentation**: Ensure the web backend cannot reach the OT network without strict firewall rules.
