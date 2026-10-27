import Link from 'next/link'
import React from 'react'

export type Crumb = { label: string; href?: string }

export function Breadcrumbs({ items, onNavy }: { items: Crumb[]; onNavy?: boolean }) {
  const all: Crumb[] = [{ label: 'Prima pagină', href: '/' }, ...items]
  return (
    <nav className={`crumbs${onNavy ? ' crumbs--on-navy' : ''}`} aria-label="Breadcrumb">
      <ol>
        {all.map((crumb, i) => (
          <li key={`${crumb.label}-${i}`}>
            {crumb.href && i < all.length - 1 ? <Link href={crumb.href}>{crumb.label}</Link> : <span aria-current="page">{crumb.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  )
}

// Breadcrumbs from a nested doc's own trail (pages and categories).
export function trail(doc: { breadcrumbs?: { url?: string | null; label?: string | null }[] | null }, includeSelf = true): Crumb[] {
  const crumbs = (doc.breadcrumbs ?? []).map((b) => ({ label: b.label ?? '', href: b.url ?? undefined }))
  return includeSelf ? crumbs : crumbs.slice(0, -1)
}
