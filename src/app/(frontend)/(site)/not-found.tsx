import Link from 'next/link'
import React from 'react'

const POPULAR = [
  { title: 'Orar', sub: 'Elevi și profesori', href: '/elevi/orar' },
  { title: 'Anunțuri', sub: 'Cele mai noi informații', href: '/anunturi' },
  { title: 'Admitere clasa a V-a', sub: 'Testare și rezultate', href: '/admitere/clasa-a-v-a' },
  { title: 'Admitere clasa a IX-a', sub: 'Profiluri și calendar', href: '/admitere/clasa-a-ix-a' },
  { title: 'Planul sălilor', sub: 'Unde e fiecare clasă', href: '/organizare/planul-salilor' },
  { title: 'Informații de interes public', sub: 'Declarații, rapoarte, regulamente', href: '/organizare/informatii-de-interes-public' },
  { title: 'Achiziții publice', sub: 'Anunțuri și contracte', href: '/noutati/achizitii-publice' },
  { title: 'Contact', sub: 'Adresă, telefon, secretariat', href: '/despre-noi/contact' },
]

export default function NotFound() {
  return (
    <>
      <section className="wrap not-found">
        <div>
          <p className="eyebrow">Eroare 404</p>
          <h1 className="h1">Pagina pe care o cauți nu mai este aici</h1>
          <p className="lead">
            Poate a fost mutată când am reorganizat site-ul, sau linkul are o greșeală. Încearcă o căutare sau pornește de la una dintre
            paginile de mai jos.
          </p>
          <form className="search-form" action="/cautare" role="search">
            <label className="sr-only" htmlFor="q404">
              Caută pe site
            </label>
            <input className="input" id="q404" name="q" type="search" placeholder="De exemplu: orar, burse, admitere" />
            <button className="button" type="submit">
              Caută
            </button>
          </form>
        </div>
        <div className="not-found__code" aria-hidden="true">
          404
        </div>
      </section>
      <section className="wrap" style={{ paddingBottom: 80 }}>
        <h2 className="h3" style={{ marginBottom: 16 }}>
          Pagini căutate des
        </h2>
        <div className="grid">
          {POPULAR.map((p) => (
            <Link key={p.href} className="card card-link" href={p.href}>
              <span style={{ fontWeight: 600 }}>{p.title}</span>
              <span className="small muted">{p.sub}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
