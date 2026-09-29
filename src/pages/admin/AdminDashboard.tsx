import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, FolderOpen, CheckCircle, Clock, FilePlus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Movie } from '@/types';
import AdminLayout from '@/pages/admin/AdminLayout';
import SEO from '@/components/SEO';
import { LoadingSpinner } from '@/components/UIElements';
import { formatDate, getCategoryColor } from '@/lib/helpers';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, published: 0, drafts: 0, categories: 0 });
  const [recent, setRecent] = useState<Movie[]>([]);
  const [drafts, setDrafts] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: all } = await supabase.from('movies').select('*');
      const allMovies = (all as Movie[]) || [];
      const publishedCount = allMovies.filter((m) => m.status === 'published').length;
      const draftCount = allMovies.filter((m) => m.status === 'draft').length;
      const catCount = new Set(allMovies.map((m) => m.category)).size;

      setStats({
        total: allMovies.length,
        published: publishedCount,
        drafts: draftCount,
        categories: catCount,
      });

      setRecent(
        [...allMovies]
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          .slice(0, 5)
      );
      setDrafts(allMovies.filter((m) => m.status === 'draft'));
      setLoading(false);
    })();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    await supabase.from('movies').delete().eq('id', deleteId);
    setDeleting(false);
    setDeleteId(null);
    // Refresh
    const { data: all } = await supabase.from('movies').select('*');
    const allMovies = (all as Movie[]) || [];
    setStats({
      total: allMovies.length,
      published: allMovies.filter((m) => m.status === 'published').length,
      drafts: allMovies.filter((m) => m.status === 'draft').length,
      categories: new Set(allMovies.map((m) => m.category)).size,
    });
    setRecent([...allMovies].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 5));
    setDrafts(allMovies.filter((m) => m.status === 'draft'));
  };

  if (loading) {
    return (
      <AdminLayout>
        <SEO title="Dashboard - Admin" />
        <LoadingSpinner />
      </AdminLayout>
    );
  }

  const statCards = [
    { label: 'Total Reviews', value: stats.total, icon: FileText, color: 'from-blue-500 to-blue-600' },
    { label: 'Published', value: stats.published, icon: CheckCircle, color: 'from-green-500 to-green-600' },
    { label: 'Drafts', value: stats.drafts, icon: Clock, color: 'from-orange-500 to-orange-600' },
    { label: 'Categories', value: stats.categories, icon: FolderOpen, color: 'from-purple-500 to-purple-600' },
  ];

  return (
    <AdminLayout>
      <SEO title="Dashboard - Admin - ReelReview" />
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your movie reviews</p>
        </div>
        <Link
          to="/admin/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-semibold rounded-lg hover:from-red-600 hover:to-orange-600 transition-all"
        >
          <FilePlus className="w-4 h-4" /> Add New Review
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-gray-500 text-xs mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Reviews */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">Recently Updated</h2>
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          {recent.length === 0 ? (
            <p className="text-gray-500 text-sm p-6 text-center">No reviews yet. Create your first review!</p>
          ) : (
            <div className="divide-y divide-gray-800">
              {recent.map((movie) => (
                <div key={movie.id} className="flex items-center gap-3 p-4 hover:bg-gray-800/50 transition-colors">
                  <div className="w-10 h-14 rounded-lg overflow-hidden bg-gray-800 shrink-0">
                    {movie.poster_url ? (
                      <img src={movie.poster_url} alt={movie.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs font-bold">
                        {movie.title.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-white text-sm font-medium truncate">{movie.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`inline-block px-1.5 py-0.5 text-xs rounded border ${getCategoryColor(movie.category)}`}>
                        {movie.category}
                      </span>
                      <span className={`text-xs ${movie.status === 'published' ? 'text-green-400' : 'text-orange-400'}`}>
                        {movie.status}
                      </span>
                      <span className="text-gray-600 text-xs">{formatDate(movie.updated_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      to={`/admin/edit/${movie.id}`}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                      aria-label="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setDeleteId(movie.id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Draft Reviews */}
      {drafts.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Draft Reviews</h2>
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <div className="divide-y divide-gray-800">
              {drafts.map((movie) => (
                <div key={movie.id} className="flex items-center gap-3 p-4 hover:bg-gray-800/50 transition-colors">
                  <div className="w-10 h-14 rounded-lg overflow-hidden bg-gray-800 shrink-0">
                    {movie.poster_url ? (
                      <img src={movie.poster_url} alt={movie.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs font-bold">
                        {movie.title.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-white text-sm font-medium truncate">{movie.title}</h3>
                    <span className="text-orange-400 text-xs">Draft &middot; {formatDate(movie.updated_at)}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      to={`/admin/edit/${movie.id}`}
                      className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors"
                    >
                      Continue Editing
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full border border-gray-800">
            <h3 className="text-white font-semibold text-lg mb-2">Delete Review?</h3>
            <p className="text-gray-400 text-sm mb-6">
              This action cannot be undone. The review and all its content will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
