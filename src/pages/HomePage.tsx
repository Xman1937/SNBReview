import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Clock, Flame, Film } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Movie } from '@/types';
import { CATEGORIES } from '@/types';
import MovieCard from '@/components/MovieCard';
import SEO from '@/components/SEO';
import { SectionHeader, LoadingSpinner, EmptyState } from '@/components/UIElements';
import { getCategoryColor } from '@/lib/helpers';

export default function HomePage() {
  const [featured, setFeatured] = useState<Movie | null>(null);
  const [latest, setLatest] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [categoryMovies, setCategoryMovies] = useState<Record<string, Movie[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Featured: highest rated published review
        const { data: featuredData } = await supabase
          .from('movies')
          .select('*')
          .eq('status', 'published')
          .order('rating', { ascending: false })
          .order('published_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        setFeatured(featuredData as Movie | null);

        // Latest reviews
        const { data: latestData } = await supabase
          .from('movies')
          .select('*')
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(10);

        setLatest((latestData as Movie[]) || []);

        // Popular: highest rated
        const { data: popularData } = await supabase
          .from('movies')
          .select('*')
          .eq('status', 'published')
          .order('rating', { ascending: false })
          .limit(5);

        setPopular((popularData as Movie[]) || []);

        // Category sections
        const catResults: Record<string, Movie[]> = {};
        await Promise.all(
          CATEGORIES.map(async (cat) => {
            const { data } = await supabase
              .from('movies')
              .select('*')
              .eq('status', 'published')
              .eq('category', cat)
              .order('published_at', { ascending: false })
              .limit(6);
            catResults[cat] = (data as Movie[]) || [];
          })
        );
        setCategoryMovies(catResults);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <>
        <SEO title="ReelReview - Expert Movie Reviews & Ratings" />
        <LoadingSpinner />
      </>
    );
  }

  return (
    <>
      <SEO
        title="ReelReview - Expert Movie Reviews & Ratings"
        description="In-depth movie reviews across Bollywood, Hollywood, South Indian cinema, Web Series, and OTT releases. Honest ratings, detailed analysis, and everything you need to decide what to watch next."
      />

      {/* Hero / Featured */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {featured ? (
          <div className="mb-10">
            <SectionHeader title="Featured Review" />
            <MovieCard movie={featured} variant="featured" />
          </div>
        ) : (
          <div className="mb-10">
            <EmptyState
              title="No Reviews Published Yet"
              message="Check back soon for in-depth movie reviews!"
              icon={<Film className="w-12 h-12" />}
            />
          </div>
        )}
      </section>

      {/* Latest Reviews */}
      {latest.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <SectionHeader title="Latest Reviews" icon={<Clock className="w-5 h-5" />} />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
            {latest.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>
      )}

      {/* Popular Reviews */}
      {popular.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <SectionHeader title="Popular Reviews" icon={<Flame className="w-5 h-5" />} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popular.map((movie) => (
              <MovieCard key={movie.id} movie={movie} variant="compact" />
            ))}
          </div>
        </section>
      )}

      {/* Category Sections */}
      {CATEGORIES.map((cat) => {
        const movies = categoryMovies[cat] || [];
        if (movies.length === 0) return null;
        return (
          <section key={cat} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
            <SectionHeader
              title={cat}
              link={`/category/${cat.toLowerCase().replace(/\s+/g, '-')}`}
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-5">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </section>
        );
      })}

      {/* Browse by Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <SectionHeader title="Browse by Category" icon={<TrendingUp className="w-5 h-5" />} />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              to={`/category/${cat.toLowerCase().replace(/\s+/g, '-')}`}
              className={`px-4 py-4 rounded-xl border text-center text-sm font-medium hover:scale-105 transition-transform ${getCategoryColor(cat)}`}
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
