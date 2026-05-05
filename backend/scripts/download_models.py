"""Pre-pull the InsightFace buffalo_l weights into INSIGHTFACE_HOME.

Run during the Docker build so the runtime image is self-contained and
doesn't depend on InsightFace's download endpoint at first boot.
"""

import os
import sys

from insightface.app import FaceAnalysis


def main() -> int:
    root = os.environ.get("INSIGHTFACE_HOME", "/models")
    print(f"[download_models] downloading buffalo_l into {root}", flush=True)
    app = FaceAnalysis(
        name="buffalo_l",
        root=root,
        providers=["CPUExecutionProvider"],
        allowed_modules=["detection", "recognition"],
    )
    app.prepare(ctx_id=-1, det_size=(640, 640))
    print("[download_models] done", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
