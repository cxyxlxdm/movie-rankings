import Link from "next/link";
import { articlesMeta } from "@/data/articles";

function parseDate(dateStr: string): number {
  const m = dateStr.match(/(\d+)年(\d+)月(\d+)日/);
  if (!m) return 0;
  const y = m[1].padStart(4, "0");
  const mo = m[2].padStart(2, "0");
  const d = m[3].padStart(2, "0");
  return parseInt(`${y}${mo}${d}`);
}

export default function HomePage() {
  const sorted = [...articlesMeta].sort(
    (a, b) => parseDate(b.date) - parseDate(a.date)
  );

  return (
    <main className="min-h-screen bg-white dark:bg-[#0f172a] text-gray-900 dark:text-[#f1f5f9]">
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        {/* Header */}
        <header className="mb-16">
          <h1 className="text-sm tracking-[0.3em] uppercase text-gray-400 dark:text-[#64748b] font-medium">
            Ailurus
          </h1>
        </header>

        {/* Articles */}
        <div className="space-y-12">
          {sorted.map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="block group"
            >
              <article>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-[#f1f5f9] group-hover:text-blue-600 dark:group-hover:text-[#60a5fa] transition-colors leading-snug">
                  {article.title}
                </h2>
                <time className="block mt-2 text-sm text-gray-400 dark:text-[#64748b]">
                  {article.date}
                </time>
                <p className="mt-2 text-[15px] text-gray-600 dark:text-[#94a3b8] leading-relaxed line-clamp-3">
                  {article.description}
                </p>
              </article>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-gray-100 dark:border-[#1e293b]">
          <p className="text-xs text-gray-400 dark:text-[#64748b]">
            © {new Date().getFullYear()} Ailurus
          </p>
        </footer>
      </div>
    </main>
  );
}
