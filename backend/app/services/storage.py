"""Azure Blob Storage helpers — upload bytes, mint SAS read URLs, delete."""

from datetime import datetime, timedelta, timezone
from functools import lru_cache

from azure.storage.blob import (
    BlobSasPermissions,
    BlobServiceClient,
    ContentSettings,
    generate_blob_sas,
)

from app.config import get_settings


@lru_cache
def _service_client() -> BlobServiceClient:
    return BlobServiceClient.from_connection_string(get_settings().AZURE_STORAGE_CONNECTION_STRING)


def _container():
    return _service_client().get_container_client(get_settings().AZURE_STORAGE_CONTAINER)


def upload_image_bytes(user_id: str, image_uuid: str, ext: str, data: bytes, content_type: str) -> str:
    """Upload raw bytes; return the blob path (key within the container)."""
    path = f"{user_id}/{image_uuid}.{ext}"
    _container().upload_blob(
        name=path,
        data=data,
        overwrite=False,
        content_settings=ContentSettings(content_type=content_type),
    )
    return path


def signed_url(blob_path: str, ttl_seconds: int | None = None) -> str:
    settings = get_settings()
    ttl = ttl_seconds if ttl_seconds is not None else settings.SIGNED_URL_TTL_SECONDS
    svc = _service_client()
    sas = generate_blob_sas(
        account_name=svc.account_name,
        container_name=settings.AZURE_STORAGE_CONTAINER,
        blob_name=blob_path,
        account_key=svc.credential.account_key,
        permission=BlobSasPermissions(read=True),
        expiry=datetime.now(tz=timezone.utc) + timedelta(seconds=ttl),
    )
    return f"{svc.url}{settings.AZURE_STORAGE_CONTAINER}/{blob_path}?{sas}"


def delete_object(blob_path: str) -> None:
    try:
        _container().delete_blob(blob_path)
    except Exception:  # noqa: BLE001
        pass
