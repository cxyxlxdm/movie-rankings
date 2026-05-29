import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articlesMeta, getArticleContent } from "@/data/articles";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { Children } from "react";
import MermaidRenderer from "@/components/MermaidRenderer";

const customComponents: Components = {
  h2: ({ children }) => (
    <h2 className="text-xl font-semibold mt-10 mb-4 tracking-tight">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-semibold mt-10 mb-4 tracking-tight">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mb-5 text-[15px] text-gray-700 leading-[1.8]">{children}</p>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-6 mb-5 text-[15px] text-gray-700 leading-[1.8]">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-6 mb-5 text-[15px] text-gray-700 leading-[1.8]">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="mb-1">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-gray-300 pl-4 my-6 text-gray-500 italic">
      {children}
    </blockquote>
  ),
  code: ({ className, children }) => {
    const isMermaid =
      typeof className === "string" && className.includes("language-mermaid");
    if (isMermaid) {
      return (
        <div data-mermaid="true">
          <MermaidRenderer code={String(children)} />
        </div>
      );
    }
    return (
      <code className="bg-gray-100 rounded px-1.5 py-0.5 text-sm font-mono">
        {children}
      </code>
    );
  },
  pre: ({ children }) => {
    const child = Children.only(children);
    if (child && typeof child === "object" && "props" in child) {
      const el = child as React.ReactElement<{ [key: string]: unknown }>;
      if (el.props && el.props["data-mermaid"] === "true") {
        return <>{children}</>;
      }
    }
    return (
      <pre className="bg-gray-100 rounded-lg p-4 my-6 overflow-x-auto text-sm">
        {children}
      </pre>
    );
  },
  table: ({ children }) => (
    <div className="overflow-x-auto my-6">
      <table className="w-full border-collapse border border-gray-300 text-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-gray-100">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="border border-gray-300 px-3 py-2 text-left font-semibold whitespace-nowrap">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-gray-300 px-3 py-2">{children}</td>
  ),
  hr: () => <hr className="my-10 border-gray-200" />,
  strong: ({ children }) => (
    <strong className="font-semibold">{children}</strong>
  ),
};

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

        <div className="leading-relaxed">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={customComponents}
          >
            {content}
          </ReactMarkdown>
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
