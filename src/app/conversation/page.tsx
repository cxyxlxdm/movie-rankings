import { Metadata } from "next";

export const metadata: Metadata = {
  title: "对话",
  description: "与 AI 代理的对话记录",
};

export default function ConversationIndex() {
  const conversations = [
    {
      title: "关于认真、脆弱与愤怒",
      subtitle: "一个工程师与 AI 代理的深夜交流——技术、人文、三观与自我",
      path: "/conversation/about-self",
      date: "2026年4月26日",
    },
    {
      title: "真事隐 · 雍正、历史叙事与学术诚实",
      subtitle: "从通读全书到逐条质疑——一本方法论惊艳但论证失衡的书",
      path: "/conversation/zhen-shi-yin",
      date: "2026年5月4日—5日",
    },
  ];

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <header className="border-b border-gray-200 bg-gray-50/30">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-semibold tracking-tight">
            对话
          </h1>
          <p className="mt-2 text-gray-500">
            与 AI 代理的对话记录
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="space-y-6">
          {conversations.map((conv) => (
            <a
              key={conv.path}
              href={conv.path}
              className="block group border border-gray-200 rounded-lg p-6 hover:border-gray-300 hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {conv.title}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 leading-relaxed">
                    {conv.subtitle}
                  </p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap mt-1">
                  {conv.date}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
