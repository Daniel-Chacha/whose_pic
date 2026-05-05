import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.db.client import close_pool, open_pool
from app.routers import faces, health, images, labels
from app.services.face_engine import FaceEngine

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
log = logging.getLogger("whosepic")


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    log.info("opening Neon pool")
    await open_pool()
    log.info("loading face engine (providers=%s, det_size=%d)", settings.onnx_providers_list, settings.DET_SIZE)
    engine = FaceEngine(
        model_root=settings.INSIGHTFACE_HOME,
        providers=settings.onnx_providers_list,
        det_size=settings.DET_SIZE,
    )
    engine.warmup()
    app.state.face_engine = engine
    log.info("face engine ready")
    try:
        yield
    finally:
        app.state.face_engine = None
        await close_pool()


app = FastAPI(title="WhosePic", version="0.1.0", lifespan=lifespan)

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(images.router)
app.include_router(faces.router)
app.include_router(labels.router)
