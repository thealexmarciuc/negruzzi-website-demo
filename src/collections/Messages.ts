import type { CollectionConfig } from 'payload'

import { signedIn } from '@/access'
import { MESSAGE_SUBJECTS } from '@/lib/contact'

// Messages sent from the contact form. Visitors never read or write this collection directly:
// the form's server action creates entries, staff read them in the admin.
export const Messages: CollectionConfig = {
  slug: 'messages',
  labels: { singular: 'Mesaj', plural: 'Mesaje' },
  admin: { group: 'Site', useAsTitle: 'name', defaultColumns: ['name', 'subject', 'status', 'createdAt'] },
  access: { read: signedIn, create: () => false, update: signedIn, delete: signedIn },
  defaultSort: '-createdAt',
  fields: [
    { name: 'name', label: 'Nume', type: 'text', required: true, maxLength: 120 },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'subject', label: 'Subiect', type: 'select', options: MESSAGE_SUBJECTS, required: true, defaultValue: 'secretariat' },
    { name: 'message', label: 'Mesaj', type: 'textarea', required: true, maxLength: 5000 },
    {
      name: 'status',
      label: 'Stare',
      type: 'select',
      defaultValue: 'nou',
      options: [
        { label: 'Nou', value: 'nou' },
        { label: 'În lucru', value: 'in-lucru' },
        { label: 'Rezolvat', value: 'rezolvat' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'consentAt', label: 'Acord GDPR dat la', type: 'date', admin: { position: 'sidebar', readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
  ],
}
