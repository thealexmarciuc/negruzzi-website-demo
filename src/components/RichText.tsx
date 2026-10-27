import { type JSXConvertersFunction, LinkJSXConverter, RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'
import React from 'react'

import { articlePath, docPath } from '@/lib/site'
import { slugify } from '@/lib/slugify'
import type { Article, Category, Media } from '@/payload-types'

type State = React.ComponentProps<typeof LexicalRichText>['data']
type TextNode = { text?: string; children?: TextNode[] }

export const headingText = (node: TextNode): string => (node.text ?? '') + (node.children ?? []).map(headingText).join('')

// Headings of a rich text value, with the ids the renderer gives them (for tables of contents).
export function headingsOf(data: unknown, tags = ['h2']) {
  const root = (data as { root?: { children?: (TextNode & { type?: string; tag?: string })[] } } | null)?.root
  return (root?.children ?? [])
    .filter((n) => n.type === 'heading' && tags.includes(n.tag ?? ''))
    .map((n) => ({ title: headingText(n).trim(), id: slugify(headingText(n)) }))
    .filter((h) => h.title)
}

const converters =
  (categories: Category[]): JSXConvertersFunction =>
  ({ defaultConverters }) => ({
    ...defaultConverters,
    ...LinkJSXConverter({
      internalDocToHref: ({ linkNode }) => {
        const doc = linkNode.fields.doc
        if (!doc || typeof doc.value !== 'object') return '#'
        return doc.relationTo === 'articles' ? articlePath(doc.value as unknown as Article, categories) : docPath(doc.value as never)
      },
    }),
    heading: ({ node, nodesToJSX }) => {
      const Tag = node.tag
      return <Tag id={slugify(headingText(node as unknown as TextNode))}>{nodesToJSX({ nodes: node.children })}</Tag>
    },
    upload: ({ node }) => {
      const media = node.value as Media
      if (typeof media !== 'object' || !media?.url) return null
      if (!media.mimeType?.startsWith('image')) return <a href={media.url}>{media.filename}</a>
      return <img src={media.url} alt={media.alt ?? ''} width={media.width ?? undefined} height={media.height ?? undefined} loading="lazy" />
    },
  })

export function RichText({ data, categories, className = 'prose' }: { data: unknown; categories: Category[]; className?: string }) {
  if (!data || typeof data !== 'object') return null
  return <LexicalRichText className={className} data={data as State} converters={converters(categories)} disableContainer={false} />
}
