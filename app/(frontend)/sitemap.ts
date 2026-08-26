import type { MetadataRoute } from 'next'

import { getFeaturedCaseStudies, getPackages, getPosts, getServices } from '@/lib/payload'

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://redendron.com').replace(/\/$/, '')

/** Only published documents are returned by the fetchers, so everything here is live. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [studies, services, packages, posts] = await Promise.all([
    getFeaturedCaseStudies(100).catch(() => []),
    getServices().catch(() => []),
    getPackages().catch(() => []),
    getPosts(200).catch(() => []),
  ])

  const url = (path: string) => `${siteUrl}${path}`
  const at = (value?: string | null) => (value ? new Date(value) : undefined)

  const staticPages: MetadataRoute.Sitemap = [
    { url: url('/'), changeFrequency: 'monthly', priority: 1 },
    { url: url('/work'), changeFrequency: 'monthly', priority: 0.9 },
    { url: url('/packages'), changeFrequency: 'monthly', priority: 0.8 },
    { url: url('/blog'), changeFrequency: 'weekly', priority: 0.7 },
    { url: url('/about'), changeFrequency: 'yearly', priority: 0.6 },
    { url: url('/get-a-quote'), changeFrequency: 'yearly', priority: 0.8 },
    { url: url('/privacy-policy'), changeFrequency: 'yearly', priority: 0.2 },
  ]

  return [
    ...staticPages,
    ...studies.map((doc) => ({
      url: url(`/work/${doc.slug}`),
      lastModified: at(doc.publishedAt) ?? at(doc.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...services.map((doc) => ({
      url: url(`/services/${doc.slug}`),
      lastModified: at(doc.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...packages.map((doc) => ({
      url: url(`/packages/${doc.slug}`),
      lastModified: at(doc.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...posts.map((doc) => ({
      url: url(`/blog/${doc.slug}`),
      lastModified: at(doc.publishedAt) ?? at(doc.updatedAt),
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    })),
  ]
}
