// Points links to files the import did not copy (old videos, folders, stray images) back at the old site,
// and old video-player links at the video file itself. Usage: npx tsx --env-file=.env.local scripts/import/fix-links.ts [--dry]
import { getPayload } from 'payload'

import config from '../../src/payload.config'
import { oldSiteHref } from './shared'

const DRY = process.argv.includes('--dry')
type Node = { type?: string; fields?: { url?: string; linkType?: string }; children?: Node[]; [k: string]: unknown }

function walk(node: unknown, changes: string[]) {
  if (!node || typeof node !== 'object') return
  const n = node as Node
  if ((n.type === 'link' || n.type === 'autolink') && n.fields?.linkType !== 'internal' && n.fields?.url) {
    const before = n.fields.url
    // Links the extractor resolved relative to the page they were on: keep only the part after the page path.
    const relative = before.match(/^\/[^%]*?\/(%2F.*)$/i)?.[1]
    const after = oldSiteHref(relative ?? before)
    if (after !== before && (after.startsWith('http') || relative)) {
      n.fields.url = after
      changes.push(`${before} -> ${after}`)
    }
  }
  for (const value of Object.values(n)) if (value && typeof value === 'object') walk(value, changes)
}

async function main() {
  const payload = await getPayload({ config: await config })
  for (const collection of ['articles', 'pages'] as const) {
    const { docs } = await payload.find({ collection, limit: 5000, depth: 0, pagination: false })
    for (const doc of docs) {
      const changes: string[] = []
      const data = collection === 'articles' ? { content: (doc as { content?: unknown }).content } : { layout: (doc as { layout?: unknown }).layout }
      walk(data, changes)
      if (!changes.length) continue
      console.log(`${collection} ${doc.id}: ${changes.length}\n  ${changes.slice(0, 3).join('\n  ')}`)
      if (!DRY) await payload.update({ collection, id: doc.id, data: data as never, depth: 0 })
    }
  }
  process.exit(0)
}

main()
