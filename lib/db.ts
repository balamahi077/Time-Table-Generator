import mysql from "mysql2/promise"

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "", // Replace with your MySQL password
  database: "timetable_db",
}

export async function createConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log("Database connection established successfully");
    return connection;
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
}

// Database initialization script
export async function initializeDatabase() {
  const connection = await createConnection()

  // Create database if not exists
  await connection.execute(`CREATE DATABASE IF NOT EXISTS timetable_db`)
  await connection.execute(`USE timetable_db`)

  // Create tables
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS lecturers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      subject_name VARCHAR(255) NOT NULL,
      subject_code VARCHAR(50) NOT NULL,
      room_no VARCHAR(50),
      branch VARCHAR(255),
      semester INT,
      section VARCHAR(10),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS timetables (
      id INT AUTO_INCREMENT PRIMARY KEY,
      branch VARCHAR(255) NOT NULL,
      semester INT NOT NULL,
      section VARCHAR(10) NOT NULL,
      day VARCHAR(20) NOT NULL,
      time_slot VARCHAR(50) NOT NULL,
      subject_name VARCHAR(255),
      subject_code VARCHAR(50),
      lecturer_name VARCHAR(255),
      room_no VARCHAR(50),
      is_lab BOOLEAN DEFAULT FALSE,
      lab_duration INT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS lecturer_assignments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      lecturer_name VARCHAR(255) NOT NULL,
      day VARCHAR(20) NOT NULL,
      time_slot VARCHAR(50) NOT NULL,
      branch VARCHAR(255) NOT NULL,
      semester INT NOT NULL,
      section VARCHAR(10) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await connection.end()
}
