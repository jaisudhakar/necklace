// Procedural SVG artwork for catalog necklaces. Every necklace hangs from the
// two sides of the neck as a cubic-bezier chain; each style builds on that
// curve (stringing pearls along it, setting stones, fringing coins, layering
// chains) and a motif drawn in a -50..50 unit box is coloured from a gem
// palette and a metal finish.

import { isGold, METALS, PALETTES, type Design, type Metal, type MotifId, type StyleId } from "./design";

type Paint = {
  metal: string;
  /** Flat metal colour for hairline parts (gradients vanish on zero-width lines). */
  solid: string;
  gem: string;
  pearl: string;
  enamel: string;
  light: string;
  dark: string;
  /** Metal colour stops, lightest to darkest. */
  stops: [string, string, string, string];
};

const f = (n: number) => +n.toFixed(2);

/** Wraps a motif (drawn in a -50..50 box) at (cx, cy) with the given size. */
const place = (body: string, cx: number, cy: number, size: number, rotate = 0) =>
  `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${f(rotate)}) scale(${f(size / 100)})">${body}</g>`;

const starPoints = (outer: number, inner: number, n = 5) =>
  Array.from({ length: n * 2 }, (_, i) => {
    const r = i % 2 ? inner : outer;
    const a = (Math.PI / n) * i - Math.PI / 2;
    return `${f(Math.cos(a) * r)},${f(Math.sin(a) * r)}`;
  }).join(" ");

