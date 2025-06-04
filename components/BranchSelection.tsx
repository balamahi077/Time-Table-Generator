"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Branch } from "@/types"

interface BranchSelectionProps {
  onSelect: (branch: string) => void
  onBack: () => void
}

export default function BranchSelection({ onSelect, onBack }: BranchSelectionProps) {
  const branches: Branch[] = [
    // Undergraduate
    { category: "undergraduate", name: "Computer Science & Engineering", code: "CSE" },
    { category: "undergraduate", name: "Mechanical Engineering", code: "ME" },
    { category: "undergraduate", name: "Electronics & Communication Engineering", code: "ECE" },
    { category: "undergraduate", name: "Electrical & Electronics Engineering", code: "EEE" },
    { category: "undergraduate", name: "Civil Engineering", code: "CE" },
    { category: "undergraduate", name: "Artificial Intelligence & Machine Learning", code: "AIML" },
    // Postgraduate
    { category: "postgraduate", name: "Masters in Business Administration", code: "MBA" },
  ]

  const undergraduateBranches = branches.filter((b) => b.category === "undergraduate")
  const postgraduateBranches = branches.filter((b) => b.category === "postgraduate")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl text-center">Select Branch</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Undergraduate */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-blue-700">Under Graduate</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {undergraduateBranches.map((branch) => (
              <Button
                key={branch.code}
                variant="outline"
                className="p-4 h-auto text-left justify-start"
                onClick={() => onSelect(branch.name)}
              >
                <div>
                  <div className="font-medium">{branch.name}</div>
                  <div className="text-sm text-gray-500">({branch.code})</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Postgraduate */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-green-700">Post Graduate</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {postgraduateBranches.map((branch) => (
              <Button
                key={branch.code}
                variant="outline"
                className="p-4 h-auto text-left justify-start"
                onClick={() => onSelect(branch.name)}
              >
                <div>
                  <div className="font-medium">{branch.name}</div>
                  <div className="text-sm text-gray-500">({branch.code})</div>
                </div>
              </Button>
            ))}
          </div>
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
