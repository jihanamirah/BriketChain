import type { Metadata, Viewport } from 'next'
import { Poppins, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import './globals.css'

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins'
})

const geistMono = Geist_Mono({ 
  subsets: ['latin'],
  variable: '--font-geist-mono'
})

export const metadata: Metadata = {
  title: 'BricketChain - Shell to Global',
  description: 'Sistem Traceability Digital untuk Briket Tempurung Kelapa - Transparansi penuh dari petani hingga konsumen global',
  keywords: ['briket', 'tempurung kelapa', 'traceability', 'ekspor', 'IoT', 'digital twin'],
  authors: [{ name: 'BricketChain' }],
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
    ],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2d7a4f',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className="bg-background">
      <body className={`${poppins.variable} ${geistMono.variable} font-sans antialiased min-h-screen`}>
        {children}
        <Toaster 
          position="bottom-center" 
          toastOptions={{
            className: 'bg-foreground text-background',
            duration: 2800,
          }}
        />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
