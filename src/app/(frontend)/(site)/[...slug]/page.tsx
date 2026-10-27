import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import React, { cache } from 'react'

import { excerptOf, resolvePath } from '@/lib/site'
import { ArticleView } from '@/views/ArticleView'
import { ListingView, type ListingParams } from '@/views/ListingView'
import { SectionView, StandardPageView } from '@/views/PageViews'
import {
  AdmissionView,
  ContactView,
  DirectoryView,
  type DocumentParams,
  DocumentsView,
  HistoryView,
  ProjectView,
  ResultsView,
} from '@/views/Templates'

export const revalidate = 60

type Props = { params: Promise<{ slug: string[] }>; searchParams: Promise<ListingParams & DocumentParams> }

const safeDecode = (s: string) => {
  try {
    return decodeURIComponent(s)
  } catch {
    return s
  }
}

const resolve = cache(async (slug: string[]) => resolvePath(`/${slug.map(safeDecode).join('/')}`))

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await resolve((await params).slug)
  const site = 'Colegiul Național „Costache Negruzzi” Iași'
  if (r.kind === 'page') return { title: `${r.page.title} · ${site}`, description: r.page.intro ?? undefined }
  if (r.kind === 'category') return { title: `${r.category.title} · ${site}` }
  if (r.kind === 'article') return { title: `${r.article.title} · ${site}`, description: excerptOf(r.article, 160) }
  return { title: site }
}

export default async function Route({ params, searchParams }: Props) {
  const r = await resolve((await params).slug)
  switch (r.kind) {
    case 'redirect':
      permanentRedirect(r.to)
    case 'article':
      return <ArticleView article={r.article} />
    case 'category':
      return <ListingView category={r.category} params={await searchParams} />
    case 'page': {
      const page = r.page
      switch (page.template) {
        case 'section':
          return <SectionView page={page} />
        case 'history':
          return <HistoryView page={page} />
        case 'admission':
          return <AdmissionView page={page} />
        case 'results':
          return <ResultsView page={page} />
        case 'project':
          return <ProjectView page={page} />
        case 'contact':
          return <ContactView page={page} />
        case 'documents':
          return <DocumentsView page={page} params={await searchParams} />
        case 'directory':
          return <DirectoryView page={page} />
        default:
          return <StandardPageView page={page} />
      }
    }
    default:
      notFound()
  }
}
