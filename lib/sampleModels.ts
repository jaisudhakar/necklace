import { asset } from "./basePath";
import type { Neck } from "./tryon";

export type SampleModel = {
  src: string;
  /** Natural image size in pixels. */
  w: number;
  h: number;
  alt: string;
  credit?: string;
  /**
   * Base of the neck in image pixels. Measured once with the pose + face models
   * (neckFromLandmarks in lib/tryon.ts) so the sample shows instantly without
   * downloading the models. Leave it out after swapping the photo and the
   * try-on will detect it at runtime instead.
   */
  neck?: Neck;
};

/** Default try-on model (photo used with the model's permission). */
export const PHOTO_MODEL: SampleModel = {
  src: asset("/try-on/model.jpg"),
  w: 415,
  h: 739,
  alt: "Sample model",
  credit: "Model photo used with permission",
  neck: { x: 197.6, y: 356.7, width: 99, angle: 0.079 },
};

/** Illustrated fallback, used if the photo fails to load. */
export const ILLUSTRATED_MODEL: SampleModel = {
  src: asset("/try-on/sample-model.svg"),
  w: 900,
  h: 1000,
  alt: "Illustrated sample model",
  neck: { x: 450, y: 748, width: 128, angle: 0 },
};
