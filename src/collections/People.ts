import type { CollectionConfig } from 'payload'

import { anyone, signedIn } from '@/access'

export const People: CollectionConfig = {
  slug: 'people',
  labels: { singular: 'Persoană', plural: 'Persoane' },
  admin: { group: 'Oameni', useAsTitle: 'name', defaultColumns: ['name', 'role', 'groups', 'department'] },
  access: { read: anyone, create: signedIn, update: signedIn, delete: signedIn },
  defaultSort: 'order',
  fields: [
    { name: 'name', label: 'Nume', type: 'text', required: true },
    { name: 'role', label: 'Funcția', type: 'text', admin: { placeholder: 'Director, profesor de matematică...' } },
    {
      name: 'groups',
      label: 'Apare la',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Conducerea colegiului', value: 'conducere' },
        { label: 'Consiliul de administrație', value: 'consiliu' },
        { label: 'Foști directori', value: 'fosti-directori' },
        { label: 'Șefi de promoție', value: 'sefi-promotie' },
      ],
    },
    { name: 'department', label: 'Catedra', type: 'relationship', relationTo: 'departments' },
    { name: 'years', label: 'Perioada', type: 'text', admin: { placeholder: '1998-2006 sau promoția 2024' } },
    { name: 'photo', label: 'Fotografie', type: 'upload', relationTo: 'media' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'bio', label: 'Prezentare', type: 'textarea' },
    { name: 'order', label: 'Ordine', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}
