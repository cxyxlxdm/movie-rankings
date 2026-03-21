import Link from 'next/link';
import { getNowPlayingMovies, getUpcomingMovies, getTopRatedMovies } from '@/lib/tmdb';
import { getPosterUrl } from '@/lib/tmdb';
import MovieCard from '@/components/MovieCard';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // 每小时重新验证

export default async function HomePage() {
  // 获取三个榜单的数据
  const [nowPlaying, upcoming, topRated] = await Promise.all([
    getNowPlayingMovies(1).catch(() => ({ results: [] })),
    getUpcomingMovies(1).catch(() => ({ results: [] })),
    getTopRatedMovies(1).catch(() => ({ results: [] })),
  ]);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4 text-center">🎬 电影排行榜</h1>
          <p className="text-xl text-gray-300 text-center max-w-2xl mx-auto">
            发现正在热映、即将上映和影史经典的优秀电影
          </p>
        </div>
      </section>

      {/* 正在热映 */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">🔥 正在热映</h2>
          <Link 
            href="/now-playing" 
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            查看全部 →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {nowPlaying.results.slice(0, 6).map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* 即将上映 */}
      <section className="container mx-auto px-4 py-12 bg-white">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">🎭 即将上映</h2>
          <Link 
            href="/upcoming" 
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            查看全部 →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {upcoming.results.slice(0, 6).map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* 影史 Top 100 */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">🏆 影史经典 Top 100</h2>
          <Link 
            href="/top-rated" 
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            查看全部 →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {topRated.results.slice(0, 6).map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>© 2026 电影排行榜 · 数据由 TMDB 提供</p>
          <p className="mt-2 text-sm">
            <a href="https://www.themoviedb.org" target="_blank" className="hover:text-white">
              The Movie Database
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}
