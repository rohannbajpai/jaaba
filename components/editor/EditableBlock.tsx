"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";


export interface EditableBlockData {
  id: string;
  sectionName: string; // e.g., "Header", "Education", "Experience", ...
  title?: string; // For "Header," we might use it for Name
  phone?: string;
  email?: string;
  github?: string;
  linkedin?: string;
  location?: string;
  duration?: string;
  description?: string;
}



interface EditableBlockProps {
  block: EditableBlockData;
  onChange: (id: string, updated: Partial<EditableBlockData>) => void;
}

export function EditableBlock({ block, onChange }: EditableBlockProps) {
  const handleFieldChange = (field: keyof EditableBlockData, value: string) => {
    onChange(block.id, { [field]: value });
  };

  return (
    <div className="flex flex-col gap-2 p-2">
      {block.sectionName === "Header" ? (
        <>
          <Input
            label="Name"
            placeholder="e.g., Jane Doe"
            value={block.title || ""}
            onChange={(e) => handleFieldChange("title", e.target.value)}
          />
          <Input
            label="Phone Number"
            placeholder="e.g., (123) 456-7890"
            value={block.phone || ""}
            onChange={(e) => handleFieldChange("phone", e.target.value)}
          />
          <Input
            label="Email"
            placeholder="e.g., jane.doe@example.com"
            value={block.email || ""}
            onChange={(e) => handleFieldChange("email", e.target.value)}
          />
          <Input
            label="GitHub"
            placeholder="e.g., github.com/janedoe"
            value={block.github || ""}
            onChange={(e) => handleFieldChange("github", e.target.value)}
          />
          <Input
            label="LinkedIn"
            placeholder="e.g., linkedin.com/in/janedoe"
            value={block.linkedin || ""}
            onChange={(e) => handleFieldChange("linkedin", e.target.value)}
          />
        </>
      ) : (
        <>
          <Input
            label="Title (Name, School, Position...)"
            placeholder="e.g., Jane Doe or Harvard University"
            value={block.title || ""}
            onChange={(e) => handleFieldChange("title", e.target.value)}
          />
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
        </>
      )}
    </div>
  );
}
