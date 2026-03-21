import { getTopRatedMovies } from '@/lib/tmdb';
import MovieCard from '@/components/MovieCard';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export default async function TopRatedPage() {
  // 获取前 100 部电影（需要多页）
  const [page1, page2, page3, page4, page5] = await Promise.all([
    getTopRatedMovies(1).catch(() => ({ results: [] })),
    getTopRatedMovies(2).catch(() => ({ results: [] })),
    getTopRatedMovies(3).catch(() => ({ results: [] })),
    getTopRatedMovies(4).catch(() => ({ results: [] })),
    getTopRatedMovies(5).catch(() => ({ results: [] })),
  ]);

  const allMovies = [
    ...page1.results,
    ...page2.results,
    ...page3.results,
    ...page4.results,
    ...page5.results,
  ].slice(0, 100);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-yellow-700 via-amber-700 to-yellow-800 text-white py-12">
        <div className="container mx-auto px-4">
          <Link href="/" className="text-yellow-200 hover:text-white mb-4 inline-block">
            ← 返回首页
          </Link>
          <h1 className="text-4xl font-bold">🏆 影史经典 Top 100</h1>
          <p className="text-yellow-200 mt-2">
            根据 TMDB 评分排序的影史最佳电影
          </p>
        </div>
      </section>

      {/* 电影列表 */}
      <section className="container mx-auto px-4 py-12">
        {allMovies.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {allMovies.map((movie, index) => (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
                showRank={true}
                rank={index + 1}
              />
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
