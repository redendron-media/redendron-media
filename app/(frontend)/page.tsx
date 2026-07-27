export default function HomePage() {
  return (
    <main className="gutter flex min-h-dvh flex-col justify-center py-32">
      <p className="eyebrow text-oxblood">Redendron Media</p>
      <h1 className="mt-6 text-display-2 font-display">Foundation in place.</h1>
      <p className="mt-6 max-w-xl text-lead text-ink-muted">
        Payload CMS, design tokens and the Next 16 shell are wired up. The homepage build
        starts next.
      </p>
      <a
        href="/admin"
        className="mt-10 w-fit border border-ink px-6 py-3 text-small transition-colors duration-fast ease-brand hover:bg-ink hover:text-paper"
      >
        Open the CMS →
      </a>
    </main>
  )
}
