import type { TextField } from 'payload'

import { slugify } from '@/lib/slugify'

// Filled from `fromField` when left empty; editors can still override it.
export function slugField(fromField = 'title'): TextField {
  return {
    name: 'slug',
    label: 'Adresă (slug)',
    type: 'text',
    index: true,
    required: true,
    admin: {
      position: 'sidebar',
      description: 'Se completează automat din titlu. Apare în adresa paginii.',
    },
    hooks: {
      beforeValidate: [
        ({ value, data }) => {
          if (typeof value === 'string' && value.trim()) return slugify(value)
          const source = data?.[fromField]
          return typeof source === 'string' ? slugify(source) : value
        },
      ],
    },
  }
}
