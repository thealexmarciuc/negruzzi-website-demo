import type { Metadata } from 'next'

import { safeNextPath } from '@/lib/demo-gate'
import { enterDemo } from './actions'
import './acces.css'

export const metadata: Metadata = {
  title: 'Acces demo · Colegiul Național „Costache Negruzzi”',
  robots: { index: false, follow: false },
}

export default async function AccessPage(props: {
  searchParams: Promise<{ next?: string; eroare?: string }>
}) {
  const { next, eroare } = await props.searchParams

  return (
    <div className="gate">
      <form className="gate-card" action={enterDemo}>
        <p className="gate-eyebrow">Propunere de redesign · demo</p>
        <h1 className="gate-title">Colegiul Național „Costache Negruzzi” Iași</h1>
        <p className="gate-lead">
          Aceasta este o versiune demonstrativă a noului site. Introduceți parola primită pentru a o
          vizualiza.
        </p>

        <input type="hidden" name="next" value={safeNextPath(next)} />
        <label className="gate-label" htmlFor="password">
          Parolă
        </label>
        <input
          className="gate-input"
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          aria-invalid={eroare ? true : undefined}
          aria-describedby={eroare ? 'gate-error' : undefined}
        />
        {eroare && (
          <p className="gate-error" id="gate-error" role="alert">
            Parola nu este corectă. Încercați din nou.
          </p>
        )}
        <button className="gate-button" type="submit">
          Intră în demo
        </button>
      </form>
    </div>
  )
}
