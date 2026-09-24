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

function hillPaths(
  cx: number,
  cy: number,
  radii: number[],
  scales: number[],
): string[] {
  return scales.map((scale) => smoothClosedPath(ringPoints(cx, cy, radii, scale)));
}

const POINTS_PER_RING = 14;

type Hill = {
  cx: number;
  cy: number;
  base: number;
  wobble: Wobble[];
  scales: number[];
};

// Each hill is a family of concentric elevation contours: a single organic
// radius function scaled down toward its own center. Hills are spaced far
// enough apart that no two hills' rings ever touch, matching how contour
// lines behave on a real topographic map.
const HILLS: Hill[] = [
  {
    cx: 330,
    cy: 290,
    base: 195,
    wobble: [
      { freq: 2, amp: 0.14, phase: 0.4 },
      { freq: 5, amp: 0.05, phase: 1.8 },
    ],
    scales: [1, 0.82, 0.65, 0.49, 0.35, 0.22],
  },
  {
    cx: 1090,
    cy: 250,
    base: 155,
    wobble: [
      { freq: 3, amp: 0.12, phase: 1.1 },
      { freq: 5, amp: 0.05, phase: 0.3 },
    ],
    scales: [1, 0.8, 0.6, 0.42, 0.26],
  },
  {
    cx: 190,
    cy: 700,
    base: 95,
    wobble: [
      { freq: 2, amp: 0.13, phase: 2.2 },
      { freq: 4, amp: 0.05, phase: 0.6 },
    ],
    scales: [1, 0.78, 0.58, 0.4],
  },
  {
    cx: 1210,
    cy: 660,
    base: 122,
    wobble: [
      { freq: 3, amp: 0.11, phase: 0.7 },
      { freq: 5, amp: 0.04, phase: 2.5 },
    ],
    scales: [1, 0.8, 0.62, 0.46, 0.3],
  },
  {
    cx: 700,
    cy: 800,
    base: 82,
    wobble: [
      { freq: 2, amp: 0.12, phase: 1.5 },
      { freq: 4, amp: 0.05, phase: 0.2 },
    ],
    scales: [1, 0.76, 0.54, 0.34],
  },
  {
    cx: 1350,
    cy: 110,
    base: 63,
    wobble: [{ freq: 3, amp: 0.13, phase: 0.9 }],
    scales: [1, 0.74, 0.5],
  },
];

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
          return hillPaths(hill.cx, hill.cy, radii, hill.scales).map(
            (d, ringIndex) => <path key={`${hillIndex}-${ringIndex}`} d={d} />,
          );
        })}
      </g>
    </svg>
  );
}
