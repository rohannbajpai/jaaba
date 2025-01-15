// components/editor/BlockRenderer.tsx
"use client"

import {
  HeaderBlock,
  HeaderBlockData,
} from "@/components/editor/HeaderBlock"
import {
  EducationBlock,
  EducationBlockData,
} from "@/components/editor/EducationBlock"
import {
  ExperienceBlock,
  ExperienceBlockData,
} from "@/components/editor/ExperienceBlock"
// ... or other specialized blocks

export type AnyBlockData = 
  | HeaderBlockData
  | EducationBlockData
  | ExperienceBlockData
  // etc...

interface BlockRendererProps {
  block: AnyBlockData
  onChange: (id: string, updated: Partial<AnyBlockData>) => void
}

export function BlockRenderer({ block, onChange }: BlockRendererProps) {
  const sectionName = block.sectionName.toLowerCase()

  switch (sectionName) {
    case "header":
      return (
        <HeaderBlock
          block={block as HeaderBlockData}
          onChange={onChange}
        />
      )
    case "education":
      return (
        <EducationBlock
          block={block as EducationBlockData}
          onChange={onChange}
        />
      )
    case "experience":
      return (
        <ExperienceBlock
          block={block as ExperienceBlockData}
          onChange={onChange}
        />
      )
    default:
      // fallback: generic block or you can handle other sections
      return <div>Unknown Section: {block.sectionName}</div>
  }
}
