export type BBox = { x: number; y: number; w: number; h: number };

export type Face = {
  id: string;
  image_id: string;
  label_id: string | null;
  label_name: string | null;
  bbox: BBox;
  det_score: number | null;
  created_at: string;
};

export type ImageRow = {
  id: string;
  storage_path: string;
  width: number | null;
  height: number | null;
  mime_type: string | null;
  created_at: string;
  signed_url: string | null;
};

export type ImageWithFaces = ImageRow & { faces: Face[] };

export type Label = {
  id: string;
  name: string;
  cover_face_id: string | null;
  cover_url: string | null;
  face_count: number;
  created_at: string;
};

export type LabelSuggestion = {
  label_id: string;
  name: string;
  score: number;
  sample_face_id: string | null;
};

export type LabelSearchResponse = {
  labeled?: ImageRow[];
  suggested?: ImageRow[];
};
