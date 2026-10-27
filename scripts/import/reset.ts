// Removes everything the import created (never users or site settings) and its state file.
// Usage: npx tsx --env-file=.env.local scripts/import/reset.ts
import fs from 'node:fs/promises'
import path from 'node:path'
import { getPayload } from 'payload'

import config from '../../src/payload.config'
import { CACHE } from './shared'

const COLLECTIONS = ['redirects', 'articles', 'pages', 'documents', 'media', 'categories'] as const

async function main() {
  const payload = await getPayload({ config: await config })
  for (const collection of COLLECTIONS) {
    const { docs } = await payload.delete({ collection, where: { id: { exists: true } }, overrideAccess: true })
    console.log(`${collection}: deleted ${docs.length}`)
  }
  await fs.rm(path.join(CACHE, 'state.json'), { force: true })
  process.exit(0)
}

main()
