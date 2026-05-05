-- WhosePic app schema: images, faces (with 512-dim ArcFace embeddings), labels.
-- Embeddings are L2-normalized at insertion so cosine distance == 1 - dot product.
-- No RLS: the FastAPI backend is the sole DB writer and always scopes by owner_id.

create table labels (
    id            uuid primary key default gen_random_uuid(),
    owner_id      uuid not null references users(id) on delete cascade,
    name          text not null,
    cover_face_id uuid,
    created_at    timestamptz not null default now(),
    unique (owner_id, name)
);

create table images (
    id           uuid primary key default gen_random_uuid(),
    owner_id     uuid not null references users(id) on delete cascade,
    blob_path    text not null,                       -- "{owner_id}/{uuid}.{ext}" within the Azure container
    width        int,
    height       int,
    mime_type    text,
    created_at   timestamptz not null default now()
);
create index images_owner_created_idx on images (owner_id, created_at desc);

create table faces (
    id         uuid primary key default gen_random_uuid(),
    owner_id   uuid not null references users(id) on delete cascade,
    image_id   uuid not null references images(id) on delete cascade,
    label_id   uuid references labels(id) on delete set null,
    bbox       jsonb not null,                        -- {x,y,w,h} normalized 0..1
    det_score  real,
    embedding  vector(512) not null,                  -- ArcFace, L2-normalized
    created_at timestamptz not null default now()
);
create index faces_owner_idx on faces (owner_id);
create index faces_image_idx on faces (image_id);
create index faces_label_idx on faces (label_id);

alter table labels
    add constraint labels_cover_fk
    foreign key (cover_face_id) references faces(id) on delete set null;

create index faces_embedding_hnsw
    on faces using hnsw (embedding vector_cosine_ops)
    with (m = 16, ef_construction = 64);
