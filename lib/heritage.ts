// Ways to browse in the heritage style: by occasion, and by named signature
// collections (each a curated slice of the catalog).

import type { MotifId, StyleId } from "./design";
import { products, type Product } from "./products";

const style = (...ids: StyleId[]) => (p: Product) => ids.includes(p.design.style);
const motif = (...ids: MotifId[]) => (p: Product) => ids.includes(p.design.motif);
const byTrend = (a: Product, b: Product) => a.trending - b.trending;

export type Occasion = { id: string; label: string; text: string; test: (p: Product) => boolean };

export const OCCASIONS: Occasion[] = [
  {
    id: "bridal",
    label: "Bridal",
    text: "Temple sets, harams and chokers for the big day",
    test: style("temple", "haram", "gold-choker"),
  },
  {
    id: "festive",
    label: "Festive",
    text: "Peacocks, lotus and kasu coins for every festival",
    test: (p) => p.mood === "festive" || p.design.style === "coin",
  },
  {
    id: "daily",
    label: "Daily Wear",
    text: "Light chains and pendants you never take off",
    test: style("pendant", "station", "layered", "paperclip", "rope", "figaro", "mangalsutra", "bead-mala"),
  },
  {
    id: "office",
    label: "Office Wear",
    text: "Solitaires, bars and sleek chains",
    test: (p) => style("herringbone", "cuban", "tennis")(p) || motif("bar", "solitaire", "hexagon", "infinity")(p),
  },
  {
    id: "gifting",
    label: "Gifting",
    text: "Lockets and charms under $50",
    test: (p) => p.price <= 50 && style("locket", "pendant", "choker", "station")(p),
  },
];

export const getOccasion = (id: string) => OCCASIONS.find((o) => o.id === id);

/** The most popular piece for an occasion, preferring gold. */
export const occasionCover = (o: Occasion) =>
  products.filter((p) => o.test(p) && !p.photo).sort((a, b) => Number(!!b.gold) - Number(!!a.gold) || byTrend(a, b))[0];

export type Signature = {
  name: string;
  /** What it is, in a few words. */
  kind: string;
  text: string;
  href: string;
  test: (p: Product) => boolean;
};

/** Named signature collections, in the way heritage jewellers present their lines. */
export const SIGNATURES: Signature[] = [
  {
    name: "Devi",
    kind: "Temple jewellery",
    text: "Hand-chased temple necklaces with kasu coins and ghungroo drops, in hallmarked 22K gold.",
    href: "/shop/?category=temple",
    test: style("temple"),
  },
  {
    name: "Rajkumari",
    kind: "Bridal chokers & harams",
    text: "Carved bridal chokers and long mango-mala harams, made to be worn together.",
    href: "/shop/?occasion=bridal",
    test: style("gold-choker", "haram"),
  },
  {
    name: "Mangalyam",
    kind: "Mangalsutra",
    text: "Black-bead mangalsutras with diamond, solitaire and lotus pendants for every day.",
    href: "/shop/?category=mangalsutra",
    test: style("mangalsutra"),
  },
  {
    name: "Nitya",
    kind: "Everyday gold chains",
    text: "Rope, paperclip, figaro, herringbone and Cuban chains in solid 18K gold.",
    href: "/shop/?category=fine-gold&occasion=daily",
    test: style("rope", "paperclip", "figaro", "herringbone", "cuban"),
  },
  {
    name: "Mayil",
    kind: "Peacock motifs",
    text: "The peacock, fanned in gold and set with sapphires, emeralds and rubies.",
    href: "/shop/?motif=peacock",
    test: motif("peacock"),
  },
  {
    name: "Kamalam",
    kind: "Lotus motifs",
    text: "The lotus in polished gold, kundan and meenakari, from pendants to temple sets.",
    href: "/shop/?motif=lotus",
    test: motif("lotus"),
  },
];

export const signaturePieces = (s: Signature) => products.filter((p) => s.test(p)).sort(byTrend);
