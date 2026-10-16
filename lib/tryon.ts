// Virtual try-on engine for necklaces. Loads Google's MediaPipe Pose Landmarker
// (shoulders) and Face Landmarker (chin, jaw), estimates where the base of the
// neck is, and draws the necklace there with a little pendulum swing.

import type { FaceLandmarker, NormalizedLandmark, PoseLandmarker } from "@mediapipe/tasks-vision";
import { asset } from "./basePath";

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
  /** Centre of the necklace's two chain ends (the base of the neck), in source pixels. */
  x: number;
  y: number;
  /** Distance between the chain ends: roughly the neck's width. */
  width: number;
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
  if (face) {
    faceH = dist(F(10), F(152));
    faceW = dist(F(234), F(454));
    const eL = F(33);
    const eR = F(263);
    roll = Math.atan2(eR.y - eL.y, eR.x - eL.x);
  } else if (pose) {
    // No face mesh: extrapolate the chin from nose and mouth.
    const mouth = mid(Pp(9), Pp(10));
    const nose = Pp(0);
    chin = { x: mouth.x + (mouth.x - nose.x) * 0.9, y: mouth.y + (mouth.y - nose.y) * 0.9 };
  }
  if (!chin) return null;

  const shouldersVisible = pose && (pose[11].visibility ?? 1) > 0.5 && (pose[12].visibility ?? 1) > 0.5;
  if (shouldersVisible) {
    const [a, b] = [Pp(11), Pp(12)].sort((p, q) => p.x - q.x);
    const S = dist(a, b);
    const M = mid(a, b);
    const shoulderAngle = Math.atan2(b.y - a.y, b.x - a.x);
    return {
      x: chin.x + (M.x - chin.x) * 0.25,
      y: chin.y + (M.y - chin.y) * 0.55,
      width: S * 0.34,
      angle: shoulderAngle * 0.5 + roll * 0.2,
    };
  }
  if (!faceH) return null;
  return { x: chin.x, y: chin.y + faceH * 0.22, width: faceW * 0.62, angle: roll * 0.5 };
}

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
  /** Artwork width / height, and the two chain ends as 0..1 fractions of the artwork. */
  ratio: number;
  ends: [Pt, Pt];
  size: number;
};

/** Pixel width of the whole artwork for a given neck (the chain ends span the neck). */
export const artWidth = (neck: Neck, spec: DrawSpec) => (neck.width / (spec.ends[1].x - spec.ends[0].x)) * spec.size;

/** Draws the necklace with its chain ends at the sides of the neck. */
export function drawNecklace(ctx: CanvasRenderingContext2D, neck: Neck, spec: DrawSpec, swing: number) {
  if (!spec.img.complete || !spec.img.naturalWidth) return;
  const w = artWidth(neck, spec);
  const h = w / spec.ratio;
  const top = spec.ends[0].y;
  ctx.save();
  ctx.translate(neck.x, neck.y);
  // A necklace rests on the chest, so it swings far less than an earring.
  ctx.rotate(neck.angle + swing * 0.35);
  ctx.shadowColor = "rgba(40, 10, 30, 0.35)";
  ctx.shadowBlur = w * 0.02;
  ctx.shadowOffsetY = w * 0.012;
  ctx.drawImage(spec.img, -0.5 * w, -top * h, w, h);
  ctx.restore();
}
