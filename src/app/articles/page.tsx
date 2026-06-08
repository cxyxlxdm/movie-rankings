import type { Metadata } from "next";
import Link from "next/link";
import { articlesMeta } from "@/data/articles";

function parseDate(dateStr: string): number {
  // "2026年5月29日" → 20260529
  const m = dateStr.match(/(\d+)年(\d+)月(\d+)日/);
  if (!m) return 0;
  const y = m[1].padStart(4, "0");
  const mo = m[2].padStart(2, "0");
  const d = m[3].padStart(2, "0");
  return parseInt(`${y}${mo}${d}`);
}

export const metadata: Metadata = {
  title: "文章",
  description: "文章——关于历史、电影与思考",
};

export default function ArticlesIndex() {
  const sorted = [...articlesMeta].sort(
    (a, b) => parseDate(b.date) - parseDate(a.date)
  );
  return (
    <main className="min-h-screen bg-white dark:bg-[#0f172a] text-gray-900 dark:text-[#f1f5f9]">
      <header className="border-b border-gray-200 dark:border-[#334155] bg-gray-50/30 dark:bg-[#1e293b]">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-semibold tracking-tight">文章</h1>
          <p className="mt-2 text-gray-500 dark:text-[#94a3b8]">历史、电影与思考</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="space-y-6">
          {sorted.map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="block group border border-gray-200 dark:border-[#334155] rounded-lg p-6 hover:border-gray-300 dark:hover:border-[#475569] hover:bg-gray-50/50 dark:hover:bg-[#334155] transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-[#f1f5f9] group-hover:text-blue-600 dark:group-hover:text-[#60a5fa] transition-colors">
                    {article.title}
                  </h2>
                  <p className="mt-2 text-sm text-gray-500 dark:text-[#94a3b8] leading-relaxed line-clamp-3">
                    {article.description}
                  </p>
                </div>
                <span className="text-xs text-gray-400 dark:text-[#64748b] whitespace-nowrap mt-1">
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
