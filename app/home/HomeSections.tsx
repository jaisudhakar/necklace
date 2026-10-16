import Link from "next/link";
import { ArrowRight, CubeIcon } from "@/components/Icons";
import Reveal from "@/components/Reveal";
import { MOODS, STYLES, type Design, type Mood } from "@/lib/design";
import { artUri, necklaceGeometry } from "@/lib/necklaceArt";
import { products, type Product } from "@/lib/products";
import { PHOTO_MODEL as MODEL } from "@/lib/sampleModels";
import styles from "./home.module.css";

const necklaces = products;
const byTrend = (a: Product, b: Product) => a.trending - b.trending;
const popularity = (p: Product) => p.rating * Math.log10(p.reviews + 10);

export const homeData = {
  newArrivals: necklaces.filter((p) => p.isNew).sort(byTrend).slice(0, 12).map((p) => p.slug),
  // Most popular per mood, at most one per necklace family so each tab feels varied.
  bestByMood: Object.fromEntries(
    MOODS.map((m) => {
      const seen = new Set<string>();
      const picks = necklaces
        .filter((p) => p.mood === m.id)
        .sort((a, b) => popularity(b) - popularity(a))
        .filter((p) => !seen.has(p.category) && seen.add(p.category))
        .slice(0, 4);
      return [m.id, picks.map((p) => p.slug)];
    }),
  ) as Record<Mood, string[]>,
  stats: [
    { value: necklaces.length, suffix: "+", label: "handmade designs" },
    {
      value: Math.round((necklaces.reduce((s, p) => s + p.rating, 0) / necklaces.length) * 10) / 10,
      decimals: 1,
      suffix: "★",
      label: "average rating",
    },
    { value: Object.keys(STYLES).length, label: "necklace styles" },
    { value: necklaces.reduce((s, p) => s + p.reviews, 0), label: "happy reviews" },
  ],
};

export function SectionHead({ kicker, title, href, cta }: { kicker: string; title: string; href?: string; cta?: string }) {
  return (
    <div className={styles.sectionHead}>
      <div>
        <p className={styles.kicker}>{kicker}</p>
        <h2 className={styles.sectionTitle}>{title}</h2>
      </div>
      {href && (
        <Link href={href} className={styles.viewAll}>
          {cta ?? "View all"} <ArrowRight size={20} />
        </Link>
      )}
    </div>
  );
}

