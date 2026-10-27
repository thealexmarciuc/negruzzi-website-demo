// Joomla hid email addresses behind a script and left a placeholder sentence in the HTML.
// This decodes each address from the cached old page and swaps the placeholder for a mailto link.
// Usage: npx tsx --env-file=.env.local scripts/import/fix-emails.ts [--dry]
import fs from 'node:fs/promises'
import { getPayload } from 'payload'

import config from '../../src/payload.config'
import { cacheFile } from './shared'

const PLACEHOLDER = /Această adresă de email este protejată contra spambots\. Trebuie să activați JavaScript pentru a o vedea\.?/
const DRY = process.argv.includes('--dry')

const decodeEntities = (s: string) => s.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))

// Addresses in page order: `addy<id> = 'a' + '&#64;'; addy<id> = addy<id> + 'b' + '&#46;' + 'c';`
export function cloakedEmails(html: string) {
  const parts = new Map<string, string>()
  // Quoted pieces can contain `;` (inside &#111; entities), so they are matched whole.
  for (const m of html.matchAll(/addy([0-9a-f]{32}) = ((?:'[^']*'|[^;'])+);/g)) {
    const pieces = [...m[2].matchAll(/'([^']*)'/g)].map((p) => p[1]).join('')
    parts.set(m[1], (parts.get(m[1]) ?? '') + decodeEntities(pieces))
  }
  return [...parts.values()].filter((e) => /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(e))
}

type Node = { type?: string; text?: string; children?: Node[]; [k: string]: unknown }

function linkNode(email: string, format: unknown): Node {
  return {
    type: 'link',
    version: 3,
    direction: 'ltr',
    format: '',
    indent: 0,
    fields: { linkType: 'custom', url: `mailto:${email}`, newTab: false },
    children: [{ type: 'text', version: 1, text: email, format: format ?? 0, mode: 'normal', style: '', detail: 0 }],
  }
}

// Replaces placeholders left to right with the next decoded address.
function rewrite(node: Node, emails: string[]): number {
  if (!node.children) return 0
  let count = 0
  const out: Node[] = []
  for (const child of node.children) {
    if (child.type === 'text' && child.text && PLACEHOLDER.test(child.text) && emails.length) {
      const [before, after] = child.text.split(PLACEHOLDER)
      if (before) out.push({ ...child, text: before })
      out.push(linkNode(emails.shift()!, child.format))
      if (after) out.push({ ...child, text: after })
      count++
    } else {
      count += rewrite(child, emails)
      out.push(child)
    }
  }
  node.children = out
  return count
}

function stripPlaceholders(value: unknown, emails: string[]): number {
  if (!value || typeof value !== 'object') return 0
  const v = value as { root?: Node }
  if (v.root?.type === 'root') return rewrite(v.root, emails)
  return Object.values(value).reduce<number>((n, child) => n + stripPlaceholders(child, emails), 0)
}

async function main() {
  const payload = await getPayload({ config: await config })
  for (const collection of ['articles', 'pages'] as const) {
    const { docs } = await payload.find({ collection, limit: 5000, depth: 0, pagination: false })
    for (const doc of docs) {
      if (!JSON.stringify(doc).includes('protejată contra spambots') || !doc.legacyPath) continue
      const html = await fs.readFile(cacheFile('html', doc.legacyPath, '.html'), 'utf8').catch(() => '')
      const emails = cloakedEmails(html)
      const data = collection === 'articles' ? { content: (doc as { content?: unknown }).content } : { layout: (doc as { layout?: unknown }).layout }
      const fixed = stripPlaceholders(data, [...emails])
      console.log(`${collection} ${doc.id} ${doc.legacyPath}: ${fixed} fixed, emails ${emails.join(', ') || 'none'}`)
      if (fixed && !DRY) await payload.update({ collection, id: doc.id, data: data as never, depth: 0 })
    }
  }
  process.exit(0)
}

if (process.argv[1]?.endsWith('fix-emails.ts')) main()
