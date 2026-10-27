import type { CollectionConfig } from 'payload'

import { anyone, signedIn } from '@/access'

export const DOCUMENT_TYPES = [
  { label: 'Anunț', value: 'anunt' },
  { label: 'Hotărâre CA', value: 'hotarare-ca' },
  { label: 'Regulament', value: 'regulament' },
  { label: 'Orar', value: 'orar' },
  { label: 'Rezultate', value: 'rezultate' },
  { label: 'Achiziție publică', value: 'achizitie' },
  { label: 'Raport', value: 'raport' },
  { label: 'Formular', value: 'formular' },
  { label: 'Metodologie', value: 'metodologie' },
  { label: 'Declarație de avere sau interese', value: 'declaratie' },
  { label: 'Altul', value: 'altul' },
]

// Attachments (PDF, Word, zip). Very large files stay on the old site and are linked via externalUrl.
export const Documents: CollectionConfig = {
  slug: 'documents',
  labels: { singular: 'Document', plural: 'Documente' },
  admin: {
    group: 'Fișiere',
    useAsTitle: 'title',
    defaultColumns: ['title', 'docType', 'schoolYear', 'updatedAt'],
    listSearchableFields: ['title', 'filename'],
  },
  access: { read: anyone, create: signedIn, update: signedIn, delete: signedIn },
  upload: {
    filesRequiredOnCreate: false,
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.*',
      'application/vnd.ms-excel',
      // Older .doc and .xls files are detected by their container format.
      'application/x-cfb',
      'application/vnd.oasis.opendocument.*',
      'application/zip',
      'application/x-zip-compressed',
    ],
  },
  fields: [
    { name: 'title', label: 'Titlu', type: 'text', required: true },
    {
      type: 'row',
      fields: [
        { name: 'docType', label: 'Tip', type: 'select', options: DOCUMENT_TYPES, defaultValue: 'altul' },
        {
          name: 'schoolYear',
          label: 'An școlar',
          type: 'text',
          admin: { placeholder: '2025-2026' },
          validate: (value: unknown) =>
            !value || /^\d{4}-\d{4}$/.test(String(value)) || 'Formatul este AAAA-AAAA, de exemplu 2025-2026',
        },
      ],
    },
    { name: 'category', label: 'Categorie', type: 'relationship', relationTo: 'categories' },
    {
      name: 'externalUrl',
      label: 'Adresă externă',
      type: 'text',
      admin: { description: 'Doar dacă fișierul nu este încărcat aici (de exemplu, fișiere foarte mari).' },
    },
    { name: 'sourceUrl', label: 'Adresa pe site-ul vechi', type: 'text', admin: { readOnly: true } },
  ],
}
