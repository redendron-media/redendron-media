'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

import { morph } from '@/lib/morph-store'

/**
 * The morphing field.
 *
 * One particle system carrying four position buffers plus a burst direction.
 * Scroll drives a progress value from 0 to 4 and the vertex shader
 * interpolates between them, so the same matter reorganises rather than one
 * object being swapped for another - the point being that strategy compounds
 * rather than restarts.
 *
 *   0  KERNEL  a dense seed. The single idea a brand is actually about.
 *   1  CORE    that idea resolved into structure - an ordered shell.
 *   2  FUNNEL  the structure deployed outward into reach.
 *   3  GALAXY  reach settling into a system that holds itself together.
 *   4  BURST   the system letting go, toward the viewer, and dissipating
 *              before the footer arrives.
 *
 * The pacing is set by SiteBackdrop against real sections, not by a fixed
 * scroll distance, so each formation lasts as long as the content it belongs
 * to. Abstract on purpose: it should read as growth and organisation, not as
 * a literal diagram.
 */

const COUNT = 7500

/** Deterministic PRNG so the form is identical on every load and on the server. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function buildFormations() {
  const rand = mulberry32(20260728)

  const kernel = new Float32Array(COUNT * 3)
  const core = new Float32Array(COUNT * 3)
  const funnel = new Float32Array(COUNT * 3)
  const galaxy = new Float32Array(COUNT * 3)
  const burst = new Float32Array(COUNT * 3)
  const seeds = new Float32Array(COUNT)

  const golden = Math.PI * (3 - Math.sqrt(5))

  for (let i = 0; i < COUNT; i++) {
    const i3 = i * 3
    seeds[i] = rand()

    // -- KERNEL: dense, slightly irregular sphere. Mass with no structure.
    const kr = 0.9 * Math.cbrt(rand())
    const kt = rand() * Math.PI * 2
    const kp = Math.acos(2 * rand() - 1)
    kernel[i3] = kr * Math.sin(kp) * Math.cos(kt)
    kernel[i3 + 1] = kr * Math.sin(kp) * Math.sin(kt)
    kernel[i3 + 2] = kr * Math.cos(kp)

    // -- CORE: Fibonacci sphere. Same matter, now evenly ordered - the
    // difference between having an idea and having a position.
    const y = 1 - (i / (COUNT - 1)) * 2
    const radius = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = golden * i
    const shell = 2.05 + (rand() - 0.5) * 0.14
    core[i3] = Math.cos(theta) * radius * shell
    core[i3 + 1] = y * shell
    core[i3 + 2] = Math.sin(theta) * radius * shell

    // -- FUNNEL: conical spiral, wide at the top, converging downward.
    const t = i / COUNT
    const angle = t * Math.PI * 2 * 7
    // Bias points toward the wide mouth so it reads as reach, not a spike.
    const spread = Math.pow(1 - t, 0.65)
    const fr = 0.18 + spread * 3.25
    const jitter = (rand() - 0.5) * 0.32 * spread
    funnel[i3] = Math.cos(angle) * (fr + jitter)
    funnel[i3 + 1] = 2.1 - t * 4.6
    funnel[i3 + 2] = Math.sin(angle) * (fr + jitter)

    // -- GALAXY: a barred spiral seen at a tilt. Two logarithmic arms plus a
    // dense central bulge, flattened hard in y so it reads as a disc rather
    // than a ball. The funnel collapsing into this is the argument: reach
    // becomes a system that holds itself together.
    const bulge = rand() < 0.22
    let gx: number, gy: number, gz: number
    if (bulge) {
      const br = 0.75 * Math.pow(rand(), 0.6)
      const ba = rand() * Math.PI * 2
      const bp = Math.acos(2 * rand() - 1)
      gx = br * Math.sin(bp) * Math.cos(ba)
      gy = br * Math.cos(bp) * 0.45
      gz = br * Math.sin(bp) * Math.sin(ba)
    } else {
      const arm = i % 2 === 0 ? 0 : Math.PI
      // Logarithmic spiral: radius grows with the angle, which is what gives
      // arms their sweep instead of a flat pinwheel.
      const turn = Math.pow(rand(), 0.55) * 2.6
      const ga = arm + turn * 2.1
      const gr = 0.5 + turn * 1.5
      // Scatter perpendicular to the arm so it has width, thicker further out.
      const scatter = (rand() - 0.5) * (0.28 + turn * 0.34)
      gx = Math.cos(ga) * gr + Math.cos(ga + Math.PI / 2) * scatter
      gz = Math.sin(ga) * gr + Math.sin(ga + Math.PI / 2) * scatter
      gy = (rand() - 0.5) * 0.34
    }
    galaxy[i3] = gx
    galaxy[i3 + 1] = gy
    galaxy[i3 + 2] = gz

    // -- BURST: the direction each particle takes when the galaxy lets go.
    // Biased toward +z, which is toward the camera, so the explosion arrives
    // at the viewer rather than spreading flat across the frame.
    const ba2 = rand() * Math.PI * 2
    const bz = 0.35 + rand() * 0.9
    const spread2 = 0.55 + rand() * 0.75
    const speed = 0.55 + Math.pow(rand(), 1.7) * 1.9
    burst[i3] = Math.cos(ba2) * spread2 * speed
    burst[i3 + 1] = (rand() - 0.5) * spread2 * speed
    burst[i3 + 2] = bz * speed * 2.4
  }

  return { kernel, core, funnel, galaxy, burst, seeds }
}

const vertexShader = /* glsl */ `
  attribute vec3 aKernel;
  attribute vec3 aCore;
  attribute vec3 aFunnel;
  attribute vec3 aGalaxy;
  attribute vec3 aBurst;
  attribute float aSeed;

  uniform float uProgress;   // 0 -> 4 across the formations
  uniform float uTime;
  uniform float uPixelRatio;
  uniform vec2 uPointer;     // clip space, (9,9) when off screen
  uniform vec2 uAspect;      // keeps the glow radius circular

  varying float vDepth;
  varying float vSeed;
  varying float vGlow;

  void main() {
    // Stagger each particle's transition slightly so the form reorganises as
    // a wave instead of every point arriving at once. A plain offset, not a
    // rescale: dividing by (1 - stagger) stretched the whole 0..4 range, so
    // high-seed points ran a fifth of a formation ahead and were already
    // bursting while the galaxy was still gathering.
    float p = clamp(uProgress - aSeed * 0.12, 0.0, 4.0);

    vec3 pos;
    if (p < 1.0) {
      pos = mix(aKernel, aCore, smoothstep(0.0, 1.0, p));
    } else if (p < 2.0) {
      pos = mix(aCore, aFunnel, smoothstep(0.0, 1.0, p - 1.0));
    } else if (p < 3.0) {
      // The funnel collapsing inward into a disc. Slow on purpose - this is
      // the longest single formation in the sequence.
      pos = mix(aFunnel, aGalaxy, smoothstep(0.0, 1.0, p - 2.0));
    } else {
      // The burst. Accelerating rather than linear, so it hangs for a moment
      // and then goes, and biased along +z so it arrives at the viewer.
      // Modest reach on purpose: this is depth behind the page, not a
      // firework, and a bigger multiplier emptied the frame within a screen.
      float b = p - 3.0;
      pos = aGalaxy + aBurst * pow(b, 1.6) * 4.6;
    }

    // The galaxy spins about its own axis, and keeps spinning as it lets go.
    float spin = uTime * 0.09 + smoothstep(2.0, 3.0, p) * 0.6;
    float cs = cos(spin), sn = sin(spin);
    float spun = smoothstep(1.6, 2.4, p);
    vec3 rotated = vec3(pos.x * cs - pos.z * sn, pos.y, pos.x * sn + pos.z * cs);
    pos = mix(pos, rotated, spun);

    // Constant slow drift keeps it alive when the page is not scrolling.
    float drift = uTime * 0.14 + aSeed * 6.2831;
    pos.x += sin(drift) * 0.018;
    pos.y += cos(drift * 0.9) * 0.018;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    // Anything at or behind the camera plane produces a garbage point size,
    // and the burst deliberately sends particles past the viewer.
    float depth = max(-mv.z, 0.25);

    // Pointer proximity, measured on screen rather than in world space, so
    // the highlight tracks the cursor at any depth. Only the upper band of
    // seeds is eligible, which is what keeps it to a few specks rather than
    // lighting up a whole patch.
    vec2 ndc = gl_Position.xy / max(gl_Position.w, 0.0001);
    float near = 1.0 - smoothstep(0.0, 0.12, distance(ndc * uAspect, uPointer * uAspect));
    vGlow = near * step(0.86, aSeed);

    // Perspective-correct size, so nearer points genuinely read as nearer.
    // Clamped: without it, a burst particle passing close to the camera
    // blows up into a screen-filling disc.
    float size = mix(2.4, 3.4, aSeed) + vGlow * 3.2;
    gl_PointSize = clamp(size * uPixelRatio * (9.5 / depth), 0.0, 26.0 * uPixelRatio);

    vDepth = depth;
    vSeed = aSeed;
  }
`

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3 uInk;
  uniform vec3 uAccent;
  uniform vec3 uGlow;
  uniform float uOpacity;

  varying float vDepth;
  varying float vSeed;
  varying float vGlow;

  void main() {
    // Round, soft-edged points. Square particles look like dust.
    vec2 c = gl_PointCoord - 0.5;
    float d = dot(c, c);
    if (d > 0.25) discard;
    float alpha = smoothstep(0.25, 0.02, d);

    // Nearer points read stronger, far ones fade back - this is what creates
    // the sense of a volume rather than a flat spray.
    float near = 1.0 - smoothstep(4.5, 16.0, vDepth);
    vec3 color = mix(uInk, uAccent, smoothstep(0.55, 1.0, vSeed));
    color = mix(color, uGlow, vGlow);

    // Lit specks ignore the distance falloff, so they stay legible wherever
    // in the volume they happen to be.
    float body = alpha * uOpacity * mix(0.22, 0.85, near);
    gl_FragColor = vec4(color, mix(body, alpha * uOpacity, vGlow));
  }
