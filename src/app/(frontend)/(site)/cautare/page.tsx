import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Download } from '@/components/icons'
import { PER_PAGE, SEARCH_SECTIONS, SEARCH_TYPES, type SearchType, searchSite } from '@/lib/search'
import { formatDate } from '@/lib/site'

export const metadata: Metadata = { title: 'Căutare · Colegiul Național „Costache Negruzzi” Iași' }

type Params = { q?: string; tip?: string; sectiune?: string; an?: string; pagina?: string }

const plural = (n: number, one: string, many: string) => (n === 1 ? `1 ${one}` : `${n} ${n >= 20 ? 'de ' : ''}${many}`)

export default async function SearchPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams
  const q = (params.q ?? '').trim().slice(0, 120)
  const type = (SEARCH_TYPES.some((t) => t.value === params.tip) ? params.tip : '') as SearchType | ''
  const section = SEARCH_SECTIONS.some((s) => s.value === params.sectiune) ? params.sectiune! : ''
  const year = /^\d{4}$/.test(params.an ?? '') ? Number(params.an) : null
  const page = Math.max(1, Number(params.pagina) || 1)
  const result = await searchSite({ q, type, section, year, page })
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i)

  const link = (changes: Partial<Params>) => {
    const s = new URLSearchParams()
    const next = { q, tip: type, sectiune: section, an: year ? String(year) : '', pagina: '', ...changes }
    for (const [k, v] of Object.entries(next)) if (v) s.set(k, v)
    return `/cautare?${s.toString()}`
  }
  const articlePages = Math.ceil(result.counts.articole / PER_PAGE)
  const showPager = (!type || type === 'articole') && articlePages > 1

  return (
    <>
      <section className="page-head">
        <div className="wrap" style={{ paddingTop: 36, paddingBottom: 32 }}>
          <Breadcrumbs items={[{ label: 'Căutare' }]} />
          <h1 className="h1">Căutare</h1>
          <form className="search-form" action="/cautare" role="search" style={{ maxWidth: 760 }}>
            <label className="sr-only" htmlFor="search-q">
              Caută pe site
            </label>
            <input className="input" id="search-q" name="q" type="search" defaultValue={q} placeholder="De exemplu: orar, burse, admitere" autoFocus={!q} />
            {type && <input type="hidden" name="tip" value={type} />}
            {section && <input type="hidden" name="sectiune" value={section} />}
            <button className="button" type="submit">
              Caută
            </button>
          </form>
          {q && (
            <p className="muted" style={{ margin: 0 }} role="status">
              {result.terms.length ? (
                <>
                  <strong style={{ color: 'var(--ink)' }}>{plural(result.total, 'rezultat', 'rezultate')}</strong> pentru „{q}”
                </>
              ) : (
                'Scrie cel puțin două litere.'
              )}
            </p>
          )}
        </div>
      </section>

      {q && result.terms.length > 0 && (
        <div className="wrap with-sidebar with-sidebar--nav">
          <form className="card filters filters--stack" action="/cautare" aria-label="Filtre">
            <input type="hidden" name="q" value={q} />
            <fieldset className="fieldset">
              <legend>Tip de conținut</legend>
              <label className="option">
                <input type="radio" name="tip" value="" defaultChecked={!type} /> Toate
              </label>
              {SEARCH_TYPES.map((t) => (
                <label key={t.value} className="option">
                  <input type="radio" name="tip" value={t.value} defaultChecked={type === t.value} /> {t.label}
                  <span className="option__count">{result.counts[t.value]}</span>
                </label>
              ))}
            </fieldset>
            <fieldset className="fieldset">
              <legend>Secțiune</legend>
              <label className="option">
                <input type="radio" name="sectiune" value="" defaultChecked={!section} /> Toate
              </label>
              {SEARCH_SECTIONS.map((s) => (
                <label key={s.value} className="option">
                  <input type="radio" name="sectiune" value={s.value} defaultChecked={section === s.value} /> {s.label}
                </label>
              ))}
            </fieldset>
            <div className="field">
              <label htmlFor="search-an">Anul publicării</label>
              <select className="input" id="search-an" name="an" defaultValue={year ?? ''}>
                <option value="">Toți anii</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <button className="button" type="submit">
              Aplică filtrele
            </button>
          </form>

          <div className="stack" style={{ gap: 28 }}>
            {result.hits.length > 0 && (
              <ol className="results">
                {result.hits.map((hit) => (
                  <li key={`${hit.href}-${hit.id}`}>
                    <Link className="card result" href={hit.href}>
                      <span className="small muted">{hit.crumb}</span>
                      <span className="result__title">{hit.title}</span>
                      {hit.snippet && (
                        <span className="result__snippet">
                          {hit.snippet.pre}
                          <mark>{hit.snippet.hit}</mark>
                          {hit.snippet.post}
                        </span>
                      )}
                      <span className="small muted">{hit.date ? `Anunț · ${formatDate(hit.date)}` : 'Pagină'}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}

            {result.docs.length > 0 && (
              <section className="stack stack--sm">
                <h2 className="h3">Documente care conțin „{q}”</h2>
                <ul className="list-card">
                  {(type === 'documente' ? result.docs : result.docs.slice(0, 8)).map((d) => (
                    <li key={d.id}>
                      <a className="doc-row" href={d.href} target="_blank" rel="noopener noreferrer">
                        <span className="doc-row__title">{d.title}</span>
                        <Download />
                      </a>
                    </li>
                  ))}
                  {!type && result.docs.length > 8 && (
                    <li className="list-card__foot">
                      <Link className="arrow-link" href={link({ tip: 'documente' })}>
                        Toate cele {result.docs.length} de documente
                      </Link>
                    </li>
                  )}
                </ul>
              </section>
            )}

            {result.total === 0 && (
              <div className="card empty stack stack--sm">
                <p style={{ margin: 0, fontWeight: 600, color: 'var(--ink)' }}>Nu am găsit nimic pentru „{q}”.</p>
                <p style={{ margin: 0 }}>Încearcă un cuvânt mai scurt sau mai general{section || year ? ', ori scoate filtrele' : ''}.</p>
              </div>
            )}

            {showPager && (
              <nav aria-label="Paginare">
                <ul className="pagination">
                  {page > 1 && (
                    <li>
                      <Link href={link({ pagina: String(page - 1) })}>Anterioara</Link>
                    </li>
                  )}
                  <li>
                    <span aria-current="page">
                      {page} din {articlePages}
                    </span>
                  </li>
                  {page < articlePages && (
                    <li>
                      <Link href={link({ pagina: String(page + 1) })}>Următoarea</Link>
                    </li>
                  )}
                </ul>
              </nav>
            )}
          </div>
        </div>
      )}

      {!q && (
        <div className="wrap" style={{ paddingTop: 32, paddingBottom: 80 }}>
          <p className="muted">Caută în anunțuri, pagini și documente. De exemplu:</p>
          <ul className="chips">
            {['orar', 'burse', 'admitere', 'olimpiada', 'erasmus', 'regulament'].map((s) => (
              <li key={s}>
                <Link className="chip" href={`/cautare?q=${s}`}>
                  {s}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}
