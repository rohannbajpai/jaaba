"use client"

import { useDrop } from "react-dnd"
import { EditableBlock, EditableBlockData } from "./EditableBlock"

interface EditorCanvasProps {
  blocks: EditableBlockData[]
  onDropBlock: (block: EditableBlockData) => void
  onBlockUpdate: (id: string, updated: Partial<EditableBlockData>) => void
}

export function EditorCanvas({ blocks, onDropBlock, onBlockUpdate }: EditorCanvasProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'BLOCK',
    drop: (item: EditableBlockData) => {
      onDropBlock(item)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [onDropBlock])

  return (
    <div
      ref={drop}
      className={`min-h-[400px] p-4 border-2 border-dashed rounded-lg ${
        isOver ? 'border-primary bg-primary/5' : 'border-gray-200'
      }`}
    >
      {blocks.length === 0 ? (
        <div className="h-full flex items-center justify-center text-gray-500">
          Drop blocks here to build your resume
        </div>
      ) : (
        <div className="space-y-4">
          {blocks.map((block) => (
            <EditableBlock
              key={block.id}
              block={block}
              onUpdate={(updated) => onBlockUpdate(block.id, updated)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
