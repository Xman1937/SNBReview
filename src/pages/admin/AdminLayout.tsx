import { type ReactNode } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FilePlus, LogOut, Clapperboard, Globe } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { session, loading, signOut } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gray-700 border-t-red-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin" replace />;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="lg:w-64 bg-gray-900 border-r border-gray-800 lg:min-h-screen lg:sticky lg:top-0 shrink-0">
        <div className="p-4 border-b border-gray-800">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <Clapperboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white">ReelReview</span>
              <p className="text-gray-500 text-xs">Admin Panel</p>
            </div>
          </Link>
        </div>

        <nav className="p-3 flex flex-row lg:flex-col gap-1 overflow-x-auto">
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors whitespace-nowrap"
          >
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
          <Link
            to="/admin/new"
            className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors whitespace-nowrap"
          >
            <FilePlus className="w-4 h-4" /> Add Review
          </Link>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors whitespace-nowrap"
          >
            <Globe className="w-4 h-4" /> View Site
          </a>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-gray-800 rounded-lg transition-colors whitespace-nowrap mt-auto"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
