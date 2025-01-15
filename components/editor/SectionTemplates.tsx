import React from 'react';
import { DraggableBlock } from './DraggableBlock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditableBlockData } from './EditableBlock';

const sectionTemplates: EditableBlockData[] = [
  {
    id: 'template-header',
    sectionName: 'Header',
    title: '',
    phone: '',
    email: '',
    github: '',
    linkedin: ''
  },
  {
    id: 'template-education',
    sectionName: 'Education',
    title: '',
    location: '',
    duration: '',
    degree: '',
    gpa: '',
    relevantCourses: '',
    activities: ''
  },
  {
    id: 'template-skills',
    sectionName: 'Technical Skills',
    title: 'Technical Skills',
    languages: '',
    technologies: ''
  },
  {
    id: 'template-experience',
    sectionName: 'Experience',
    title: '',
    location: '',
    duration: '',
    bulletPoints: []
  },
  {
    id: 'template-projects',
    sectionName: 'Projects',
    title: '',
    location: '',
    duration: '',
    bulletPoints: []
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