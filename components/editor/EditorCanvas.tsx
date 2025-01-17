// components/editor/EditorCanvas.tsx
import { useDrop } from "react-dnd";
import { EditableBlock, EditableBlockData } from "./EditableBlock";
import React, { Ref } from "react";
import { ItemTypes } from "@/constants/dndTypes";

interface EditorCanvasProps {
  blocks: EditableBlockData[];
  onDropBlock: (block: EditableBlockData) => void;
  onBlockUpdate: (id: string, updated: Partial<EditableBlockData>) => void;
  moveBlock: (draggedId: string, hoveredId: string) => void;
  onDelete: (id: string) => void;
}

export function EditorCanvas({
  blocks,
  onDropBlock,
  onBlockUpdate,
  moveBlock,
  onDelete,
}: EditorCanvasProps) {
  const [{ isOver }, dropRef] = useDrop({
    accept: ItemTypes.BLOCK,
    drop: (item: EditableBlockData) => {
      // If the dropped block is not already in the canvas, add it
      const existingBlock = blocks.find((block) => block._id === item._id);
      if (!existingBlock) {
        onDropBlock(item);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={dropRef as unknown as Ref<HTMLDivElement>}
      className={`min-h-[400px] p-4 border-2 border-dashed rounded-lg ${
        isOver ? "border-primary bg-primary/5" : "border-gray-200"
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
              key={block._id || block.id}
              block={block}
              onUpdate={onBlockUpdate}
              moveBlock={moveBlock}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
