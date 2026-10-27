// One-off tidy-up of the imported pages, so the specialised templates have something to show:
// - links each page to the category its posts live in (feedCategory)
// - gives pages readable addresses, with redirects from the old ones
// - unpublishes duplicates and old K2 list pages, redirecting them to the real page
// - turns bold-only paragraphs on history pages into headings (for the table of contents)
// - drops "citește restul" list stubs left over from K2
// - adds the school leadership to People
// Safe to re-run. Usage: npx tsx --env-file=.env.local scripts/cleanup-content.ts
import { getPayload, type Payload } from 'payload'

import config from '../src/payload.config'
import type { Category, Page } from '../src/payload-types'

type Target = { relationTo: 'pages' | 'categories'; value: number }

const url = (doc: { breadcrumbs?: { url?: string | null }[] | null }) => doc.breadcrumbs?.at(-1)?.url ?? ''

// Page path -> category path, where they do not already match.
const FEEDS: Record<string, string> = {
  '/proiecte/proiecte-internationale/erasmus/acreditare-erasmus-2022-2028': '/proiecte/proiecte-internationale/erasmus/acreditare-erasmus-vet',
  '/rezultate/competitii-rezultate': '/competitii',
  '/elevi/centrul-de-excelenta-negruzzi-invatamant-primar-matematica': '/centrul-de-excelenta-negruzzi-invatamant-primar-matematica',
  '/elevi/consiliul-elevilor1': '/consiliul-scolar-al-elevilor',
  '/organizare/ceac-main-2': '/organizare/comisia-pentru-evaluarea-si-asigurarea-calitatii-ceac',
}

// Page path -> new slug (the last segment of the address).
const SLUGS: Record<string, string> = {
  '/despre-noi/contact22222': 'contact',
  '/organizare/salariile-functiilor-2': 'planul-salilor',
  '/organizare/ceac-main-2': 'ceac',
  '/organizare/consiliul-de-administratie-main': 'consiliul-de-administratie',
  '/organizare/biblioteca-main': 'biblioteca',
  '/elevi/biblioteca-main-3': 'biblioteca',
  '/elevi/consiliul-elevilor1': 'consiliul-elevilor',
  '/organizare/rofuip-menu': 'rofuip',
  '/organizare/regulament-intern-menu': 'regulament-intern',
  '/rezultate/competitii-rezultate': 'competitii',
  '/proiecte/proiecte-internationale/erasmus/acreditare-erasmus-2022-2028': 'acreditare-erasmus-vet',
  '/elevi/orar-elevi': 'orar',
}

const TEMPLATES: Record<string, Page['template']> = {
  '/organizare/informatii-de-interes-public': 'documents',
  '/noutati/achizitii-publice': 'documents',
  '/organizare/salariile-functiilor': 'documents',
  '/organizare/catedre': 'directory',
}

// Duplicates and K2 leftovers -> the page or category that replaces them.
const RETIRE: Record<string, string> = {
  '/noutati/latest': '/noutati',
  '/pagina': '/',
  '/noutati/orar': '/elevi/orar',
  '/orar-top-menu': '/elevi/orar',
  '/competitii-top-menu': '/rezultate/competitii',
}

async function all<T>(payload: Payload, collection: 'pages' | 'categories'): Promise<T[]> {
  const { docs } = await payload.find({ collection, limit: 1000, depth: 0, pagination: false, draft: false })
  return docs as T[]
}

async function redirect(payload: Payload, from: string, to: Target | string) {
  if (!from || from === '/') return
  const existing = await payload.find({ collection: 'redirects', where: { from: { equals: from } }, limit: 1, depth: 0 })
  const data = typeof to === 'string' ? { from, to: { type: 'custom', url: to }, type: '301' } : { from, to: { type: 'reference', reference: to }, type: '301' }
  if (existing.docs[0]) await payload.update({ collection: 'redirects', id: existing.docs[0].id, data: data as never })
  else await payload.create({ collection: 'redirects', data: data as never })
}

type Node = { type?: string; text?: string; format?: number | string; tag?: string; children?: Node[]; [k: string]: unknown }
const isBold = (n: Node) => n.type === 'text' && typeof n.format === 'number' && (n.format & 1) === 1
const textOf = (n: Node): string => (n.text ?? '') + (n.children ?? []).map(textOf).join('')

