import { Link } from 'react-router-dom';
import { Star, Calendar } from 'lucide-react';
import type { Movie } from '@/types';
import { getRatingBgColor, getCategoryColor, getMovieExcerpt } from '@/lib/helpers';

interface MovieCardProps {
  movie: Movie;
  variant?: 'default' | 'compact' | 'featured';
}

export default function MovieCard({ movie, variant = 'default' }: MovieCardProps) {
  if (variant === 'featured') {
    return (
      <Link
        to={`/movie/${movie.slug}`}
        className="group relative block overflow-hidden rounded-2xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all duration-300"
      >
        <div className="relative aspect-[16/9] overflow-hidden">
          {movie.poster_url ? (
            <img
              src={movie.poster_url}
              alt={movie.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <span className="text-gray-600 text-4xl font-bold">{movie.title.charAt(0)}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full border mb-3 ${getCategoryColor(movie.category)}`}>
              {movie.category}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 group-hover:text-red-400 transition-colors">
              {movie.title}
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-300 mb-3">
              {movie.release_year && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {movie.release_year}
                </span>
              )}
              {movie.genre && <span>{movie.genre}</span>}
            </div>
            <p className="text-gray-400 text-sm line-clamp-2 max-w-2xl">{getMovieExcerpt(movie)}</p>
            <div className="flex items-center gap-3 mt-4">
              <div className="flex items-center gap-1.5">
                <div className={`w-10 h-10 rounded-lg ${getRatingBgColor(movie.rating)} flex items-center justify-center`}>
                  <span className="text-white font-bold text-sm">{movie.rating.toFixed(1)}</span>
                </div>
                <span className="text-gray-400 text-xs">/ 10</span>
              </div>
              <span className="text-red-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                Read Review &rarr;
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link
        to={`/movie/${movie.slug}`}
        className="group flex gap-3 items-center bg-gray-900/50 rounded-xl p-3 hover:bg-gray-800/70 transition-colors border border-gray-800/50"
      >
        <div className="w-16 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-800">
          {movie.poster_url ? (
            <img src={movie.poster_url} alt={movie.title} loading="lazy" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600 font-bold text-lg">
              {movie.title.charAt(0)}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-white text-sm font-medium truncate group-hover:text-red-400 transition-colors">{movie.title}</h4>
          <p className="text-gray-500 text-xs">{movie.release_year} &middot; {movie.genre}</p>
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-yellow-400 text-xs font-medium">{movie.rating.toFixed(1)}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/movie/${movie.slug}`}
      className="group block bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 hover:shadow-xl hover:shadow-black/40 transition-all duration-300"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-gray-800">
        {movie.poster_url ? (
          <img
            src={movie.poster_url}
            alt={movie.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <span className="text-gray-600 text-5xl font-bold">{movie.title.charAt(0)}</span>
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full border backdrop-blur-sm ${getCategoryColor(movie.category)}`}>
            {movie.category}
          </span>
        </div>
        <div className="absolute top-2 right-2">
          <div className={`w-9 h-9 rounded-lg ${getRatingBgColor(movie.rating)} flex items-center justify-center shadow-lg`}>
            <span className="text-white font-bold text-xs">{movie.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-white font-semibold text-base mb-1 line-clamp-1 group-hover:text-red-400 transition-colors">
          {movie.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
          {movie.release_year && <span>{movie.release_year}</span>}
          {movie.release_year && movie.genre && <span>&middot;</span>}
          {movie.genre && <span className="line-clamp-1">{movie.genre}</span>}
        </div>
        <p className="text-gray-400 text-xs line-clamp-2 mb-3">{getMovieExcerpt(movie)}</p>
        <span className="text-red-400 text-xs font-medium group-hover:translate-x-1 transition-transform inline-block">
          Read Review &rarr;
        </span>
      </div>
    </Link>
  );
}
