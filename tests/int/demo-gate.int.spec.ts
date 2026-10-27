import { describe, expect, it } from 'vitest'

import { accessToken, isValidAccessToken, safeNextPath } from '@/lib/demo-gate'

describe('demo gate', () => {
  it('derives the same token for the same password', async () => {
    expect(await accessToken('parola')).toBe(await accessToken('parola'))
  })

  it('accepts the token for the current password only', async () => {
    const token = await accessToken('parola')
    expect(await isValidAccessToken(token, 'parola')).toBe(true)
    expect(await isValidAccessToken(token, 'alta-parola')).toBe(false)
    expect(await isValidAccessToken(undefined, 'parola')).toBe(false)
    expect(await isValidAccessToken('', 'parola')).toBe(false)
  })

  it('never stores the password itself in the token', async () => {
    expect(await accessToken('parola')).not.toContain('parola')
  })

  it('only redirects back to paths on this site', () => {
    expect(safeNextPath('/anunturi?pagina=2')).toBe('/anunturi?pagina=2')
    expect(safeNextPath('https://evil.example')).toBe('/')
    expect(safeNextPath('//evil.example')).toBe('/')
    expect(safeNextPath('/\\evil.example')).toBe('/')
    expect(safeNextPath(undefined)).toBe('/')
  })
})
