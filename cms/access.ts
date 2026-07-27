import type { Access, FieldAccess } from 'payload'

/** Public read. Used for everything that renders on the marketing site. */
export const anyone: Access = () => true

/** Any signed-in CMS user (admin or editor). */
export const editors: Access = ({ req: { user } }) => Boolean(user)

/** Admins only. Used for lead data and account management. */
export const admins: Access = ({ req: { user } }) => user?.role === 'admin'

export const adminsFieldLevel: FieldAccess = ({ req: { user } }) => user?.role === 'admin'

/**
 * Public read, but only for published documents. Signed-in users see drafts so
 * that preview works in the admin panel.
 */
export const publishedOrSignedIn: Access = ({ req: { user } }) => {
  if (user) return true
  return {
    _status: { equals: 'published' },
  }
}
