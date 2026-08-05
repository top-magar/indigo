"use client";

import { useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * CTA data wave — a point-cloud / halftone data terrain built from thousands
 * of discrete purple and white dots arranged over three overlapping sine
 * waves, with a dark-purple filled lower region.
 *
 * Deterministic (seeded PRNG, module-level) so SSR and client render the same
 * dots. Motion is slow group drift + subtle pointer parallax; both are
 * disabled under prefers-reduced-motion.
 */

const W = 1440;
const H = 420;

function mulberry32(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Dot = { x: number; y: number; r: number; cls: 0 | 1 | 2 };
type WaveGroup = Dot[];

function buildTerrain(): {
  waves: [WaveGroup, WaveGroup, WaveGroup];
  fillPath: string;
} {
  const rng = mulberry32(0x1d190);
  const waves = [
    { amp: 78, freq: 0.0042, phase: 0.0, base: 250 },
    { amp: 52, freq: 0.0072, phase: 2.2, base: 292 },
    { amp: 30, freq: 0.0115, phase: 4.4, base: 322 },
  ];
  const groups: [WaveGroup, WaveGroup, WaveGroup] = [[], [], []];

  const push = (g: number, dot: Dot) => {
    groups[g].push(dot);
  };

  // Wave lines — dense points hugging each sine curve.
  for (let x = 0; x <= W; x += 2.9) {
    waves.forEach((w, wi) => {
      const t = w.freq * x + w.phase;
      const y = w.base + w.amp * Math.sin(t) + (rng() - 0.5) * 22;
      const crest = Math.sin(t) > 0.7;
      push(wi, {
        x: x + (rng() - 0.5) * 2.2,
        y: y + (rng() - 0.5) * 2.2,
        r: crest ? 1.5 : 1 + rng() * 1.2,
        cls: crest ? 0 : 1,
      });
    });
  }

  // Dense field below the envelope — dark purple region.
  for (let x = 0; x <= W; x += 5.2) {
    const topY = Math.max(...waves.map((w) => w.base + w.amp * Math.sin(w.freq * x + w.phase)));
    for (let k = 0; k < 3; k += 1) {
      const y = topY + 10 + rng() * (H - topY - 16);
      if (rng() < 0.5) {
        push(k % 3, {
          x: x + (rng() - 0.5) * 3,
          y,
          r: 1 + rng() * 1.1,
          cls: 2,
        });
      }
    }
  }

  // Envelope path (filled lower terrain).
  const env: string[] = [];
  for (let x = 0; x <= W; x += 8) {
    const y = Math.max(...waves.map((w) => w.base + w.amp * Math.sin(w.freq * x + w.phase)));
    env.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  const fillPath = `M0,${H} L${env.join(" L")} L${W},${H} Z`;

  return { waves: groups, fillPath };
}

const TERRAIN = buildTerrain();

export function PointCloud({ className }: { className?: string }) {
  const [drift, setDrift] = useState(0);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const reduced = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced) return;
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const rel = (e.clientX - rect.left) / rect.width - 0.5;
    setDrift(rel * 16);
  };

  return (
    <div
      ref={wrapRef}
      className={cn("lv2-point-cloud", className)}
      onPointerMove={onMove}
      onPointerLeave={() => setDrift(0)}
      aria-hidden
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        width="100%"
        height="100%"
      >
        <path d={TERRAIN.fillPath} className="lv2-pc-fill" />
        {TERRAIN.waves.map((group, gi) => (
          <g
            key={gi}
            className={`lv2-pc-wave lv2-pc-wave--${gi}`}
            style={
              reduced
                ? undefined
                : {
                    transform: `translateX(${(drift * (gi + 0.5)).toFixed(1)}px)`,
                  }
            }
          >
            {group.map((dot, di) => (
              <circle
                key={di}
                cx={dot.x.toFixed(1)}
                cy={dot.y.toFixed(1)}
                r={dot.r.toFixed(2)}
                className={`lv2-pc-dot lv2-pc-dot--${dot.cls}`}
              />
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
}
