'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { DEMO_COOKIE, DEMO_COOKIE_MAX_AGE, accessToken, safeNextPath } from '@/lib/demo-gate'

export async function enterDemo(formData: FormData) {
  const password = process.env.DEMO_PASSWORD
  const next = safeNextPath(formData.get('next')?.toString())
  const attempt = formData.get('password')?.toString() ?? ''

  if (!password) redirect(next)

  if (attempt !== password) {
    redirect(`/acces?eroare=1&next=${encodeURIComponent(next)}`)
  }

  const jar = await cookies()
  jar.set(DEMO_COOKIE, await accessToken(password), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: DEMO_COOKIE_MAX_AGE,
    path: '/',
  })
  redirect(next)
}
