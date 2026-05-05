# Database setup (Neon Postgres)

## 1. Create a Neon project

Sign in to [Neon](https://neon.tech), create a project, copy the connection string. You'll get something like:

```text
postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
```

This becomes `DATABASE_URL` in `.env` (used by FastAPI) and `frontend/.env.local` (used by Auth.js).

> Neon ships with the `vector` extension. The migrations enable it via `create extension if not exists vector;`.

## 2. Apply migrations

Run in order against your Neon database:

```sh
psql "$DATABASE_URL" -f db/migrations/0001_users.sql
psql "$DATABASE_URL" -f db/migrations/0002_app.sql
psql "$DATABASE_URL" -f db/migrations/0003_functions.sql
```

Or paste each file into the Neon SQL editor.

## What's in each file

- [migrations/0001_users.sql](migrations/0001_users.sql) — Auth.js (NextAuth v5) `users`, `accounts`, `sessions`, `verification_token` plus a `hashed_password` column on `users` for the credentials provider. Enables `vector` and `pgcrypto` extensions.
- [migrations/0002_app.sql](migrations/0002_app.sql) — App tables: `labels`, `images`, `faces`. Faces have a 512-dim `vector` embedding column with an HNSW index over cosine distance.
- [migrations/0003_functions.sql](migrations/0003_functions.sql) — pgvector helpers: `search_label_suggested` (centroid k-NN), `suggest_labels_for_face` (inverse k-NN), `list_labels_with_counts` (label list with face counts and cover thumb).
