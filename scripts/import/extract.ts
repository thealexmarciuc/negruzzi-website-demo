// Step 3: turn cached HTML into clean records in .import-cache/content.json.
// Usage: npx tsx scripts/import/extract.ts
import fs from 'node:fs/promises'
import path from 'node:path'
import { JSDOM } from 'jsdom'

import { CACHE, OLD_SITE, cacheFile, readInventory } from './shared'
import { normalizeDocUrl } from './sizes'

export type Attachment = { title: string; url: string }
export type ImageRef = { src: string; alt: string }
export type Record = {
  path: string
  template: string
  kind: 'article' | 'page' | 'listing'
  title: string
  publishedAt: string | null
  updatedAt: string | null
  crumbs: { href: string; label: string }[]
  html: string
  attachments: Attachment[]
  embeds: string[]
  images: ImageRef[]
  gallery: ImageRef[]
}

const DOC_EXT = /\.(pdf|docx?|xlsx?|pptx?|zip|rar|odt|ods)(\?|#|$)/i
const KEEP_ATTRS: { [tag: string]: string[] } = { A: ['href'], IMG: ['src', 'alt'], TD: ['colspan', 'rowspan'], TH: ['colspan', 'rowspan'] }
const UNWRAP = new Set(['SPAN', 'FONT', 'DIV', 'SECTION', 'CENTER', 'SMALL', 'BIG'])
const DROP = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'FORM', 'INPUT', 'BUTTON', 'NOSCRIPT', 'OBJECT', 'EMBED'])

const text = (s: string | null | undefined) => (s ?? '').replace(/\s+/g, ' ').trim()

function kindOf(template: string, rowPath: string): Record['kind'] {
  if (rowPath.includes('/item/')) return 'article'
  if (/^03/.test(template)) return 'listing'
  return 'page'
}

function absolute(href: string) {
  try {
    return new URL(href, OLD_SITE).href
  } catch {
    return href
  }
}

function docTitle(raw: string, url: string) {
  const cleaned = text(raw)
    .replace(/\[\s*(pdf|docx?|xlsx?|zip|rar|doc)\s*\]/gi, '')
    .replace(/\(\s*(pdf|docx?|xlsx?|zip)\s*\)/gi, '')
    .replace(/[\s\-–:|]+$/g, '')
    .trim()
  if (cleaned.length >= 3 && !/^(pdf|docx?|aici|click|descarc[aă]|download)$/i.test(cleaned)) return cleaned
  const file = decodeURIComponent(new URL(url).pathname.split('/').pop() ?? 'document')
  return file.replace(/\.[a-z0-9]+$/i, '').replace(/[_-]+/g, ' ').trim()
}

