#!/bin/bash
# 芒果庄园部署脚本
# Mango Paradise Deployment Script

set -e

REPO_NAME="mango-paradise"
GITHUB_USER=""

echo "🥭 芒果庄园 - 部署脚本"
echo "========================"

# 检查 gh 是否已登录
if ! gh auth status >/dev/null 2>&1; then
    echo "📝 请先登录 GitHub..."
    gh auth login --web
fi

# 获取用户名
GITHUB_USER=$(gh api user -q .login)
echo "👤 GitHub 用户: $GITHUB_USER"

# 检查仓库是否存在
if gh repo view "$GITHUB_USER/$REPO_NAME" >/dev/null 2>&1; then
    echo "📦 仓库 $REPO_NAME 已存在"
else
    echo "📦 创建仓库 $REPO_NAME..."
    gh repo create "$REPO_NAME" --public --description "🥭 芒果庄园 - 魔兽世界风格三消游戏"
fi

# 添加远程仓库
if ! git remote get-url origin >/dev/null 2>&1; then
    git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"
else
    git remote set-url origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"
fi

# 提交所有更改
git add -A
git commit -m "Update: Mango Paradise" 2>/dev/null || echo "No changes to commit"

# 推送到 GitHub
echo "🚀 推送代码到 GitHub..."
git push -u origin main

# 启用 GitHub Pages
echo "🌐 启用 GitHub Pages..."
gh api -X PUT "repos/$GITHUB_USER/$REPO_NAME/pages" \
    -f "source[branch]=main" \
    -f "source[path]=/" 2>/dev/null || \
gh api -X POST "repos/$GITHUB_USER/$REPO_NAME/pages" \
    -f "build_type=workflow" 2>/dev/null || \
echo "请手动在仓库设置中启用 GitHub Pages"

echo ""
echo "✅ 部署完成！"
echo "🔗 游戏链接: https://$GITHUB_USER.github.io/$REPO_NAME/"
echo ""
echo "⏳ 首次部署可能需要几分钟生效..."
