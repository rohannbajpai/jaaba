"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { DraggableBlock } from "@/components/editor/DraggableBlock"
import { EditorCanvas } from "@/components/editor/EditorCanvas"
import { MarkdownPreview } from "@/components/preview/MarkdownPreview"
import { Button } from "@/components/ui/button"
import { wrapJakeTemplate } from "@/lib/latexTemplate"
import { EditableBlockData } from "@/components/editor/EditableBlock"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import debounce from "lodash/debounce"

// Our "library" blocks are all *generic*—no prefilled details.
const libraryBlocks: EditableBlockData[] = [
  { id: "header", sectionName: "Header", title: "", location: "", duration: ""},
  { id: "education", sectionName: "Education", title: "", location: "", duration: ""},
  { id: "experience", sectionName: "Experience", title: "", location: "", duration: ""},
  { id: "projects", sectionName: "Projects", title: "", location: "", duration: ""},
  { id: "skills", sectionName: "Technical Skills", title: "", location: "", duration: ""},
]

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  // The user’s “canvas” blocks, in the order dropped
  const [canvasBlocks, setCanvasBlocks] = useState<EditableBlockData[]>([])

  // Helper function to generate LaTeX for a single block
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
  }, []); // Empty dependency array since it doesn't depend on any props or state

  // Create a debounced save function to prevent too many API calls
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

  // Called when a block is dropped onto the canvas
  const handleDropBlock = (block: EditableBlockData) => {
    // Use the ID generated in DraggableBlock
    const updatedBlocks = [...canvasBlocks, block];
    setCanvasBlocks(updatedBlocks);
    debouncedSaveHandler(updatedBlocks);
  }

  // Called when the user edits a block's fields
  const handleBlockUpdate = (id: string, updated: Partial<EditableBlockData>) => {
    const updatedBlocks = canvasBlocks.map((block) => {
      if (block.id === id) {
        const updatedBlock = { ...block, ...updated };
        // Generate LaTeX code immediately when block is updated
        return {
          ...updatedBlock,
          latexCode: generateLatexForBlock(updatedBlock)
        };
      }
      return block;
    });
    setCanvasBlocks(updatedBlocks);
    debouncedSaveHandler(updatedBlocks);
  }

  // Convert the user's blocks into a valid LaTeX doc
  const generateLatexDocument = () => {
    // Convert our blocks to match the template's Block interface
    const formattedBlocks = canvasBlocks.map(block => {
      const baseBlock = {
        ...block,
        // Add any missing fields that the template expects
        degree: block.title, // For education blocks
        role: block.title,   // For experience blocks
        projectName: block.title, // For project blocks
        bullets: [],         // For experience/project bullet points
        languages: block.title, // For skills section
        other: block.location,  // For skills section
      };

      // Special handling for header block
      if (block.sectionName === 'Header') {
        return {
          ...baseBlock,
          phone: block.location,
          email: block.duration,
          github: '',
          linkedin: '',
        };
      }

      return baseBlock;
    });

    return wrapJakeTemplate(formattedBlocks);
  };

  const handleCopyLatex = () => {
    navigator.clipboard.writeText(generateLatexDocument())
      .then(() => {
        alert("LaTeX copied to clipboard. Paste it into Overleaf to compile!")
      })
      .catch((err) => {
        console.error(err)
        alert("Error copying LaTeX.")
      })
  }

  // Load saved resume on component mount
  useEffect(() => {
    // Only redirect if not authenticated
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    // Only try to load resume if authenticated
    if (status === 'authenticated') {
      const loadResume = async () => {
        try {
          const response = await fetch('/api/resumes');
          if (response.ok) {
            const data = await response.json();
            // Only set blocks if they exist
            if (data.resume?.blocks?.length > 0) {
              const sortedBlocks = [...data.resume.blocks].sort((a, b) => a.order - b.order);
              setCanvasBlocks(sortedBlocks);
            }
          }
        } catch (error) {
          console.error('Error loading resume:', error);
          // Don't redirect or show error to user, just log it
        }
      };

      loadResume();
    }
  }, [status, router]);

  return (
    <main className="flex flex-col md:flex-row gap-4 p-4">
      {/* LEFT COLUMN: library of generic blocks */}
      <div className="w-full md:w-1/4">
        <h2 className="text-xl font-bold mb-2">Block Library</h2>
        <p className="text-sm text-gray-600 mb-3">
          Drag these sections to the canvas. Then fill in details.
        </p>
        {libraryBlocks.map((block) => (
          <DraggableBlock key={block.id} block={block} />
        ))}
      </div>

      {/* MIDDLE COLUMN: Editor canvas (drop zone) */}
      <div className="w-full md:w-1/2">
        <h2 className="text-xl font-bold mb-2">Editor Canvas</h2>
        <EditorCanvas
          blocks={canvasBlocks}
          onDropBlock={handleDropBlock}
          onBlockUpdate={handleBlockUpdate}
        />
      </div>

      {/* RIGHT COLUMN: LaTeX preview + copy button */}
      <div className="w-full md:w-1/4">
        <h2 className="text-xl font-bold mb-2">Preview</h2>
        <MarkdownPreview content={generateLatexDocument()} />
        <Button className="mt-4" onClick={handleCopyLatex}>
          Copy LaTeX
        </Button>
      </div>
    </main>
  )
}
