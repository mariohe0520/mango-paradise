/* ==========================================
   芒果庄园 - 季节活动系统 (完整版)
   Mango Paradise - Seasonal Events System
   12个月度主题 + 中国节日 + 限定奖励
   ========================================== */

const Seasons = {
    // ══════════════════════════════════════
    // 12 Monthly Themes (Chinese Holidays)
    // ══════════════════════════════════════
    THEMES: {
        1: {
            id: 'spring_festival',
            name: '◆ 春节庆典',
            nameShort: '春节',
            emoji: '◆',
            color: '#dc2626',
            description: '新年快乐！红包满天飞，芒果大丰收！',
            gemSkin: { mango: '◆', dragon: '龙', phoenix: '✸' },
            bonus: '金币奖励翻倍',
            bonusEffect: 'double_gold',
            bgClass: 'season-spring',
        },
        2: {
            id: 'valentine',
            name: '♥ 情人节',
            nameShort: '情人节',
            emoji: '♥',
            color: '#ec4899',
            description: '爱情的力量让宝石闪耀！',
            gemSkin: { mango: '♥', elf: '♥', mage: '♥' },
            bonus: '连击加成+50%',
            bonusEffect: 'combo_boost',
            bgClass: 'season-valentine',
        },
        3: {
            id: 'arbor_day',
            name: '♧ 植树节',
            nameShort: '植树节',
            emoji: '♧',
            color: '#22c55e',
            description: '种下希望的种子，庄园buff加成！',
            gemSkin: { murloc: '♧', knight: '♧', dwarf: '♧' },
            bonus: '庄园buff效果+30%',
            bonusEffect: 'estate_boost',
            bgClass: 'season-arbor',
        },
        4: {
            id: 'qingming',
            name: '✿ 清明时节',
            nameShort: '清明',
            emoji: '✿',
            color: '#f9a8d4',
            description: '春暖花开，迷雾渐散...',
            gemSkin: { elf: '✿', mage: '✿', undead: '✿' },
            bonus: '迷雾减少50%',
            bonusEffect: 'less_fog',
            bgClass: 'season-qingming',
        },
        5: {
            id: 'labor_day',
            name: '⚒ 劳动节',
            nameShort: '劳动节',
            emoji: '⚒',
            color: '#f97316',
            description: '劳动最光荣！每关额外步数！',
            gemSkin: { dwarf: '⚒', orc: '⚒', knight: '⚒' },
            bonus: '每关+3步',
            bonusEffect: 'extra_moves',
            bgClass: 'season-labor',
        },
        6: {
            id: 'dragon_boat',
            name: '龙 端午节',
            nameShort: '端午',
            emoji: '龙',
            color: '#059669',
            description: '龙舟竞渡，粽子飘香！',
            gemSkin: { dragon: '龙', mango: '◆', murloc: '≈' },
            bonus: 'Boss伤害+50%',
            bonusEffect: 'boss_damage',
            bgClass: 'season-dragon-boat',
        },
        7: {
            id: 'qixi',
            name: '♧ 七夕',
            nameShort: '七夕',
            emoji: '♧',
            color: '#7c3aed',
            description: '银河之上，牛郎织女相会...',
            gemSkin: { elf: '✧', mage: '★', phoenix: '✦' },
            bonus: '精灵亲密度获取x2',
            bonusEffect: 'affinity_boost',
            bgClass: 'season-qixi',
        },
        8: {
            id: 'mid_autumn',
            name: '◆ 中秋节',
            nameShort: '中秋',
            emoji: '◆',
            color: '#d97706',
            description: '月圆人团圆，月饼芒果香！',
            gemSkin: { mango: '◆', murloc: '◎', knight: '◆' },
            bonus: '分数加成x1.5',
            bonusEffect: 'score_boost',
            bgClass: 'season-mid-autumn',
        },
        9: {
            id: 'national_day',
            name: '🇨🇳 国庆节',
            nameShort: '国庆',
            emoji: '🇨🇳',
            color: '#dc2626',
            description: '普天同庆！全民狂欢！',
            gemSkin: { orc: '✦', knight: '✧', mage: '◆' },
            bonus: '经验值x2',
            bonusEffect: 'exp_boost',
            bgClass: 'season-national',
        },
        10: {
            id: 'halloween',
            name: '◆ 万圣节',
            nameShort: '万圣节',
            emoji: '◆',
            color: '#f97316',
            description: '不给糖就捣蛋！骷髅和南瓜的盛宴！',
            gemSkin: { undead: '◆', orc: '◇', skull: '☠' },
            bonus: '特殊宝石出现率+25%',
            bonusEffect: 'special_boost',
            bgClass: 'season-halloween',
        },
        11: {
            id: 'thanksgiving',
            name: '鸟 感恩节',
            nameShort: '感恩',
            emoji: '鸟',
            color: '#92400e',
            description: '感恩收获的季节！',
            gemSkin: { mango: '♧', dwarf: '鸟', elf: '♧' },
            bonus: '每日挑战奖励翻倍',
            bonusEffect: 'daily_boost',
            bgClass: 'season-thanksgiving',
        },
        12: {
            id: 'christmas',
            name: '♣ 圣诞节',
            nameShort: '圣诞',
            emoji: '♣',
            color: '#16a34a',
            description: '圣诞老人带来了芒果礼物！',
            gemSkin: { mango: '♪', phoenix: '♣', dragon: '★' },
            bonus: '所有奖励+30%',
            bonusEffect: 'all_boost',
            bgClass: 'season-christmas',
        },
    },

    // ══════════════════════════════════════
    // Seasonal Boss Pool
    // ══════════════════════════════════════
    SEASONAL_BOSSES: {
        1: { name: '年兽', emoji: '龙', hp: 20000, taunt: '新年快乐？我来给你发红包——骷髅红包！' },
        2: { name: '丘比特暗影', emoji: '♥', hp: 18000, taunt: '你的爱情...就到这里了！' },
        3: { name: '枯木精', emoji: '♠', hp: 16000, taunt: '所有的树苗都将枯萎！' },
        4: { name: '花妖', emoji: '✿', hp: 17000, taunt: '在花雨中沉睡吧...' },
        5: { name: '铁锤巨人', emoji: '⚒', hp: 22000, taunt: '劳动？我只会破坏！' },
        6: { name: '水龙王', emoji: '龙', hp: 25000, taunt: '龙舟竞赛？先过我这关！' },
        7: { name: '银河守卫', emoji: '★', hp: 20000, taunt: '牛郎织女永远不会相见！' },
        8: { name: '月兔魔王', emoji: '兔', hp: 22000, taunt: '月饼是我的！芒果也是我的！' },
        9: { name: '焰火恶魔', emoji: '✦', hp: 28000, taunt: '让焰火变成你的噩梦！' },
        10: { name: '南瓜王', emoji: '◆', hp: 24000, taunt: '不给糖？那就给你骷髅！' },
        11: { name: '饕餮', emoji: '食', hp: 20000, taunt: '所有的食物...都是我的！' },
        12: { name: '暗黑圣诞老人', emoji: '★', hp: 26000, taunt: '今年的礼物是...绝望！' },
    },

    // ══════════════════════════════════════
    // Core API
    // ══════════════════════════════════════

    getCurrentSeason() {
        const now = new Date();
        const month = now.getMonth() + 1;
        const theme = this.THEMES[month];
        const daysInMonth = new Date(now.getFullYear(), month, 0).getDate();
        const dayOfMonth = now.getDate();

        return {
            ...theme,
            month,
            year: now.getFullYear(),
            seasonId: `${now.getFullYear()}-${String(month).padStart(2, '0')}`,
            daysRemaining: daysInMonth - dayOfMonth,
            progress: dayOfMonth / daysInMonth,
            totalDays: daysInMonth,
            dayOfMonth,
        };
    },

    // Get seasonal gem skin overrides
    getGemSkins() {
        const season = this.getCurrentSeason();
        return season.gemSkin || {};
    },

    // Check if a seasonal bonus is active
    isSeasonalBonusActive(bonusType) {
        const season = this.getCurrentSeason();
        return season.bonusEffect === bonusType;
    },

    // Get the seasonal modifier value
    getSeasonalModifier(type) {
        const season = this.getCurrentSeason();
        switch (season.bonusEffect) {
            case 'double_gold': return type === 'gold' ? 2.0 : 1.0;
            case 'combo_boost': return type === 'combo' ? 1.5 : 1.0;
            case 'estate_boost': return type === 'estate' ? 1.3 : 1.0;
            case 'less_fog': return type === 'fog' ? 0.5 : 1.0;
            case 'extra_moves': return type === 'moves' ? 3 : 0;
            case 'boss_damage': return type === 'boss_damage' ? 1.5 : 1.0;
            case 'affinity_boost': return type === 'affinity' ? 2.0 : 1.0;
            case 'score_boost': return type === 'score' ? 1.5 : 1.0;
            case 'exp_boost': return type === 'exp' ? 2.0 : 1.0;
            case 'special_boost': return type === 'special' ? 1.25 : 1.0;
            case 'daily_boost': return type === 'daily' ? 2.0 : 1.0;
            case 'all_boost': return 1.3; // 30% to everything
            default: return 1.0;
        }
    },

    // ══════════════════════════════════════
    // Seasonal Levels (10 per season)
    // ══════════════════════════════════════

    getSeasonalLevels() {
        const season = this.getCurrentSeason();
        const levels = [];
        for (let i = 0; i < 10; i++) {
            levels.push(LevelGen.generateSeasonalLevel(season.seasonId, i));
        }
        return levels;
    },

    getSeasonalLevel(index) {
        const season = this.getCurrentSeason();
        return LevelGen.generateSeasonalLevel(season.seasonId, index);
    },

    // Get seasonal boss config
    getSeasonalBoss() {
        const season = this.getCurrentSeason();
        const bossDef = this.SEASONAL_BOSSES[season.month];
        if (!bossDef) return null;
        return {
            ...bossDef,
            phases: [
                { emoji: bossDef.emoji, hpPct: 1.0, attacks: ['ice', 'lock'], interval: 3, taunt: bossDef.taunt },
                { emoji: bossDef.emoji, hpPct: 0.4, attacks: ['ice', 'lock', 'shuffle', 'transform'], interval: 2, taunt: '不可能...！', announce: `${bossDef.name}狂暴了！` },
            ],
            weakness: null,
        };
    },

    // ══════════════════════════════════════
    // Seasonal Progress Tracking
    // ══════════════════════════════════════

    getSeasonData() {
        const season = this.getCurrentSeason();
        const key = `mango_season_${season.seasonId}`;
        return JSON.parse(localStorage.getItem(key) || '{}');
    },

    saveSeasonData(data) {
        const season = this.getCurrentSeason();
        const key = `mango_season_${season.seasonId}`;
        localStorage.setItem(key, JSON.stringify(data));
    },

    // Track seasonal level completion
    completeSeasonalLevel(index, score, stars) {
        const data = this.getSeasonData();
        if (!data.levels) data.levels = {};
        const prev = data.levels[index] || { bestScore: 0, stars: 0, completed: false };
        data.levels[index] = {
            bestScore: Math.max(prev.bestScore, score),
            stars: Math.max(prev.stars, stars),
            completed: true,
        };
        // Add season points
        data.points = (data.points || 0) + Math.floor(score / 100) + stars * 20;
        this.saveSeasonData(data);
    },

    getSeasonPoints() {
        const data = this.getSeasonData();
        return data.points || 0;
    },

    getCompletedSeasonLevels() {
        const data = this.getSeasonData();
        if (!data.levels) return 0;
        return Object.values(data.levels).filter(l => l.completed).length;
    },

    // ══════════════════════════════════════
    // Season Pass Rewards
    // ══════════════════════════════════════
    PASS_TIERS: [
        { points: 0, reward: '开始！', icon: '◎' },
        { points: 200, reward: '500¤', icon: '¤', gold: 500 },
        { points: 500, reward: '10◆', icon: '◆', gems: 10 },
        { points: 1000, reward: '季节宝石皮肤', icon: '◇', skinUnlock: true },
        { points: 1500, reward: '20◆ + 季节称号', icon: '◎', gems: 20, title: true },
        { points: 2000, reward: '30◆ + 专属装饰', icon: '✦', gems: 30, decoration: true },
        { points: 3000, reward: '50◆ + 传说称号', icon: '♕', gems: 50, legendTitle: true },
        { points: 5000, reward: '100◆ + 季节限定精灵皮肤', icon: '☆', gems: 100, legendSkin: true },
    ],

    getCurrentTier() {
        const pts = this.getSeasonPoints();
        let tier = 0;
        for (let i = this.PASS_TIERS.length - 1; i >= 0; i--) {
            if (pts >= this.PASS_TIERS[i].points) { tier = i; break; }
        }
        return tier;
    },

    claimTierReward(tierIndex) {
        const tier = this.PASS_TIERS[tierIndex];
        if (!tier) return false;

        const data = this.getSeasonData();
        if (!data.claimed) data.claimed = {};
        if (data.claimed[tierIndex]) return false;

        const pts = data.points || 0;
        if (pts < tier.points) return false;

        data.claimed[tierIndex] = true;
        this.saveSeasonData(data);

        if (tier.gold) Storage.addGold(tier.gold);
        if (tier.gems) Storage.addGems(tier.gems);
        if (tier.title) {
            const season = this.getCurrentSeason();
            if (!Storage.data.titles) Storage.data.titles = [];
            Storage.data.titles.push(`${season.nameShort}征服者`);
            Storage.save();
        }
        if (tier.legendTitle) {
            const season = this.getCurrentSeason();
            if (!Storage.data.titles) Storage.data.titles = [];
            Storage.data.titles.push(`${season.nameShort}传说`);
            Storage.save();
        }

        return true;
    },

    isTierClaimed(tierIndex) {
        const data = this.getSeasonData();
        return !!(data.claimed && data.claimed[tierIndex]);
    },

    // ══════════════════════════════════════
    // Add season points from any game activity
    // ══════════════════════════════════════
    addPoints(amount) {
        const data = this.getSeasonData();
        data.points = (data.points || 0) + amount;
        this.saveSeasonData(data);
    },
};
