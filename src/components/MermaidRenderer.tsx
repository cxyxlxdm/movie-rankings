"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  code: string;
}

let initialized = false;

export default function MermaidRenderer({ code }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialized) {
      import("mermaid").then((mermaid) => {
        mermaid.default.initialize({
          startOnLoad: false,
          theme: "default",
          securityLevel: "loose",
        });
      });
      initialized = true;
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const id = `mermaid-${Math.random().toString(36).slice(2, 8)}`;

    import("mermaid").then((mermaid) => {
      mermaid.default
        .render(id, code)
        .then(({ svg }) => {
          container.innerHTML = svg;
          setError(null);
        })
        .catch((err: Error) => {
          console.error("Mermaid render error:", err);
          setError(err.message);
        });
    });
  }, [code]);

  if (error) {
    return (
      <pre className="bg-red-50 rounded-lg p-4 my-6 overflow-x-auto text-sm text-red-600 border border-red-200">
        <code>{code}</code>
        <div className="mt-2 text-xs text-red-400">
          ⚠️ Mermaid 渲染失败：{error}
        </div>
      </pre>
    );
  }

  return (
    <div
      ref={containerRef}
      className="my-8 flex justify-center"
    />
  );
}