`

// Particle colours for a light ground and for a dark one. Over the inverted
// bands the ink-on-ink version would simply vanish.
const LIGHT_INK = new THREE.Color('#0b0a08')
const LIGHT_ACCENT = new THREE.Color('#81120f')
const DARK_INK = new THREE.Color('#f4f2ed')
const DARK_ACCENT = new THREE.Color('#c8443f')
const GLOW = new THREE.Color('#c8110d')

function Field() {
  const points = useRef<THREE.Points>(null)
  const material = useRef<THREE.ShaderMaterial>(null)
  const { camera, viewport, size } = useThree()

  const { kernel, core, funnel, galaxy, burst, seeds } = useMemo(buildFormations, [])

  const uniforms = useMemo(
    () => ({
      uProgress: { value: 1 },
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uPointer: { value: new THREE.Vector2(9, 9) },
      uAspect: { value: new THREE.Vector2(1, 1) },
      uInk: { value: LIGHT_INK.clone() },
      uAccent: { value: LIGHT_ACCENT.clone() },
      uGlow: { value: GLOW },
      uOpacity: { value: 1 },
    }),
    []
  )

  // Eased mirrors of the store, so a flicked scroll never snaps.
  const eased = useRef({ progress: 1, dark: 0, opacity: 1, px: 9, py: 9 })

  useFrame((state, delta) => {
    const m = material.current
    if (!m) return

    const dt = Math.min(delta, 0.05)
    const e = eased.current

    m.uniforms.uTime.value += dt
    m.uniforms.uPixelRatio.value = Math.min(state.gl.getPixelRatio(), 2)
    m.uniforms.uAspect.value.set(Math.max(1, size.width / size.height), 1)

    // Slow follow. The sequence is paced by scroll; this only smooths it.
    e.progress += (morph.progress - e.progress) * Math.min(1, dt * 3.2)
    e.dark += (morph.dark - e.dark) * Math.min(1, dt * 3.2)

    // The glow trails the cursor slightly, which reads as the specks
    // responding rather than being pinned to the pointer.
    e.px += (morph.pointer[0] - e.px) * Math.min(1, dt * 9)
    e.py += (morph.pointer[1] - e.py) * Math.min(1, dt * 9)
    m.uniforms.uPointer.value.set(e.px, e.py)

    // Full strength through the hero, backed off once body copy takes over.
    // The exit belongs to the burst: it holds while the galaxy forms and
    // through most of the explosion, then dissipates just before the footer.
    const base = 1 - 0.5 * smoothstep(e.progress, 0.9, 1.5)
    const exit = 1 - smoothstep(e.progress, 3.35, 3.92)
    const target = base * exit
    e.opacity += (target - e.opacity) * Math.min(1, dt * 4)

    m.uniforms.uProgress.value = e.progress
    m.uniforms.uOpacity.value = e.opacity
    m.uniforms.uInk.value.copy(LIGHT_INK).lerp(DARK_INK, e.dark)
    m.uniforms.uAccent.value.copy(LIGHT_ACCENT).lerp(DARK_ACCENT, e.dark)

    if (points.current) {
      points.current.rotation.y += dt * 0.055
      // Tilt forward as the funnel forms, then settle to a shallow angle so
      // the galaxy is seen as a tilted disc rather than edge-on or flat.
      const toGalaxy = smoothstep(e.progress, 2, 3)
      points.current.rotation.x =
        (-0.12 - Math.min(e.progress, 2) * 0.16) * (1 - toGalaxy) + -0.55 * toGalaxy

      // The form is parked upper-right to clear the hero headline. Nothing
      // down here needs that clearance, and the galaxy is far wider than the
      // funnel - left where it was, its outer arm ran off the right edge. So
      // it drifts back to centre as it gathers.
      const px = offsetX * (1 - 0.75 * toGalaxy)
      const py = offsetY * (1 - toGalaxy) - 0.15 * toGalaxy
      const follow = Math.min(1, dt * 2.4)
      points.current.position.x += (px - points.current.position.x) * follow
      points.current.position.y += (py - points.current.position.y) * follow
    }

    // Camera: in as the kernel resolves, out as the funnel spreads, further
    // out to take in the whole galaxy - then held still through the burst so
    // the particles do the travelling, not the camera.
    const dolly = 8.6 - Math.sin((Math.min(e.progress, 2) / 2) * Math.PI) * 2.0
    const wide = smoothstep(e.progress, 2, 3) * 2.2
    const z = dolly + wide
    camera.position.z += (z - camera.position.z) * Math.min(1, dt * 3)
    camera.lookAt(0, 0, 0)
  })

  // Scale with the viewport, and sit the form in the upper right - clear of
  // the headline bottom-left, and low enough that it never crowds the header.
  const scale = Math.min(1.15, Math.max(0.72, viewport.width / 8))
  const offsetX = viewport.width > 7 ? 2.2 : 0
  const offsetY = viewport.width > 7 ? 0.95 : 0.5

  return (
    <points ref={points} scale={scale} position={[offsetX, offsetY, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[kernel, 3]} />
        <bufferAttribute attach="attributes-aKernel" args={[kernel, 3]} />
        <bufferAttribute attach="attributes-aCore" args={[core, 3]} />
        <bufferAttribute attach="attributes-aFunnel" args={[funnel, 3]} />
        <bufferAttribute attach="attributes-aGalaxy" args={[galaxy, 3]} />
        <bufferAttribute attach="attributes-aBurst" args={[burst, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </points>
  )
}

/** Same curve as GLSL smoothstep, for the JS-side opacity envelope. */
function smoothstep(x: number, edge0: number, edge1: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

export default function MorphField() {
  return (
    <Canvas
      className="pointer-events-none"
      dpr={[1, 1.75]}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 8.6], fov: 42 }}
    >
      <Field />
    </Canvas>
  )
}
