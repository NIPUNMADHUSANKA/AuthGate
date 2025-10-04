create database AuthGate;

use AuthGate;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user', -- e.g. 'user', 'admin'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


ALTER TABLE users
ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 0         -- user can log in?
ADD COLUMN email_verified TINYINT(1) NOT NULL DEFAULT 0;
