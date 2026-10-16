"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import FloatingOrbs from "@/components/FloatingOrbs";
import { HandIcon } from "@/components/Icons";
import NecklaceSwing from "@/components/NecklaceSwing";
import { METALS, type Metal } from "@/lib/design";
import { prefersReducedMotion } from "@/lib/effects";
import { artUri, necklaceGeometry } from "@/lib/necklaceArt";
import { formatPrice, getProduct } from "@/lib/products";
import styles from "./page.module.css";

/**
 * Right-hand side of the hero: a display bust wearing a necklace that is
 * lowered into place, sways, can be dragged to swing, recoloured in another
 * metal, and every few seconds trades places with the next featured design.
 */
export default function HeroStage({ slugs }: { slugs: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const [metal, setMetal] = useState<Metal>("gold");
  const [hintGone, setHintGone] = useState(false);
  const [paused, setPaused] = useState(false);
  const product = getProduct(slugs[i])!;
  const geo = necklaceGeometry(product.design);

  // Rotate through the featured designs until the visitor starts playing with one.
  useEffect(() => {
    if (paused || prefersReducedMotion()) return;
    const t = setInterval(() => setI((n) => (n + 1) % slugs.length), 5200);
    return () => clearInterval(t);
  }, [paused, slugs.length]);

  const onPointerMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
    el.style.setProperty("--my", (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
  };

  return (
    <div
      className={styles.stage}
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={() => {
        ref.current?.style.setProperty("--mx", "0");
        ref.current?.style.setProperty("--my", "0");
      }}
    >
      <div className={styles.halo} aria-hidden />
      <svg className={styles.orbit} viewBox="0 0 600 260" aria-hidden>
        <ellipse cx="300" cy="130" rx="290" ry="105" className={styles.orbitPath} />
        <circle r="6" className={styles.orbitDot}>
          <animateMotion dur="9s" repeatCount="indefinite" path="M10,130 a290,105 0 1,0 580,0 a290,105 0 1,0 -580,0" />
        </circle>
      </svg>

      <FloatingOrbs
        orbs={[
          { kind: "pearl", size: 70, top: "6%", left: "4%", depth: 26 },
          { kind: "bubble", size: 210, top: "2%", right: "-4%", depth: 14 },
          { kind: "pink", size: 120, bottom: "4%", left: "-8%", depth: 18 },
          { kind: "peach", size: 96, top: "58%", right: "-4%", depth: 22 },
          { kind: "pearl", size: 46, top: "34%", right: "20%", depth: 34 },
        ]}
      />

      <div className={styles.bustWrap} onPointerDown={() => setPaused(true)}>
        {/* Re-keying replays the "lowered into place" entrance for each design */}
        <div className={styles.lower} key={`${product.slug}-${metal}`}>
          <NecklaceSwing
            src={artUri(product.design, { metal, single: true })}
            alt={product.name}
            ratio={geo.ratio}
            pivot={{ x: 0.5, y: geo.ends[0].y }}
            onFirstSwing={() => setHintGone(true)}
          />
        </div>
      </div>

      <div className={styles.heroCard} key={product.slug}>
        <span className={styles.heroCardName}>{product.name}</span>
        <span className={styles.heroCardRow}>
          <strong>{formatPrice(product.price)}</strong>
          <Link href={`/product/${product.slug}/`}>View</Link>
        </span>
        <span className={styles.heroMetals} role="radiogroup" aria-label="Try another metal">
          {(Object.keys(METALS) as Metal[]).map((m) => (
            <button
              key={m}
              role="radio"
              aria-checked={metal === m}
              aria-label={METALS[m].label}
              className={`${styles.heroMetal} ${styles[`metal_${m}`]} ${metal === m ? styles.heroMetalOn : ""}`}
              onClick={() => {
                setMetal(m);
                setPaused(true);
              }}
            />
          ))}
        </span>
        <span className={styles.heroDots} aria-hidden>
          {slugs.map((s, n) => (
            <span key={s} className={n === i ? styles.heroDotOn : ""} />
          ))}
        </span>
      </div>

      <div className={`${styles.hint} ${hintGone ? styles.hintGone : ""}`} aria-hidden>
        <span>Drag to swing</span>
        <span className={styles.hintRow}>
          <span className={styles.hintArrowL}>←</span>
          <HandIcon size={30} />
          <span className={styles.hintArrowR}>→</span>
        </span>
      </div>
    </div>
  );
}
