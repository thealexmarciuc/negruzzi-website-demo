import React from 'react'

import { docHref, docKind, docSize } from '@/lib/site'
import type { Document } from '@/payload-types'

import { Download, FileIcon } from './icons'

export function KindBadge({ doc }: { doc: Document }) {
  const kind = docKind(doc)
  return <span className={`badge${kind.tone !== 'doc' ? ` badge--${kind.tone}` : ''}`}>{kind.label}</span>
}

export function DocList({ docs }: { docs: Document[] }) {
  if (!docs.length) return null
  return (
    <ul className="list-card">
      {docs.map((doc) => (
        <li key={doc.id}>
          <a className="doc-row" href={docHref(doc)} target="_blank" rel="noopener noreferrer">
            <KindBadge doc={doc} />
            <span className="doc-row__title">{doc.title}</span>
            {docSize(doc) && <span className="doc-row__size">{docSize(doc)}</span>}
            <Download />
          </a>
        </li>
      ))}
    </ul>
  )
}

// The one document a post is about, shown first and, for PDFs, readable in place.
export function PrimaryDoc({ doc, kicker = 'Începe de aici' }: { doc: Document; kicker?: string }) {
  const kind = docKind(doc)
  return (
    <div className="stack stack--sm">
      <a className="primary-doc" href={docHref(doc)} target="_blank" rel="noopener noreferrer">
        <span className="primary-doc__icon">
          <FileIcon />
        </span>
        <span className="primary-doc__text">
          <span className="primary-doc__kicker">{kicker}</span>
          <span className="primary-doc__title">{doc.title}</span>
          <span className="primary-doc__meta">{[kind.label, docSize(doc)].filter(Boolean).join(' · ')}</span>
        </span>
        <span className="primary-doc__action">Deschide</span>
      </a>
      {kind.tone === 'pdf' && <iframe className="doc-viewer" src={`${docHref(doc)}#view=FitH`} title={doc.title} loading="lazy" />}
    </div>
  )
}
