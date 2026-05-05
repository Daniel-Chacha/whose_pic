"""InsightFace wrapper.

Loaded once at FastAPI startup via the lifespan event. The blocking `detect`
call is wrapped in `run_in_threadpool` at the call site (router) so the event
loop stays responsive.

We restrict `allowed_modules=['detection','recognition']` to skip the
age/gender/landmark submodels, saving ~200 MB of RAM and shortening warmup.
"""

from dataclasses import dataclass

import numpy as np


@dataclass
class DetectedFace:
    bbox: dict          # normalized {x,y,w,h} in [0,1]
    det_score: float
    embedding: list[float]  # L2-normalized 512-dim ArcFace embedding


class FaceEngine:
    def __init__(
        self,
        model_root: str,
        providers: list[str],
        det_size: int = 640,
        model_name: str = "buffalo_l",
    ) -> None:
        # Lazy import so module loads even if insightface deps aren't yet present
        # (e.g. when running unit tests that don't exercise this class).
        from insightface.app import FaceAnalysis

        self._app = FaceAnalysis(
            name=model_name,
            root=model_root,
            providers=providers,
            allowed_modules=["detection", "recognition"],
        )
        self._det_size = (det_size, det_size)
        self._app.prepare(ctx_id=-1 if "CPUExecutionProvider" in providers else 0, det_size=self._det_size)

    def warmup(self) -> None:
        dummy = np.zeros((self._det_size[1], self._det_size[0], 3), dtype=np.uint8)
        self._app.get(dummy)

    def detect(self, image_bgr: np.ndarray) -> list[DetectedFace]:
        h, w = image_bgr.shape[:2]
        results = self._app.get(image_bgr)
        out: list[DetectedFace] = []
        for f in results:
            x1, y1, x2, y2 = f.bbox.astype(float)
            bbox = {
                "x": max(0.0, x1 / w),
                "y": max(0.0, y1 / h),
                "w": max(0.0, (x2 - x1) / w),
                "h": max(0.0, (y2 - y1) / h),
            }
            emb = np.asarray(f.normed_embedding, dtype=np.float32)
            # InsightFace's `normed_embedding` is L2-normalized already; defensively re-normalize.
            n = float(np.linalg.norm(emb))
            if n > 0:
                emb = emb / n
            out.append(
                DetectedFace(
                    bbox=bbox,
                    det_score=float(f.det_score),
                    embedding=emb.tolist(),
                )
            )
        return out
