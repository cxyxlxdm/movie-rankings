import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "其他",
};

const apps = [
  {
    title: "电影排行榜",
    description: "正在热映、即将上映、影史经典",
    href: "/now-playing",
  },
  {
    title: "旅行攻略",
    description: "出行计划和路线",
    href: "/travel/2026/wuyi-plan.html",
  },
  {
    title: "性格测评",
    description: "双重选择画像测试",
    href: "/soul-mirror.html",
  },
  {
    title: "关于",
    description: "认真、脆弱与愤怒",
    href: "/about-self",
  },
] as const;

export default function AppsPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#0f172a] text-gray-900 dark:text-[#f1f5f9]">
      <div className="container mx-auto px-4 py-16 max-w-lg">
        <header className="mb-12">
          <h1 className="text-sm tracking-[0.3em] uppercase text-gray-400 dark:text-[#64748b] font-medium">
            Apps
          </h1>
        </header>

        <div className="grid grid-cols-2 gap-4">
          {apps.map((app) => (
            <Link
              key={app.href}
              href={app.href}
              className="flex flex-col items-center justify-center p-8 rounded-xl border border-gray-200 dark:border-[#334155] hover:border-gray-400 dark:hover:border-[#64748b] hover:bg-gray-50/50 dark:hover:bg-[#1e293b] transition-all text-center"
            >
              <span className="text-base font-semibold text-gray-900 dark:text-[#f1f5f9]">
                {app.title}
              </span>
              <span className="mt-1.5 text-xs text-gray-400 dark:text-[#64748b] leading-relaxed">
                {app.description}
              </span>
            </Link>
          ))}
        </div>

        <footer className="mt-16 pt-8 border-t border-gray-100 dark:border-[#1e293b]">
          <Link
            href="/"
            className="text-xs text-gray-400 dark:text-[#64748b] hover:text-gray-600 dark:hover:text-[#94a3b8] transition-colors"
          >
            ← 返回首页
          </Link>
        </footer>
      </div>
    </main>
  );
}
