/* ==========================================
   芒果庄园 - 图鉴系统
   Mango Paradise - Collection System
   魔兽世界风格的收集元素
   ========================================== */

// 图鉴条目定义
const COLLECTION_DATA = {
    // ==========================================
    // 种族图鉴
    // ==========================================
    creatures: [
        {
            id: 'murloc',
            name: '鱼人',
            emoji: '鱼',
            rarity: 'common',
            description: '芒果庄园中最常见的小生物，虽然看起来呆萌，但千万别小看它们的数量优势！',
            lore: '"Mrglglgl!" - 鱼人的战斗号角',
            unlockCondition: '首次消除鱼人即可解锁',
            stats: { attack: 2, health: 3, speed: 4 }
        },
        {
            id: 'orc',
            name: '兽人',
            emoji: '鬼',
            rarity: 'common',
            description: '来自德拉诺的勇猛战士，现在他们也被芒果的美味所征服。',
            lore: '为了部落！为了...芒果！',
            unlockCondition: '首次消除兽人即可解锁',
            stats: { attack: 5, health: 6, speed: 2 }
        },
        {
            id: 'elf',
            name: '精灵',
            emoji: '灵',
            rarity: 'common',
            description: '优雅的精灵族，他们的魔法让芒果园更加繁茂。',
            lore: '愿艾露恩照耀你的芒果园',
            unlockCondition: '首次消除精灵即可解锁',
            stats: { attack: 3, health: 3, speed: 5 }
        },
        {
            id: 'mage',
            name: '法师',
            emoji: '法',
            rarity: 'common',
            description: '掌握奥术的智者，他们用魔法加速芒果的成熟。',
            lore: '知识就是力量...也是好吃的芒果',
            unlockCondition: '首次消除法师即可解锁',
            stats: { attack: 6, health: 2, speed: 3 }
        },
        {
            id: 'knight',
            name: '骑士',
            emoji: '⚔',
            rarity: 'common',
            description: '守护芒果庄园的忠诚卫士，他们的剑守护着每一颗芒果。',
            lore: '以光明之名，守护芒果！',
            unlockCondition: '首次消除骑士即可解锁',
            stats: { attack: 4, health: 5, speed: 3 }
        },
        {
            id: 'dwarf',
            name: '矮人',
            emoji: '⚒',
            rarity: 'uncommon',
            description: '来自铁炉堡的工匠，他们发明了芒果收割机。',
            lore: '没有什么是一杯芒果酒解决不了的',
            unlockCondition: '通关第 11 关解锁',
            stats: { attack: 4, health: 7, speed: 2 }
        },
        {
            id: 'undead',
            name: '亡灵',
            emoji: '☠',
            rarity: 'uncommon',
            description: '死而复生的战士，即使在墓地里也要种芒果。',
            lore: '死亡只是开始...种芒果的开始',
            unlockCondition: '通关第 21 关解锁',
            stats: { attack: 5, health: 4, speed: 3 }
        },
        {
            id: 'mango',
            name: '芒果精灵',
            emoji: '芒',
            rarity: 'rare',
            description: '传说中的芒果之神化身，拥有让一切变成芒果的神奇力量。',
            lore: '芒果过敏？那是因为你还不够爱芒果！',
            unlockCondition: '通关第 31 关解锁',
            stats: { attack: 7, health: 7, speed: 7 }
        },
        {
            id: 'dragon',
            name: '巨龙',
            emoji: '龙',
            rarity: 'epic',
            description: '守护芒果宝藏的远古巨龙，它的火焰能烤出最美味的芒果干。',
            lore: '我的芒果山，凡人不得靠近！',
            unlockCondition: '通关第 41 关解锁',
            stats: { attack: 9, health: 10, speed: 4 }
        },
        {
            id: 'phoenix',
            name: '凤凰',
            emoji: '☆',
            rarity: 'legendary',
            description: '浴火重生的神鸟，它的羽毛能让芒果永不腐烂。',
            lore: '在火焰中重生，在芒果中永恒',
            unlockCondition: '通关第 51 关解锁',
            stats: { attack: 8, health: 8, speed: 10 }
        }
    ],

    // ==========================================
    // 道具图鉴
    // ==========================================
    items: [
        {
            id: 'hammer',
            name: '芒果锤',
            emoji: '⚒',
            rarity: 'common',
            description: '一锤子下去，任何宝石都会被消除。据说是矮人工匠用芒果核制成。',
            lore: '这锤子闻起来有点甜...',
            unlockCondition: '首次使用锤子道具',
            effect: '消除单个目标宝石'
        },
        {
            id: 'shuffle',
            name: '混乱之风',
            emoji: '↯',
            rarity: 'uncommon',
            description: '召唤一阵魔法风，将棋盘上所有宝石重新排列。',
            lore: '风起云涌，芒果乱飞',
            unlockCondition: '首次使用洗牌道具',
            effect: '重新排列所有宝石'
        },
        {
            id: 'hint',
            name: '智慧之眼',
            emoji: '※',
            rarity: 'common',
            description: '能看穿一切消除机会的神奇眼睛，找不到配对时的救星。',
            lore: '我看见了...一个芒果配对！',
            unlockCondition: '首次使用提示道具',
            effect: '显示可消除的配对'
        },
        {
            id: 'extraMoves',
            name: '时光沙漏',
            emoji: '⏳',
            rarity: 'rare',
            description: '能回溯时间的神器，给你额外的移动机会。',
            lore: '时间就是芒果，芒果就是金钱',
            unlockCondition: '首次使用额外步数道具',
            effect: '增加 5 步移动'
        },
        {
            id: 'colorBomb',
            name: '彩虹炸弹',
            emoji: '◇',
            rarity: 'epic',
            description: '传说中的神器，能消除棋盘上所有同类型的宝石。',
            lore: '彩虹的尽头不是金子，是芒果！',
            unlockCondition: '首次使用彩虹炸弹道具',
            effect: '消除所有选中类型的宝石'
        }
    ],

    // ==========================================
    // 特殊宝石图鉴
    // ==========================================
    specials: [
        {
            id: 'horizontal',
            name: '横向闪电',
            emoji: '→',
            rarity: 'uncommon',
            description: '蕴含横向能量的特殊宝石，激活时会清除整行。',
            lore: '横扫千军如卷席',
            unlockCondition: '首次创建横向特殊宝石（连接 4 个）',
            effect: '清除整行宝石'
        },
        {
            id: 'vertical',
            name: '纵向闪电',
            emoji: '↓',
            rarity: 'uncommon',
            description: '蕴含纵向能量的特殊宝石，激活时会清除整列。',
            lore: '天雷地火，纵贯乾坤',
            unlockCondition: '首次创建纵向特殊宝石（连接 4 个）',
            effect: '清除整列宝石'
        },
        {
            id: 'bomb',
            name: '爆炸宝石',
            emoji: '✸',
            rarity: 'rare',
            description: '极其不稳定的能量结晶，激活时会产生 3x3 范围爆炸。',
            lore: '小心轻放！这不是芒果干！',
            unlockCondition: '首次创建爆炸宝石（L 型或 T 型连接）',
            effect: '清除周围 3x3 范围'
        },
        {
            id: 'rainbow',
            name: '彩虹宝石',
            emoji: '◇',
            rarity: 'legendary',
            description: '传说级的神奇宝石，能与任何宝石配对并消除所有同类型。',
            lore: '七色光芒，万物归一',
            unlockCondition: '首次创建彩虹宝石（连接 5 个）',
            effect: '消除棋盘上所有选中类型的宝石'
        },
        {
            id: 'super_bomb',
            name: '超级炸弹',
            emoji: '✸',
            rarity: 'legendary',
            description: '两个特殊宝石组合产生的终极破坏力。',
            lore: '当两股力量合二为一...',
            unlockCondition: '首次组合两个特殊宝石',
            effect: '产生超大范围爆炸'
        },
        {
            id: 'cross',
            name: '十字闪电',
            emoji: '✚',
            rarity: 'epic',
            description: '横纵能量的完美结合，同时清除一行一列。',
            lore: '十字路口的选择？全都要！',
            unlockCondition: '组合两个闪电宝石',
            effect: '同时清除一行和一列'
        }
    ]
};

