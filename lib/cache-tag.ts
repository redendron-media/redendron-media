/**
 * Single cache tag for all published CMS content.
 *
 * Lives in its own module with no imports so both the Next data layer and the
 * Payload hooks can reference it without pulling `server-only` into the CMS
 * process.
 */
export const CONTENT_TAG = 'payload-content'
