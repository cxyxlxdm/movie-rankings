import { getMovieDetail, getPosterUrl, getBackdropUrl } from '@/lib/tmdb';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MovieDetailPage({ params }: PageProps) {
  const { id } = await params;
  const movieId = parseInt(id);
  
  try {
    const movie = await getMovieDetail(movieId);
    
    if (!movie) {
      notFound();
    }

    const posterUrl = getPosterUrl(movie.poster_path, 'w780');
    const backdropUrl = getBackdropUrl(movie.backdrop_path, 'w1280');
    const rating = movie.vote_average.toFixed(1);
    const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';

    return (
      <main className="min-h-screen bg-gray-50">
        {/* Backdrop */}
        <div className="relative h-96 overflow-hidden">
          <img
            src={backdropUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
          
          {/* Back Button */}
          <div className="absolute top-4 left-4">
            <Link 
              href="/" 
              className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
            >
              ← 返回
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 -mt-32 relative z-10 pb-12">
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="md:flex">
              {/* Poster */}
              <div className="md:w-1/3 lg:w-1/4">
                <img
                  src={posterUrl}
                  alt={movie.title}
                  className="w-full h-auto"
                />
              </div>

              {/* Info */}
              <div className="p-6 md:p-8 md:w-2/3 lg:w-3/4">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {movie.title}
                </h1>
                
                {movie.original_title && movie.original_title !== movie.title && (
                  <p className="text-gray-500 text-lg mb-4">
                    {movie.original_title}
                  </p>
                )}

                {/* Rating & Info */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⭐</span>
                    <span className="text-2xl font-bold text-yellow-500">{rating}</span>
                    <span className="text-gray-500">/ 10</span>
                  </div>
                  <span className="text-gray-500">·</span>
                  <span className="text-gray-600">{releaseYear}</span>
                  {movie.runtime && (
                    <>
                      <span className="text-gray-500">·</span>
                      <span className="text-gray-600">{Math.floor(movie.runtime / 60)}小时{movie.runtime % 60}分钟</span>
                    </>
                  )}
                </div>

                {/* Genres */}
                {movie.genres && movie.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {movie.genres.map((genre) => (
                      <span
                        key={genre.id}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Overview */}
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">剧情简介</h2>
                  <p className="text-gray-600 leading-relaxed">
                    {movie.overview || '暂无剧情简介'}
                  </p>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {movie.status && (
                    <div>
                      <span className="text-gray-500">状态：</span>
                      <span className="text-gray-700">{movie.status}</span>
                    </div>
                  )}
                  {movie.original_language && (
                    <div>
                      <span className="text-gray-500">语言：</span>
                      <span className="text-gray-700 uppercase">{movie.original_language}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-400 py-8 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p>© 2026 电影排行榜 · 数据由 TMDB 提供</p>
          </div>
        </footer>
      </main>
    );
  } catch (error) {
    notFound();
  }
}