export function extract(html: string, row: { path: string; template: string; title: string }): Record {
  const dom = new JSDOM(html)
  const doc = dom.window.document
  const ld = html.match(/"datePublished":\s*"([^"]+)"/)?.[1] ?? null
  const modified = html.match(/"dateModified":\s*"([^"]+)"/)?.[1] ?? null
  const crumbs = [...doc.querySelectorAll('.envor-desktop-breadscrubs-inner a')]
    .map((a) => ({ href: a.getAttribute('href') ?? '', label: text(a.textContent) }))
    .filter((c) => c.href && c.href !== '/')

  const article = doc.querySelector('article.envor-post')
  const title =
    text(article?.querySelector('header h3 span')?.textContent) || text(doc.querySelector('h1')?.textContent) || row.title

  const empty: Record = {
    path: row.path, template: row.template, kind: kindOf(row.template, row.path), title,
    publishedAt: ld, updatedAt: modified, crumbs, html: '', attachments: [], embeds: [], images: [], gallery: [],
  }
  if (!article) return empty

  const inner = article.innerHTML
  const start = inner.indexOf('</header>')
  const end = inner.indexOf('<!-- Plugins: AfterDisplayContent -->')
  if (start < 0) return empty
  const body = JSDOM.fragment(`<div>${inner.slice(start + 9, end > start ? end : undefined)}</div>`).firstElementChild!

  // Embedded PDF viewers (ARI Docs): keep the file URL, drop the widget.
  const embeds: string[] = []
  for (const frame of [...body.querySelectorAll('iframe')]) {
    const src = frame.getAttribute('src') ?? ''
    const file = src.includes('viewer.htm') ? new URL(src, OLD_SITE).searchParams.get('file') : null
    if (file) {
      const url = normalizeDocUrl(decodeURIComponent(file))
      if (url) embeds.push(url)
    }
    ;(frame.closest('.aridoc-container') ?? frame).remove()
  }

  // Simple Image Gallery shows a spacer gif; the real photo is the link target.
  for (const link of [...body.querySelectorAll('a.sigFreeLink')]) {
    const img = doc.createElement('img')
    img.setAttribute('src', link.getAttribute('href') ?? '')
    img.setAttribute('alt', '')
    link.replaceWith(img)
  }
  for (const el of [...body.querySelectorAll('*')].reverse()) {
    if (DROP.has(el.tagName)) el.remove()
  }
  // The old PDF viewer prints its own error for missing files; that text is not content.
  const walker = doc.createTreeWalker(body, dom.window.NodeFilter.SHOW_TEXT)
  const viewerErrors: Node[] = []
  for (let n = walker.nextNode(); n; n = walker.nextNode()) if (/ARI Docs Viewer:/.test(n.textContent ?? '')) viewerErrors.push(n)
  for (const n of viewerErrors) n.textContent = (n.textContent ?? '').replace(/ARI Docs Viewer:[^]*?case sensitive.?/g, '')
  for (const i of [...body.querySelectorAll('i')]) if (!text(i.textContent)) i.remove()

  // Paragraphs and list items that are just "Name of document [PDF]" become attachments.
  const attachments: Attachment[] = []
  for (const block of [...body.querySelectorAll('p, li, h4, h5, h6')]) {
    const links = [...block.querySelectorAll('a[href]')]
    if (!links.length) continue
    const docLinks = links.filter((a) => DOC_EXT.test(a.getAttribute('href') ?? ''))
    if (docLinks.length !== links.length || text(block.textContent).length > 260) continue
    if (block.querySelector('img, table')) continue
    for (const a of docLinks) {
      const url = normalizeDocUrl(a.getAttribute('href')!)
      if (!url) continue
      const label = docLinks.length === 1 ? block.textContent : a.textContent
      attachments.push({ title: docTitle(label ?? '', url), url })
    }
    block.remove()
  }
  for (const list of [...body.querySelectorAll('ul, ol')]) if (!list.querySelector('li')) list.remove()
  // One entry per file, in the order the old page listed them.
  const seen = new Set<string>()
  const ordered = attachments
    .filter((a) => !seen.has(a.url) && seen.add(a.url))
    .map((a) => ({ a, at: inner.indexOf(new URL(a.url).pathname.split('/').pop() ?? '') }))
    .sort((x, y) => x.at - y.at)
    .map((x) => x.a)

  const images: ImageRef[] = []
  for (const img of [...body.querySelectorAll('img')]) {
    const src = img.getAttribute('src')
    if (!src || src.startsWith('data:')) {
      img.remove()
      continue
    }
    images.push({ src: absolute(src), alt: text(img.getAttribute('alt')) })
    img.setAttribute('src', absolute(src))
  }

  // Strip presentation: inline styles, classes, wrappers, empty paragraphs.
  for (const el of [...body.querySelectorAll('*')].reverse()) {
    for (const attr of [...el.attributes]) {
      if (!(KEEP_ATTRS[el.tagName] ?? []).includes(attr.name)) el.removeAttribute(attr.name)
    }
    if (el.tagName === 'A') {
      const href = el.getAttribute('href') ?? ''
      el.setAttribute('href', DOC_EXT.test(href) ? (normalizeDocUrl(href) ?? href) : absolute(href))
    }
    if (UNWRAP.has(el.tagName)) el.replaceWith(...el.childNodes)
  }
  for (const p of [...body.querySelectorAll('p')]) {
    if (!text(p.textContent) && !p.querySelector('img, br + *')) p.remove()
  }

  let gallery: ImageRef[] = []
  if (images.length >= 6) {
    // Photo-heavy posts: the photos move to the gallery, the text stays.
    gallery = images
    for (const img of [...body.querySelectorAll('img')]) img.remove()
    for (const p of [...body.querySelectorAll('p')]) if (!text(p.textContent)) p.remove()
  }

  const htmlOut = body.innerHTML.replace(/<!--[\s\S]*?-->/g, '').replace(/ |&nbsp;/g, ' ').trim()
  return { ...empty, html: htmlOut, attachments: ordered, embeds: [...new Set(embeds)], images: gallery.length ? [] : images, gallery }
}

async function main() {
  const rows = (await readInventory()).filter((r) => !/^(skip|03 News \/ category listing \(paged\)|16 |17 )/.test(r.template))
  const out: Record[] = []
  let missing = 0
  for (const row of rows) {
    const html = await fs.readFile(cacheFile('html', row.path, '.html'), 'utf8').catch(() => null)
    if (!html) {
      missing++
      continue
    }
    out.push(extract(html, row))
  }
  await fs.writeFile(path.join(CACHE, 'content.json'), JSON.stringify(out, null, 1))
  const docs = new Set(out.flatMap((r) => [...r.attachments.map((a) => a.url), ...r.embeds]))
  const inline = new Set(out.flatMap((r) => [...r.html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]).filter((h) => DOC_EXT.test(h))))
  await fs.writeFile(path.join(CACHE, 'doc-urls.txt'), [...docs, ...inline].join('\n'))
  console.log(
    `records ${out.length} (missing html ${missing}); articles ${out.filter((r) => r.kind === 'article').length}, pages ${out.filter((r) => r.kind === 'page').length}; ` +
      `attachments ${out.reduce((n, r) => n + r.attachments.length, 0)}, embeds ${out.reduce((n, r) => n + r.embeds.length, 0)}, ` +
      `inline doc links ${inline.size}, images ${out.reduce((n, r) => n + r.images.length + r.gallery.length, 0)}, no date ${out.filter((r) => r.kind === 'article' && !r.publishedAt).length}`,
  )
}

if (process.argv[1]?.endsWith('extract.ts')) main()
