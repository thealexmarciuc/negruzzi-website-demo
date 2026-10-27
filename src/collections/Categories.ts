import type { CollectionConfig } from 'payload'

import { anyone, signedIn } from '@/access'
import { slugField } from '@/fields/slug'

// Article categories (Anunțuri, Achiziții publice, Erasmus+, ...). Nested; breadcrumbs come from the nested-docs plugin.
export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'Categorie', plural: 'Categorii' },
  admin: { group: 'Conținut', useAsTitle: 'title', defaultColumns: ['title', 'parent', 'order'] },
  access: { read: anyone, create: signedIn, update: signedIn, delete: signedIn },
  defaultSort: 'order',
  fields: [
    { name: 'title', label: 'Titlu', type: 'text', required: true },
    slugField(),
    { name: 'description', label: 'Descriere', type: 'textarea' },
    { name: 'order', label: 'Ordine', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}
