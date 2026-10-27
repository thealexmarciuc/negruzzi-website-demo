import React from 'react'

import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#continut">
        Sari la conținut
      </a>
      <SiteHeader />
      <main id="continut">{children}</main>
      <SiteFooter />
    </>
  )
}
