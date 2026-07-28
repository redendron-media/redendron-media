import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'

/**
 * Cache invalidation on CMS writes.
 *
 * Front-end reads go through unstable_cache tagged with CONTENT_TAG. Without
 * these hooks an editor's change would not appear until the 5 minute
 * revalidate window expired, which reads as "the CMS is broken".
 *
 * revalidateTag is imported lazily: these hooks also run from CLI scripts
 * (the seed importer, assign-images) where there is no Next.js request
 * context, and importing next/cache eagerly there throws.
 */
async function invalidate(label: string, logger?: { info: (m: string) => void }) {
  try {
    const { revalidateTag } = await import('next/cache')
    const { CONTENT_TAG } = await import('../lib/cache-tag')
    // Next 16 requires a cache-life profile alongside the tag. 'max' purges
    // every cached entry carrying this tag regardless of its own lifetime.
    revalidateTag(CONTENT_TAG, 'max')
    logger?.info(`Revalidated content cache after ${label}`)
  } catch {
    // Running outside a Next server (seed scripts, tests). Nothing to purge.
  }
}

export const revalidateAfterChange: CollectionAfterChangeHook = ({ doc, collection, req }) => {
  void invalidate(`${collection.slug} change`, req?.payload?.logger)
  return doc
}

export const revalidateAfterDelete: CollectionAfterDeleteHook = ({ doc, collection, req }) => {
  void invalidate(`${collection.slug} delete`, req?.payload?.logger)
  return doc
}

export const revalidateGlobalAfterChange: GlobalAfterChangeHook = ({ doc, global, req }) => {
  void invalidate(`${global.slug} change`, req?.payload?.logger)
  return doc
}

/** Spread onto any collection that the public site reads. */
export const revalidateHooks = {
  afterChange: [revalidateAfterChange],
  afterDelete: [revalidateAfterDelete],
}
