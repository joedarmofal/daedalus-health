type Point = [number, number];

/**
 * A real topographic map's contour lines are isolines of a single
 * continuous elevation surface—they flow across the entire sheet, merge at
 * saddles between summits, and simply run off the edge of the map. That is
 * what this file builds: a smooth elevation field (peaks + connecting
 * ridges + a gentle whole-canvas undulation), sampled on a grid, then
 * traced into contour lines with marching squares. This guarantees the
 * lines never cross (they're isolines of one function) while flowing
 * continuously edge-to-edge like a genuine USGS quad sheet, rather than
 * looking like isolated hill clusters.
 */

const W = 1440;
const H = 900;

type Peak = { cx: number; cy: number; h: number; r: number; elevation?: number };
type Ridge = { a: Point; b: Point; h: number; w: number };

// Major peaks (labeled with real Rocky Mountain National Park elevations).
const PEAKS: Peak[] = [
  { cx: 230, cy: 210, h: 95, r: 110, elevation: 13020 },
  { cx: 610, cy: 150, h: 100, r: 115, elevation: 14259 },
  { cx: 980, cy: 220, h: 92, r: 105, elevation: 12713 },
  { cx: 1290, cy: 175, h: 78, r: 95, elevation: 11245 },
  { cx: 430, cy: 510, h: 90, r: 110, elevation: 12324 },
  { cx: 825, cy: 555, h: 82, r: 100, elevation: 11796 },
  { cx: 1170, cy: 545, h: 75, r: 95, elevation: 10680 },
];

// Minor foothills, unlabeled—fill in the range so there's no bare canvas.
const MINOR: Peak[] = [
  { cx: 95, cy: 500, h: 40, r: 65 },
  { cx: 1400, cy: 430, h: 35, r: 55 },
  { cx: 260, cy: 770, h: 45, r: 70 },
  { cx: 610, cy: 800, h: 48, r: 75 },
  { cx: 960, cy: 795, h: 42, r: 68 },
  { cx: 1310, cy: 760, h: 38, r: 60 },
  { cx: 55, cy: 95, h: 32, r: 55 },
  { cx: 1400, cy: 70, h: 30, r: 50 },
  { cx: 705, cy: 335, h: 36, r: 58 },
  { cx: 1030, cy: 420, h: 33, r: 55 },
  { cx: 300, cy: 380, h: 32, r: 52 },
  { cx: 820, cy: 90, h: 30, r: 50 },
  { cx: 520, cy: 660, h: 33, r: 55 },
  { cx: 1150, cy: 320, h: 34, r: 58 },
  { cx: 150, cy: 650, h: 34, r: 58 },
];

// Saddle ridges connecting major peaks. Contribution tapers to zero at each
// endpoint (so it never stacks on top of a summit) and peaks at the
// midpoint—the col—which is exactly how a connecting ridge behaves.
const RIDGES: Ridge[] = [
  { a: [230, 210], b: [610, 150], h: 45, w: 70 },
  { a: [610, 150], b: [980, 220], h: 42, w: 70 },
  { a: [980, 220], b: [1290, 175], h: 35, w: 65 },
  { a: [230, 210], b: [430, 510], h: 38, w: 60 },
  { a: [430, 510], b: [825, 555], h: 35, w: 60 },
  { a: [825, 555], b: [1170, 545], h: 32, w: 60 },
  { a: [980, 220], b: [825, 555], h: 30, w: 55 },
];

function peakBump(x: number, y: number, cx: number, cy: number, h: number, r: number): number {
  const dx = x - cx;
  const dy = y - cy;
  return h * Math.exp(-(dx * dx + dy * dy) / (2 * r * r));
}

function ridgeBump(x: number, y: number, a: Point, b: Point, h: number, w: number): number {
  const abx = b[0] - a[0];
  const aby = b[1] - a[1];
  const len2 = abx * abx + aby * aby;
  const apx = x - a[0];
  const apy = y - a[1];
  const t = (apx * abx + apy * aby) / len2;
  if (t < 0 || t > 1) return 0;
  const weight = Math.sin(Math.PI * t); // 0 at each peak, 1 at the col
  const projx = a[0] + t * abx;
  const projy = a[1] + t * aby;
  const dx = x - projx;
  const dy = y - projy;
  return h * weight * Math.exp(-(dx * dx + dy * dy) / (2 * w * w));
}

function baseUndulation(x: number, y: number): number {
  return (
    10 * Math.sin((2 * Math.PI * x) / 1000 + 0.7) * Math.cos((2 * Math.PI * y) / 750 + 0.3) +
    6 * Math.cos((2 * Math.PI * x) / 620 - 0.5) +
    5 * Math.sin((2 * Math.PI * y) / 500 + 1.1)
  );
}

function height(x: number, y: number): number {
  let v = baseUndulation(x, y);
  for (const p of PEAKS) v += peakBump(x, y, p.cx, p.cy, p.h, p.r);
  for (const m of MINOR) v += peakBump(x, y, m.cx, m.cy, m.h, m.r);
  for (const rg of RIDGES) v += ridgeBump(x, y, rg.a, rg.b, rg.h, rg.w);
  return v;
}

