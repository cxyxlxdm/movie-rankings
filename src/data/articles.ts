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
    slug: "the-price-of-silence",
    title: "沉默的代价",
    date: "2026年9月6日",
    description:
      "从柴静面对熊召政的沉默，到波米对蒋方舟的不置一词——对陌生人的高标准与对亲近者的失语，是同一枚硬币的两面。当道德楷模自己打破设定的标准，沉默能持续一世吗？",
  },
  {
    slug: "claude-code-codex-design",
    title: "谈谈 Claude Code 与 Codex 的设计差异",
    date: "2026年7月16日",
    description:
      "深入对比 Claude Code 与 Codex 的设计哲学差异——从上下文窗口、CLI 交互、上下文管理到 Goal 与 Dynamic Workflows，最终指向一个结论：它们正在从相反的方向走向同一个终点。",
  },
  {
    slug: "mcp-mission-accomplished",
    title: "MCP 的使命已经完成",
    date: "2026年6月28日",
    description:
      "MCP 的 token 开销是结构性的、有状态连接与云原生架构从底层就不兼容、数据被迫流经模型导致效率低下——经过一年多的工程实践检验，MCP 的设计代价已经清晰到无法回避。行业正在用脚投票。",
  },
  {
    slug: "inertia",
    title: "惯性",
    date: "2026年6月14日",
    description:
      "中年之后，日子变成了复印件。关于惯性、妥协、意义感的消散，和那种平静——分不清是智慧还是投降。",
  },
  {
    slug: "about-zhengzhou",
    title: "关于郑州的记忆",
    date: "2026年6月9日",
    description:
      "二十二岁那年的郑州，月薪八百，欠薪六千。苦难没有造就我，是我自己本来就是这个样子——认真，固执，在一个不认真的世界里一直做认真的事。",
  },
  {
    slug: "dynamic-workflows",
    title: "Claude Code Dynamic Workflows 技术指南",
    date: "2026年5月31日",
    description:
      "多 Agent 编排从\u201c模型驱动\u201d到\u201c代码驱动\u201d的范式升级。深入分析 Agent Workflow 的设计缺陷，提出动态工作流引擎的架构方案。",
  },
  {
    slug: "multi-agent-code-review",
    title: "多 Agent 协同代码审查：独立进程 Review Agent 架构设计与实践",
    date: "2026年5月17日",
    description:
      "基于 Claude Code + Qoder CLI 的实战经验，提炼出一套轻量、通用的多 Agent 协同审查方案。Shell 脚本即全部基础设施，不需要额外平台或服务。",
  },
  {
    slug: "south-slav-mirror",
    title: "南斯拉夫的镜子",
    date: "2026年5月27日",
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
  {
    slug: "yi-ju-ding-yi-wan-ju",
    title: "咽下的话，和走过的路",
    date: "2026年5月31日",
    description:
      "重读《一句顶一万句》——三代人，近百年，都在找一个能说得着的人。吴摩西丢了巧玲，用一辈子躲。巧玲被弄丢了，用一辈子守。牛爱国什么也没弄明白，用一辈子走。孤独是宿命，但有人让你愿意把孤独咽下去，替他担一份安宁。",
  },
  {
    slug: "lao-qiang",
    title: "老墙",
    date: "2026年6月11日",
    description:
      "一面老墙，一丛小紫花，一段被遗忘的黄昏。记忆像墙皮一样层层剥落，露出底下深浅不一的底色。有些话终究不必说出口，有些人太久没有见了。",
  },
  {
    slug: "code-bets-flywheel",
    title: "代码、赌局与飞轮：大模型智能进化的隐秘路径",
    date: "2026年6月5日",
    description:
      "从 Anthropic 在代码数据上的重注，到 Coding Agent 带来的线上回流——大模型的进化路径，正从拼数据转向拼手艺。",
  },
  {
    slug: "zhen-shi-yin-review",
    title: "真事隐 · 从新材料到旧结论",
    date: "2026年6月8日",
    description:
      "孙立天新作延续《康熙的红票》的路径，从传教士记录切入九子夺嫡。切入点不错，但证据到结论之间缺了好几环。在\u201c不一致\u201d和\u201c篡改\u201d之间画了等号——这是全书最核心的论证缺陷。",
  },
];

export function getArticleContent(slug: string): string | null {
  const filePath = path.join(process.cwd(), "src/content/articles", `${slug}.md`);
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, "utf-8");
  }
  return null;
}
