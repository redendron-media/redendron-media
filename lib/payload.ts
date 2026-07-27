import 'server-only'

import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import type { CaseStudy, Client, Post, Service, Testimonial } from '@/cms/payload-types'

/**
 * Server-side data access via Payload's Local API.
 *
 * This runs in-process - no HTTP hop, no CDN round trip. The old site made a
 * network call to Sanity for every section, several of them from the client
 * inside a react-query provider.
 */
export const payload = async () => getPayload({ config })

/** Cache tag applied to every read, so CMS writes can invalidate in one call. */
export const CONTENT_TAG = 'payload-content'

const cached = <T>(fn: () => Promise<T>, keys: string[]) =>
  unstable_cache(fn, keys, { tags: [CONTENT_TAG], revalidate: 300 })()

export const getFeaturedCaseStudies = (limit = 6) =>
  cached(async () => {
    const p = await payload()
    const { docs } = await p.find({
      collection: 'case-studies',
      where: { _status: { equals: 'published' } },
      sort: '-publishedAt',
      limit,
      depth: 2,
    })
    return docs as CaseStudy[]
  }, ['case-studies', 'featured', String(limit)])

export const getCaseStudyBySlug = (slug: string) =>
  cached(async () => {
    const p = await payload()
    const { docs } = await p.find({
      collection: 'case-studies',
      where: { slug: { equals: slug }, _status: { equals: 'published' } },
      limit: 1,
      depth: 3,
    })
    return (docs[0] as CaseStudy) || null
  }, ['case-study', slug])

export const getServices = () =>
  cached(async () => {
    const p = await payload()
    const { docs } = await p.find({
      collection: 'services',
      where: { _status: { equals: 'published' } },
      sort: 'order',
      limit: 20,
      depth: 2,
    })
    return docs as Service[]
  }, ['services'])

export const getServiceBySlug = (slug: string) =>
  cached(async () => {
    const p = await payload()
    const { docs } = await p.find({
      collection: 'services',
      where: { slug: { equals: slug }, _status: { equals: 'published' } },
      limit: 1,
      depth: 3,
    })
    return (docs[0] as Service) || null
  }, ['service', slug])

export const getClients = () =>
  cached(async () => {
    const p = await payload()
    const { docs } = await p.find({ collection: 'clients', sort: 'order', limit: 50, depth: 1 })
    return docs as Client[]
  }, ['clients'])

export const getTestimonials = (limit = 6) =>
  cached(async () => {
    const p = await payload()
    const { docs } = await p.find({
      collection: 'testimonials',
      where: { featured: { equals: true } },
      limit,
      depth: 1,
    })
    return docs as Testimonial[]
  }, ['testimonials', String(limit)])

export const getPosts = (limit = 12) =>
  cached(async () => {
    const p = await payload()
    const { docs } = await p.find({
      collection: 'posts',
      where: { _status: { equals: 'published' } },
      sort: '-publishedAt',
      limit,
      depth: 2,
    })
    return docs as Post[]
  }, ['posts', String(limit)])

export const getSiteSettings = () =>
  cached(async () => {
    const p = await payload()
    return p.findGlobal({ slug: 'site-settings', depth: 1 })
  }, ['site-settings'])

/** Narrow a Payload upload relationship to a usable media object. */
export type MediaLike = {
  url?: string | null
  alt?: string | null
  width?: number | null
  height?: number | null
  sizes?: Record<string, { url?: string | null; width?: number | null } | undefined>
}

export const asMedia = (value: unknown): MediaLike | null =>
  value && typeof value === 'object' && 'url' in (value as object)
    ? (value as MediaLike)
    : null
