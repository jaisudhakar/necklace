"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCart, type Finish } from "@/components/CartProvider";
import { ArrowRight, BagIcon, CheckIcon } from "@/components/Icons";
import { METALS, type Metal, type StyleId } from "@/lib/design";
import { brand } from "@/lib/brand";
import { artUri, necklaceGeometry } from "@/lib/necklaceArt";
import { flyToCart, sparkleBurst } from "@/lib/effects";
import { formatPrice, getProduct, products, type Product } from "@/lib/products";
import { ILLUSTRATED_MODEL, PHOTO_MODEL, type SampleModel } from "@/lib/sampleModels";
import {
  artWidth,
  drawNecklace,
  loadTrackers,
  neckFromLandmarks,
  Pendulum,
  setMode,
  type DrawSpec,
  type Neck,
  type Trackers,
} from "@/lib/tryon";
import styles from "./tryon.module.css";

type Source = "sample" | "camera" | "photo";
type Status = { kind: "idle" | "loading" | "tracking" | "searching" | "error"; text?: string };

const DEFAULT_SLUG = "pearl-necklace";
const tryable = products;
/** Up to three necklaces can be worn at once. */
const MAX_LAYERS = 2;

const BRIDAL: StyleId[] = ["temple", "haram", "gold-choker", "mangalsutra", "bead-mala"];
const CHAINS: StyleId[] = ["rope", "cuban", "paperclip", "herringbone", "figaro"];
/** Quick shelves for the picker. */
const SHELVES: { id: string; label: string; test: (p: Product) => boolean }[] = [
  { id: "trending", label: "Trending", test: () => true },
  { id: "gold", label: "Fine Gold", test: (p) => !!p.gold },
  { id: "bridal", label: "Bridal & Temple", test: (p) => BRIDAL.includes(p.design.style) },
  { id: "chains", label: "Gold Chains", test: (p) => CHAINS.includes(p.design.style) },
  { id: "charms", label: "Everyday Charms", test: (p) => !p.gold },
];

