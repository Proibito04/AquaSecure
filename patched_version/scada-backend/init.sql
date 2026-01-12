CREATE DATABASE IF NOT EXISTS scada_system;
USE scada_system;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
);

-- Admin: AquaRoot#2026Secure
INSERT INTO users (username, password_hash) VALUES ('admin', '$2b$12$HtJ6tOUf85OolOI5ceiiKO1ttpyn31e7RtQqS.LqdhnIwLuIMRzCK') ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash);
-- Operator: WaterOp-99-Patched!
INSERT INTO users (username, password_hash) VALUES ('operator', '$2b$12$miqCEodB/QIIuaIdY4ZVy.xcFKjKk7xus3c8NK4QdEzBZMUtr7Ofq') ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash);
