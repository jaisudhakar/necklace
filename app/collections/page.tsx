import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@/components/Icons";
import Reveal from "@/components/Reveal";
import type { MotifId } from "@/lib/design";
import { countBy, products, type Category, type Product, type Tone } from "@/lib/products";
import styles from "./collections.module.css";

export const metadata: Metadata = {
  title: "Collections",
  description: "Fine gold temple, bridal and chain edits, plus lockets, pearl strands, layered sets, chokers and evil-eye charms.",
};

const byTrend = (a: Product, b: Product) => a.trending - b.trending;
const topOf = (pick: (p: Product) => boolean) => products.filter((p) => !p.photo && pick(p)).sort(byTrend).slice(0, 3);
const motifCount = (m: MotifId) => products.filter((p) => p.design.motif === m).length;

const ofStyles = (...ids: string[]) => (p: Product) => ids.includes(p.design.style);
const goldCount = (pick: (p: Product) => boolean) => products.filter(pick).length;

const collections: { title: string; kicker: string; text: string; href: string; tone: Tone; picks: Product[] }[] = [
  {
    title: "Temple & Bridal Gold",
    kicker: `Fine Gold · ${goldCount(ofStyles("temple", "haram", "gold-choker"))} designs`,
    text: "Hand-chased temple necklaces, mango-mala harams and bridal chokers in hallmarked 22K gold.",
    href: "/shop/?category=temple",
    tone: "peach",
    picks: topOf(ofStyles("temple", "haram", "gold-choker")),
  },
  {
    title: "Gold Chains",
    kicker: `Fine Gold · ${goldCount(ofStyles("rope", "cuban", "paperclip", "herringbone", "figaro"))} designs`,
    text: "Rope, Cuban, paperclip, herringbone and figaro chains in solid 18K gold, the most-searched chains this year.",
    href: "/shop/?category=fine-gold",
    tone: "lilac",
    picks: topOf(ofStyles("cuban", "rope", "paperclip")),
  },
  {
    title: "Mangalsutra & Malas",
    kicker: `Fine Gold · ${goldCount(ofStyles("mangalsutra", "bead-mala"))} designs`,
    text: "Modern mangalsutras for every day and hand-polished gold bead malas.",
    href: "/shop/?category=mangalsutra",
    tone: "pink",
    picks: topOf(ofStyles("mangalsutra", "bead-mala")),
  },
  {
    title: "The Locket Edit",
    kicker: `${countBy("lockets")} designs`,
    text: "Keep a tiny photo close to your heart, framed in engraved gold, silver or rose.",
    href: "/shop/?category=lockets",
    tone: "peach",
    picks: topOf((p) => p.category === "lockets"),
  },
  {
    title: "Pearl Strands",
    kicker: `${countBy("pearl-strands")} designs`,
    text: "Hand-knotted pearls with a little charm at the centre. Timeless, never stuffy.",
    href: "/shop/?category=pearl-strands",
    tone: "lilac",
    picks: topOf((p) => p.category === "pearl-strands"),
  },
  {
    title: "Coin & Temple",
    kicker: `${countBy("coin-necklaces")} designs`,
    text: "Temple-style coins fringing the chain, made for festivals, weddings and everyday celebrations.",
    href: "/shop/?category=coin-necklaces",
    tone: "pink",
    picks: topOf((p) => p.category === "coin-necklaces"),
  },
  {
    title: "Layer It Up",
    kicker: `${countBy("layered")} designs`,
    text: "Three dainty chains in one piece: the layered look without the tangles.",
    href: "/shop/?category=layered",
    tone: "mint",
    picks: topOf((p) => p.category === "layered"),
  },
  {
    title: "Evil Eye Charms",
    kicker: `${motifCount("evil-eye")} designs`,
    text: "A little protection for every day, from chokers to long chains.",
    href: "/shop/?motif=evil-eye",
    tone: "lilac",
    picks: topOf((p) => p.design.motif === "evil-eye"),
  },
  {
    title: "Chokers",
    kicker: `${countBy("chokers")} designs`,
    text: "Velvet-soft ribbons with a sparkle at the centre, sitting snug at the base of the neck.",
    href: "/shop/?category=chokers",
    tone: "peach",
    picks: topOf((p) => p.category === "chokers"),
  },
  {
    title: "Red Carpet Sparkle",
    kicker: `${countBy("tennis") + countBy("collars")} designs`,
    text: "Tennis necklaces and gem-set collars for weddings, parties and very good days.",
    href: "/shop/?category=tennis",
    tone: "pink",
    picks: topOf((p) => p.category === "tennis" || p.category === "collars"),
  },
  {
    title: "Long Chains",
    kicker: `${countBy("long-chains") + countBy("lariats")} designs`,
    text: "Opera-length chains and Y-shaped lariats that fall long and fluid.",
    href: "/shop/?category=long-chains",
    tone: "mint",
    picks: topOf((p) => p.category === "long-chains" || p.category === "lariats"),
  },
];

export default function CollectionsPage() {
  return (
    <div className={`container page-enter ${styles.page}`}>
      <header className={styles.head}>
        <h1 className={styles.title}>
          Collections <span aria-hidden>✦</span>
        </h1>
        <p className={styles.subtitle}>Find the necklace that matches your mood.</p>
      </header>

      <div className={styles.grid}>
        {collections.map((c, i) => (
          <Reveal key={c.title} delay={(i % 2) * 120}>
            <Link href={c.href} className={`${styles.card} tone-${c.tone}`} data-tilt>
              <div className={styles.body}>
                <span className={styles.kicker}>{c.kicker}</span>
                <h2 className={styles.cardTitle}>{c.title}</h2>
                <p className={styles.text}>{c.text}</p>
                <span className={styles.cta}>
                  Explore <ArrowRight size={20} />
                </span>
              </div>
              {/* Three pieces stacked like cards; they fan out on hover */}
              <div className={styles.fan} aria-hidden>
                {c.picks.map((p, j) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={p.slug}
                    src={p.image}
                    alt=""
                    className={`${styles.photo} ${styles[`p${j}`]} ${styles.art} tone-${p.tone}`}
                    loading="lazy"
                  />
                ))}
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
