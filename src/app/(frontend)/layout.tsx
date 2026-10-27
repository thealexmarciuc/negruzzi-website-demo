import type { Metadata } from 'next'
import { IBM_Plex_Sans, Literata } from 'next/font/google'
import React from 'react'

import { A11Y_BOOT } from '@/lib/a11y'

import './styles.css'

const serif = Literata({ subsets: ['latin', 'latin-ext'], variable: '--font-serif', display: 'swap' })
const sans = IBM_Plex_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Colegiul Național „Costache Negruzzi” Iași',
  description: 'Propunere de redesign pentru site-ul Colegiului Național „Costache Negruzzi” Iași (demo).',
  robots: { index: false, follow: false },
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="ro" className={`${serif.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        {/* Applies saved accessibility settings before the first paint. */}
        <script dangerouslySetInnerHTML={{ __html: A11Y_BOOT }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
