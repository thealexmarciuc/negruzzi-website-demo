import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Utilizator', plural: 'Utilizatori' },
  admin: {
    group: 'Site',
    useAsTitle: 'email',
    defaultColumns: ['name', 'email'],
  },
  auth: true,
  fields: [
    // Email added by default
    { name: 'name', label: 'Nume', type: 'text' },
  ],
}
