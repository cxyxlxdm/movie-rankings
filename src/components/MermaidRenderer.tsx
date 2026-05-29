"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

interface Props {
  code: string;
}

let initialized = false;

export default function MermaidRenderer({ code }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    if (!initialized) {
      mermaid.initialize({
        startOnLoad: false,
        theme: "default",
        securityLevel: "loose",
      });
      initialized = true;
    }

    const container = containerRef.current;
    if (!container) return;

    const id = `mermaid-${Math.random().toString(36).slice(2, 8)}`;

    mermaid
      .render(id, code)
      .then(({ svg }) => {
        container.innerHTML = svg;
        setState("ready");
      })
      .catch((err: Error) => {
        console.error("Mermaid render error:", err);
        setState("error");
      });
  }, [code]);

  if (state === "error") {
    return (
      <pre className="bg-red-50 rounded-lg p-4 my-6 overflow-x-auto text-sm text-red-600 border border-red-200">
        <code>{code}</code>
        <div className="mt-2 text-xs text-red-400">
          ⚠️ Mermaid 渲染失败，以下为原始代码
        </div>
      </pre>
    );
  }

  return (
    <div ref={containerRef} className="my-8 flex justify-center min-h-[80px]">
      {state === "loading" && (
        <code className="bg-gray-100 rounded px-1.5 py-0.5 text-sm font-mono">
          {code}
        </code>
      )}
    </div>
  );
}
