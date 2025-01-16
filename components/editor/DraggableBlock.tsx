"use client"

import { useDrag } from "react-dnd"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { EditableBlockData } from "./EditableBlock"
import { useRef, useEffect } from "react"

interface DraggableBlockProps {
  block: EditableBlockData
}

export function DraggableBlock({ block }: DraggableBlockProps) {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: "BLOCK",
    item: {
      ...block,
      id: `${block.sectionName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (cardRef.current) {
      dragRef(cardRef.current)
    }
  }, [dragRef])

  return (
    <Card
      ref={cardRef}
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
