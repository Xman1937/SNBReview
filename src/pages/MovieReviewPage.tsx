import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, User, Film, Star, Share2, ArrowLeft, Tv } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Movie } from '@/types';
import SEO from '@/components/SEO';
import MovieCard from '@/components/MovieCard';
import { LoadingSpinner, ErrorState, EmptyState } from '@/components/UIElements';
import { formatDate, getRatingColor, getRatingBgColor, getCategoryColor } from '@/lib/helpers';

export default function MovieReviewPage() {
  const { slug } = useParams<{ slug: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [related, setRelated] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    (async () => {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const movieData = data as Movie;
      setMovie(movieData);

      // Fetch related movies (same category, excluding current)
      const { data: relatedData } = await supabase
        .from('movies')
        .select('*')
        .eq('status', 'published')
        .eq('category', movieData.category)
        .neq('id', movieData.id)
        .order('rating', { ascending: false })
        .limit(4);

      setRelated((relatedData as Movie[]) || []);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <>
        <SEO title="Loading Review..." />
        <LoadingSpinner />
      </>
    );
  }

  if (notFound || !movie) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20">
        <SEO title="Review Not Found - ReelReview" />
        <EmptyState
          title="Review Not Found"
          message="The review you're looking for doesn't exist or hasn't been published yet."
        />
        <div className="text-center mt-6">
          <Link to="/" className="text-red-400 hover:text-red-300 text-sm font-medium">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const shareUrl = window.location.href;
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Movie',
      name: movie.title,
      datePublished: movie.release_year?.toString(),
      director: movie.director ? { '@type': 'Person', name: movie.director } : undefined,
      genre: movie.genre,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: movie.rating,
      bestRating: 10,
    },
    author: { '@type': 'Organization', name: 'ReelReview' },
    publisher: { '@type': 'Organization', name: 'ReelReview' },
    datePublished: movie.published_at,
    reviewBody: movie.full_review,
  };

  const ratings = [
    { label: 'Story', value: movie.story_rating },
    { label: 'Acting', value: movie.acting_rating },
    { label: 'Direction', value: movie.direction_rating },
    { label: 'Music', value: movie.music_rating },
    { label: 'Cinematography', value: movie.cinematography_rating },
  ];

  return (
    <>
      <SEO
        title={`${movie.title} (${movie.release_year || ''}) Review - ReelReview`}
        description={movie.short_description || `Read our in-depth review of ${movie.title}. Rating: ${movie.rating}/10.`}
        image={movie.poster_url || undefined}
        url={shareUrl}
        type="article"
        structuredData={structuredData}
      />

      {/* Back button */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </div>

      {/* Hero section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Poster */}
          <div className="w-40 md:w-56 shrink-0 mx-auto md:mx-0">
            <div className="aspect-[2/3] rounded-xl overflow-hidden bg-gray-800 border border-gray-700 shadow-xl">
              {movie.poster_url ? (
                <img src={movie.poster_url} alt={movie.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <span className="text-gray-600 text-6xl font-bold">{movie.title.charAt(0)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full border mb-3 ${getCategoryColor(movie.category)}`}>
              {movie.category}
            </span>
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-3">{movie.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mb-4">
              {movie.release_year && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> {movie.release_year}
                </span>
              )}
              {movie.language && <span>&middot; {movie.language}</span>}
              {movie.runtime && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {movie.runtime}
                </span>
              )}
              {movie.ott_platform && (
                <span className="flex items-center gap-1">
                  <Tv className="w-4 h-4" /> {movie.ott_platform}
                </span>
              )}
            </div>

            {movie.genre && (
              <p className="text-gray-400 text-sm mb-3">
                <span className="text-gray-500">Genre:</span> {movie.genre}
              </p>
            )}
            {movie.director && (
              <p className="text-gray-400 text-sm mb-3">
                <span className="text-gray-500">Director:</span> {movie.director}
              </p>
            )}
            {movie.cast_members && (
              <p className="text-gray-400 text-sm mb-4">
                <span className="text-gray-500">Cast:</span> {movie.cast_members}
              </p>
            )}

            {/* Overall Rating */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-14 h-14 rounded-xl ${getRatingBgColor(movie.rating)} flex items-center justify-center shadow-lg`}>
                <span className="text-white font-bold text-xl">{movie.rating.toFixed(1)}</span>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Overall Rating</p>
                <div className="flex items-center gap-0.5 mt-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i <= Math.round(movie.rating / 2) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-700'}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Share buttons */}
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-xs flex items-center gap-1">
                <Share2 className="w-3.5 h-3.5" /> Share:
              </span>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Review: ${movie.title} - ${movie.rating}/10`)}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors"
              >
                Twitter
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors"
              >
                Facebook
              </a>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Review: ${movie.title} - ${movie.rating}/10 ${shareUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors"
              >
                WhatsApp
              </a>
              <button
                onClick={() => navigator.clipboard?.writeText(shareUrl)}
                className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors"
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ratings Breakdown */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-red-500 rounded-full" /> Ratings Breakdown
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {ratings.map((r) => (
            <div key={r.label} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
              <p className="text-gray-400 text-xs mb-2">{r.label}</p>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${getRatingColor(r.value)}`}>{r.value.toFixed(1)}</span>
                <span className="text-gray-600 text-xs">/10</span>
              </div>
              <div className="w-full h-1.5 bg-gray-800 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${getRatingBgColor(r.value)}`}
                  style={{ width: `${(r.value / 10) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Review */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-red-500 rounded-full" /> Full Review
        </h2>
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          {movie.full_review ? (
            <div className="prose prose-invert max-w-none">
              {movie.full_review.split('\n').map((para, i) => (
                para.trim() ? <p key={i} className="text-gray-300 leading-relaxed mb-4">{para}</p> : null
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Full review content coming soon.</p>
          )}
        </div>
      </div>

      {/* Final Verdict */}
      {movie.final_verdict && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-xl p-6 border border-red-500/20">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 fill-red-400 text-red-400" /> Final Verdict
            </h2>
            <p className="text-gray-300 leading-relaxed">{movie.final_verdict}</p>
          </div>
        </div>
      )}

      {/* Published date */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <p className="text-gray-500 text-xs flex items-center gap-1">
          <User className="w-3 h-3" /> Published on {formatDate(movie.published_at)}
        </p>
      </div>

      {/* Related Reviews */}
      {related.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-red-500 rounded-full" /> Related Reviews
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-5">
            {related.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