function headingsFromBold(root: Node) {
  let changed = 0
  root.children = (root.children ?? []).map((node) => {
    const kids = (node.children ?? []).filter((k) => textOf(k).trim() || k.type !== 'text')
    const text = textOf(node).trim()
    if (node.type === 'paragraph' && kids.length && kids.every(isBold) && text.length > 2 && text.length < 120) {
      changed++
      return {
        type: 'heading',
        tag: 'h2',
        version: 1,
        direction: 'ltr',
        format: '',
        indent: 0,
        children: kids.map((k) => ({ ...k, format: (k.format as number) & ~1 })),
      }
    }
    return node
  })
  return changed
}

const isStub = (block: { blockType: string; content?: { root?: Node } }) =>
  block.blockType === 'richText' &&
  !textOf(block.content?.root ?? {})
    .replace(/cite[şș]te restul/gi, '')
    .replace(/\d{2}\s+\d{2},\s+\d{4}/g, '')
    .trim()

const titleCase = (s: string) => s.toLocaleLowerCase('ro').replace(/(^|[\s-])(\p{L})/gu, (_, a, b) => a + b.toLocaleUpperCase('ro'))

async function main() {
  const payload = await getPayload({ config: await config })
  const categories = await all<Category>(payload, 'categories')
  const catAt = (path: string) => categories.find((c) => url(c) === path)

  // 1. Unpublish leftovers first, so slug changes below do not collide with them.
  for (const page of await all<Page>(payload, 'pages')) {
    const path = url(page)
    const itemlist = path.startsWith('/organizare/catedre/itemlist')
    if (!RETIRE[path] && !itemlist) continue
    if (page._status === 'published') await payload.update({ collection: 'pages', id: page.id, data: { _status: 'draft' } })
    const cat = itemlist ? categories.find((c) => c.title.toLowerCase() === page.title.toLowerCase() && url(c).startsWith('/organizare/catedre/')) : undefined
    await redirect(payload, path, cat ? { relationTo: 'categories', value: cat.id } : itemlist ? '/organizare/catedre' : RETIRE[path])
    console.log('retired', path)
  }

  // 2. Templates, feeds, stubs and headings.
  for (const page of await all<Page>(payload, 'pages')) {
    if (page._status !== 'published') continue
    const path = url(page)
    const data: Partial<Page> = {}
    const feed = catAt(FEEDS[path] ?? path)
    if (feed && (typeof page.feedCategory === 'object' ? page.feedCategory?.id : page.feedCategory) !== feed.id) data.feedCategory = feed.id
    if (TEMPLATES[path] && page.template !== TEMPLATES[path]) data.template = TEMPLATES[path]
    const layout = page.layout ?? []
    const kept = layout.filter((b) => !isStub(b as never))
    let headings = 0
    if (page.template === 'history') {
      for (const block of kept) if (block.blockType === 'richText' && block.content?.root) headings += headingsFromBold(block.content.root as Node)
    }
    if (kept.length !== layout.length || headings) data.layout = kept
    if (Object.keys(data).length) {
      await payload.update({ collection: 'pages', id: page.id, data })
      console.log('updated', path, Object.keys(data).join(','), headings ? `${headings} headings` : '')
    }
  }

  // 3. Readable addresses. Parents before children, so child paths are built from the new parent path.
  const pages = (await all<Page>(payload, 'pages')).sort((a, b) => url(a).length - url(b).length)
  for (const [oldPath, slug] of Object.entries(SLUGS)) {
    const page = pages.find((p) => url(p) === oldPath || p.legacyPath === oldPath)
    if (!page || page.slug === slug) continue
    const updated = await payload.update({ collection: 'pages', id: page.id, data: { slug } })
    await redirect(payload, oldPath, { relationTo: 'pages', value: page.id })
    console.log('renamed', oldPath, '->', url(updated))
  }

  // 4. Leadership, from the "Conducerea Colegiului" page.
  const leaders = [
    { name: 'Camelia Gavrilă', role: 'Director', title: 'Prof. Dr.', phone: '0232 210 510 / 0232 216 373' },
    { name: 'Mihaela Țura', role: 'Director adjunct', title: 'Prof.', phone: '0232 210 510' },
  ]
  for (const [i, leader] of leaders.entries()) {
    const existing = await payload.find({ collection: 'people', where: { name: { like: leader.name } }, limit: 1, depth: 0 })
    const data = { name: `${leader.title} ${titleCase(leader.name)}`, role: leader.role, groups: ['conducere'], order: i, bio: `Telefon: ${leader.phone}` }
    if (existing.docs[0]) await payload.update({ collection: 'people', id: existing.docs[0].id, data: data as never })
    else await payload.create({ collection: 'people', data: data as never })
  }
  console.log('people: leadership added')
  process.exit(0)
}

main()
