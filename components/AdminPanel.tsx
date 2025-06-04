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
    "Computer Science & Engineering",
    "Mechanical Engineering",
    "Electronics & Communication Engineering",
    "Electrical & Electronics Engineering",
    "Civil Engineering",
    "Artificial Intelligence & Machine Learning",
    "Masters in Business Administration",
  ]

  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  const transformTimetableData = (timetables: any[]) => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const timeSlots = ["9:30-10:30", "10:30-11:20", "11:30-12:30", "12:30-1:20", "2:20-3:20", "3:20-4:20", "4:20-5:05"];

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
          const tableName = `${selectedSemester}th_sem_${selectedSection}_section`;
          const url = `/api/timetable?tableName=${tableName}&branch=${selectedBranch}&semester=${selectedSemester}&section=${selectedSection}`;
          const response = await fetch(url);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
            console.error("Not found!!");
          }

          const data = await response.json();
          setAllTimetables(data);
          setTransformedData(transformTimetableData(data));
        } catch (error) {
          console.error("Failed to fetch timetables:", error);
          // Handle error appropriately (e.g., display an error message)
        }
      }
    };

    fetchTimetables();
  }, [selectedBranch, selectedSemester, selectedSection]);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const timeSlots = ["9:30-10:30", "10:30-11:20", "11:30-12:30", "12:30-1:20", "2:20-3:20", "3:20-4:20", "4:20-5:05"];

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
                  <table className="table-auto w-full">
                    <thead>
                      <tr>
                        <th className="px-4 py-2">Day/Time</th>
                        {timeSlots.map((timeSlot) => (
                          <th key={timeSlot} className="px-4 py-2">{timeSlot}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {days.map((day) => (
                        <tr key={day}>
                          <td className="border px-4 py-2">{day}</td>
                          {timeSlots.map((timeSlot) => {
                            const timetable = transformedData[day][timeSlot];
                            return (
                              <td key={timeSlot} className="border px-4 py-2">
                                {timetable ? (
                                  <>
                                    <input
                                      type="text"
                                      value={timetable.subject_name}
                                      className="  py-0.5 w-full"
                                      readOnly={!isEditing}
                                    />
                                    <input
                                      type="text"
                                      value={timetable.lecturer_name}
                                      className="   w-full"
                                      readOnly={!isEditing}
                                    />
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
