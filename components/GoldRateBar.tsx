"use client";

import { useEffect, useState } from "react";
import { fetchGoldRates, type GoldRates } from "@/lib/goldRate";
import styles from "./GoldRateBar.module.css";

const PROMISES = ["BIS hallmarked gold", "Lifetime exchange", "Free insured shipping", "Try any piece on, virtually"];

const fmt = (n: number) => `$${n.toFixed(2)}`;

/** Top strip: today's live gold rate per gram (when the feed answers) and our promises. */
export default function GoldRateBar() {
  const [rates, setRates] = useState<GoldRates | null>(null);

  useEffect(() => {
    let alive = true;
    fetchGoldRates().then((r) => alive && setRates(r));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className={styles.bar}>
      <div className={`container ${styles.inner}`}>
        {rates && (
          <p className={styles.rate} title={`Live market price, updated ${new Date(rates.at).toLocaleTimeString()}`}>
            <span className={styles.live} aria-hidden />
            <span className={styles.rateLabel}>Gold rate today</span>
            <span>
              24K <strong>{fmt(rates.k24)}</strong>/g
            </span>
            <span>
              22K <strong>{fmt(rates.k22)}</strong>/g
            </span>
            <span className={styles.hideSm}>
              18K <strong>{fmt(rates.k18)}</strong>/g
            </span>
          </p>
        )}
        <ul className={`${styles.promises} ${rates ? styles.promisesSide : ""}`}>
          {PROMISES.map((p) => (
            <li key={p}>
              <span aria-hidden>✦</span> {p}
            </li>
          ))}
        </ul>
      </div>
      <div className="temple-band" aria-hidden />
    </div>
  );
}
