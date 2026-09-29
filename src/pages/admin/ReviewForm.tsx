import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Upload, Save, Eye, X, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { CATEGORIES, type Movie, type MovieStatus } from '@/types';
import { slugify } from '@/lib/helpers';
import AdminLayout from '@/pages/admin/AdminLayout';
import SEO from '@/components/SEO';

interface FormData {
  title: string;
  slug: string;
  poster_url: string;
  category: string;
  language: string;
  release_year: string;
  genre: string;
  director: string;
  cast_members: string;
  runtime: string;
  ott_platform: string;
  rating: string;
  story_rating: string;
  acting_rating: string;
  direction_rating: string;
  music_rating: string;
  cinematography_rating: string;
  short_description: string;
  full_review: string;
  final_verdict: string;
}

const emptyForm: FormData = {
  title: '',
  slug: '',
  poster_url: '',
  category: 'Bollywood',
  language: '',
  release_year: '',
  genre: '',
  director: '',
  cast_members: '',
  runtime: '',
  ott_platform: '',
  rating: '0',
  story_rating: '0',
  acting_rating: '0',
  direction_rating: '0',
  music_rating: '0',
  cinematography_rating: '0',
  short_description: '',
  full_review: '',
  final_verdict: '',
};

export default function ReviewForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<FormData>(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugEdited, setSlugEdited] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase.from('movies').select('*').eq('id', id).maybeSingle();
      if (error || !data) {
        setError('Review not found.');
        setLoading(false);
        return;
      }
      const m = data as Movie;
      setForm({
        title: m.title,
        slug: m.slug,
        poster_url: m.poster_url || '',
        category: m.category,
        language: m.language,
        release_year: m.release_year?.toString() || '',
        genre: m.genre,
        director: m.director,
        cast_members: m.cast_members,
        runtime: m.runtime,
        ott_platform: m.ott_platform,
        rating: m.rating.toString(),
        story_rating: m.story_rating.toString(),
        acting_rating: m.acting_rating.toString(),
        direction_rating: m.direction_rating.toString(),
        music_rating: m.music_rating.toString(),
        cinematography_rating: m.cinematography_rating.toString(),
        short_description: m.short_description,
        full_review: m.full_review,
        final_verdict: m.final_verdict,
      });
      setSlugEdited(true);
      setLoading(false);
    })();
  }, [id]);

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'title' && !slugEdited) {
        next.slug = slugify(value);
      }
      if (field === 'slug') {
        setSlugEdited(true);
        next.slug = slugify(value);
      }
      return next;
    });
  };

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB.');
      return;
    }
    setUploading(true);
    setError(null);
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('movie-posters')
      .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (uploadError) {
      setError('Failed to upload image. Please try again.');
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('movie-posters').getPublicUrl(filePath);
    setForm((prev) => ({ ...prev, poster_url: urlData.publicUrl }));
    setUploading(false);
  };

  const buildPayload = (status: MovieStatus) => {
    const publishedAt = status === 'published'
      ? (form.release_year ? new Date().toISOString() : new Date().toISOString())
      : null;
    return {
      title: form.title.trim(),
      slug: form.slug.trim() || slugify(form.title),
      poster_url: form.poster_url || null,
      category: form.category,
      language: form.language,
      release_year: form.release_year ? parseInt(form.release_year, 10) : null,
      genre: form.genre,
      director: form.director,
      cast_members: form.cast_members,
      runtime: form.runtime,
      ott_platform: form.ott_platform,
      rating: parseFloat(form.rating) || 0,
      story_rating: parseFloat(form.story_rating) || 0,
      acting_rating: parseFloat(form.acting_rating) || 0,
      direction_rating: parseFloat(form.direction_rating) || 0,
      music_rating: parseFloat(form.music_rating) || 0,
      cinematography_rating: parseFloat(form.cinematography_rating) || 0,
      short_description: form.short_description,
      full_review: form.full_review,
      final_verdict: form.final_verdict,
      status,
      published_at: status === 'published' ? publishedAt : null,
    };
  };

  const validate = (): string | null => {
    if (!form.title.trim()) return 'Movie title is required.';
    if (!form.slug.trim()) return 'Slug is required.';
    if (!form.category) return 'Category is required.';
    if (form.rating && (parseFloat(form.rating) < 0 || parseFloat(form.rating) > 10))
      return 'Overall rating must be between 0 and 10.';
    return null;
  };

  const handleSave = async (e: FormEvent, status: MovieStatus) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setSaving(true);
    setError(null);
    const payload = buildPayload(status);

    if (isEdit && id) {
      const { error } = await supabase.from('movies').update(payload).eq('id', id);
      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase.from('movies').insert(payload);
      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }
    }
    navigate('/admin/dashboard');
  };

  if (loading) {
    return (
      <AdminLayout>
        <SEO title="Loading... - Admin" />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-gray-600 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  const inputClass = "w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-red-500/50 transition-colors";
  const labelClass = "block text-gray-400 text-xs font-medium mb-1.5";

  return (
    <AdminLayout>
      <SEO title={isEdit ? 'Edit Review - Admin' : 'Add Review - Admin'} />
      <div className="mb-6">
        <Link to="/admin/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-3 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-white">{isEdit ? 'Edit Review' : 'Add New Review'}</h1>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm mb-4">
          {error}
        </div>
      )}

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        {/* Poster Upload */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <h2 className="text-white font-semibold text-sm mb-4">Movie Poster</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-32 h-44 rounded-lg overflow-hidden bg-gray-800 border border-gray-700 shrink-0">
              {form.poster_url ? (
                <img src={form.poster_url} alt="Poster preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs text-center px-2">
                  No poster
                </div>
              )}
            </div>
            <div className="flex-1">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-red-500/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {uploading ? (
                    <Loader2 className="w-6 h-6 text-gray-500 animate-spin mb-2" />
                  ) : (
                    <Upload className="w-6 h-6 text-gray-500 mb-2" />
                  )}
                  <p className="text-gray-400 text-xs">
                    {uploading ? 'Uploading...' : 'Click to upload poster'}
                  </p>
                  <p className="text-gray-600 text-xs mt-1">PNG, JPG up to 5MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file);
                  }}
                />
              </label>
              {form.poster_url && (
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, poster_url: '' }))}
                  className="mt-2 text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Remove poster
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <h2 className="text-white font-semibold text-sm mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Movie Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
                className={inputClass}
                placeholder="e.g. Pathaan"
              />
            </div>
            <div>
              <label className={labelClass}>Slug (URL) *</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                required
                className={inputClass}
                placeholder="pathaan"
              />
              <p className="text-gray-600 text-xs mt-1">URL: /movie/{form.slug || 'slug'}</p>
            </div>
            <div>
              <label className={labelClass}>Category *</label>
              <select
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className={inputClass}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Language</label>
              <input
                type="text"
                value={form.language}
                onChange={(e) => handleChange('language', e.target.value)}
                className={inputClass}
                placeholder="e.g. Hindi"
              />
            </div>
            <div>
              <label className={labelClass}>Release Year</label>
              <input
                type="number"
                value={form.release_year}
                onChange={(e) => handleChange('release_year', e.target.value)}
                className={inputClass}
                placeholder="e.g. 2024"
              />
            </div>
            <div>
              <label className={labelClass}>Genre</label>
              <input
                type="text"
                value={form.genre}
                onChange={(e) => handleChange('genre', e.target.value)}
                className={inputClass}
                placeholder="e.g. Action, Thriller"
              />
            </div>
            <div>
              <label className={labelClass}>Director</label>
              <input
                type="text"
                value={form.director}
                onChange={(e) => handleChange('director', e.target.value)}
                className={inputClass}
                placeholder="e.g. Siddharth Anand"
              />
            </div>
            <div>
              <label className={labelClass}>Cast</label>
              <input
                type="text"
                value={form.cast_members}
                onChange={(e) => handleChange('cast_members', e.target.value)}
                className={inputClass}
                placeholder="e.g. Shah Rukh Khan, Deepika Padukone"
              />
            </div>
            <div>
              <label className={labelClass}>Runtime</label>
              <input
                type="text"
                value={form.runtime}
                onChange={(e) => handleChange('runtime', e.target.value)}
                className={inputClass}
                placeholder="e.g. 2h 26m"
              />
            </div>
            <div>
              <label className={labelClass}>OTT Platform / Theatre</label>
              <input
                type="text"
                value={form.ott_platform}
                onChange={(e) => handleChange('ott_platform', e.target.value)}
                className={inputClass}
                placeholder="e.g. Netflix / In Theatres"
              />
            </div>
          </div>
        </div>

        {/* Ratings */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <h2 className="text-white font-semibold text-sm mb-4">Ratings (0-10)</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Overall Rating *</label>
              <input type="number" step="0.1" min="0" max="10" value={form.rating} onChange={(e) => handleChange('rating', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Story</label>
              <input type="number" step="0.1" min="0" max="10" value={form.story_rating} onChange={(e) => handleChange('story_rating', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Acting</label>
              <input type="number" step="0.1" min="0" max="10" value={form.acting_rating} onChange={(e) => handleChange('acting_rating', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Direction</label>
              <input type="number" step="0.1" min="0" max="10" value={form.direction_rating} onChange={(e) => handleChange('direction_rating', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Music</label>
              <input type="number" step="0.1" min="0" max="10" value={form.music_rating} onChange={(e) => handleChange('music_rating', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Cinematography</label>
              <input type="number" step="0.1" min="0" max="10" value={form.cinematography_rating} onChange={(e) => handleChange('cinematography_rating', e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Review Content */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <h2 className="text-white font-semibold text-sm mb-4">Review Content</h2>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Short Description (for cards)</label>
              <textarea
                value={form.short_description}
                onChange={(e) => handleChange('short_description', e.target.value)}
                rows={2}
                className={inputClass}
                placeholder="A brief summary shown on movie cards..."
              />
            </div>
            <div>
              <label className={labelClass}>Full Review</label>
              <textarea
                value={form.full_review}
                onChange={(e) => handleChange('full_review', e.target.value)}
                rows={12}
                className={inputClass}
                placeholder="Write the full review here. Use line breaks to separate paragraphs..."
              />
            </div>
            <div>
              <label className={labelClass}>Final Verdict</label>
              <textarea
                value={form.final_verdict}
                onChange={(e) => handleChange('final_verdict', e.target.value)}
                rows={3}
                className={inputClass}
                placeholder="Your final verdict on the movie..."
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sticky bottom-0 bg-gray-950/90 backdrop-blur-sm p-4 -mx-4 sm:-mx-6 lg:-mx-8 border-t border-gray-800">
          <button
            type="button"
            onClick={(e) => handleSave(e, 'published')}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-semibold rounded-lg hover:from-red-600 hover:to-orange-600 transition-all disabled:opacity-50"
          >
            <Eye className="w-4 h-4" /> {isEdit ? 'Update & Publish' : 'Publish'}
          </button>
          <button
            type="button"
            onClick={(e) => handleSave(e, 'draft')}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> Save Draft
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-400 text-sm font-medium rounded-lg transition-colors"
          >
            <X className="w-4 h-4" /> Cancel
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
