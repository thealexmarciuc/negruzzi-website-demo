import { sql } from '@payloadcms/db-postgres'

import { categoryTree, docPath, getCategories, payload } from '@/lib/site'

type SQL = ReturnType<typeof sql>

export const SEARCH_TYPES = [
  { value: 'articole', label: 'Anunțuri și articole' },
  { value: 'pagini', label: 'Pagini' },
  { value: 'documente', label: 'Documente' },
] as const
export type SearchType = (typeof SEARCH_TYPES)[number]['value']

// Site sections as visitors know them, and where their posts live.
export const SEARCH_SECTIONS = [
  { value: 'noutati', label: 'Noutăți', paths: ['/noutati', '/anunturi'] },
  { value: 'admitere', label: 'Admitere', paths: ['/admitere', '/centrul-de-excelenta-negruzzi-invatamant-primar-matematica'] },
  { value: 'elevi', label: 'Elevi', paths: ['/elevi', '/consiliul-scolar-al-elevilor', '/resurse-educationale-online'] },
  { value: 'organizare', label: 'Organizare', paths: ['/organizare'] },
  { value: 'rezultate', label: 'Rezultate', paths: ['/rezultate', '/competitii'] },
  { value: 'proiecte', label: 'Proiecte', paths: ['/proiecte'] },
] as const

export const PER_PAGE = 20

type Row = Record<string, unknown>
type Hit = { id: number; title: string; href: string; crumb: string; date?: string | null; snippet: { pre: string; hit: string; post: string } | null }

const db = async () => (await payload()).db as unknown as { drizzle: { execute: (q: SQL) => Promise<{ rows: Row[] }> } }

// Lowercase, diacritics stripped, both in SQL and here, so they compare the same way.
const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const words = (q: string) => [...new Set(fold(q).split(/[^a-z0-9]+/).filter((w) => w.length > 1))].slice(0, 8)

// Every word must appear somewhere in the haystack expression.
const matchAll = (haystack: SQL, terms: string[]) =>
  sql.join(
    terms.map((t) => sql`unaccent(lower(${haystack})) like ${`%${t}%`}`),
    sql` and `,
  )
const titleScore = (title: SQL, terms: string[]) =>
  sql.join(
    terms.map((t) => sql`(case when unaccent(lower(${title})) like ${`%${t}%`} then 1 else 0 end)`),
    sql` + `,
  )

function snippet(text: string, terms: string[]) {
  const folded = fold(text)
  const at = terms.map((t) => folded.indexOf(t)).filter((i) => i >= 0).sort((a, b) => a - b)[0]
  if (at === undefined) return null
  const term = terms.find((t) => folded.startsWith(t, at)) ?? terms[0]
  const start = Math.max(0, at - 90)
  const pre = (start > 0 ? '…' : '') + text.slice(start, at).replace(/^\S*\s/, start > 0 ? '' : '$&')
  const end = at + term.length
  return { pre, hit: text.slice(at, end), post: text.slice(end, end + 140) + (end + 140 < text.length ? '…' : '') }
}

const ARTICLE_TEXT = sql`coalesce((select string_agg(v #>> '{}', ' ') from jsonb_path_query(a.content, 'strict $.**.text') v), '')`
const PAGE_TEXT = sql`coalesce((select string_agg(v #>> '{}', ' ') from pages_blocks_rich_text b, jsonb_path_query(b.content, 'strict $.**.text') v where b._parent_id = p.id), '')`

