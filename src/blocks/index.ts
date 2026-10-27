import type { Block } from 'payload'

import { DOCUMENT_TYPES } from '@/collections/Documents'
import { linkField } from '@/fields/link'

// Building blocks for fixed pages (section landings, history, admission, results, projects...).

export const RichTextBlock: Block = {
  slug: 'richText',
  labels: { singular: 'Text', plural: 'Texte' },
  fields: [{ name: 'content', label: 'Text', type: 'richText', required: true }],
}

export const CardsBlock: Block = {
  slug: 'cards',
  labels: { singular: 'Carduri cu linkuri', plural: 'Carduri cu linkuri' },
  fields: [
    { name: 'title', label: 'Titlu', type: 'text' },
    {
      name: 'items',
      label: 'Carduri',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'title', label: 'Titlu', type: 'text', required: true },
        { name: 'text', label: 'Descriere', type: 'textarea' },
        { name: 'image', label: 'Imagine', type: 'upload', relationTo: 'media' },
        linkField(),
      ],
    },
  ],
}

export const DocumentListBlock: Block = {
  slug: 'documentList',
  labels: { singular: 'Listă de documente', plural: 'Liste de documente' },
  fields: [
    { name: 'title', label: 'Titlu', type: 'text' },
    {
      name: 'mode',
      label: 'Ce documente',
      type: 'radio',
      defaultValue: 'manual',
      options: [
        { label: 'Alese de mine', value: 'manual' },
        { label: 'Toate de un anumit tip (cu filtre pe an)', value: 'library' },
      ],
    },
    {
      name: 'documents',
      label: 'Documente',
      type: 'relationship',
      relationTo: 'documents',
      hasMany: true,
      admin: { condition: (_, s) => s?.mode === 'manual' },
    },
    {
      name: 'docTypes',
      label: 'Tipuri',
      type: 'select',
      hasMany: true,
      options: DOCUMENT_TYPES,
      admin: { condition: (_, s) => s?.mode === 'library' },
    },
  ],
}

export const PeopleBlock: Block = {
  slug: 'people',
  labels: { singular: 'Persoane', plural: 'Persoane' },
  fields: [
    { name: 'title', label: 'Titlu', type: 'text' },
    {
      name: 'group',
      label: 'Grupul',
      type: 'select',
      required: true,
      options: [
        { label: 'Conducerea colegiului', value: 'conducere' },
        { label: 'Consiliul de administrație', value: 'consiliu' },
        { label: 'Foști directori', value: 'fosti-directori' },
        { label: 'Șefi de promoție', value: 'sefi-promotie' },
        { label: 'Catedre (cu profesori)', value: 'catedre' },
      ],
    },
  ],
}

export const TimelineBlock: Block = {
  slug: 'timeline',
  labels: { singular: 'Cronologie', plural: 'Cronologii' },
  fields: [
    { name: 'title', label: 'Titlu', type: 'text' },
    {
      name: 'items',
      label: 'Momente',
      type: 'array',
      fields: [
        { name: 'year', label: 'Anul', type: 'text', required: true },
        { name: 'title', label: 'Titlu', type: 'text', required: true },
        { name: 'text', label: 'Text', type: 'textarea' },
        { name: 'image', label: 'Imagine', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
}

export const StatsBlock: Block = {
  slug: 'stats',
  labels: { singular: 'Cifre', plural: 'Cifre' },
  fields: [
    {
      name: 'items',
      label: 'Cifre',
      type: 'array',
      maxRows: 6,
      fields: [
        { name: 'value', label: 'Valoare', type: 'text', required: true },
        { name: 'label', label: 'Etichetă', type: 'text', required: true },
      ],
    },
  ],
}

export const GalleryBlock: Block = {
  slug: 'gallery',
  labels: { singular: 'Galerie', plural: 'Galerii' },
  fields: [
    { name: 'title', label: 'Titlu', type: 'text' },
    { name: 'images', label: 'Fotografii', type: 'upload', relationTo: 'media', hasMany: true, required: true },
  ],
}

export const EmbeddedDocumentBlock: Block = {
  slug: 'embeddedDocument',
  labels: { singular: 'Document afișat', plural: 'Documente afișate' },
  fields: [
    { name: 'title', label: 'Titlu', type: 'text' },
    { name: 'document', label: 'Document', type: 'relationship', relationTo: 'documents', required: true },
  ],
}

export const CalloutBlock: Block = {
  slug: 'callout',
  labels: { singular: 'Casetă evidențiată', plural: 'Casete evidențiate' },
  fields: [
    { name: 'title', label: 'Titlu', type: 'text', required: true },
    { name: 'text', label: 'Text', type: 'textarea' },
    linkField(),
  ],
}

export const ArticleFeedBlock: Block = {
  slug: 'articleFeed',
  labels: { singular: 'Ultimele articole', plural: 'Ultimele articole' },
  fields: [
    { name: 'title', label: 'Titlu', type: 'text' },
    { name: 'category', label: 'Din categoria', type: 'relationship', relationTo: 'categories' },
    { name: 'limit', label: 'Câte', type: 'number', defaultValue: 6, min: 1, max: 24 },
  ],
}

export const pageBlocks: Block[] = [
  RichTextBlock,
  CardsBlock,
  DocumentListBlock,
  PeopleBlock,
  TimelineBlock,
  StatsBlock,
  GalleryBlock,
  EmbeddedDocumentBlock,
  CalloutBlock,
  ArticleFeedBlock,
]
