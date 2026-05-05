from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Neon Postgres
    DATABASE_URL: str

    # Azure Blob Storage
    AZURE_STORAGE_CONNECTION_STRING: str
    AZURE_STORAGE_CONTAINER: str = "images"

    # Backend JWT (HS256), shared with the frontend's /api/token endpoint
    BACKEND_JWT_SECRET: str

    # ML / runtime tuning
    INSIGHTFACE_HOME: str = "/models"
    ONNX_PROVIDERS: str = "CPUExecutionProvider"
    DET_SIZE: int = 640
    MAX_UPLOAD_MB: int = 10
    SIGNED_URL_TTL_SECONDS: int = 3600
    SIMILARITY_THRESHOLD: float = 0.5

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000"

    @property
    def onnx_providers_list(self) -> list[str]:
        return [p.strip() for p in self.ONNX_PROVIDERS.split(",") if p.strip()]

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