const sparkle = (x: number, y: number, r = 5) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity=".85"/>`;

// ---------------------------------------------------------------------------
// Motifs
// ---------------------------------------------------------------------------

const MOTIF_ART: Record<MotifId, (p: Paint) => string> = {
  heart: (p) =>
    `<path d="M0 40C-45 10-50-20-28-36-14-46 0-36 0-24 0-36 14-46 28-36 50-20 45 10 0 40Z" fill="${p.gem}" stroke="${p.metal}" stroke-width="6" stroke-linejoin="round"/>
     <path d="M0-24 0 38M-30-30 0 8 30-30" stroke="#fff" stroke-width="2" opacity=".45" fill="none"/>${sparkle(-22, -22, 6)}`,

  star: (p) =>
    `<polygon points="${starPoints(50, 21)}" fill="${p.gem}" stroke="${p.metal}" stroke-width="6" stroke-linejoin="round"/>
     <g stroke="#fff" stroke-width="2" opacity=".5">${[0, 1, 2, 3, 4]
       .map((i) => {
         const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
         return `<line x1="0" y1="0" x2="${f(Math.cos(a) * 46)}" y2="${f(Math.sin(a) * 46)}"/>`;
       })
       .join("")}</g>${sparkle(-6, -14, 5)}`,

  moon: (p) =>
    `<path d="M8-45.3A46 46 0 1 0 8 45.3 50 50 0 0 1 8-45.3Z" fill="${p.metal}"/>
     ${[
       [-33, 0, 6],
       [-29, -19, 5.5],
       [-29, 19, 5.5],
       [-18, -33, 5],
       [-18, 33, 5],
       [-3, -41, 4],
       [-3, 41, 4],
     ]
       .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${p.gem}" stroke="${p.dark}" stroke-width=".8"/>`)
       .join("")}`,

  sun: (p) =>
    `<g fill="${p.metal}">${Array.from({ length: 12 }, (_, i) => `<polygon points="-6,-30 6,-30 0,-50" transform="rotate(${i * 30})"/>`).join("")}</g>
     <circle r="28" fill="${p.gem}" stroke="${p.metal}" stroke-width="5"/>${sparkle(-9, -10, 7)}`,

  flower: (p) =>
    `${Array.from({ length: 5 }, (_, i) => `<ellipse cy="-25" rx="15" ry="25" fill="${p.gem}" stroke="${p.metal}" stroke-width="4" transform="rotate(${i * 72})"/>`).join("")}
     <circle r="11" fill="${p.metal}"/>${sparkle(-3, -4, 3.5)}`,

  butterfly: (p) =>
    `<g stroke="${p.metal}" stroke-width="3.5">
       <ellipse cx="-23" cy="-12" rx="22" ry="27" transform="rotate(-25 -23 -12)" fill="${p.enamel}"/>
       <ellipse cx="23" cy="-12" rx="22" ry="27" transform="rotate(25 23 -12)" fill="${p.enamel}"/>
       <ellipse cx="-17" cy="23" rx="14" ry="18" transform="rotate(25 -17 23)" fill="${p.enamel}"/>
       <ellipse cx="17" cy="23" rx="14" ry="18" transform="rotate(-25 17 23)" fill="${p.enamel}"/>
     </g>
     <ellipse cx="-23" cy="-14" rx="10" ry="14" transform="rotate(-25 -23 -14)" fill="${p.light}" opacity=".8"/>
     <ellipse cx="23" cy="-14" rx="10" ry="14" transform="rotate(25 23 -14)" fill="${p.light}" opacity=".8"/>
     <ellipse rx="5" ry="30" fill="${p.metal}"/>
     <path d="M-2-28C-6-40-12-44-16-46M2-28C6-40 12-44 16-46" stroke="${p.metal}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,

  bow: (p) =>
    `<g fill="${p.enamel}" stroke="${p.metal}" stroke-width="3.5" stroke-linejoin="round">
       <path d="M-5 10-22 48-12 43-5 50 3 12Z"/><path d="M5 10 22 48 12 43 5 50-3 12Z"/>
       <path d="M0 0C-20-32-50-26-47 0-50 26-20 32 0 0Z"/><path d="M0 0C20-32 50-26 47 0 50 26 20 32 0 0Z"/>
       <ellipse rx="10" ry="12"/>
     </g>
     <path d="M-36-6C-30-14-20-14-14-8M36-6C30-14 20-14 14-8" stroke="#fff" stroke-width="3" opacity=".5" fill="none" stroke-linecap="round"/>`,

  shell: (p) =>
    `<path d="M0 44-44-6C-44-38 44-38 44-6Z" fill="${p.gem}" stroke="${p.metal}" stroke-width="4" stroke-linejoin="round"/>
     <g stroke="${p.metal}" stroke-width="2.4" opacity=".75">${[-36, -22, -8, 8, 22, 36]
       .map((x) => `<line x1="0" y1="40" x2="${x}" y2="${f(-24 - (1 - Math.abs(x) / 44) * 10)}"/>`)
       .join("")}</g>
     <path d="M-12 44H12L8 50H-8Z" fill="${p.metal}"/>`,

  pearl: (p) =>
    `<circle cy="8" r="36" fill="url(#pearl)"/>
     <path d="M-16-24Q0-38 16-24L11-17Q0-25-11-17Z" fill="${p.metal}"/>
     <circle cy="-30" r="5" fill="${p.gem}" stroke="${p.metal}" stroke-width="1.5"/>
     <ellipse cx="-12" cy="-6" rx="9" ry="6" fill="#fff" opacity=".8"/>`,

  teardrop: (p) =>
    `<path d="M0-48C20-18 36 4 36 18A36 36 0 0 1-36 18C-36 4-20-18 0-48Z" fill="${p.gem}" stroke="${p.metal}" stroke-width="6"/>
     <path d="M0-40 0 50M-30 10 30 10M0-40-30 10 0 50 30 10Z" stroke="#fff" stroke-width="1.8" opacity=".45" fill="none"/>${sparkle(-12, 2, 5)}`,

  leaf: (p) =>
    `<path d="M0-48C30-30 34 20 0 48-34 20-30-30 0-48Z" fill="${p.enamel}" stroke="${p.metal}" stroke-width="5"/>
     <path d="M0-40V44M0-14 16-28M0 6 18-8M0-14-16-28M0 6-18-8M0 26 14 14M0 26-14 14" stroke="${p.metal}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,

  cluster: (p) =>
    `<g stroke="${p.metal}" stroke-width="3">
       <circle cy="-24" r="17" fill="${p.gem}"/><circle cx="-21" cy="7" r="15" fill="${p.gem}"/>
       <circle cx="21" cy="7" r="15" fill="${p.gem}"/><circle cy="32" r="13" fill="${p.gem}"/>
     </g><circle cy="5" r="9" fill="url(#pearl)"/>${sparkle(-6, -30, 4)}${sparkle(-26, 2, 3.5)}`,

  halo: (p) =>
    `${Array.from({ length: 14 }, (_, i) => {
      const a = (Math.PI * 2 * i) / 14;
      return `<circle cx="${f(Math.cos(a) * 38)}" cy="${f(Math.sin(a) * 38)}" r="6.5" fill="url(#crystal)" stroke="${p.metal}" stroke-width="1.6"/>`;
    }).join("")}
     <circle r="27" fill="${p.gem}" stroke="${p.metal}" stroke-width="4"/>
     <path d="M-19-19 19 19M19-19-19 19M0-27V27M-27 0H27" stroke="#fff" stroke-width="1.5" opacity=".4"/>${sparkle(-9, -10, 6)}`,

  hexagon: (p) =>
    `<polygon points="${starPoints(46, 46, 3)}" fill="none" stroke="${p.metal}" stroke-width="8" stroke-linejoin="round" transform="rotate(30)"/>
     <polygon points="${starPoints(26, 26, 3)}" fill="${p.gem}" stroke="${p.metal}" stroke-width="3" transform="rotate(30)"/>${sparkle(-6, -8, 4)}`,

  clover: (p) =>
    `<path d="M2 6C6 22 10 34 16 46" stroke="${p.metal}" stroke-width="4" fill="none" stroke-linecap="round"/>
     ${[0, 90, 180, 270]
       .map(
         (r) =>
           `<g transform="rotate(${r}) translate(0 -23) scale(.52)"><path d="M0 40C-45 10-50-20-28-36-14-46 0-36 0-24 0-36 14-46 28-36 50-20 45 10 0 40Z" fill="${p.enamel}" stroke="${p.metal}" stroke-width="7"/></g>`,
       )
       .join("")}
     <circle r="6" fill="${p.metal}"/>${sparkle(-16, -30, 4)}`,

  key: (p) =>
    `<circle cy="-28" r="17" fill="none" stroke="${p.metal}" stroke-width="7"/>
     <path d="M0-40C-7-40-11-34-11-29-11-22-5-18 0-14 5-18 11-22 11-29 11-34 7-40 0-40Z" fill="${p.gem}"/>
     <rect x="-4" y="-11" width="8" height="58" rx="3" fill="${p.metal}"/>
     <rect x="4" y="28" width="14" height="6" rx="2" fill="${p.metal}"/><rect x="4" y="39" width="10" height="6" rx="2" fill="${p.metal}"/>`,

  "evil-eye": (p) =>
    `<circle r="44" fill="${p.gem}" stroke="${p.metal}" stroke-width="5"/>
     <circle r="29" fill="#fdfcff"/><circle r="19" fill="#3d77d9"/><circle r="19" fill="url(#iris)"/>
     <circle r="9" fill="#141a33"/>${sparkle(-6, -7, 4.5)}${sparkle(-24, -24, 5)}`,

  infinity: (p) =>
    `<path d="M0 0C-12-24-48-24-48 0-48 24-12 24 0 0 12-24 48-24 48 0 48 24 12 24 0 0Z" fill="none" stroke="${p.metal}" stroke-width="8" stroke-linejoin="round"/>
     <path d="M0 0C-12-24-48-24-48 0-48 24-12 24 0 0 12-24 48-24 48 0 48 24 12 24 0 0Z" fill="none" stroke="${p.gem}" stroke-width="3" stroke-dasharray="0.1 7" stroke-linecap="round"/>
     <circle r="7" fill="${p.gem}" stroke="${p.metal}" stroke-width="2.5"/>`,

  lotus: (p) =>
    `${[-72, 72, -36, 36, 0]
      .map(
        (r) =>
          `<path d="M0 30C-15 10-14-18 0-42 14-18 15 10 0 30Z" fill="${r ? p.metal : p.gem}" stroke="${p.solid}" stroke-width="1.6" transform="rotate(${r} 0 30)"/>` +
          (r ? `<path d="M0 26C-7 10-7-12 0-30" fill="none" stroke="${p.stops[0]}" stroke-width="1.4" opacity=".7" transform="rotate(${r} 0 30)"/>` : ""),
      )
      .join("")}
     <path d="M-38 32Q0 50 38 32" fill="none" stroke="${p.metal}" stroke-width="6" stroke-linecap="round"/>
     <circle cy="34" r="4" fill="${p.gem}" stroke="${p.solid}" stroke-width="1"/>${sparkle(-4, -14, 3)}`,

  peacock: (p) =>
    `${Array.from({ length: 9 }, (_, i) => {
      const r = -72 + i * 18;
      return `<g transform="rotate(${r} 0 18)"><ellipse cy="-16" rx="8.5" ry="20" fill="${p.metal}" stroke="${p.solid}" stroke-width="1.4"/>` +
        `<circle cy="-25" r="5" fill="${p.gem}" stroke="${p.solid}" stroke-width="1"/><circle cy="-25" r="1.8" fill="${p.dark}"/></g>`;
    }).join("")}
     <path d="M2 46C-14 34 10 20 0 4" fill="none" stroke="${p.metal}" stroke-width="9" stroke-linecap="round"/>
     <path d="M2 46C-14 34 10 20 0 4" fill="none" stroke="${p.gem}" stroke-width="3" stroke-linecap="round" opacity=".85"/>
     <circle cx="-1" cy="0" r="6.5" fill="${p.metal}" stroke="${p.solid}" stroke-width="1"/>
     <path d="M-6-1-13 2-6 3Z" fill="${p.solid}"/><path d="M-1-6-3-14M1-6 2-14M3-5 7-12" stroke="${p.solid}" stroke-width="1.4"/>`,

  paisley: (p) =>
    `<path d="M0 46C-30 46-42 18-34-6-26-28-6-44 16-47 34-49 42-34 30-26 20-19 8-24 8-10 8 2 28 10 32 26 35 40 18 46 0 46Z" fill="${p.metal}" stroke="${p.solid}" stroke-width="2"/>
     <path d="M-2 38C-20 37-28 18-22 2-17-12-5-20 4-16" fill="none" stroke="${p.stops[3]}" stroke-width="2.2" stroke-dasharray="0.1 4.6" stroke-linecap="round"/>
     <ellipse cx="-2" cy="20" rx="15" ry="17" fill="${p.gem}" stroke="${p.solid}" stroke-width="1.8"/>${sparkle(-8, 13, 3.5)}
     <circle cx="27" cy="-34" r="4" fill="${p.gem}" stroke="${p.solid}" stroke-width="1"/>`,

  kasu: (p) =>
    `<circle cy="-46" r="6" fill="none" stroke="${p.metal}" stroke-width="3.5"/>
     <circle r="42" fill="${p.metal}" stroke="${p.solid}" stroke-width="2"/>
     <circle r="37" fill="none" stroke="${p.stops[3]}" stroke-width="3" stroke-dasharray="0.1 5.6" stroke-linecap="round"/>
     <circle r="31" fill="none" stroke="${p.solid}" stroke-width="1.4"/>
     ${Array.from({ length: 8 }, (_, i) => `<ellipse cy="-14" rx="5" ry="12" fill="${p.metal}" stroke="${p.solid}" stroke-width="1.2" transform="rotate(${i * 45})"/>`).join("")}
     <circle r="7" fill="${p.gem}" stroke="${p.solid}" stroke-width="1.2"/>${sparkle(-16, -18, 3)}`,

  solitaire: (p) =>
    `<rect x="-5" y="-48" width="10" height="16" rx="5" fill="none" stroke="${p.metal}" stroke-width="3.5"/>
     <circle r="30" fill="${p.metal}" stroke="${p.solid}" stroke-width="1.4"/>
     <circle r="25" fill="${p.gem}"/>
     <polygon points="${starPoints(25, 12, 8)}" fill="none" stroke="#fff" stroke-width="1.2" opacity=".55"/>
     <polygon points="${starPoints(11, 11, 4)}" fill="#fff" opacity=".22" transform="rotate(45)"/>
     ${[45, 135, 225, 315].map((a) => `<circle cx="${f(Math.cos((a * Math.PI) / 180) * 25)}" cy="${f(Math.sin((a * Math.PI) / 180) * 25)}" r="4.6" fill="${p.metal}" stroke="${p.solid}" stroke-width="1"/>`).join("")}
     ${sparkle(-8, -10, 5)}`,

  bar: (p) =>
    `<rect x="-48" y="-9" width="96" height="18" rx="5" fill="${p.metal}" stroke="${p.solid}" stroke-width="1.6"/>
     <path d="M-42-4H42" stroke="${p.stops[0]}" stroke-width="2" opacity=".8" stroke-linecap="round"/>
     <circle r="6" fill="${p.gem}" stroke="${p.solid}" stroke-width="1.2"/>
     <circle cx="-30" r="3" fill="${p.gem}" stroke="${p.solid}" stroke-width=".8"/><circle cx="30" r="3" fill="${p.gem}" stroke="${p.solid}" stroke-width=".8"/>`,
};

// ---------------------------------------------------------------------------
// Chain geometry: a cubic bezier from one side of the neck to the other
// ---------------------------------------------------------------------------

type Pt = { x: number; y: number };
type Curve = [Pt, Pt, Pt, Pt];

/** Where the chain meets the neck, in the 300-wide art space (used by the try-on). */
export const NECK_ENDS: [Pt, Pt] = [
  { x: 95, y: 6 },
  { x: 205, y: 6 },
];
const W = 300;
const CX = 150;

/** A U-shaped drape whose lowest point is `depth` below the neck ends. */
const drape = (depth: number, inset = 6, spread = 0): Curve => {
  const [a, b] = NECK_ENDS;
  const cy = a.y + depth / 0.75;
  return [
    { x: a.x - spread, y: a.y },
    { x: a.x - spread + inset, y: cy },
    { x: b.x + spread - inset, y: cy },
    { x: b.x + spread, y: b.y },
  ];
};

const at = ([p0, p1, p2, p3]: Curve, t: number): Pt => {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
};

const pathOf = ([p0, p1, p2, p3]: Curve) =>
  `M${f(p0.x)} ${f(p0.y)}C${f(p1.x)} ${f(p1.y)} ${f(p2.x)} ${f(p2.y)} ${f(p3.x)} ${f(p3.y)}`;

/** Points spaced evenly by arc length (so beads and stones sit evenly). */
const along = (c: Curve, n: number, from = 0, to = 1): Pt[] => {
  const samples = Array.from({ length: 201 }, (_, i) => at(c, i / 200));
  const lens = [0];
  for (let i = 1; i < samples.length; i++)
    lens.push(lens[i - 1] + Math.hypot(samples[i].x - samples[i - 1].x, samples[i].y - samples[i - 1].y));
  const total = lens[lens.length - 1];
  return Array.from({ length: n }, (_, k) => {
    const target = total * (from + ((to - from) * k) / Math.max(1, n - 1));
    let i = lens.findIndex((l) => l >= target);
    if (i <= 0) i = 1;
    const r = (target - lens[i - 1]) / (lens[i] - lens[i - 1] || 1);
    return { x: samples[i - 1].x + (samples[i].x - samples[i - 1].x) * r, y: samples[i - 1].y + (samples[i].y - samples[i - 1].y) * r };
  });
};

const chain = (c: Curve, p: Paint, width = 2.4) =>
  `<path d="${pathOf(c)}" fill="none" stroke="rgba(60,20,40,.18)" stroke-width="${width + 1.2}" transform="translate(0 1.6)"/>` +
  `<path d="${pathOf(c)}" fill="none" stroke="${p.solid}" stroke-width="${width}" stroke-dasharray="3.4 1.4" stroke-linecap="round"/>` +
  `<path d="${pathOf(c)}" fill="none" stroke="#fff" stroke-width="${width * 0.35}" stroke-dasharray="1.6 3.2" opacity=".55"/>`;

const bail = (x: number, y: number, p: Paint) => `<circle cx="${x}" cy="${y}" r="4" fill="none" stroke="${p.solid}" stroke-width="2.2"/>`;

const bottomOf = (c: Curve) => at(c, 0.5).y;

// ---------------------------------------------------------------------------
// Fine Gold: chains built link by link
// ---------------------------------------------------------------------------

/** A repeating link pattern: each entry is a <defs> id and the arc length it takes up. */
type Link = { id: string; len: number };

/** Walks the curve laying links end to end, each rotated to follow the chain. */
function linksAlong(c: Curve, pattern: Link[], from = 0, to = 1) {
  const n = 400;
  const pts = Array.from({ length: n + 1 }, (_, i) => at(c, from + ((to - from) * i) / n));
  const lens = [0];
  for (let i = 1; i <= n; i++) lens.push(lens[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  const total = lens[n];
  const pointAt = (d: number) => {
    let i = 1;
    while (i < n && lens[i] < d) i++;
    const r = (d - lens[i - 1]) / (lens[i] - lens[i - 1] || 1);
    const a = pts[i - 1];
    const b = pts[i];
    return { x: a.x + (b.x - a.x) * r, y: a.y + (b.y - a.y) * r, a: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI };
  };
  // Centre the pattern so both ends of the chain match.
  const period = pattern.reduce((s, l) => s + l.len, 0);
  let d = ((total % period) / 2) % period;
  let out = "";
  for (let k = 0; d < total; k++) {
    const l = pattern[k % pattern.length];
    const q = pointAt(Math.min(total, d + l.len / 2));
    out += `<use href="#${l.id}" transform="translate(${f(q.x)} ${f(q.y)}) rotate(${f(q.a)})"/>`;
    d += l.len;
  }
  return out;
}

/** Link shapes, drawn once in <defs> and reused along the chain. */
const linkDefs = (p: Paint) => {
  const [m0, , , m3] = p.stops;
  return `
    <ellipse id="lk-ring" rx="2.3" ry="1.4" fill="none" stroke="url(#polish)" stroke-width="1"/>
    <rect id="lk-edge" x="-2.3" y="-.5" width="4.6" height="1" rx=".5" fill="url(#polish)"/>
    <g id="lk-long"><rect x="-4.6" y="-1.3" width="9.2" height="2.6" rx="1.3" fill="none" stroke="url(#polish)" stroke-width="1"/></g>
    <g id="lk-rope"><ellipse rx="2.7" ry="1.3" fill="url(#polish)" stroke="${m3}" stroke-width=".25" transform="rotate(38)"/><path d="M-1.4-.6 1.2.7" stroke="${m0}" stroke-width=".45" opacity=".8"/></g>
    <g id="lk-cuban-a" transform="rotate(14)"><rect x="-3.5" y="-2.7" width="7" height="5.4" rx="2.5" fill="url(#polish)" stroke="${m3}" stroke-width=".35"/><ellipse rx="2" ry=".75" fill="${m3}" opacity=".75"/><path d="M-2.4-1.7H1.6" stroke="${m0}" stroke-width=".5" opacity=".9"/></g>
    <g id="lk-cuban-b" transform="rotate(-14)"><rect x="-3.5" y="-2.7" width="7" height="5.4" rx="2.5" fill="url(#polish)" stroke="${m3}" stroke-width=".35"/><ellipse rx="2" ry=".75" fill="${m3}" opacity=".75"/><path d="M-2.4-1.7H1.6" stroke="${m0}" stroke-width=".5" opacity=".9"/></g>
    <rect id="lk-clip" x="-3.7" y="-1.25" width="7.4" height="2.5" rx="1.25" fill="none" stroke="url(#polish)" stroke-width=".9"/>
    <path id="lk-chev" d="M-.7-2.3.7 0-.7 2.3" fill="none" stroke="${m3}" stroke-width=".4" opacity=".7"/>
    <g id="lk-bead"><circle r="3.1" fill="url(#polish)" stroke="${m3}" stroke-width=".3"/><circle cx="-1" cy="-1.1" r=".9" fill="#fff" opacity=".75"/></g>
    <ellipse id="lk-spacer" rx=".7" ry="1.9" fill="url(#polish)"/>
    <g id="lk-black"><circle r="1.25" fill="url(#onyx)"/></g>
    <g id="lk-goldbead"><circle r="1.5" fill="url(#polish)"/></g>
    <g id="lk-mango" transform="scale(1.55)"><path d="M3.4 0C3.4-2.4.8-3 -1.6-2.2-3.4-1.4-3.6.6-2.2 1.2-1.2 1.6-.8.4 0 .8 1 1.4 2 2.6 3.4 0Z" fill="url(#polish)" stroke="${m3}" stroke-width=".3"/><circle cx="1.1" cy="-.6" r=".8" fill="${p.gem}"/></g>
    <g id="lk-ball"><circle r="1.4" fill="url(#polish)"/></g>
    <g id="lk-coin"><line y1="0" y2="4" stroke="${p.solid}" stroke-width=".8"/><circle cy="8.6" r="4.6" fill="url(#polish)" stroke="${m3}" stroke-width=".5"/><circle cy="8.6" r="3.4" fill="none" stroke="${m3}" stroke-width=".7" stroke-dasharray=".1 1.5" stroke-linecap="round"/><circle cy="8.6" r="1.4" fill="${p.gem}"/></g>
    <g id="lk-drop"><line y1="0" y2="3" stroke="${p.solid}" stroke-width=".6"/><path d="M0 2.6C1.6 4.6 2.2 6 2.2 7A2.2 2.2 0 0 1-2.2 7C-2.2 6-1.6 4.6 0 2.6Z" fill="url(#polish)" stroke="${m3}" stroke-width=".3"/></g>
    <g id="lk-stud"><circle r="2.6" fill="${p.gem}" stroke="url(#polish)" stroke-width="1.1"/></g>`;
};

const CABLE: Link[] = [
  { id: "lk-ring", len: 3.3 },
  { id: "lk-edge", len: 3.3 },
];
const FIGARO: Link[] = [...CABLE, { id: "lk-ring", len: 3.3 }, { id: "lk-long", len: 8.6 }, { id: "lk-edge", len: 3.3 }];

/** Hanging drops (coins, bells) placed at points along a curve, all hanging straight down. */
const hang = (pts: Pt[], id: string) => pts.map((q) => `<use href="#${id}" x="${f(q.x)}" y="${f(q.y)}"/>`).join("");

/** Ghungroo fringe: small gold drops along the bottom of a pendant. */
const fringe = (cx: number, y: number, width: number, n: number) =>
  hang(
    Array.from({ length: n }, (_, i) => {
      const t = n === 1 ? 0.5 : i / (n - 1);
      const x = cx - width / 2 + width * t;
      return { x, y: y - Math.abs(t - 0.5) * width * 0.35 };
    }),
    "lk-drop",
  );

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

type Build = { body: string; bottom: number };

const STYLE_ART: Record<StyleId, (m: string, p: Paint) => Build> = {
  pendant: (m, p) => {
    const c = drape(110);
    const y = bottomOf(c);
    return { body: chain(c, p) + bail(CX, y + 3, p) + place(m, CX, y + 32, 50), bottom: y + 58 };
  },

  choker: (m, p) => {
    const c = drape(46, 4);
    const y = bottomOf(c);
    const ribbon =
      `<path d="${pathOf(c)}" fill="none" stroke="${p.dark}" stroke-width="10" stroke-linecap="round"/>` +
      `<path d="${pathOf(c)}" fill="none" stroke="${p.light}" stroke-width="2.4" opacity=".7" transform="translate(0 -2)"/>`;
    return { body: ribbon + place(m, CX, y + 14, 32), bottom: y + 32 };
  },

  locket: (m, p) => {
    const c = drape(112);
    const y = bottomOf(c);
    const cy = y + 44;
    const locket =
      `<ellipse cx="${CX}" cy="${cy}" rx="28" ry="35" fill="url(#metal)" stroke="${p.solid}" stroke-width="2"/>` +
      `<ellipse cx="${CX}" cy="${cy}" rx="21" ry="27" fill="none" stroke="#fff" stroke-width="1.6" opacity=".7"/>` +
      `<path d="M${CX - 28} ${cy}h-3M${CX + 28} ${cy}h3" stroke="${p.solid}" stroke-width="3"/>`;
    return { body: chain(c, p) + bail(CX, y + 4, p) + locket + place(m, CX, cy, 28), bottom: cy + 40 };
  },

  lariat: (m, p) => {
    const c = drape(82);
    const y = bottomOf(c);
    const drop = `<line x1="${CX}" y1="${y}" x2="${CX}" y2="${y + 58}" stroke="${p.solid}" stroke-width="2.2" stroke-dasharray="3.4 1.4"/>`;
    return {
      body: chain(c, p) + drop + `<circle cx="${CX}" cy="${y}" r="5.5" fill="${p.gem}" stroke="${p.metal}" stroke-width="2"/>` + place(m, CX, y + 78, 40),
      bottom: y + 100,
    };
  },

  layered: (m, p) => {
    const c1 = drape(42, 4);
    const c2 = drape(82, 6, 3);
    const c3 = drape(124, 8, 6);
    const [y1, y2, y3] = [bottomOf(c1), bottomOf(c2), bottomOf(c3)];
    return {
      body:
        chain(c1, p, 1.8) + chain(c2, p, 2) + chain(c3, p, 2.2) +
        place(m, CX, y1 + 9, 16) + place(m, CX, y2 + 12, 22) + bail(CX, y3 + 3, p) + place(m, CX, y3 + 24, 34),
      bottom: y3 + 44,
    };
  },

  collar: (m, p) => {
    const c = drape(62, 4);
    const y = bottomOf(c);
    const gems = along(c, 17, 0.12, 0.88)
      .map((q) => `<circle cx="${f(q.x)}" cy="${f(q.y + 3)}" r="5.4" fill="${p.gem}" stroke="${p.metal}" stroke-width="1.6"/>`)
      .join("");
    return {
      body: `<path d="${pathOf(c)}" fill="none" stroke="url(#metal)" stroke-width="6" stroke-linecap="round"/>` + gems + place(m, CX, y + 30, 34),
      bottom: y + 50,
    };
  },

  "pearl-strand": (m, p) => {
    const c = drape(100);
    const y = bottomOf(c);
    const pearls = along(c, 44, 0.015, 0.985)
      .map((q) => `<circle cx="${f(q.x)}" cy="${f(q.y)}" r="5.3" fill="url(#pearl)"/><circle cx="${f(q.x - 1.6)}" cy="${f(q.y - 1.8)}" r="1.4" fill="#fff" opacity=".9"/>`)
      .join("");
    return { body: chain(c, p, 1) + pearls + place(m, CX, y + 24, 28), bottom: y + 42 };
  },

  tennis: (m, p) => {
    const c = drape(94);
    const y = bottomOf(c);
    const stones = along(c, 46, 0.02, 0.98)
      .map((q) => `<circle cx="${f(q.x)}" cy="${f(q.y)}" r="3.7" fill="url(#crystal)" stroke="${p.solid}" stroke-width="1"/><circle cx="${f(q.x)}" cy="${f(q.y)}" r="1.6" fill="${p.gem}"/>`)
      .join("");
    return { body: chain(c, p, 1.4) + stones + place(m, CX, y + 20, 26), bottom: y + 36 };
  },

  station: (m, p) => {
    const c = drape(106);
    const pts = along(c, 7, 0.14, 0.86);
    const charms = pts.map((q, i) => place(m, q.x, q.y + (i === 3 ? 13 : 8), i === 3 ? 24 : 15)).join("");
    return { body: chain(c, p, 2) + charms, bottom: bottomOf(c) + 28 };
  },

  opera: (m, p) => {
    const c = drape(182, 14);
    const y = bottomOf(c);
    return { body: chain(c, p, 2) + bail(CX, y + 3, p) + place(m, CX, y + 34, 52), bottom: y + 62 };
  },

  coin: (m, p) => {
    const c = drape(96);
    const y = bottomOf(c);
    const coins = along(c, 9, 0.14, 0.86)
      .map(
        (q) =>
          `<line x1="${f(q.x)}" y1="${f(q.y)}" x2="${f(q.x)}" y2="${f(q.y + 6)}" stroke="${p.solid}" stroke-width="1.4"/>` +
          `<circle cx="${f(q.x)}" cy="${f(q.y + 14)}" r="7.6" fill="url(#metal)" stroke="${p.solid}" stroke-width="1.2"/>` +
          `<circle cx="${f(q.x)}" cy="${f(q.y + 14)}" r="5" fill="none" stroke="#fff" stroke-width=".9" opacity=".7"/>` +
          `<circle cx="${f(q.x)}" cy="${f(q.y + 14)}" r="2.2" fill="${p.gem}"/>`,
      )
      .join("");
    return { body: chain(c, p, 2.4) + coins + place(m, CX, y + 46, 36), bottom: y + 68 };
  },

  rope: (m, p) => {
    const c = drape(102);
    const y = bottomOf(c);
    return { body: linksAlong(c, [{ id: "lk-rope", len: 1.9 }]) + bail(CX, y + 4, p) + place(m, CX, y + 30, 42), bottom: y + 54 };
  },

  cuban: (m, p) => {
    const c = drape(66, 4);
    const y = bottomOf(c);
    return {
      body: linksAlong(c, [{ id: "lk-cuban-a", len: 5 }, { id: "lk-cuban-b", len: 5 }]) + bail(CX, y + 5, p) + place(m, CX, y + 24, 26),
      bottom: y + 40,
    };
  },

  paperclip: (m, p) => {
    const c = drape(104);
    const y = bottomOf(c);
    return { body: linksAlong(c, [{ id: "lk-clip", len: 6.6 }]) + bail(CX, y + 3, p) + place(m, CX, y + 28, 38), bottom: y + 50 };
  },

  herringbone: (m, p) => {
    const c = drape(58, 4);
    const y = bottomOf(c);
    const band =
      `<path d="${pathOf(c)}" fill="none" stroke="url(#metal)" stroke-width="5" stroke-linecap="round"/>` +
      linksAlong(c, [{ id: "lk-chev", len: 1.5 }], 0.01, 0.99) +
      `<path d="${pathOf(c)}" fill="none" stroke="#fff" stroke-width=".8" opacity=".35" transform="translate(0 -1.2)"/>`;
    return { body: band + bail(CX, y + 4.5, p) + place(m, CX, y + 21, 24), bottom: y + 37 };
  },

  figaro: (m, p) => {
    const c = drape(112);
    const y = bottomOf(c);
    return { body: linksAlong(c, FIGARO) + bail(CX, y + 3, p) + place(m, CX, y + 32, 46), bottom: y + 58 };
  },

  temple: (m, p) => {
    const c = drape(88, 4);
    const y = bottomOf(c);
    const coins = hang(along(c, 15, 0.1, 0.9), "lk-coin");
    const cy = y + 40;
    return {
      body: linksAlong(c, [{ id: "lk-goldbead", len: 3 }, { id: "lk-ball", len: 2.6 }]) + coins + place(m, CX, cy, 62) + fringe(CX, cy + 28, 40, 7),
      bottom: cy + 50,
    };
  },

  mangalsutra: (m, p) => {
    const c1 = drape(98);
    const c2 = drape(106, 8, 1);
    const y = bottomOf(c2);
    const beads: Link[] = [...Array(6).fill({ id: "lk-black", len: 2.5 }), { id: "lk-goldbead", len: 3 }];
    return {
      body: linksAlong(c1, beads) + linksAlong(c2, beads) + bail(CX, y + 3, p) + place(m, CX, y + 26, 38),
      bottom: y + 48,
    };
  },

  haram: (m, p) => {
    const c = drape(176, 12);
    const y = bottomOf(c);
    const cy = y + 34;
    return {
      body: linksAlong(c, [{ id: "lk-mango", len: 10.6 }, { id: "lk-ball", len: 3.4 }]) + bail(CX, y + 4, p) + place(m, CX, cy, 58) + fringe(CX, cy + 26, 36, 6),
      bottom: cy + 46,
    };
  },

  "gold-choker": (m) => {
    const c = drape(42, 4);
    const y = bottomOf(c);
    const band =
      `<path d="${pathOf(c)}" fill="none" stroke="url(#metal)" stroke-width="11" stroke-linecap="round"/>` +
      `<path d="${pathOf(c)}" fill="none" stroke="#fff" stroke-width="1" opacity=".4" transform="translate(0 -3.6)"/>` +
      linksAlong(c, [{ id: "lk-stud", len: 7 }], 0.04, 0.96) +
      hang(along(c, 23, 0.1, 0.9).map((q) => ({ x: q.x, y: q.y + 4 })), "lk-drop");
    return { body: band + place(m, CX, y + 20, 34) + fringe(CX, y + 40, 22, 5), bottom: y + 54 };
  },

  "bead-mala": (m, p) => {
    const c = drape(118);
    const y = bottomOf(c);
    return {
      body: linksAlong(c, [{ id: "lk-bead", len: 6.4 }, { id: "lk-spacer", len: 1.6 }]) + bail(CX, y + 5, p) + place(m, CX, y + 32, 44),
      bottom: y + 56,
    };
  },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

function defs(design: Design, metal: Metal, paint: Paint) {
  const pal = PALETTES[design.palette];
  const [m0, m1, m2, m3] = METALS[metal].stops;
  const gold = isGold(design.style);
  return `<defs>
    <linearGradient id="polish" x1="0" y1="0" x2=".7" y2="1">
      <stop offset="0" stop-color="${m2}"/><stop offset=".3" stop-color="${m0}"/><stop offset=".48" stop-color="${m1}"/>
      <stop offset=".75" stop-color="${m2}"/><stop offset="1" stop-color="${m3}"/>
    </linearGradient>
    ${gold ? `<radialGradient id="onyx" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#77737f"/><stop offset=".5" stop-color="#1c1b22"/><stop offset="1" stop-color="#050507"/></radialGradient>
    <filter id="bevel" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">
      <feGaussianBlur in="SourceAlpha" stdDeviation=".7" result="b"/>
      <feSpecularLighting in="b" surfaceScale="2.2" specularConstant="1" specularExponent="20" lighting-color="#fffbea" result="s"><feDistantLight azimuth="235" elevation="48"/></feSpecularLighting>
      <feComposite in="s" in2="SourceAlpha" operator="in" result="s2"/>
      <feComposite in="SourceGraphic" in2="s2" operator="arithmetic" k2="1" k3=".7"/>
    </filter>${linkDefs(paint)}` : ""}
    <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${m0}"/><stop offset=".35" stop-color="${m1}"/>
      <stop offset=".7" stop-color="${m2}"/><stop offset="1" stop-color="${m3}"/>
    </linearGradient>
    ${gold ? `<radialGradient id="gem" cx=".38" cy=".32" r=".8">
      <stop offset="0" stop-color="${pal.light}"/><stop offset=".4" stop-color="${pal.mid}"/><stop offset="1" stop-color="${pal.dark}"/>
    </radialGradient>` : `<radialGradient id="gem" cx=".35" cy=".3" r=".85">
      <stop offset="0" stop-color="#fff"/><stop offset=".25" stop-color="${pal.light}"/>
      <stop offset=".65" stop-color="${pal.mid}"/><stop offset="1" stop-color="${pal.dark}"/>
    </radialGradient>`}
    <radialGradient id="enamel" cx=".35" cy=".3" r=".9">
      <stop offset="0" stop-color="${pal.light}"/><stop offset=".55" stop-color="${pal.mid}"/><stop offset="1" stop-color="${pal.dark}"/>
    </radialGradient>
    <radialGradient id="pearl" cx=".35" cy=".3" r=".85">
      <stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="#fbf6f2"/>
      <stop offset=".75" stop-color="#e6d8cf"/><stop offset="1" stop-color="#c9b6ab"/>
    </radialGradient>
    <radialGradient id="crystal" cx=".35" cy=".3" r=".85">
      <stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#eef3ff"/><stop offset="1" stop-color="#b9c6e6"/>
    </radialGradient>
    <radialGradient id="iris" cx=".4" cy=".35" r=".8">
      <stop offset="0" stop-color="#9fd0ff"/><stop offset="1" stop-color="#1f4fb0"/>
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="3" stdDeviation="2.6" flood-color="#5a1f3f" flood-opacity=".22"/>
    </filter>
  </defs>`;
}

function paintFor(design: Design, metal: Metal): Paint {
  const pal = PALETTES[design.palette];
  const paint: Paint = {
    metal: "url(#metal)",
    solid: METALS[metal].stops[2],
    gem: "url(#gem)",
    pearl: "url(#pearl)",
    enamel: "url(#enamel)",
    light: pal.light,
    dark: pal.dark,
    stops: METALS[metal].stops,
  };
  return paint;
}

function build(design: Design, metal: Metal) {
  const paint = paintFor(design, metal);
  const art = STYLE_ART[design.style](MOTIF_ART[design.motif](paint), paint);
  // Fine Gold pieces get a raised, polished bevel.
  return {
    ...art,
    body: isGold(design.style) ? `<g filter="url(#bevel)">${art.body}</g>` : art.body,
    defs: defs(design, metal, paint),
  };
}

const PAD = 10;

/** Height of a style's artwork in the 300-wide art space. */
export function necklaceHeight(design: Design) {
  return Math.ceil(build(design, "gold").bottom + PAD);
}

/** The necklace alone on a transparent background (product viewer & try-on). */
export function necklaceSvg(design: Design, metal: Metal = "gold") {
  const { body, bottom, defs } = build(design, metal);
  const h = Math.ceil(bottom + PAD);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${h}" width="${W * 2}" height="${h * 2}">${defs}<g filter="url(#shadow)">${body}</g></svg>`;
}

