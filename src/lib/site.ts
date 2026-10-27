import { getPayload, type Where } from 'payload'
import { cache } from 'react'

import config from '@/payload.config'
import type { Article, Category, Document, Media, Page } from '@/payload-types'

export const payload = cache(async () => getPayload({ config: await config }))

// Visitors only ever see published content: every read goes through the collection's access rules.
const visitor = { overrideAccess: false } as const

export const getNavigation = cache(async () => (await payload()).findGlobal({ slug: 'navigation', depth: 2, ...visitor }))
export const getSettings = cache(async () => (await payload()).findGlobal({ slug: 'site-settings', depth: 2, ...visitor }))
export const getHomepage = cache(async () => (await payload()).findGlobal({ slug: 'homepage', depth: 2, ...visitor }))

export const getCategories = cache(async () => {
  const { docs } = await (await payload()).find({ collection: 'categories', limit: 500, depth: 0, pagination: false, ...visitor })
  return docs
})

type Breadcrumbed = { breadcrumbs?: { url?: string | null; label?: string | null; doc?: unknown }[] | null }

export function docPath(doc: Breadcrumbed | null | undefined) {
  return doc?.breadcrumbs?.at(-1)?.url ?? '/'
}

export function articlePath(article: Pick<Article, 'slug' | 'category'>, categories?: Category[]) {
  const category =
    typeof article.category === 'object' ? article.category : categories?.find((c) => c.id === article.category)
  return `${category ? docPath(category) : ''}/${article.slug}`
}

type LinkValue = {
  type?: ('internal' | 'external') | null
  url?: string | null
  newTab?: boolean | null
  reference?:
    | { relationTo: 'pages'; value: number | Page }
    | { relationTo: 'articles'; value: number | Article }
    | { relationTo: 'categories'; value: number | Category }
    | null
}

export function linkHref(link: LinkValue | null | undefined, categories?: Category[]): string {
  if (!link) return '#'
  if (link.type === 'external') return link.url || '#'
  const ref = link.reference
  if (!ref || typeof ref.value !== 'object') return '#'
  if (ref.relationTo === 'articles') return articlePath(ref.value as Article, categories)
  return docPath(ref.value as Breadcrumbed)
}

export function linkProps(link: LinkValue | null | undefined, categories?: Category[]) {
  const href = linkHref(link, categories)
  return link?.newTab ? { href, target: '_blank', rel: 'noopener noreferrer' } : { href }
}

const dateFormat = new Intl.DateTimeFormat('ro-RO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Bucharest' })
const dayFormat = new Intl.DateTimeFormat('ro-RO', { day: '2-digit', timeZone: 'Europe/Bucharest' })
const monthFormat = new Intl.DateTimeFormat('ro-RO', { month: 'short', timeZone: 'Europe/Bucharest' })

export const formatDate = (value?: string | null) => (value ? dateFormat.format(new Date(value)) : '')
export const dayOf = (value?: string | null) => (value ? dayFormat.format(new Date(value)) : '')
export const monthOf = (value?: string | null) => (value ? monthFormat.format(new Date(value)) : '')

// Lexical JSON to plain text, for excerpts.
type LexicalNode = { type?: string; text?: string; children?: LexicalNode[] }
export function plainText(state: { root?: LexicalNode } | null | undefined, max = 220) {
  const parts: string[] = []
  const walk = (node: LexicalNode) => {
    if (node.text) parts.push(node.text)
    for (const child of node.children ?? []) walk(child)
    if (node.type === 'paragraph' || node.type === 'heading') parts.push(' ')
  }
  if (state?.root) walk(state.root)
  const text = parts.join('').replace(/\s+/g, ' ').trim()
  return text.length > max ? `${text.slice(0, max).replace(/\s+\S*$/, '')}…` : text
}

export function excerptOf(article: Pick<Article, 'excerpt' | 'content'>, max?: number) {
  return article.excerpt || plainText(article.content as never, max)
}

export function imageOf(article: Pick<Article, 'heroImage' | 'gallery'>): Media | null {
  if (article.heroImage && typeof article.heroImage === 'object') return article.heroImage
  const first = article.gallery?.[0]
  return first && typeof first === 'object' ? first : null
}

