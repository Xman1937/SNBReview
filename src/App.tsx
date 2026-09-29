import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import PublicLayout from '@/components/PublicLayout';
import HomePage from '@/pages/HomePage';
import MovieReviewPage from '@/pages/MovieReviewPage';
import CategoryPage from '@/pages/CategoryPage';
import SearchPage from '@/pages/SearchPage';
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import ReviewForm from '@/pages/admin/ReviewForm';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/movie/:slug" element={<MovieReviewPage />} />
            <Route path="/category/:category" element={<CategoryPage />} />
            <Route path="/search" element={<SearchPage />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/new" element={<ReviewForm />} />
          <Route path="/admin/edit/:id" element={<ReviewForm />} />

          {/* 404 */}
          <Route path="*" element={
            <PublicLayout>
              <div className="max-w-3xl mx-auto px-4 py-20 text-center">
                <h1 className="text-4xl font-bold text-white mb-4">404</h1>
                <p className="text-gray-500 mb-6">Page not found</p>
                <a href="/" className="text-red-400 hover:text-red-300 text-sm font-medium">&larr; Back to Home</a>
              </div>
            </PublicLayout>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
