"use client";

import { useEffect, useState } from "react";
import { brand } from "@/lib/brand";
import { prefersReducedMotion } from "@/lib/effects";

/**
 * Site-wide motion: an intro curtain (once per visit), a scroll progress bar,
 * a glitter trail behind the cursor, magnetic buttons, 3D tilt + glare on
 * cards marked [data-tilt], and a --scroll variable for parallax.
 */
export default function Effects() {
  const [intro, setIntro] = useState<"show" | "leave" | "done">("done");

  // Intro curtain: only on the first page of a visit.
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("ll-intro") === "1";
      sessionStorage.setItem("ll-intro", "1");
    } catch {
      seen = true;
    }
    if (seen || prefersReducedMotion()) return;
    setIntro("show");
    const t1 = setTimeout(() => setIntro("leave"), 1500);
    const t2 = setTimeout(() => setIntro("done"), 2300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Scroll progress + parallax variable.
  useEffect(() => {
    const root = document.documentElement;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = root.scrollHeight - innerHeight;
      root.style.setProperty("--progress", String(max > 0 ? scrollY / max : 0));
      root.style.setProperty("--scroll", String(scrollY));
    };
    const onScroll = () => (raf ||= requestAnimationFrame(update));
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
    };
  }, []);

  // Pointer effects: glitter trail, magnetic buttons, tilt cards (fine pointers only).
  useEffect(() => {
    if (prefersReducedMotion() || !matchMedia("(pointer: fine)").matches) return;
    let lastSpark = 0;
    const glyphs = ["✦", "✧", "·", "♥"];
    const colors = ["#7d1530", "#a52a45", "#e5b54a", "#8fdcc4"];

    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastSpark > 45) {
        lastSpark = now;
        const s = document.createElement("span");
        s.className = "glitter";
        s.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
        s.style.left = `${e.clientX}px`;
        s.style.top = `${e.clientY}px`;
        s.style.color = colors[Math.floor(Math.random() * colors.length)];
        s.style.setProperty("--dx", `${(Math.random() - 0.5) * 30}px`);
        s.style.setProperty("--dy", `${12 + Math.random() * 22}px`);
        document.body.appendChild(s);
        setTimeout(() => s.remove(), 900);
      }

      const target = e.target as Element | null;

      // Magnetic buttons drift toward the cursor.
      const mag = target?.closest<HTMLElement>(".btn");
      document.querySelectorAll<HTMLElement>(".btn.is-magnetic").forEach((b) => {
        if (b !== mag) {
          b.classList.remove("is-magnetic");
          b.style.translate = "";
        }
      });
      if (mag) {
        const r = mag.getBoundingClientRect();
        mag.classList.add("is-magnetic");
        mag.style.translate = `${((e.clientX - r.left) / r.width - 0.5) * 12}px ${((e.clientY - r.top) / r.height - 0.5) * 10}px`;
      }

      // Tilt cards toward the cursor with a moving glare.
      const card = target?.closest<HTMLElement>("[data-tilt]");
      document.querySelectorAll<HTMLElement>("[data-tilt].is-tilting").forEach((c) => {
        if (c !== card) {
          c.classList.remove("is-tilting");
          c.style.removeProperty("--rx");
          c.style.removeProperty("--ry");
        }
      });
      if (card) {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.classList.add("is-tilting");
        card.style.setProperty("--rx", `${(0.5 - py) * 10}deg`);
        card.style.setProperty("--ry", `${(px - 0.5) * 12}deg`);
        card.style.setProperty("--gx", `${px * 100}%`);
        card.style.setProperty("--gy", `${py * 100}%`);
      }
    };
    addEventListener("pointermove", onMove, { passive: true });
    return () => removeEventListener("pointermove", onMove);
  }, []);

  return (
    <>
      <div className="scroll-progress" aria-hidden />
      {intro !== "done" && (
        <div className={`intro ${intro === "leave" ? "intro-leave" : ""}`} aria-hidden>
          <div className="intro-inner">
            <svg viewBox="0 0 240 120" className="intro-chain">
              <path d="M20 10C20 80 220 80 220 10" />
              <circle cx="120" cy="78" r="9" />
            </svg>
            <span className="intro-name">{brand.name}</span>
          </div>
        </div>
      )}
    </>
  );
}
