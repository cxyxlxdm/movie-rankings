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
    slug: "south-slav-mirror",
    title: "南斯拉夫的镜子",
    date: "2026年5月17日",
    description:
      "从南斯拉夫男篮黄金一代的友谊与破碎，到《澎湖海战》引发的舆论撕裂——民族主义如何撕裂一个国家、一段友谊、一个更衣室。南斯拉夫的教训，今天读来格外刺耳。",
  },
  {
    slug: "tai-ping-nian-song-dynasty",
    title: "历史的十字路口：《太平年》与宋朝命运的三次关键选择",
    date: "2026年5月10日",
    description:
      "重大历史题材剧《太平年》的深刻之处，在于它没有提供简单的答案。它铺陈出那个大分裂、大变革时代的历史底色，让观众看到每一个关键选择背后的复杂考量和无奈权衡。",
    originalUrl: "https://mp.weixin.qq.com/s/fIDU7HSAhHi9x5GRTdNf_A",
  },
  {
    slug: "tai-ping-nian-gray-scale",
    title: "历史的灰度：《太平年》如何重塑我们对历史人物的想象",
    date: "2026年5月10日",
    description:
      "《太平年》把我们引向了那个时代更复杂的褶皱处：它用一份勇气和同情，把那些被历史标签框住的人，重新变成了有血有肉、充满矛盾的个体。赵光义、钱弘俶、李煜、冯道、桑维翰——每个人都在自己的十字路口做出了选择。",
  },
];

export function getArticleContent(slug: string): string | null {
  const filePath = path.join(process.cwd(), "src/content/articles", `${slug}.md`);
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, "utf-8");
  }
  return null;
}
