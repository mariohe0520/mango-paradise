# 芒果庄园 Ultimate — 编码规范

## 继承
遵守 `../../GAME_STANDARDS.md` 通用标准

## 特有规范
- 系统模块化：庄园/Boss/精灵/赛季/部落各自独立 JS
- 存档格式有 schema 版本号，向后兼容
- 升级树/精灵亲密度数据走配置表
- 不做数值膨胀，深度 > 大数字
- deploy.sh / quick_deploy.sh 保持可用
- 每次发版更新 CHANGELOG.md
