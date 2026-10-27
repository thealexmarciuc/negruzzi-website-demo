import Link from 'next/link'
import React from 'react'

import { ArrowRight } from '@/components/icons'
import {
  articlePath,
  dayOf,
  docPath,
  excerptOf,
  findArticles,
  formatDate,
  getCategories,
  getHomepage,
  getNavigation,
  imageOf,
  linkProps,
  monthOf,
} from '@/lib/site'
import type { Category, Media } from '@/payload-types'

export const revalidate = 60

const NEWS_CHIPS = ['/anunturi', '/noutati/evenimente', '/noutati/achizitii-publice', '/noutati/mobilitate-personal-didactic']
const PARTNERS = ['Adservio', 'Microsoft Teams', 'Arcadia', 'Praxis', 'Oceanobe', 'Profesor în școala ta', 'eProf']

export default async function HomePage() {
  const [home, nav, categories] = await Promise.all([getHomepage(), getNavigation(), getCategories()])
  const { docs: latest } = await findArticles({ limit: 7 })
  const featured = latest.find((a) => imageOf(a)) ?? latest[0]
  const list = latest.filter((a) => a !== featured).slice(0, 6)
  const catTitle = (a: { category: number | Category }) =>
    typeof a.category === 'object' ? a.category.title : categories.find((c) => c.id === a.category)?.title
  const heroImage = typeof home.hero.image === 'object' ? (home.hero.image as Media) : null
  const section = (label: string) => nav.main?.find((s) => s.label === label)
  const admission = section('Admitere')?.columns?.flatMap((c) => c.items ?? []) ?? []
  const about = section('Despre noi')?.columns?.filter((c) => c.heading !== 'Școala').flatMap((c) => c.items ?? []) ?? []

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <div className="hero__text">
            {home.hero.eyebrow && <p className="eyebrow">{home.hero.eyebrow}</p>}
            <h1 className="hero__title">{home.hero.title}</h1>
            {home.hero.text && <p className="hero__lead">{home.hero.text}</p>}
            <div className="hero__actions">
              {(home.hero.actions ?? []).map((action, i) => (
                <Link key={action.id} className={`button ${i === 0 ? 'button--gold' : 'button--ghost'}`} {...linkProps(action.link, categories)}>
                  {action.label} {i === 0 && <ArrowRight />}
                </Link>
              ))}
            </div>
          </div>
          <div className="hero__media">
            <img src={heroImage?.url ?? '/site/cladire.jpg'} alt={heroImage?.alt ?? 'Clădirea colegiului'} fetchPriority="high" />
          </div>
        </div>
      </section>

      {!!home.audienceLinks?.length && (
        <section className="wrap quick" aria-label="Acces rapid">
          <div className="quick__grid">
            {home.audienceLinks.map((link) => (
              <Link key={link.id} className="quick__link" {...linkProps(link.link, categories)}>
                <span>{link.label}</span>
                {link.description && <span>{link.description}</span>}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="wrap" style={{ paddingTop: 88, paddingBottom: 24 }}>
        <div className="section-head">
          <div>
            <p className="eyebrow">Noutăți</p>
            <h2 className="h2">Anunțuri recente</h2>
          </div>
          <ul className="chips">
            {NEWS_CHIPS.map((path) => categories.find((c) => docPath(c) === path))
              .filter((c): c is Category => !!c)
              .map((c) => (
                <li key={c.id}>
                  <Link className="chip" href={docPath(c)}>
                    {c.title}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
        <div className="news">
          {featured && (
            <Link className="card feature" href={articlePath(featured, categories)}>
              <img src={imageOf(featured)?.url ?? '/site/internat.jpg'} alt="" loading="lazy" />
              <span className="feature__body">
                <span className="meta-row">
                  <span className="pill">{catTitle(featured)}</span>
                  <span>{formatDate(featured.publishedAt)}</span>
                </span>
                <span className="feature__title">{featured.title}</span>
                <span className="muted">{excerptOf(featured, 180)}</span>
              </span>
            </Link>
          )}
          <ul className="list-card news__list">
            {list.map((a) => (
              <li key={a.id}>
                <Link className="date-row" href={articlePath(a, categories)}>
                  <span className="date-row__date">
                    <span className="date-row__day">{dayOf(a.publishedAt)}</span>
                    <span className="date-row__mon">{monthOf(a.publishedAt)}</span>
                  </span>
                  <span className="date-row__text">
                    <span className="date-row__title">{a.title}</span>
                    <span className="small muted">{catTitle(a)}</span>
                  </span>
                </Link>
              </li>
            ))}
            <li className="list-card__foot">
              <Link className="arrow-link" href="/anunturi">
                Toate anunțurile <ArrowRight />
              </Link>
            </li>
          </ul>
        </div>
      </section>

      {admission.length > 0 && (
        <section className="wrap section">
          <div className="band">
            <div>
              <p className="eyebrow">Admitere</p>
              <h2 className="h2">Vrei să devii negruzzist?</h2>
              <p className="muted" style={{ margin: 0, maxWidth: 460 }}>
                Tot ce trebuie să știi despre înscriere, probe și calendar, într-un singur loc.
              </p>
            </div>
            <div className="band__grid">
              {admission.map((item) => (
                <Link key={item.id} className="card card-link" {...linkProps(item.link, categories)}>
                  <span className="card-link__title">{item.label}</span>
                  {item.description && <span className="small muted">{item.description}</span>}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {!!home.highlights?.length && (
        <section className="wrap" style={{ paddingTop: 16, paddingBottom: 72 }}>
          <div className="section-head">
            <div>
              <p className="eyebrow">Rezultate și proiecte</p>
              <h2 className="h2">Dincolo de catalog</h2>
            </div>
          </div>
          <div className="grid">
            {home.highlights.map((h) => (
              <Link key={h.id} className="card card-link program" {...linkProps(h.link, categories)}>
                <span className="card-link__title" style={{ fontSize: 22 }}>
                  {h.title}
                </span>
                {h.text && <span>{h.text}</span>}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="heritage">
        <div className="wrap">
          <div className="heritage__text">
            <p className="eyebrow">File de istorie</p>
            <h2 className="h2">Începuturile Liceului Internat</h2>
            <p>
              La 5 octombrie 1895, își deschidea porțile Liceul Internat din Iași, gândit ca un „centru de cultură de eminentă importanță”.
              De atunci, școala a trecut prin reforme, războaie și schimbări de nume, păstrându-și spiritul.
            </p>
            <div className="heritage__links">
              {about.map((item) => (
                <Link key={item.id} {...linkProps(item.link, categories)}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <ol className="timeline">
            <li>
              <span className="timeline__year">1895</span>
              <span>Se deschide Liceul Internat din Iași, pe 5 octombrie, cu 196 de elevi și 12 profesori în primul an.</span>
            </li>
            <li>
              <span className="timeline__year">2026</span>
              <span>Colegiul împlinește 131 de ani de la înființare.</span>
            </li>
          </ol>
        </div>
      </section>

      <section className="wrap" style={{ paddingTop: 48, paddingBottom: 48 }} aria-label="Parteneri și platforme">
        <p className="eyebrow eyebrow--muted" style={{ marginBottom: 18 }}>
          Parteneri și platforme
        </p>
        <ul className="partners">
          {PARTNERS.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </section>
    </>
  )
}
