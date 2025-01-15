"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export interface EditableBlockData {
  id: string
  sectionName: string  // e.g. "Header", "Education", "Experience", ...
  title: string        // For "Header," we might use it for Name
  location?: string
  duration?: string
  description?: string
}

interface EditableBlockProps {
  block: EditableBlockData
  onChange: (id: string, updated: Partial<EditableBlockData>) => void
}

export function EditableBlock({ block, onChange }: EditableBlockProps) {
  const handleFieldChange = (
    field: keyof EditableBlockData,
    value: string
  ) => {
    onChange(block.id, { [field]: value })
  }

  return (
    <div className="flex flex-col gap-2 p-2">
      {/* The label text can vary by section. For "Header," maybe "Name." 
          For "Education," maybe "School Name." But we'll keep it generic. */}
      <Input
        label="Title (Name, School, Position...)"
        placeholder="e.g. Jane Doe or Harvard University"
        value={block.title}
        onChange={(e) => handleFieldChange("title", e.target.value)}
      />
      {/* For "Header," user might treat 'location' as email or something else. 
          It's up to them. */}
      <Input
        label="Location / Extra Field"
        placeholder="City, email, or anything else"
        value={block.location || ""}
        onChange={(e) => handleFieldChange("location", e.target.value)}
      />
      <Input
        label="Duration / Extra Field"
        placeholder="Dates or something else"
        value={block.duration || ""}
        onChange={(e) => handleFieldChange("duration", e.target.value)}
      />
      <Textarea
        label="Description"
        placeholder="Bullet points, details, etc."
        value={block.description || ""}
        onChange={(e) => handleFieldChange("description", e.target.value)}
      />
    </div>
  )
}
