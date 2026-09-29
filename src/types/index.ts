export type MovieStatus = 'draft' | 'published';

export interface Movie {
  id: string;
  title: string;
  slug: string;
  poster_url: string | null;
  category: string;
  language: string;
  release_year: number | null;
  genre: string;
  director: string;
  cast_members: string;
  runtime: string;
  ott_platform: string;
  rating: number;
  story_rating: number;
  acting_rating: number;
  direction_rating: number;
  music_rating: number;
  cinematography_rating: number;
  short_description: string;
  full_review: string;
  final_verdict: string;
  status: MovieStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author_id: string | null;
}

export interface MovieInput {
  title: string;
  slug: string;
  poster_url: string | null;
  category: string;
  language: string;
  release_year: number | null;
  genre: string;
  director: string;
  cast_members: string;
  runtime: string;
  ott_platform: string;
  rating: number;
  story_rating: number;
  acting_rating: number;
  direction_rating: number;
  music_rating: number;
  cinematography_rating: number;
  short_description: string;
  full_review: string;
  final_verdict: string;
  status: MovieStatus;
  published_at: string | null;
}

export const CATEGORIES = [
  'Bollywood',
  'Hollywood',
  'South',
  'Web Series',
  'Netflix',
  'Amazon Prime',
  'Other OTT',
] as const;

export type Category = (typeof CATEGORIES)[number];
