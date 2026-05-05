-- Auth.js (NextAuth v5) PostgresAdapter schema + a `hashed_password` column
-- for the credentials provider. Column names use Auth.js's camelCase
-- convention (the adapter expects these names verbatim).

create extension if not exists vector;
create extension if not exists pgcrypto;

create table users (
    id              uuid primary key default gen_random_uuid(),
    name            text,
    email           text unique,
    "emailVerified" timestamptz,
    image           text,
    hashed_password text,
    created_at      timestamptz not null default now()
);

create table accounts (
    id                  uuid primary key default gen_random_uuid(),
    "userId"            uuid not null references users(id) on delete cascade,
    type                text not null,
    provider            text not null,
    "providerAccountId" text not null,
    refresh_token       text,
    access_token        text,
    expires_at          bigint,
    token_type          text,
    scope               text,
    id_token            text,
    session_state       text,
    unique (provider, "providerAccountId")
);
create index accounts_user_idx on accounts ("userId");

create table sessions (
    "sessionToken" text primary key,
    "userId"       uuid not null references users(id) on delete cascade,
    expires        timestamptz not null
);
create index sessions_user_idx on sessions ("userId");

create table verification_token (
    identifier text not null,
    token      text not null,
    expires    timestamptz not null,
    primary key (identifier, token)
);
