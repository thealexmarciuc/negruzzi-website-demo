import type { GroupField } from 'payload'

// A link to a page, article or category on this site, or to any external URL.
export function linkField(name = 'link', label = 'Link'): GroupField {
  return {
    name,
    label,
    type: 'group',
    fields: [
      {
        name: 'type',
        label: 'Tip',
        type: 'radio',
        defaultValue: 'internal',
        options: [
          { label: 'Pagină de pe site', value: 'internal' },
          { label: 'Adresă externă', value: 'external' },
        ],
        admin: { layout: 'horizontal' },
      },
      {
        name: 'reference',
        label: 'Pagina',
        type: 'relationship',
        relationTo: ['pages', 'articles', 'categories'],
        admin: { condition: (_, sibling) => sibling?.type === 'internal' },
      },
      {
        name: 'url',
        label: 'Adresă',
        type: 'text',
        admin: { condition: (_, sibling) => sibling?.type === 'external' },
      },
      {
        name: 'newTab',
        label: 'Se deschide într-o filă nouă',
        type: 'checkbox',
      },
    ],
  }
}
