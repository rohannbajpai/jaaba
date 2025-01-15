"use client"

import { useState } from "react"
import { DraggableBlock } from "@/components/editor/DraggableBlock"
import { EditorCanvas } from "@/components/editor/EditorCanvas"
import { LatexPreview } from "@/components/preview/LatexPreview"
import { Button } from "@/components/ui/button"
import { defaultLatexPreamble, wrapJakeTemplate } from "@/lib/latexTemplate"
import { EditableBlockData } from "@/components/editor/EditableBlock"

// Our "library" blocks are all *generic*—no prefilled details.
const libraryBlocks: EditableBlockData[] = [
  { id: "header", sectionName: "Header", title: "", location: "", duration: "", description: "" },
  { id: "education", sectionName: "Education", title: "", location: "", duration: "", description: "" },
  { id: "experience", sectionName: "Experience", title: "", location: "", duration: "", description: "" },
  { id: "projects", sectionName: "Projects", title: "", location: "", duration: "", description: "" },
  { id: "skills", sectionName: "Technical Skills", title: "", location: "", duration: "", description: "" },
]

export default function Home() {
  // The user’s “canvas” blocks, in the order dropped
  const [canvasBlocks, setCanvasBlocks] = useState<EditableBlockData[]>([])

  // Called when a block is dropped onto the canvas
  const handleDropBlock = (block: EditableBlockData) => {
    // Duplicate the block so each drop is independent 
    // (so user can add multiple "Experience" sections, etc.)
    const uniqueId = `${block.sectionName}-${Date.now()}`
    const newBlock: EditableBlockData = { 
      ...block, 
      id: uniqueId 
    }
    setCanvasBlocks((prev) => [...prev, newBlock])
  }

  // Called when the user edits a block’s fields
  const handleBlockUpdate = (id: string, updated: Partial<EditableBlockData>) => {
    setCanvasBlocks((prev) =>
      prev.map((block) => (block.id === id ? { ...block, ...updated } : block))
    )
  }

  // Convert the user’s blocks into a valid LaTeX doc
  const generateLatexDocument = () => {
    return wrapJakeTemplate(canvasBlocks)
  }

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
        <LatexPreview content={generateLatexDocument()} />
        <Button className="mt-4" onClick={handleCopyLatex}>
          Copy LaTeX
        </Button>
      </div>
    </main>
  )
}
