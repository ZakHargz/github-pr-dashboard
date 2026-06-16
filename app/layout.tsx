import type { Metadata } from 'next'
// import { Inter, Source_Serif_4, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { TooltipProvider } from '@/components/ui/tooltip'

// Fonts disabled for Docker build
const inter = { variable: '' }
const sourceSerif = { variable: '' }
const jetBrainsMono = { variable: '' }

// const inter = Inter({
//   variable: '--font-sans',
//   subsets: ['latin'],
// })
//
// const sourceSerif = Source_Serif_4({
//   variable: '--font-serif',
//   subsets: ['latin'],
// })
//
// const jetBrainsMono = JetBrains_Mono({
//   variable: '--font-mono',
//   subsets: ['latin'],
// })

export const metadata: Metadata = {
  title: 'GitHub PR Dashboard',
  description: 'Track open pull requests across your GitHub repositories',
}

// Runs before React hydrates — prevents flash of wrong theme.
const themeScript = `
  try {
    var t = localStorage.getItem('theme');
    if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  } catch(e) {}
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // suppressHydrationWarning on <html>: the FOUC-prevention script above mutates
  // the class attribute (adds/removes 'dark') before React hydrates. Without this,
  // React 19 sees a className mismatch and aborts hydration for every dark-mode
  // visitor, causing a full-page re-render flash.
  return (
      <html lang="en" suppressHydrationWarning className={`${inter.variable} ${sourceSerif.variable} ${jetBrainsMono.variable} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="h-full bg-background text-foreground">
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  )
}
