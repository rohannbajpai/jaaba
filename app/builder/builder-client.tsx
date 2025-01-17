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

const CACHE_KEY = 'resume-builder-blocks';

export default function BuilderClient() {
  // Initialize with empty array and update after mount
  const [canvasBlocks, setCanvasBlocks] = useState<EditableBlockData[]>([]);
  const [currentResumeName, setCurrentResumeName] = useState<string>("Default Resume");
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true after mount
  useEffect(() => {
    setIsClient(true);
    // Load from localStorage after component mounts
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const parsedBlocks = JSON.parse(cached);
        setCanvasBlocks(parsedBlocks);
      } catch (e) {
        console.error('Failed to parse cached blocks');
      }
    }
  }, []);

  // Update localStorage whenever blocks change, but only after initial mount
  useEffect(() => {
    if (isClient && canvasBlocks.length > 0) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(canvasBlocks));
    }
  }, [canvasBlocks, isClient]);

  // Load blocks from the backend on mount
  useEffect(() => {
    if (!isClient) return; // Skip server-side execution

    const loadBlocks = async () => {
      try {
        const resumeResponse = await fetch('/api/users/resumes');
        if (!resumeResponse.ok) {
          console.error('Failed to load resume');
          return;
        }

        const resumeData = await resumeResponse.json();
        const currentResume = resumeData.resumes?.[0];
        if (currentResume) {
          setCurrentResumeName(currentResume.name);

          const blocksResponse = await fetch('/api/users/blocks');
          if (!blocksResponse.ok) {
            console.error('Failed to load blocks');
            return;
          }

          const blocksData = await blocksResponse.json();
          if (blocksData.blocks?.length > 0) {
            const resumeBlocks = blocksData.blocks
              .filter((block: EditableBlockData) => 
                currentResume.blockIds.some(
                  (blockId: string) => blockId === block._id
                )
              )
              .sort((a: EditableBlockData, b: EditableBlockData) => 
                a.order - b.order
              );

            setCanvasBlocks(resumeBlocks);
            localStorage.setItem(CACHE_KEY, JSON.stringify(resumeBlocks));
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadBlocks();
  }, [isClient]);

  // Debounced function to save blocks
  const debouncedSave = useCallback(
    async (blocks: EditableBlockData[]) => {
      try {
        // First, save blocks to user's blocks array
        const blocksWithOrder = blocks.map((block, index) => ({
          ...block,
          order: index,
        }));

        const blockResponse = await fetch('/api/users/blocks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            blocks: blocksWithOrder,
          }),
        });

        if (!blockResponse.ok) {
          console.error('Failed to save blocks');
          return;
        }

        const { blocks: savedBlocks } = await blockResponse.json();

        // Then update the resume's blockIds using the saved block IDs
        const resumeResponse = await fetch('/api/users/resumes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: currentResumeName,
            blockIds: savedBlocks.map((block: any) => block._id),
          }),
        });

        if (!resumeResponse.ok) {
          console.error('Failed to update resume');
        } else {
          console.log('Resume and blocks saved successfully');
        }
      } catch (error) {
        console.error('Error saving data:', error);
      }
    },
    [currentResumeName]
  );

  const debouncedSaveHandler = useMemo(
    () => debounce(debouncedSave, 1000),
    [debouncedSave]
  );

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
    setCanvasBlocks(prevBlocks => {
      const newBlock = {
        ...block,
        id: `${block.sectionName.toLowerCase()}-${uuidv4()}`.replace('-template', ''),
      };
      const updatedBlocks = [...prevBlocks, newBlock];

      // Save to localStorage first
      localStorage.setItem(CACHE_KEY, JSON.stringify(updatedBlocks));

      // Then update server immediately instead of using debounce
      (async () => {
        try {
          const blockResponse = await fetch('/api/users/blocks', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              blocks: updatedBlocks.map((block, index) => ({
                ...block,
                order: index,
              })),
            }),
          });

          if (!blockResponse.ok) {
            console.error('Failed to save blocks');
            return;
          }

          const { blocks: savedBlocks } = await blockResponse.json();

          // Update the resume with new block IDs
          const resumeResponse = await fetch('/api/users/resumes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: currentResumeName,
              blockIds: savedBlocks.map((block: any) => block._id),
            }),
          });

          if (!resumeResponse.ok) {
            console.error('Failed to update resume');
          }

          // Update local state with server-generated IDs
          setCanvasBlocks(savedBlocks);
          localStorage.setItem(CACHE_KEY, JSON.stringify(savedBlocks));
        } catch (error) {
          console.error('Error saving new block:', error);
        }
      })();

      return updatedBlocks;
    });
  }, [currentResumeName]);

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
      debouncedSaveHandler(updatedBlocks);
      return updatedBlocks;
    });
  }, [debouncedSaveHandler, generateLatexForBlock]);

  // Handler to delete a block
  const handleDeleteBlock = useCallback((id: string) => {
    setCanvasBlocks(prevBlocks => {
      // Filter out the deleted block
      const updatedBlocks = prevBlocks.filter(block => {
        // Use _id for server-side blocks since that's what we have
        return block._id !== id;
      });

      // Save to localStorage first
      localStorage.setItem(CACHE_KEY, JSON.stringify(updatedBlocks));

      // Then update server
      (async () => {
        try {
          // First update blocks
          const blockResponse = await fetch('/api/users/blocks', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              blocks: updatedBlocks.map((block, index) => ({
                ...block,
                order: index,
              })),
            }),
          });

          if (!blockResponse.ok) {
            console.error('Failed to save blocks');
            return;
          }

          const responseData = await blockResponse.json();

          // Then update resume's blockIds
          const resumeResponse = await fetch('/api/users/resumes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: currentResumeName,
              blockIds: responseData.blocks.map((block: EditableBlockData) => block._id!),
            }),
          });

          if (!resumeResponse.ok) {
            console.error('Failed to update resume');
          }
        } catch (error) {
          console.error('Error saving after delete:', error);
        }
      })();

      return updatedBlocks;
    });
  }, [currentResumeName]);

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
