import Link from 'next/link'
import React from 'react'

import { Blocks } from '@/components/Blocks'
import { Breadcrumbs, trail } from '@/components/Breadcrumbs'
import { KindBadge, PrimaryDoc } from '@/components/Documents'
import { ArrowRight, Mail, Phone } from '@/components/icons'
import { headingsOf } from '@/components/RichText'
import {
  plainText,
  articlePath,
  asDocs,
  categoryTree,
  docHref,
  docKind,
  docPath,
  docSize,
  findArticles,
  formatDate,
  getCategories,
  getNavigation,
  getSettings,
  linkProps,
  payload,
} from '@/lib/site'
import type { Article, Category, Document, Media, Page } from '@/payload-types'

// --- shared ------------------------------------------------------------------

const feedOf = (page: Page, categories: Category[]) => {
  const id = typeof page.feedCategory === 'object' ? page.feedCategory?.id : page.feedCategory
  return id ? categories.find((c) => c.id === id) : undefined
}

async function feedArticles(page: Page, categories: Category[], limit: number) {
  const feed = feedOf(page, categories)
  if (!feed) return { feed, docs: [] as Article[], total: 0 }
  const result = await findArticles({ categoryIds: categoryTree(feed.id, categories), limit })
  return { feed, docs: result.docs as Article[], total: result.totalDocs }
}

// Every document attached to a set of posts, newest post first, each file once.
function documentsOf(articles: Article[]) {
  const seen = new Set<number>()
  const out: { doc: Document; article: Article }[] = []
  for (const article of articles) {
    const docs = [
      ...(typeof article.embeddedDocument === 'object' && article.embeddedDocument ? [article.embeddedDocument] : []),
      ...(article.attachmentGroups ?? []).flatMap((g) => asDocs(g.documents)),
    ]
    for (const doc of docs) if (!seen.has(doc.id) && seen.add(doc.id)) out.push({ doc, article })
  }
  return out
}

// Menu items that sit next to this page in the main menu (same column), for "read next" links.
async function menuNeighbours(page: Page, categories: Category[], sectionLabel?: string) {
  const nav = await getNavigation()
  const path = docPath(page)
  const sections = (nav.main ?? []).filter((s) => !sectionLabel || s.label === sectionLabel)
  for (const section of sections) {
    for (const column of section.columns ?? []) {
      const items = (column.items ?? []).map((i) => ({ label: i.label, description: i.description, href: linkProps(i.link, categories).href }))
      if (items.some((i) => i.href === path) || sectionLabel) {
        return { section, column: column.heading, items, all: (section.columns ?? []).flatMap((c) => c.items ?? []).map((i) => ({ label: i.label, description: i.description, href: linkProps(i.link, categories).href })) }
      }
    }
  }
  return undefined
}

function PostList({ articles, categories, footer }: { articles: Article[]; categories: Category[]; footer?: React.ReactNode }) {
  if (!articles.length) return null
  return (
    <ul className="list-card">
      {articles.map((a) => (
        <li key={a.id}>
          <Link className="list-card__row" href={articlePath(a, categories)}>
            <span style={{ fontWeight: 500 }}>{a.title}</span>
            <span className="small muted">{formatDate(a.publishedAt)}</span>
          </Link>
        </li>
      ))}
      {footer && <li className="list-card__foot">{footer}</li>}
    </ul>
  )
}

function DocCards({ items }: { items: { doc: Document; article?: Article }[] }) {
  if (!items.length) return null
  return (
    <div className="grid">
      {items.map(({ doc }) => (
        <a key={doc.id} className="card card-link" href={docHref(doc)} target="_blank" rel="noopener noreferrer" style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
          <KindBadge doc={doc} />
          <span style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
            <span style={{ fontWeight: 500 }}>{doc.title}</span>
            {docSize(doc) && <span className="small muted">{docSize(doc)}</span>}
          </span>
        </a>
      ))}
    </div>
  )
}

