// Virtual try-on engine for necklaces. Loads Google's MediaPipe Pose Landmarker
// (shoulders) and Face Landmarker (chin, jaw), estimates where the base of the
// neck is, and draws the necklace there with a little pendulum swing.

import type { FaceLandmarker, NormalizedLandmark, PoseLandmarker } from "@mediapipe/tasks-vision";
import { asset } from "./basePath";
import type { StyleId } from "./design";

const MODELS = "https://storage.googleapis.com/mediapipe-models";
/** Hosted models, fetched at runtime: pose (~5.8 MB) and face (~3.6 MB). */
export const POSE_MODEL_URL = `${MODELS}/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`;
export const FACE_MODEL_URL = `${MODELS}/face_landmarker/face_landmarker/float16/1/face_landmarker.task`;

/** WebAssembly runtime, copied from node_modules into public/ by scripts/copy-mediapipe.mjs. */
export const WASM_BASE = asset("/mediapipe/wasm");

export type Trackers = { pose: PoseLandmarker; face: FaceLandmarker };
let trackers: Promise<Trackers> | null = null;

/** Lazily creates the shared pose + face trackers (GPU when available, CPU otherwise). */
export function loadTrackers() {
  trackers ??= (async () => {
    const { FaceLandmarker, PoseLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
    const fileset = await FilesetResolver.forVisionTasks(WASM_BASE);
    const withFallback = async <T,>(make: (d: "GPU" | "CPU") => Promise<T>) => {
      try {
        return await make("GPU");
      } catch {
        return await make("CPU");
      }
    };
    const [pose, face] = await Promise.all([
      withFallback((delegate) =>
        PoseLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: POSE_MODEL_URL, delegate },
          runningMode: "VIDEO",
          numPoses: 1,
        }),
      ),
      withFallback((delegate) =>
        FaceLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: FACE_MODEL_URL, delegate },
          runningMode: "VIDEO",
          numFaces: 1,
        }),
      ),
    ]);
    return { pose, face };
  })();
  trackers.catch(() => (trackers = null)); // allow a retry after a network error
  return trackers;
}

export async function setMode(t: Trackers, mode: "IMAGE" | "VIDEO") {
  await Promise.all([t.pose.setOptions({ runningMode: mode }), t.face.setOptions({ runningMode: mode })]);
}

type Pt = { x: number; y: number };

export type Neck = {
  /** Front of the throat at the base of the neck (where a pendant hangs), in source pixels. */
  x: number;
  y: number;
  /**
   * Distance from the front to each side of the neck. They differ when the head
   * is turned: the far side is foreshortened, the near side shows more of the neck.
   */
  left: number;
  right: number;
  /** Tilt in radians (follows the shoulders and head). */
  angle: number;
};

const mid = (a: Pt, b: Pt) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

/**
 * Estimates the base of the neck. Uses the shoulders when they're visible
 * (neck ≈ a third of shoulder width, sitting a little over halfway from chin to
 * shoulder line); otherwise falls back to proportions of the face.
 */
export function neckFromLandmarks(
  face: NormalizedLandmark[] | undefined,
  pose: NormalizedLandmark[] | undefined,
  w: number,
  h: number,
): Neck | null {
  const F = (i: number) => ({ x: face![i].x * w, y: face![i].y * h });
  const Pp = (i: number) => ({ x: pose![i].x * w, y: pose![i].y * h });

  let chin: Pt | null = face ? F(152) : null;
  let roll = 0;
  let faceH = 0;
  let faceW = 0;
  // Head turn: where the nose sits between the face edges (0.5 = facing the camera).
  let turn = 0;
  if (face) {
    faceH = dist(F(10), F(152));
    faceW = dist(F(234), F(454));
    const eL = F(33);
    const eR = F(263);
    roll = Math.atan2(eR.y - eL.y, eR.x - eL.x);
    const a = F(234);
    const b = F(454);
    const n = F(1);
    const t = ((n.x - a.x) * (b.x - a.x) + (n.y - a.y) * (b.y - a.y)) / (faceW * faceW || 1);
    turn = Math.max(-0.6, Math.min(0.6, (0.5 - t) * 1.6));
  } else if (pose) {
    // No face mesh: extrapolate the chin from nose and mouth.
    const mouth = mid(Pp(9), Pp(10));
    const nose = Pp(0);
    chin = { x: mouth.x + (mouth.x - nose.x) * 0.9, y: mouth.y + (mouth.y - nose.y) * 0.9 };
  }
  if (!chin) return null;

  // Split the neck width around the throat: a turned head (turn > 0 means the
  // face points toward the image's left) hides the far side and shows more of the near one.
  const split = (width: number) => ({ left: (width / 2) * (1 - turn), right: (width / 2) * (1 + turn) });

  const shouldersVisible = pose && (pose[11].visibility ?? 1) > 0.5 && (pose[12].visibility ?? 1) > 0.5;
  if (shouldersVisible) {
    const [a, b] = [Pp(11), Pp(12)].sort((p, q) => p.x - q.x);
    const S = dist(a, b);
    const M = mid(a, b);
    const shoulderAngle = Math.atan2(b.y - a.y, b.x - a.x);
    // The throat sits under the chin; the shoulders only pull it slightly.
    return {
      x: chin.x + (M.x - chin.x) * 0.1,
      y: chin.y + (M.y - chin.y) * 0.62,
      ...split(S * 0.36),
      angle: shoulderAngle * 0.5 + roll * 0.2,
    };
  }
  if (!faceH) return null;
  return { x: chin.x, y: chin.y + faceH * 0.26, ...split(faceW * 0.64), angle: roll * 0.5 };
}

