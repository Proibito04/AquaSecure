# Walkthrough: SQL Injection Fix

I have completed the task of fixing the SQL injection vulnerability in the patched version of the SCADA backend.

## Changes Made

### backend
Updated the `/api/v1/login/sqli` endpoint to use parameterized queries instead of string concatenation. I also removed the ineffective and redundant SQL blacklist logic.

[main.py](file:///home/edoardo/projects/AquaSecure/patched_version/scada-backend/app/main.py#L159-179)

```diff
-SQL_BLACKLIST = [
-    "SELECT", "UNION", "OR", "DROP", "INSERT", "DELETE", "UPDATE", "WHERE", 
-    "FROM", "LIMIT", "OFFSET", "HAVING", "GROUP", "ORDER", "BY", "LIKE", 
-    "CAST", "CONVERT", "EXEC", "SLEEP", "BENCHMARK"
-]
-
-def check_blacklist(input_str: str):
-    upper_input = input_str.upper()
-    for word in SQL_BLACKLIST:
-        if word in upper_input:
-            return True
-    return False
-
 @app.post("/api/v1/login/sqli")
 def login_sqli(req: LoginRequest, response: Response):
-    if check_blacklist(req.username) or check_blacklist(req.password):
-        log_attempt("/api/v1/login/sqli", req.username, False, "Blocked by blacklist")
-        # Middleware already logs this as SQLi Attempt if keywords are found
-        return {"status": "error", "message": "Malicious input detected"}
-
     try:
         conn = get_db_connection()
         cursor = conn.cursor()
-        # VULNERABLE: Direct string concatenation
-        query = f"SELECT * FROM users WHERE username = '{req.username}' AND password = '{req.password}'"
-        cursor.execute(query)
+        # SECURE: Use parameterized query
+        query = "SELECT * FROM users WHERE username = %s AND password = %s"
+        cursor.execute(query, (req.username, req.password))
         user = cursor.fetchone()
```

## Documentation
I've also created a detailed explanation of the patch:
[patch_explanation.md](file:///home/edoardo/.gemini/antigravity/brain/b7ecc775-c52d-40d5-ba1a-62ac1b6f51cd/patch_explanation.md)

## Verification Results
- **Code Review**: Verified that all user-supplied data (`req.username`, `req.password`) is now passed as parameters to the `cursor.execute()` method.
- **Security Check**: Confirmed that the removal of `SQL_BLACKLIST` is safe because parameterized queries provide complete protection against SQL injection by design, rendering blacklists unnecessary for this specific attack vector.