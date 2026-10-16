import Link from "next/link";
import { brand } from "@/lib/brand";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div>
          <p className={styles.brand}>
            {brand.name} <span aria-hidden>♥</span>
          </p>
          <p className={styles.note}>Handmade necklaces for every neckline. Little charms, close to heart.</p>
        </div>
        <nav className={styles.links} aria-label="Footer">
          <Link href="/shop/">Shop</Link>
          <Link href="/collections/">Collections</Link>
          <Link href="/try-on/">Try-On</Link>
          <Link href="/cart/">Cart</Link>
        </nav>
        <p className={styles.copy}>© {new Date().getFullYear()} {brand.name} · Made with love</p>
      </div>
    </footer>
  );
}
