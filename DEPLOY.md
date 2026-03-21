# 🚀 快速部署指南

## 方式一：Vercel CLI 部署（推荐）

### 步骤 1：登录 Vercel

```bash
vercel login
```

选择登录方式（GitHub/GitLab/Bitbucket/Email）

### 步骤 2：部署项目

在项目目录下运行：

```bash
cd /home/admin/openclaw/workspace/movie-rankings
vercel
```

按提示操作：
- Set up and deploy? → **Y**
- Which scope? → 选择你的账户
- Link to existing project? → **N**
- What's your project's name? → **movie-rankings**（或自定义）
- In which directory is your code located? → **./**
- Want to override the settings? → **N**

### 步骤 3：设置环境变量

部署完成后，设置 TMDB API Key：

```bash
vercel env add TMDB_API_KEY
```

输入你的 TMDB API Key，选择对所有环境生效（Production/Preview/Development）

### 步骤 4：重新部署

```bash
vercel --prod
```

部署完成后会返回一个公网 URL，类似：
```
https://movie-rankings-xxx.vercel.app
```

---

## 方式二：Vercel 网页部署

1. 访问 https://vercel.com/new
2. 点击 "Continue with GitHub" 登录
3. 点击 "Import Project"
4. 选择 "Import Git Repository"
5. 选择你的仓库（或先上传到 GitHub）
6. 在 "Environment Variables" 中添加：
   - `TMDB_API_KEY` = 你的 API Key
7. 点击 "Deploy"

---

## 获取 TMDB API Key

1. 访问 https://www.themoviedb.org/
2. 注册账号（免费）
3. 点击头像 → Settings → API → Request an API Key
4. 选择 "Developer"
5. 填写基本信息（网站可以填 localhost）
6. 复制生成的 **API Key (v3 auth)**

---

## 本地测试

部署前可以先本地测试：

```bash
# 设置环境变量
export TMDB_API_KEY=你的_api_key

# 运行开发服务器
npm run dev
```

访问 http://localhost:3000
