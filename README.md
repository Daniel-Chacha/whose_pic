# WhosePic

Upload photos, label faces, and search every image a person appears in.

A face-recognition photo album: detect faces with InsightFace (`buffalo_l`), store ArcFace embeddings in **Neon Postgres** (pgvector), keep image blobs in **Azure Blob Storage**, and search by person via exact label join + cosine similarity.

## Stack

- **Backend** — FastAPI (Python 3.12), InsightFace, asyncpg, azure-storage-blob
- **Frontend** — Next.js 15 (App Router, TypeScript), Tailwind, **Auth.js v5** (NextAuth)
- **Database** — Neon Postgres with the `vector` extension
- **Storage** — Azure Blob Storage (private container, SAS-signed read URLs)
- **Container** — Dockerfile bakes the model weights into the backend image

## Layout

- [backend/](backend/) — FastAPI service, ML pipeline, Dockerfile
- [frontend/](frontend/) — Next.js web app + Auth.js
- [db/migrations/](db/migrations/) — SQL schema + pgvector functions

## One-time setup

### 1. Create a Neon project

In [Neon](https://neon.tech) create a project, copy the connection string (with `sslmode=require`). This is `DATABASE_URL` for both the backend and the frontend (Auth.js's adapter writes to it).

### 2. Create an Azure Storage account + container

In the Azure portal, create a Storage account, then a container named `images` (private — no public access). Copy the connection string from "Access keys".

### 3. Apply migrations

In order, against your Neon database:

```sh
psql "$DATABASE_URL" -f db/migrations/0001_users.sql   # Auth.js schema + hashed_password
psql "$DATABASE_URL" -f db/migrations/0002_app.sql     # images, faces, labels, HNSW index
psql "$DATABASE_URL" -f db/migrations/0003_functions.sql # pgvector helper functions
```

### 4. Configure env

```sh
cp .env.example .env
# fill in DATABASE_URL, AZURE_STORAGE_CONNECTION_STRING, BACKEND_JWT_SECRET (any long random string)

cp frontend/.env.local.example frontend/.env.local
# fill in DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, BACKEND_JWT_SECRET (must match), NEXT_PUBLIC_API_BASE_URL
```

`BACKEND_JWT_SECRET` must be identical in both files — the Next.js `/api/token` bridge mints HS256 JWTs that FastAPI verifies with the same secret.

## Run

### Backend

```sh
docker compose up --build
```

The first build pre-downloads ~280 MB of buffalo_l weights into the image. Sanity check: `curl http://localhost:8000/health`.

### Frontend

```sh
cd frontend
npm install
npm run dev
```

Open <http://localhost:3000>.

## Auth flow

1. User signs up / signs in at `/login` (Auth.js Credentials provider; passwords stored as bcrypt hashes in `users.hashed_password`).
2. Auth.js issues a JWT session cookie and writes the user into the `users` table on Neon.
3. When the browser needs to call FastAPI, [src/lib/api.ts](frontend/src/lib/api.ts) hits `/api/token`, which checks the Auth.js session server-side and mints a 15-minute HS256 JWT signed with `BACKEND_JWT_SECRET`.
4. `apiFetch` attaches that JWT as `Authorization: Bearer <token>`. FastAPI's [app/security.py](backend/app/security.py) verifies it locally — no DB round-trip per request.

The frontend and backend share only one secret (`BACKEND_JWT_SECRET`); Auth.js's cookie is opaque to FastAPI.

## End-to-end smoke test

1. Sign up at `/login`.
2. Upload 3 photos of person A and 2 of person B at `/upload`.
3. On the first photo of A, click the bounding box and label "Alice".
4. Open the second photo of A — you should see a "Suggestion: Alice" strip; click to confirm.
5. Repeat for B.
6. Visit `/people/{alice_id}` — Labelled tab shows confirmed photos; Suggested tab shows similar unlabelled candidates.
7. Sign in as a second user — gallery is empty; direct image URLs from user 1 return 404.

## API summary

All require `Authorization: Bearer <jwt>` except `/health`.

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/health` | liveness |
| GET | `/me` | returns `{user_id}` from the verified JWT |
| POST | `/images` | multipart upload → detect → persist |
| GET | `/images` | list caller's images |
| GET | `/images/{id}` | image with faces + label names |
| DELETE | `/images/{id}` | cascade-delete + Azure blob cleanup |
| POST | `/faces/{id}/label` | `{label_id}` or `{name}` |
| DELETE | `/faces/{id}/label` | clear |
| GET | `/faces/{id}/suggestions?k=5` | k-NN labels above similarity threshold |
| GET | `/labels` | with `face_count` + `cover_url` |
| POST | `/labels` | create empty |
| PATCH | `/labels/{id}` | rename or set `cover_face_id` |
| DELETE | `/labels/{id}` | unset on faces, delete |
| GET | `/labels/{id}/images?mode=labeled\|suggested\|both&threshold=0.5` | search |

## Privacy

Face embeddings are biometric data. Per-user isolation:

1. The backend always derives `owner_id` from the verified JWT — never from a client-supplied field.
2. Every SQL filters by `owner_id`.
3. Azure Blob URLs are SAS-signed with short TTLs; the container itself is private.

## Tuning

- **Similarity threshold** (default 0.5) — set via `SIMILARITY_THRESHOLD` env var or per-request `?threshold=` query param.
- **Detection input size** — `DET_SIZE=640` is the default; bigger (e.g. 960) catches smaller faces at the cost of latency.
- **GPU** — set `ONNX_PROVIDERS=CUDAExecutionProvider,CPUExecutionProvider` and use a CUDA base image.

## Plan reference

The implementation plan lives at `~/.claude/plans/i-want-the-backend-compiled-kay.md` (originally written against Supabase; this README documents the migrated stack).
