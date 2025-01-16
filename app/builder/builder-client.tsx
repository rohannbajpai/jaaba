// pages/builder.tsx
"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { DraggableBlock } from "@/components/editor/DraggableBlock";
import { EditorCanvas } from "@/components/editor/EditorCanvas";
import { MarkdownPreview } from "@/components/preview/MarkdownPreview";
import { Button } from "@/components/ui/button";
import { wrapJakeTemplate } from "@/lib/latexTemplate";
import { EditableBlockData } from "@/components/editor/EditableBlock";
import debounce from "lodash/debounce";
import { v4 as uuidv4 } from 'uuid';

const libraryBlocks: EditableBlockData[] = [
  // ------------------------------
  // HEADER
  // ------------------------------
  {
    id: `header-template-${uuidv4()}`,
    sectionName: "Header",
    title: "",
    phone: "",
    email: "",
    github: "",
    linkedin: "",
    location: "",
    duration: "",
    degree: undefined,
    relevantCourses: undefined,
    activities: undefined,
    languages: undefined,
    other: undefined,
    bullets: undefined,
    role: undefined,
    projectName: undefined,
    technologies: undefined,
    projectBullets: undefined,
  },
  
  // ------------------------------
  // EDUCATION
  // ------------------------------
  {
    id: `education-template-${uuidv4()}`,
    sectionName: "Education",
    title: "",
    location: "",
    duration: "",
    degree: "",
    relevantCourses: "",
    activities: "",
    phone: undefined,
    email: undefined,
    github: undefined,
    linkedin: undefined,
    languages: undefined,
    other: undefined,
    bullets: undefined,
    role: undefined,
    projectName: undefined,
    technologies: undefined,
    projectBullets: undefined,
  },
  
  // ------------------------------
  // EXPERIENCE
  // ------------------------------
  {
    id: `experience-template-${uuidv4()}`,
    sectionName: "Experience",
    title: "",
    location: "",
    duration: "",
    role: "",
    bullets: [],
    phone: undefined,
    email: undefined,
    github: undefined,
    linkedin: undefined,
    degree: undefined,
    relevantCourses: undefined,
    activities: undefined,
    languages: undefined,
    other: undefined,
    projectName: undefined,
    technologies: undefined,
    projectBullets: undefined,
  },
  
  // ------------------------------
  // PROJECTS
  // ------------------------------
  {
    id: `projects-template-${uuidv4()}`,
    sectionName: "Projects",
    title: "",
    technologies: "",
    duration: "",
    projectBullets: [],
    location: "",
    phone: undefined,
    email: undefined,
    github: undefined,
    linkedin: undefined,
    degree: undefined,
    relevantCourses: undefined,
    activities: undefined,
    languages: undefined,
    other: undefined,
    bullets: undefined,
    role: undefined,
    projectName: undefined,
  },
  
  // ------------------------------
  // TECHNICAL SKILLS
  // ------------------------------
  {
    id: `skills-template-${uuidv4()}`,
    sectionName: "Technical Skills",
    languages: "",
    other: "",
    title: "",
    location: "",
    duration: "",
    phone: undefined,
    email: undefined,
    github: undefined,
    linkedin: undefined,
    degree: undefined,
    relevantCourses: undefined,
    activities: undefined,
    bullets: undefined,
    role: undefined,
    projectName: undefined,
    technologies: undefined,
    projectBullets: undefined,
  },
];

