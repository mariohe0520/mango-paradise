# 芒果庄园 Ultimate — 技术架构

## 概述
芒果主题庄园经营 RPG，目标让芒果过敏玩 1 年以上。

## 技术栈
- **前端**: HTML + CSS + JS（`js/` + `css/` + `assets/`）
- **PWA**: manifest.json + service worker
- **部署**: GitHub Pages (国外) + Cloudflare Tunnel (国内)
- **依赖**: package.json (最小化)

## 核心系统
| 系统 | 说明 |
|------|------|
| 庄园经营 | 种植/收获/升级 |
| Boss 战 | 复仇机制，无限循环 |
| 精灵系统 | 亲密度 40 节点 |
| 升级树 | 106 升级节点 |
| 赛季 | 12 月赛季循环 |
| 部落故事 | RPG 叙事线 |

## 差异化方向（不学 CC）
- Boss 战 / 精灵 / 庄园 RPG / 部落故事
- 系统深度 > 数值膨胀

## 已有文档
- `README.md`, `CHANGELOG.md`, `TODO-OPTIMIZATION.md`
- `DEPLOY_INSTRUCTIONS.md`

## 已知问题
- GitHub Pages 国内被墙 → Cloudflare Tunnel
- 教程不能挡滑动操作
- 格子最小 38px
- 目标 icon 自动读 GEM_TYPES

## 约束
- 目标用户：芒果过敏
- 移动端优先
- 状态存 localStorage，支持存档
- 加载速度敏感（国内网络环境）