// Document helpers: file kind badge, link and size.
export function docHref(doc: Document) {
  return doc.externalUrl || doc.url || '#'
}

export function docKind(doc: Document): { label: string; tone: 'pdf' | 'doc' | 'sheet' } {
  const name = (doc.filename || doc.externalUrl || '').toLowerCase()
  const ext = name.match(/\.([a-z0-9]+)(?:$|\?)/)?.[1] ?? ''
  if (ext === 'pdf') return { label: 'PDF', tone: 'pdf' }
  if (['xls', 'xlsx', 'ods', 'csv'].includes(ext)) return { label: ext.toUpperCase(), tone: 'sheet' }
  return { label: (ext || 'fișier').toUpperCase(), tone: 'doc' }
}

export function docSize(doc: Document) {
  const bytes = doc.filesize
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`
}

export const asDocs = (values: (number | Document)[] | null | undefined) =>
  (values ?? []).filter((d): d is Document => typeof d === 'object' && d !== null)

// Ids of a category and everything nested under it.
export function categoryTree(rootId: number, categories: Category[]) {
  const ids = new Set([rootId])
  let grew = true
  while (grew) {
    grew = false
    for (const c of categories) {
      const parent = typeof c.parent === 'object' ? c.parent?.id : c.parent
      if (parent && ids.has(parent) && !ids.has(c.id)) {
        ids.add(c.id)
        grew = true
      }
    }
  }
  return [...ids]
}

export async function findArticles(opts: { categoryIds?: number[]; where?: Where; limit?: number; page?: number }) {
  const and: Where[] = []
  if (opts.categoryIds) and.push({ category: { in: opts.categoryIds } })
  if (opts.where) and.push(opts.where)
  return (await payload()).find({
    collection: 'articles',
    where: and.length ? { and } : undefined,
    sort: '-publishedAt',
    limit: opts.limit ?? 10,
    page: opts.page ?? 1,
    depth: 1,
    select: { title: true, slug: true, publishedAt: true, category: true, excerpt: true, content: true, heroImage: true, gallery: true, attachmentGroups: true, embeddedDocument: true },
    ...visitor,
  })
}

export const countDocs = (article: Pick<Article, 'attachmentGroups' | 'embeddedDocument'>) =>
  (article.attachmentGroups ?? []).reduce((n, g) => n + (g.documents?.length ?? 0), 0) + (article.embeddedDocument ? 1 : 0)

// Resolves a public path to the thing it shows.
export type Resolved =
  | { kind: 'page'; page: Page }
  | { kind: 'category'; category: Category }
  | { kind: 'article'; article: Article }
  | { kind: 'redirect'; to: string }
  | { kind: 'none' }

export async function resolvePath(path: string): Promise<Resolved> {
  const p = await payload()
  // The breadcrumb query matches any crumb, so children of the page match too; keep the page itself.
  const pages = await p.find({ collection: 'pages', where: { 'breadcrumbs.url': { equals: path } }, limit: 100, depth: 2, ...visitor })
  const page = pages.docs.find((d) => docPath(d) === path)
  if (page) return { kind: 'page', page }

  const categories = await getCategories()
  const category = categories.find((c) => docPath(c) === path)
  if (category) return { kind: 'category', category }

  const slash = path.lastIndexOf('/')
  const parent = categories.find((c) => docPath(c) === path.slice(0, slash))
  if (parent) {
    const articles = await p.find({
      collection: 'articles',
      where: { and: [{ slug: { equals: path.slice(slash + 1) } }, { category: { equals: parent.id } }] },
      limit: 1,
      depth: 2,
      ...visitor,
    })
    if (articles.docs[0]) return { kind: 'article', article: articles.docs[0] }
  }

  const redirects = await p.find({ collection: 'redirects', where: { from: { equals: path } }, limit: 1, depth: 2, ...visitor })
  const redirect = redirects.docs[0]
  if (redirect) {
    const to = redirect.to?.type === 'custom' ? redirect.to.url : linkHref({ type: 'internal', reference: redirect.to?.reference as never }, categories)
    if (to && to !== '#') return { kind: 'redirect', to }
  }
  return { kind: 'none' }
}
