// 电影类型定义

export interface Movie {
  id: number;
  title: string;
  original_title?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  release_date: string;
  popularity: number;
  genre_ids: number[];
  adult: boolean;
  video: boolean;
  original_language: string;
}

export interface MovieDetail extends Movie {
  runtime?: number;
  genres?: Genre[];
  production_countries?: Country[];
  spoken_languages?: Language[];
  status?: string;
  tagline?: string;
  budget?: number;
  revenue?: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Country {
  iso_3166_1: string;
  name: string;
}

export interface Language {
  iso_639_1: string;
  name: string;
  english_name: string;
}

export interface MovieListResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface ImageConfig {
  baseUrl: string;
  sizes: {
    poster: string[];
    backdrop: string[];
    profile: string[];
    logo: string[];
    still: string[];
  };
}
