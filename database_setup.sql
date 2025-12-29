CREATE DATABASE IF NOT EXISTS tailwatch_db;
USE tailwatch_db;

CREATE TABLE users (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    user_type ENUM('user', 'staff', 'admin') DEFAULT 'user',
    user_role VARCHAR(50),
    location VARCHAR(100),
    profile_image VARCHAR(255),
    points INT(11) DEFAULT 0,
    reports_count INT(11) DEFAULT 0,
    badges TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

CREATE TABLE reports (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    report_id VARCHAR(20) NOT NULL UNIQUE,
    user_id INT(11),
    dog_location VARCHAR(255) NOT NULL,
    dog_status ENUM('healthy', 'sick', 'rabid') NOT NULL,
    description TEXT NOT NULL,
    photo_url VARCHAR(255),
    reporter_contact VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    status ENUM('pending', 'approved', 'rejected', 'in_progress', 'resolved') DEFAULT 'pending',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    assigned_to INT(11),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

INSERT INTO users (first_name, last_name, email, password, user_type, user_role) 
VALUES ('Admin', 'System', 'admin@tailwatch.org', '$2y$10$ABC123', 'admin', 'admin');

INSERT INTO users (first_name, last_name, email, password, user_type, user_role) 
VALUES ('Vet', 'Doctor', 'vet@tailwatch.org', '$2y$10$DEF456', 'staff', 'veterinarian');

INSERT INTO users (first_name, last_name, email, password, user_type, user_role, points, reports_count) 
VALUES ('John', 'Doe', 'john@example.com', '$2y$10$GHI789', 'user', 'volunteer', 150, 10);