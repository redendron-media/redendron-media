'use client'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Single registration point. Registering plugins in more than one module
 * causes GSAP to warn and, under fast refresh, to double-register.
 */
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)

  // Mirrors --ease-brand in globals.css so JS and CSS animations agree.
  gsap.registerEase('brand', (p) => 1 - Math.pow(1 - p, 3))
}

export { gsap, ScrollTrigger }
