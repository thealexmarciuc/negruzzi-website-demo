import Link from 'next/link'
import React from 'react'

import { articlePath, asDocs, categoryTree, findArticles, formatDate, linkProps, payload } from '@/lib/site'
import type { Category, Media, Page } from '@/payload-types'

import { DocList, PrimaryDoc } from './Documents'
import { Gallery } from './Gallery'
import { RichText } from './RichText'

type Block = NonNullable<Page['layout']>[number]
type Of<T extends Block['blockType']> = Extract<Block, { blockType: T }>

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

async function DocumentListBlock({ block }: { block: Of<'documentList'> }) {
  let docs = asDocs(block.documents)
  if (block.mode === 'library' && block.docTypes?.length) {
    const found = await (await payload()).find({
      collection: 'documents',
      where: { docType: { in: block.docTypes } },
      sort: '-createdAt',
      limit: 50,
      depth: 0,
      overrideAccess: false,
    })
    docs = found.docs
  }
  if (!docs.length) return null
  return (
    <section className="stack stack--sm">
      {block.title && <h2 className="h3">{block.title}</h2>}
      <DocList docs={docs} />
    </section>
  )
}

async function PeopleBlock({ block }: { block: Of<'people'> }) {
  const { docs } = await (await payload()).find({
    collection: 'people',
    where: { groups: { contains: block.group } },
    sort: 'order',
    limit: 200,
    depth: 1,
    overrideAccess: false,
  })
  if (!docs.length) return null
  return (
    <section className="stack stack--sm">
      {block.title && <h2 className="h3">{block.title}</h2>}
      <ul className="people grid">
        {docs.map((p) => {
          const photo = typeof p.photo === 'object' ? (p.photo as Media | null) : null
          return (
            <li key={p.id} className="card person">
              <span className="person__avatar" aria-hidden="true">
                {photo?.url ? <img src={photo.url} alt="" /> : initials(p.name)}
              </span>
              <span>
                <strong style={{ display: 'block', fontWeight: 600 }}>{p.name}</strong>
                {(p.role || p.years) && <span className="small muted">{[p.role, p.years].filter(Boolean).join(' · ')}</span>}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

async function ArticleFeedBlock({ block, categories }: { block: Of<'articleFeed'>; categories: Category[] }) {
  const categoryId = typeof block.category === 'object' ? block.category?.id : block.category
  const { docs } = await findArticles({ categoryIds: categoryId ? categoryTree(categoryId, categories) : undefined, limit: block.limit ?? 6 })
  if (!docs.length) return null
  return (
    <section className="stack stack--sm">
      {block.title && <h2 className="h3">{block.title}</h2>}
      <ul className="list-card">
        {docs.map((a) => (
          <li key={a.id}>
            <Link className="list-card__row" href={articlePath(a, categories)}>
              <span style={{ fontWeight: 500 }}>{a.title}</span>
              <span className="small muted">{formatDate(a.publishedAt)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function Blocks({ blocks, categories }: { blocks: Page['layout']; categories: Category[] }) {
  return (
    <>
      {(blocks ?? []).map((block) => {
        const key = block.id ?? `${block.blockType}-${Math.random()}`
        switch (block.blockType) {
          case 'richText':
            return <RichText key={key} data={block.content} categories={categories} />
          case 'embeddedDocument':
            return typeof block.document === 'object' ? (
              <PrimaryDoc key={key} doc={block.document} kicker={block.title || 'Document'} />
            ) : null
          case 'documentList':
            return <DocumentListBlock key={key} block={block} />
          case 'gallery':
            return <Gallery key={key} images={block.images} title={block.title} />
          case 'people':
            return <PeopleBlock key={key} block={block} />
          case 'articleFeed':
            return <ArticleFeedBlock key={key} block={block} categories={categories} />
          case 'cards':
            return (
              <section key={key} className="stack stack--sm">
                {block.title && <h2 className="h3">{block.title}</h2>}
                <div className="grid">
                  {(block.items ?? []).map((item) => (
                    <Link key={item.id} className="card card-link" {...linkProps(item.link, categories)}>
                      <span className="card-link__title">{item.title}</span>
                      {item.text && <span className="small muted">{item.text}</span>}
                    </Link>
                  ))}
                </div>
              </section>
            )
          case 'timeline':
            return (
              <section key={key} className="stack stack--sm">
                {block.title && <h2 className="h3">{block.title}</h2>}
                <ol className="timeline">
                  {(block.items ?? []).map((item) => (
                    <li key={item.id}>
                      <span className="timeline__year">{item.year}</span>
                      <span>
                        <strong style={{ display: 'block', color: 'var(--ink)' }}>{item.title}</strong>
                        {item.text}
                      </span>
                    </li>
                  ))}
                </ol>
              </section>
            )
          case 'stats':
            return (
              <div key={key} className="stats">
                {(block.items ?? []).map((item) => (
                  <div key={item.id} className="card stat">
                    <strong>{item.value}</strong>
                    <span className="small muted">{item.label}</span>
                  </div>
                ))}
              </div>
            )
          case 'callout':
            return (
              <aside key={key} className="panel">
                <h2 className="h3">{block.title}</h2>
                {block.text && (
                  <p className="muted" style={{ margin: 0 }}>
                    {block.text}
                  </p>
                )}
                {block.link && linkProps(block.link, categories).href !== '#' && (
                  <Link className="arrow-link" {...linkProps(block.link, categories)}>
                    Mai multe
                  </Link>
                )}
              </aside>
            )
          default:
            return null
        }
      })}
    </>
  )
}
