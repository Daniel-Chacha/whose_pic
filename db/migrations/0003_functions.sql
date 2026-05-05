-- Postgres functions invoked from the backend over asyncpg.
-- All take p_owner explicitly; the backend always passes the verified user_id.

create or replace function search_label_suggested(
    p_owner uuid,
    p_label uuid,
    p_threshold real default 0.5,
    p_limit int default 200
) returns table (
    image_id uuid,
    score real
) language plpgsql stable as $$
declare
    centroid vector(512);
begin
    select (sum(embedding) / count(*))::vector(512)
      into centroid
      from faces
     where owner_id = p_owner and label_id = p_label;

    if centroid is null then
        return;
    end if;

    return query
    select f.image_id,
           max(1 - (f.embedding <=> centroid))::real as score
      from faces f
     where f.owner_id = p_owner
       and (f.label_id is distinct from p_label)
       and (1 - (f.embedding <=> centroid)) > p_threshold
     group by f.image_id
     order by score desc
     limit p_limit;
end
$$;

create or replace function suggest_labels_for_face(
    p_owner uuid,
    p_face uuid,
    p_k int default 5,
    p_threshold real default 0.5
) returns table (
    label_id uuid,
    name text,
    score real,
    sample_face_id uuid
) language plpgsql stable as $$
declare
    target vector(512);
begin
    select embedding into target
      from faces
     where owner_id = p_owner and id = p_face;
    if target is null then
        return;
    end if;

    return query
    with scored as (
        select f.id as fid,
               f.label_id,
               (1 - (f.embedding <=> target))::real as sim
          from faces f
         where f.owner_id = p_owner
           and f.label_id is not null
           and f.id <> p_face
    ),
    best as (
        select label_id,
               max(sim) as score,
               (array_agg(fid order by sim desc))[1] as sample_face_id
          from scored
         where sim > p_threshold
         group by label_id
    )
    select b.label_id,
           l.name,
           b.score,
           b.sample_face_id
      from best b
      join labels l on l.id = b.label_id and l.owner_id = p_owner
     order by b.score desc
     limit p_k;
end
$$;

create or replace function list_labels_with_counts(
    p_owner uuid
) returns table (
    id uuid,
    name text,
    cover_face_id uuid,
    cover_blob_path text,
    face_count bigint,
    created_at timestamptz
) language sql stable as $$
    with counts as (
        select label_id, count(*) as n
          from faces
         where owner_id = p_owner and label_id is not null
         group by label_id
    ),
    fallback as (
        select distinct on (f.label_id)
               f.label_id, f.id as face_id, i.blob_path
          from faces f
          join images i on i.id = f.image_id
         where f.owner_id = p_owner and f.label_id is not null
         order by f.label_id, f.created_at desc
    )
    select l.id,
           l.name,
           coalesce(l.cover_face_id, fb.face_id) as cover_face_id,
           fbi.blob_path as cover_blob_path,
           coalesce(c.n, 0) as face_count,
           l.created_at
      from labels l
      left join counts c on c.label_id = l.id
      left join fallback fb on fb.label_id = l.id
      left join faces fcover on fcover.id = coalesce(l.cover_face_id, fb.face_id)
      left join images fbi on fbi.id = fcover.image_id
     where l.owner_id = p_owner
     order by l.name asc;
$$;
