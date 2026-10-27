import { getPayload, Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'

// Runs against the shared Neon database: everything it creates is tagged and removed afterwards.
const TAG = `test-${Date.now()}`
let payload: Payload
const created: { collection: 'articles' | 'categories' | 'pages'; id: number }[] = []

describe('content model', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  afterAll(async () => {
    for (const { collection, id } of created.reverse()) {
      await payload.delete({ collection, id, overrideAccess: true })
    }
  })

  it('builds nested category paths and Romanian slugs', async () => {
    const parent = await payload.create({ collection: 'categories', data: { title: `Noutăți ${TAG}`, slug: '' } })
    created.push({ collection: 'categories', id: parent.id })
    const child = await payload.create({
      collection: 'categories',
      data: { title: 'Achiziții publice', slug: '', parent: parent.id },
    })
    created.push({ collection: 'categories', id: child.id })

    expect(child.slug).toBe('achizitii-publice')
    expect(child.breadcrumbs?.at(-1)?.url).toBe(`/noutati-${TAG}/achizitii-publice`)
  })

  it('hides draft articles from visitors but not from staff', async () => {
    const category = created[0].id
    const draft = await payload.create({
      collection: 'articles',
      draft: true,
      data: { title: `Burse școlare ${TAG}`, category, _status: 'draft' },
    })
    created.push({ collection: 'articles', id: draft.id })

    const asVisitor = await payload.find({
      collection: 'articles',
      overrideAccess: false,
      where: { id: { equals: draft.id } },
    })
    const asStaff = await payload.find({ collection: 'articles', draft: true, where: { id: { equals: draft.id } } })

    expect(asVisitor.docs).toHaveLength(0)
    expect(asStaff.docs).toHaveLength(1)
    expect(asStaff.docs[0].slug).toBe(`burse-scolare-${TAG}`)
  })
})
