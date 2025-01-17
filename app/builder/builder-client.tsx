// pages/builder.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { DraggableBlock } from "@/components/editor/DraggableBlock";
import { EditorCanvas } from "@/components/editor/EditorCanvas";
import { MarkdownPreview } from "@/components/preview/MarkdownPreview";
import { Button } from "@/components/ui/button";
import { wrapJakeTemplate } from "@/lib/latexTemplate";
import { EditableBlockData } from "@/components/editor/EditableBlock";
import { v4 as uuidv4 } from 'uuid';
import { ResumeSelector } from "@/components/resume/ResumeSelector";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

// Add type for resume data
interface ResumeData {
  _id: string;
  name: string;
  blockIds: string[];
}

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
  // Initialize with empty array and update after mount
  const [canvasBlocks, setCanvasBlocks] = useState<EditableBlockData[]>([]);
  const [currentResumeName, setCurrentResumeName] = useState<string>("");
  const [isClient, setIsClient] = useState(false);
  const [resumes, setResumes] = useState<Array<{ name: string; id: string }>>([]);
  const [currentResumeId, setCurrentResumeId] = useState<string>("");
  const [isNewResumeDialogOpen, setIsNewResumeDialogOpen] = useState(false);
  const [newResumeName, setNewResumeName] = useState("");

  // Load resumes and blocks on mount
  useEffect(() => {
    if (!isClient) {
      setIsClient(true);
      return;
    }

    const loadInitialData = async () => {
      try {
        // First load all resumes
        const resumeResponse = await fetch('/api/users/resumes');
        if (!resumeResponse.ok) {
          console.error('Failed to load resumes');
          return;
        }

        const resumeData = await resumeResponse.json();
        if (resumeData.resumes?.length > 0) {
          // Set resumes state
          const formattedResumes = resumeData.resumes.map((resume: ResumeData) => ({
            id: resume._id,
            name: resume.name
          }));
          setResumes(formattedResumes);

          // Set current resume
          const defaultResume = resumeData.resumes[0];
          
          // Load blocks for the default resume
          if (defaultResume._id) {
            const blocksResponse = await fetch(`/api/users/resumes/${defaultResume._id}/blocks`);
            if (!blocksResponse.ok) {
              console.error('Failed to load blocks for default resume');
              return;
            }

            const blocksData = await blocksResponse.json();
            console.log('Initial resume load:', {
              resumeName: defaultResume.name,
              blockCount: blocksData.blocks?.length || 0,
              blocks: blocksData.blocks
            });

            // Update all states after successful load
            setCurrentResumeId(defaultResume._id);
            setCurrentResumeName(defaultResume.name);
            setCanvasBlocks(blocksData.blocks || []);
          }
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };

    loadInitialData();
  }, [isClient]);

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

  // Handler to add new blocks from the library
  const handleDropBlock = useCallback((block: EditableBlockData) => {
    if (!currentResumeId) {
      console.error('No resume selected');
      return;
    }

    // Create the new block once
    const newBlock = {
      ...block,
      id: `${block.sectionName.toLowerCase()}-${uuidv4()}`.replace('-template', ''),
      order: canvasBlocks.length // Add order here
    };

    // Update UI optimistically
    setCanvasBlocks(prevBlocks => [...prevBlocks, newBlock]);

    // Single server update
    (async () => {
      try {
        // Save block and update resume in one request
        const response = await fetch('/api/users/blocks/add-to-resume', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            block: newBlock,
            resumeId: currentResumeId
          }),
        });

        if (!response.ok) {
          console.error('Failed to save block to resume');
          // Revert optimistic update on failure
          setCanvasBlocks(prevBlocks => prevBlocks.filter(b => b.id !== newBlock.id));
          return;
        }

        const { block: savedBlock } = await response.json();
        
        // Update the block in canvas with the saved version (contains _id)
        setCanvasBlocks(prevBlocks => 
          prevBlocks.map(b => b.id === newBlock.id ? savedBlock : b)
        );

      } catch (error) {
        console.error('Error saving new block:', error);
        // Revert optimistic update on error
        setCanvasBlocks(prevBlocks => prevBlocks.filter(b => b.id !== newBlock.id));
      }
    })();

  }, [currentResumeId, canvasBlocks.length]);

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
      return updatedBlocks;
    });
  }, [generateLatexForBlock]);

  // Handler to delete blocks
  const handleDeleteBlock = useCallback((id: string) => {
    if (!currentResumeId) {
      console.error('No resume selected');
      return;
    }

    // Optimistically update UI
    setCanvasBlocks(prevBlocks => {
      const blockToDelete = prevBlocks.find(block => block._id === id || block.id === id);
      if (!blockToDelete) return prevBlocks;

      const updatedBlocks = prevBlocks.filter(block => block._id !== id && block.id !== id);

      // Delete from server
      (async () => {
        try {
          // First delete the block from universal blocks array
          const deleteResponse = await fetch('/api/users/blocks', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              blockId: blockToDelete._id || id 
            }),
          });

          if (!deleteResponse.ok) {
            console.error('Failed to delete block');
            setCanvasBlocks(prevBlocks);
            return;
          }

          // Then update the resume's blockIds array
          const remainingBlockIds = updatedBlocks
            .filter(block => block._id)
            .map(block => block._id);

          const resumeResponse = await fetch(`/api/users/resumes/${currentResumeId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: currentResumeName,
              blockIds: remainingBlockIds
            }),
          });

          if (!resumeResponse.ok) {
            console.error('Failed to update resume');
            setCanvasBlocks(prevBlocks);
            return;
          }
        } catch (error) {
          console.error('Error deleting block:', error);
          setCanvasBlocks(prevBlocks);
        }
      })();

      return updatedBlocks;
    });
  }, [currentResumeId, currentResumeName]);

  // Refactored moveBlock function
  const moveBlock = useCallback((draggedId: string, hoveredId: string) => {
    setCanvasBlocks(prevBlocks => {
      const draggedIndex = prevBlocks.findIndex(block => block.id === draggedId);
      const hoveredIndex = prevBlocks.findIndex(block => block.id === hoveredId);

      if (draggedIndex === -1 || hoveredIndex === -1 || draggedIndex === hoveredIndex) {
        return prevBlocks;
      }

      const updatedBlocks = [...prevBlocks];
      const [removed] = updatedBlocks.splice(draggedIndex, 1);
      updatedBlocks.splice(hoveredIndex, 0, removed);

      return updatedBlocks;
    });
  }, []);

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

  // Handler to switch between resumes
  const handleResumeChange = useCallback(async (resumeId: string) => {
    if (!resumeId || resumeId === 'empty') {
      console.log('Invalid resume ID');
      return;
    }

    try {
      console.log('Switching to resume:', resumeId);
      
      // Find the resume in our current list
      const selectedResume = resumes.find(r => r.id === resumeId);
      if (!selectedResume) {
        console.error('Resume not found in list');
        return;
      }
      
      // Fetch blocks for the selected resume
      const response = await fetch(`/api/users/resumes/${resumeId}/blocks`);
      const data = await response.json();

      if (!response.ok) {
        console.error('Failed to load resume blocks:', data.error);
        return;
      }

      // Update resume details
      setCurrentResumeId(resumeId);
      setCurrentResumeName(selectedResume.name);

      // Update canvas with the resume's blocks
      const sortedBlocks = data.blocks.sort(
        (a: EditableBlockData, b: EditableBlockData) => (a.order ?? 0) - (b.order ?? 0)
      );
      setCanvasBlocks(sortedBlocks);

      console.log('Updated canvas blocks:', {
        resumeName: selectedResume.name,
        blockCount: sortedBlocks.length,
        blocks: sortedBlocks
      });
    } catch (error) {
      console.error('Error switching resume:', error);
    }
  }, [resumes]); // Add resumes to dependencies

  const handleCreateNewResume = useCallback(async () => {
    if (!newResumeName.trim()) return;

    try {
      const response = await fetch('/api/users/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newResumeName,
          blockIds: [],
        }),
      });

      if (!response.ok) {
        console.error('Failed to create new resume');
        return;
      }

      const data = await response.json();
      
      // Update resumes list first
      const newResume = { id: data.resume._id, name: data.resume.name };
      setResumes(prev => [...prev, newResume]);
      
      // Clear canvas and update current resume
      setCanvasBlocks([]);
      setCurrentResumeId(data.resume._id);
      setCurrentResumeName(data.resume.name);

      // Reset UI state
      setIsNewResumeDialogOpen(false);
      setNewResumeName("");

      // No need to call handleResumeChange here since we've already set up the state
    } catch (error) {
      console.error('Error creating new resume:', error);
    }
  }, [newResumeName]);

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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Editor Canvas</h2>
          <ResumeSelector
            currentResume={currentResumeId}
            resumes={resumes}
            onResumeChange={handleResumeChange}
            onNewResume={() => setIsNewResumeDialogOpen(true)}
          />
        </div>
        {resumes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[600px] border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold text-gray-700">No Resumes Yet</h3>
              <p className="text-gray-600 max-w-sm">
                Create your first resume to start building your professional profile
              </p>
              <Button 
                onClick={() => setIsNewResumeDialogOpen(true)}
                className="mt-4"
                size="lg"
              >
                Create Your First Resume
              </Button>
            </div>
          </div>
        ) : (
          <EditorCanvas
            blocks={canvasBlocks}
            onDropBlock={handleDropBlock}
            onBlockUpdate={handleBlockUpdate}
            moveBlock={moveBlock}
            onDelete={handleDeleteBlock}
          />
        )}
      </div>

      {/* Preview Section */}
      <div className="w-full md:w-1/4">
        <h2 className="text-xl font-bold mb-2">Preview</h2>
        <MarkdownPreview content={generateLatexDocument()} />
        <Button className="mt-4" onClick={handleCopyLatex}>
          Copy LaTeX
        </Button>
      </div>

      {/* New Resume Dialog */}
      <Dialog open={isNewResumeDialogOpen} onOpenChange={setIsNewResumeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Resume</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Resume Name"
            value={newResumeName}
            onChange={(e) => setNewResumeName(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewResumeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateNewResume}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
