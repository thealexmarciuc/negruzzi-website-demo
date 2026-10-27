import { describe, expect, it } from 'vitest'

import { slugify } from '@/lib/slugify'

describe('slugify', () => {
  it('turns Romanian titles into readable URL slugs', () => {
    expect(slugify('Burse școlare 2026-2027')).toBe('burse-scolare-2026-2027')
    expect(slugify('Țară, Ăla, Îndrumări și Ştiri (cedilă)')).toBe('tara-ala-indrumari-si-stiri-cedila')
  })

  it('collapses punctuation and trims dashes', () => {
    expect(slugify('  „Costache Negruzzi” — Admitere!  ')).toBe('costache-negruzzi-admitere')
  })

  it('returns an empty string when nothing usable is left', () => {
    expect(slugify('—')).toBe('')
  })
})
