"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  code: string;
}

export default function MermaidRenderer({ code }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const initializedRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        if (!initializedRef.current) {
          mermaid.initialize({
            startOnLoad: false,
            theme: "default",
            securityLevel: "loose",
          });
          initializedRef.current = true;
        }
        const id = `m-${Math.random().toString(36).slice(2, 8)}`;
        const { svg } = await mermaid.render(id, code);
        container.innerHTML = svg;
        setState("ready");
      } catch (err) {
        console.error("Mermaid render error:", err);
        setState("error");
      }
    })();
  }, [code]);

  if (state === "error") {
    return (
      <pre className="bg-gray-100 rounded-lg p-4 my-6 overflow-x-auto text-sm border border-red-200">
        <code>{code}</code>
        <div className="mt-2 text-xs text-red-400">⚠️ Mermaid 渲染失败</div>
      </pre>
    );
  }

  return (
    <div ref={containerRef} className="my-8 flex justify-center min-h-[60px]">
      {state === "loading" && (
        <code className="bg-gray-100 rounded px-1.5 py-0.5 text-sm font-mono">
          {code}
        </code>
      )}
    </div>
  );
}
