import Link from 'next/link'
import React from 'react'

import { Breadcrumbs, trail } from '@/components/Breadcrumbs'
import { ArrowRight, FileIcon } from '@/components/icons'
import {
  articlePath,
  categoryTree,
  countDocs,
  docPath,
  excerptOf,
  findArticles,
  formatDate,
  getCategories,
  imageOf,
} from '@/lib/site'
import type { Category } from '@/payload-types'
import type { Where } from 'payload'

const PER_PAGE = 18

export type ListingParams = { pagina?: string; q?: string; an?: string }

function pageList(current: number, total: number) {
  const pages = new Set([1, total, current - 1, current, current + 1].filter((p) => p >= 1 && p <= total))
  const sorted = [...pages].sort((a, b) => a - b)
  const out: (number | 'gap')[] = []
  sorted.forEach((p, i) => {
    if (i && p - sorted[i - 1] > 1) out.push('gap')
    out.push(p)
  })
  return out
}

export async function ListingView({ category, params }: { category: Category; params: ListingParams }) {
  const categories = await getCategories()
  const ids = categoryTree(category.id, categories)
  const page = Math.max(1, Number(params.pagina) || 1)
  const q = params.q?.trim() ?? ''
  const year = /^\d{4}$/.test(params.an ?? '') ? Number(params.an) : null
  const filters: Where[] = []
  if (q) filters.push({ title: { like: q } })
  if (year) filters.push({ publishedAt: { greater_than_equal: `${year}-01-01` } }, { publishedAt: { less_than: `${year + 1}-01-01` } })
  const result = await findArticles({ categoryIds: ids, where: filters.length ? { and: filters } : undefined, limit: PER_PAGE, page })
  const filtered = !!(q || year)

  // Sibling categories (and this one) as chips, so readers can hop between kinds of news.
  const parentId = typeof category.parent === 'object' ? category.parent?.id : category.parent
  const siblings = categories.filter((c) => (typeof c.parent === 'object' ? c.parent?.id : c.parent) === (parentId ?? undefined) && (parentId || c.id === category.id))
  const children = categories.filter((c) => (typeof c.parent === 'object' ? c.parent?.id : c.parent) === category.id)
  const chips = children.length ? [category, ...children] : siblings

  const featured = page === 1 && !filtered ? result.docs.find((a) => imageOf(a)) : undefined
  const rest = result.docs.filter((a) => a !== featured)
  const years = Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - i)
  const query = (p: number) => {
    const s = new URLSearchParams()
    if (q) s.set('q', q)
    if (year) s.set('an', String(year))
    if (p > 1) s.set('pagina', String(p))
    const str = s.toString()
    return `${docPath(category)}${str ? `?${str}` : ''}`
  }

  return (
    <>
      <section className="page-head">
        <div className="wrap" style={{ paddingBottom: 28 }}>
          <Breadcrumbs items={trail(category)} />
          <div>
            <h1 className="h1">{category.title}</h1>
            <p className="muted" style={{ margin: '8px 0 0' }}>
              {filtered
                ? `${result.totalDocs} ${result.totalDocs === 1 ? 'rezultat' : 'rezultate'} pentru filtrele alese.`
                : `${result.totalDocs} ${result.totalDocs === 1 ? 'articol' : 'de articole'}, cele mai noi primele.`}
            </p>
          </div>
          {chips.length > 1 && (
            <ul className="chips" aria-label="Categorii" style={{ marginTop: 6 }}>
              {chips.map((c) => (
                <li key={c.id}>
                  <Link className="chip" href={docPath(c)} aria-current={c.id === category.id ? 'page' : undefined}>
                    {c.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <div className="wrap" style={{ paddingTop: 24 }}>
        <form className="card filters" role="search" action={docPath(category)}>
          <div className="field" style={{ flex: '1 1 320px' }}>
            <label htmlFor="q">Caută în {category.title}</label>
            <input className="input" id="q" name="q" type="search" defaultValue={q} placeholder="ex. burse, olimpiada, rezultate" />
          </div>
          <div className="field" style={{ flex: '0 1 180px' }}>
            <label htmlFor="an">An</label>
            <select className="input" id="an" name="an" defaultValue={year ?? ''}>
              <option value="">Toți anii</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <button className="button" type="submit">
            Filtrează
          </button>
          {filtered && (
            <Link className="button button--outline" href={docPath(category)}>
              Șterge filtrele
            </Link>
          )}
        </form>
      </div>

      <div className="wrap stack" style={{ paddingTop: 28, paddingBottom: 72, gap: 24 }}>
        {featured && (
          <Link className="card wide-feature" href={articlePath(featured, categories)}>
            <img src={imageOf(featured)!.url!} alt="" loading="lazy" />
            <span className="wide-feature__body">
              <span className="meta-row" style={{ fontSize: 13 }}>
                <span className="pill">Cel mai nou</span>
                <span>{formatDate(featured.publishedAt)}</span>
              </span>
              <span className="feature__title" style={{ fontSize: 32 }}>
                {featured.title}
              </span>
              <span className="muted">{excerptOf(featured, 200)}</span>
              <span className="arrow-link">
                Citește <ArrowRight />
              </span>
            </span>
          </Link>
        )}

        {rest.length ? (
          <div className="grid grid--wide">
            {rest.map((a) => {
              const docs = countDocs(a)
              const cat = categories.find((c) => c.id === (typeof a.category === 'object' ? a.category.id : a.category))
              return (
                <Link key={a.id} className="card card-link news-card" href={articlePath(a, categories)}>
                  <span className="news-card__top">
                    <span>{formatDate(a.publishedAt)}</span>
                    {docs > 0 && (
                      <span className="docs-tag">
                        <FileIcon size={13} />
                        {docs} doc.
                      </span>
                    )}
                  </span>
                  <span className="news-card__title">{a.title}</span>
                  {cat && <span className="news-card__cat">{cat.title}</span>}
                </Link>
              )
            })}
          </div>
        ) : (
          !featured && <p className="card empty">Nu am găsit niciun articol. Încearcă alt cuvânt sau alt an.</p>
        )}

        {result.totalPages > 1 && (
          <nav aria-label="Paginare">
            <ul className="pagination">
              {result.hasPrevPage && (
                <li>
                  <Link href={query(page - 1)} aria-label="Pagina anterioară">
                    ‹
                  </Link>
                </li>
              )}
              {pageList(page, result.totalPages).map((p, i) =>
                p === 'gap' ? (
                  <li key={`gap-${i}`}>
                    <span className="gap">…</span>
                  </li>
                ) : (
                  <li key={p}>
                    <Link href={query(p)} aria-current={p === page ? 'page' : undefined}>
                      {p}
                    </Link>
                  </li>
                ),
              )}
              {result.hasNextPage && (
                <li>
                  <Link href={query(page + 1)} aria-label="Pagina următoare">
                    ›
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        )}
      </div>
    </>
  )
}
