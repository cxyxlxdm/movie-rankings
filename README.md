# 🎬 电影排行榜网站

一个展示正在热映、即将上映和影史经典电影的排行榜网站。

## 功能特点

- 🔥 **正在热映** - 当前在影院上映的热门电影
- 🎭 **即将上映** - 即将登陆影院的精彩电影
- 🏆 **影史 Top 100** - 根据评分排序的经典电影
- 📱 **响应式设计** - 完美适配手机、平板和桌面
- 🌐 **中英双语** - 支持中文和外国电影
- ⭐ **评分展示** - TMDB 评分一目了然

## 快速开始

### 1. 获取 TMDB API Key

1. 访问 [TMDB](https://www.themoviedb.org/)
2. 注册账号（免费）
3. 进入设置 → API → 申请 API Key
4. 选择"Developer"类型
5. 复制生成的 API Key（v3 auth）

### 2. 配置环境变量

复制 `.env.local.example` 为 `.env.local`：

```bash
cp .env.local.example .env.local
```

编辑 `.env.local`，填入你的 API Key：

```env
TMDB_API_KEY=你的_api_key_here
TMDB_BASE_URL=https://api.themoviedb.org/3
```

### 3. 安装依赖

```bash
npm install
```

### 4. 运行开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 部署到 Vercel

### 方法一：一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/movie-rankings)

### 方法二：手动部署

1. 安装 Vercel CLI：
   ```bash
   npm i -g vercel
   ```

2. 登录 Vercel：
   ```bash
   vercel login
   ```

3. 部署：
   ```bash
   vercel
   ```

4. 设置环境变量：
   - 在 Vercel 项目设置中添加 `TMDB_API_KEY`

5. 重新部署：
   ```bash
   vercel --prod
   ```

## 项目结构

```
movie-rankings/
├── src/
│   ├── app/                    # Next.js App Router 页面
│   │   ├── page.tsx           # 首页
│   │   ├── now-playing/       # 正在热映页面
│   │   ├── upcoming/          # 即将上映页面
│   │   ├── top-rated/         # 影史 Top 100 页面
│   │   └── movie/[id]/        # 电影详情页
│   ├── components/            # React 组件
│   │   └── MovieCard.tsx      # 电影卡片组件
│   └── lib/                   # 工具库
│       ├── tmdb.ts            # TMDB API 客户端
│       └── types.ts           # TypeScript 类型定义
├── .env.local                 # 环境变量（本地）
├── .env.local.example         # 环境变量示例
└── package.json
```

## 技术栈

- **框架**: Next.js 16 (App Router)
- **样式**: Tailwind CSS
- **语言**: TypeScript
- **数据源**: TMDB API
- **部署**: Vercel

## 数据来源说明

- 所有电影数据来自 [The Movie Database (TMDB)](https://www.themoviedb.org/)
- 评分使用 TMDB 自有评分系统
- 豆瓣评分和烂番茄评分由于 API 限制暂不支持

## 许可证

MIT

## 致谢

感谢 TMDB 提供免费且丰富的电影数据 API！
