import React from 'react'

import type { Media } from '@/payload-types'

export function Gallery({ images, title }: { images: (number | Media)[] | null | undefined; title?: string | null }) {
  const media = (images ?? []).filter((m): m is Media => typeof m === 'object' && !!m?.url)
  if (!media.length) return null
  return (
    <section className="stack stack--sm" aria-label={title || 'Fotografii'}>
      {title && <h2 className="h3">{title}</h2>}
      <ul className="gallery">
        {media.map((m) => (
          <li key={m.id}>
            <a href={m.url!} target="_blank" rel="noopener noreferrer">
              <img src={m.url!} alt={m.alt ?? ''} loading="lazy" width={m.width ?? undefined} height={m.height ?? undefined} />
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
