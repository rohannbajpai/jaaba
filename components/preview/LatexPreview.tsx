"use client"

import Latex from "react-latex"
import "katex/dist/katex.min.css"

interface LatexPreviewProps {
  content: string
}

export function LatexPreview({ content }: LatexPreviewProps) {
  return (
    <div className="border p-4 bg-gray-50 max-h-[70vh] overflow-auto text-sm">
      <Latex>{content}</Latex>
    </div>
  )
}
