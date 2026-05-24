import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articlesMeta, getArticleContent } from "@/data/articles";
import type { ReactNode } from "react";

function renderInlineBold(text: string): ReactNode {
  const parts = text.split(/(\*\*.+?\*\*)/);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return articlesMeta.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = articlesMeta.find((a) => a.slug === slug);
  if (!article) return { title: "文章未找到" };
  return { title: article.title, description: article.description };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const meta = articlesMeta.find((a) => a.slug === slug);
  if (!meta) notFound();

  const content = getArticleContent(slug);
  if (!content) notFound();

  const paragraphs = content.split("\n\n");

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <article className="container mx-auto px-4 py-12 max-w-2xl">
        <Link
          href="/articles"
          className="inline-flex items-center text-sm text-gray-400 hover:text-gray-600 transition-colors mb-8"
        >
          ← 返回文章列表
        </Link>

        <header className="mb-12">
          <h1 className="text-3xl font-semibold tracking-tight leading-snug">
            {meta.title}
          </h1>
          <div className="mt-4 text-sm text-gray-400">
            <time>{meta.date}</time>
          </div>
        </header>

        <div className="prose prose-gray max-w-none leading-relaxed">
          {paragraphs.map((para, i) => {
            const trimmed = para.trim();
            if (!trimmed) return null;

            // Markdown h2 headings: ## text
            if (trimmed.startsWith("## ")) {
              return (
                <h2
                  key={i}
                  className="text-xl font-semibold mt-10 mb-4 tracking-tight"
                >
                  {trimmed.replace(/^## /, "")}
                </h2>
              );
            }

            // Markdown h3 headings: ### text
            if (trimmed.startsWith("### ")) {
              return (
                <h3
                  key={i}
                  className="text-lg font-semibold mt-10 mb-4 tracking-tight"
                >
                  {trimmed.replace(/^### /, "")}
                </h3>
              );
            }

            // Bold-only paragraph: render as h2
            if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
              return (
                <h2
                  key={i}
                  className="text-xl font-semibold mt-10 mb-4 tracking-tight"
                >
                  {trimmed.replace(/\*\*/g, "")}
                </h2>
              );
            }

            return (
              <p
                key={i}
                className="mb-5 text-[15px] text-gray-700 leading-[1.8]"
              >
                {renderInlineBold(trimmed)}
              </p>
            );
          })}
        </div>

        <footer className="mt-16 pt-8 border-t border-gray-200">
          <Link
            href="/articles"
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← 返回文章列表
          </Link>
        </footer>
      </article>
    </main>
  );
}
