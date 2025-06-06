"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Printer, Save } from "lucide-react";
import type { Lecturer, TimetableEntry } from "@/types";

interface TimetableGeneratorProps {
  branch: string;
  semester: number;
  section: string;
  onBack: () => void;
}

export default function TimetableGenerator({
  branch,
  semester,
  section,
  onBack,
}: TimetableGeneratorProps) {
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [selectedCell, setSelectedCell] = useState<
    { day: string; timeSlot: string } | null
  >(null);
  const [selectedLecturer, setSelectedLecturer] = useState<string>("");
  const [isLab, setIsLab] = useState(false);
  const [labDuration, setLabDuration] = useState(1);
  const [combinedHours, setCombinedHours] = useState(1);
  const [roomNo, setRoomNo] = useState("");
  const [collegeHeader, setCollegeHeader] = useState(
    "PROUDHADEVARAYA INSTITUTE OF TECHNOLOGY"
  );
  const [alert, setAlert] = useState<
    { type: "success" | "error"; message: string } | null
  >(null);
  const [combinedHoursValue, setCombinedHoursValue] = useState(1);
  const [rowSpanValue, setRowSpanValue] = useState(1);
  const [hiddenSlots, setHiddenSlots] = useState<string[]>([]);

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

  const [localTimeSlots, setLocalTimeSlots] = useState([...timeSlots]);

  useEffect(() => {
    fetchLecturers()
    fetchTimetable()
  }, [])

  const fetchLecturers = async () => {
    try {
      const response = await fetch(
        `/api/lecturers?branch=${encodeURIComponent(branch)}&semester=${semester}&section=${section}`,
      )
      const data = await response.json()
      setLecturers(data)
    } catch (error) {
      console.error("Error fetching lecturers:", error)
    }
  }

  const fetchTimetable = async () => {
    try {
      const tableName = `${branch}_${semester}th_sem_${section.toLowerCase()}_section`;
      const response = await fetch(
        `/api/timetable?branch=${encodeURIComponent(branch)}&semester=${semester}&section=${section}&tableName=${tableName}`,
      );
      const data = await response.json();
      console.log("Timetable data:", data);
      setTimetable(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching timetable:", error);
    }
  };

  const handleCellClick = (day: string, timeSlot: string) => {
    if (timeSlot === "Break" || timeSlot === "Lunch Break") return
    setSelectedCell({ day, timeSlot })
    setSelectedLecturer("")
    setIsLab(false)
    setLabDuration(1)

    // Get room number from existing entry or first lecturer
    const existingEntry = timetable.find((t) => t.day === day && t.time_slot === timeSlot)
    if (existingEntry) {
      setRoomNo(existingEntry.room_no || "")
    } else if (lecturers.length > 0) {
      setRoomNo(lecturers[0].room_no || "")
    }
  }

  const handleSaveEntry = async () => {
    if (!selectedCell || !selectedLecturer) return;

    const lecturer = lecturers.find((l) => l.name === selectedLecturer);
    if (!lecturer) return;

    try {
      const tableName = `${branch}_${semester}th_sem_${section.toLowerCase()}_section`;

      // Prepare entries for all combined hours
      const entries: TimetableEntry[] = [];
      for (let i = 0; i < combinedHours; i++) {
        const currentTimeSlotIndex = timeSlots.indexOf(selectedCell.timeSlot);
        const nextTimeSlot = timeSlots[currentTimeSlotIndex + i];

        if (!nextTimeSlot || nextTimeSlot === "Break" || nextTimeSlot === "Lunch Break") {
          setAlert({ type: "error", message: "Cannot combine hours across breaks or end of timetable." });
          setTimeout(() => setAlert(null), 3000);
          return;
        }

        const entry: TimetableEntry = {
          branch,
          semester,
          section,
          day: selectedCell.day,
          time_slot: nextTimeSlot,
          subject_name: lecturer.subject_name,
          subject_code: lecturer.subject_code,
          lecturer_name: lecturer.name,
          room_no: roomNo,
          is_lab: isLab,
          lab_duration: isLab ? labDuration : 1,
          lecturer: undefined
        };
        entries.push(entry);
      }

      // Save entries to the database
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const response = await fetch(`/api/timetable?tableName=${tableName}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(entry),
        });

        const result = await response.json();

        if (!response.ok) {
          setAlert({ type: "error", message: result.message || "Failed to save entry" });
          setTimeout(() => setAlert(null), 3000);
          return;
        }
      }

      setAlert({ type: "success", message: "Entries saved successfully!" });
      await fetchTimetable();
      
      setSelectedCell(null);
    } catch (error) {
      setAlert({ type: "error", message: "Failed to save entries" });
    }

    setTimeout(() => setAlert(null), 3000);

   // Update timetable state with hidden property
    if (isLab && combinedHours > 1) {
      setTimetable((prevTimetable) => {
        const updatedTimetable = prevTimetable.map((entry) => {
          if (entry.day === selectedCell.day &&
            timeSlots.indexOf(entry.time_slot) > timeSlots.indexOf(selectedCell.timeSlot) &&
            timeSlots.indexOf(entry.time_slot) < timeSlots.indexOf(selectedCell.timeSlot) + combinedHours) {
            return { ...entry, hidden: true };
          } else {
            return entry;
          }
        }).filter(entry => !(entry.hidden));
        return updatedTimetable;
      });
    }
  };

 const getTimetableEntry = (day: string, timeSlot: string) => {
    if (!Array.isArray(timetable)) {
      console.error("timetable is not an array:");
      return undefined;
    }
    return timetable.find((t) => t?.day === day && t?.time_slot === timeSlot);
  };

  const handlePrint = () => {
    window.print()
  }

  const handleSaveTimetable = () => {
    if (confirm("Are you sure you want to save this timetable?")) {
      setAlert({ type: "success", message: "Timetable saved successfully!" })
      setTimeout(() => setAlert(null), 3000)
    }
  }

  const subjects = [...new Set(lecturers.map((l) => ({ name: l.subject_name, code: l.subject_code })))]
  const labs = subjects.filter((s) => s.name.toLowerCase().includes("lab"));

  useEffect(() => {
    setLocalTimeSlots([...timeSlots]); // Reset timeSlots when component mounts/updates
  }, [branch, semester, section]);

  return (
    <div className="space-y-6">
      {alert && (
        <Alert className={alert.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <AlertDescription className={alert.type === "success" ? "text-green-800" : "text-red-800"}>
            {alert.message}
          </AlertDescription>
        </Alert>
      )}

      <Card className="print:shadow-none">
        <CardHeader className="text-center space-y-2 print:pb-4">
          <Input
            value={collegeHeader}
            onChange={(e) => setCollegeHeader(e.target.value)}
            className="text-center text-xl font-bold border-none text-blue-800 print:text-black"
          />
          <h2 className="text-lg font-semibold">Department of {branch}</h2>
          <div className="flex justify-between items-center text-sm">
            <span>Semester: {semester} | Section: {section}</span>
           
            <span>Room No: {lecturers[0]?.room_no || "N/A"}</span>
            <span>Date: {new Date().toLocaleDateString()}</span>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2 bg-gray-100">Day/Time</th>
                  {localTimeSlots.map((slot) => (
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
      {localTimeSlots.map((timeSlot, timeSlotIndex) => {
        const entry = getTimetableEntry(day, timeSlot);
        const isBreak = timeSlot === "Break" || timeSlot === "Lunch Break";

        // Skip rendering cells that are hidden as part of a combined lab
        if (entry?.hidden) {
          return null;
        }

        let colSpan = 1;
        let content = null;

        if (entry && entry.is_lab) {
          const startIndex = localTimeSlots.indexOf(timeSlot);

          // Only span if it's the first slot of the lab block
          const previousSlot = localTimeSlots[startIndex - 1];
          const previousEntry = previousSlot ? getTimetableEntry(day, previousSlot) : null;
          const isFirstLabSlot = !previousEntry || previousEntry.subject_code !== entry.subject_code || !previousEntry.is_lab;

          if (isFirstLabSlot) {
            let span = 1;
            for (let i = 1; i < 4 && startIndex + i < localTimeSlots.length; i++) {
              const nextSlot = localTimeSlots[startIndex + i];
              const nextEntry = getTimetableEntry(day, nextSlot);
              if (
                nextEntry &&
                nextEntry.is_lab &&
                nextEntry.subject_code === entry.subject_code &&
                nextEntry.lecturer_name === entry.lecturer_name
              ) {
                span++;
              } else {
                break;
              }
            }
            colSpan = span;
          } else {
            return null;
          }
        }

        if (isBreak) {
          content = <div className="transform -rotate-90 text-xs">{timeSlot}</div>;
        } else if (entry) {
          content = (
            <div className="text-xs">
              <div className="font-medium">{entry.subject_name}</div>
              <div className="text-gray-600">{entry.lecturer?.name}</div>
              {entry.is_lab && <div className="text-blue-600">LAB</div>}
            </div>
          );
        } else {
          content = <div className="text-gray-400 text-xs">Click to add</div>;
        }

        return (
          <td
            key={`${day}-${timeSlot}`}
            className={`border border-gray-300 p-2 h-16 cursor-pointer hover:bg-gray-50 ${
              isBreak ? "bg-gray-200 text-center font-medium" : ""
            }`}
            onClick={() => !isBreak && handleCellClick(day, timeSlot)}
            colSpan={colSpan}
          >
            {content}
          </td>
        );
      })}
    </tr>
  ))}
</tbody>
            </table>
          </div>

          <div className="flex gap-4 mt-6 print:hidden">
            <Button onClick={handleSaveTimetable} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Timetable
            </Button>
            <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button onClick={onBack} variant="outline">
              Back
            </Button>
            <Button onClick={fetchTimetable} variant="outline">
            🔄 Refresh
            </Button>


          </div>
        </CardContent>
      </Card>

      {/* Subject Assignment Dialog */}
      <Dialog open={!!selectedCell} onOpenChange={() => setSelectedCell(null)}>
        <DialogContent>

          {alert && (
        <Alert className={alert.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <AlertDescription className={alert.type === "success" ? "text-green-800" : "text-red-800"}>
            {alert.message}
          </AlertDescription>
        </Alert>
      )}

          <DialogHeader>
            <DialogTitle>Assign Subject</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Lecturer & Subject</Label>
              <Select value={selectedLecturer} onValueChange={setSelectedLecturer}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose lecturer and subject" />
                </SelectTrigger>
                <SelectContent>
                  {lecturers.map((lecturer) => (
                    <SelectItem key={lecturer.id} value={lecturer.name}>
                      {lecturer.name} - {lecturer.subject_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

          
            <div className="flex items-center space-x-2">
              <Checkbox id="lab" checked={isLab} onCheckedChange={(checked) => setIsLab(checked as boolean)} />
              <Label htmlFor="lab">Lab Session</Label>
            </div>

            {isLab && (
              <div>
                <Label htmlFor="duration">Lab Duration (hours)</Label>
                <Select
                  value={labDuration.toString()}
                  onValueChange={(value) => setLabDuration(Number.parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Hour</SelectItem>
                    <SelectItem value="2">2 Hours</SelectItem>
                    <SelectItem value="3">3 Hours</SelectItem>
                  </SelectContent>
                </Select>
                 <Label htmlFor="combined">Combine Hours</Label>
                <Select
                  value={combinedHours.toString()}
                  onValueChange={(value) => setCombinedHours(Number.parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Hour</SelectItem>
                    <SelectItem value="2">2 Hours</SelectItem>
                    <SelectItem value="3">3 Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
            )}

            <Button onClick={handleSaveEntry} className="w-full">
              Save Entry
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Subject Details */}
      <Card className="print:shadow-none">
        <CardHeader>
          <CardTitle>Subject Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects
              .filter((s) => !s.name.toLowerCase().includes("lab"))
              .map((subject, index) => {
                const lecturer = lecturers.find((l) => l.subject_name === subject.name)
                return (
                  <div key={index} className="border rounded p-3">
                    <div className="font-medium">{subject.name}</div>
                    <div className="text-sm text-gray-600">Code: {subject.code}</div>
                    <div className="text-sm text-gray-600">Lecturer: {lecturer?.name}</div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

      {/* Lab Details */}
      {labs.length > 0 && (
        <Card className="print:shadow-none">
          <CardHeader>
            <CardTitle>Lab Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {labs.map((lab, index) => {
                const lecturer = lecturers.find((l) => l.subject_name === lab.name)
                return (
                  <div key={index} className="border rounded p-3">
                    <div className="font-medium">{lab.name}</div>
                    <div className="text-sm text-gray-600">Code: {lab.code}</div>
                    <div className="text-sm text-gray-600">Lecturer: {lecturer?.name}</div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
