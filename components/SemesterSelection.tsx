"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SemesterSelectionProps {
  selectedBranch: string
  onSelect: (semester: number, section: string) => void
  onBack: () => void
}

export default function SemesterSelection({ selectedBranch, onSelect, onBack }: SemesterSelectionProps) {
  const [semesterType, setSemesterType] = useState<"odd" | "even" | null>(null)
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null)
  const [section, setSection] = useState("")

  const oddSemesters = [1, 3, 5, 7]
  const evenSemesters = [2, 4, 6, 8]

  const handleContinue = () => {
    if (selectedSemester && section) {
      onSelect(selectedSemester, section)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl text-center">Select Semester & Section</CardTitle>
        <p className="text-center text-gray-600">Department of {selectedBranch}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Semester Type Selection */}
        <div>
          <Label className="text-lg font-medium">Select Semester Type</Label>
          <div className="flex gap-4 mt-2">
            <Button
              variant={semesterType === "odd" ? "default" : "outline"}
              onClick={() => {
                setSemesterType("odd")
                setSelectedSemester(null)
              }}
            >
              Odd Semester
            </Button>
            <Button
              variant={semesterType === "even" ? "default" : "outline"}
              onClick={() => {
                setSemesterType("even")
                setSelectedSemester(null)
              }}
            >
              Even Semester
            </Button>
          </div>
        </div>

        {/* Specific Semester Selection */}
        {semesterType && (
          <div>
            <Label className="text-lg font-medium">Select Specific Semester</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {(semesterType === "odd" ? oddSemesters : evenSemesters).map((sem) => (
                <Button
                  key={sem}
                  variant={selectedSemester === sem ? "default" : "outline"}
                  onClick={() => setSelectedSemester(sem)}
                >
                  {sem}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Section Input */}
        {selectedSemester && (
          <div>
            <Label htmlFor="section" className="text-lg font-medium">
              Enter Section
            </Label>
            <Input
              id="section"
              placeholder="e.g., A, B, C"
              value={section}
              onChange={(e) => setSection(e.target.value.toUpperCase())}
              className="mt-2"
            />
          </div>
        )}
        

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={handleContinue} disabled={!selectedSemester || !section}>
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
