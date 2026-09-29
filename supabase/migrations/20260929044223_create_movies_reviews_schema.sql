/*
# Create Movie Reviews Schema

## Overview
Creates the core database schema for a professional movie review website.
Public visitors can read published reviews; authenticated admin users can
create, update, and delete reviews. Admin authentication uses Supabase Auth
(email/password). A storage bucket for movie poster images is also created.

## New Tables
- `movies` — stores all movie reviews with full review content, ratings,
  category, and publish status.

## Columns on `movies`
- `id` (uuid, primary key)
- `title` (text, not null) — movie title
- `slug` (text, unique, not null) — SEO-friendly URL slug
- `poster_url` (text) — URL to poster image in Supabase Storage
- `category` (text, not null) — Bollywood, Hollywood, South, Web Series, Netflix, Amazon Prime, Other OTT
- `language` (text) — movie language
- `release_year` (int) — release year
- `genre` (text) — movie genre(s)
- `director` (text) — director name
- `cast_members` (text) — cast members
- `runtime` (text) — movie runtime
- `ott_platform` (text) — OTT platform or theatre info
- `rating` (numeric) — overall rating 0-10
- `story_rating` (numeric) — story rating 0-10
- `acting_rating` (numeric) — acting rating 0-10
- `direction_rating` (numeric) — direction rating 0-10
- `music_rating` (numeric) — music rating 0-10
- `cinematography_rating` (numeric) — cinematography rating 0-10
- `short_description` (text) — short review description for cards
- `full_review` (text) — full written review
- `final_verdict` (text) — final verdict
- `status` (text, default 'draft') — 'published' or 'draft'
- `published_at` (timestamptz) — when the review was published
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())
- `author_id` (uuid, references auth.users) — the admin who created the review

## Security
- RLS enabled on `movies`.
- Public (anon) can SELECT only published reviews.
- Authenticated users can SELECT all reviews (for admin dashboard).
- Authenticated users can INSERT, UPDATE, DELETE any review (admin role).
- A trigger updates `updated_at` on every row change.

## Indexes
- `movies_slug_idx` on `slug`
- `movies_status_idx` on `status`
- `movies_category_idx` on `category`
- `movies_published_at_idx` on `published_at`
- Trigram indexes on title, director, genre, cast_members for fast search

## Storage
- Creates `movie-posters` storage bucket (public) for poster image uploads.
- Policy allows authenticated users to upload/manage posters.
- Policy allows public to read poster images.
*/

-- Enable pg_trgm extension for trigram search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create movies table
CREATE TABLE IF NOT EXISTS movies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  poster_url text,
  category text NOT NULL,
  language text DEFAULT '',
  release_year int,
  genre text DEFAULT '',
  director text DEFAULT '',
  cast_members text DEFAULT '',
  runtime text DEFAULT '',
  ott_platform text DEFAULT '',
  rating numeric(3,1) DEFAULT 0,
  story_rating numeric(3,1) DEFAULT 0,
  acting_rating numeric(3,1) DEFAULT 0,
  direction_rating numeric(3,1) DEFAULT 0,
  music_rating numeric(3,1) DEFAULT 0,
  cinematography_rating numeric(3,1) DEFAULT 0,
  short_description text DEFAULT '',
  full_review text DEFAULT '',
  final_verdict text DEFAULT '',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS movies_slug_idx ON movies (slug);
CREATE INDEX IF NOT EXISTS movies_status_idx ON movies (status);
CREATE INDEX IF NOT EXISTS movies_category_idx ON movies (category);
CREATE INDEX IF NOT EXISTS movies_published_at_idx ON movies (published_at DESC);
CREATE INDEX IF NOT EXISTS movies_title_trgm_idx ON movies USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS movies_director_trgm_idx ON movies USING gin (director gin_trgm_ops);
CREATE INDEX IF NOT EXISTS movies_genre_trgm_idx ON movies USING gin (genre gin_trgm_ops);
CREATE INDEX IF NOT EXISTS movies_cast_trgm_idx ON movies USING gin (cast_members gin_trgm_ops);

-- RLS Policies
-- Public can read published reviews
DROP POLICY IF EXISTS "Public can read published reviews" ON movies;
CREATE POLICY "Public can read published reviews"
  ON movies FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

-- Authenticated users can read all reviews (including drafts) — needed for admin dashboard
DROP POLICY IF EXISTS "Admin can read all reviews" ON movies;
CREATE POLICY "Admin can read all reviews"
  ON movies FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can insert reviews
DROP POLICY IF EXISTS "Admin can insert reviews" ON movies;
CREATE POLICY "Admin can insert reviews"
  ON movies FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update reviews
DROP POLICY IF EXISTS "Admin can update reviews" ON movies;
CREATE POLICY "Admin can update reviews"
  ON movies FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

-- Authenticated users can delete reviews
DROP POLICY IF EXISTS "Admin can delete reviews" ON movies;
CREATE POLICY "Admin can delete reviews"
  ON movies FOR DELETE
  TO authenticated
  USING (true);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS movies_updated_at ON movies;
CREATE TRIGGER movies_updated_at
  BEFORE UPDATE ON movies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create storage bucket for movie posters
INSERT INTO storage.buckets (id, name, public)
VALUES ('movie-posters', 'movie-posters', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: public can read posters
DROP POLICY IF EXISTS "Public can read movie posters" ON storage.objects;
CREATE POLICY "Public can read movie posters"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'movie-posters');

-- Authenticated users can upload posters
DROP POLICY IF EXISTS "Admin can upload movie posters" ON storage.objects;
CREATE POLICY "Admin can upload movie posters"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'movie-posters');

-- Authenticated users can update/delete posters
DROP POLICY IF EXISTS "Admin can update movie posters" ON storage.objects;
CREATE POLICY "Admin can update movie posters"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'movie-posters');

DROP POLICY IF EXISTS "Admin can delete movie posters" ON storage.objects;
CREATE POLICY "Admin can delete movie posters"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'movie-posters');
