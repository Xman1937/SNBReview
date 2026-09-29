import { Link } from 'react-router-dom';
import { Clapperboard, Github, Twitter, Instagram } from 'lucide-react';
import { CATEGORIES } from '@/types';

export default function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-gray-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <Clapperboard className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Reel<span className="text-red-500">Review</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              Your trusted destination for in-depth movie reviews across Bollywood, Hollywood,
              South Indian cinema, Web Series, and OTT releases. Honest reviews, detailed ratings,
              and everything you need to decide what to watch next.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="#" className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors" aria-label="Github">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Categories</h3>
            <ul className="space-y-2">
              {CATEGORIES.map((cat) => (
                <li key={cat}>
                  <Link
                    to={`/category/${cat.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-gray-400 hover:text-red-400 text-sm transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-red-400 text-sm transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/search" className="text-gray-400 hover:text-red-400 text-sm transition-colors">Search</Link>
              </li>
              <li>
                <Link to="/admin" className="text-gray-400 hover:text-red-400 text-sm transition-colors">Admin</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs">
            &copy; {new Date().getFullYear()} ReelReview. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs">
            Built with React, Supabase &amp; Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
}
