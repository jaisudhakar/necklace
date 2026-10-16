// Design taxonomy for the necklace catalog. Necklace families follow common
// jewelry-guide classifications (pendants, chokers, lockets, lariats, layered,
// collars, pearl strands, tennis, station, opera-length and coin/temple styles);
// motifs follow current charm trends. The Fine Gold line adds the gold chains
// and Indian gold jewellery styles trending now (rope, Cuban link, paperclip,
// herringbone, figaro, temple, mangalsutra, haram, bridal choker, bead mala).

export type Tone = "pink" | "mint" | "peach" | "lilac";

export type StyleId =
  | "pendant"
  | "choker"
  | "locket"
  | "lariat"
  | "layered"
  | "collar"
  | "pearl-strand"
  | "tennis"
  | "station"
  | "opera"
  | "coin"
  // Fine Gold line
  | "rope"
  | "cuban"
  | "paperclip"
  | "herringbone"
  | "figaro"
  | "temple"
  | "mangalsutra"
  | "haram"
  | "gold-choker"
  | "bead-mala";

export type MotifId =
  | "heart"
  | "star"
  | "moon"
  | "sun"
  | "flower"
  | "butterfly"
  | "bow"
  | "pearl"
  | "teardrop"
  | "leaf"
  | "cluster"
  | "halo"
  | "hexagon"
  | "clover"
  | "key"
  | "evil-eye"
  | "infinity"
  | "shell"
  // Fine Gold motifs
  | "lotus"
  | "peacock"
  | "paisley"
  | "kasu"
  | "solitaire"
  | "bar";

export type PaletteId =
  | "blush"
  | "mint"
  | "lilac"
  | "peach"
  | "sky"
  | "lemon"
  | "ruby"
  | "pearl"
  | "midnight"
  | "coral"
  | "sage"
  | "crystal"
  // Fine Gold stones
  | "polished"
  | "diamond"
  | "emerald"
  | "sapphire"
  | "kundan"
  | "onyx"
  | "firoza"
  | "meenakari";

export type Metal = "gold" | "silver" | "rose";

export type Design = { style: StyleId; motif: MotifId; palette: PaletteId };

export type Category =
  | "pendants"
  | "chokers"
  | "lockets"
  | "lariats"
  | "layered"
  | "collars"
  | "pearl-strands"
  | "tennis"
  | "station"
  | "long-chains"
  | "coin-necklaces"
  | "rope-chains"
  | "cuban-links"
  | "paperclip-chains"
  | "herringbone"
  | "figaro-chains"
  | "temple"
  | "mangalsutra"
  | "harams"
  | "gold-chokers"
  | "bead-malas";

export const STYLES: Record<
  StyleId,
  { label: string; plural: string; category: Category; base: number; blurb: string; gold?: true }
