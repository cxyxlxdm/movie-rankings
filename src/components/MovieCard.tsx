'use client';

import { Movie } from '@/lib/types';
import { getPosterUrl } from '@/lib/tmdb';
import Link from 'next/link';

interface MovieCardProps {
  movie: Movie;
  showRank?: boolean;
  rank?: number;
}

export default function MovieCard({ movie, showRank = false, rank }: MovieCardProps) {
  const posterUrl = getPosterUrl(movie.poster_path, 'w500');
  const rating = movie.vote_average.toFixed(1);
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
  const isChinese = movie.original_language === 'zh';

  return (
    <Link href={`/movie/${movie.id}`} className="group block">
      <div className="relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
        {/* 排名标记 */}
        {showRank && rank && (
          <div className={`absolute top-2 left-2 z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-lg
            ${rank === 1 ? 'bg-yellow-500' : rank === 2 ? 'bg-gray-400' : rank === 3 ? 'bg-amber-600' : 'bg-gray-700'}
          `}>
            {rank}
          </div>
        )}

        {/* 语言标记 */}
        {isChinese && (
          <div className="absolute top-2 right-2 z-10 bg-red-600 text-white text-xs px-2 py-1 rounded">
            中
          </div>
        )}

        {/* 海报 */}
        <div className="aspect-[2/3] overflow-hidden">
          <img
            src={posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        {/* 评分 */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-yellow-400 px-2 py-1 rounded text-sm font-bold">
          ⭐ {rating}
        </div>

        {/* 信息 */}
        <div className="p-3">
          <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
            {movie.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {releaseYear}
          </p>
        </div>
      </div>
    </Link>
  );
}
