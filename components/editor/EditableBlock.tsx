import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export interface EditableBlockData {
  id: string;
  sectionName: string;
  title: string;
  location?: string;
  duration?: string;
  phone?: string;
  email?: string;
  github?: string;
  linkedin?: string;
  // Education specific
  degree?: string;
  relevantCourses?: string;
  activities?: string;
  // Skills specific
  languages?: string;
  other?: string;
  // Experience and Projects
  bullets?: string[];
  technologies?: string;
}

interface EditableBlockProps {
  block: EditableBlockData;
  onChange: (id: string, updated: Partial<EditableBlockData>) => void;
  onDelete?: (id: string) => void;
}

export function EditableBlock({ block, onChange, onDelete }: EditableBlockProps) {
  const handleFieldChange = (field: keyof EditableBlockData, value: string | string[]) => {
    onChange(block.id, { [field]: value });
  };

  const handleBulletPointChange = (value: string) => {
    const points = value.split('\n').filter(point => point.trim() !== '');
    handleFieldChange('bullets', points);
  };

  const renderFields = () => {
    switch (block.sectionName.toLowerCase()) {
      case 'header':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Full Name</div>
              <Input
                placeholder="e.g., John Doe"
                value={block.title || ''}
                onChange={(e) => handleFieldChange('title', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Phone</div>
                <Input
                  placeholder="e.g., (123) 456-7890"
                  value={block.phone || ''}
                  onChange={(e) => handleFieldChange('phone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Email</div>
                <Input
                  placeholder="e.g., john.doe@example.com"
                  value={block.email || ''}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">GitHub</div>
                <Input
                  placeholder="e.g., github.com/johndoe"
                  value={block.github || ''}
                  onChange={(e) => handleFieldChange('github', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">LinkedIn</div>
                <Input
                  placeholder="e.g., linkedin.com/in/johndoe"
                  value={block.linkedin || ''}
                  onChange={(e) => handleFieldChange('linkedin', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 'education':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Institution Name</div>
              <Input
                placeholder="e.g., University of Maryland"
                value={block.title || ''}
                onChange={(e) => handleFieldChange('title', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Location</div>
                <Input
                  placeholder="e.g., College Park, MD"
                  value={block.location || ''}
                  onChange={(e) => handleFieldChange('location', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Duration</div>
                <Input
                  placeholder="e.g., Aug 2021 - May 2025"
                  value={block.duration || ''}
                  onChange={(e) => handleFieldChange('duration', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Degree</div>
              <Input
                placeholder="e.g., Bachelor of Science in Computer Science"
                value={block.degree || ''}
                onChange={(e) => handleFieldChange('degree', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Relevant Courses</div>
              <Textarea
                placeholder="e.g., Algorithms, Database Design, Machine Learning"
                value={block.relevantCourses || ''}
                onChange={(e) => handleFieldChange('relevantCourses', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Activities</div>
              <Textarea
                placeholder="e.g., Robotics Club (President), Hackathon Team Lead"
                value={block.activities || ''}
                onChange={(e) => handleFieldChange('activities', e.target.value)}
              />
            </div>
          </div>
        );

      case 'technical skills':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Languages</div>
              <Textarea
                placeholder="e.g., Java, Python, JavaScript, C++"
                value={block.languages || ''}
                onChange={(e) => handleFieldChange('languages', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Other Technologies & Tools</div>
              <Textarea
                placeholder="e.g., Git, Docker, AWS, React"
                value={block.other || ''}
                onChange={(e) => handleFieldChange('other', e.target.value)}
              />
            </div>
          </div>
        );

      case 'experience':
      case 'projects':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">
                {block.sectionName === 'experience' ? 'Company/Organization' : 'Project Name'}
              </div>
              <Input
                placeholder={block.sectionName === 'experience' ? 'e.g., Accenture' : 'e.g., Portfolio Website'}
                value={block.title || ''}
                onChange={(e) => handleFieldChange('title', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">
                  {block.sectionName === 'experience' ? 'Location' : 'Technologies'}
                </div>
                <Input
                  placeholder={block.sectionName === 'experience' ? 'e.g., Arlington, VA' : 'e.g., React, Node.js, MongoDB'}
                  value={block.sectionName === 'experience' ? block.location : block.technologies || ''}
                  onChange={(e) => handleFieldChange(
                    block.sectionName === 'experience' ? 'location' : 'technologies',
                    e.target.value
                  )}
                />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Duration</div>
                <Input
                  placeholder="e.g., June 2023 - Present"
                  value={block.duration || ''}
                  onChange={(e) => handleFieldChange('duration', e.target.value)}
                />
              </div>
            </div>
            {block.sectionName === 'experience' && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Role/Title</div>
                <Input
                  placeholder="e.g., Software Engineer Intern"
                  value={block.title || ''}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              <div className="text-sm font-medium">Bullet Points (one per line)</div>
              <Textarea
                className="min-h-[200px] font-mono"
                placeholder={`• Developed feature X that improved Y by Z%\n• Led team of N engineers to implement...`}
                value={block.bullets?.join('\n') || ''}
                onChange={(e) => handleBulletPointChange(e.target.value)}
              />
              <div className="text-xs text-gray-500">
                Pro tip: Start each line with a bullet point (•) for better formatting
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="relative">
      <CardContent className="pt-6">
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2"
            onClick={() => onDelete(block.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
        <div className="text-sm font-medium text-gray-500 mb-4">
          {block.sectionName} Section
        </div>
        {renderFields()}
      </CardContent>
    </Card>
  );
}