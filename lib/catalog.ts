// Generates the extended catalog: every compatible style × motif × colourway,
// shuffled with a fixed seed so the server build and the browser agree exactly.

import { asset } from "./basePath";
import {
  GOLD_MOTIFS,
  GOLD_PALETTES,
  isGold,
  MOTIFS,
  PALETTES,
  STYLES,
  type Category,
  type Design,
  type Mood,
  type MotifId,
  type PaletteId,
  type StyleId,
  type Tone,
} from "./design";

export type Product = {
  slug: string;
  name: string;
  price: number;
  category: Category;
  tone: Tone;
  /** Card image: a studio photo for the originals, generated artwork otherwise. */
  image: string;
  /** True when `image` is a real photo rather than generated artwork. */
  photo?: boolean;
  /** Larger, cut-out style shot used on the product page viewer. */
  heroImage?: string;
  /** Width / height of the image shown in the product viewer (heroImage, else image). */
  viewRatio?: number;
  /** Drives the artwork, the metal re-colouring and the virtual try-on. */
  design: Design;
  mood: Mood;
  rating: number;
  reviews: number;
  badge?: string;
  description: string;
  /** Lower = more popular. Used by "Sort: Trending". */
  trending: number;
  isNew?: boolean;
  /** Part of the Fine Gold line. */
  gold?: boolean;
};

export const CATALOG_SIZE = 1200;

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const MOTIF_PHRASE: Record<MotifId, string> = {
  heart: "a faceted little heart",
  star: "a crystal-cut star",
  moon: "a pavé crescent moon",
  sun: "a radiant sunburst",
  flower: "a five-petal blossom",
  butterfly: "a fluttering enamel butterfly",
  bow: "a sweet tied bow",
  pearl: "a luminous pearl",
  teardrop: "a sparkling teardrop",
  leaf: "a veined enamel leaf",
  cluster: "a cluster of tiny gems",
  halo: "a centre stone framed by a crystal halo",
  hexagon: "a clean hexagon frame",
  clover: "a lucky four-leaf clover",
  key: "a tiny heart-topped key",
  "evil-eye": "a protective evil-eye charm",
  infinity: "a pavé infinity loop",
  shell: "a ridged seashell",
  lotus: "a hand-chased lotus",
  peacock: "a dancing peacock with a fanned tail",
  paisley: "a traditional mango (paisley) motif",
  kasu: "a Lakshmi-kasu style coin",
  solitaire: "a four-prong solitaire",
  bar: "a sleek engraved bar",
}

const PALETTE_PHRASE: Record<PaletteId, string> = {
  blush: "soft blush pink",
  mint: "fresh mint",
  lilac: "dreamy lilac",
  peach: "warm peach",
  sky: "clear sky blue",
  lemon: "sunny lemon",
  ruby: "rich ruby",
  pearl: "pearly cream",
  midnight: "deep midnight blue",
  coral: "bright coral",
  sage: "calming sage",
  crystal: "ice-clear crystal",
  polished: "high-polish gold",
  diamond: "brilliant-cut diamonds",
  emerald: "Colombian-green emeralds",
  sapphire: "royal-blue sapphires",
  kundan: "kundan-set polki stones",
  onyx: "jet-black onyx",
  firoza: "firoza turquoise",
  meenakari: "red meenakari enamel",
};

/** Extra cost of each Fine Gold stone. */
const STONE_PRICE: Partial<Record<PaletteId, number>> = {
  diamond: 260,
  kundan: 180,
  ruby: 140,
  emerald: 140,
  sapphire: 140,
  meenakari: 90,
  firoza: 70,
  pearl: 60,
  coral: 60,
  onyx: 40,
};

/** Indian bridal and temple styles are 22K; chains are 18K. */
const KARAT_22: StyleId[] = ["temple", "mangalsutra", "haram", "gold-choker", "bead-mala"];

const CLOSERS = [
  "Light enough to wear all day, every day.",
  "Made in small batches and finished by hand.",
  "A tiny treat for you, or someone you love.",
  "Layers beautifully with your favourite chains.",
  "Nickel-free and gentle on sensitive skin.",
  "The kind of sparkle that makes Mondays better.",
  "Arrives in our signature keepsake box.",
  "Stack it, mix it, make it yours.",
];

const BADGES = ["Everyday favorite", "Handmade with love", "Gift pick", "Limited batch"];
const GOLD_BADGES = ["Trending now", "Hallmarked", "Bridal pick", "Festive favourite"];
const GOLD_CLOSERS = [
  "BIS-hallmarked and certified.",
  "Hand-finished by our goldsmiths.",
  "Made to be passed down.",
  "Arrives in a velvet heirloom box.",
  "Lifetime polishing and repairs included.",
];

const INCOMPATIBLE: Partial<Record<MotifId, StyleId[]>> = {
  // A pearl motif already *is* the strand's centrepiece.
  pearl: ["pearl-strand"],
}

