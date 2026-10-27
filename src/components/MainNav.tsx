'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useRef } from 'react'

import { ArrowRight, ChevronDown, Menu, Search } from './icons'

export type NavItem = { label: string; description: string; href: string; target?: string; rel?: string }
export type NavSection = { label: string; href: string; columns: { heading: string; items: NavItem[] }[] }

const isIn = (path: string, href: string) => href !== '#' && href !== '/' && (path === href || path.startsWith(`${href}/`))

export function MainNav({ sections }: { sections: NavSection[] }) {
  const path = usePathname()
  const mobile = useRef<HTMLDetailsElement>(null)
  // The mega menu stays open while it has focus; move focus away after following a link.
  useEffect(() => {
    if (mobile.current) mobile.current.open = false
    if (document.activeElement instanceof HTMLElement && document.activeElement.closest('.mega')) document.activeElement.blur()
  }, [path])

  const current = sections.find((s) => isIn(path, s.href) || s.columns.some((c) => c.items.some((i) => isIn(path, i.href))))
  const last = sections.length - 1

  return (
    <header className="site-header">
      <div className="wrap">
        <Link className="site-header__logo" href="/" aria-label="Colegiul Național „Costache Negruzzi” Iași, prima pagină">
          <img src="/site/logo.png" alt="Colegiul Național Costache Negruzzi Iași" width={529} height={170} />
        </Link>

        <nav className="main-nav" aria-label="Meniu principal">
          {sections.map((section, i) => (
            <div className="nav-item" key={section.label}>
              <Link
                className={`nav-link${i === last ? ' nav-link--cta' : ''}`}
                href={section.href}
                aria-current={section === current ? 'true' : undefined}
              >
                {section.label}
              </Link>
              {section.columns.length > 0 && (
                <div className="mega" role="region" aria-label={section.label}>
                  <div className="wrap">
                    <div className="mega__head">
                      <span className="mega__title">{section.label}</span>
                      <Link className="mega__all" href={section.href}>
                        Vezi toată secțiunea <ArrowRight size={14} />
                      </Link>
                    </div>
                    <div className="mega__cols">
                      {section.columns.map((column) => (
                        <div className="mega__col" key={column.heading}>
                          {column.heading && <span className="mega__heading">{column.heading}</span>}
                          {column.items.map((item) => (
                            <Link className="mega__link" key={item.href + item.label} href={item.href} target={item.target} rel={item.rel}>
                              <span>{item.label}</span>
                              {item.description && <span>{item.description}</span>}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          <Link className="icon-button" href="/cautare" aria-label="Căutare">
            <Search />
          </Link>
        </nav>

        <details className="mobile-menu" ref={mobile}>
          <summary>
            <Menu /> Meniu
          </summary>
          <div className="mobile-menu__panel">
            <form className="mobile-menu__search" action="/cautare" role="search">
              <label className="sr-only" htmlFor="mobile-q">
                Caută pe site
              </label>
              <input className="input" id="mobile-q" name="q" type="search" placeholder="Caută pe site" />
              <button className="button" type="submit">
                Caută
              </button>
            </form>
            {sections.map((section) => (
              <details key={section.label} open={section === current}>
                <summary>
                  {section.label} <ChevronDown />
                </summary>
                <ul>
                  <li>
                    <Link href={section.href}>
                      <strong>Toată secțiunea {section.label}</strong>
                    </Link>
                  </li>
                  {section.columns.flatMap((column) =>
                    column.items.map((item) => (
                      <li key={item.href + item.label}>
                        <Link href={item.href} target={item.target} rel={item.rel}>
                          {item.label}
                        </Link>
                      </li>
                    )),
                  )}
                </ul>
              </details>
            ))}
          </div>
        </details>
      </div>
    </header>
  )
}
