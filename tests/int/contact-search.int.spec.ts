import { describe, expect, it } from 'vitest'

import { readContactForm, validateContact } from '@/lib/contact'
import { searchSite } from '@/lib/search'

const valid = { name: 'Ana Popescu', email: 'ana@example.com', subject: 'secretariat', message: 'Aș dori o adeverință de elev.', consent: true, website: '' }

describe('contact form validation', () => {
  it('accepts a complete message', () => {
    expect(validateContact(valid)).toEqual({})
  })

  it('flags each missing or invalid field', () => {
    const errors = validateContact({ name: 'A', email: 'nu-e-email', subject: 'altul', message: 'scurt', consent: false, website: '' })
    expect(Object.keys(errors ?? {}).sort()).toEqual(['consent', 'email', 'message', 'name', 'subject'])
  })

  it('reads and trims the submitted form', () => {
    const form = new FormData()
    form.set('name', '  Ana  ')
    form.set('email', ' ANA@Example.com ')
    form.set('consent', 'on')
    expect(readContactForm(form)).toMatchObject({ name: 'Ana', email: 'ana@example.com', consent: true, website: '' })
  })
})

describe('site search', () => {
  it('finds posts by title, ignoring diacritics', async () => {
    const plain = await searchSite({ q: 'scoala europeana' })
    const accented = await searchSite({ q: 'școala europeană' })
    expect(plain.total).toBeGreaterThan(0)
    expect(accented.total).toBe(plain.total)
  })

  it('returns nothing for gibberish and ignores one-letter queries', async () => {
    expect((await searchSite({ q: 'zzqxqzz' })).total).toBe(0)
    expect((await searchSite({ q: 'a' })).terms).toEqual([])
  })
})
