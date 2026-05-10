import * as fs from "fs";
import * as path from "path";

export interface ArticleMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  originalUrl?: string;
}

export const articlesMeta: ArticleMeta[] = [
  {
    slug: "tai-ping-nian-song-dynasty",
    title: "历史的十字路口：《太平年》与宋朝命运的三次关键选择",
    date: "2026年5月10日",
    description:
      "重大历史题材剧《太平年》的深刻之处，在于它没有提供简单的答案。它铺陈出那个大分裂、大变革时代的历史底色，让观众看到每一个关键选择背后的复杂考量和无奈权衡。",
    originalUrl: "https://mp.weixin.qq.com/s/fIDU7HSAhHi9x5GRTdNf_A",
  },
];

export function getArticleContent(slug: string): string | null {
  const filePath = path.join(process.cwd(), "src/content/articles", `${slug}.md`);
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, "utf-8");
  }
  return null;
}
