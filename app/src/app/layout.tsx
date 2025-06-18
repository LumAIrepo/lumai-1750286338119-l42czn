import React from "react"
```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { WalletProvider } from '@/components/providers/wallet-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SolanaPredict - DeFi Prediction Markets',
  description: 'Decentralized prediction markets on Solana blockchain',
  keywords: ['solana', 'defi', 'prediction', 'markets', 'blockchain'],
  authors: [{ name: 'SolanaPredict Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'SolanaPredict - DeFi Prediction Markets',
    description: 'Decentralized prediction markets on Solana blockchain',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SolanaPredict - DeFi Prediction Markets',
    description: 'Decentralized prediction markets on Solana blockchain',
  },
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#059669" />
      </head>
      <body className={`${inter.className} min-h-screen bg-slate-50 text-slate-900 antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <WalletProvider>
            <div className="relative flex min-h-screen flex-col">
              <div className="flex-1">
                {children}
              </div>
            </div>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  color: '#0f172a',
                },
              }}
            />
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```