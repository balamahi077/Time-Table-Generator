"use client"

import type React from "react"
import * as XLSX from 'xlsx';

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileSpreadsheet } from "lucide-react"

interface ExcelUploadProps {
  branch: string
  semester: number
  section: string
  onComplete: () => void
  onBack: () => void
}

export default function ExcelUpload({ branch, semester, section, onComplete, onBack }: ExcelUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setUploadStatus("idle")
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true);
    try {
      if (!file) {
        throw new Error("No file selected");
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

        // Map the jsonData to the desired format
        const lecturers = jsonData.map((row: any) => ({
          name: row["Lecturer Name"],
          subject_name: row["Subject Name"],
          subject_code: row["Subject Code"],
          room_no: row["Room No"] || "",
          branch,
          semester,
          section,
        }));

        fetch("/api/lecturers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(lecturers),
        })

          .then(response => {
            if (response.ok) {
              setUploadStatus("success");
            } else {
              setUploadStatus("error");
            }
          })
          .catch(error => {
            console.error("Upload error:", error);
            setUploadStatus("error");
          })
          .finally(() => {
            setUploading(false);
          });
      };
      reader.readAsArrayBuffer(file);
    } catch (error: any) {
      console.error("File reading/parsing error:", error);
      setUploadStatus("error");
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl text-center">Upload Lecturer Data</CardTitle>
        <p className="text-center text-gray-600">
          Department of {branch} - Semester {semester} - Section {section}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="space-y-2">
            <Label htmlFor="excel-file" className="text-lg font-medium cursor-pointer">
              Upload Excel File
            </Label>
            <p className="text-sm text-gray-500">
              Excel file should contain: Lecturer Name, Subject Name, Subject Code.
            </p>
            <Input id="excel-file" type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} className="mt-2" />
          </div>
        </div>

        {file && (
          <Alert>
            <Upload className="h-4 w-4" />
            <AlertDescription>Selected file: {file.name}</AlertDescription>
          </Alert>
        )}

        {uploadStatus === "success" && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">Lecturer data uploaded successfully!</AlertDescription>
          </Alert>
        )}

        {uploadStatus === "error" && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              Failed to upload lecturer data. Please try again.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <Button onClick={handleUpload} disabled={!file || uploading} className="w-full">
            {uploading ? "Uploading..." : "Upload Data"}
          </Button>

          {uploadStatus === "success" && (
            <Button onClick={onComplete} className="w-full">
              Continue to Timetable Generator
            </Button>
          )}
        </div>

        <div className="flex justify-center">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
