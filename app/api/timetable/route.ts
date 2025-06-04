import { type NextRequest, NextResponse } from "next/server"
import { createConnection } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const timetableEntry = await request.json();
    const { searchParams } = new URL(request.url);
    const tableName = searchParams.get("tableName");

    if (!tableName) {
      return NextResponse.json({ error: "Table name is required" }, { status: 400 });
    }

    const connection = await createConnection();

    // Create table if not exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`${tableName}\` (
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
    `);

    // Check for lecturer conflicts
    const [conflicts] = await connection.execute(
      "SELECT * FROM lecturer_assignments WHERE lecturer_name = ? AND day = ? AND time_slot = ?",
      [timetableEntry.lecturer_name, timetableEntry.day, timetableEntry.time_slot]
    );

    if (Array.isArray(conflicts) && conflicts.length > 0) {
      const conflict = conflicts[0] as any;
      await connection.end();
      return NextResponse.json(
        {
          error: "Lecturer conflict",
          message: `${timetableEntry.lecturer_name} is already assigned to ${conflict.branch} ${conflict.semester}-${conflict.section} at this time`,
        },
        { status: 409 }
      );
    }

    // Save timetable entry
    await connection.execute(
      `INSERT INTO \`${tableName}\` (branch, semester, section, day, time_slot, subject_name, subject_code, lecturer_name, room_no, is_lab, lab_duration) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE subject_name = VALUES(subject_name), subject_code = VALUES(subject_code), lecturer_name = VALUES(lecturer_name), room_no = VALUES(room_no), is_lab = VALUES(is_lab), lab_duration = VALUES(lab_duration)`,
      [
        timetableEntry.branch,
        timetableEntry.semester,
        timetableEntry.section,
        timetableEntry.day,
        timetableEntry.time_slot,
        timetableEntry.subject_name,
        timetableEntry.subject_code,
        timetableEntry.lecturer_name,
        timetableEntry.room_no,
        timetableEntry.is_lab,
        timetableEntry.lab_duration,
      ]
    );

    // Save lecturer assignment
    await connection.execute(
      "INSERT INTO lecturer_assignments (lecturer_name, day, time_slot, branch, semester, section) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE lecturer_name = VALUES(lecturer_name)",
      [
        timetableEntry.lecturer_name,
        timetableEntry.day,
        timetableEntry.time_slot,
        timetableEntry.branch,
        timetableEntry.semester,
        timetableEntry.section,
      ]
    );

    await connection.end();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving timetable:", error);
    return NextResponse.json({ error: "Failed to save timetable" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branch = searchParams.get("branch");
    const semester = searchParams.get("semester");
    const section = searchParams.get("section");
    const tableName = searchParams.get("tableName");

     if (!tableName) {
      return NextResponse.json({ error: "Table name is required" }, { status: 400 });
    }

    const connection = await createConnection();
    console.log("Database connection:", connection);
    const [rows] = await connection.execute(
      `SELECT * FROM \`${tableName}\``
    );

    await connection.end();
    return NextResponse.json(Array.isArray(rows) ? rows : []);
  } catch (error) {
    console.error("Error fetching timetable:", error);
    console.log("Error object:", error);
    return NextResponse.json({ error: "Failed to fetch timetable" }, { status: 500 });
  }
}