export default function BuilderClient() {
  const [canvasBlocks, setCanvasBlocks] = useState<EditableBlockData[]>([]);

  // Function to generate LaTeX code for each block
  const generateLatexForBlock = useCallback((block: EditableBlockData) => {
    switch (block.sectionName) {
      case 'Header':
        return block.title ? `\\header{${block.title}}{${block.location || ''}}` : '';
      case 'Education':
      case 'Experience':
      case 'Projects':
      case 'Technical Skills':
        return block.title ?
          `\\resumeSubheading{${block.title}}{${block.location || ''}}{${block.duration || ''}}` : '';
      default:
        return '';
    }
  }, []);

  // Debounced function to save resume data
  const debouncedSave = useCallback(
    async (blocks: EditableBlockData[]) => {
      try {
        const blocksWithLatex = blocks.map((block, index) => ({
          ...block,
          latexCode: generateLatexForBlock(block),
          order: index,
        }));

        const response = await fetch('/api/resumes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            blocks: blocksWithLatex,
          }),
        });

        if (!response.ok) {
          console.error('Failed to save resume');
        } else {
          console.log('Resume saved successfully.');
        }
      } catch (error) {
        console.error('Error saving resume:', error);
      }
    },
    [generateLatexForBlock]
  );

  const debouncedSaveHandler = useMemo(
    () => debounce(debouncedSave, 1000),
    [debouncedSave]
  );

  // Handler to add new blocks from the library
  const handleDropBlock = useCallback((block: EditableBlockData) => {
    setCanvasBlocks(prevBlocks => {
      const newBlock = {
        ...block,
        id: `${block.sectionName.toLowerCase()}-${uuidv4()}`, // Ensure unique ID
      };
      const updatedBlocks = [...prevBlocks, newBlock];
      
      // Save updated blocks
      debouncedSaveHandler(updatedBlocks);

      return updatedBlocks;
    });
  }, [debouncedSaveHandler]);

  // Handler to update existing blocks
  const handleBlockUpdate = useCallback((id: string, updated: Partial<EditableBlockData>) => {
    setCanvasBlocks(prevBlocks => {
      const updatedBlocks = prevBlocks.map((block) => {
        if (block.id === id) {
          const updatedBlock = { ...block, ...updated };
          return {
            ...updatedBlock,
            latexCode: generateLatexForBlock(updatedBlock)
          };
        }
        return block;
      });
      // Save updated blocks
      debouncedSaveHandler(updatedBlocks);
      return updatedBlocks;
    });
  }, [debouncedSaveHandler, generateLatexForBlock]);

  // Handler to delete a block
  const handleDeleteBlock = useCallback((id: string) => {
    setCanvasBlocks(prevBlocks => {
      const updatedBlocks = prevBlocks.filter(block => block.id !== id);
      
      // Save updated blocks
      debouncedSaveHandler(updatedBlocks);

      return updatedBlocks;
    });
  }, [debouncedSaveHandler]);

  // Refactored moveBlock function
  const moveBlock = useCallback((draggedId: string, hoveredId: string) => {
    setCanvasBlocks(prevBlocks => {
      const draggedIndex = prevBlocks.findIndex(block => block.id === draggedId);
      const hoveredIndex = prevBlocks.findIndex(block => block.id === hoveredId);

      if (draggedIndex === -1 || hoveredIndex === -1 || draggedIndex === hoveredIndex) {
        return prevBlocks; // No change needed
      }

      const updatedBlocks = [...prevBlocks];
      const [removed] = updatedBlocks.splice(draggedIndex, 1);
      updatedBlocks.splice(hoveredIndex, 0, removed);

      // Save updated blocks
      debouncedSaveHandler(updatedBlocks);

      return updatedBlocks;
    });
  }, [debouncedSaveHandler]);

  // Function to generate the complete LaTeX document
  const generateLatexDocument = useCallback(() => {
    const formattedBlocks = canvasBlocks.map(block => {
      // Clone the block to avoid mutating the original state
      const formattedBlock = { ...block };
      
      // Only modify fields as necessary
      if (block.sectionName === 'Header') {
        // Header already contains all necessary fields
        // No additional modifications required
      } else if (block.sectionName === 'Education') {
        // No changes needed; fields are correctly set
      } else if (block.sectionName === 'Experience') {
        // Ensure bullets are present; default to empty array if undefined
        formattedBlock.bullets = block.bullets || [];
      } else if (block.sectionName === 'Projects') {
        // Ensure projectBullets are present; default to empty array if undefined
        formattedBlock.projectBullets = block.projectBullets || [];
      } else if (block.sectionName === 'Technical Skills') {
        // No changes needed; fields are correctly set
      }
    
      return formattedBlock;
    });
    
    return wrapJakeTemplate(formattedBlocks);
  }, [canvasBlocks]);

  // Handler to copy LaTeX code to clipboard
  const handleCopyLatex = useCallback(() => {
    navigator.clipboard.writeText(generateLatexDocument())
      .then(() => {
        alert("LaTeX copied to clipboard. Paste it into Overleaf to compile!");
      })
      .catch((err) => {
        console.error(err);
        alert("Error copying LaTeX.");
      });
  }, [generateLatexDocument]);

  // Load resume data from the backend on mount
  useEffect(() => {
    const loadResume = async () => {
      try {
        const response = await fetch('/api/resumes');
        if (response.ok) {
          const data = await response.json();
          if (data.resume?.blocks?.length > 0) {
            const sortedBlocks: Array<EditableBlockData> = [...data.resume.blocks].sort((a, b) => a.order - b.order);
            setCanvasBlocks(sortedBlocks);
          }
        }
      } catch (error) {
        console.error('Error loading resume:', error);
      }
    };

    loadResume();
  }, []);

  return (
    <main className="flex flex-col md:flex-row gap-4 p-4">
      {/* Block Library */}
      <div className="w-full md:w-1/4">
        <h2 className="text-xl font-bold mb-2">Block Library</h2>
        <p className="text-sm text-gray-600 mb-3">
          Drag these sections to the canvas. Then fill in details.
        </p>
        {libraryBlocks.map((block) => (
          <DraggableBlock key={block.id} block={block} />
        ))}
      </div>

      {/* Editor Canvas */}
      <div className="w-full md:w-1/2">
        <h2 className="text-xl font-bold mb-2">Editor Canvas</h2>
        <EditorCanvas
          blocks={canvasBlocks}
          onDropBlock={handleDropBlock}
          onBlockUpdate={handleBlockUpdate}
          moveBlock={moveBlock}
          onDelete={handleDeleteBlock} // Pass the delete handler
        />
      </div>

      {/* Preview Section */}
      <div className="w-full md:w-1/4">
        <h2 className="text-xl font-bold mb-2">Preview</h2>
        <MarkdownPreview content={generateLatexDocument()} />
        <Button className="mt-4" onClick={handleCopyLatex}>
          Copy LaTeX
        </Button>
      </div>
    </main>
  );
}