export async function searchSite(opts: { q: string; type?: SearchType | ''; section?: string; year?: number | null; page?: number }) {
  const terms = words(opts.q)
  const empty = { terms, total: 0, counts: { articole: 0, pagini: 0, documente: 0 }, hits: [] as Hit[], docs: [] as Hit[] }
  if (!terms.length) return empty

  const [categories, { drizzle }] = await Promise.all([getCategories(), db()])
  const section = SEARCH_SECTIONS.find((s) => s.value === opts.section)
  const inSection = (path: string) => !section || section.paths.some((p) => path === p || path.startsWith(`${p}/`))
  const catIds = section
    ? [...new Set(categories.filter((c) => inSection(docPath(c))).flatMap((c) => categoryTree(c.id, categories)))]
    : null
  const catFilter = catIds ? (catIds.length ? sql`and a.category_id in (${sql.join(catIds.map((id) => sql`${id}`), sql`, `)})` : sql`and false`) : sql``
  const yearFilter = opts.year ? sql`and extract(year from a.published_at at time zone 'Europe/Bucharest') = ${opts.year}` : sql``
  const page = Math.max(1, opts.page ?? 1)

  const articleWhere = sql`a._status = 'published' and ${matchAll(sql`a.title || ' ' || coalesce(a.excerpt, '') || ' ' || ${ARTICLE_TEXT}`, terms)} ${catFilter} ${yearFilter}`
  const pageWhere = sql`p._status = 'published' and ${matchAll(sql`p.title || ' ' || coalesce(p.intro, '') || ' ' || ${PAGE_TEXT}`, terms)}`
  const docWhere = matchAll(sql`d.title || ' ' || coalesce(d.filename, '')`, terms)

  const [articleCount, pageRows, docRows] = await Promise.all([
    drizzle.execute(sql`select count(*)::int as n from articles a where ${articleWhere}`),
    drizzle.execute(sql`select p.id, p.title, ${PAGE_TEXT} as body, ${titleScore(sql`p.title`, terms)} as score from pages p where ${pageWhere} order by score desc, p.title limit 50`),
    section || opts.year
      ? Promise.resolve({ rows: [] as Row[] })
      : drizzle.execute(sql`select d.id from documents d where ${docWhere} order by ${titleScore(sql`d.title`, terms)} desc, d.id desc limit 50`),
  ])

  const p = await payload()
  const pageDocs = pageRows.rows.length
    ? (await p.find({ collection: 'pages', where: { id: { in: pageRows.rows.map((r) => r.id as number) } }, depth: 0, limit: 50, overrideAccess: false })).docs
    : []
  const pageHits: Hit[] = pageRows.rows
    .map((r): Hit | null => {
      const doc = pageDocs.find((d) => d.id === r.id)
      if (!doc || !inSection(docPath(doc))) return null
      return {
        id: doc.id,
        title: doc.title,
        href: docPath(doc),
        crumb: (doc.breadcrumbs ?? []).slice(0, -1).map((b) => b.label).join(' / ') || 'Pagină',
        date: null,
        snippet: snippet(`${doc.intro ?? ''} ${r.body as string}`.trim(), terms),
      }
    })
    .filter((h): h is Hit => !!h)

  const counts = { articole: articleCount.rows[0].n as number, pagini: pageHits.length, documente: docRows.rows.length }
  const type = opts.type || ''
  const hits: Hit[] = []

  // Pages first (they are the stable answers), then posts by relevance and date.
  if (!type || type === 'pagini') hits.push(...(type ? pageHits : pageHits.slice(0, 5)))
  if (!type || type === 'articole') {
    const offset = (page - 1) * PER_PAGE
    const rows = await drizzle.execute(
      sql`select a.id, a.title, a.slug, a.category_id, a.published_at, ${ARTICLE_TEXT} as body, ${titleScore(sql`a.title`, terms)} as score
          from articles a where ${articleWhere}
          order by score desc, a.published_at desc limit ${PER_PAGE} offset ${offset}`,
    )
    for (const r of rows.rows) {
      const category = categories.find((c) => c.id === r.category_id)
      hits.push({
        id: r.id as number,
        title: r.title as string,
        href: `${category ? docPath(category) : ''}/${r.slug as string}`,
        crumb: (category?.breadcrumbs ?? []).map((b) => b.label).join(' / ') || 'Anunț',
        date: r.published_at ? new Date(r.published_at as string).toISOString() : null,
        snippet: snippet(r.body as string, terms),
      })
    }
  }

  let docs: Hit[] = []
  if (docRows.rows.length && (!type || type === 'documente')) {
    const found = await p.find({ collection: 'documents', where: { id: { in: docRows.rows.map((r) => r.id as number) } }, depth: 0, limit: 50, overrideAccess: false })
    docs = docRows.rows
      .map((r) => found.docs.find((d) => d.id === r.id))
      .filter((d) => !!d)
      .map((d) => ({ id: d.id, title: d.title, href: d.externalUrl || d.url || '#', crumb: d.filename ?? '', snippet: null }))
  }

  const total = type === 'articole' ? counts.articole : type === 'pagini' ? counts.pagini : type === 'documente' ? counts.documente : counts.articole + counts.pagini + counts.documente
  return { terms, total, counts, hits, docs }
}