// 图鉴管理器
class CollectionManager {
    constructor() {
        this.data = COLLECTION_DATA;
    }

    // 获取所有类别
    getCategories() {
        return Object.keys(this.data);
    }

    // 获取指定类别的所有条目
    getCategory(category) {
        return this.data[category] || [];
    }

    // 获取指定条目
    getItem(category, id) {
        const items = this.data[category];
        return items ? items.find(item => item.id === id) : null;
    }

    // 检查是否已解锁
    isUnlocked(category, id) {
        return Storage.isCollected(category, id);
    }

    // 解锁条目
    unlock(category, id) {
        if (Storage.collect(category, id)) {
            const item = this.getItem(category, id);
            Utils.log.success(`Collection unlocked: ${item?.name || id}`);
            
            // 检查收集成就
            Achievements.check('collection');
            
            return true;
        }
        return false;
    }

    // 获取已解锁数量
    getUnlockedCount(category) {
        const collection = Storage.getCollection();
        return collection[category]?.length || 0;
    }

    // 获取总数量
    getTotalCount(category) {
        if (category) {
            return this.data[category]?.length || 0;
        }
        return Object.values(this.data).reduce((sum, items) => sum + items.length, 0);
    }

    // 获取稀有度颜色
    getRarityColor(rarity) {
        const colors = {
            common: '#9d9d9d',
            uncommon: '#1eff00',
            rare: '#0078ff',
            epic: '#a335ee',
            legendary: '#ff8000'
        };
        return colors[rarity] || colors.common;
    }

    // 获取稀有度名称
    getRarityName(rarity) {
        const names = {
            common: '普通',
            uncommon: '优秀',
            rare: '稀有',
            epic: '史诗',
            legendary: '传说'
        };
        return names[rarity] || '未知';
    }

