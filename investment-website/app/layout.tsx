import type { Metadata } from 'next'
import './globals.css'
import { ReduxProvider } from '../components/ReduxProvider'

export const metadata: Metadata = {
  title: 'WealthFlow Premier',
  description: 'Experience the next evolution of asset management. Automated strategies, real-time analytics, and guaranteed returns designed for the modern investor.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white antialiased">
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  )
}
