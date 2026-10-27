import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { DEMO_COOKIE, isValidAccessToken } from '@/lib/demo-gate'

const LOGIN_PATH = '/acces'

function noindex(response: NextResponse) {
  response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  return response
}

export async function proxy(request: NextRequest) {
  const password = process.env.DEMO_PASSWORD
  const { pathname, search } = request.nextUrl

  // No password configured (local dev): the gate is off.
  if (!password || pathname === LOGIN_PATH) return noindex(NextResponse.next())

  if (await isValidAccessToken(request.cookies.get(DEMO_COOKIE)?.value, password)) {
    return noindex(NextResponse.next())
  }

  if (pathname.startsWith('/api')) {
    return noindex(NextResponse.json({ error: 'Demo protejat cu parolă' }, { status: 401 }))
  }

  const login = new URL(LOGIN_PATH, request.url)
  login.searchParams.set('next', pathname + search)
  return noindex(NextResponse.redirect(login))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt).*)'],
}
