"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AdminPanelProps {
  onBack: () => void
  branch?: string;
  semester?: string;
}

export default function AdminPanel({ onBack, branch, semester }: AdminPanelProps) {
  const [allTimetables, setAllTimetables] = useState<any[]>([])
  const [selectedBranch, setSelectedBranch] = useState(branch || "");
  const [selectedSemester, setSelectedSemester] = useState(semester || "");
  const [selectedSection, setSelectedSection] = useState("");
  const [transformedData, setTransformedData] = useState<{ [day: string]: { [timeSlot: string]: any } }>({});
  const [isEditing, setIsEditing] = useState(false);

  const branches = [
    "Computer Science and Engineering",
    "Mechanical Engineering",
    "Electronics and Communication Engineering",
    "Electrical and Electronics Engineering",
    "Civil Engineering",
    "Artificial Intelligence and Machine Learning",
    "Masters in Business Administration",
  ]

  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  const transformTimetableData = (timetables: any[]) => {
   const timeSlots = [
  "9:30-10:30",
  "10:30-11:20",
  "Break",
  "11:30-12:30",
  "12:30-1:20",
  "Lunch Break",
  "2:20-3:20",
  "3:20-4:20",
  "4:20-5:05",
];
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const transformedData: { [day: string]: { [timeSlot: string]: any } } = {};

    days.forEach((day) => {
      transformedData[day] = {};
      timeSlots.forEach((timeSlot) => {
        transformedData[day][timeSlot] = null;
      });
    });

    timetables.forEach((timetable) => {
      transformedData[timetable.day][timetable.time_slot] = timetable;
    });

    return transformedData;
  };

          useEffect(() => {
  const fetchTimetables = async () => {
    if (selectedBranch && selectedSemester && selectedSection) {
      try {
        const tableName = `${selectedBranch}_${selectedSemester}th_sem_${selectedSection.toLowerCase()}_section`;
        const url = `/api/timetable?tableName=${tableName}&branch=${selectedBranch}&semester=${selectedSemester}&section=${selectedSection}`;
        
        const response = await fetch(url);

        if (!response.ok) {
          const errorMessage = await response.text();
          console.warn(`Timetable fetch failed: ${response.status} - ${errorMessage}`);
          setAllTimetables([]);
          setTransformedData({});
          return;
        }

        const data = await response.json();
        setAllTimetables(data);
        setTransformedData(transformTimetableData(data));
      } catch (error) {
        console.error("Error while fetching timetables:", error);
        setAllTimetables([]);
        setTransformedData({});
      }
    }
  };

  fetchTimetables();
}, [selectedBranch, selectedSemester, selectedSection]);


 const timeSlots = [
  "9:30-10:30",
  "10:30-11:20",
  "Break",
  "11:30-12:30",
  "12:30-1:20",
  "Lunch Break",
  "2:20-3:20",
  "3:20-4:20",
  "4:20-5:05",
];
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Admin Panel</CardTitle>
          <p className="text-center text-gray-600">View All Semester Timetables</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Branch</label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch} value={branch}>
                      {branch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Select Semester</label>
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((sem) => (
                    <SelectItem key={sem} value={sem.toString()}>
                      Semester {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Select Section</label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose section" />
                </SelectTrigger>
                <SelectContent>
                  {["A", "B", "C"].map((section) => (
                    <SelectItem key={section} value={section}>
                      {section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <button type="reset">Reset</button>
            </div>
          </div>

          {selectedBranch && selectedSemester && selectedSection && (
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">
                Timetables for {selectedBranch} - Semester {selectedSemester} - Section {selectedSection}
              </h3>
              {allTimetables.length > 0 ? (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse border border-gray-300">
      <thead>
        <tr>
          <th className="border border-gray-300 p-2 bg-gray-100">Day/Time</th>
          {timeSlots.map((slot) => (
            <th key={slot} className="border border-gray-300 p-2 bg-gray-100 text-xs">
              {slot}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {days.map((day) => (
          <tr key={day}>
            <td className="border border-gray-300 p-2 font-medium bg-gray-50">{day}</td>
            {timeSlots.map((timeSlot, i) => {
              const entry = allTimetables.find(
                (t) => t.day === day && t.time_slot === timeSlot
              );
              const isBreak = timeSlot === "Break" || timeSlot === "Lunch Break";

              // Skip rendering if it's a continuation of a lab block
              if (entry?.is_lab) {
                const prevSlot = timeSlots[i - 1];
                const prevEntry = allTimetables.find(
                  (t) => t.day === day && t.time_slot === prevSlot
                );
                if (
                  prevEntry &&
                  prevEntry.is_lab &&
                  prevEntry.subject_code === entry.subject_code &&
                  prevEntry.lecturer_name === entry.lecturer_name
                ) {
                  return null;
                }
              }

              // Calculate colSpan for labs
              let colSpan = 1;
              if (entry?.is_lab) {
                for (let j = 1; j <= 3 && i + j < timeSlots.length; j++) {
                  const nextSlot = timeSlots[i + j];
                  const nextEntry = allTimetables.find(
                    (t) => t.day === day && t.time_slot === nextSlot
                  );
                  if (
                    nextEntry &&
                    nextEntry.is_lab &&
                    nextEntry.subject_code === entry.subject_code &&
                    nextEntry.lecturer_name === entry.lecturer_name
                  ) {
                    colSpan++;
                  } else {
                    break;
                  }
                }
              }

              return (
                <td
                  key={`${day}-${timeSlot}`}
                  colSpan={colSpan}
                  className={`border border-gray-300 p-2 text-xs ${
                    isBreak ? "bg-gray-200 text-center font-medium" : ""
                  }`}
                >
                  {isBreak ? (
                    <div className="transform -rotate-90 text-xs">{timeSlot}</div>
                  ) : entry ? (
                    <>
                      <div className="font-medium">{entry.subject_name}</div>
                      <div className="text-gray-600">{entry.lecturer_name}</div>
                      {entry.is_lab && <div className="text-blue-600">LAB</div>}
                    </>
                  ) : (
                    "-"
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  </div>


              ) : (
                <p>No timetables found.</p>
              )}
              <Button onClick={() => window.print()}>Print Timetable</Button>
             
             
            </div>
          )}
          {/* Display error message if fetching fails */}
          {allTimetables.length === 0 && selectedBranch && selectedSemester && selectedSection && (
            <p className="text-red-500">Failed to load timetables.</p>
          )}

          <div className="flex justify-center">
            <Button onClick={onBack} variant="outline">
              Back to Main
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}











