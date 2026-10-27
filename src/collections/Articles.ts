import type { CollectionConfig } from 'payload'

import { publishedOrSignedIn, signedIn } from '@/access'
import { slugField } from '@/fields/slug'

// News, announcements and every other dated post (the 557 K2 items on the old site).
export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: { singular: 'Articol', plural: 'Articole' },
  admin: {
    group: 'Conținut',
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedAt', '_status'],
    listSearchableFields: ['title', 'excerpt'],
  },
  access: { read: publishedOrSignedIn, create: signedIn, update: signedIn, delete: signedIn },
  versions: { drafts: true, maxPerDoc: 20 },
  defaultSort: '-publishedAt',
  fields: [
    { name: 'title', label: 'Titlu', type: 'text', required: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Conținut',
          fields: [
            { name: 'excerpt', label: 'Rezumat', type: 'textarea', admin: { description: 'Apare în liste și în rezultatele căutării.' } },
            { name: 'heroImage', label: 'Imagine principală', type: 'upload', relationTo: 'media' },
            { name: 'content', label: 'Text', type: 'richText' },
          ],
        },
        {
          label: 'Documente',
          fields: [
            {
              name: 'attachmentGroups',
              label: 'Documente atașate',
              type: 'array',
              labels: { singular: 'Grup de documente', plural: 'Grupuri de documente' },
              fields: [
                { name: 'title', label: 'Titlul grupului', type: 'text', admin: { placeholder: 'De exemplu: Rezultate finale' } },
                { name: 'documents', label: 'Documente', type: 'relationship', relationTo: 'documents', hasMany: true, required: true },
              ],
            },
            {
              name: 'embeddedDocument',
              label: 'Document afișat în pagină',
              type: 'relationship',
              relationTo: 'documents',
              admin: { description: 'Un PDF afișat direct în articol (de exemplu, orarul).' },
            },
          ],
        },
        {
          label: 'Galerie',
          fields: [{ name: 'gallery', label: 'Fotografii', type: 'upload', relationTo: 'media', hasMany: true }],
        },
      ],
    },
    slugField(),
    {
      name: 'publishedAt',
      label: 'Data publicării',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime', displayFormat: 'd MMM yyyy, HH:mm' } },
    },
    { name: 'category', label: 'Categorie', type: 'relationship', relationTo: 'categories', required: true, admin: { position: 'sidebar' } },
    { name: 'featured', label: 'Evidențiat pe prima pagină', type: 'checkbox', admin: { position: 'sidebar' } },
    { name: 'legacyPath', label: 'Adresa pe site-ul vechi', type: 'text', index: true, admin: { position: 'sidebar', readOnly: true } },
  ],
}
