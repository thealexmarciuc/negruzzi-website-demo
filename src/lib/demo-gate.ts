// Password gate for the demo. The cookie holds an HMAC of the password, never the password,
// so changing DEMO_PASSWORD in Vercel logs everyone out.

export const DEMO_COOKIE = 'negruzzi_demo'
export const DEMO_COOKIE_MAX_AGE = 60 * 60 * 24 * 30

const encoder = new TextEncoder()

export async function accessToken(password: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode('negruzzi-demo-access-v1'))
  return Array.from(new Uint8Array(signature), (b) => b.toString(16).padStart(2, '0')).join('')
}

export async function isValidAccessToken(token: string | undefined, password: string): Promise<boolean> {
  if (!token) return false
  const expected = await accessToken(password)
  if (token.length !== expected.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) diff |= token.charCodeAt(i) ^ expected.charCodeAt(i)
  return diff === 0
}

export function safeNextPath(next: string | undefined): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return '/'
  return next
}
