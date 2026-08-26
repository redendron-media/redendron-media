import path from 'path'
import { fileURLToPath } from 'url'

import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
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

const databaseURI = process.env.DATABASE_URI || 'file:./redendron.db'
const isPostgres = /^postgres(ql)?:\/\//.test(databaseURI)
const blobToken = process.env.BLOB_READ_WRITE_TOKEN

/**
 * Database.
 *
 * Chosen from the connection string rather than from NODE_ENV, so the same
 * build runs on SQLite locally and on Postgres in production without a flag
 * to remember. The collection definitions are adapter-agnostic.
 *
 * `push` lets Payload reconcile the schema on connect. That is the right
 * behaviour for a first deploy against an empty database and the wrong one
 * once there is data worth losing, so it is opt-out via env rather than
 * silently on forever.
 */
const db = isPostgres
  ? postgresAdapter({
      pool: { connectionString: databaseURI },
      push: process.env.PAYLOAD_DISABLE_SCHEMA_PUSH !== 'true',
    })
  : sqliteAdapter({ client: { url: databaseURI } })

/**
 * Uploads.
 *
 * Vercel's filesystem is read-only and ephemeral, so anything uploaded through
 * the admin panel has to go to object storage or it is gone at the next
 * deploy. Locally there is no token and uploads stay on disk, which keeps the
 * project runnable with no external services.
 */
/**
 * Outbound admin email.
 *
 * Only used by Payload itself - password resets and account verification -
 * not by the enquiry form, which talks to the Brevo API directly. Without it
 * Payload writes those emails to the server log, which is fine alone at a
 * laptop and useless the moment a colleague forgets their password.
 *
 * Brevo issues SMTP credentials under Settings -> SMTP & API -> SMTP; they
 * are separate from the REST API key.
 */
const smtpHost = process.env.SMTP_HOST
const smtpUser = process.env.SMTP_USER
const smtpPass = process.env.SMTP_PASSWORD
const email =
  smtpHost && smtpUser && smtpPass
    ? nodemailerAdapter({
        defaultFromAddress: process.env.LEAD_FROM_EMAIL || 'team@redendron.com',
        defaultFromName: 'Redendron Media',
        transportOptions: {
          host: smtpHost,
          port: Number(process.env.SMTP_PORT || 587),
          secure: false,
          auth: { user: smtpUser, pass: smtpPass },
        },
      })
    : undefined

const storage = blobToken
  ? [
      vercelBlobStorage({
        enabled: true,
        collections: { media: true },
        token: blobToken,
      }),
    ]
  : []

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

  db,

  plugins: storage,

  ...(email ? { email } : {}),

  // Powers automatic resizing of uploads. The legacy Sanity assets are up to
  // 4672px wide and 12MB, so this is doing real work.
  sharp,

  secret: process.env.PAYLOAD_SECRET || 'dev-only-insecure-secret-change-me',

  // Vercel's build step has no database, and Payload does not need one to emit
  // types or the import map.
  ...(process.env.PAYLOAD_SKIP_DB === 'true' ? { disableDBConnect: true } : {}),

  typescript: {
    outputFile: path.resolve(dirname, 'cms/payload-types.ts'),
  },

  telemetry: false,
})
