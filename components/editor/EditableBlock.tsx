"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface EditableBlockData {
  id: string
  sectionName: string
  title: string
  location: string
  duration: string
  latexCode?: string
  // Header-specific fields
  phone?: string
  email?: string
  github?: string
  linkedin?: string
  // Education-specific fields
  degree?: string
  gpa?: string
  relevantCourses?: string
  activities?: string
  // Skills-specific fields
  languages?: string
  technologies?: string
  // Experience/Project-specific fields
  projectBullets?: string[]
  role?: string
  other?: string
}

interface EditableBlockProps {
  block: EditableBlockData
  onUpdate: (updated: Partial<EditableBlockData>) => void
}

export function EditableBlock({ block, onUpdate }: EditableBlockProps) {
  const handleFieldChange = (
    field: keyof EditableBlockData,
    value: string | string[]
  ) => {
    onUpdate({ [field]: value })
  }

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-gray-500">
        {block.sectionName}
      </div>
      
      <div className="space-y-4">
        <div>
          <Label>Title</Label>
          <Input
            value={block.title}
            onChange={(e) => handleFieldChange("title", e.target.value)}
            placeholder={`Enter ${block.sectionName} title`}
          />
        </div>

        <div>
          <Label>Location</Label>
          <Input
            value={block.location}
            onChange={(e) => handleFieldChange("location", e.target.value)}
            placeholder="Enter location"
          />
        </div>

        <div>
          <Label>Duration</Label>
          <Input
            value={block.duration}
            onChange={(e) => handleFieldChange("duration", e.target.value)}
            placeholder="e.g., Jan 2020 - Present"
          />
        </div>
      </div>
    </div>
  )
}
