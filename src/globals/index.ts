import type { GlobalConfig } from 'payload'

import { anyone, signedIn } from '@/access'
import { linkField } from '@/fields/link'

const access = { read: anyone, update: signedIn }

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Meniu',
  admin: { group: 'Site' },
  access,
  fields: [
    {
      name: 'main',
      label: 'Meniul principal',
      type: 'array',
      labels: { singular: 'Secțiune', plural: 'Secțiuni' },
      fields: [
        { name: 'label', label: 'Eticheta', type: 'text', required: true },
        linkField('link', 'Link (pentru secțiunea în sine)'),
        {
          name: 'columns',
          label: 'Coloane în meniul desfășurat',
          type: 'array',
          fields: [
            { name: 'heading', label: 'Titlul coloanei', type: 'text' },
            {
              name: 'items',
              label: 'Linkuri',
              type: 'array',
              fields: [{ name: 'label', label: 'Eticheta', type: 'text', required: true }, linkField()],
            },
          ],
        },
      ],
    },
    {
      name: 'quickLinks',
      label: 'Linkuri rapide (bara de sus)',
      type: 'array',
      fields: [{ name: 'label', label: 'Eticheta', type: 'text', required: true }, linkField()],
    },
  ],
}

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Date de contact și subsol',
  admin: { group: 'Site' },
  access,
  fields: [
    { name: 'schoolName', label: 'Numele școlii', type: 'text', defaultValue: 'Colegiul Național „Costache Negruzzi” Iași' },
    {
      name: 'contact',
      label: 'Contact',
      type: 'group',
      fields: [
        { name: 'address', label: 'Adresa', type: 'textarea' },
        { name: 'phone', label: 'Telefon', type: 'text' },
        { name: 'fax', label: 'Fax', type: 'text' },
        { name: 'email', label: 'Email secretariat', type: 'email' },
        { name: 'hours', label: 'Program secretariat', type: 'textarea' },
        { name: 'mapEmbedUrl', label: 'Adresa hărții (Google Maps embed)', type: 'text' },
      ],
    },
    {
      name: 'social',
      label: 'Rețele sociale',
      type: 'array',
      fields: [
        { name: 'network', label: 'Rețea', type: 'select', options: ['facebook', 'instagram', 'youtube', 'tiktok', 'linkedin'], required: true },
        { name: 'url', label: 'Adresă', type: 'text', required: true },
      ],
    },
    {
      name: 'footerColumns',
      label: 'Coloane în subsol',
      type: 'array',
      fields: [
        { name: 'heading', label: 'Titlu', type: 'text', required: true },
        {
          name: 'items',
          label: 'Linkuri',
          type: 'array',
          fields: [{ name: 'label', label: 'Eticheta', type: 'text', required: true }, linkField()],
        },
      ],
    },
    { name: 'legalText', label: 'Text legal (subsol)', type: 'textarea' },
  ],
}

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: 'Prima pagină',
  admin: { group: 'Site' },
  access,
  fields: [
    {
      name: 'hero',
      label: 'Banner',
      type: 'group',
      fields: [
        { name: 'eyebrow', label: 'Text mic deasupra', type: 'text' },
        { name: 'title', label: 'Titlu', type: 'text', required: true, defaultValue: 'Colegiul Național „Costache Negruzzi” Iași' },
        { name: 'text', label: 'Text', type: 'textarea' },
        { name: 'image', label: 'Imagine', type: 'upload', relationTo: 'media' },
        {
          name: 'actions',
          label: 'Butoane',
          type: 'array',
          maxRows: 2,
          fields: [{ name: 'label', label: 'Eticheta', type: 'text', required: true }, linkField()],
        },
      ],
    },
    {
      name: 'audienceLinks',
      label: 'Linkuri pentru elevi, părinți, profesori',
      type: 'array',
      maxRows: 6,
      fields: [
        { name: 'label', label: 'Eticheta', type: 'text', required: true },
        { name: 'description', label: 'Descriere', type: 'text' },
        linkField(),
      ],
    },
    {
      name: 'stats',
      label: 'Cifre',
      type: 'array',
      maxRows: 4,
      fields: [
        { name: 'value', label: 'Valoare', type: 'text', required: true },
        { name: 'label', label: 'Etichetă', type: 'text', required: true },
      ],
    },
    { name: 'newsCategory', label: 'Știrile vin din categoria', type: 'relationship', relationTo: 'categories' },
    {
      name: 'highlights',
      label: 'Proiecte și realizări evidențiate',
      type: 'array',
      maxRows: 4,
      fields: [
        { name: 'title', label: 'Titlu', type: 'text', required: true },
        { name: 'text', label: 'Text', type: 'textarea' },
        { name: 'image', label: 'Imagine', type: 'upload', relationTo: 'media' },
        linkField(),
      ],
    },
  ],
}
