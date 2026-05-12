import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Kiddo — From what kids do, to what kids can do',
  description: "Track your child's daily activities, discover their strengths, and find their Ikigai.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
