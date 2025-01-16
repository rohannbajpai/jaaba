"use client"

import { ReactNode } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { SessionProvider } from "next-auth/react"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <DndProvider backend={HTML5Backend}>
        {children}
      </DndProvider>
    </SessionProvider>
  )
}