> = {
  pendant: { label: "Pendant", plural: "Pendants", category: "pendants", base: 22, blurb: "hangs from a fine cable chain" },
  choker: { label: "Choker", plural: "Chokers", category: "chokers", base: 18, blurb: "sits close and snug at the base of the neck" },
  locket: { label: "Locket", plural: "Lockets", category: "lockets", base: 28, blurb: "opens to keep a tiny photo close to your heart" },
  lariat: { label: "Lariat", plural: "Lariats", category: "lariats", base: 26, blurb: "drops into an elegant Y-shaped lariat" },
  layered: { label: "Layered Necklace", plural: "Layered", category: "layered", base: 30, blurb: "stacks three dainty chains in one" },
  collar: { label: "Collar", plural: "Collars", category: "collars", base: 34, blurb: "frames the neckline with a row of gems" },
  "pearl-strand": { label: "Pearl Strand", plural: "Pearl Strands", category: "pearl-strands", base: 32, blurb: "is strung with hand-knotted pearls" },
  tennis: { label: "Tennis Necklace", plural: "Tennis", category: "tennis", base: 36, blurb: "glitters with a continuous line of stones" },
  station: { label: "Station Necklace", plural: "Station", category: "station", base: 24, blurb: "scatters little charms along the chain" },
  opera: { label: "Opera Chain", plural: "Long Chains", category: "long-chains", base: 26, blurb: "falls long and fluid, opera length" },
  coin: { label: "Coin Necklace", plural: "Coin & Temple", category: "coin-necklaces", base: 38, blurb: "is fringed with temple-style coins" },
  rope: { label: "Rope Chain", plural: "Rope Chains", category: "rope-chains", base: 420, blurb: "twists in a classic diamond-cut rope chain", gold: true },
  cuban: { label: "Cuban Link", plural: "Cuban Links", category: "cuban-links", base: 640, blurb: "is built from bold, polished Cuban links", gold: true },
  paperclip: { label: "Paperclip Chain", plural: "Paperclip", category: "paperclip-chains", base: 360, blurb: "hangs from an airy paperclip-link chain", gold: true },
  herringbone: { label: "Herringbone", plural: "Herringbone", category: "herringbone", base: 520, blurb: "lies flat and liquid as a herringbone chain", gold: true },
  figaro: { label: "Figaro Chain", plural: "Figaro", category: "figaro-chains", base: 390, blurb: "alternates three short links with one long, figaro style", gold: true },
  temple: { label: "Temple Necklace", plural: "Temple", category: "temple", base: 1180, blurb: "is a hand-chased temple necklace with ghungroo drops", gold: true },
  mangalsutra: { label: "Mangalsutra", plural: "Mangalsutra", category: "mangalsutra", base: 340, blurb: "strings black beads with gold in a modern mangalsutra", gold: true },
  haram: { label: "Haram", plural: "Harams", category: "harams", base: 1460, blurb: "falls long as a traditional mango-mala haram", gold: true },
  "gold-choker": { label: "Bridal Choker", plural: "Bridal Chokers", category: "gold-chokers", base: 980, blurb: "sits high as a carved bridal choker", gold: true },
  "bead-mala": { label: "Bead Mala", plural: "Bead Malas", category: "bead-malas", base: 460, blurb: "is strung with hand-polished gold beads", gold: true },
};

/** The Fine Gold line: gold-only styles, with their own motifs and stones. */
export const isGold = (style: StyleId) => !!STYLES[style].gold;

export const MOTIFS: Record<MotifId, { label: string; mood: Mood; bump: number }> = {
  heart: { label: "Heart", mood: "sweet", bump: 0 },
  star: { label: "Star", mood: "dreamy", bump: 0 },
  moon: { label: "Moon", mood: "dreamy", bump: 1 },
  sun: { label: "Sun", mood: "playful", bump: 1 },
  flower: { label: "Blossom", mood: "sweet", bump: 2 },
  butterfly: { label: "Butterfly", mood: "dreamy", bump: 2 },
  bow: { label: "Bow", mood: "sweet", bump: 1 },
  pearl: { label: "Pearl", mood: "elegant", bump: 3 },
  teardrop: { label: "Teardrop", mood: "elegant", bump: 3 },
  leaf: { label: "Leaf", mood: "everyday", bump: 0 },
  cluster: { label: "Cluster", mood: "elegant", bump: 4 },
  halo: { label: "Halo", mood: "elegant", bump: 5 },
  hexagon: { label: "Hexagon", mood: "everyday", bump: 0 },
  clover: { label: "Clover", mood: "playful", bump: 2 },
  key: { label: "Key", mood: "dreamy", bump: 1 },
  "evil-eye": { label: "Evil Eye", mood: "everyday", bump: 1 },
  infinity: { label: "Infinity", mood: "everyday", bump: 0 },
  shell: { label: "Seashell", mood: "playful", bump: 1 },
  lotus: { label: "Lotus", mood: "festive", bump: 3 },
  peacock: { label: "Peacock", mood: "festive", bump: 5 },
  paisley: { label: "Mango", mood: "festive", bump: 4 },
  kasu: { label: "Kasu Coin", mood: "festive", bump: 3 },
  solitaire: { label: "Solitaire", mood: "elegant", bump: 6 },
  bar: { label: "Bar", mood: "everyday", bump: 0 },
};

/** Motifs used by the Fine Gold line (a mix of gold-only and classic ones). */
export const GOLD_MOTIFS: MotifId[] = [
  "lotus", "peacock", "paisley", "kasu", "solitaire", "bar", "heart", "moon", "evil-eye", "infinity", "clover", "halo", "teardrop", "flower",
];

export type Mood = "sweet" | "dreamy" | "playful" | "elegant" | "everyday" | "festive";

