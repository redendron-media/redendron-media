import path from 'path'
import { fileURLToPath } from 'url'

import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Authors } from './cms/collections/Authors'
import { Categories } from './cms/collections/Categories'
import { CaseStudies } from './cms/collections/CaseStudies'
import { Clients } from './cms/collections/Clients'
import { Leads } from './cms/collections/Leads'
import { Media } from './cms/collections/Media'
import { Packages } from './cms/collections/Packages'
import { Posts } from './cms/collections/Posts'
import { Services } from './cms/collections/Services'
import { Testimonials } from './cms/collections/Testimonials'
import { Users } from './cms/collections/Users'
import { SiteSettings } from './cms/globals/SiteSettings'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: '· Redendron',
    },
  },

  collections: [
    // Content
    CaseStudies,
    Services,
    Posts,
    Packages,
    // Supporting taxonomies and reusable records
    Authors,
    Categories,
    Testimonials,
    Clients,
    // System
    Media,
    Leads,
    Users,
  ],

  globals: [SiteSettings],

  editor: lexicalEditor(),

  // Local development runs on SQLite so the project needs no external
  // services. Production swaps this for postgresAdapter - the collection
  // definitions are adapter-agnostic.
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || 'file:./redendron.db',
    },
  }),

  // Powers automatic resizing of uploads. The legacy Sanity assets are up to
  // 4672px wide and 12MB, so this is doing real work.
  sharp,

  secret: process.env.PAYLOAD_SECRET || 'dev-only-insecure-secret-change-me',

  typescript: {
    outputFile: path.resolve(dirname, 'cms/payload-types.ts'),
  },

  telemetry: false,
})