/** How each style sits: chokers hug the neck, collars sit at its base, the rest drape from it. */
export const STYLE_FIT: Partial<Record<StyleId, { lift: number; width: number }>> = {
  choker: { lift: 0.42, width: 0.9 },
  collar: { lift: 0.12, width: 1 },
};

/** Damped pendulum driven by the neck's sideways acceleration (the pendant swings as you move). */
export class Pendulum {
  angle = 0;
  private vel = 0;
  private lastX: number | null = null;
  private lastVx = 0;

  step(x: number, dt: number, length: number, breeze = 0) {
    dt = Math.min(dt, 0.05);
    if (this.lastX === null || dt <= 0) {
      this.lastX = x;
      return this.angle;
    }
    const vx = (x - this.lastX) / dt;
    const ax = (vx - this.lastVx) / dt;
    this.lastX = x;
    this.lastVx = vx;
    const L = Math.max(length, 40);
    const g = 2600;
    const acc = (-g * Math.sin(this.angle) - ax * Math.cos(this.angle) * 0.5) / L - 3.6 * this.vel + breeze;
    this.vel += acc * dt;
    this.angle = Math.max(-0.35, Math.min(0.35, this.angle + this.vel * dt));
    return this.angle;
  }
}

export type DrawSpec = {
  img: HTMLImageElement;
  style: StyleId;
  /** Artwork width / height, and the two chain ends as 0..1 fractions of the artwork. */
  ratio: number;
  ends: [Pt, Pt];
  size: number;
};

const span = (spec: DrawSpec) => spec.ends[1].x - spec.ends[0].x;

/** Pixel width of the whole artwork for a given neck (the chain ends span the neck). */
export const artWidth = (neck: Neck, spec: DrawSpec) =>
  ((neck.left + neck.right) / span(spec)) * spec.size * (STYLE_FIT[spec.style]?.width ?? 1);

let scratch: HTMLCanvasElement | null = null;

/**
 * Draws the necklace with its chain ends at the sides of the neck. The two
 * halves are scaled separately so the necklace wraps a turned neck, and the
 * top of the chain fades out as if it passes behind the neck.
 */
export function drawNecklace(ctx: CanvasRenderingContext2D, neck: Neck, spec: DrawSpec, swing: number) {
  const img = spec.img;
  if (!img.complete || !img.naturalWidth) return;
  const fit = STYLE_FIT[spec.style];
  const w = artWidth(neck, spec);
  const h = w / spec.ratio;
  // Artwork pixels per unit of the 300-wide drawing space.
  const scale = w / 300;
  // Half-widths of the artwork on each side of the throat.
  const wl = w * (neck.left / (neck.left + neck.right));
  const wr = w - wl;

  // Render into a scratch canvas so the chain's top can be faded independently.
  scratch ??= document.createElement("canvas");
  const sw = Math.ceil(w) + 2;
  const sh = Math.ceil(h) + 2;
  if (scratch.width < sw || scratch.height < sh) {
    scratch.width = Math.max(scratch.width, sw);
    scratch.height = Math.max(scratch.height, sh);
  }
  const g = scratch.getContext("2d")!;
  g.clearRect(0, 0, scratch.width, scratch.height);
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  g.drawImage(img, 0, 0, iw / 2, ih, 0, 0, wl, h);
  g.drawImage(img, iw / 2, 0, iw / 2, ih, wl, 0, wr, h);
  // Fade out the part of the chain above the neck sides (it goes round the back of the neck).
  const top = spec.ends[0].y * h;
  const fadeEnd = top + scale * 26;
  g.globalCompositeOperation = "destination-out";
  const grad = g.createLinearGradient(0, 0, 0, fadeEnd);
  grad.addColorStop(0, "rgba(0,0,0,1)");
  grad.addColorStop(Math.min(0.95, (top + scale * 4) / fadeEnd), "rgba(0,0,0,0.95)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, sw, fadeEnd);
  g.globalCompositeOperation = "source-over";

  ctx.save();
  ctx.translate(neck.x, neck.y - (fit?.lift ?? 0) * (neck.left + neck.right));
  // A necklace rests on the chest, so it swings far less than an earring.
  ctx.rotate(neck.angle + swing * 0.35);
  ctx.shadowColor = "rgba(40, 10, 30, 0.35)";
  ctx.shadowBlur = w * 0.02;
  ctx.shadowOffsetY = w * 0.012;
  ctx.drawImage(scratch, 0, 0, sw, sh, -wl, -top, sw, sh);
  ctx.restore();
}
