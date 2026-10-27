import Link from 'next/link'
import React from 'react'

import { Blocks } from '@/components/Blocks'
import { Breadcrumbs, trail } from '@/components/Breadcrumbs'
import { ArrowRight } from '@/components/icons'
import {
  articlePath,
  categoryTree,
  docPath,
  findArticles,
  formatDate,
  getCategories,
  getNavigation,
  linkProps,
  payload,
} from '@/lib/site'
import type { Category, Page } from '@/payload-types'

import { PageFeed } from './Templates'

type Group = { title: string; items: { label: string; description?: string | null; href: string }[] }

// The menu section a path lives in, so pages can reuse the curated menu as their own navigation.
async function navSectionFor(path: string, categories: Category[]) {
  const nav = await getNavigation()
  return (nav.main ?? []).find((section) => {
    const href = linkProps(section.link, categories).href
    return href !== '#' && (path === href || path.startsWith(`${href}/`))
  })
}

async function childPages(page: Page) {
  const { docs } = await (await payload()).find({
    collection: 'pages',
    where: { parent: { equals: page.id } },
    sort: ['order', 'title'],
    limit: 100,
    depth: 0,
    overrideAccess: false,
  })
  return docs
}

export async function SectionView({ page }: { page: Page }) {
  const categories = await getCategories()
  const path = docPath(page)
  const section = await navSectionFor(path, categories)
  const isTop = section && linkProps(section.link, categories).href === path

  let groups: Group[] = []
  if (isTop && section.columns?.length) {
    groups = section.columns.map((c) => ({
      title: c.heading ?? '',
      items: (c.items ?? []).map((i) => ({ label: i.label, description: i.description, href: linkProps(i.link, categories).href })),
    }))
  } else {
    const children = await childPages(page)
    if (children.length) groups = [{ title: 'Pagini', items: children.map((c) => ({ label: c.title, description: c.intro, href: docPath(c) })) }]
  }

  const feedId = typeof page.feedCategory === 'object' ? page.feedCategory?.id : page.feedCategory
  const category = categories.find((c) => (feedId ? c.id === feedId : docPath(c) === path))
  const recent = category ? (await findArticles({ categoryIds: categoryTree(category.id, categories), limit: 6 })).docs : []
  const title = isTop ? section.label : page.title

  return (
    <>
      <section className="page-head page-head--navy">
        <div className="wrap" style={{ paddingTop: 40, paddingBottom: 56 }}>
          <Breadcrumbs items={trail(page).map((c, i, all) => (i === all.length - 1 ? { ...c, label: title } : c))} onNavy />
          <h1 className="h1">{title}</h1>
          {page.intro && <p className="lead">{page.intro}</p>}
        </div>
      </section>

      <div className="wrap" style={{ paddingBottom: 72 }}>
        {!!page.layout?.length && (
          <div className="stack" style={{ paddingTop: 48, maxWidth: 860 }}>
            <Blocks blocks={page.layout} categories={categories} />
          </div>
        )}

        <div className="stack" style={{ paddingTop: 48, gap: 40 }}>
          {groups.map((g) => (
            <section key={g.title} className="stack stack--sm">
              {g.title && <h2 className="eyebrow eyebrow--muted">{g.title}</h2>}
              <div className="grid">
                {g.items.map((item) => (
                  <Link key={item.href + item.label} className="card card-link" href={item.href} style={{ minHeight: 112 }}>
                    <span style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
                      <span className="card-link__title">{item.label}</span>
                      <span style={{ color: 'var(--gold-ink)' }}>
                        <ArrowRight />
                      </span>
                    </span>
                    {item.description && <span className="small muted">{item.description}</span>}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        {recent.length > 0 && category && (
          <section style={{ marginTop: 64, display: 'flex', flexWrap: 'wrap', gap: 32 }}>
            <div className="stack stack--sm" style={{ flex: '1 1 280px', gap: 10 }}>
              <p className="eyebrow">Actualizări</p>
              <h2 className="h2" style={{ fontSize: 32 }}>
                Recent în {title}
              </h2>
              <p className="muted" style={{ margin: 0 }}>
                Ce s-a publicat cel mai recent în această secțiune.
              </p>
            </div>
            <ul className="list-card" style={{ flex: '2 1 560px' }}>
              {recent.map((a) => (
                <li key={a.id}>
                  <Link className="list-card__row" href={articlePath(a, categories)}>
                    <span style={{ fontWeight: 500 }}>{a.title}</span>
                    <span className="small muted">{formatDate(a.publishedAt)}</span>
                  </Link>
                </li>
              ))}
              <li className="list-card__foot">
                <Link className="arrow-link" href={docPath(category)}>
                  Toate articolele din {title} <ArrowRight />
                </Link>
              </li>
            </ul>
          </section>
        )}
      </div>
    </>
  )
}

export async function StandardPageView({ page }: { page: Page }) {
  const categories = await getCategories()
  const path = docPath(page)
  const section = await navSectionFor(path, categories)

  // Side navigation: the curated menu section when there is one, otherwise the page's siblings.
  let sideTitle = section?.label ?? ''
  let side: { label: string; href: string }[] = []
  if (section) {
    side = (section.columns ?? []).flatMap((c) => (c.items ?? []).map((i) => ({ label: i.label, href: linkProps(i.link, categories).href })))
  } else if (page.parent && typeof page.parent === 'object') {
    sideTitle = page.parent.title
    side = (await childPages(page.parent)).map((p) => ({ label: p.title, href: docPath(p) }))
  }

  const content = (
    <article className="stack">
      <header className="stack stack--sm" style={{ gap: 10 }}>
        <h1 className="h1" style={{ fontSize: 'clamp(32px, 4.4vw, 48px)' }}>
          {page.title}
        </h1>
        {page.intro && <p className="lead">{page.intro}</p>}
      </header>
      <Blocks blocks={page.layout} categories={categories} />
      <PageFeed page={page} />
      <p className="small muted" style={{ margin: 0, borderTop: '1px solid var(--line)', paddingTop: 18 }}>
        Ultima actualizare: {formatDate(page.updatedAt)}
      </p>
    </article>
  )

  return (
    <div className="wrap" style={{ paddingTop: 32 }}>
      <Breadcrumbs items={trail(page)} />
      {side.length > 1 ? (
        <div className="with-sidebar with-sidebar--nav" style={{ paddingTop: 28 }}>
          <nav className="card side-nav" aria-label={sideTitle}>
            {sideTitle && <p className="side-nav__title">{sideTitle}</p>}
            <ul>
              {side.map((l) => (
                <li key={l.href + l.label}>
                  <Link href={l.href} aria-current={l.href === path ? 'page' : undefined}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          {content}
        </div>
      ) : (
        <div style={{ paddingTop: 28, paddingBottom: 80, maxWidth: 900 }}>{content}</div>
      )}
    </div>
  )
}
