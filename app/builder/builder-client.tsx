"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { DraggableBlock } from "@/components/editor/DraggableBlock"
import { EditorCanvas } from "@/components/editor/EditorCanvas"
import { MarkdownPreview } from "@/components/preview/MarkdownPreview"
import { Button } from "@/components/ui/button"
import { wrapJakeTemplate } from "@/lib/latexTemplate"
import { EditableBlockData } from "@/components/editor/EditableBlock"
import debounce from "lodash/debounce"
import { v4 as uuidv4 } from 'uuid'

const libraryBlocks: EditableBlockData[] = [
  { id: "header-template", sectionName: "Header", title: "", location: "", duration: ""},
  { id: "education-template", sectionName: "Education", title: "", location: "", duration: ""},
  { id: "experience-template", sectionName: "Experience", title: "", location: "", duration: ""},
  { id: "projects-template", sectionName: "Projects", title: "", location: "", duration: ""},
  { id: "skills-template", sectionName: "Technical Skills", title: "", location: "", duration: ""},
]

export default function BuilderClient() {
  const [canvasBlocks, setCanvasBlocks] = useState<EditableBlockData[]>([])

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

  const handleDropBlock = (block: EditableBlockData) => {
    const newBlock = {
      ...block,
      id: `${block.sectionName.toLowerCase()}-${uuidv4()}`,
    }
    const updatedBlocks = [...canvasBlocks, newBlock]
    setCanvasBlocks(updatedBlocks)
    debouncedSaveHandler(updatedBlocks)
  }

  const handleBlockUpdate = (id: string, updated: Partial<EditableBlockData>) => {
    const updatedBlocks = canvasBlocks.map((block) => {
      if (block.id === id) {
        const updatedBlock = { ...block, ...updated };
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

  const generateLatexDocument = () => {
    const formattedBlocks = canvasBlocks.map(block => {
      const baseBlock = {
        ...block,
        degree: block.title,
        role: block.title,
        projectName: block.title,
        bullets: [],
        languages: block.title,
        other: block.location,
      };

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

  useEffect(() => {
    const loadResume = async () => {
      try {
        const response = await fetch('/api/resumes');
        if (response.ok) {
          const data = await response.json();
          if (data.resume?.blocks?.length > 0) {
            const sortedBlocks = [...data.resume.blocks].sort((a, b) => a.order - b.order);
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
      <div className="w-full md:w-1/4">
        <h2 className="text-xl font-bold mb-2">Block Library</h2>
        <p className="text-sm text-gray-600 mb-3">
          Drag these sections to the canvas. Then fill in details.
        </p>
        {libraryBlocks.map((block) => (
          <DraggableBlock key={block.id} block={block} />
        ))}
      </div>

      <div className="w-full md:w-1/2">
        <h2 className="text-xl font-bold mb-2">Editor Canvas</h2>
        <EditorCanvas
          blocks={canvasBlocks}
          onDropBlock={handleDropBlock}
          onBlockUpdate={handleBlockUpdate}
        />
      </div>

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