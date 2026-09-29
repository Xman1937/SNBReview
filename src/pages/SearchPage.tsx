import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Movie } from '@/types';
import MovieCard from '@/components/MovieCard';
import SEO from '@/components/SEO';
import { LoadingSpinner, EmptyState } from '@/components/UIElements';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setMovies([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    (async () => {
      const { data } = await supabase
        .from('movies')
        .select('*')
        .eq('status', 'published')
        .or(
          `title.ilike.%${query}%,director.ilike.%${query}%,genre.ilike.%${query}%,cast_members.ilike.%${query}%,category.ilike.%${query}%`
        )
        .order('rating', { ascending: false })
        .limit(24);

      setMovies((data as Movie[]) || []);
      setLoading(false);
    })();
  }, [query]);

  return (
    <>
      <SEO
        title={query ? `Search: "${query}" - ReelReview` : 'Search - ReelReview'}
        description="Search for movie reviews by title, actor, director, genre, or category on ReelReview."
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3 mb-2">
            <span className="w-1 h-8 bg-red-500 rounded-full" />
            {query ? `Search Results` : 'Search'}
          </h1>
          {query && (
            <p className="text-gray-400 text-sm">
              {loading ? 'Searching...' : `${movies.length} result${movies.length !== 1 ? 's' : ''} for "${query}"`}
            </p>
          )}
        </div>

        {!query && !searched && (
          <EmptyState
            title="Start Searching"
            message="Use the search box at the top to find movie reviews by title, actor, director, genre, or category."
            icon={<SearchIcon className="w-12 h-12" />}
          />
        )}

        {loading && <LoadingSpinner />}

        {!loading && query && movies.length === 0 && (
          <EmptyState
            title="No Results Found"
            message={`No reviews matched "${query}". Try different keywords.`}
            icon={<SearchIcon className="w-12 h-12" />}
          />
        )}

        {!loading && movies.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}

        <div className="mt-8">
          <Link to="/" className="text-red-400 hover:text-red-300 text-sm font-medium">&larr; Back to Home</Link>
        </div>
      </div>
    </>
  );
}
