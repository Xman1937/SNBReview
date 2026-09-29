import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Film } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Movie } from '@/types';
import { CATEGORIES } from '@/types';
import MovieCard from '@/components/MovieCard';
import SEO from '@/components/SEO';
import { LoadingSpinner, EmptyState } from '@/components/UIElements';

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  const categoryName = CATEGORIES.find(
    (c) => c.toLowerCase().replace(/\s+/g, '-') === category
  );

  useEffect(() => {
    if (!categoryName) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from('movies')
        .select('*')
        .eq('status', 'published')
        .eq('category', categoryName)
        .order('published_at', { ascending: false });

      setMovies((data as Movie[]) || []);
      setLoading(false);
    })();
  }, [categoryName]);

  if (!categoryName) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20">
        <SEO title="Category Not Found - ReelReview" />
        <EmptyState title="Category Not Found" message="The category you're looking for doesn't exist." />
        <div className="text-center mt-6">
          <Link to="/" className="text-red-400 hover:text-red-300 text-sm font-medium">&larr; Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${categoryName} Movie Reviews - ReelReview`}
        description={`Browse all ${categoryName} movie reviews on ReelReview. In-depth analysis, ratings, and recommendations.`}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <nav className="text-sm text-gray-500 mb-2">
            <Link to="/" className="hover:text-red-400">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-400">{categoryName}</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <span className="w-1 h-8 bg-red-500 rounded-full" />
            {categoryName} Reviews
          </h1>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : movies.length === 0 ? (
          <EmptyState
            title={`No ${categoryName} Reviews Yet`}
            message="Check back soon for new reviews in this category."
            icon={<Film className="w-12 h-12" />}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
