import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthListener } from '@/components/auth-listener'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'SkyMaker EDU | Drone Programming Platform',
  description: 'The premier educational platform for drone coding and robotics.',
  generator: 'VhimLabs',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthListener />
          {children}
          <Toaster position="top-center" richColors />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
