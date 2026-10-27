// Step 2: HEAD every document linked from the old site and record status + size in .import-cache/sizes.json.
// Usage: npx tsx scripts/import/sizes.ts [extra-urls.txt]
import fs from 'node:fs/promises'
import path from 'node:path'

import { CACHE, DATA, OLD_SITE } from './shared'

export type SizeInfo = { status: number; bytes: number | null; finalUrl: string }

export function normalizeDocUrl(raw: string): string | null {
  try {
    const url = new URL(raw.trim(), OLD_SITE)
    if (!/^(www\.)?colegiulnegruzzi\.ro$/.test(url.hostname)) return url.href
    url.protocol = 'http:'
    url.hostname = 'colegiulnegruzzi.ro'
    url.hash = ''
    return url.href
  } catch {
    return null
  }
}

async function head(url: string): Promise<SizeInfo> {
  for (const method of ['HEAD', 'GET'] as const) {
    try {
      const res = await fetch(url, { method, redirect: 'follow', headers: { 'User-Agent': 'negruzzi-redesign-import' } })
      if (method === 'GET') res.body?.cancel()
      const len = res.headers.get('content-length')
      const type = res.headers.get('content-type') ?? ''
      // Joomla answers missing files with an HTML 404 page, sometimes with status 200.
      const status = res.ok && type.includes('text/html') ? 404 : res.status
      if (status === 405 && method === 'HEAD') continue
      return { status, bytes: len ? Number(len) : null, finalUrl: res.url }
    } catch {
      if (method === 'GET') return { status: 0, bytes: null, finalUrl: url }
    }
  }
  return { status: 0, bytes: null, finalUrl: url }
}

async function main() {
  const file = path.join(CACHE, 'sizes.json')
  const sizes: Record<string, SizeInfo> = JSON.parse(await fs.readFile(file, 'utf8').catch(() => '{}'))
  const lines = (await fs.readFile(path.join(DATA, 'documents.txt'), 'utf8')).split('\n')
  const extra = process.argv[2] ? (await fs.readFile(process.argv[2], 'utf8')).split('\n') : []
  const urls = new Set<string>()
  for (const line of [...lines.map((l) => l.split('\t')[1] ?? ''), ...extra]) {
    const url = line && normalizeDocUrl(line)
    if (url && !sizes[url]) urls.add(url)
  }
  const queue = [...urls]
  let done = 0
  async function worker() {
    for (let url = queue.shift(); url; url = queue.shift()) {
      sizes[url] = await head(url)
      if (++done % 100 === 0) console.log(`${done}/${urls.size}`)
    }
  }
  await Promise.all(Array.from({ length: 4 }, worker))
  await fs.mkdir(CACHE, { recursive: true })
  await fs.writeFile(file, JSON.stringify(sizes, null, 1))
  const ok = Object.values(sizes).filter((s) => s.status === 200)
  const total = ok.reduce((n, s) => n + (s.bytes ?? 0), 0)
  console.log(`checked ${Object.keys(sizes).length}: ${ok.length} ok, ${(total / 2 ** 30).toFixed(2)} GB`)
}

if (process.argv[1]?.endsWith('sizes.ts')) main()
