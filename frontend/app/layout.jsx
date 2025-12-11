'use client'

import { usePathname } from 'next/navigation'
import './globals.css'
import Navbar from '../components/Navbar'
import Header from '../components/Header'

export default function RootLayout({ children }) {
  const pathname = usePathname()
  const isAuthPage = pathname?.startsWith('/auth')

  if (isAuthPage) {
    // Auth pages get a clean layout without navbar/header
    return (
      <html lang="en">
        <head>
          <title>Login - AeroIntel</title>
          <meta name="description" content="Sign in to access Aviation Intelligence Platform" />
        </head>
        <body>
          {children}
        </body>
      </html>
    )
  }

  // Regular pages get the full layout
  return (
    <html lang="en">
      <head>
        <title>AeroIntel - Aviation Intelligence Platform</title>
        <meta name="description" content="AI-Driven Market Intelligence Platform for Aviation" />
      </head>
      <body>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Navbar />
          <div style={{ flex: 1, marginLeft: '80px', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <main style={{ flex: 1, overflow: 'auto' }}>
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
