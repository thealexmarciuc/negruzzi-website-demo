import { postgresAdapter } from '@payloadcms/db-postgres'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { EXPERIMENTAL_TableFeature, FixedToolbarFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { ro } from '@payloadcms/translations/languages/ro'
import { en } from '@payloadcms/translations/languages/en'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { signedIn } from './access'
import { Articles } from './collections/Articles'
import { Categories } from './collections/Categories'
import { Departments } from './collections/Departments'
import { Documents } from './collections/Documents'
import { Media } from './collections/Media'
import { Messages } from './collections/Messages'
import { Pages } from './collections/Pages'
import { People } from './collections/People'
import { Users } from './collections/Users'
import { Homepage, Navigation, SiteSettings } from './globals'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    // Payload defaults to Gravatar, which shows whatever photo is registered to the email.
    avatar: 'default',
    meta: { titleSuffix: ' · Administrare site Negruzzi' },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  i18n: { supportedLanguages: { ro, en }, fallbackLanguage: 'ro' },
  collections: [Articles, Pages, Categories, Documents, Media, People, Departments, Messages, Users],
  globals: [Homepage, Navigation, SiteSettings],
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [...defaultFeatures, FixedToolbarFeature(), EXPERIMENTAL_TableFeature()],
  }),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // Local dev and the deployed demo share one Neon database, so the schema only changes through
  // migrations (npm run migrate), never through dev-mode auto push.
  db: postgresAdapter({
    push: false,
    migrationDir: path.resolve(dirname, 'migrations'),
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      // Files are public anyway; serving them straight from the Blob CDN avoids a function call per image.
      collections: { media: { disablePayloadAccessControl: true }, documents: { disablePayloadAccessControl: true } },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
    // Pages and categories nest; the breadcrumb URL is the public path (e.g. /organizare/catedre).
    nestedDocsPlugin({
      collections: ['pages', 'categories'],
      generateLabel: (_, doc) => String(doc.title ?? ''),
      generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
    }),
    // Every old URL (K2 items, Joomla menu aliases) gets a redirect to its new page.
    redirectsPlugin({
      collections: ['pages', 'articles', 'categories'],
      redirectTypes: ['301', '302'],
      overrides: {
        labels: { singular: 'Redirecționare', plural: 'Redirecționări' },
        admin: { group: 'Site' },
        access: { read: () => true, create: signedIn, update: signedIn, delete: signedIn },
      },
    }),
  ],
})
