type Point = [number, number];
type Wobble = { freq: number; amp: number; phase: number };

/**
 * Converts a closed set of points into a smooth SVG path using a
 * Catmull-Rom-to-Bezier conversion. Because every ring in a hill is simply
 * a scaled copy of the same radius function around a shared center, the
 * rings are guaranteed to nest without ever crossing one another—just like
 * real elevation contour lines on a topographic survey.
 */
function smoothClosedPath(points: Point[]): string {
  const n = points.length;
  const at = (i: number) => points[((i % n) + n) % n];
  const t = 1 / 6;

  let d = `M${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1: Point = [p1[0] + (p2[0] - p0[0]) * t, p1[1] + (p2[1] - p0[1]) * t];
    const c2: Point = [p2[0] - (p3[0] - p1[0]) * t, p2[1] - (p3[1] - p1[1]) * t];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return `${d}Z`;
}

/** A smooth, low-frequency radius function makes a naturalistic, irregular
 * (but always simple/non-self-intersecting) hill outline. */
function organicRadii(base: number, wobble: Wobble[], points: number): number[] {
  return Array.from({ length: points }, (_, i) => {
    const angle = (i / points) * Math.PI * 2;
    const factor = wobble.reduce(
      (sum, w) => sum + w.amp * Math.cos(w.freq * angle + w.phase),
      1,
    );
    return base * factor;
  });
}

function ringPoints(cx: number, cy: number, radii: number[], scale: number): Point[] {
  const n = radii.length;
  return radii.map((r, i) => {
    const angle = (i / n) * Math.PI * 2;
    const radius = r * scale;
    return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius];
  });
}

const POINTS_PER_RING = 14;

type Hill = {
  cx: number;
  cy: number;
  base: number;
  wobble: Wobble[];
  scales: number[];
  elevation?: number;
  labelRing?: number;
  labelAngle?: number;
};

// A mountain-range-style vista: major labeled peaks plus smaller unlabeled
// foothills, hand-placed to cover almost the entire canvas edge to edge
// (a real topo map of rugged terrain has no large flat gaps). Every hill is
// still a family of concentric contours scaled from a single organic radius
// function around its own center, so within a hill the rings can never
// cross. The `fitHills` pass below guarantees they never cross *between*
// hills either, by shrinking whichever hill in a too-close pair is larger
// until every pair clears a minimum gap.
const HILL_LAYOUT: Hill[] = [
  { cx: 230, cy: 210, base: 150, wobble: [{ freq: 2, amp: 0.13, phase: 0.3 }, { freq: 5, amp: 0.05, phase: 1.2 }], scales: [1, 0.86, 0.72, 0.58, 0.45, 0.32, 0.2], elevation: 13020, labelRing: 1, labelAngle: 0.3 },
  { cx: 610, cy: 150, base: 150, wobble: [{ freq: 3, amp: 0.12, phase: 0.9 }, { freq: 5, amp: 0.04, phase: 2.0 }], scales: [1, 0.87, 0.74, 0.61, 0.48, 0.36, 0.24, 0.14], elevation: 14259, labelRing: 1, labelAngle: -0.4 },
  { cx: 980, cy: 220, base: 145, wobble: [{ freq: 2, amp: 0.14, phase: 1.6 }, { freq: 4, amp: 0.05, phase: 0.4 }], scales: [1, 0.86, 0.72, 0.58, 0.45, 0.32, 0.2], elevation: 12713, labelRing: 1, labelAngle: 0.6 },
  { cx: 1290, cy: 175, base: 120, wobble: [{ freq: 3, amp: 0.11, phase: 0.2 }, { freq: 5, amp: 0.04, phase: 1.9 }], scales: [1, 0.85, 0.7, 0.55, 0.4, 0.27], elevation: 11796, labelRing: 1, labelAngle: 0 },
  { cx: 430, cy: 510, base: 150, wobble: [{ freq: 2, amp: 0.13, phase: 2.1 }, { freq: 4, amp: 0.05, phase: 0.5 }], scales: [1, 0.86, 0.72, 0.58, 0.45, 0.32, 0.2], elevation: 12324, labelRing: 1, labelAngle: 2.6 },
  { cx: 825, cy: 555, base: 138, wobble: [{ freq: 3, amp: 0.12, phase: 1.3 }, { freq: 5, amp: 0.04, phase: 0.1 }], scales: [1, 0.86, 0.72, 0.58, 0.45, 0.32], elevation: 11245, labelRing: 1, labelAngle: 1.2 },
  { cx: 1170, cy: 545, base: 122, wobble: [{ freq: 2, amp: 0.12, phase: 0.6 }, { freq: 4, amp: 0.04, phase: 1.7 }], scales: [1, 0.85, 0.7, 0.55, 0.4, 0.27], elevation: 10680, labelRing: 1, labelAngle: -1 },

  // minor foothills, unlabeled
  { cx: 95, cy: 500, base: 75, wobble: [{ freq: 2, amp: 0.13, phase: 0.8 }], scales: [1, 0.78, 0.58, 0.4] },
  { cx: 1400, cy: 430, base: 62, wobble: [{ freq: 3, amp: 0.12, phase: 1.5 }], scales: [1, 0.76, 0.52] },
  { cx: 260, cy: 770, base: 82, wobble: [{ freq: 2, amp: 0.12, phase: 2.4 }], scales: [1, 0.78, 0.58, 0.38] },
  { cx: 610, cy: 800, base: 88, wobble: [{ freq: 3, amp: 0.11, phase: 0.4 }], scales: [1, 0.78, 0.58, 0.4] },
  { cx: 960, cy: 795, base: 78, wobble: [{ freq: 2, amp: 0.13, phase: 1.9 }], scales: [1, 0.77, 0.56, 0.37] },
  { cx: 1310, cy: 760, base: 70, wobble: [{ freq: 4, amp: 0.1, phase: 0.7 }], scales: [1, 0.76, 0.54] },
  { cx: 55, cy: 95, base: 58, wobble: [{ freq: 3, amp: 0.12, phase: 2.0 }], scales: [1, 0.75, 0.5] },
  { cx: 1400, cy: 70, base: 55, wobble: [{ freq: 2, amp: 0.11, phase: 0.2 }], scales: [1, 0.74, 0.5] },
  { cx: 705, cy: 335, base: 68, wobble: [{ freq: 3, amp: 0.12, phase: 1.1 }], scales: [1, 0.76, 0.54] },
  { cx: 1030, cy: 420, base: 60, wobble: [{ freq: 2, amp: 0.12, phase: 0.5 }], scales: [1, 0.75, 0.52] },
  { cx: 300, cy: 380, base: 58, wobble: [{ freq: 4, amp: 0.1, phase: 1.4 }], scales: [1, 0.75, 0.52] },
  { cx: 820, cy: 90, base: 55, wobble: [{ freq: 2, amp: 0.12, phase: 0.9 }], scales: [1, 0.74, 0.5] },
  { cx: 520, cy: 660, base: 58, wobble: [{ freq: 3, amp: 0.11, phase: 1.6 }], scales: [1, 0.75, 0.52] },
];

function maxRadius(hill: Hill): number {
  return hill.base * (1 + hill.wobble.reduce((sum, w) => sum + Math.abs(w.amp), 0));
}

/** Shrinks whichever hill in a too-close pair is larger, repeatedly, until
 * every pair of hills clears a minimum gap—guaranteeing rings from
 * different hills never cross, however densely they're packed. */
function fitHills(layout: Hill[]): Hill[] {
  const hills = layout.map((h) => ({ ...h }));
  const margin = 15;
  for (let iter = 0; iter < 500; iter++) {
    let changed = false;
    for (let i = 0; i < hills.length; i++) {
      for (let j = i + 1; j < hills.length; j++) {
        const a = hills[i];
        const b = hills[j];
        const dist = Math.hypot(a.cx - b.cx, a.cy - b.cy);
        const need = maxRadius(a) + maxRadius(b) + margin;
        if (dist < need) {
          const bigger = maxRadius(a) >= maxRadius(b) ? a : b;
          bigger.base *= 0.97;
          changed = true;
        }
      }
    }
    if (!changed) break;
  }
  return hills;
}

const HILLS = fitHills(HILL_LAYOUT);

export function TopographicPattern({
  className,
  tone = "gold",
}: {
  className?: string;
  tone?: "gold" | "slate";
}) {
  const stroke = tone === "gold" ? "#C4A574" : "#1A2B3C";

  return (
    <svg
      className={className}
      viewBox="0 0 1440 900"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <g
        stroke={stroke}
        strokeWidth="0.75"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      >
        {HILLS.map((hill, hillIndex) => {
          const radii = organicRadii(hill.base, hill.wobble, POINTS_PER_RING);
          return hill.scales.map((scale, ringIndex) => (
            <path
              key={`${hillIndex}-${ringIndex}`}
              d={smoothClosedPath(ringPoints(hill.cx, hill.cy, radii, scale))}
            />
          ));
        })}
      </g>
      <g fill={stroke} opacity="0.7" fontSize="11" fontFamily="ui-monospace, monospace">
        {HILLS.map((hill, hillIndex) => {
          if (!hill.elevation || hill.labelRing === undefined) return null;
          const radii = organicRadii(hill.base, hill.wobble, POINTS_PER_RING);
          const scale = hill.scales[hill.labelRing];
          const angle = hill.labelAngle ?? 0;
          const n = radii.length;
          const idx = (((Math.round((angle / (Math.PI * 2)) * n) % n) + n) % n);
          const r = radii[idx] * scale;
          const x = hill.cx + Math.cos(angle) * (r + 14);
          const y = hill.cy + Math.sin(angle) * (r + 14);
          return (
            <text key={hillIndex} x={x.toFixed(1)} y={y.toFixed(1)}>
              {hill.elevation.toLocaleString()}
            </text>
          );
        })}
      </g>
    </svg>
  );
}
