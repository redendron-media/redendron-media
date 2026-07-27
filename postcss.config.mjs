/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // Tailwind 4 ships its own PostCSS plugin; there is no tailwind.config.ts
    // any more - design tokens live in app/(frontend)/globals.css under @theme.
    '@tailwindcss/postcss': {},
  },
}

export default config
