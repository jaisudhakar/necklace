import { asset } from "./basePath";
import { generateCatalog, type Product } from "./catalog";
import { STYLES, type Category } from "./design";

export type { Product } from "./catalog";
export type { Category, Tone } from "./design";

const img = (name: string) => asset(`/images/products/${name}.webp`);

const originals: Product[] = [
  {
    slug: "pearl-necklace",
    design: { style: "pendant", motif: "pearl", palette: "crystal" },
    mood: "elegant",
    photo: true,
    name: "Pearl Necklace",
    price: 34,
    category: "pendants",
    tone: "pink",
    image: img("pearl-necklace"),
    viewRatio: 240 / 190,
    rating: 4.9,
    reviews: 141,
    badge: "Handmade with love",
    description:
      "Our signature piece: a single luminous pearl beneath a crystal flower on a fine golden chain. A little elegance for every day.",
    trending: 1,
    isNew: true,
  },
];

const generated = generateCatalog(new Set(originals.map((o) => o.slug)), originals.length + 1);

export const products: Product[] = [...originals, ...generated];

export const giftBox = {
  id: "gift-box",
  name: "Gift box and note",
  price: 3,
  image: img("gift-box"),
};

/** Shop filter chips: everything, the whole Fine Gold line, then every necklace family (gold first). */
export type CategoryFilter = "all" | "fine-gold" | Category;
export const categories: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "fine-gold", label: "Fine Gold ✦" },
  ...Object.values(STYLES)
    .sort((a, b) => Number(!!b.gold) - Number(!!a.gold))
    .map((s) => ({ id: s.category, label: s.plural })),
];

export const matchesCategory = (p: Product, c: CategoryFilter) =>
  c === "all" || (c === "fine-gold" ? !!p.gold : p.category === c);

const bySlug = new Map(products.map((p) => [p.slug, p]));

export function getProduct(slug: string) {
  return bySlug.get(slug);
}

/** Same family first, then same mood, picked deterministically from the slug. */
export function relatedProducts(slug: string, count = 3) {
  const product = getProduct(slug);
  if (!product) return [];
  const pool = products.filter(
    (p) => p.slug !== slug && (p.design.motif === product.design.motif || p.mood === product.mood),
  );
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return Array.from({ length: count }, (_, i) => pool[(h + i * 97) % pool.length]);
}

export const countBy = (category: Category) => products.filter((p) => p.category === category).length;

export const goldProducts = products.filter((p) => p.gold);

export const formatPrice = (n: number) => `$${n.toLocaleString("en-US")}`;
