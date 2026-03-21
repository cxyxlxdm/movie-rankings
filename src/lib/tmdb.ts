// TMDB API 客户端

import { Movie, MovieDetail, MovieListResponse, Genre } from './types';

const API_KEY = process.env.TMDB_API_KEY || '';
const BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';

// 通用请求函数
async function fetchFromTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', API_KEY);
  url.searchParams.append('language', 'zh-CN');
  
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`TMDB API Error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

// 获取正在上映的电影
export async function getNowPlayingMovies(page: number = 1): Promise<MovieListResponse> {
  return fetchFromTMDB<MovieListResponse>('/movie/now_playing', { page: page.toString() });
}

// 获取即将上映的电影
export async function getUpcomingMovies(page: number = 1): Promise<MovieListResponse> {
  return fetchFromTMDB<MovieListResponse>('/movie/upcoming', { page: page.toString() });
}

// 获取热门电影
export async function getPopularMovies(page: number = 1): Promise<MovieListResponse> {
  return fetchFromTMDB<MovieListResponse>('/movie/popular', { page: page.toString() });
}

// 获取评分最高的电影（Top Rated）
export async function getTopRatedMovies(page: number = 1): Promise<MovieListResponse> {
  return fetchFromTMDB<MovieListResponse>('/movie/top_rated', { page: page.toString() });
}

// 获取电影详情
export async function getMovieDetail(movieId: number): Promise<MovieDetail> {
  return fetchFromTMDB<MovieDetail>(`/movie/${movieId}`, {
    append_to_response: 'credits,videos,similar'
  });
}

// 获取所有电影类型
export async function getMovieGenres(): Promise<Genre[]> {
  const response = await fetchFromTMDB<{ genres: Genre[] }>('/genre/movie/list');
  return response.genres;
}

// 搜索电影
export async function searchMovies(query: string, page: number = 1): Promise<MovieListResponse> {
  return fetchFromTMDB<MovieListResponse>('/search/movie', {
    query,
    page: page.toString()
  });
}

// 获取图片配置
export async function getImageConfig(): Promise<{
  base_url: string;
  poster_sizes: string[];
  backdrop_sizes: string[];
}> {
  const response = await fetch(`${BASE_URL}/configuration?api_key=${API_KEY}`);
  return response.json();
}

// 图片 URL 生成器
export function getPosterUrl(path: string | null, size: string = 'w500'): string {
  if (!path) return '/placeholder-poster.png';
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function getBackdropUrl(path: string | null, size: string = 'w1280'): string {
  if (!path) return '/placeholder-backdrop.png';
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
