/**
 * Shared state between the scroll layer and the WebGL field.
 *
 * A plain mutable object rather than React state on purpose: these values are
 * written by scroll and pointer handlers at 60fps and read inside a render
 * loop. Routing them through context would re-render the tree every frame.
 *
 * SiteBackdrop writes everything here; the field only ever reads.
 */
export type MorphStore = {
  /**
   * 0 -> 3 across the four formations, paced against real sections rather
   * than a fixed scroll distance:
   *
   *   0  KERNEL   page top
   *   1  CORE     as the hero releases
   *   2  FUNNEL   as the stages sequence arrives
   *   3  SPIRAL   gone by the footer
   */
  progress: number
  /** 0 -> 1, how dark the ground currently under the viewport is. */
  dark: number
  /** Pointer in clip space (-1..1, y up). Off-screen parks at (9, 9). */
  pointer: [number, number]
}

export const morph: MorphStore = {
  progress: 3,
  dark: 0,
  pointer: [9, 9],
}