const GOLD_ONLY = new Set<MotifId>(["lotus", "peacock", "paisley", "kasu", "solitaire", "bar"]);
const GOLD_ONLY_STONES = new Set<PaletteId>(["polished", "diamond", "emerald", "sapphire", "kundan", "onyx", "firoza", "meenakari"]);

export function generateCatalog(reserved: Set<string>, startRank: number): Product[] {
  const rand = mulberry32(20261016);
  const combos: Design[] = [];
  const classicStyles = (Object.keys(STYLES) as StyleId[]).filter((s) => !isGold(s));
  const classicMotifs = (Object.keys(MOTIFS) as MotifId[]).filter((m) => !GOLD_ONLY.has(m));
  const classicPalettes = (Object.keys(PALETTES) as PaletteId[]).filter((p) => !GOLD_ONLY_STONES.has(p));
  for (const style of classicStyles) {
    for (const motif of classicMotifs) {
      if (INCOMPATIBLE[motif]?.includes(style)) continue;
      for (const palette of classicPalettes) {
        if (palette === "pearl" && motif === "pearl") continue;
        combos.push({ style, motif, palette });
      }
    }
  }

  // Fisher-Yates with the seeded generator.
  for (let i = combos.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [combos[i], combos[j]] = [combos[j], combos[i]];
  }

  const out: Product[] = [];
  for (const design of combos) {
    if (out.length >= CATALOG_SIZE) break;
    const style = STYLES[design.style];
    const motif = MOTIFS[design.motif];
    const pal = PALETTES[design.palette];
    const name = `${pal.name} ${motif.label} ${style.label}`;
    const slug = slugify(name);
    if (reserved.has(slug)) continue;

    const r = () => rand();
    out.push({
      slug,
      name,
      price: style.base + motif.bump + Math.floor(r() * 7),
      category: style.category,
      tone: pal.tone,
      // Pre-rendered at build time by app/art/[file]/route.ts.
      image: asset(`/art/${slug}.svg`),
      design,
      mood: motif.mood,
      rating: Math.round((4.3 + r() * 0.7) * 10) / 10,
      reviews: 4 + Math.floor(r() * r() * 380),
      badge: r() < 0.22 ? BADGES[Math.floor(r() * BADGES.length)] : undefined,
      description: `${MOTIF_PHRASE[design.motif][0].toUpperCase()}${MOTIF_PHRASE[design.motif].slice(1)} in ${
        PALETTE_PHRASE[design.palette]
      } that ${style.blurb}. ${CLOSERS[Math.floor(r() * CLOSERS.length)]}`,
      trending: 0,
      isNew: r() < 0.08,
    });
  }

  const all = [...out, ...generateGold(reserved)];

  // Popularity order is its own shuffle so "Trending" mixes styles nicely;
  // the new Fine Gold line is what's trending, so it leans toward the top.
  const trend = new Map(all.map((p) => [p, rand() * (isGold(p.design.style) ? 0.55 : 1)]));
  [...all].sort((a, b) => trend.get(a)! - trend.get(b)!).forEach((p, i) => (p.trending = startRank + i));
  return all;
}

/** The Fine Gold line: every gold style × gold motif × stone. */
function generateGold(reserved: Set<string>): Product[] {
  const rand = mulberry32(20261101);
  const out: Product[] = [];
  for (const style of (Object.keys(STYLES) as StyleId[]).filter(isGold)) {
    for (const motif of GOLD_MOTIFS) {
      for (const palette of GOLD_PALETTES) {
        const design: Design = { style, motif, palette };
        const st = STYLES[style];
        const pal = PALETTES[palette];
        const name = `${pal.name} ${MOTIFS[motif].label} ${st.label}`;
        const slug = slugify(name);
        if (reserved.has(slug)) continue;
        const r = () => rand();
        const raw = st.base + (STONE_PRICE[palette] ?? 0) + MOTIFS[motif].bump * 12 + Math.floor(r() * 40);
        const karat = KARAT_22.includes(style) ? "Hallmarked 22K gold" : "Solid 18K gold";
        const phrase = MOTIF_PHRASE[motif];
        out.push({
          slug,
          name,
          price: Math.round(raw / 10) * 10 - 1,
          category: st.category,
          tone: pal.tone,
          image: asset(`/art/${slug}.svg`),
          design,
          mood: MOTIFS[motif].mood,
          rating: Math.round((4.5 + r() * 0.5) * 10) / 10,
          reviews: 6 + Math.floor(r() * r() * 260),
          badge: r() < 0.3 ? GOLD_BADGES[Math.floor(r() * GOLD_BADGES.length)] : undefined,
          description: `${phrase[0].toUpperCase()}${phrase.slice(1)} in ${PALETTE_PHRASE[palette]}, on a piece that ${st.blurb}. ${karat}. ${
            GOLD_CLOSERS[Math.floor(r() * GOLD_CLOSERS.length)]
          }`,
          trending: 0,
          isNew: r() < 0.3,
          gold: true,
        });
      }
    }
  }
  return out;
}
