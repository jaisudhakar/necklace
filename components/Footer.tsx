import Link from "next/link";
import { brand } from "@/lib/brand";
import Ornament from "./Ornament";
import styles from "./Footer.module.css";

const TRUST = [
  { title: "BIS hallmarked", text: "Every gold piece is hallmarked and certified." },
  { title: "Lifetime exchange", text: "Exchange your gold at today's rate, any time." },
  { title: "Insured shipping", text: "Free, fully insured delivery in a velvet box." },
  { title: "Try before you buy", text: "See any necklace on you with the virtual try-on." },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="temple-band" aria-hidden />
      <div className={`container ${styles.trust}`}>
        {TRUST.map((t) => (
          <div key={t.title} className={styles.trustItem}>
            <span className={styles.trustIcon} aria-hidden>
              ✦
            </span>
            <p className={styles.trustTitle}>{t.title}</p>
            <p className={styles.trustText}>{t.text}</p>
          </div>
        ))}
      </div>
      <Ornament className={styles.ornament} />
      <div className={`container ${styles.inner}`}>
        <div>
          <p className={styles.brand}>{brand.name}</p>
          <p className={styles.note}>Fine gold and everyday charms, for every celebration. Little charms, close to heart.</p>
        </div>
        <nav className={styles.links} aria-label="Footer">
          <Link href="/shop/">Shop</Link>
          <Link href="/shop/?category=fine-gold">Fine Gold</Link>
          <Link href="/collections/">Collections</Link>
          <Link href="/try-on/">Try-On</Link>
          <Link href="/cart/">Cart</Link>
        </nav>
        <p className={styles.copy}>© {new Date().getFullYear()} {brand.name}</p>
      </div>
    </footer>
  );
}
