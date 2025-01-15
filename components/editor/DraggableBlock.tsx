"use client"

import { useDrag } from "react-dnd"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { EditableBlockData } from "./EditableBlock"

interface DraggableBlockProps {
  block: EditableBlockData
}

export function DraggableBlock({ block }: DraggableBlockProps) {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: "RESUME_BLOCK",
    item: block,  // We'll clone it on drop
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  return (
    <Card
      ref={dragRef}
      className={`mb-2 cursor-move transition-opacity border ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      <CardHeader>
        <CardTitle>{block.sectionName}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">
          Drag to add a {block.sectionName} section
        </p>
      </CardContent>
    </Card>
  )
}
