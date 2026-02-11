/* ==========================================
   芒果庄园 - 成就系统
   Mango Paradise - Achievement System
   丰富的成就奖励
   ========================================== */

// 成就定义
const ACHIEVEMENTS = [
    // ==========================================
    // 入门成就
    // ==========================================
    {
        id: 'first_match',
        name: '初次尝试',
        description: '完成第一次消除',
        icon: '🎯',
        category: 'basic',
        reward: { gold: 50 },
        condition: { type: 'matches', target: 1 }
    },
    {
        id: 'first_win',
        name: '初战告捷',
        description: '首次通关',
        icon: '🏆',
        category: 'basic',
        reward: { gold: 100, gems: 5 },
        condition: { type: 'wins', target: 1 }
    },
    {
        id: 'first_star',
        name: '闪耀之星',
        description: '获得第一颗星星',
        icon: '⭐',
        category: 'basic',
        reward: { gold: 100 },
        condition: { type: 'stars', target: 1 }
    },
    {
        id: 'tutorial_complete',
        name: '毕业典礼',
        description: '完成新手教程',
        icon: '🎓',
        category: 'basic',
        reward: { gold: 200, items: [{ id: 'hint', amount: 3 }] },
        condition: { type: 'tutorial', target: 1 }
    },

    // ==========================================
    // 消除成就
    // ==========================================
    {
        id: 'match_100',
        name: '消消乐新手',
        description: '累计消除 100 次',
        icon: '💫',
        category: 'match',
        reward: { gold: 200 },
        condition: { type: 'matches', target: 100 }
    },
    {
        id: 'match_500',
        name: '消除达人',
        description: '累计消除 500 次',
        icon: '✨',
        category: 'match',
        reward: { gold: 500, gems: 10 },
        condition: { type: 'matches', target: 500 }
    },
    {
        id: 'match_1000',
        name: '消除大师',
        description: '累计消除 1000 次',
        icon: '🌟',
        category: 'match',
        reward: { gold: 1000, gems: 20 },
        condition: { type: 'matches', target: 1000 }
    },
    {
        id: 'match_5000',
        name: '消除传说',
        description: '累计消除 5000 次',
        icon: '💎',
        category: 'match',
        reward: { gold: 3000, gems: 50 },
        condition: { type: 'matches', target: 5000 }
    },

    // ==========================================
    // 连击成就
    // ==========================================
    {
        id: 'combo_3',
        name: '小连击',
        description: '达成 3 连击',
        icon: '🔥',
        category: 'combo',
        reward: { gold: 100 },
        condition: { type: 'combo', target: 3 }
    },
    {
        id: 'combo_5',
        name: '连击高手',
        description: '达成 5 连击',
        icon: '🔥',
        category: 'combo',
        reward: { gold: 300, gems: 5 },
        condition: { type: 'combo', target: 5 }
    },
    {
        id: 'combo_10',
        name: '连击大师',
        description: '达成 10 连击',
        icon: '💥',
        category: 'combo',
        reward: { gold: 800, gems: 15 },
        condition: { type: 'combo', target: 10 }
    },
    {
        id: 'combo_15',
        name: '连击传说',
        description: '达成 15 连击',
        icon: '⚡',
        category: 'combo',
        reward: { gold: 1500, gems: 30 },
        condition: { type: 'combo', target: 15 }
    },
    {
        id: 'combo_20',
        name: '连击之神',
        description: '达成 20 连击',
        icon: '👑',
        category: 'combo',
        reward: { gold: 3000, gems: 50 },
        condition: { type: 'combo', target: 20 }
    },

    // ==========================================
    // 特殊宝石成就
    // ==========================================
    {
        id: 'special_10',
        name: '特效初体验',
        description: '创建 10 个特殊宝石',
        icon: '✨',
        category: 'special',
        reward: { gold: 200 },
        condition: { type: 'specials', target: 10 }
    },
    {
        id: 'special_50',
        name: '特效收藏家',
        description: '创建 50 个特殊宝石',
        icon: '💫',
        category: 'special',
        reward: { gold: 500, gems: 10 },
        condition: { type: 'specials', target: 50 }
    },
    {
        id: 'special_200',
        name: '特效大师',
        description: '创建 200 个特殊宝石',
        icon: '🌈',
        category: 'special',
        reward: { gold: 1500, gems: 25 },
        condition: { type: 'specials', target: 200 }
    },
    {
        id: 'rainbow_1',
        name: '彩虹初现',
        description: '首次创建彩虹宝石',
        icon: '🌈',
        category: 'special',
        reward: { gold: 300, gems: 5 },
        condition: { type: 'rainbow', target: 1 }
    },
    {
        id: 'rainbow_20',
        name: '彩虹大师',
        description: '创建 20 个彩虹宝石',
        icon: '🌈',
        category: 'special',
        reward: { gold: 1000, gems: 20 },
        condition: { type: 'rainbow', target: 20 }
    },

    // ==========================================
    // 关卡成就
    // ==========================================
    {
        id: 'level_10',
        name: '森林探险家',
        description: '通关第 10 关',
        icon: '🌲',
        category: 'level',
        reward: { gold: 500, gems: 10 },
        condition: { type: 'level', target: 10 }
    },
    {
        id: 'level_20',
        name: '荒野求生者',
        description: '通关第 20 关',
        icon: '🏜️',
        category: 'level',
        reward: { gold: 1000, gems: 20 },
        condition: { type: 'level', target: 20 }
    },
    {
        id: 'level_30',
        name: '城市征服者',
        description: '通关第 30 关',
        icon: '🏰',
        category: 'level',
        reward: { gold: 1500, gems: 30 },
        condition: { type: 'level', target: 30 }
    },
    {
        id: 'level_40',
        name: '暗夜行者',
        description: '通关第 40 关',
        icon: '🌑',
        category: 'level',
        reward: { gold: 2000, gems: 40 },
        condition: { type: 'level', target: 40 }
    },
    {
        id: 'level_50',
        name: '火焰勇士',
        description: '通关第 50 关',
        icon: '🌋',
        category: 'level',
        reward: { gold: 3000, gems: 50 },
        condition: { type: 'level', target: 50 }
    },
    {
        id: 'level_60',
        name: '冰封王者',
        description: '通关全部 60 关',
        icon: '❄️',
        category: 'level',
        reward: { gold: 5000, gems: 100 },
        condition: { type: 'level', target: 60 }
    },

    // ==========================================
    // 星星成就
    // ==========================================
    {
        id: 'stars_30',
        name: '星光初现',
        description: '累计获得 30 颗星',
        icon: '⭐',
        category: 'stars',
        reward: { gold: 300 },
        condition: { type: 'total_stars', target: 30 }
    },
    {
        id: 'stars_90',
        name: '星河璀璨',
        description: '累计获得 90 颗星',
        icon: '🌟',
        category: 'stars',
        reward: { gold: 800, gems: 15 },
        condition: { type: 'total_stars', target: 90 }
    },
    {
        id: 'stars_150',
        name: '星辰大海',
        description: '累计获得 150 颗星',
        icon: '✨',
        category: 'stars',
        reward: { gold: 2000, gems: 30 },
        condition: { type: 'total_stars', target: 150 }
    },
    {
        id: 'perfect_10',
        name: '完美主义者',
        description: '10 个关卡获得 3 星',
        icon: '💯',
        category: 'stars',
        reward: { gold: 500, gems: 10 },
        condition: { type: 'perfect', target: 10 }
    },
    {
        id: 'perfect_30',
        name: '追求卓越',
        description: '30 个关卡获得 3 星',
        icon: '🎖️',
        category: 'stars',
        reward: { gold: 1500, gems: 30 },
        condition: { type: 'perfect', target: 30 }
    },

    // ==========================================
    // 分数成就
    // ==========================================
    {
        id: 'score_10k',
        name: '万分户',
        description: '单局得分超过 10000',
        icon: '📊',
        category: 'score',
        reward: { gold: 300 },
        condition: { type: 'single_score', target: 10000 }
    },
    {
        id: 'score_50k',
        name: '高分玩家',
        description: '单局得分超过 50000',
        icon: '📈',
        category: 'score',
        reward: { gold: 800, gems: 15 },
        condition: { type: 'single_score', target: 50000 }
    },
    {
        id: 'score_100k',
        name: '分数大师',
        description: '单局得分超过 100000',
        icon: '🎯',
        category: 'score',
        reward: { gold: 2000, gems: 30 },
        condition: { type: 'single_score', target: 100000 }
    },
    {
        id: 'total_100k',
        name: '积分小能手',
        description: '累计得分 100000',
        icon: '💰',
        category: 'score',
        reward: { gold: 500, gems: 10 },
        condition: { type: 'total_score', target: 100000 }
    },
    {
        id: 'total_1m',
        name: '百万富翁',
        description: '累计得分 1000000',
        icon: '💎',
        category: 'score',
        reward: { gold: 3000, gems: 50 },
        condition: { type: 'total_score', target: 1000000 }
    },

    // ==========================================
    // 签到成就
    // ==========================================
    {
        id: 'checkin_7',
        name: '持之以恒',
        description: '连续签到 7 天',
        icon: '📅',
        category: 'daily',
        reward: { gold: 500, gems: 10 },
        condition: { type: 'checkin_streak', target: 7 }
    },
    {
        id: 'checkin_30',
        name: '月度达人',
        description: '连续签到 30 天',
        icon: '🗓️',
        category: 'daily',
        reward: { gold: 2000, gems: 30 },
        condition: { type: 'checkin_streak', target: 30 }
    },
    {
        id: 'checkin_total_50',
        name: '签到达人',
        description: '累计签到 50 次',
        icon: '✅',
        category: 'daily',
        reward: { gold: 1000, gems: 20 },
        condition: { type: 'checkin_total', target: 50 }
    },

    // ==========================================
    // 收集成就
    // ==========================================
    {
        id: 'collect_murloc_100',
        name: '鱼人之友',
        description: '消除 100 个鱼人',
        icon: '🐟',
        category: 'collect',
        reward: { gold: 300 },
        condition: { type: 'gem_collect', gem: 'murloc', target: 100 }
    },
    {
        id: 'collect_mango_500',
        name: '芒果爱好者',
        description: '消除 500 个芒果',
        icon: '🥭',
        category: 'collect',
        reward: { gold: 1000, gems: 20 },
        condition: { type: 'gem_collect', gem: 'mango', target: 500 }
    },
    {
        id: 'collect_dragon_100',
        name: '驯龙高手',
        description: '消除 100 个巨龙',
        icon: '🐉',
        category: 'collect',
        reward: { gold: 1500, gems: 25 },
        condition: { type: 'gem_collect', gem: 'dragon', target: 100 }
    },
    {
        id: 'collect_phoenix_50',
        name: '凤凰涅槃',
        description: '消除 50 个凤凰',
        icon: '🔥',
        category: 'collect',
        reward: { gold: 2000, gems: 35 },
        condition: { type: 'gem_collect', gem: 'phoenix', target: 50 }
    },

    // ==========================================
    // 游戏次数成就
    // ==========================================
    {
        id: 'games_50',
        name: '入门玩家',
        description: '游玩 50 局',
        icon: '🎮',
        category: 'play',
        reward: { gold: 300 },
        condition: { type: 'games', target: 50 }
    },
    {
        id: 'games_200',
        name: '资深玩家',
        description: '游玩 200 局',
        icon: '🕹️',
        category: 'play',
        reward: { gold: 800, gems: 15 },
        condition: { type: 'games', target: 200 }
    },
    {
        id: 'games_500',
        name: '骨灰级玩家',
        description: '游玩 500 局',
        icon: '👾',
        category: 'play',
        reward: { gold: 2000, gems: 30 },
        condition: { type: 'games', target: 500 }
    },

    // ==========================================
    // 特殊成就
    // ==========================================
    {
        id: 'no_powerup_win',
        name: '纯粹实力',
        description: '不使用道具通关一关',
        icon: '💪',
        category: 'special',
        reward: { gold: 300, gems: 5 },
        condition: { type: 'no_powerup', target: 1 }
    },
    {
        id: 'speedrun',
        name: '闪电侠',
        description: '30 秒内完成一关',
        icon: '⚡',
        category: 'special',
        reward: { gold: 500, gems: 10 },
        condition: { type: 'speedrun', target: 30 }
    },
    {
        id: 'collector',
        name: '收藏家',
        description: '解锁 10 个图鉴条目',
        icon: '📖',
        category: 'special',
        reward: { gold: 500, gems: 10 },
        condition: { type: 'collection', target: 10 }
    },
    {
        id: 'full_collection',
        name: '全图鉴',
        description: '解锁全部图鉴',
        icon: '📚',
        category: 'special',
        reward: { gold: 5000, gems: 100 },
        condition: { type: 'collection', target: 'all' }
    }
];

