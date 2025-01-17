"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface ResumeSelectorProps {
  currentResume: string;
  resumes: Array<{ id: string; name: string }>;
  onResumeChange: (id: string) => void;
  onCreateResume: (name: string) => Promise<void>;
}

export function ResumeSelector({
  currentResume,
  resumes,
  onResumeChange,
  onCreateResume,
}: ResumeSelectorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newResumeName, setNewResumeName] = useState("");
  
  // Get the current resume name
  const currentResumeName = resumes.find(r => r.id === currentResume)?.name;

  const handleCreateClick = async () => {
    if (!newResumeName.trim()) return;
    
    try {
      console.log('Creating resume with name:', newResumeName);
      await onCreateResume(newResumeName);
      setIsDialogOpen(false);
      setNewResumeName('');
    } catch (error) {
      console.error('Failed to create resume:', error);
      // Handle error (show toast/alert to user)
    }
  };

  return (
    <>
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
        <Button onClick={() => setIsDialogOpen(true)}>New Resume</Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Resume</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Resume name"
            value={newResumeName}
            onChange={(e) => setNewResumeName(e.target.value)}
          />
          <DialogFooter>
            <Button onClick={handleCreateClick}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 