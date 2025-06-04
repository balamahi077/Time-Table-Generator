"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import BranchSelection from "@/components/BranchSelection"
import SemesterSelection from "@/components/SemesterSelection"
import ExcelUpload from "@/components/ExcelUpload"
import TimetableGenerator from "@/components/TimetableGenerator"
import AdminPanel from "@/components/AdminPanel"

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedBranch, setSelectedBranch] = useState("")
  const [selectedSemester, setSelectedSemester] = useState(0)
  const [selectedSection, setSelectedSection] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)

  const steps = ["welcome", "branch", "semester", "upload", "timetable"]

  if (isAdmin) {
    return <AdminPanel onBack={() => setIsAdmin(false)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Welcome Page */}
        {currentStep === 0 && (
          <Card className="text-center py-16">
            <CardHeader>
              <CardTitle className="text-4xl font-bold text-blue-800 mb-4">Welcome to Time Table Generator</CardTitle>
              <p className="text-lg text-gray-600 mb-8">PROUDHADEVARAYA INSTITUTE OF TECHNOLOGY</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => setCurrentStep(1)} className="px-8 py-3 text-lg" size="lg">
                Get Started
              </Button>
              <div className="mt-4">
                <Button variant="outline" onClick={() => setIsAdmin(true)} className="ml-4">
                  Admin Panel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Branch Selection */}
        {currentStep === 1 && (
          <BranchSelection
            onSelect={(branch) => {
              setSelectedBranch(branch)
              setCurrentStep(2)
            }}
            onBack={() => setCurrentStep(0)}
          />
        )}

        {/* Semester Selection */}
        {currentStep === 2 && (
          <SemesterSelection
            selectedBranch={selectedBranch}
            onSelect={(semester, section) => {
              setSelectedSemester(semester)
              setSelectedSection(section)
              setCurrentStep(3)
            }}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {/* Excel Upload */}
        {currentStep === 3 && (
          <ExcelUpload
            branch={selectedBranch}
            semester={selectedSemester}
            section={selectedSection}
            onComplete={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
          />
        )}

        {/* Timetable Generator */}
        {currentStep === 4 && (
          <TimetableGenerator
            branch={selectedBranch}
            semester={selectedSemester}
            section={selectedSection}
            onBack={() => setCurrentStep(3)}
          />
        )}
      </div>
    </div>
  )
}