// 成就管理器
class AchievementManager {
    constructor() {
        this.achievements = ACHIEVEMENTS;
        this.pendingUnlocks = [];
    }

    // 获取所有成就
    getAll() {
        return this.achievements;
    }

    // 获取成就详情
    get(id) {
        return this.achievements.find(a => a.id === id);
    }

    // 检查成就是否已解锁
    isUnlocked(id) {
        return Storage.isAchievementUnlocked(id);
    }

    // 获取已解锁数量
    getUnlockedCount() {
        return Storage.getAchievements().unlocked.length;
    }

    // 获取总数量
    getTotalCount() {
        return this.achievements.length;
    }

    // 检查并解锁成就
    check(type, value, extra = {}) {
        const unlockedNow = [];

        for (const achievement of this.achievements) {
            if (this.isUnlocked(achievement.id)) continue;

            const condition = achievement.condition;
            let shouldUnlock = false;

            switch (condition.type) {
                case 'matches':
                    if (type === 'match') {
                        const current = Storage.getStatistics().totalMatches;
                        shouldUnlock = current >= condition.target;
                    }
                    break;

                case 'wins':
                    if (type === 'win') {
                        const current = Storage.getStatistics().totalWins;
                        shouldUnlock = current >= condition.target;
                    }
                    break;

                case 'stars':
                case 'total_stars':
                    if (type === 'stars') {
                        const current = Storage.getTotalStars();
                        shouldUnlock = current >= condition.target;
                    }
                    break;

                case 'combo':
                    if (type === 'combo') {
                        shouldUnlock = value >= condition.target;
                    }
                    break;

                case 'specials':
                    if (type === 'special') {
                        const current = Storage.getStatistics().specialGemsCreated;
                        shouldUnlock = current >= condition.target;
                    }
                    break;

                case 'rainbow':
                    if (type === 'rainbow') {
                        const progress = Storage.getAchievementProgress(achievement.id) + 1;
                        Storage.setAchievementProgress(achievement.id, progress);
                        shouldUnlock = progress >= condition.target;
                    }
                    break;

                case 'level':
                    if (type === 'level_complete') {
                        shouldUnlock = value >= condition.target;
                    }
                    break;

                case 'perfect':
                    if (type === 'perfect') {
                        const current = Storage.getStatistics().perfectLevels;
                        shouldUnlock = current >= condition.target;
                    }
                    break;

                case 'single_score':
                    if (type === 'score') {
                        shouldUnlock = value >= condition.target;
                    }
                    break;

                case 'total_score':
                    if (type === 'score') {
                        const current = Storage.getStatistics().totalScore;
                        shouldUnlock = current >= condition.target;
                    }
                    break;

                case 'checkin_streak':
                    if (type === 'checkin') {
                        shouldUnlock = value >= condition.target;
                    }
                    break;

                case 'checkin_total':
                    if (type === 'checkin') {
                        const current = Storage.getCheckinData().totalCheckins;
                        shouldUnlock = current >= condition.target;
                    }
                    break;

                case 'gem_collect':
                    if (type === 'collect' && extra.gem === condition.gem) {
                        const progress = (Storage.getAchievementProgress(achievement.id) || 0) + value;
                        Storage.setAchievementProgress(achievement.id, progress);
                        shouldUnlock = progress >= condition.target;
                    }
                    break;

                case 'games':
                    if (type === 'game') {
                        const current = Storage.getStatistics().totalGames;
                        shouldUnlock = current >= condition.target;
                    }
                    break;

                case 'tutorial':
                    if (type === 'tutorial') {
                        shouldUnlock = true;
                    }
                    break;

                case 'collection':
                    if (type === 'collection') {
                        const collection = Storage.getCollection();
                        const total = collection.creatures.length + 
                                     collection.items.length + 
                                     collection.specials.length;
                        if (condition.target === 'all') {
                            shouldUnlock = total >= Collection.getTotalCount();
                        } else {
                            shouldUnlock = total >= condition.target;
                        }
                    }
                    break;

                case 'no_powerup':
                    if (type === 'win' && extra.noPowerup) {
                        shouldUnlock = true;
                    }
                    break;

                case 'speedrun':
                    if (type === 'win' && extra.time <= condition.target) {
                        shouldUnlock = true;
                    }
                    break;
            }

            if (shouldUnlock) {
                this.unlock(achievement);
                unlockedNow.push(achievement);
            }
        }

        return unlockedNow;
    }