function ContactPanel({ contact, title = 'Secretariat' }: { contact: NonNullable<Awaited<ReturnType<typeof getSettings>>['contact']>; title?: string }) {
  return (
    <div className="panel">
      <h2 className="h3">{title}</h2>
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
  )
}

function Hero({ page, eyebrow, navy, children }: { page: Page; eyebrow?: string; navy?: boolean; children?: React.ReactNode }) {
  return (
    <section className={`page-head${navy ? ' page-head--navy' : ''}`}>
      <div className="wrap" style={{ paddingTop: 40, paddingBottom: 48, gap: 16 }}>
        <Breadcrumbs items={trail(page)} onNavy={navy} />
        {eyebrow && <p className="eyebrow" style={navy ? { color: 'var(--gold)' } : undefined}>{eyebrow}</p>}
        <h1 className="h1" style={{ maxWidth: 900 }}>
          {page.title}
        </h1>
        {page.intro && <p className="lead">{page.intro}</p>}
        {children}
      </div>
    </section>
  )
}

const hasBlocks = (page: Page) => !!page.layout?.length

// --- history -----------------------------------------------------------------

export async function HistoryView({ page }: { page: Page }) {
  const categories = await getCategories()
  const toc = (page.layout ?? []).flatMap((b) => (b.blockType === 'richText' ? headingsOf(b.content) : []))
  const text = (page.layout ?? []).map((b) => (b.blockType === 'richText' ? plainText(b.content as never, Infinity) : '')).join(' ')
  const words = text.split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.round(words / 200))
  const hero = typeof page.heroImage === 'object' ? (page.heroImage as Media | null) : null
  const neighbours = await menuNeighbours(page, categories, 'Despre noi')
  const path = docPath(page)
  const related = (neighbours?.all ?? []).filter((i) => i.href !== path && /istori|oglinzi|distinc|directori|promo/i.test(i.href)).slice(0, 4)

  return (
    <>
      <section className="page-head">
        <div className="wrap" style={{ paddingTop: 40, paddingBottom: 40, gap: 18 }}>
          <Breadcrumbs items={trail(page)} />
          <p className="eyebrow">{words > 300 ? `Despre noi · lectură de aproximativ ${minutes} minute` : 'Despre noi'}</p>
          <h1 className="h1" style={{ fontSize: 'clamp(38px, 6vw, 64px)', maxWidth: 900 }}>
            {page.title}
          </h1>
          {page.intro && <p className="lead">{page.intro}</p>}
          {(hero?.url || path === '/despre-noi/scurt-istoric') && (
            <img className="history-hero" src={hero?.url ?? '/site/internat.jpg'} alt={hero?.alt ?? 'Clădirea istorică a Liceului Internat din Iași'} />
          )}
        </div>
      </section>

      <div className={`wrap ${toc.length > 1 ? 'with-sidebar with-sidebar--nav' : ''}`} style={toc.length > 1 ? undefined : { paddingTop: 48, paddingBottom: 80, maxWidth: 900 }}>
        {toc.length > 1 && (
          <nav className="card side-nav toc" aria-label="Cuprins">
            <p className="side-nav__title">Cuprins</p>
            <ol>
              {toc.map((h, i) => (
                <li key={h.id}>
                  <a href={`#${h.id}`}>
                    <span className="toc__n">{String(i + 1).padStart(2, '0')}</span>
                    {h.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}
        <article className="stack history-body">
          <Blocks blocks={page.layout} categories={categories} />
        </article>
      </div>

      {related.length > 0 && (
        <section className="wrap" style={{ paddingBottom: 80 }}>
          <h2 className="h3" style={{ marginBottom: 16 }}>
            Citește și
          </h2>
          <div className="grid">
            {related.map((r) => (
              <Link key={r.href} className="card card-link" href={r.href}>
                <span className="card-link__title">{r.label}</span>
                {r.description && <span className="small muted">{r.description}</span>}
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  )
}

// --- admission ---------------------------------------------------------------

export async function AdmissionView({ page }: { page: Page }) {
  const [categories, settings] = await Promise.all([getCategories(), getSettings()])
  const { feed, docs: posts, total } = await feedArticles(page, categories, 30)
  const latest = posts[0]
  // The calendar is the latest admission round: this year's posts, oldest first.
  const year = latest?.publishedAt ? new Date(latest.publishedAt).getFullYear() : undefined
  const round = posts.filter((a) => a.publishedAt && new Date(a.publishedAt).getFullYear() === year).reverse().slice(-8)
  const docs = documentsOf(posts.filter((a) => round.includes(a))).slice(0, 8)
  const nav = await menuNeighbours(page, categories, 'Admitere')
  const path = docPath(page)
  const years = [...new Set(posts.map((a) => a.publishedAt && new Date(a.publishedAt).getFullYear()).filter(Boolean))] as number[]

  return (
    <>
      <Hero page={page} eyebrow="Admitere" navy>
        {latest && (
          <Link className="status-card" href={articlePath(latest, categories)}>
            <span className="status-card__label">Ultimul anunț · {formatDate(latest.publishedAt)}</span>
            <span className="status-card__title">{latest.title}</span>
            <span className="arrow-link" style={{ color: 'var(--gold)' }}>
              Citește anunțul <ArrowRight />
            </span>
          </Link>
        )}
        {nav && (
          <nav className="tabs" aria-label="Admitere">
            {nav.all.map((i) => (
              <Link key={i.href} href={i.href} aria-current={i.href === path ? 'page' : undefined}>
                {i.label}
              </Link>
            ))}
          </nav>
        )}
      </Hero>

      <div className="wrap with-sidebar">
        <div className="stack" style={{ gap: 48 }}>
          {hasBlocks(page) && <Blocks blocks={page.layout} categories={categories} />}

          {round.length > 0 && (
            <section className="stack stack--sm">
              <div className="section-head" style={{ marginBottom: 4 }}>
                <h2 className="h2" style={{ fontSize: 30 }}>
                  Calendarul admiterii {year}
                </h2>
                <span className="small muted">Construit din anunțurile publicate în {feed?.title}</span>
              </div>
              <ol className="steps">
                {round.map((a, i) => (
                  <li key={a.id}>
                    <span className="steps__n" aria-hidden="true">
                      {i + 1}
                    </span>
                    <Link href={articlePath(a, categories)}>
                      <span className="small muted">{formatDate(a.publishedAt)}</span>
                      <span className="steps__title">{a.title}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {docs.length > 0 && (
            <section className="stack stack--sm">
              <h2 className="h3">Documente esențiale</h2>
              <DocCards items={docs} />
            </section>
          )}

          {feed && posts.length > 0 && (
            <section className="stack stack--sm">
              <div className="section-head" style={{ marginBottom: 4 }}>
                <h2 className="h3">Toate anunțurile pentru {page.title.toLowerCase().startsWith('clasa') ? page.title.replace(/^C/, 'c') : page.title}</h2>
                <ul className="chips">
                  {years.slice(0, 4).map((y) => (
                    <li key={y}>
                      <Link className="chip" href={`${docPath(feed)}?an=${y}`}>
                        {y}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <PostList
                articles={posts.slice(0, 10)}
                categories={categories}
                footer={
                  <Link className="arrow-link" href={docPath(feed)}>
                    Toate cele {total} de anunțuri <ArrowRight />
                  </Link>
                }
              />
            </section>
          )}
        </div>
        <aside className="stack stack--sm" style={{ gap: 24 }}>
          {settings.contact && <ContactPanel contact={settings.contact} title="Secretariat admitere" />}
        </aside>
      </div>
    </>
  )
}

// --- results -----------------------------------------------------------------

export async function ResultsView({ page }: { page: Page }) {
  const categories = await getCategories()
  const { feed, docs: posts, total } = await feedArticles(page, categories, 13)
  const withDoc = posts.find((a) => documentsOf([a]).some(({ doc }) => docKind(doc).tone === 'pdf'))
  const table = withDoc ? documentsOf([withDoc]).find(({ doc }) => docKind(doc).tone === 'pdf') : undefined
  const nav = await menuNeighbours(page, categories, 'Rezultate')
  const path = docPath(page)
  const years = Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - i)

  return (
    <>
      <Hero page={page} eyebrow="Rezultate">
        {feed && (
          <form className="card filters" role="search" action={docPath(feed)} style={{ marginTop: 8 }}>
            <div className="field" style={{ flex: '1 1 320px' }}>
              <label htmlFor="r-q">Caută un rezultat</label>
              <input className="input" id="r-q" name="q" type="search" placeholder="ex. olimpiada de matematică, OLAV" />
            </div>
            <div className="field" style={{ flex: '0 1 180px' }}>
              <label htmlFor="r-an">An</label>
              <select className="input" id="r-an" name="an" defaultValue="">
                <option value="">Toți anii</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <button className="button" type="submit">
              Caută
            </button>
          </form>
        )}
      </Hero>

      <div className="wrap stack" style={{ paddingTop: 48, paddingBottom: 80, gap: 56 }}>
        {hasBlocks(page) && (
          <div className="stack" style={{ maxWidth: 900 }}>
            <Blocks blocks={page.layout} categories={categories} />
          </div>
        )}

        {table && withDoc && (
          <section className="stack stack--sm">
            <p className="eyebrow">Cel mai recent tabel de rezultate</p>
            <h2 className="h2" style={{ fontSize: 30 }}>
              <Link href={articlePath(withDoc, categories)} style={{ textDecoration: 'none' }}>
                {withDoc.title}
              </Link>
            </h2>
            <PrimaryDoc doc={table.doc} kicker={`Publicat pe ${formatDate(withDoc.publishedAt)}`} />
          </section>
        )}

        {posts.length > 0 && feed && (
          <section className="stack stack--sm">
            <h2 className="h3">Cele mai recente rezultate</h2>
            <div className="grid grid--wide">
              {posts
                .filter((a) => a !== withDoc)
                .slice(0, 12)
                .map((a) => (
                  <Link key={a.id} className="card card-link news-card" href={articlePath(a, categories)}>
                    <span className="news-card__top">{formatDate(a.publishedAt)}</span>
                    <span className="news-card__title">{a.title}</span>
                  </Link>
                ))}
            </div>
            <Link className="arrow-link" href={docPath(feed)}>
              Toate cele {total} de articole <ArrowRight />
            </Link>
          </section>
        )}

        {nav && nav.all.filter((i) => i.href !== path).length > 0 && (
          <section className="stack stack--sm">
            <h2 className="h3">Mai multe rezultate</h2>
            <div className="grid">
              {nav.all
                .filter((i) => i.href !== path)
                .map((i) => (
                  <Link key={i.href} className="card card-link" href={i.href}>
                    <span className="card-link__title">{i.label}</span>
                    {i.description && <span className="small muted">{i.description}</span>}
                  </Link>
                ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}

// --- project -----------------------------------------------------------------

export async function ProjectView({ page }: { page: Page }) {
  const categories = await getCategories()
  const { feed, docs: posts, total } = await feedArticles(page, categories, 40)
  const docs = documentsOf(posts).slice(0, 6)
  const dates = posts.map((a) => a.publishedAt).filter(Boolean) as string[]
  const first = dates.length ? new Date(dates[dates.length - 1]).getFullYear() : undefined
  const last = dates.length ? new Date(dates[0]).getFullYear() : undefined
  const nav = await menuNeighbours(page, categories, 'Proiecte')
  const path = docPath(page)
  const parent = typeof page.parent === 'object' ? page.parent : undefined
  const others = (nav?.all ?? []).filter((i) => i.href !== path)

  return (
    <>
      <Hero page={page} eyebrow={parent && docPath(parent) !== '/proiecte' ? `Proiect · ${parent.title}` : 'Proiect'} navy>
        {posts.length > 0 && (
          <div className="hero__actions">
            {posts.slice(0, 2).map((a, i) => (
              <Link key={a.id} className={`button ${i === 0 ? 'button--gold' : 'button--ghost'}`} href={articlePath(a, categories)}>
                {a.title.length > 60 ? `${a.title.slice(0, 60).replace(/\s+\S*$/, '')}…` : a.title}
              </Link>
            ))}
          </div>
        )}
        {posts.length > 0 && (
          <dl className="facts">
            <div>
              <dt>Articole publicate</dt>
              <dd>{total}</dd>
            </div>
            {first && last && (
              <div>
                <dt>Perioadă</dt>
                <dd>{first === last ? first : `${first} - ${last}`}</dd>
              </div>
            )}
            <div>
              <dt>Ultimul anunț</dt>
              <dd>{formatDate(posts[0].publishedAt)}</dd>
            </div>
          </dl>
        )}
      </Hero>

      <div className="wrap with-sidebar">
        <div className="stack" style={{ gap: 48 }}>
          {hasBlocks(page) && <Blocks blocks={page.layout} categories={categories} />}
          {posts.length > 0 && feed && (
            <section className="stack stack--sm">
              <h2 className="h3">Anunțuri din proiect</h2>
              <PostList
                articles={posts.slice(0, 10)}
                categories={categories}
                footer={
                  total > 10 && (
                    <Link className="arrow-link" href={docPath(feed)}>
                      Toate cele {total} de articole <ArrowRight />
                    </Link>
                  )
                }
              />
            </section>
          )}
          {!posts.length && !hasBlocks(page) && <p className="card empty">Încă nu sunt anunțuri publicate pentru acest proiect.</p>}
        </div>
        <aside className="stack stack--sm" style={{ gap: 24 }}>
          {docs.length > 0 && (
            <div className="card" style={{ padding: '8px 0' }}>
              <h2 className="eyebrow eyebrow--muted" style={{ padding: '18px 24px 8px' }}>
                Documente recente
              </h2>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {docs.map(({ doc }) => (
                  <li key={doc.id} style={{ borderTop: '1px solid var(--line-soft)' }}>
                    <a className="doc-row" href={docHref(doc)} target="_blank" rel="noopener noreferrer" style={{ padding: '12px 24px' }}>
                      <KindBadge doc={doc} />
                      <span className="doc-row__title" style={{ fontSize: 15 }}>
                        {doc.title}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {others.length > 0 && (
            <nav className="card side-nav" aria-label="Alte proiecte">
              <p className="side-nav__title">Alte proiecte</p>
              <ul>
                {others.map((o) => (
                  <li key={o.href}>
                    <Link href={o.href}>{o.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </aside>
      </div>
    </>
  )
}

// --- contact -----------------------------------------------------------------

export async function ContactView({ page }: { page: Page }) {
  const [categories, settings, nav] = await Promise.all([getCategories(), getSettings(), getNavigation()])
  const { contact } = settings
  const address = contact?.address ?? ''
  const mapQuery = encodeURIComponent(`Colegiul Național Costache Negruzzi, ${address}`)
  const services = (nav.main ?? [])
    .flatMap((s) => s.columns ?? [])
    .find((c) => c.heading === 'Servicii')
    ?.items?.filter((i) => !/planul/i.test(i.label))
  const phones = [contact?.phone, contact?.fax].filter(Boolean) as string[]

  return (
    <>
      <section className="page-head">
        <div className="wrap" style={{ paddingTop: 40, paddingBottom: 40 }}>
          <Breadcrumbs items={trail(page)} />
          <h1 className="h1">{page.title}</h1>
          <p className="lead">{page.intro || 'Ne găsești în centrul Iașului. Scrie-ne, sună-ne sau treci pe la secretariat în timpul programului.'}</p>
        </div>
      </section>

      <div className="wrap stack" style={{ paddingTop: 48, paddingBottom: 80, gap: 56 }}>
        <section className="contact-main">
          <div className="card contact-card">
            <div>
              <p className="eyebrow eyebrow--muted">Adresă</p>
              <p className="contact-card__value">{address}</p>
            </div>
            {phones.length > 0 && (
              <div>
                <p className="eyebrow eyebrow--muted">Telefon</p>
                {phones.map((n) => (
                  <p key={n} className="contact-card__value">
                    <a href={`tel:${n.replace(/\s/g, '')}`}>
                      <Phone /> {n}
                    </a>
                  </p>
                ))}
              </div>
            )}
            {contact?.email && (
              <div>
                <p className="eyebrow eyebrow--muted">E-mail</p>
                <p className="contact-card__value">
                  <a href={`mailto:${contact.email}`}>
                    <Mail /> {contact.email}
                  </a>
                </p>
              </div>
            )}
            {contact?.hours && (
              <div>
                <p className="eyebrow eyebrow--muted">Program secretariat</p>
                <p className="contact-card__value" style={{ whiteSpace: 'pre-line', fontWeight: 500 }}>
                  {contact.hours}
                </p>
              </div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <a className="button" href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`} target="_blank" rel="noopener noreferrer">
                Deschide în Google Maps
              </a>
              {contact?.email && (
                <a className="button button--outline" href={`mailto:${contact.email}`}>
                  Scrie-ne un e-mail
                </a>
              )}
            </div>
          </div>
          <iframe
            className="contact-map"
            title={`Hartă: ${address}`}
            src={contact?.mapEmbedUrl || `https://www.google.com/maps?q=${mapQuery}&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </section>

        {!!services?.length && (
          <section className="stack stack--sm">
            <h2 className="h3">Compartimente</h2>
            <div className="grid">
              {services.map((s) => (
                <Link key={s.id} className="card card-link" {...linkProps(s.link, categories)}>
                  <span className="card-link__title">{s.label}</span>
                  {s.description && <span className="small muted">{s.description}</span>}
                </Link>
              ))}
            </div>
          </section>
        )}

        {(page.layout ?? []).some((b) => b.blockType !== 'richText') && (
          <div className="stack" style={{ maxWidth: 900 }}>
            <Blocks blocks={(page.layout ?? []).filter((b) => b.blockType !== 'richText')} categories={categories} />
          </div>
        )}
      </div>
    </>
  )
}

// --- documents ---------------------------------------------------------------

export type DocumentParams = { q?: string; an?: string; tip?: string }

const TYPE_FILTERS = [
  { value: 'pdf', label: 'PDF' },
  { value: 'doc', label: 'Word și alte documente' },
  { value: 'sheet', label: 'Tabele (XLS)' },
] as const

const yearOf = (doc: Document, article?: Article) =>
  doc.schoolYear?.slice(0, 4) ?? doc.title.match(/\b(20\d{2})\b/)?.[1] ?? (article?.publishedAt ? String(new Date(article.publishedAt).getFullYear()) : '')

export async function DocumentsView({ page, params }: { page: Page; params: DocumentParams }) {
  const categories = await getCategories()
  const { feed, docs: posts } = await feedArticles(page, categories, 500)
  const own = (page.layout ?? []).flatMap((b) =>
    b.blockType === 'documentList' ? asDocs(b.documents) : b.blockType === 'embeddedDocument' && typeof b.document === 'object' ? [b.document] : [],
  )
  const rows = [...own.map((doc) => ({ doc, article: undefined as Article | undefined })), ...documentsOf(posts)]
  const q = params.q?.trim().toLowerCase() ?? ''
  const tip = TYPE_FILTERS.some((t) => t.value === params.tip) ? params.tip : ''
  const an = /^\d{4}$/.test(params.an ?? '') ? params.an! : ''
  const filtered = rows.filter(
    ({ doc, article }) =>
      (!q || `${doc.title} ${article?.title ?? ''}`.toLowerCase().includes(q)) &&
      (!tip || docKind(doc).tone === tip) &&
      (!an || yearOf(doc, article) === an),
  )
  const years = [...new Set(rows.map(({ doc, article }) => yearOf(doc, article)).filter(Boolean))].sort().reverse()
  const groups = new Map<string, typeof filtered>()
  for (const row of filtered) {
    const y = yearOf(row.doc, row.article) || 'Fără an'
    groups.set(y, [...(groups.get(y) ?? []), row])
  }
  const ordered = [...groups.entries()].sort(([a], [b]) => (a === 'Fără an' ? 1 : b === 'Fără an' ? -1 : b.localeCompare(a)))
  const path = docPath(page)
  const active = !!(q || tip || an)

  return (
    <>
      <section className="page-head">
        <div className="wrap" style={{ paddingTop: 40, paddingBottom: 40 }}>
          <Breadcrumbs items={trail(page)} />
          <h1 className="h1">{page.title}</h1>
          {page.intro && <p className="lead">{page.intro}</p>}
        </div>
      </section>

      <div className="wrap with-sidebar with-sidebar--nav">
        <form className="card filters filters--stack" action={path} role="search" aria-label="Filtre">
          <div className="field">
            <label htmlFor="d-q">Caută un document</label>
            <input className="input" id="d-q" name="q" type="search" defaultValue={params.q ?? ''} placeholder="ex. declarații, salarii" />
          </div>
          <div className="field">
            <label htmlFor="d-an">An</label>
            <select className="input" id="d-an" name="an" defaultValue={an}>
              <option value="">Toți anii</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="d-tip">Tip fișier</label>
            <select className="input" id="d-tip" name="tip" defaultValue={tip}>
              <option value="">Toate</option>
              {TYPE_FILTERS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <button className="button" type="submit">
            Filtrează
          </button>
          {active && (
            <Link className="button button--outline" href={path}>
              Resetează filtrele
            </Link>
          )}
        </form>

        <div className="stack" style={{ gap: 36 }}>
          <p className="muted" style={{ margin: 0 }}>
            {filtered.length} {filtered.length === 1 ? 'document' : 'documente'}
            {ordered.length > 1 ? ', grupate pe ani' : ''}
            {feed && ` · din anunțurile publicate în ${feed.title}`}
          </p>
          {ordered.map(([year, items]) => (
            <section key={year} className="stack stack--sm">
              <h2 className="h3">{year}</h2>
              <div className="table-card">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Document</th>
                      <th scope="col">Din anunțul</th>
                      <th scope="col">Publicat</th>
                      <th scope="col">Fișier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(({ doc, article }) => (
                      <tr key={doc.id}>
                        <td>
                          <a href={docHref(doc)} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 500 }}>
                            {doc.title}
                          </a>
                        </td>
                        <td>{article ? <Link href={articlePath(article, categories)}>{article.title}</Link> : <span className="muted">Pe această pagină</span>}</td>
                        <td className="nowrap">{article ? formatDate(article.publishedAt) : formatDate(page.updatedAt)}</td>
                        <td className="nowrap">
                          <KindBadge doc={doc} /> <span className="small muted">{docSize(doc)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
          {!filtered.length && <p className="card empty">Niciun document nu se potrivește filtrelor alese.</p>}
        </div>
      </div>
    </>
  )
}

// --- directory ---------------------------------------------------------------

const initials = (name: string) =>
  name
    .replace(/^(Prof\.|Dr\.|\s)+/g, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

export async function DirectoryView({ page }: { page: Page }) {
  const categories = await getCategories()
  const p = await payload()
  const { docs: leaders } = await p.find({ collection: 'people', where: { groups: { contains: 'conducere' } }, sort: 'order', depth: 1, overrideAccess: false })
  const feed = feedOf(page, categories)
  const departments = feed ? categories.filter((c) => (typeof c.parent === 'object' ? c.parent?.id : c.parent) === feed.id) : []
  const counts = await Promise.all(
    departments.map(async (d) => (await p.count({ collection: 'articles', where: { category: { in: categoryTree(d.id, categories) } }, overrideAccess: false })).totalDocs),
  )
  const recent = feed ? ((await findArticles({ categoryIds: categoryTree(feed.id, categories), limit: 6 })).docs as Article[]) : []
  const wanted = ['/organizare/conducerea-colegiului', '/organizare/consiliul-de-administratie', '/despre-noi/fosti-directori', '/despre-noi/sefi-de-promotie', '/organizare/personal-angajat']
  const pages = await p.find({
    collection: 'pages',
    where: { 'breadcrumbs.url': { in: wanted } },
    limit: 100,
    depth: 0,
    overrideAccess: false,
  })
  const pageLinks = pages.docs.filter((d) => wanted.includes(docPath(d))).map((d) => ({ label: d.title, href: docPath(d) }))

  return (
    <>
      <Hero page={page}>
        {pageLinks.length > 0 && (
          <ul className="chips" style={{ marginTop: 6 }}>
            <li>
              <a className="chip" href="#conducere">
                Conducerea
              </a>
            </li>
            {departments.length > 0 && (
              <li>
                <a className="chip" href="#catedre">
                  Catedre
                </a>
              </li>
            )}
            {pageLinks.map((l) => (
              <li key={l.href}>
                <Link className="chip" href={l.href}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Hero>

      <div className="wrap stack" style={{ paddingTop: 48, paddingBottom: 80, gap: 56 }}>
        {hasBlocks(page) && (
          <div className="stack" style={{ maxWidth: 900 }}>
            <Blocks blocks={page.layout} categories={categories} />
          </div>
        )}

        {leaders.length > 0 && (
          <section id="conducere" className="stack stack--sm">
            <p className="eyebrow eyebrow--muted">Conducerea colegiului</p>
            <div className="grid">
              {leaders.map((l) => (
                <div key={l.id} className="card person" style={{ alignItems: 'flex-start', padding: 24 }}>
                  <span className="person__avatar" aria-hidden="true" style={{ flexBasis: 56, height: 56, fontSize: 18 }}>
                    {initials(l.name)}
                  </span>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span className="eyebrow" style={{ fontSize: 12 }}>
                      {l.role}
                    </span>
                    <span style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 600, color: 'var(--navy)' }}>{l.name}</span>
                    {l.bio && <span className="small muted">{l.bio}</span>}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {departments.length > 0 && (
          <section id="catedre" className="stack stack--sm">
            <p className="eyebrow eyebrow--muted">Catedre</p>
            <h2 className="h2" style={{ fontSize: 30 }}>
              Catedrele și cabinetul psihopedagogic
            </h2>
            <div className="grid">
              {departments.map((d, i) => (
                <Link key={d.id} className="card card-link" href={docPath(d)}>
                  <span className="card-link__title">{d.title}</span>
                  <span className="small muted">{counts[i] === 1 ? '1 articol' : `${counts[i]} articole`}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {recent.length > 0 && (
          <section className="stack stack--sm">
            <h2 className="h3">Noutăți de la catedre</h2>
            <PostList
              articles={recent}
              categories={categories}
              footer={
                feed && (
                  <Link className="arrow-link" href={docPath(feed)}>
                    Toate articolele <ArrowRight />
                  </Link>
                )
              }
            />
          </section>
        )}
      </div>
    </>
  )
}

// --- feed for plain pages ----------------------------------------------------

export async function PageFeed({ page }: { page: Page }) {
  const categories = await getCategories()
  const { feed, docs, total } = await feedArticles(page, categories, 10)
  if (!feed || !docs.length) return null
  return (
    <section className="stack stack--sm">
      <h2 className="h3">{hasBlocks(page) ? 'Anunțuri' : 'Ultimele articole'}</h2>
      <PostList
        articles={docs}
        categories={categories}
        footer={
          total > docs.length && (
            <Link className="arrow-link" href={docPath(feed)}>
              Toate cele {total} de articole <ArrowRight />
            </Link>
          )
        }
      />
    </section>
  )
}
