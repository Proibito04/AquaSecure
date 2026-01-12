CREATE DATABASE IF NOT EXISTS scada_system;
USE scada_system;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

INSERT INTO users (username, password) VALUES ('admin', 'admin') ON DUPLICATE KEY UPDATE username=username;
INSERT INTO users (username, password) VALUES ('operator', 'password123') ON DUPLICATE KEY UPDATE username=username;