export const MOODS: { id: Mood; label: string; emoji: string; text: string }[] = [
  { id: "sweet", label: "Sweet", emoji: "♥", text: "Hearts, bows and blossoms" },
  { id: "dreamy", label: "Dreamy", emoji: "☾", text: "Stars, moons, keys and butterflies" },
  { id: "playful", label: "Playful", emoji: "✿", text: "Clovers, suns and seashells" },
  { id: "elegant", label: "Elegant", emoji: "✦", text: "Pearls, halos and teardrops" },
  { id: "everyday", label: "Everyday", emoji: "◇", text: "Evil eyes, infinity and clean geometry" },
  { id: "festive", label: "Festive", emoji: "❋", text: "Temple gold, peacocks, lotus and mango" },
];

export const PALETTES: Record<
  PaletteId,
  { name: string; light: string; mid: string; dark: string; tone: Tone }
> = {
  blush: { name: "Blush", light: "#ffe1ea", mid: "#f6a5c0", dark: "#d9668e", tone: "pink" },
  mint: { name: "Mint", light: "#dcfaef", mid: "#8fdcc4", dark: "#3fa88a", tone: "mint" },
  lilac: { name: "Lilac", light: "#efe6ff", mid: "#c5b1f5", dark: "#8e6fe0", tone: "lilac" },
  peach: { name: "Peach", light: "#ffe9df", mid: "#f8b59c", dark: "#e07f62", tone: "peach" },
  sky: { name: "Sky", light: "#e3f3ff", mid: "#9fd0f5", dark: "#4f95d6", tone: "mint" },
  lemon: { name: "Lemon", light: "#fff9d6", mid: "#ffe27a", dark: "#e3b62a", tone: "peach" },
  ruby: { name: "Ruby", light: "#ffd6df", mid: "#ef5f7f", dark: "#b7224a", tone: "pink" },
  pearl: { name: "Pearly", light: "#ffffff", mid: "#f3ece6", dark: "#cdbdb2", tone: "lilac" },
  midnight: { name: "Midnight", light: "#dfe3ff", mid: "#6f7fe0", dark: "#2c3a9e", tone: "lilac" },
  coral: { name: "Coral", light: "#ffe0d8", mid: "#ff8f78", dark: "#d9553f", tone: "peach" },
  sage: { name: "Sage", light: "#eef6e4", mid: "#b5d39a", dark: "#6f9a4e", tone: "mint" },
  crystal: { name: "Crystal", light: "#ffffff", mid: "#e9f1ff", dark: "#b9c6e6", tone: "lilac" },
  polished: { name: "Polished", light: "#fff3c4", mid: "#e9bf55", dark: "#9a6a12", tone: "peach" },
  diamond: { name: "Diamond", light: "#ffffff", mid: "#d3ddef", dark: "#6a7c9f", tone: "lilac" },
  emerald: { name: "Emerald", light: "#c9f5dc", mid: "#1fa463", dark: "#0b5a33", tone: "mint" },
  sapphire: { name: "Sapphire", light: "#cfe0ff", mid: "#2f5fd0", dark: "#132e7a", tone: "lilac" },
  kundan: { name: "Kundan", light: "#fffbea", mid: "#ecdcb4", dark: "#a88b4e", tone: "peach" },
  onyx: { name: "Onyx", light: "#8a8a96", mid: "#2b2b33", dark: "#09090c", tone: "lilac" },
  firoza: { name: "Firoza", light: "#d8fbf6", mid: "#3fc3b6", dark: "#13786f", tone: "mint" },
  meenakari: { name: "Meenakari", light: "#ffd2d8", mid: "#d42a4a", dark: "#7a0d22", tone: "pink" },
};

/** Stones of the Fine Gold line (rubies and pearls are shared with the classic line). */
export const GOLD_PALETTES: PaletteId[] = [
  "polished", "diamond", "ruby", "emerald", "sapphire", "pearl", "kundan", "onyx", "firoza", "meenakari", "coral",
];

export const METALS: Record<Metal, { label: string; stops: [string, string, string, string] }> = {
  gold: { label: "Gold", stops: ["#fff6d4", "#f1cb66", "#c99228", "#7c5410"] },
  silver: { label: "Silver", stops: ["#ffffff", "#e3e6ec", "#b4b9c5", "#8c919e"] },
  rose: { label: "Rose", stops: ["#ffeae2", "#f1bfae", "#d69683", "#b07060"] },
};
