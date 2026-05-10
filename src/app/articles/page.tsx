import type { Metadata } from "next";
import Link from "next/link";
import { articlesMeta } from "@/data/articles";

export const metadata: Metadata = {
  title: "文章",
  description: "xAilurus 的文章——关于历史、电影与思考",
};

export default function ArticlesIndex() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <header className="border-b border-gray-200 bg-gray-50/30">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-semibold tracking-tight">文章</h1>
          <p className="mt-2 text-gray-500">xAilurus · 历史、电影与思考</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="space-y-6">
          {articlesMeta.map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="block group border border-gray-200 rounded-lg p-6 hover:border-gray-300 hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {article.title}
                  </h2>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed line-clamp-3">
                    {article.description}
                  </p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap mt-1">
                  {article.date}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
