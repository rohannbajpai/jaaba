import React from 'react';
import { DraggableBlock } from './DraggableBlock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditableBlockData } from './EditableBlock';

export const sectionTemplates: EditableBlockData[] = [
  // Header Template
  {
    id: 'template-header',
    sectionName: 'Header',
    fullName: '',
    phone: '',
    email: '',
    github: '',
    linkedin: '',
    order: 0,
  },

  // Education Template
  {
    id: 'template-education',
    sectionName: 'Education',
    institutionName: '',
    location: '',
    duration: '',
    degree: '',
    relevantCourses: '',
    activities: '',
    order: 0,
  },

  // Experience Template
  {
    id: 'template-experience',
    sectionName: 'Experience',
    companyName: '',
    role: '',
    location: '',
    duration: '',
    bullets: [],
    order: 0,
  },

  // Projects Template
  {
    id: 'template-projects',
    sectionName: 'Projects',
    projectName: '',
    technologies: '',
    duration: '',
    projectBullets: [],
    location: '',
    order: 0,
  },

  // Technical Skills Template
  {
    id: 'template-skills',
    sectionName: 'Technical Skills',
    languages: '',
    other: '',
    location: '',
    duration: '',
    order: 0,
  }
];

export function SectionTemplates() {
  return (
    <Card className="bg-muted/50">
      <CardHeader>
        <CardTitle>Available Sections</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {sectionTemplates.map((template) => (
          <DraggableBlock key={template.id} block={template} />
        ))}
      </CardContent>
    </Card>
  );
}