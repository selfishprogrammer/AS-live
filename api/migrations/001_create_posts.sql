-- Migration: 001_create_posts.sql
-- Creates the posts table.
-- Raw SQL (not an ORM migration). Run this in the Supabase SQL editor
-- or via the Supabase CLI: `supabase db execute --file api/migrations/001_create_posts.sql`

CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index to keep "newest posts for a given user" queries fast.
CREATE INDEX posts_user_id_created_at_idx
  ON posts (user_id, created_at DESC);

-- Defense in depth: enable Row Level Security so that even a leaked
-- anon key cannot read or write another user's rows directly.
-- The API authenticates every request and scopes by user_id, but RLS
-- guarantees isolation at the database layer as well.
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Owners can read their own posts.
CREATE POLICY posts_select_own
  ON posts FOR SELECT
  USING (auth.uid() = user_id);

-- Owners can insert posts for themselves only.
CREATE POLICY posts_insert_own
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);
