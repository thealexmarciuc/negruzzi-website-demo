import React from 'react'

import { getCategories, getSettings, linkProps } from '@/lib/site'

export async function SiteFooter() {
  const [settings, categories] = await Promise.all([getSettings(), getCategories()])
  const { contact } = settings
  const tel = (n: string) => `tel:${n.replace(/\s/g, '')}`

  return (
    <footer className="site-footer">
      <div className="wrap site-footer__main">
        <div className="site-footer__school">
          <p className="site-footer__name">
            Colegiul Național
            <br />
            „Costache Negruzzi” Iași
          </p>
          {contact?.address && <p style={{ marginTop: 8 }}>{contact.address}</p>}
          {(contact?.phone || contact?.fax) && (
            <p>
              Tel.{' '}
              {[contact.phone, contact.fax].filter(Boolean).map((n, i) => (
                <React.Fragment key={n}>
                  {i > 0 && ' · '}
                  <a href={tel(n!)}>{n}</a>
                </React.Fragment>
              ))}
            </p>
          )}
          {contact?.email && (
            <p>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </p>
          )}
          {contact?.hours && <p style={{ whiteSpace: 'pre-line' }}>Program secretariat: {contact.hours}</p>}
        </div>
        {(settings.footerColumns ?? []).map((column) => (
          <nav key={column.id} aria-label={column.heading}>
            <p className="site-footer__heading">{column.heading}</p>
            {(column.items ?? []).map((item) => (
              <a key={item.id} {...linkProps(item.link, categories)}>
                {item.label}
              </a>
            ))}
          </nav>
        ))}
      </div>
      <div className="wrap site-footer__legal">
        <span>© {new Date().getFullYear()} Colegiul Național „Costache Negruzzi” Iași</span>
        <span>{settings.legalText || 'Demo de redesign, fără legătură oficială cu site-ul colegiului.'}</span>
      </div>
    </footer>
  )
}
