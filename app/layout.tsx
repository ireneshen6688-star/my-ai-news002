import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'My AI News — Personalized News, Your Way',
  description: 'Get AI-curated news tailored to your interests, delivered on your schedule.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
