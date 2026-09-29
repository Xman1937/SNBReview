import type { Movie } from '@/types';

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatYear(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.getFullYear().toString();
}

export function getRatingColor(rating: number): string {
  if (rating >= 8) return 'text-green-400';
  if (rating >= 6) return 'text-yellow-400';
  if (rating >= 4) return 'text-orange-400';
  return 'text-red-400';
}

export function getRatingBgColor(rating: number): string {
  if (rating >= 8) return 'bg-green-500';
  if (rating >= 6) return 'bg-yellow-500';
  if (rating >= 4) return 'bg-orange-500';
  return 'bg-red-500';
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + '...';
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Bollywood: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    Hollywood: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    South: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    'Web Series': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    Netflix: 'bg-red-500/20 text-red-300 border-red-500/30',
    'Amazon Prime': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    'Other OTT': 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  };
  return colors[category] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
}

export function getMovieExcerpt(movie: Movie): string {
  return movie.short_description || truncate(movie.full_review || '', 150);
}
