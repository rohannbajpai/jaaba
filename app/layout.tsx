import './globals.css'
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import Providers from "./providers"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LaTeX Resume Builder',
  description: 'Build your LaTeX resume with a drag-and-drop interface',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
