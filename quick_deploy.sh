#!/bin/bash
echo "🥭 芒果庄园 - 一键部署"
echo "======================"
echo ""
echo "正在启动 GitHub 授权..."
echo "请在浏览器中完成授权，然后返回此处。"
echo ""

gh auth login --hostname github.com --git-protocol https --web

if ! gh auth status >/dev/null 2>&1; then
    echo "❌ 授权失败，请重试"
    exit 1
fi

echo ""
echo "✅ GitHub 授权成功！"
echo ""

GITHUB_USER=$(gh api user -q .login)
REPO_NAME="mango-paradise"

echo "👤 GitHub 用户: $GITHUB_USER"
echo "📦 仓库名称: $REPO_NAME"
echo ""

# 检查仓库是否存在
if gh repo view "$GITHUB_USER/$REPO_NAME" >/dev/null 2>&1; then
    echo "仓库已存在，正在更新..."
else
    echo "创建新仓库..."
    gh repo create "$REPO_NAME" --public --description "🥭 芒果庄园 - 魔兽世界风格三消游戏" --source . --remote origin --push
fi

# 设置 remote
git remote set-url origin "https://github.com/$GITHUB_USER/$REPO_NAME.git" 2>/dev/null || \
git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"

# 推送
echo "推送代码..."
git push -u origin main --force

echo ""
echo "✅ 部署完成！"
echo ""
echo "🔗 游戏链接（几分钟后可访问）:"
echo "   https://$GITHUB_USER.github.io/$REPO_NAME/"
echo ""
echo "如果页面显示 404，请在仓库设置中启用 GitHub Pages:"
echo "   Settings -> Pages -> Source: main branch"
