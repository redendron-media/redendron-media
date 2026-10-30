'use client'

import { useEffect, useRef, useState } from 'react'

import { finishLoader, isLoaderRunning } from '@/lib/loader'

/*
 * The icon mark, path for path from public/logo/logolight.svg. The finished
 * frame is these shapes and nothing else; the line work that builds them is
 * drawn over the top and handed off once the real shapes are in.
 */
const HEX = 'M14.0258 4.45961L7.51652 0.701467C7.44727 0.661485 7.36195 0.661484 7.29269 0.701468L0.783394 4.45961C0.714141 4.4996 0.67148 4.57349 0.67148 4.65345V12.1697C0.67148 12.2497 0.714142 12.3236 0.783395 12.3636L7.29269 16.1217C7.36195 16.1617 7.44727 16.1617 7.51652 16.1217L14.0258 12.3636C14.0951 12.3236 14.1377 12.2497 14.1377 12.1697V4.65345C14.1377 4.57349 14.0951 4.4996 14.0258 4.45961ZM7.85226 0.119948C7.57525 -0.0399831 7.23396 -0.0399825 6.95695 0.119949L0.447654 3.87809C0.170645 4.03803 0 4.33359 0 4.65345V12.1697C0 12.4896 0.170646 12.7852 0.447655 12.9451L6.95695 16.7033C7.23396 16.8632 7.57525 16.8632 7.85226 16.7033L14.3616 12.9451C14.6386 12.7852 14.8092 12.4896 14.8092 12.1697V4.65345C14.8092 4.33359 14.6386 4.03802 14.3616 3.87809L7.85226 0.119948Z'
const FACE = 'M11.2846 11.0526V9.52647L10.196 9.4701V8.41495L7.94528 9.41326L7.42893 9.39463L6.91258 9.41326L4.66137 8.41495V9.4701L3.57327 9.52647V11.0526L2.48468 10.2611L3.09322 5.30682L5.04923 5.92826L7.42893 5.83416L9.80863 5.92826L11.7642 5.30682L12.3732 10.2611L11.2846 11.0526Z'
const NOSE = ['M7.4347 9.96927V10.9958H7.21354L6.77075 10.2989L7.02917 9.96927H7.4347Z', 'M7.39795 9.96927V10.9958H7.61958L8.0619 10.2989L7.80396 9.96927H7.39795Z']
const CHEEKS = ['M9.15375 12.2014L9.56883 11.5804L9.15375 10.243L9.1719 10.2344C9.23551 10.3387 9.33347 10.4175 9.44894 10.4574C9.5029 10.4759 9.55956 10.4853 9.6166 10.4851C9.68412 10.4855 9.75104 10.4724 9.8134 10.4464C9.90877 10.4072 9.99036 10.3406 10.0478 10.255C10.1053 10.1693 10.1361 10.0686 10.1363 9.96545C10.1362 9.9069 10.1264 9.84878 10.1072 9.79349C10.1105 9.80209 10.1129 9.81116 10.1153 9.81976L10.1301 9.88472L10.4778 11.4586L9.15375 12.2014Z', 'M10.1382 9.98215C10.138 10.0856 10.107 10.1866 10.049 10.2723C9.99109 10.358 9.90889 10.4245 9.81295 10.4632C9.69662 10.51 9.56734 10.5138 9.4485 10.4737C9.33223 10.4348 9.23343 10.3562 9.16955 10.2515C9.12063 10.1704 9.09487 10.0774 9.09503 9.98262C9.09509 9.96155 9.09636 9.9405 9.09885 9.91957C9.10301 9.88713 9.11021 9.85514 9.12035 9.82404C9.13141 9.79091 9.14565 9.75891 9.16286 9.72851C9.21321 9.64265 9.28691 9.57286 9.37538 9.52726C9.46385 9.48166 9.56346 9.46213 9.6626 9.47093C9.76174 9.47974 9.85634 9.51653 9.93539 9.57701C10.0144 9.6375 10.0747 9.71919 10.1091 9.81258C10.112 9.82165 10.1148 9.83025 10.1172 9.83933L10.1316 9.90429C10.136 9.93 10.1383 9.95605 10.1382 9.98215Z', 'M5.71942 12.1949L5.30434 11.574L5.71942 10.2365L5.70127 10.2279C5.63766 10.3322 5.5397 10.4111 5.42423 10.451C5.37026 10.4695 5.3136 10.4788 5.25657 10.4787C5.18905 10.4791 5.12213 10.4659 5.05977 10.44C4.9644 10.4008 4.8828 10.3341 4.82533 10.2485C4.76785 10.1629 4.73706 10.0621 4.73688 9.95901C4.73694 9.90046 4.74679 9.84234 4.76601 9.78705C4.76267 9.79565 4.76028 9.80472 4.75789 9.81332L4.74309 9.87828L4.39535 11.4522L5.71942 12.1949Z', 'M4.73493 9.97574C4.73512 10.0792 4.76618 10.1802 4.82413 10.2659C4.88208 10.3516 4.96428 10.418 5.06021 10.4567C5.17655 10.5036 5.30582 10.5074 5.42467 10.4672C5.54094 10.4284 5.63974 10.3498 5.70362 10.2451C5.75253 10.164 5.7783 10.071 5.77814 9.97622C5.77808 9.95514 5.77681 9.93409 5.77432 9.91317C5.77016 9.88072 5.76296 9.84873 5.75282 9.81763C5.74176 9.7845 5.72752 9.7525 5.71031 9.7221C5.65996 9.63624 5.58626 9.56645 5.49779 9.52085C5.40932 9.47525 5.30971 9.45572 5.21057 9.46453C5.11143 9.47333 5.01683 9.51012 4.93778 9.5706C4.85873 9.63109 4.79849 9.71278 4.76407 9.80617C4.7612 9.81524 4.75833 9.82384 4.75595 9.83292L4.74162 9.89788C4.73713 9.92359 4.73489 9.94964 4.73493 9.97574Z']

