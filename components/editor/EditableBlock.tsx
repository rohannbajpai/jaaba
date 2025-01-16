// components/editor/EditableBlock.tsx
"use client"

import { useDrag, useDrop, DropTargetMonitor } from "react-dnd";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useRef } from "react";
import { ItemTypes } from "@/constants/dndTypes";

export interface EditableBlockData {
  id: string;
  sectionName: string;
  title: string;
  location: string;
  duration: string;
  latexCode?: string;
  // ... other fields
}

interface EditableBlockProps {
  block: EditableBlockData;
  onUpdate: (updated: Partial<EditableBlockData>) => void;
  moveBlock: (draggedId: string, hoveredId: string) => void;
}

export function EditableBlock({ block, onUpdate, moveBlock }: EditableBlockProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [, drop] = useDrop({
    accept: ItemTypes.BLOCK,
    hover(item: EditableBlockData, monitor: DropTargetMonitor) {
      if (!ref.current) {
        return;
      }

      const draggedId = item.id;
      const hoveredId = block.id;

      if (draggedId === hoveredId) {
        return;
      }

      // Get bounding rectangle
      const hoverBoundingRect = ref.current.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Get mouse position
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the item's height
      // Dragging downwards
      if (hoverClientY < hoverMiddleY) {
        moveBlock(draggedId, hoveredId);
        // To prevent multiple calls, you can mutate the dragged item's id locally
        // Note: This is optional and depends on your implementation
        // item.id = hoveredId;
      }
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.BLOCK,
    item: { id: block.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Connect drag and drop refs
  drag(drop(ref));

  const handleFieldChange = (
    field: keyof EditableBlockData,
    value: string | string[]
  ) => {
    onUpdate({ [field]: value });
  };

  return (
    <div
      ref={ref}
      className={`p-4 border rounded-md shadow-md ${
        isDragging ? "opacity-50" : "opacity-100"
      } cursor-move`}
      style={{ backgroundColor: "white" }}
    >
      <div className="text-sm font-medium text-gray-500">
        {block.sectionName}
      </div>

      <div className="space-y-4">
        <div>
          <Label>Title</Label>
          <Input
            value={block.title}
            onChange={(e) => handleFieldChange("title", e.target.value)}
            placeholder={`Enter ${block.sectionName} title`}
          />
        </div>

        <div>
          <Label>Location</Label>
          <Input
            value={block.location}
            onChange={(e) => handleFieldChange("location", e.target.value)}
            placeholder="Enter location"
          />
        </div>

        <div>
          <Label>Duration</Label>
          <Input
            value={block.duration}
            onChange={(e) => handleFieldChange("duration", e.target.value)}
            placeholder="e.g., Jan 2020 - Present"
          />
        </div>
      </div>
    </div>
  );
}
