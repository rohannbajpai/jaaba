// components/editor/DraggableBlock.tsx
"use client";

import { useDrag } from "react-dnd";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EditableBlockData } from "./EditableBlock";
import React, { useRef, useEffect } from "react";
import { ItemTypes } from "@/constants/dndTypes";

interface DraggableBlockProps {
  block: EditableBlockData;
}

export function DraggableBlock({ block }: DraggableBlockProps) {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: ItemTypes.BLOCK,
    item: { ...block }, // Pass the entire block data
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      dragRef(cardRef.current);
    }
  }, [dragRef]);

  return (
    <Card
      ref={cardRef}
      className={`mb-2 cursor-grab transition-opacity border ${
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
  );
}
