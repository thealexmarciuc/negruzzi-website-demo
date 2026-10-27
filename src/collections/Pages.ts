import type { CollectionConfig } from 'payload'

import { publishedOrSignedIn, signedIn } from '@/access'
import { pageBlocks } from '@/blocks'
import { slugField } from '@/fields/slug'

// Fixed pages (Secretariat, Scurt istoric, Admitere, ...). Nested, so /organizare/catedre keeps its path.
export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Pagină', plural: 'Pagini' },
  admin: { group: 'Conținut', useAsTitle: 'title', defaultColumns: ['title', 'parent', 'template', '_status'] },
  access: { read: publishedOrSignedIn, create: signedIn, update: signedIn, delete: signedIn },
  versions: { drafts: true, maxPerDoc: 20 },
  fields: [
    { name: 'title', label: 'Titlu', type: 'text', required: true },
    { name: 'intro', label: 'Introducere', type: 'textarea' },
    { name: 'heroImage', label: 'Imagine principală', type: 'upload', relationTo: 'media' },
    { name: 'layout', label: 'Conținutul paginii', type: 'blocks', blocks: pageBlocks },
    slugField(),
    {
      name: 'template',
      label: 'Șablon',
      type: 'select',
      defaultValue: 'standard',
      required: true,
      admin: { position: 'sidebar' },
      options: [
        { label: 'Pagină standard', value: 'standard' },
        { label: 'Secțiune (cu subpagini)', value: 'section' },
        { label: 'Istorie', value: 'history' },
        { label: 'Admitere', value: 'admission' },
        { label: 'Rezultate', value: 'results' },
        { label: 'Proiect', value: 'project' },
        { label: 'Contact', value: 'contact' },
      ],
    },
    { name: 'order', label: 'Ordine', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
    { name: 'legacyPath', label: 'Adresa pe site-ul vechi', type: 'text', index: true, admin: { position: 'sidebar', readOnly: true } },
  ],
}
