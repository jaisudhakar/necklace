// Design taxonomy for the necklace catalog. Necklace families follow common
// jewelry-guide classifications (pendants, chokers, lockets, lariats, layered,
// collars, pearl strands, tennis, station, opera-length and coin/temple styles);
// motifs follow current charm trends.

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
  | "coin";

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
  | "shell";

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
  | "crystal";

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
  | "coin-necklaces";

export const STYLES: Record<
  StyleId,
  { label: string; plural: string; category: Category; base: number; blurb: string }
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
};

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
};

export type Mood = "sweet" | "dreamy" | "playful" | "elegant" | "everyday";

export const MOODS: { id: Mood; label: string; emoji: string; text: string }[] = [
  { id: "sweet", label: "Sweet", emoji: "♥", text: "Hearts, bows and blossoms" },
  { id: "dreamy", label: "Dreamy", emoji: "☾", text: "Stars, moons, keys and butterflies" },
  { id: "playful", label: "Playful", emoji: "✿", text: "Clovers, suns and seashells" },
  { id: "elegant", label: "Elegant", emoji: "✦", text: "Pearls, halos and teardrops" },
  { id: "everyday", label: "Everyday", emoji: "◇", text: "Evil eyes, infinity and clean geometry" },
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
};

export const METALS: Record<Metal, { label: string; stops: [string, string, string, string] }> = {
  gold: { label: "Gold", stops: ["#fff4c7", "#f2cd62", "#d29f33", "#a8761a"] },
  silver: { label: "Silver", stops: ["#ffffff", "#e3e6ec", "#b4b9c5", "#8c919e"] },
  rose: { label: "Rose", stops: ["#ffeae2", "#f1bfae", "#d69683", "#b07060"] },
};
