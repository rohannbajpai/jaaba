import React from 'react';
import { DraggableBlock } from './DraggableBlock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditableBlockData } from './EditableBlock';

const sectionTemplates: EditableBlockData[] = [
  {
    id: 'template-header',
    sectionName: 'Header',
    title: '',
    location: '',
    duration: '',
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
    //gpa: '', #TODO: readd
    relevantCourses: '',
    activities: ''
  },
  {
    id: 'template-skills',
    sectionName: 'Technical Skills',
    title: 'Technical Skills',
    location: '',
    duration: '',
    languages: '',
    technologies: ''
  },
  {
    id: 'template-experience',
    sectionName: 'Experience',
    title: '',
    location: '',
    duration: '',
    projectBullets: []
  },
  {
    id: 'template-projects',
    sectionName: 'Projects',
    title: '',
    location: '',
    duration: '',
    projectBullets: []
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