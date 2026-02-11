# 🚀 芒果庄园部署指南

## 方法 1：GitHub Pages（推荐）

### 第一步：登录 GitHub
在终端运行：
```bash
gh auth login
```
按照提示完成登录。

### 第二步：运行部署脚本
```bash
cd /Users/mario/.openclaw/workspace/games/mango-paradise-ultimate
./deploy.sh
```

---

## 方法 2：手动部署

1. 在 GitHub 创建新仓库 `mango-paradise`
2. 运行以下命令：
```bash
cd /Users/mario/.openclaw/workspace/games/mango-paradise-ultimate
git remote add origin https://github.com/YOUR_USERNAME/mango-paradise.git
git push -u origin main
```
3. 在仓库设置中启用 GitHub Pages（选择 main 分支）

---

## 方法 3：本地预览

运行以下命令启动本地服务器：
```bash
cd /Users/mario/.openclaw/workspace/games/mango-paradise-ultimate
npx serve
```
然后打开 http://localhost:3000

---

## 游戏文件位置
`/Users/mario/.openclaw/workspace/games/mango-paradise-ultimate/`

