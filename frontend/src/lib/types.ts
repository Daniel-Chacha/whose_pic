export type BBox = { x: number; y: number; w: number; h: number };

// Lightweight image metadata. The pixels live as a Blob in IndexedDB, keyed by
// `id`; at runtime the store exposes an object URL via `getImageUrl(id)`.
export type ImageMeta = {
  id: string;
  width: number;
  height: number;
  createdAt: number;
};

export type StoredFace = {
  id: string;
  imageId: string;
  bbox: BBox; // normalized [0,1]
  detScore: number;
  descriptor: number[]; // 128-d face-api descriptor
  labelId: string | null;
};

export type StoredLabel = {
  id: string;
  name: string;
  createdAt: number;
};

// A face joined with its label's name, for rendering.
export type FaceView = StoredFace & { labelName: string | null };

export type ImageWithFaces = {
  image: ImageMeta;
  faces: FaceView[];
};

export type LabelWithCount = {
  id: string;
  name: string;
  faceCount: number;
  coverImageId: string | null;
};

export type Suggestion = {
  labelId: string;
  name: string;
  score: number;
  sampleFaceId: string;
};