    // 解锁成就
    unlock(achievement) {
        if (Storage.unlockAchievement(achievement.id)) {
            // 发放奖励
            if (achievement.reward.gold) {
                Storage.addGold(achievement.reward.gold);
            }
            if (achievement.reward.gems) {
                Storage.addGems(achievement.reward.gems);
            }
            if (achievement.reward.items) {
                achievement.reward.items.forEach(item => {
                    Storage.addItem(item.id, item.amount);
                });
            }

            // 添加到待显示队列
            this.pendingUnlocks.push(achievement);

            Utils.log.success(`Achievement unlocked: ${achievement.name}`);
            return true;
        }
        return false;
    }

    // 获取并清空待显示的成就
    getPendingUnlocks() {
        const pending = [...this.pendingUnlocks];
        this.pendingUnlocks = [];
        return pending;
    }

    // 获取成就进度
    getProgress(id) {
        const achievement = this.get(id);
        if (!achievement) return null;

        const condition = achievement.condition;
        let current = 0;
        let target = condition.target;

        switch (condition.type) {
            case 'matches':
                current = Storage.getStatistics().totalMatches;
                break;
            case 'wins':
                current = Storage.getStatistics().totalWins;
                break;
            case 'total_stars':
            case 'stars':
                current = Storage.getTotalStars();
                break;
            case 'combo':
                current = Storage.getStatistics().maxCombo;
                break;
            case 'specials':
                current = Storage.getStatistics().specialGemsCreated;
                break;
            case 'level':
                current = Storage.getMaxUnlockedLevel() - 1;
                break;
            case 'perfect':
                current = Storage.getStatistics().perfectLevels;
                break;
            case 'total_score':
                current = Storage.getStatistics().totalScore;
                break;
            case 'checkin_streak':
                current = Storage.getCheckinData().streak;
                break;
            case 'checkin_total':
                current = Storage.getCheckinData().totalCheckins;
                break;
            case 'games':
                current = Storage.getStatistics().totalGames;
                break;
            default:
                current = Storage.getAchievementProgress(id) || 0;
        }

        return {
            current: Math.min(current, target),
            target,
            percentage: Math.min(100, Math.floor((current / target) * 100))
        };
    }
}

// 全局成就管理器实例
const Achievements = new AchievementManager();
