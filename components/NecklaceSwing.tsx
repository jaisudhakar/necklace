"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/effects";
import styles from "./NecklaceSwing.module.css";

type Props = {
  src: string;
  alt: string;
  /** Artwork width / height. */
  ratio: number;
  /** Where the chain is hung from, as 0..1 fractions of the artwork (pivot of the swing). */
  pivot?: { x: number; y: number };
  /** CSS filter for the photo (metal-finish preview on photographed pieces). */
  filter?: string;
  zoom?: number;
  /** Draw the soft display bust behind generated artwork. */
  bust?: boolean;
  className?: string;
  onFirstSwing?: () => void;
};

/**
 * A necklace hanging on a display bust. Drag it sideways and it swings on a
 * damped pendulum from the back of the neck; left alone it sways gently, as if
 * the wearer were breathing.
 */
export default function NecklaceSwing({
  src,
  alt,
  ratio,
  pivot = { x: 0.5, y: 0.03 },
  filter,
  zoom = 1,
  bust = true,
  className = "",
  onFirstSwing,
}: Props) {
  const swingRef = useRef<HTMLDivElement>(null);
  const s = useRef({ angle: 0, vel: 0, dragging: false, startX: 0, startAngle: 0, swung: false });
  const [dragging, setDragging] = useState(false);
  const first = useRef(onFirstSwing);
  first.current = onFirstSwing;

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const calm = prefersReducedMotion();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const st = s.current;
      if (!st.dragging) {
        // Damped pendulum plus a slow "breathing" sway.
        const breeze = calm ? 0 : Math.sin(now / 1400) * 0.9;
        st.vel += (-18 * Math.sin(st.angle) - 2.4 * st.vel + breeze) * dt;
        st.angle += st.vel * dt;
      }
      if (swingRef.current) swingRef.current.style.transform = `rotate(${(st.angle * 180) / Math.PI}deg)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const down = (e: React.PointerEvent) => {
    const st = s.current;
    st.dragging = true;
    st.startX = e.clientX;
    st.startAngle = st.angle;
    st.vel = 0;
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const move = (e: React.PointerEvent) => {
    const st = s.current;
    if (!st.dragging) return;
    const w = (e.currentTarget as HTMLElement).clientWidth || 400;
    const next = Math.max(-0.7, Math.min(0.7, st.startAngle - ((e.clientX - st.startX) / w) * 1.6));
    st.vel = (next - st.angle) * 30;
    st.angle = next;
    if (!st.swung && Math.abs(e.clientX - st.startX) > 4) {
      st.swung = true;
      first.current?.();
    }
  };

  const up = () => {
    s.current.dragging = false;
    setDragging(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      s.current.vel += e.key === "ArrowLeft" ? 1.2 : -1.2;
    }
  };

  return (
    <div
      className={`${styles.stage} ${dragging ? styles.dragging : ""} ${className}`}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onKeyDown={onKeyDown}
      tabIndex={0}
      role="img"
      aria-label={`${alt}. Drag, or use the left and right arrow keys, to swing it.`}
    >
      <div className={styles.zoom} style={{ transform: `scale(${zoom})` }}>
        <div className={styles.frame} style={{ "--ratio": ratio } as React.CSSProperties}>
          {bust && (
            <svg className={styles.bust} viewBox="0 0 300 600" preserveAspectRatio="xMidYMin meet" aria-hidden>
              <defs>
                {/* Fades out toward the shoulders so the bust never shows a hard edge */}
                <linearGradient id="bustFill" gradientUnits="userSpaceOnUse" x1="-40" y1="0" x2="340" y2="0">
                  <stop offset="0" stopColor="#fff" stopOpacity="0" />
                  <stop offset=".3" stopColor="#fff" stopOpacity=".8" />
                  <stop offset=".7" stopColor="#fff" stopOpacity=".8" />
                  <stop offset="1" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M100 -40V30C100 50 82 58 54 66C10 78-50 100-120 150V600H420V150C350 100 290 78 246 66 218 58 200 50 200 30V-40Z" fill="url(#bustFill)" />
            </svg>
          )}
          <div ref={swingRef} className={styles.swing} style={{ transformOrigin: `${pivot.x * 100}% ${pivot.y * 100}%` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" draggable={false} className={styles.photo} style={{ filter }} />
            <span className={styles.glint} aria-hidden />
          </div>
        </div>
      </div>
      <span className={`${styles.twinkle} ${styles.t1}`} aria-hidden>✦</span>
      <span className={`${styles.twinkle} ${styles.t2}`} aria-hidden>✧</span>
      <span className={`${styles.twinkle} ${styles.t3}`} aria-hidden>✦</span>
    </div>
  );
}