// ---------- Grid ----------
const CELL = 12;
const NX = Math.floor(W / CELL) + 1;
const NY = Math.floor(H / CELL) + 1;

function buildGrid(): { grid: Float64Array; vmin: number; vmax: number } {
  const grid = new Float64Array(NX * NY);
  let vmin = Infinity;
  let vmax = -Infinity;
  for (let j = 0; j < NY; j++) {
    for (let i = 0; i < NX; i++) {
      const v = height(i * CELL, j * CELL);
      grid[j * NX + i] = v;
      if (v < vmin) vmin = v;
      if (v > vmax) vmax = v;
    }
  }
  return { grid, vmin, vmax };
}

type Edge = { va: number; vb: number; x0: number; y0: number; x1: number; y1: number };

function makeEdgeLookups(grid: Float64Array) {
  const topEdge = (i: number, j: number): Edge => ({
    va: grid[j * NX + i],
    vb: grid[j * NX + i + 1],
    x0: i * CELL,
    y0: j * CELL,
    x1: (i + 1) * CELL,
    y1: j * CELL,
  });
  const leftEdge = (i: number, j: number): Edge => ({
    va: grid[j * NX + i],
    vb: grid[(j + 1) * NX + i],
    x0: i * CELL,
    y0: j * CELL,
    x1: i * CELL,
    y1: (j + 1) * CELL,
  });
  return { topEdge, leftEdge };
}

function interpEdge(e: Edge, level: number): Point {
  const t = (level - e.va) / (e.vb - e.va);
  return [e.x0 + (e.x1 - e.x0) * t, e.y0 + (e.y1 - e.y0) * t];
}

type Polyline = { points: Point[]; closed: boolean };

function traceLevel(grid: Float64Array, level: number): Polyline[] {
  const { topEdge, leftEdge } = makeEdgeLookups(grid);
  const segments: [Point, Point][] = [];

  for (let j = 0; j < NY - 1; j++) {
    for (let i = 0; i < NX - 1; i++) {
      const tl = grid[j * NX + i];
      const tr = grid[j * NX + i + 1];
      const bl = grid[(j + 1) * NX + i];
      const br = grid[(j + 1) * NX + i + 1];
      const bits =
        (tl >= level ? 8 : 0) | (tr >= level ? 4 : 0) | (br >= level ? 2 : 0) | (bl >= level ? 1 : 0);
      if (bits === 0 || bits === 15) continue;

      const N = () => interpEdge(topEdge(i, j), level);
      const S = () => interpEdge(topEdge(i, j + 1), level);
      const Wp = () => interpEdge(leftEdge(i, j), level);
      const E = () => interpEdge(leftEdge(i + 1, j), level);
      const center = (tl + tr + br + bl) / 4;

      switch (bits) {
        case 1: segments.push([Wp(), S()]); break;
        case 2: segments.push([S(), E()]); break;
        case 3: segments.push([Wp(), E()]); break;
        case 4: segments.push([N(), E()]); break;
        case 5:
          if (center >= level) { segments.push([Wp(), N()]); segments.push([S(), E()]); }
          else { segments.push([N(), E()]); segments.push([Wp(), S()]); }
          break;
        case 6: segments.push([N(), S()]); break;
        case 7: segments.push([N(), Wp()]); break;
        case 8: segments.push([N(), Wp()]); break;
        case 9: segments.push([N(), S()]); break;
        case 10:
          if (center >= level) { segments.push([N(), E()]); segments.push([Wp(), S()]); }
          else { segments.push([Wp(), N()]); segments.push([S(), E()]); }
          break;
        case 11: segments.push([N(), E()]); break;
        case 12: segments.push([Wp(), E()]); break;
        case 13: segments.push([S(), E()]); break;
        case 14: segments.push([Wp(), S()]); break;
      }
    }
  }

  const key = (p: Point) => `${p[0].toFixed(3)},${p[1].toFixed(3)}`;
  const adjacency = new Map<string, number[]>();
  segments.forEach((seg, idx) => {
    for (const p of seg) {
      const k = key(p);
      const list = adjacency.get(k);
      if (list) list.push(idx);
      else adjacency.set(k, [idx]);
    }
  });

  const visited = new Array(segments.length).fill(false);
  const polylines: Polyline[] = [];

  for (let idx = 0; idx < segments.length; idx++) {
    if (visited[idx]) continue;
    visited[idx] = true;
    const chain: Point[] = [segments[idx][0], segments[idx][1]];
    let closed = false;

    for (;;) {
      const tailKey = key(chain[chain.length - 1]);
      const candidates = adjacency.get(tailKey) || [];
      const found = candidates.find((c) => !visited[c]);
      if (found === undefined) break;
      visited[found] = true;
      const [a, b] = segments[found];
      const next = key(a) === tailKey ? b : a;
      if (key(next) === key(chain[0])) { closed = true; break; }
      chain.push(next);
    }
    if (!closed) {
      for (;;) {
        const headKey = key(chain[0]);
        const candidates = adjacency.get(headKey) || [];
        const found = candidates.find((c) => !visited[c]);
        if (found === undefined) break;
        visited[found] = true;
        const [a, b] = segments[found];
        const prev = key(a) === headKey ? b : a;
        chain.unshift(prev);
      }
    }
    polylines.push({ points: chain, closed });
  }
  return polylines;
}