    // 根据游戏事件检查解锁
    checkUnlock(event, data = {}) {
        const unlocked = [];

        switch (event) {
            case 'gem_match':
                // 首次消除某种宝石
                if (data.gemType) {
                    const creature = this.data.creatures.find(c => c.id === data.gemType);
                    if (creature && !this.isUnlocked('creatures', data.gemType)) {
                        if (this.unlock('creatures', data.gemType)) {
                            unlocked.push({ category: 'creatures', item: creature });
                        }
                    }
                }
                break;

            case 'special_create':
                // 创建特殊宝石
                if (data.specialType) {
                    const special = this.data.specials.find(s => s.id === data.specialType);
                    if (special && !this.isUnlocked('specials', data.specialType)) {
                        if (this.unlock('specials', data.specialType)) {
                            unlocked.push({ category: 'specials', item: special });
                        }
                    }
                }
                break;

            case 'item_use':
                // 使用道具
                if (data.itemId) {
                    const item = this.data.items.find(i => i.id === data.itemId);
                    if (item && !this.isUnlocked('items', data.itemId)) {
                        if (this.unlock('items', data.itemId)) {
                            unlocked.push({ category: 'items', item });
                        }
                    }
                }
                break;

            case 'level_complete':
                // 关卡完成检查
                const levelUnlocks = [
                    { level: 11, category: 'creatures', id: 'dwarf' },
                    { level: 21, category: 'creatures', id: 'undead' },
                    { level: 31, category: 'creatures', id: 'mango' },
                    { level: 41, category: 'creatures', id: 'dragon' },
                    { level: 51, category: 'creatures', id: 'phoenix' }
                ];

                levelUnlocks.forEach(unlock => {
                    if (data.level >= unlock.level && !this.isUnlocked(unlock.category, unlock.id)) {
                        const item = this.getItem(unlock.category, unlock.id);
                        if (this.unlock(unlock.category, unlock.id)) {
                            unlocked.push({ category: unlock.category, item });
                        }
                    }
                });
                break;

            case 'special_combo':
                // 特殊宝石组合
                if (!this.isUnlocked('specials', 'super_bomb')) {
                    const item = this.getItem('specials', 'super_bomb');
                    if (this.unlock('specials', 'super_bomb')) {
                        unlocked.push({ category: 'specials', item });
                    }
                }
                
                if (data.type === 'cross' && !this.isUnlocked('specials', 'cross')) {
                    const item = this.getItem('specials', 'cross');
                    if (this.unlock('specials', 'cross')) {
                        unlocked.push({ category: 'specials', item });
                    }
                }
                break;
        }

        return unlocked;
    }

    // 生成图鉴展示 HTML
    renderItem(category, id, isUnlocked) {
        const item = this.getItem(category, id);
        if (!item) return '';

        if (!isUnlocked) {
            return `
                <div class="collection-item locked" data-id="${id}" data-category="${category}">
                    <span class="item-icon">?</span>
                    <span class="item-name">???</span>
                </div>
            `;
        }

        return `
            <div class="collection-item unlocked" data-id="${id}" data-category="${category}" 
                 style="border-color: ${this.getRarityColor(item.rarity)}">
                <span class="item-icon">${item.emoji}</span>
                <span class="item-name">${item.name}</span>
            </div>
        `;
    }

    // 生成详情面板 HTML
    renderDetail(category, id) {
        const item = this.getItem(category, id);
        const isUnlocked = this.isUnlocked(category, id);

        if (!item) return '';

        if (!isUnlocked) {
            return `
                <div class="collection-detail-content locked">
                    <div class="detail-icon">?</div>
                    <h3>未解锁</h3>
                    <p class="unlock-hint">解锁条件：${item.unlockCondition}</p>
                </div>
            `;
        }

        const rarityColor = this.getRarityColor(item.rarity);
        const rarityName = this.getRarityName(item.rarity);

        let statsHtml = '';
        if (item.stats) {
            statsHtml = `
                <div class="detail-stats">
                    <div class="stat">⚔ ${item.stats.attack}</div>
                    <div class="stat">♥ ${item.stats.health}</div>
                    <div class="stat">→ ${item.stats.speed}</div>
                </div>
            `;
        }

        let effectHtml = '';
        if (item.effect) {
            effectHtml = `<p class="detail-effect">✦ ${item.effect}</p>`;
        }

        return `
            <div class="collection-detail-content">
                <div class="detail-icon" style="border-color: ${rarityColor}">
                    ${item.emoji}
                </div>
                <h3 style="color: ${rarityColor}">${item.name}</h3>
                <span class="detail-rarity" style="color: ${rarityColor}">${rarityName}</span>
                <p class="detail-desc">${item.description}</p>
                <p class="detail-lore">"${item.lore}"</p>
                ${statsHtml}
                ${effectHtml}
            </div>
        `;
    }
}

// 全局图鉴管理器实例
const Collection = new CollectionManager();
