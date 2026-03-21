import { getUpcomingMovies } from '@/lib/tmdb';
import MovieCard from '@/components/MovieCard';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export default async function UpcomingPage() {
  const upcoming = await getUpcomingMovies(1).catch(() => ({ results: [] }));

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 text-white py-12">
        <div className="container mx-auto px-4">
          <Link href="/" className="text-purple-200 hover:text-white mb-4 inline-block">
            ← 返回首页
          </Link>
          <h1 className="text-4xl font-bold">🎭 即将上映</h1>
          <p className="text-purple-200 mt-2">
            即将登陆影院的精彩电影
          </p>
        </div>
      </section>

      {/* 电影列表 */}
      <section className="container mx-auto px-4 py-12">
        {upcoming.results.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {upcoming.results.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">暂无数据，请检查 TMDB API 配置</p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>© 2026 电影排行榜 · 数据由 TMDB 提供</p>
        </div>
      </footer>
    </main>
  );
}