/** Unified Catmull-Rom smoothing for both closed loops and open chains
 * (open chains simply clamp at their end points instead of wrapping). */
function smoothPath(points: Point[], closed: boolean): string {
  const n = points.length;
  if (n < 2) return "";
  if (n === 2) {
    return `M${points[0][0].toFixed(2)},${points[0][1].toFixed(2)} L${points[1][0].toFixed(2)},${points[1][1].toFixed(2)}`;
  }
  const at = closed
    ? (i: number) => points[((i % n) + n) % n]
    : (i: number) => points[Math.min(Math.max(i, 0), n - 1)];
  const t = 1 / 6;
  const steps = closed ? n : n - 1;
  let d = `M${points[0][0].toFixed(2)},${points[0][1].toFixed(2)}`;
  for (let i = 0; i < steps; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1: Point = [p1[0] + (p2[0] - p0[0]) * t, p1[1] + (p2[1] - p0[1]) * t];
    const c2: Point = [p2[0] - (p3[0] - p1[0]) * t, p2[1] - (p3[1] - p1[1]) * t];
    d += ` C${c1[0].toFixed(2)},${c1[1].toFixed(2)} ${c2[0].toFixed(2)},${c2[1].toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`;
  }
  if (closed) d += "Z";
  return d;
}

function bboxDiagonal(points: Point[]): number {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of points) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return Math.hypot(maxX - minX, maxY - minY);
}

const INTERVAL = 8;

type Label = { x: number; y: number; text: string };

function buildContours(): { paths: string[]; labels: Label[] } {
  const { grid, vmin, vmax } = buildGrid();
  const levelStart = Math.ceil(vmin / INTERVAL) * INTERVAL;
  const levelEnd = Math.floor(vmax / INTERVAL) * INTERVAL;
  const levels: number[] = [];
  for (let l = levelStart; l <= levelEnd; l += INTERVAL) levels.push(l);

  const paths: string[] = [];
  const levelPolylines = new Map<number, Polyline[]>();
  for (const level of levels) {
    const polylines = traceLevel(grid, level);
    levelPolylines.set(level, polylines);
    for (const pl of polylines) {
      if (bboxDiagonal(pl.points) < 8) continue;
      paths.push(smoothPath(pl.points, pl.closed));
    }
  }

  const labelAngle = -0.5;
  const dirX = Math.cos(labelAngle);
  const dirY = Math.sin(labelAngle);
  const labels: Label[] = [];

  for (const p of PEAKS) {
    if (!p.elevation) continue;
    const targetLevel = Math.round((p.h * 0.65) / INTERVAL) * INTERVAL;
    let best = levels[0];
    let bestDiff = Infinity;
    for (const l of levels) {
      const diff = Math.abs(l - targetLevel);
      if (diff < bestDiff) { bestDiff = diff; best = l; }
    }
    const polylines = levelPolylines.get(best) || [];

    let bestPl: Polyline | null = null;
    let bestDist = Infinity;
    for (const pl of polylines) {
      for (const pt of pl.points) {
        const d = Math.hypot(pt[0] - p.cx, pt[1] - p.cy);
        if (d < bestDist) { bestDist = d; bestPl = pl; }
      }
    }
    if (!bestPl) continue;

    const localPts = bestPl.points.filter((pt) => {
      const d = Math.hypot(pt[0] - p.cx, pt[1] - p.cy);
      return d > p.r * 0.25 && d < p.r * 1.6;
    });
    const pool = localPts.length ? localPts : bestPl.points;

    let chosen = pool[0];
    let bestAngleDiff = Infinity;
    for (const pt of pool) {
      const angle = Math.atan2(pt[1] - p.cy, pt[0] - p.cx);
      let diff = Math.abs(angle - labelAngle);
      if (diff > Math.PI) diff = 2 * Math.PI - diff;
      if (diff < bestAngleDiff) { bestAngleDiff = diff; chosen = pt; }
    }

    labels.push({
      x: chosen[0] + dirX * 12,
      y: chosen[1] + dirY * 12,
      text: p.elevation.toLocaleString(),
    });
  }

  return { paths, labels };
}

// Computed once at module load—fully deterministic, so identical on every
// render with no risk of a server/client hydration mismatch.
const { paths: CONTOUR_PATHS, labels: CONTOUR_LABELS } = buildContours();

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
      viewBox={`0 0 ${W} ${H}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <g
        stroke={stroke}
        strokeWidth="0.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      >
        {CONTOUR_PATHS.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <g fill={stroke} opacity="0.7" fontSize="11" fontFamily="ui-monospace, monospace">
        {CONTOUR_LABELS.map((label, i) => (
          <text key={i} x={label.x.toFixed(1)} y={label.y.toFixed(1)}>
            {label.text}
          </text>
        ))}
      </g>
    </svg>
  );
}
