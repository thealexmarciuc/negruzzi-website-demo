import React from 'react'

import { getCategories, getNavigation, getSettings, linkProps } from '@/lib/site'

import { Mail, Phone } from './icons'
import { MainNav, type NavSection } from './MainNav'

export async function SiteHeader() {
  const [nav, settings, categories] = await Promise.all([getNavigation(), getSettings(), getCategories()])
  const phone = settings.contact?.phone
  const email = settings.contact?.email

  const sections: NavSection[] = (nav.main ?? []).map((section) => ({
    label: section.label,
    href: linkProps(section.link, categories).href,
    columns: (section.columns ?? []).map((column) => ({
      heading: column.heading ?? '',
      items: (column.items ?? []).map((item) => ({ label: item.label, description: item.description ?? '', ...linkProps(item.link, categories) })),
    })),
  }))

  return (
    <>
      <div className="demo-bar" role="note">
        <strong>Demo / propunere</strong> de site nou pentru Colegiul Național „Costache Negruzzi”. Conținutul este preluat de pe
        colegiulnegruzzi.ro.
      </div>
      <div className="utility">
        <div className="wrap">
          <div className="utility__group utility__group--contact">
            {phone && (
              <a className="utility__contact" href={`tel:${phone.replace(/\s/g, '')}`}>
                <Phone />
                {phone}
              </a>
            )}
            {email && (
              <a className="utility__contact" href={`mailto:${email}`}>
                <Mail />
                {email}
              </a>
            )}
            {settings.contact?.address && <span>{settings.contact.address.split(',')[0]}, Iași</span>}
          </div>
          <div className="utility__group">
            {(nav.quickLinks ?? []).map((link) => (
              <a key={link.id} {...linkProps(link.link, categories)}>
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
      <MainNav sections={sections} />
    </>
  )
}
