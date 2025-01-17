"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ResumeSelectorProps {
  currentResume: string;
  resumes: Array<{ id: string; name: string }>;
  onResumeChange: (id: string) => void;
  onNewResume: () => void;
}

export function ResumeSelector({
  currentResume,
  resumes,
  onResumeChange,
  onNewResume,
}: ResumeSelectorProps) {
  // Get the current resume name
  const currentResumeName = resumes.find(r => r.id === currentResume)?.name;

  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentResume || ""}
        onValueChange={onResumeChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue>
            {currentResumeName || "Select a resume"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {resumes.length === 0 ? (
            <SelectItem key="no-resumes-placeholder" value="empty" disabled>
              No resumes yet
            </SelectItem>
          ) : (
            resumes.map((resume) => (
              <SelectItem key={resume.id} value={resume.id}>
                {resume.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      <Button onClick={onNewResume}>New Resume</Button>
    </div>
  );
} 