-- Library Management System - MySQL schema & seed data
CREATE DATABASE IF NOT EXISTS library_db;
USE library_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'member') NOT NULL DEFAULT 'member',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  author VARCHAR(150) NOT NULL,
  isbn VARCHAR(20) UNIQUE,
  category VARCHAR(100),
  description TEXT,
  published_year INT,
  total_copies INT NOT NULL DEFAULT 1,
  available_copies INT NOT NULL DEFAULT 1,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS borrows (
  id INT AUTO_INCREMENT PRIMARY KEY,
  book_id INT NOT NULL,
  user_id INT NOT NULL,
  borrow_date DATE NOT NULL DEFAULT (CURRENT_DATE),
  due_date DATE NOT NULL,
  return_date DATE DEFAULT NULL,
  status ENUM('borrowed', 'returned', 'overdue') NOT NULL DEFAULT 'borrowed',
  fine_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  CONSTRAINT fk_borrow_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  CONSTRAINT fk_borrow_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  book_id INT NOT NULL,
  user_id INT NOT NULL,
  username VARCHAR(50) NOT NULL,
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_review_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS book_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  username VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  author VARCHAR(150),
  notes TEXT,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_request_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  sender_username VARCHAR(50) NOT NULL,
  recipient_id INT DEFAULT NULL,
  recipient_username VARCHAR(50) DEFAULT NULL,
  body TEXT NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_message_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  username VARCHAR(50) NOT NULL DEFAULT 'anonymous',
  action VARCHAR(100) NOT NULL,
  details JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Default admin user -> username: admin / password: Admin@123
INSERT INTO users (username, email, password_hash, role)
VALUES ('admin', 'admin@library.local', '$2b$10$L2BPTA1pOcZSnO8hXiv21u5fA8s56HLzQzxMuBPHCjbki..Ks5vbG', 'admin')
ON DUPLICATE KEY UPDATE username = username;

-- Sample books
INSERT INTO books (title, author, isbn, category, description, published_year, total_copies, available_copies) VALUES
('Clean Code', 'Robert C. Martin', '9780132350884', 'Software Engineering', 'A handbook of agile software craftsmanship.', 2008, 5, 5),
('The Pragmatic Programmer', 'Andrew Hunt & David Thomas', '9780201616224', 'Software Engineering', 'From journeyman to master.', 1999, 3, 3),
('Kubernetes Up & Running', 'Kelsey Hightower', '9781492046530', 'DevOps', 'Dive into the future of infrastructure.', 2019, 4, 4),
('Designing Data-Intensive Applications', 'Martin Kleppmann', '9781449373320', 'Databases', 'Big ideas behind reliable, scalable, maintainable systems.', 2017, 2, 2),
('The Phoenix Project', 'Gene Kim', '9780988262591', 'DevOps', 'A novel about IT, DevOps, and helping your business win.', 2013, 3, 3)
ON DUPLICATE KEY UPDATE title = title;
