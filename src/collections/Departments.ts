import type { CollectionConfig } from 'payload'

import { anyone, signedIn } from '@/access'
import { slugField } from '@/fields/slug'

// Catedre: teachers link here through People.department.
export const Departments: CollectionConfig = {
  slug: 'departments',
  labels: { singular: 'Catedră', plural: 'Catedre' },
  admin: { group: 'Oameni', useAsTitle: 'title', defaultColumns: ['title', 'head', 'order'] },
  access: { read: anyone, create: signedIn, update: signedIn, delete: signedIn },
  defaultSort: 'order',
  fields: [
    { name: 'title', label: 'Denumire', type: 'text', required: true },
    slugField(),
    { name: 'head', label: 'Șef de catedră', type: 'relationship', relationTo: 'people' },
    { name: 'description', label: 'Descriere', type: 'richText' },
    {
      name: 'people',
      label: 'Profesori',
      type: 'join',
      collection: 'people',
      on: 'department',
      defaultSort: 'order',
    },
    { name: 'order', label: 'Ordine', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}
