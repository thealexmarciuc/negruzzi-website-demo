import { createHash } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'

export const OLD_SITE = 'http://colegiulnegruzzi.ro'
export const CACHE = path.resolve('.import-cache')
export const DATA = path.resolve('scripts/import/data')

export type InventoryRow = { template: string; path: string; title: string }

// Minimal CSV reader for inventory.csv (quoted fields, commas inside quotes, BOM).
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  const src = text.replace(/^﻿/, '')
  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') (field += '"'), i++
      else if (c === '"') quoted = false
      else field += c
    } else if (c === '"') quoted = true
    else if (c === ',') row.push(field), (field = '')
    else if (c === '\n') row.push(field.replace(/\r$/, '')), rows.push(row), (row = []), (field = '')
    else field += c
  }
  if (field || row.length) row.push(field), rows.push(row)
  return rows
}

export async function readInventory(): Promise<InventoryRow[]> {
  const [header, ...rows] = parseCsv(await fs.readFile(path.join(DATA, 'inventory.csv'), 'utf8'))
  const col = (name: string) => header.indexOf(name)
  return rows
    .filter((r) => r.length > 1)
    .map((r) => ({ template: r[col('template')], path: r[col('path')], title: r[col('title')] }))
}

export function cacheFile(kind: string, key: string, ext: string) {
  const safe = key.replace(/[^a-zA-Z0-9-]+/g, '_').slice(-80)
  const hash = createHash('sha1').update(key).digest('hex').slice(0, 8)
  return path.join(CACHE, kind, `${safe}_${hash}${ext}`)
}

const OLD_HOST = /^https?:\/\/(www\.)?colegiulnegruzzi\.ro/i
const OLD_FILES = /^\/(_uploads|_multimedia|images|media|cache|components|plugins|templates)\//i

const decodeFully = (s: string) => {
  for (let i = 0; i < 3; i++) {
    try {
      const next = decodeURIComponent(s)
      if (next === s) break
      s = next
    } catch {
      break
    }
  }
  return s
}

// Where a link from old content should point on the new site. Pages become local paths;
// files that were not migrated (videos, folders, stray images) stay on the old site,
// and links to the old video player go straight to the video file.
export function oldSiteHref(href: string): string {
  const decoded = decodeFully(href)
  const video = decoded.match(/com_videogallerylite\/video_player\.php\?video_url=([^&#]+)/)?.[1]
  if (video) return `${OLD_SITE.replace(/\/$/, '')}${video.startsWith('/') ? '' : '/'}${video}`
  if (!OLD_HOST.test(href) && !href.startsWith('/')) return href
  const path = href.replace(OLD_HOST, '') || '/'
  return OLD_FILES.test(decodeFully(path)) ? `${OLD_SITE.replace(/\/$/, '')}${path}` : path
}