/** Card artwork: the necklace draped on a soft display bust, framed close (260×200). */
export function cardSvg(design: Design, metal: Metal = "gold") {
  const { body, bottom, defs } = build(design, metal);
  // Zoom so the necklace fills the card; long styles are scaled down to fit.
  const k = Math.min(1.3, 178 / (bottom + 4));
  const tx = 130 - CX * k;
  if (isGold(design.style)) return velvetCard(body, defs, k, tx);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 200" width="520" height="400">${defs}
    <g transform="translate(${f(tx)} 6) scale(${f(k)})">
      <linearGradient id="bustFade" gradientUnits="userSpaceOnUse" x1="-120" y1="0" x2="420" y2="0">
        <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".3" stop-color="#fff" stop-opacity=".6"/>
        <stop offset=".7" stop-color="#fff" stop-opacity=".6"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
      <path d="M100 -40V30C100 50 82 58 54 66C10 78-50 100-120 150V600H420V150C350 100 290 78 246 66 218 58 200 50 200 30V-40Z" fill="url(#bustFade)"/>
      <path d="M100 30C100 50 82 58 54 66M200 30C200 50 218 58 246 66" fill="none" stroke="#fff" stroke-width="2" opacity=".7"/>
      <g filter="url(#shadow)">${body}</g>
    </g></svg>`;
}

/** Fine Gold cards: the piece on a jeweller's velvet neck form, lit from above. */
function velvetCard(body: string, defs: string, k: number, tx: number) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 200" width="520" height="400">${defs}
    <radialGradient id="room" cx=".5" cy=".18" r=".9">
      <stop offset="0" stop-color="#5a2a35"/><stop offset=".55" stop-color="#2a1016"/><stop offset="1" stop-color="#12060a"/>
    </radialGradient>
    <linearGradient id="velvet" gradientUnits="userSpaceOnUse" x1="-120" y1="0" x2="420" y2="0">
      <stop offset="0" stop-color="#1d070d"/><stop offset=".38" stop-color="#5b1a2b"/><stop offset=".5" stop-color="#6e2236"/>
      <stop offset=".62" stop-color="#5b1a2b"/><stop offset="1" stop-color="#1d070d"/>
    </linearGradient>
    <radialGradient id="spot" cx=".5" cy=".3" r=".5"><stop offset="0" stop-color="#ffd9a8" stop-opacity=".22"/><stop offset="1" stop-color="#ffd9a8" stop-opacity="0"/></radialGradient>
    <rect width="260" height="200" fill="url(#room)"/>
    <g transform="translate(${f(tx)} 6) scale(${f(k)})">
      <path d="M100 -40V30C100 50 82 58 54 66C10 78-50 100-120 150V600H420V150C350 100 290 78 246 66 218 58 200 50 200 30V-40Z" fill="url(#velvet)"/>
      <path d="M100 -40V30C100 50 82 58 54 66C10 78-50 100-120 150M200 -40V30C200 50 218 58 246 66 290 78 350 100 420 150" fill="none" stroke="#ffcfd9" stroke-width="1.2" opacity=".18"/>
      <g filter="url(#shadow)">${body}</g>
    </g>
    <rect width="260" height="200" fill="url(#spot)"/></svg>`;
}

const cache = new Map<string, string>();

const toUri = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace(/\s{2,}/g, " "))}`;

/** Memoised data: URI so the artwork can be used anywhere an <img src> is. */
export function artUri(design: Design, opts: { metal?: Metal; single?: boolean } = {}) {
  const metal = opts.metal ?? "gold";
  const key = `${design.style}|${design.motif}|${design.palette}|${metal}|${opts.single ? 1 : 0}`;
  let uri = cache.get(key);
  if (!uri) {
    uri = toUri(opts.single ? necklaceSvg(design, metal) : cardSvg(design, metal));
    cache.set(key, uri);
  }
  return uri;
}

/** Geometry for the viewer/try-on: width/height ratio and the two neck ends as 0..1 fractions. */
export function necklaceGeometry(design: Design) {
  const h = necklaceHeight(design);
  return {
    ratio: W / h,
    ends: NECK_ENDS.map((e) => ({ x: e.x / W, y: e.y / h })) as [Pt, Pt],
  };
}
