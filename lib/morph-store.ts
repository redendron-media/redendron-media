/**
 * Shared state between the scroll layer and the WebGL field.
 *
 * A plain mutable object rather than React state on purpose: these values are
 * written by ScrollTrigger at 60fps and read inside a render loop. Routing
 * them through context would re-render the whole tree on every frame.
 *
 * The Hero writes `progress` and `inHero`; SiteBackdrop writes `tail` and
 * `dark`; the field only ever reads.
 */
export type MorphStore = {
  /** 0 -> 2 across kernel / core / funnel. Parks at 2 on pages with no hero. */
  progress: number
  /** 0 -> 1 across everything after the hero. Drives the dispersal. */
  tail: number
  /** 0 -> 1, how dark the ground currently under the viewport is. */
  dark: number
  /** True while the hero owns the frame, so the field can sit at full strength. */
  inHero: boolean
}

export const morph: MorphStore = {
  progress: 2,
  tail: 0,
  dark: 0,
  inHero: false,
}
