import { type NextRequest, NextResponse } from "next/server"
import { createConnection } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    console.log("Starting to save lecturers");
    let lecturers;
    try {
      lecturers = await request.json();
      console.log("Lecturers data:", lecturers);
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return NextResponse.json({ error: "Failed to parse request body" }, { status: 400 });
    }
    const connection = await createConnection();
    console.log("Database connection established");

    for (const lecturer of lecturers) {
      console.log("Processing lecturer:", lecturer);
      try {
        const roomNo = lecturer.room_no === undefined ? null : lecturer.room_no;
        await connection.execute(
          "INSERT INTO lecturers (name, subject_name, subject_code, room_no, branch, semester, section) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [
            lecturer.name,
            lecturer.subject_name,
            lecturer.subject_code,
            roomNo,
            lecturer.branch,
            lecturer.semester,
            lecturer.section,
          ],
        );
        console.log("Lecturer saved successfully");
      } catch (dbError) {
        console.error("Error saving lecturer:", lecturer, dbError);
        return NextResponse.json({ error: "Failed to save lecturer" }, { status: 500 });
      }
    }

    await connection.end();
    console.log("Database connection closed");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving lecturers:", error);
    console.error("Error details:", error);
    return NextResponse.json({ error: "Failed to save lecturers" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const branch = searchParams.get("branch")
    const semester = searchParams.get("semester")
    const section = searchParams.get("section")

    const connection = await createConnection()
    const [rows] = await connection.execute(
      "SELECT * FROM lecturers WHERE branch = ? AND semester = ? AND section = ?",
      [branch, semester, section],
    )

    await connection.end()
    return NextResponse.json(rows)
  } catch (error) {
    console.error("Error fetching lecturers:", error)
    return NextResponse.json({ error: "Failed to fetch lecturers" }, { status: 500 })
  }
}
