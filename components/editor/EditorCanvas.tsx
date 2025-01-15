"use client"

import { useDrop } from "react-dnd"
import { EditableBlock, EditableBlockData } from "./EditableBlock"
import { Card } from "@/components/ui/card"

interface EditorCanvasProps {
  blocks: EditableBlockData[]
  onDropBlock: (block: EditableBlockData) => void
  onBlockUpdate: (id: string, updated: Partial<EditableBlockData>) => void
}

export function EditorCanvas({
  blocks,
  onDropBlock,
  onBlockUpdate,
}: EditorCanvasProps) {
  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: "RESUME_BLOCK",
    drop: (item: EditableBlockData, monitor) => {
      if (!monitor.didDrop()) {
        onDropBlock(item)
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }))

  return (
    <div
      ref={dropRef}
      className={`border-2 border-dashed p-4 min-h-[400px] ${
        isOver ? "bg-blue-50" : ""
      }`}
    >
      {blocks.length === 0 && (
        <p className="text-gray-400">
          Drag a block here to start building your résumé
        </p>
      )}

      {blocks.map((block) => (
        <Card key={block.id} className="mb-4 p-2 border relative bg-white">
          <div className="text-xs uppercase text-gray-500">{block.sectionName}</div>
          <EditableBlock block={block} onChange={onBlockUpdate} />
        </Card>
      ))}
    </div>
  )
}
