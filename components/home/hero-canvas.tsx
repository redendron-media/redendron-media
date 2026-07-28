'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

/**
 * The morphing hero form.
 *
 * One particle system carrying three position buffers. Scroll drives a
 * progress value from 0 to 2 and the vertex shader interpolates between them,
 * so the same matter reorganises rather than one object being swapped for
 * another - the point being that strategy compounds rather than restarts.
 *
 *   0  KERNEL  a dense seed. The single idea a brand is actually about.
 *   1  CORE    that idea resolved into structure - an ordered shell.
 *   2  FUNNEL  the structure deployed outward into reach.
 *
 * Abstract on purpose: it should read as growth and organisation, not as a
 * literal diagram. The camera also dollies in slightly across the sequence,
 * which is where the sense of depth comes from.
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
    const turns = 7
    const angle = t * Math.PI * 2 * turns
    // Bias points toward the wide mouth so it reads as reach, not a spike.
    const spread = Math.pow(1 - t, 0.65)
    const fr = 0.18 + spread * 3.25
    const jitter = (rand() - 0.5) * 0.32 * spread
    funnel[i3] = Math.cos(angle) * (fr + jitter)
    funnel[i3 + 1] = 2.1 - t * 4.6
    funnel[i3 + 2] = Math.sin(angle) * (fr + jitter)
  }

  return { kernel, core, funnel, seeds }
}

const vertexShader = /* glsl */ `
  attribute vec3 aKernel;
  attribute vec3 aCore;
  attribute vec3 aFunnel;
  attribute float aSeed;

  uniform float uProgress;   // 0 -> 2 across the three formations
  uniform float uTime;
  uniform float uPixelRatio;

  varying float vDepth;
  varying float vSeed;

  void main() {
    // Stagger each particle's transition slightly so the form reorganises as
    // a wave instead of every point arriving at once.
    float stagger = aSeed * 0.35;
    float p = clamp((uProgress - stagger) / (1.0 - stagger * 0.5), 0.0, 2.0);

    vec3 pos = p < 1.0
      ? mix(aKernel, aCore, smoothstep(0.0, 1.0, p))
      : mix(aCore, aFunnel, smoothstep(0.0, 1.0, p - 1.0));

    // Constant slow drift keeps it alive when the page is not scrolling.
    float drift = uTime * 0.14 + aSeed * 6.2831;
    pos.x += sin(drift) * 0.018;
    pos.y += cos(drift * 0.9) * 0.018;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    // Perspective-correct size, so nearer points genuinely read as nearer.
    float size = mix(2.4, 3.4, aSeed);
    gl_PointSize = size * uPixelRatio * (9.5 / -mv.z);

    vDepth = -mv.z;
    vSeed = aSeed;
  }
`

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3 uInk;
  uniform vec3 uAccent;
  uniform float uOpacity;

  varying float vDepth;
  varying float vSeed;

  void main() {
    // Round, soft-edged points. Square particles look like dust.
    vec2 c = gl_PointCoord - 0.5;
    float d = dot(c, c);
    if (d > 0.25) discard;
    float alpha = smoothstep(0.25, 0.02, d);

    // Nearer points darken toward ink, far ones fade back - this is what
    // creates the sense of a volume rather than a flat spray.
    float near = 1.0 - smoothstep(4.5, 13.0, vDepth);
    vec3 color = mix(uInk, uAccent, smoothstep(0.55, 1.0, vSeed));

    gl_FragColor = vec4(color, alpha * uOpacity * mix(0.22, 0.85, near));
  }
`

function MorphForm({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const points = useRef<THREE.Points>(null)
  const material = useRef<THREE.ShaderMaterial>(null)
  const { camera, viewport } = useThree()

  const { kernel, core, funnel, seeds } = useMemo(buildFormations, [])

  const uniforms = useMemo(
    () => ({
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uInk: { value: new THREE.Color('#0b0a08') },
      uAccent: { value: new THREE.Color('#81120f') },
      uOpacity: { value: 1 },
    }),
    []
  )

  const smoothed = useRef(0)

  useFrame((state, delta) => {
    const m = material.current
    if (!m) return

    const dt = Math.min(delta, 0.05)
    m.uniforms.uTime.value += dt
    m.uniforms.uPixelRatio.value = Math.min(state.gl.getPixelRatio(), 2)

    // Ease toward the scroll target so a flicked scroll does not snap.
    smoothed.current += (progressRef.current - smoothed.current) * Math.min(1, dt * 4.5)
    m.uniforms.uProgress.value = smoothed.current

    if (points.current) {
      points.current.rotation.y += dt * 0.055
      // Tilt forward as the funnel forms, so it opens toward the viewer.
      points.current.rotation.x = -0.12 - smoothed.current * 0.16
    }

    // Camera dolly: pull in as the kernel resolves, ease back out as the
    // funnel spreads. This is the zoom, driven by the same scroll value.
    const z = 8.6 - Math.sin((smoothed.current / 2) * Math.PI) * 2.0
    camera.position.z += (z - camera.position.z) * Math.min(1, dt * 3)
    camera.lookAt(0, 0, 0)
  })

  // Scale with the viewport, and sit the form upper-right so it never fights
  // the headline, which is bottom-left.
  const scale = Math.min(1.15, Math.max(0.72, viewport.width / 8))
  const offsetX = viewport.width > 7 ? 2.1 : 0
  const offsetY = viewport.width > 7 ? 1.9 : 0.9

  return (
    <points ref={points} scale={scale} position={[offsetX, offsetY, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[kernel, 3]} />
        <bufferAttribute attach="attributes-aKernel" args={[kernel, 3]} />
        <bufferAttribute attach="attributes-aCore" args={[core, 3]} />
        <bufferAttribute attach="attributes-aFunnel" args={[funnel, 3]} />
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

export default function HeroCanvas({
  progressRef,
}: {
  /** 0 -> 2, driven by scroll in the parent. */
  progressRef: React.MutableRefObject<number>
}) {
  return (
    <Canvas
      className="pointer-events-none"
      dpr={[1, 1.75]}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 8.6], fov: 42 }}
    >
      <MorphForm progressRef={progressRef} />
    </Canvas>
  )
}
