// Step 1: download the HTML of every page worth importing into .import-cache/html (polite: 4 at a time).
// Usage: npx tsx scripts/import/fetch.ts
import fs from 'node:fs/promises'
import path from 'node:path'

import { CACHE, OLD_SITE, cacheFile, readInventory } from './shared'

const SKIP = /^(skip|03 News \/ category listing \(paged\)|16 Search|17 Broken)/

async function main() {
  const rows = (await readInventory()).filter((r) => !SKIP.test(r.template))
  await fs.mkdir(path.join(CACHE, 'html'), { recursive: true })
  let done = 0
  let failed = 0
  const queue = [...rows]

  async function worker() {
    for (let row = queue.shift(); row; row = queue.shift()) {
      const file = cacheFile('html', row.path, '.html')
      const exists = await fs.stat(file).then(() => true, () => false)
      if (!exists) {
        try {
          const res = await fetch(OLD_SITE + row.path, { headers: { 'User-Agent': 'negruzzi-redesign-import' } })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          await fs.writeFile(file, await res.text())
          await new Promise((r) => setTimeout(r, 200))
        } catch (e) {
          failed++
          console.error('failed', row.path, (e as Error).message)
        }
      }
      if (++done % 50 === 0) console.log(`${done}/${rows.length}`)
    }
  }

  await Promise.all(Array.from({ length: 4 }, worker))
  console.log(`done: ${rows.length - failed} cached, ${failed} failed`)
}

main()
