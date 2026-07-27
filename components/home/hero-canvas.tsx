'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

/**
 * The WebGL layer behind the hero.
 *
 * A single full-screen plane running a domain-warped noise field, rendered as
 * contour bands - a topographic drift in oxblood on cream. One draw call, no
 * textures, no geometry beyond two triangles, so it costs almost nothing on
 * the main thread and nothing on the network.
 *
 * Deliberately not a particle system or a floating blob: this reads as
 * cartography and craft rather than as a generic agency shader.
 */

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vUv;
  uniform float uTime;
  uniform vec2  uResolution;
  uniform vec2  uPointer;
  uniform float uScroll;
  uniform vec3  uInk;
  uniform float uIntensity;

  // Ashima simplex noise (2D).
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                          + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
                            dot(x12.zw, x12.zw)), 0.0);
    m = m * m; m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float fbm(vec2 p) {
    float sum = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 5; i++) {
      sum += amp * snoise(p);
      p *= 2.02;
      amp *= 0.5;
    }
    return sum;
  }

  void main() {
    // Preserve aspect so the field does not stretch on wide viewports.
    vec2 uv = vUv;
    uv.x *= uResolution.x / uResolution.y;

    float t = uTime * 0.022;

    // Domain warp: noise sampling coordinates displaced by more noise. This
    // is what turns even bands into something that looks drawn rather than
    // generated.
    vec2 q = vec2(fbm(uv * 1.1 + t), fbm(uv * 1.1 + vec2(4.2, 1.3) - t));
    vec2 warp = uv * 1.25 + q * 0.55;

    // Pointer and scroll nudge the field rather than driving it, so it never
    // feels like the page is chasing the cursor.
    warp += uPointer * 0.09;
    warp.y += uScroll * 0.3;

    float field = fbm(warp);

    // Contour lines. Low frequency and a hairline width - this should read as
    // a survey drawing under the type, not as texture on top of it.
    float freq = 1.7;
    float bands = field * freq;
    float d = abs(fract(bands) - 0.5);
    // Screen-space derivative keeps the line one hairline wide at any DPR or
    // zoom instead of thickening where the field is flat.
    float w = fwidth(bands);
    float line = 1.0 - smoothstep(w * 0.6, w * 1.9, d);

    // Keep the left third clean: that is where the headline sits, and type on
    // texture is the fastest way to look cheap.
    float clearLeft = smoothstep(0.18, 0.62, vUv.x);
    // Settle toward the bottom so it hands off to the page rather than
    // stopping at a hard edge.
    float fadeDown = smoothstep(0.0, 0.42, vUv.y);

    float alpha = line * clearLeft * fadeDown * uIntensity;

    gl_FragColor = vec4(uInk, alpha);
  }
`

function ContourField({ intensity }: { intensity: number }) {
  const material = useRef<THREE.ShaderMaterial>(null)
  const { size, viewport } = useThree()
  const pointer = useRef(new THREE.Vector2(0, 0))
  const target = useRef(new THREE.Vector2(0, 0))

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uScroll: { value: 0 },
      uInk: { value: new THREE.Color('#81120f') },
            uIntensity: { value: intensity },
    }),
    [intensity]
  )

  useFrame((state, delta) => {
    const m = material.current
    if (!m) return

    // Cap delta so a backgrounded tab does not jump the animation on return.
    m.uniforms.uTime.value += Math.min(delta, 0.05)
    m.uniforms.uResolution.value.set(size.width, size.height)

    target.current.set(state.pointer.x, state.pointer.y)
    pointer.current.lerp(target.current, 0.045)
    m.uniforms.uPointer.value.copy(pointer.current)

    m.uniforms.uScroll.value = window.scrollY / Math.max(1, window.innerHeight)
  })

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}

export default function HeroCanvas({ intensity = 0.28 }: { intensity?: number }) {
  return (
    <Canvas
      className="pointer-events-none"
      // Cap DPR: this is a background texture, not a hero product render, and
      // uncapped retina costs 4x fill rate for no visible gain.
      dpr={[1, 1.6]}
      gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
      // Renders on demand would freeze the drift; this is the one always-on
      // loop on the page.
      frameloop="always"
      orthographic
      camera={{ position: [0, 0, 1], zoom: 1 }}
    >
      <ContourField intensity={intensity} />
    </Canvas>
  )
}
