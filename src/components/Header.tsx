import { useState, useEffect, useRef, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, Film, Clapperboard } from 'lucide-react';
import { CATEGORIES } from '@/types';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clapperboard className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight hidden sm:block">
              Reel<span className="text-red-500">Review</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link to="/" className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors">
              Home
            </Link>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                to={`/category/${cat.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors whitespace-nowrap"
              >
                {cat}
              </Link>
            ))}
          </nav>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies, actors, directors..."
                className="w-64 lg:w-72 pl-10 pr-4 py-2 text-sm bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 focus:bg-gray-800 transition-colors"
              />
            </div>
          </form>

          {/* Mobile actions */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-gray-300 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
              aria-label="Search"
            >
              {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-300 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {searchOpen && (
          <form onSubmit={handleSearch} className="md:hidden pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies, actors, directors..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-800/60 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 focus:bg-gray-800 transition-colors"
              />
            </div>
          </form>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="lg:hidden pb-4 flex flex-col gap-1">
            <Link to="/" className="px-3 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors flex items-center gap-2">
              <Film className="w-4 h-4" /> Home
            </Link>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                to={`/category/${cat.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-3 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
              >
                {cat}
              </Link>
            ))}
            <Link
              to="/admin"
              className="px-3 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-gray-800/50 rounded-lg transition-colors mt-2 border-t border-gray-800 pt-3"
            >
              Admin Login
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
