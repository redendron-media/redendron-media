import { RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'

import { cn } from '@/lib/utils'

/**
 * Editorial prose styling for Lexical content.
 *
 * Deliberately narrow measure (~68ch) - long-form reads badly at full width,
 * and the case studies are the pages prospects actually read.
 */
export function RichText({ data, className }: { data: unknown; className?: string }) {
  if (!data) return null

  return (
    <div
      className={cn(
        'max-w-[68ch] text-body leading-relaxed text-ink-soft',
        '[&_p]:mb-5 [&_p:last-child]:mb-0',
        '[&_h2]:mb-4 [&_h2]:mt-12 [&_h2]:text-h3 [&_h2]:font-bold [&_h2]:text-ink',
        '[&_h3]:mb-3 [&_h3]:mt-10 [&_h3]:text-h4 [&_h3]:font-bold [&_h3]:text-ink',
        '[&_ul]:mb-5 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5',
        '[&_ol]:mb-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5',
        '[&_li]:pl-1',
        '[&_a]:border-b [&_a]:border-oxblood/40 [&_a]:text-oxblood [&_a]:transition-colors hover:[&_a]:border-oxblood',
        '[&_blockquote]:my-8 [&_blockquote]:border-l-2 [&_blockquote]:border-oxblood [&_blockquote]:pl-6 [&_blockquote]:text-lead [&_blockquote]:italic',
        '[&_strong]:font-medium [&_strong]:text-ink',
        className
      )}
    >
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <LexicalRichText data={data as any} />
    </div>
  )
}
