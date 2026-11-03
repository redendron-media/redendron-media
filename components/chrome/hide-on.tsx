'use client'

import { usePathname } from 'next/navigation'

/**
 * Leaves out a piece of site chrome on the routes listed.
 *
 * The root layout cannot see the path, and splitting every page into a
 * second route group to drop one footer would move the whole app around. The
 * children are still rendered on the server - this only decides whether they
 * are shown.
 */
export function HideOn({ paths, children }: { paths: string[]; children: React.ReactNode }) {
  const pathname = usePathname()
  if (paths.includes(pathname)) return null
  return <>{children}</>
}
