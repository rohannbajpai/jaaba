import './globals.css'
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import { Providers } from "./providers"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Drag & Drop LaTeX Resume Editor',
  description: 'A minimal DnD + LaTeX editor in Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
