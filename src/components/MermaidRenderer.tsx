interface Props {
  code: string;
}

export default function MermaidRenderer({ code }: Props) {
  return (
    <pre className="bg-gray-100 rounded-lg p-4 my-6 overflow-x-auto text-sm">
      <code>{code}</code>
      <div className="mt-2 text-xs text-gray-400">
        ⬆ Mermaid 流程图（复制到 mermaid.live 查看）
      </div>
    </pre>
  );
}
