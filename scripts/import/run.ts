// Step 4: write the extracted content into Payload (categories, documents, images, articles, pages, redirects).
// Re-runnable: .import-cache/state.json remembers what was already imported.
// Usage: npx tsx --env-file=.env.local scripts/import/run.ts [--limit 20] [--dry]

import { randomBytes } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { JSDOM } from 'jsdom'
import { getPayload, type Payload, type Where } from 'payload'
import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'

import config from '../../src/payload.config'
import { slugify } from '../../src/lib/slugify'
import type { Record as Content } from './extract'
import { CACHE } from './shared'
import type { SizeInfo } from './sizes'

const MB = 2 ** 20
const BLOB_BUDGET = 750 * MB
const args = process.argv.slice(2)
const LIMIT = args.includes('--limit') ? Number(args[args.indexOf('--limit') + 1]) : Infinity
const DRY = args.includes('--dry')
const ONLY = args.includes('--only') ? args[args.indexOf('--only') + 1].split(',') : null
// Re-imports records that already exist, updating them in place (ids and redirects stay valid).
const REFRESH = args.includes('--refresh')

type State = {
  categories: { [chain: string]: number }
  documents: { [url: string]: number | null }
  media: { [url: string]: number | null }
  articles: { [path: string]: number }
  pages: { [path: string]: number }
  redirects: { [from: string]: number }
  blobBytes: number
}

const stateFile = path.join(CACHE, 'state.json')
let state: State

async function saveState() {
  await fs.writeFile(stateFile, JSON.stringify(state, null, 1))
}

const OWN_HOST = /^https?:\/\/(www\.)?colegiulnegruzzi\.ro/i
const toPath = (href: string) => href.replace(OWN_HOST, '') || '/'

const DOC_TYPE_RULES: [RegExp, string][] = [
  [/declara[tț]i[ea]? de (avere|interese)|decl[_ ]?(avere|interese)/i, 'declaratie'],
  [/hot[aă]r[aâ]r|\bHCA\b|consiliul de administra/i, 'hotarare-ca'],
  [/regulament|ROFUIP|\bROI\b/i, 'regulament'],
  [/orar/i, 'orar'],
  [/rezultat|clasament|punctaj|admi[sș]i/i, 'rezultate'],
  [/achizi[tț]i|licita[tț]i|ofert/i, 'achizitie'],
  [/raport/i, 'raport'],
  [/cerere|formular|declara[tț]ie|acord|anex/i, 'formular'],
  [/metodologi|procedur|calendar/i, 'metodologie'],
  [/anun[tț]/i, 'anunt'],
]
const docType = (s: string) => DOC_TYPE_RULES.find(([re]) => re.test(s))?.[1] ?? 'altul'
const schoolYear = (s: string) => {
  const m = s.match(/(20\d\d)\s*[-–_]\s*(20\d\d)/)
  return m && Number(m[2]) === Number(m[1]) + 1 ? `${m[1]}-${m[2]}` : undefined
}

const MIME: { [ext: string]: string } = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  odt: 'application/vnd.oasis.opendocument.text',
  ods: 'application/vnd.oasis.opendocument.spreadsheet',
  zip: 'application/zip',
  rar: 'application/vnd.rar',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
}
const fileName = (url: string) => decodeURIComponent(new URL(url).pathname.split('/').pop() ?? 'fisier')
const ext = (url: string) => fileName(url).split('.').pop()?.toLowerCase() ?? ''