/*
 * The centre line of the hexagon ring (outer apothem 7.4046, ring 0.6715
 * thick), split into two halves that rise from the bottom vertex and meet at
 * the top.
 */
const HEX_LINE = [
  'M7.4046 16.5741L14.4735 12.4929V4.3304L7.4046 0.2491',
  'M7.4046 16.5741L0.3357 12.4929V4.3304L7.4046 0.2491',
]

/** Longest the drawn mark is held waiting for the window load event. */
const MAX_WAIT = 3000
/** A beat on the finished mark before it leaves. */
const HOLD = 180
/** From the start of the exit to the hero being told to play. */
const HANDOFF = 420
/** Matches the curtain transition in globals.css, plus a frame. */
const EXIT = 980

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms))

/**
 * First-load loader: the mark draws itself while the page loads, then the
 * curtain lifts.
 *
 * The drawing is plain CSS keyframes, so it runs from first paint, before any
 * JS has arrived. This component only decides when to leave: once the drawing
 * has finished and the window has loaded (or MAX_WAIT has passed, so one slow
 * asset cannot hold the site hostage). Without JS, or under reduced motion,
 * the probe never sets `data-loader` and the overlay is never shown.
 */
export function SiteLoader() {
  const root = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState<'drawing' | 'leaving' | 'gone'>('drawing')

  useEffect(() => {
    window.clearTimeout(window.__loaderFailsafe)
    const el = root.current
    if (!el || !isLoaderRunning()) {
      setPhase('gone')
      return
    }

    let cancelled = false
    // A cancelled animation rejects; either way the drawing is over.
    const drawn = Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished)).catch(
      () => {}
    )
    const loaded =
      document.readyState === 'complete'
        ? Promise.resolve()
        : new Promise<void>((resolve) =>
            window.addEventListener('load', () => resolve(), { once: true })
          )

    drawn
      .then(() => Promise.race([loaded, wait(MAX_WAIT)]))
      .then(() => wait(HOLD))
      .then(async () => {
        if (cancelled) return
        setPhase('leaving')
        await wait(HANDOFF)
        if (cancelled) return
        finishLoader()
        await wait(EXIT - HANDOFF)
        if (!cancelled) setPhase('gone')
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (phase === 'gone') return null

  return (
    <div ref={root} aria-hidden data-loader-root data-state={phase} className="site-loader">
      <svg viewBox="0 0 14.8092 16.8232" className="site-loader__mark">
        <g
          className="site-loader__hex-line"
          fill="none"
          stroke="black"
          strokeWidth={0.6715}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {HEX_LINE.map((d) => (
            <path key={d} d={d} pathLength={1} />
          ))}
        </g>
        <path
          className="site-loader__hex"
          d={HEX}
          fill="black"
          fillRule="evenodd"
          clipRule="evenodd"
        />
        <path
          className="site-loader__face-line"
          d={FACE}
          pathLength={1}
          fill="none"
          stroke="#81120F"
          strokeWidth={0.3}
          strokeLinejoin="round"
        />
        <path className="site-loader__face" d={FACE} fill="#81120F" />
        <g className="site-loader__nose" fill="black">
          {NOSE.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        <g className="site-loader__cheeks" fill="#FDFAD5">
          {CHEEKS.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
      </svg>
    </div>
  )
}
