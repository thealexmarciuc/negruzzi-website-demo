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
