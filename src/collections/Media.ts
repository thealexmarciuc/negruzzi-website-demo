import type { CollectionConfig } from 'payload'

import { anyone, signedIn } from '@/access'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Imagine', plural: 'Imagini' },
  admin: { group: 'Fișiere', useAsTitle: 'alt', defaultColumns: ['filename', 'alt', 'updatedAt'] },
  access: { read: anyone, create: signedIn, update: signedIn, delete: signedIn },
  fields: [
    {
      name: 'alt',
      label: 'Text alternativ',
      type: 'text',
      required: true,
      admin: { description: 'Descrierea imaginii pentru cititoarele de ecran.' },
    },
    { name: 'caption', label: 'Legendă', type: 'text' },
    { name: 'sourceUrl', label: 'Adresa pe site-ul vechi', type: 'text', admin: { readOnly: true } },
  ],
  upload: {
    mimeTypes: ['image/*'],
    imageSizes: [
      { name: 'thumbnail', width: 400 },
      { name: 'card', width: 800 },
      { name: 'hero', width: 1600 },
    ],
    adminThumbnail: 'thumbnail',
    focalPoint: true,
  },
}