/** One tile per necklace family, showing its most popular design. */
export function StyleTiles() {
  const tones = ["pink", "mint", "peach", "lilac"] as const;
  return (
    <div className={styles.styleGrid}>
      {Object.values(STYLES).map((s, i) => {
        const inFamily = necklaces.filter((p) => p.category === s.category && !p.photo);
        const hero = inFamily.sort(byTrend)[0];
        return (
          <Reveal key={s.category} delay={(i % 5) * 70}>
            <Link href={`/shop/?category=${s.category}`} className={`${styles.styleTile} tone-${tones[i % 4]}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={hero.image} alt="" loading="lazy" />
              <span className={styles.styleName}>{s.plural}</span>
              <span className={styles.styleCount}>{inFamily.length} designs</span>
            </Link>
          </Reveal>
        );
      })}
    </div>
  );
}

// Base of the neck on the sample model photo (pre-measured by the try-on models).
const NECK = MODEL.neck ?? { x: MODEL.w / 2, y: MODEL.h * 0.48, width: MODEL.w * 0.24, angle: 0 };
const PROMO_DESIGNS: Design[] = [
  { style: "pendant", motif: "evil-eye", palette: "sky" },
  { style: "locket", motif: "flower", palette: "blush" },
  { style: "coin", motif: "teardrop", palette: "ruby" },
  { style: "lariat", motif: "moon", palette: "crystal" },
];

/** Necklaces cycling on the sample model, with a CTA into the try-on. */
export function TryOnPromo() {
  return (
    <div className={styles.promo}>
      <div className={styles.promoCopy}>
        <p className={styles.kicker}>New · Virtual Try-On</p>
        <h2 className={styles.promoTitle}>See it on you before you buy</h2>
        <p className={styles.promoText}>
          Turn on your camera or upload a selfie: in-browser pose and face tracking drapes any of{" "}
          {necklaces.length.toLocaleString("en-US")} necklaces right at your neckline, swaying as you move. Nothing is uploaded, ever.
        </p>
        <Link href="/try-on/" className="btn">
          <CubeIcon size={24} /> Try it on
        </Link>
      </div>
      <figure className={styles.promoFigure}>
        <div className={styles.promoStage} style={{ aspectRatio: `${MODEL.w} / ${MODEL.h}` }} aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={MODEL.src} alt="" className={styles.promoModel} loading="lazy" />
          {PROMO_DESIGNS.map((d, i) => {
            const geo = necklaceGeometry(d);
            // Chain ends span the neck, so the artwork is neck width ÷ the ends' share of its width.
            const wPx = NECK.width / (geo.ends[1].x - geo.ends[0].x);
            const hPx = wPx / geo.ratio;
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={artUri(d, { single: true })}
                alt=""
                className={styles.promoNecklace}
                style={{
                  left: `${((NECK.x - wPx / 2) / MODEL.w) * 100}%`,
                  top: `${((NECK.y - geo.ends[0].y * hPx) / MODEL.h) * 100}%`,
                  width: `${(wPx / MODEL.w) * 100}%`,
                  transformOrigin: `50% ${geo.ends[0].y * 100}%`,
                  rotate: `${NECK.angle}rad`,
                  animationDelay: `${i * 3}s, 0s`,
                }}
              />
            );
          })}
          <span className={styles.promoScan} />
        </div>
        {MODEL.credit && <figcaption className={styles.promoCredit}>{MODEL.credit}</figcaption>}
      </figure>
    </div>
  );
}

const REVIEWS = [
  { name: "Maya R.", text: "The evil-eye pendant gets compliments every single day. Dainty but so noticeable!", item: "Evil Eye Pendant" },
  { name: "Priya S.", text: "Tried the coin necklace on with the camera first, ordered in two minutes. It looks exactly like that.", item: "Coin Necklace" },
  { name: "Elena K.", text: "Finally a chain that doesn’t irritate my skin. Ordered two more for layering.", item: "Layered Necklace" },
  { name: "Jo W.", text: "Put my grandparents’ photo in the locket. The gift box made my mum cry happy tears.", item: "Blossom Locket" },
  { name: "Aisha M.", text: "Light as air. I forget I’m wearing it until someone asks where it’s from.", item: "Star Pendant" },
  { name: "Sofia L.", text: "So many colours to pick from, I went with mint and I’m obsessed.", item: "Mint Clover Choker" },
  { name: "Hana T.", text: "The pearl strand sits perfectly with every neckline I own.", item: "Pearl Strand" },
  { name: "Grace O.", text: "Wore the tennis necklace to a wedding and felt like the main character.", item: "Tennis Necklace" },
]

/** Two rows of review cards drifting in opposite directions. */
export function Testimonials() {
  const rows = [REVIEWS.slice(0, 4), REVIEWS.slice(4)];
  return (
    <div className={styles.reviews}>
      {rows.map((row, r) => (
        <div key={r} className={`${styles.reviewRow} ${r ? styles.reviewRowReverse : ""}`}>
          {[...row, ...row].map((rev, i) => (
            <figure key={i} className={styles.review} aria-hidden={i >= row.length}>
              <span className={styles.reviewStars}>★★★★★</span>
              <blockquote>“{rev.text}”</blockquote>
              <figcaption>
                <strong>{rev.name}</strong> · {rev.item}
              </figcaption>
            </figure>
          ))}
        </div>
      ))}
    </div>
  );
}

const BANDS = [
  { id: "under-25", label: "Under $25", note: "Little thank-yous", tone: "mint", test: (p: number) => p < 25 },
  { id: "25-35", label: "$25 – $35", note: "Best friend gifts", tone: "pink", test: (p: number) => p >= 25 && p <= 35 },
  { id: "35-45", label: "$35 – $45", note: "Birthday sparkle", tone: "lilac", test: (p: number) => p > 35 && p <= 45 },
  { id: "45-plus", label: "$45 & up", note: "Treat yourself", tone: "peach", test: (p: number) => p > 45 },
];

/** Gift guide: price bands linking into the filtered shop. */
export function GiftGuide() {
  return (
    <div className={styles.gifts}>
      {BANDS.map((b, i) => {
        const inBand = necklaces.filter((p) => b.test(p.price) && !p.photo).sort(byTrend);
        return (
          <Reveal key={b.id} delay={i * 90}>
            <Link href={`/shop/?price=${b.id}&sort=price-asc`} className={`${styles.gift} tone-${b.tone}`}>
              <span className={styles.giftRibbon} aria-hidden />
              <span className={styles.giftNote}>{b.note}</span>
              <span className={styles.giftLabel}>{b.label}</span>
              <span className={styles.giftCount}>{inBand.length} designs</span>
              <span className={styles.giftArt}>
                {inBand.slice(0, 3).map((p) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={p.slug} src={p.image} alt="" loading="lazy" />
                ))}
              </span>
            </Link>
          </Reveal>
        );
      })}
    </div>
  );
}

const FAQS = [
  {
    q: "Are your necklaces hypoallergenic?",
    a: "Yes. Every chain and clasp is nickel-free and lead-free, plated over surgical steel or sterling silver, so they're gentle on sensitive skin.",
  },
  {
    q: "How does the virtual try-on work?",
    a: "We use Google's MediaPipe pose and face landmark models, running entirely inside your browser, to find your shoulders, chin and the base of your neck. Your camera feed and photos never leave your device.",
  },
  {
    q: "Which length should I choose?",
    a: "Chokers sit at the base of the neck (about 35 cm), pendants and lockets fall to the collarbone (45 cm), lariats and layered pieces sit a little lower, and opera chains drop to the chest (75 cm+).",
  },
  {
    q: "Can I layer necklaces?",
    a: "Absolutely. Pair a choker with a pendant and a long chain, keep the metals matching, and let each one sit about 5 cm below the last.",
  },
  {
    q: "How should I care for my necklace?",
    a: "Keep it dry, take it off before swimming or showering, fasten the clasp before storing, and keep it in its keepsake box so the chain doesn't tangle.",
  },
  {
    q: "Do you ship for free?",
    a: "Always. Every order ships free, wrapped and ready for gifting.",
  },
]

/** Accordion built on <details>, animated with CSS. */
export function Faq() {
  return (
    <div className={styles.faq}>
      {FAQS.map((f, i) => (
        <details key={f.q} className={styles.faqItem} open={i === 0}>
          <summary>
            {f.q}
            <span className={styles.faqIcon} aria-hidden />
          </summary>
          <p>{f.a}</p>
        </details>
      ))}
    </div>
  );
}
