/**
 * Shared state for the first-load loader.
 *
 * The blocking probe in the frontend layout stamps `data-loader="running"` on
 * <html> before first paint whenever motion is on. SiteLoader flips it to
 * "done" as it starts to leave; if the app never hydrates, the probe's own
 * failsafe removes it. Anything that animates on mount waits on this, so the
 * hero and the first reveals play as the curtain lifts rather than unseen
 * underneath it.
 */

export const LOADER_DONE = 'loader:done'

declare global {
  interface Window {
    /** Set by the probe: clears the loader if the app has not hydrated in time. */
    __loaderFailsafe?: number
  }
}

export const isLoaderRunning = () =>
  typeof document !== 'undefined' && document.documentElement.dataset.loader === 'running'

/** Runs `fn` once the loader has started to leave - immediately if there is none. */
export function onLoaderDone(fn: () => void): () => void {
  if (!isLoaderRunning()) {
    fn()
    return () => {}
  }
  const handler = () => fn()
  window.addEventListener(LOADER_DONE, handler, { once: true })
  return () => window.removeEventListener(LOADER_DONE, handler)
}

export function finishLoader() {
  document.documentElement.dataset.loader = 'done'
  window.dispatchEvent(new Event(LOADER_DONE))
}