export default function TryOnClient() {
  const { add, showToast } = useCart();
  const [slug, setSlug] = useState(DEFAULT_SLUG);
  const [metal, setMetal] = useState<Metal>("gold");
  const [size, setSize] = useState(1);
  const [source, setSource] = useState<Source>("sample");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [query, setQuery] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoDims, setPhotoDims] = useState<{ w: number; h: number } | null>(null);
  const [model, setModel] = useState<SampleModel>(PHOTO_MODEL);
  const modelRef = useRef<SampleModel>(PHOTO_MODEL);
  const [added, setAdded] = useState(false);
  /** Extra necklaces worn with the selected one (layering). */
  const [layers, setLayers] = useState<string[]>([]);
  const [shelf, setShelf] = useState(SHELVES[0].id);
  const [autoplay, setAutoplay] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const specsRef = useRef<DrawSpec[]>([]);
  const neckRef = useRef<Neck | null>(null);
  const sourceRef = useRef<Source>("sample");
  const pendulums = useRef<Pendulum[]>([]);
  const statusRef = useRef<Status["kind"]>("idle");
  /** Set once the pose + face models have loaded (only when camera or photo mode is first used). */
  const trRef = useRef<Trackers | null>(null);

  const product = getProduct(slug) ?? getProduct(DEFAULT_SLUG)!;

  const setStatusBoth = useCallback((s: Status) => {
    statusRef.current = s.kind;
    setStatus(s);
  }, []);

  // ?p=<slug>&metal=<gold|silver|rose> from the product page's "Try on" button.
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const p = sp.get("p");
    if (p && getProduct(p)) setSlug(p);
    const m = sp.get("metal");
    if (m && m in METALS) setMetal(m as Metal);
    const l = sp.get("layers");
    if (l) setLayers(l.split(",").filter((x) => getProduct(x)).slice(0, MAX_LAYERS));
  }, []);

  useEffect(() => {
    const extra = layers.length ? `&layers=${layers.join(",")}` : "";
    window.history.replaceState(null, "", `?p=${slug}&metal=${metal}${extra}`);
  }, [slug, metal, layers]);

  /** Everything being worn: the selected necklace plus any layered ones. */
  const worn = useMemo(
    () => [product, ...layers.filter((l) => l !== product.slug).map((l) => getProduct(l)!)],
    [product, layers],
  );

  // The necklace artwork for the canvas: transparent, in the chosen metal.
  // Longer necklaces are drawn first so shorter ones sit on top of them.
  useEffect(() => {
    specsRef.current = worn
      .map((p) => {
        const img = new Image();
        img.src = artUri(p.design, { metal, single: true });
        const geo = necklaceGeometry(p.design);
        return { img, style: p.design.style, ratio: geo.ratio, ends: geo.ends, size };
      })
      .sort((a, b) => a.ratio - b.ratio);
  }, [worn, metal, size]);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  // ---------------------------------------------------------------------------
  // Sources
  // ---------------------------------------------------------------------------

  const showSample = useCallback(() => {
    stopCamera();
    sourceRef.current = "sample";
    setSource("sample");
    // A pre-measured neck shows instantly; otherwise it's detected once the image loads.
    neckRef.current = modelRef.current.neck ?? null;
    setStatusBoth(modelRef.current.neck ? { kind: "idle" } : { kind: "loading", text: "Finding the model’s neckline…" });
  }, [setStatusBoth]);

  const startCamera = async () => {
    stopCamera();
    neckRef.current = null;
    sourceRef.current = "camera";
    setSource("camera");
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatusBoth({ kind: "error", text: "This browser can’t open a camera. Try uploading a photo instead." });
      return;
    }
    setStatusBoth({ kind: "loading", text: "Starting camera & loading the tracking models…" });
    try {
      const [stream, lm] = await Promise.all([
        navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } },
          audio: false,
        }),
        loadTrackers(),
      ]);
      if (sourceRef.current !== "camera") {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      await setMode(lm, "VIDEO");
      trRef.current = lm;
      streamRef.current = stream;
      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();
      setStatusBoth({ kind: "searching", text: "Looking for your face…" });
    } catch (err) {
      const denied = err instanceof DOMException && (err.name === "NotAllowedError" || err.name === "SecurityError");
      setStatusBoth({
        kind: "error",
        text: denied
          ? "Camera permission was declined. You can still upload a photo or use our sample model."
          : "We couldn’t start the camera or load the tracking models. Check your connection and try again.",
      });
    }
  };

  const onPhoto = async (file: File | undefined) => {
    if (!file) return;
    stopCamera();
    neckRef.current = null;
    sourceRef.current = "photo";
    setSource("photo");
    setPhotoUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(file);
    });
    setStatusBoth({ kind: "loading", text: "Loading the tracking models…" });
  };

  // Find the neckline in an uploaded photo (or a sample model without a pre-measured neck) once it loads.
  const detectImage = async () => {
    const img = imgRef.current;
    if (!img) return;
    if (sourceRef.current === "photo") setPhotoDims({ w: img.naturalWidth, h: img.naturalHeight });
    if (sourceRef.current !== "photo" && !(sourceRef.current === "sample" && !modelRef.current.neck)) return;
    try {
      const t = await loadTrackers();
      await setMode(t, "IMAGE");
      const pose = t.pose.detect(img).landmarks[0];
      const face = t.face.detect(img).faceLandmarks[0];
      const neck = neckFromLandmarks(face, pose, img.naturalWidth, img.naturalHeight);
      if (!neck) {
        setStatusBoth({ kind: "error", text: "We couldn’t find a face in that photo. Try a front-facing photo that shows your neck and shoulders." });
        return;
      }
      neckRef.current = neck;
      setStatusBoth({ kind: "tracking", text: "Neckline found" });
    } catch {
      setStatusBoth({ kind: "error", text: "We couldn’t load the tracking models. Check your connection and try again." });
    }
  };

  useEffect(() => {
    showSample();
    return () => stopCamera();
  }, [showSample]);

  // ---------------------------------------------------------------------------
  // Render loop
  // ---------------------------------------------------------------------------

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let lastVideoTime = -1;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = (now - last) / 1000;
      last = now;
      const canvas = canvasRef.current;
      const specs = specsRef.current;
      if (!canvas || !specs.length) return;
      const src = sourceRef.current;

      let w = modelRef.current.w;
      let h = modelRef.current.h;
      if (src === "camera") {
        const v = videoRef.current;
        if (!v || v.readyState < 2) return;
        w = v.videoWidth;
        h = v.videoHeight;
        const t = trRef.current;
        if (t && statusRef.current !== "loading" && statusRef.current !== "error" && v.currentTime !== lastVideoTime) {
          lastVideoTime = v.currentTime;
          try {
            const pose = t.pose.detectForVideo(v, now).landmarks[0];
            const face = t.face.detectForVideo(v, now).faceLandmarks[0];
            neckRef.current = neckFromLandmarks(face, pose, w, h);
            const kind = neckRef.current ? "tracking" : "searching";
            if (statusRef.current !== kind) setStatusBoth({ kind, text: kind === "tracking" ? "Tracking" : "Looking for you…" });
          } catch {
            /* the model is switching modes; try again next frame */
          }
        }
      } else if (src === "photo") {
        const img = imgRef.current;
        if (!img?.naturalWidth) return;
        w = img.naturalWidth;
        h = img.naturalHeight;
      }

      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, w, h);
      const neck = neckRef.current;
      if (!neck) return;

      // A soft "breeze" keeps still images lively; live video swings from real movement.
      const breeze = src === "camera" ? 0 : Math.sin(now / 1100) * 0.6;
      specs.forEach((spec, i) => {
        const pendulum = (pendulums.current[i] ??= new Pendulum());
        const length = artWidth(neck, spec) / spec.ratio;
        drawNecklace(ctx, neck, spec, pendulum.step(neck.x, dt, length, breeze));
      });
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [setStatusBoth]);

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  const snapshot = () => {
    const overlay = canvasRef.current;
    if (!overlay?.width) return;
    const out = document.createElement("canvas");
    out.width = overlay.width;
    out.height = overlay.height;
    const ctx = out.getContext("2d")!;
    ctx.save();
    if (source === "camera") {
      ctx.translate(out.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current!, 0, 0, out.width, out.height);
    } else {
      ctx.drawImage(imgRef.current!, 0, 0, out.width, out.height);
    }
    ctx.drawImage(overlay, 0, 0);
    ctx.restore();
    ctx.font = `700 ${Math.round(out.width / 26)}px "Cormorant Garamond", Georgia, serif`;
    ctx.fillStyle = "rgba(255,255,255,.9)";
    ctx.textAlign = "right";
    ctx.fillText(`${brand.name} ♥`, out.width - out.width / 30, out.height - out.width / 30);
    const a = document.createElement("a");
    a.download = `lumi-lockets-${worn.map((p) => p.slug).join("+")}.png`;
    a.href = out.toDataURL("image/png");
    a.click();
    sparkleBurst(stageRef.current, 16);
  };

  const onAdd = async () => {
    if (added) return;
    setAdded(true);
    await flyToCart(stageRef.current, artUri(product.design, { metal }));
    worn.forEach((p) => add(p.slug, 1, metal as Finish));
    showToast(worn.length > 1 ? `The ${worn.length}-piece look (${METALS[metal].label}) added` : `${product.name} (${METALS[metal].label}) added`);
    setTimeout(() => setAdded(false), 1600);
  };

  const picks = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const test = SHELVES.find((x) => x.id === shelf)!.test;
    return tryable
      .filter((p) => test(p) && terms.every((t) => `${p.name} ${p.category} ${p.mood}`.toLowerCase().includes(t)))
      .sort((a, b) => a.trending - b.trending)
      .slice(0, 48);
  }, [query, shelf]);

  // Lookbook: step through the shelf on its own, one necklace every few seconds.
  useEffect(() => {
    if (!autoplay || !picks.length) return;
    const t = setInterval(() => {
      setSlug((cur) => picks[(picks.findIndex((p) => p.slug === cur) + 1) % picks.length].slug);
    }, 2600);
    return () => clearInterval(t);
  }, [autoplay, picks]);

  const choose = (next: string) => {
    setAutoplay(false);
    setSlug(next);
  };

  const surprise = () => {
    const pool = picks.length > 1 ? picks : tryable;
    let next = product.slug;
    while (next === product.slug) next = pool[Math.floor(Math.random() * pool.length)].slug;
    choose(next);
    sparkleBurst(stageRef.current, 10);
  };

  const layerThis = () => {
    if (layers.includes(product.slug) || layers.length >= MAX_LAYERS) return;
    setLayers((l) => [...l, product.slug]);
    showToast("Layered! Now pick another necklace to wear with it");
  };

  const mirrored = source === "camera";

  // If the model photo can't load, fall back to the illustration.
  const onSampleError = () => {
    if (modelRef.current === ILLUSTRATED_MODEL) return;
    modelRef.current = ILLUSTRATED_MODEL;
    setModel(ILLUSTRATED_MODEL);
    neckRef.current = ILLUSTRATED_MODEL.neck!;
  };

  // Match the stage to the picture's shape (the camera uses a fixed 4:3 stage).
  const dims = source === "sample" ? model : source === "photo" ? photoDims : null;
  const stageStyle = dims
    ? { aspectRatio: `${dims.w} / ${dims.h}`, maxWidth: `calc(72vh * ${(dims.w / dims.h).toFixed(4)})` }
    : undefined;

  return (
    <div className={`container page-enter ${styles.page}`}>
      <header className={styles.head}>
        <h1 className={styles.title}>
          Virtual Try-On <span aria-hidden>✦</span>
        </h1>
        <p className={styles.subtitle}>
          See any of our {tryable.length.toLocaleString("en-US")} necklaces on you, live. Pose and face tracking run entirely in your
          browser: your camera and photos never leave your device.
        </p>
      </header>

      <div className={styles.layout}>
        <section className={styles.stageCol}>
          <div className={styles.modes} role="tablist" aria-label="Try-on source">
            <button role="tab" aria-selected={source === "sample"} className={source === "sample" ? styles.modeOn : ""} onClick={showSample}>
              Sample model
            </button>
            <button role="tab" aria-selected={source === "camera"} className={source === "camera" ? styles.modeOn : ""} onClick={startCamera}>
              Live camera
            </button>
            <label role="tab" aria-selected={source === "photo"} className={source === "photo" ? styles.modeOn : ""}>
              Upload photo
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => onPhoto(e.target.files?.[0])} />
            </label>
          </div>

          <div ref={stageRef} className={`${styles.stage} ${source === "camera" ? styles.stageCamera : ""}`} style={stageStyle}>
            {/* eslint-disable @next/next/no-img-element */}
            {source === "sample" && (
              <img
                ref={imgRef}
                key={model.src}
                src={model.src}
                alt={model.alt}
                className={styles.media}
                onLoad={detectImage}
                onError={onSampleError}
              />
            )}
            {source === "photo" && photoUrl && (
              <img ref={imgRef} src={photoUrl} alt="Your photo" className={styles.media} onLoad={detectImage} />
            )}
            {/* eslint-enable @next/next/no-img-element */}
            <video
              ref={videoRef}
              className={`${styles.media} ${mirrored ? styles.mirror : ""}`}
              hidden={source !== "camera"}
              playsInline
              muted
            />
            <canvas ref={canvasRef} className={`${styles.media} ${styles.overlay} ${mirrored ? styles.mirror : ""}`} />

            {status.kind !== "idle" && (
              <div className={`${styles.status} ${styles[status.kind]}`} role="status">
                {(status.kind === "loading" || status.kind === "searching") && <span className={styles.spinner} aria-hidden />}
                {status.kind === "tracking" && <span className={styles.liveDot} aria-hidden />}
                {status.text}
              </div>
            )}
            {status.kind === "error" && (
              <div className={styles.errorActions}>
                <button className={styles.ghostBtn} onClick={showSample}>
                  Use sample model
                </button>
              </div>
            )}

            <button className={styles.snap} onClick={snapshot} aria-label="Save a snapshot">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                <circle cx="12" cy="13" r="3.5" />
              </svg>
            </button>
          </div>

          {source === "sample" && model.credit && <p className={styles.credit}>{model.credit}</p>}

          <div className={styles.controls}>
            <label className={styles.slider}>
              <span>Size</span>
              <input type="range" min={0.6} max={1.6} step={0.05} value={size} onChange={(e) => setSize(+e.target.value)} />
            </label>
            <div className={styles.metals} role="radiogroup" aria-label="Metal finish">
              {(Object.keys(METALS) as Metal[]).map((m) => (
                <button
                  key={m}
                  role="radio"
                  aria-checked={metal === m}
                  className={`${styles.metal} ${styles[m]} ${metal === m ? styles.metalOn : ""}`}
                  onClick={() => setMetal(m)}
                  title={METALS[m].label}
                  aria-label={METALS[m].label}
                />
              ))}
            </div>
          </div>
        </section>

        <aside className={styles.panel}>
          <div className={`${styles.current} tone-${product.tone} ${product.gold ? styles.currentGold : ""}`} key={product.slug}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={artUri(product.design, { metal })} alt="" />
            <div>
              <p className={styles.currentName}>{product.name}</p>
              <p className={styles.currentPrice}>{formatPrice(product.price)}</p>
              <Link href={`/product/${product.slug}/`} className={styles.details}>
                View details <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          <button className={`btn btn-block ${styles.addBtn} ${added ? styles.addDone : ""}`} onClick={onAdd}>
            {added ? (
              <>
                <CheckIcon size={24} /> Added!
              </>
            ) : (
              <>
                <BagIcon size={24} /> Add to Cart
              </>
            )}
          </button>

          <div className={styles.layering}>
            <button
              className={styles.layerBtn}
              onClick={layerThis}
              disabled={layers.includes(product.slug) || layers.length >= MAX_LAYERS}
            >
              <span aria-hidden>＋</span> Layer this
            </button>
            {layers.length > 0 ? (
              <ul className={styles.layerList} aria-label="Also wearing">
                {layers.map((l) => {
                  const p = getProduct(l)!;
                  return (
                    <li key={l} className={styles.layerChip}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image} alt="" />
                      <span>{p.name}</span>
                      <button onClick={() => setLayers((all) => all.filter((x) => x !== l))} aria-label={`Take off ${p.name}`}>
                        ×
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className={styles.layerHint}>Wear up to three necklaces at once: layer this one, then pick another.</p>
            )}
          </div>

          <div className={styles.shelves} role="tablist" aria-label="Necklaces to try">
            {SHELVES.map((x) => (
              <button
                key={x.id}
                role="tab"
                aria-selected={shelf === x.id}
                className={`${styles.shelf} ${shelf === x.id ? styles.shelfOn : ""}`}
                onClick={() => setShelf(x.id)}
              >
                {x.label}
              </button>
            ))}
          </div>
          <div className={styles.playRow}>
            <button className={styles.playBtn} onClick={surprise}>
              <span aria-hidden>✦</span> Surprise me
            </button>
            <button className={`${styles.playBtn} ${autoplay ? styles.playOn : ""}`} onClick={() => setAutoplay((a) => !a)} aria-pressed={autoplay}>
              <span aria-hidden>{autoplay ? "❚❚" : "▶"}</span> {autoplay ? "Pause lookbook" : "Play lookbook"}
            </button>
          </div>

          <label className={styles.search}>
            <span className="sr-only">Find necklaces to try</span>
            <input
              type="search"
              placeholder="Search: “temple”, “ruby cuban”, “lockets”…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <ul className={styles.picks}>
            {picks.map((p) => (
              <li key={p.slug}>
                <button
                  className={`${styles.pick} tone-${p.tone} ${p.gold ? styles.pickGold : ""} ${p.slug === product.slug ? styles.pickOn : ""} ${layers.includes(p.slug) ? styles.pickLayered : ""}`}
                  onClick={() => choose(p.slug)}
                  title={p.name}
                  aria-label={`Try ${p.name}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt="" loading="lazy" />
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
