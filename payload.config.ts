import path from 'path'
import { fileURLToPath } from 'url'

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
import { brevoEmailAdapter } from './lib/payload-email'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Connection string.
 *
 * Vercel's Postgres integrations inject their own variable names and none of
 * them is DATABASE_URI, so all the usual ones are accepted rather than making
 * someone notice the mismatch at deploy time. Neon's pooled URL is preferred
 * where both are present: serverless functions open and drop connections
 * constantly, and the direct endpoint runs out of them.
 */
const databaseURI =
  process.env.DATABASE_URI ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  'file:./redendron.db'
const isPostgres = /^postgres(ql)?:\/\//.test(databaseURI)

/**
 * Vercel Blob's read-write token.
 *
 * When a Blob store is connected to a project you may give its variables a
 * custom prefix, in which case the token arrives as REDWEBSITE_READ_WRITE_TOKEN
 * rather than BLOB_READ_WRITE_TOKEN. Missing it does not fail the build - it
 * silently falls back to disk storage, on a filesystem that is read-only in
 * production - so any correctly shaped token is accepted rather than only the
 * default name. The `vercel_blob_rw_` check is what keeps that from matching
 * an unrelated variable.
 */
const blobToken =
  process.env.BLOB_READ_WRITE_TOKEN ||
  Object.entries(process.env).find(
    ([key, value]) => key.endsWith('_READ_WRITE_TOKEN') && value?.startsWith('vercel_blob_rw_')
  )?.[1]

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
 * Outbound admin email - password resets and verification.
 *
 * Over the Brevo REST API rather than SMTP, so it reuses the one key the
 * enquiry form already uses instead of a second set of credentials to create
 * and rotate. Undefined when no key is set, which leaves Payload logging mail
 * to the console as it does in local development.
 */
const email = brevoEmailAdapter()

const storage = blobToken
  ? [
      vercelBlobStorage({
        enabled: true,
        /**
         * `disablePayloadAccessControl` puts the blob's own URL on the
         * document instead of a /api/media/file/... path.
         *
         * Without it every image on the site is streamed through a serverless
         * function that fetches it from the store and pipes it back: a
         * function invocation per image, billed at the more expensive Fast
         * Data Transfer rate, and no CDN cache in front of it. These are
         * public marketing images on a public store - there is nothing for
         * the access check to protect, and it is the reason the store was
         * created public in the first place.
         */
        collections: { media: { disablePayloadAccessControl: true } },
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
