import Link from 'next/link'
import React from 'react'

import { Breadcrumbs, trail } from '@/components/Breadcrumbs'
import { DocList, PrimaryDoc } from '@/components/Documents'
import { Gallery } from '@/components/Gallery'
import { RichText } from '@/components/RichText'
import { articlePath, asDocs, countDocs, docPath, findArticles, formatDate, getCategories, getSettings } from '@/lib/site'
import type { Article, Category } from '@/payload-types'

export async function ArticleView({ article }: { article: Article }) {
  const [categories, settings] = await Promise.all([getCategories(), getSettings()])
  const category = article.category as Category
  const embedded = typeof article.embeddedDocument === 'object' ? article.embeddedDocument : null
  const docCount = countDocs(article)
  // Imported posts have no separate intro; their body already starts with it.
  const intro = article.excerpt
  const { docs: related } = await findArticles({ categoryIds: [category.id], where: { id: { not_equals: article.id } }, limit: 4 })
  const { contact } = settings

  return (
    <>
      <section className="page-head">
        <div className="wrap" style={{ paddingTop: 40, paddingBottom: 48, gap: 18 }}>
          <Breadcrumbs items={trail(category)} />
          <div className="meta-row">
            <Link className="pill" href={docPath(category)}>
              {category.title}
            </Link>
            <span>Publicat pe {formatDate(article.publishedAt)}</span>
            {docCount > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span>{docCount === 1 ? '1 document atașat' : `${docCount} documente atașate`}</span>
              </>
            )}
          </div>
          <h1 className="h1" style={{ maxWidth: 900 }}>
            {article.title}
          </h1>
          {intro && <p className="lead">{intro}</p>}
        </div>
      </section>

      <div className="wrap with-sidebar">
        <article className="stack" style={{ gap: 40 }}>
          {embedded && <PrimaryDoc doc={embedded} />}
          <RichText data={article.content} categories={categories} />
          {(article.attachmentGroups ?? []).map((group) => (
            <section key={group.id} className="stack stack--sm">
              <h2 className="h3">{group.title || 'Documente atașate'}</h2>
              <DocList docs={asDocs(group.documents)} />
            </section>
          ))}
          <Gallery images={article.gallery} title="Fotografii" />
          <div className="article-foot">
            <span className="small muted">Ultima actualizare: {formatDate(article.updatedAt)}</span>
          </div>
        </article>

        <aside className="stack stack--sm" style={{ gap: 24 }}>
          {contact && (
            <div className="panel">
              <h2 className="h3">Ai întrebări?</h2>
              <p className="muted" style={{ margin: 0, fontSize: 15 }}>
                Secretariatul te ajută.
              </p>
              {contact.phone && (
                <a href={`tel:${contact.phone.replace(/\s/g, '')}`} style={{ fontWeight: 600 }}>
                  {contact.phone}
                </a>
              )}
              {contact.email && (
                <a href={`mailto:${contact.email}`} style={{ fontWeight: 600 }}>
                  {contact.email}
                </a>
              )}
              {contact.hours && (
                <span className="small muted" style={{ whiteSpace: 'pre-line' }}>
                  Program: {contact.hours}
                </span>
              )}
            </div>
          )}
          {related.length > 0 && (
            <div className="card" style={{ padding: '8px 0' }}>
              <h2 className="eyebrow eyebrow--muted" style={{ padding: '18px 24px 8px' }}>
                Tot în {category.title}
              </h2>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {related.map((r) => (
                  <li key={r.id} style={{ borderTop: '1px solid var(--line-soft)' }}>
                    <Link
                      href={articlePath(r, categories)}
                      style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '12px 24px', textDecoration: 'none', color: 'var(--ink)' }}
                    >
                      <span style={{ fontWeight: 500, lineHeight: 1.4 }}>{r.title}</span>
                      <span className="small muted">{formatDate(r.publishedAt)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </>
  )
}