async function download(url: string) {
  const res = await fetch(url, { headers: { 'User-Agent': 'negruzzi-redesign-import' } })
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`)
  return Buffer.from(await res.arrayBuffer())
}

// --- categories -----------------------------------------------------------

async function ensureCategory(payload: Payload, crumbs: Content['crumbs']): Promise<number | undefined> {
  let parent: number | undefined
  for (let i = 0; i < crumbs.length; i++) {
    const chain = crumbs.slice(0, i + 1).map((c) => c.label).join(' > ')
    if (!state.categories[chain]) {
      const crumb = crumbs[i]
      if (DRY) return undefined
      const doc = await payload.create({
        collection: 'categories',
        data: { title: crumb.label, slug: slugify(crumb.label), parent, order: i },
      })
      state.categories[chain] = doc.id
    }
    parent = state.categories[chain]
  }
  return parent
}

// --- documents -------------------------------------------------------------

async function ensureDocument(payload: Payload, url: string, title: string, sizes: { [url: string]: SizeInfo }) {
  if (url in state.documents) return state.documents[url]
  const info = sizes[url]
  if (!info || info.status !== 200) {
    state.documents[url] = null // broken on the old site too: drop it
    return null
  }
  title = title.trim() || fileName(url).replace(/.[a-z0-9]+$/i, '').replace(/[_-]+/g, ' ')
  const kind = docType(`${title} ${url}`)
  const data = {
    title: title.slice(0, 250),
    docType: kind as never,
    schoolYear: schoolYear(`${title} ${url}`),
    sourceUrl: url,
  }
  if (DRY) return null
  const bytes = info.bytes ?? 0
  // Asset declarations hold personal data: link to the school's own copy instead of re-hosting it.
  const linkOnly = kind === 'declaratie' || state.blobBytes + bytes > BLOB_BUDGET || bytes > 60 * MB
  let doc
  if (linkOnly) {
    doc = await payload.create({ collection: 'documents', data: { ...data, externalUrl: url } })
  } else {
    const buffer = await download(url)
    doc = await payload.create({
      collection: 'documents',
      data,
      file: { data: buffer, mimetype: MIME[ext(url)] ?? 'application/octet-stream', name: fileName(url), size: buffer.length },
    })
    state.blobBytes += buffer.length
  }
  state.documents[url] = doc.id
  return doc.id
}

async function documentHref(payload: Payload, id: number) {
  const doc = await payload.findByID({ collection: 'documents', id, depth: 0 })
  return doc.externalUrl || doc.url || '#'
}

// --- images ----------------------------------------------------------------

async function ensureMedia(payload: Payload, src: string, alt: string) {
  if (src in state.media) return state.media[src]
  if (!/\.(jpe?g|png|gif|webp)(\?|$)/i.test(src) || DRY) return (state.media[src] = null)
  try {
    const buffer = await download(src)
    // Bullet icons and spacer gifs are not content.
    if (buffer.length < 6 * 1024 || state.blobBytes + buffer.length > BLOB_BUDGET + 150 * MB) return (state.media[src] = null)
    const doc = await payload.create({
      collection: 'media',
      data: { alt: alt.slice(0, 250) || 'Fotografie', sourceUrl: src },
      file: { data: buffer, mimetype: MIME[ext(src)] ?? 'image/jpeg', name: fileName(src), size: buffer.length },
    })
    state.blobBytes += buffer.length
    return (state.media[src] = doc.id)
  } catch (e) {
    console.warn('image skipped', src, (e as Error).message)
    return (state.media[src] = null)
  }
}

// --- rich text -------------------------------------------------------------

type LexicalNode = { type: string; children?: LexicalNode[]; text?: string; [k: string]: unknown }

async function toLexical(
  payload: Payload,
  editorConfig: Awaited<ReturnType<typeof editorConfigFactory.default>>,
  record: Content,
  sizes: { [url: string]: SizeInfo },
) {
  if (!record.html.trim()) return null
  const dom = new JSDOM(`<body>${record.html}</body>`)
  const body = dom.window.document.body

  for (const a of [...body.querySelectorAll('a[href]')]) {
    const href = a.getAttribute('href')!
    if (/\.(pdf|docx?|xlsx?|pptx?|zip|rar|odt|ods)(\?|#|$)/i.test(href)) {
      const id = await ensureDocument(payload, href, a.textContent?.trim() || fileName(href), sizes)
      if (id) a.setAttribute('href', await documentHref(payload, id))
      else a.replaceWith(...a.childNodes)
    } else if (OWN_HOST.test(href)) {
      a.setAttribute('href', toPath(href))
    }
  }

  // Images become standalone upload blocks; the marker is swapped for an upload node after conversion.
  for (const img of [...body.querySelectorAll('img')]) {
    const id = await ensureMedia(payload, img.getAttribute('src')!, img.getAttribute('alt') || record.title)
    let block: Element = img
    while (block.parentElement && block.parentElement !== body) block = block.parentElement
    if (id) {
      const marker = dom.window.document.createElement('p')
      marker.textContent = `[[img:${id}]]`
      block.after(marker)
    }
    img.remove()
  }

  const state = convertHTMLToLexical({ editorConfig, html: body.innerHTML, JSDOM })
  const swap = (nodes: LexicalNode[]): LexicalNode[] =>
    nodes.map((node) => {
      const only = node.type === 'paragraph' && node.children?.length === 1 ? node.children[0] : null
      const m = only?.text?.match(/^\[\[img:(\d+)\]\]$/)
      if (m) {
        return { type: 'upload', version: 3, format: '', id: randomBytes(12).toString('hex'), fields: null, relationTo: 'media', value: Number(m[1]) }
      }
      return node.children ? { ...node, children: swap(node.children) } : node
    })
  const root = state.root as unknown as LexicalNode
  root.children = swap(root.children ?? [])
  return state
}

// --- articles and pages ------------------------------------------------------

function legacySlug(p: string) {
  const last = p.split('/').pop() ?? ''
  return slugify(last.replace(/^\d+-/, '')) || slugify(last)
}

async function uniqueSlug(payload: Payload, collection: 'articles' | 'pages', slug: string, parent?: number) {
  for (let n = 1; ; n++) {
    const candidate = n === 1 ? slug : `${slug}-${n}`
    const where: Where = { slug: { equals: candidate } }
    if (collection === 'pages') where.parent = parent ? { equals: parent } : { exists: false }
    const found = await payload.find({ collection, where, limit: 1, depth: 0, draft: true })
    if (!found.docs.length) return candidate
  }
}

async function attachments(payload: Payload, record: Content, sizes: { [url: string]: SizeInfo }) {
  const ids: number[] = []
  for (const a of record.attachments) {
    const id = await ensureDocument(payload, a.url, a.title, sizes)
    if (id && !ids.includes(id)) ids.push(id)
  }
  const embedded: number[] = []
  for (const url of record.embeds) {
    const id = await ensureDocument(payload, url, record.title, sizes)
    if (id && !embedded.includes(id)) embedded.push(id)
  }
  return { ids, embedded }
}

async function importArticle(payload: Payload, record: Content, editorConfig: never, sizes: { [url: string]: SizeInfo }) {
  const existing = state.articles[record.path]
  if (existing && !REFRESH) return
  const category = await ensureCategory(payload, record.crumbs.length ? record.crumbs : [{ href: '/anunturi-top-menu', label: 'Anunţuri' }])
  const { ids, embedded } = await attachments(payload, record, sizes)
  const content = await toLexical(payload, editorConfig, record, sizes)
  const gallery: number[] = []
  for (const img of record.gallery) {
    const id = await ensureMedia(payload, img.src, img.alt || record.title)
    if (id) gallery.push(id)
  }
  if (DRY) return
  // The first embedded PDF is shown in the article; everything else is listed as an attachment.
  const listed = [...new Set([...embedded.slice(1), ...ids])].filter((id) => id !== embedded[0])
  const data = {
    title: record.title,
    _status: 'published' as const,
    publishedAt: record.publishedAt ?? new Date().toISOString(),
    category: category!,
    content: content as never,
    attachmentGroups: listed.length ? [{ documents: listed }] : [],
    embeddedDocument: embedded[0],
    gallery,
    legacyPath: record.path,
  }
  if (existing) {
    await payload.update({ collection: 'articles', id: existing, data })
    return
  }
  const doc = await payload.create({
    collection: 'articles',
    data: { ...data, slug: await uniqueSlug(payload, 'articles', legacySlug(record.path)) },
  })
  state.articles[record.path] = doc.id
}

const PAGE_TEMPLATE: [RegExp, string][] = [
  [/^04/, 'section'],
  [/^09/, 'history'],
  [/^10/, 'admission'],
  [/^11/, 'results'],
  [/^12/, 'project'],
  [/^15/, 'contact'],
]

async function importPage(
  payload: Payload,
  record: Content,
  all: Map<string, Content>,
  editorConfig: never,
  sizes: { [url: string]: SizeInfo },
): Promise<number | undefined> {
  const existing = state.pages[record.path]
  if (existing && !(REFRESH && all.has(record.path))) return existing
  const segments = record.path.split('/').filter(Boolean)
  let parent: number | undefined
  if (segments.length > 1) {
    const parentPath = '/' + segments.slice(0, -1).join('/')
    const parentRecord = all.get(parentPath)
    parent = parentRecord
      ? await importPage(payload, parentRecord, all, editorConfig, sizes)
      : await importPage(payload, placeholderSection(parentPath, record), all, editorConfig, sizes)
  }
  const { ids, embedded } = await attachments(payload, record, sizes)
  const content = await toLexical(payload, editorConfig, record, sizes)
  const layout: unknown[] = []
  if (content) layout.push({ blockType: 'richText', content })
  for (const id of embedded) layout.push({ blockType: 'embeddedDocument', document: id })
  if (ids.length) layout.push({ blockType: 'documentList', title: 'Documente', mode: 'manual', documents: ids })
  const gallery: number[] = []
  for (const img of record.gallery) {
    const id = await ensureMedia(payload, img.src, img.alt || record.title)
    if (id) gallery.push(id)
  }
  if (gallery.length) layout.push({ blockType: 'gallery', images: gallery })
  if (DRY) return undefined
  const data = {
    title: record.title,
    parent,
    _status: 'published' as const,
    template: (PAGE_TEMPLATE.find(([re]) => re.test(record.template))?.[1] ?? 'standard') as never,
    layout: layout as never,
    legacyPath: record.path,
  }
  if (existing) {
    await payload.update({ collection: 'pages', id: existing, data })
    return existing
  }
  const doc: { id: number } = await payload.create({
    collection: 'pages',
    data: { ...data, slug: await uniqueSlug(payload, 'pages', slugify(segments.at(-1) ?? 'pagina'), parent) },
  })
  state.pages[record.path] = doc.id
  await saveState()
  return doc.id
}

function placeholderSection(p: string, child: Content): Content {
  const label = child.crumbs.find((c) => toPath(c.href) === p)?.label ?? p.split('/').pop()!.replace(/-/g, ' ')
  return { ...child, path: p, template: '04 Section landing', title: label, html: '', attachments: [], embeds: [], images: [], gallery: [] }
}

// --- redirects -------------------------------------------------------------

async function ensureRedirect(payload: Payload, from: string, to: { relationTo: 'articles' | 'pages' | 'categories'; value: number }) {
  if (state.redirects[from] || DRY) return
  const doc = await payload.create({
    collection: 'redirects',
    data: { from, to: { type: 'reference', reference: to }, type: '301' } as never,
  })
  state.redirects[from] = doc.id
}

// --- main ------------------------------------------------------------------

async function main() {
  const payload = await getPayload({ config: await config })
  const editorConfig = (await editorConfigFactory.default({ config: payload.config })) as never
  const records: Content[] = JSON.parse(await fs.readFile(path.join(CACHE, 'content.json'), 'utf8'))
  const sizes: { [url: string]: SizeInfo } = JSON.parse(await fs.readFile(path.join(CACHE, 'sizes.json'), 'utf8'))
  state = JSON.parse(
    await fs.readFile(stateFile, 'utf8').catch(() =>
      JSON.stringify({ categories: {}, documents: {}, media: {}, articles: {}, pages: {}, redirects: {}, blobBytes: 0 }),
    ),
  )

  const pages = records.filter((r) => r.kind === 'page')
  const listings = records.filter((r) => r.kind === 'listing')
  const articles = records.filter((r) => r.kind === 'article').sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''))
  const byPath = new Map(pages.map((p) => [p.path, p]))

  let n = 0
  // --limit applies per kind, so a trial run covers both pages and articles.
  const selected = ONLY
    ? records.filter((r) => r.kind !== 'listing' && ONLY.some((o) => r.path.includes(o)))
    : [...pages.slice(0, LIMIT), ...articles.slice(0, LIMIT)]
  for (const record of selected) {
    n++
    try {
      if (record.kind === 'page') await importPage(payload, record, byPath, editorConfig, sizes)
      else await importArticle(payload, record, editorConfig, sizes)
    } catch (e) {
      console.error('failed', record.path, (e as Error).message)
    }
    if (n % 25 === 0) {
      await saveState()
      console.log(`${n} done, blob ${(state.blobBytes / MB).toFixed(0)} MB`)
    }
  }

  // Old addresses keep working: articles, listings (to their category) and pages whose path changed.
  for (const [from, id] of Object.entries(state.articles)) await ensureRedirect(payload, from, { relationTo: 'articles', value: id })
  for (const listing of listings) {
    const chain = [...listing.crumbs.map((c) => c.label), listing.title].join(' > ')
    const id = state.categories[chain] ?? state.categories[listing.crumbs.map((c) => c.label).join(' > ')]
    if (id) await ensureRedirect(payload, listing.path, { relationTo: 'categories', value: id })
  }
  await saveState()
  const docs = Object.values(state.documents)
  console.log(
    `articles ${Object.keys(state.articles).length}, pages ${Object.keys(state.pages).length}, categories ${Object.keys(state.categories).length}, ` +
      `documents ${docs.filter(Boolean).length} (dropped ${docs.filter((d) => !d).length}), images ${Object.values(state.media).filter(Boolean).length}, ` +
      `redirects ${Object.keys(state.redirects).length}, blob ${(state.blobBytes / MB).toFixed(0)} MB`,
  )
  process.exit(0)
}

main()
