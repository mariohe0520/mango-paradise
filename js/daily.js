/* ==========================================
   每日挑战 & 无尽模式
   Daily Challenge & Endless Mode
   ========================================== */

const DailyChallenge = {
    // Generate a deterministic daily seed from date
    getSeed() {
        const d = new Date();
        return d.getFullYear() * 10000 + (d.getMonth()+1) * 100 + d.getDate();
    },

    // Seeded random
    seededRandom(seed) {
        let s = seed;
        return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
    },

    // Generate today's challenge level
    generate() {
        const seed = this.getSeed();
        const rng = this.seededRandom(seed);
        const allGems = Object.keys(GEM_TYPES);
        const commonGems = allGems.filter(g => GEM_TYPES[g].rarity === 'common');

        // Pick 5-6 gem types for today
        const numGems = 5 + Math.floor(rng() * 2);
        const gems = [];
        const pool = [...commonGems];
        for (let i = 0; i < Math.min(numGems, pool.length); i++) {
            const idx = Math.floor(rng() * pool.length);
            gems.push(pool.splice(idx, 1)[0]);
        }
        // 30% chance to include a rare/epic gem
        if (rng() < 0.3) gems.push('mango');
        if (rng() < 0.15) gems.push('dragon');

        // Random modifiers for today
        const modifiers = [];
        const modPool = ['timed', 'limited_moves', 'boss', 'big_board', 'small_board', 'frozen_start', 'locked_start'];
        const numMods = 1 + Math.floor(rng() * 2);
        for (let i = 0; i < numMods; i++) {
            const idx = Math.floor(rng() * modPool.length);
            modifiers.push(modPool.splice(idx, 1)[0]);
        }

        // Build level config
        const isTimed = modifiers.includes('timed');
        const isBoss = modifiers.includes('boss');
        const isBig = modifiers.includes('big_board');
        const isSmall = modifiers.includes('small_board');
        const w = isBig ? 9 : isSmall ? 6 : 8;
        const h = isBig ? 11 : isSmall ? 8 : 10;
        const moves = isTimed ? 999 : 25 + Math.floor(rng() * 15);
        const timeLimit = isTimed ? 60 + Math.floor(rng() * 60) : 0;

        // Random objectives
        const objectives = [];
        const objTypes = ['score', 'clear', 'special', 'combo'];
        const objType = objTypes[Math.floor(rng() * objTypes.length)];
        switch (objType) {
            case 'score':
                objectives.push({ type: 'score', target: 3000 + Math.floor(rng() * 5000), icon: '⭐' });
                break;
            case 'clear':
                const gemToClear = gems[Math.floor(rng() * gems.length)];
                const gd = GEM_TYPES[gemToClear];
                objectives.push({ type: 'clear', target: 15 + Math.floor(rng() * 25), gem: gemToClear, icon: gd?.emoji || '❓' });
                break;
            case 'special':
                objectives.push({ type: 'special', target: 3 + Math.floor(rng() * 5), specialType: 'any', icon: '✨' });
                break;
            case 'combo':
                objectives.push({ type: 'combo', target: 3 + Math.floor(rng() * 5), icon: '🔥' });
                break;
        }

        // Boss for daily
        const bossId = isBoss ? (seed % 10) * 10 + 10 : null;

        return {
            id: 9001, // special daily ID
            daily: true,
            seed,
            width: w,
            height: h,
            moves,
            timed: isTimed,
            timeLimit,
            gems,
            objectives,
            boss: isBoss,
            bossId,
            stars: [3000, 6000, 10000],
            modifiers,
            blockers: modifiers.includes('frozen_start') ? ['frozen'] : (modifiers.includes('locked_start') ? ['locked'] : []),
            special: {}
        };
    },

    // Check if already played today
    hasPlayedToday() {
        const data = JSON.parse(localStorage.getItem('mango_daily') || '{}');
        return data.lastSeed === this.getSeed();
    },

    // Record completion
    recordCompletion(score, stars) {
        const data = JSON.parse(localStorage.getItem('mango_daily') || '{}');
        data.lastSeed = this.getSeed();
        data.lastScore = score;
        data.lastStars = stars;
        data.streak = (data.streak || 0) + 1;
        data.totalPlayed = (data.totalPlayed || 0) + 1;
        localStorage.setItem('mango_daily', JSON.stringify(data));
    },

    getStreak() {
        const data = JSON.parse(localStorage.getItem('mango_daily') || '{}');
        return data.streak || 0;
    }
};

// ==========================================
// Endless Mode — procedural infinite levels
// ==========================================

const EndlessMode = {
    currentWave: 0,
    totalScore: 0,
    isActive: false,

    start() {
        this.currentWave = 1;
        this.totalScore = 0;
        this.isActive = true;
        return this.generateWave();
    },

    generateWave() {
        const w = this.currentWave;
        const allGems = Object.keys(GEM_TYPES);
        const commonGems = allGems.filter(g => GEM_TYPES[g].rarity === 'common');

        // Progressively add more gem types (harder = more types = harder to match)
        const numGems = Math.min(4 + Math.floor(w / 5), commonGems.length);
        const gems = commonGems.slice(0, numGems);
        // Every 10 waves, add rare gems
        if (w >= 10 && w % 10 === 0) gems.push('mango');
        if (w >= 20 && w % 20 === 0) gems.push('dragon');
        if (w >= 30) gems.push('phoenix');

        // Moves decrease as waves progress (harder)
        const moves = Math.max(12, 30 - Math.floor(w / 3));

        // Score target increases
        const scoreTarget = 1000 + w * 500;

        // Every 5th wave is a boss
        const isBoss = w % 5 === 0;

        // Board size varies
        const sizes = [[7,9],[8,10],[8,10],[9,11],[7,9]];
        const [bw, bh] = sizes[w % sizes.length];

        // Modifiers get crazier at higher waves
        const blockers = [];
        if (w >= 8) blockers.push('frozen');
        if (w >= 15) blockers.push('locked');

        const objectives = [{ type: 'score', target: scoreTarget, icon: '⭐' }];
        // Add extra objectives at higher waves
        if (w >= 5) {
            const gem = gems[w % gems.length];
            objectives.push({ type: 'clear', target: 10 + w, gem, icon: GEM_TYPES[gem]?.emoji || '❓' });
        }
        if (w >= 12) {
            objectives.push({ type: 'combo', target: Math.min(3 + Math.floor(w/8), 8), icon: '🔥' });
        }

        return {
            id: 8000 + w,
            endless: true,
            wave: w,
            width: bw,
            height: bh,
            moves,
            gems,
            objectives,
            boss: isBoss,
            stars: [scoreTarget, scoreTarget * 1.5, scoreTarget * 2.5],
            blockers,
            special: {},
            timed: w % 7 === 0, // every 7th wave is timed
            timeLimit: w % 7 === 0 ? Math.max(45, 90 - w) : 0
        };
    },

    nextWave(score) {
        this.totalScore += score;
        this.currentWave++;
        return this.generateWave();
    },

    getHighScore() {
        return parseInt(localStorage.getItem('mango_endless_high') || '0');
    },

    saveHighScore() {
        const prev = this.getHighScore();
        if (this.totalScore > prev) {
            localStorage.setItem('mango_endless_high', this.totalScore.toString());
            localStorage.setItem('mango_endless_wave', this.currentWave.toString());
            return true; // new record!
        }
        return false;
    },

    getHighWave() {
        return parseInt(localStorage.getItem('mango_endless_wave') || '0');
    }
};

/* ==========================================
   Weekly Challenge — 周赛系统
   每周一个特殊挑战，全球排行（本地模拟）
   CC没有的：Boss周赛 + 限定规则 + 排名奖励
   ========================================== */
const WeeklyChallenge = {
    getWeekSeed() {
        const d = new Date();
        const jan1 = new Date(d.getFullYear(), 0, 1);
        const weekNum = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
        return d.getFullYear() * 100 + weekNum;
    },

    generate() {
        const seed = this.getWeekSeed();
        const rng = DailyChallenge.seededRandom(seed);
        const allGems = Object.keys(GEM_TYPES);
        const commonGems = allGems.filter(g => GEM_TYPES[g].rarity === 'common');

        // Weekly themes rotate
        const themes = [
            { name: '🔥 烈焰周赛', mod: 'timed', desc: '限时挑战！速度就是一切！' },
            { name: '👹 Boss 挑战赛', mod: 'boss', desc: '击败超强Boss！' },
            { name: '❄️ 冰封地狱', mod: 'frozen', desc: '全场冰冻，打破束缚！' },
            { name: '🌈 彩虹大师', mod: 'special', desc: '创造尽可能多的特殊宝石！' },
            { name: '🎯 精准打击', mod: 'limited', desc: '极少步数，每步都关键！' },
            { name: '🏔️ 巨人棋盘', mod: 'big', desc: '超大棋盘，无处可逃！' },
        ];
        const theme = themes[seed % themes.length];

        // Pick 6 gems
        const gems = [];
        const pool = [...commonGems];
        for (let i = 0; i < Math.min(6, pool.length); i++) {
            const idx = Math.floor(rng() * pool.length);
            gems.push(pool.splice(idx, 1)[0]);
        }
        gems.push('mango'); // always include signature gem

        const isTimed = theme.mod === 'timed';
        const isBoss = theme.mod === 'boss';
        const isBig = theme.mod === 'big';
        const isLimited = theme.mod === 'limited';
        const isFrozen = theme.mod === 'frozen';

        const w = isBig ? 9 : 8;
        const h = isBig ? 11 : 10;
        const moves = isLimited ? 15 : (isTimed ? 999 : 30);
        const timeLimit = isTimed ? 120 : 0;

        // Objectives: always score + one themed objective
        const objectives = [
            { type: 'score', target: 10000, icon: '⭐' }
        ];
        if (theme.mod === 'special') {
            objectives.push({ type: 'special', target: 10, specialType: 'any', icon: '✨' });
        } else if (theme.mod === 'frozen') {
            objectives.push({ type: 'clear', target: 40, gem: 'mango', icon: '🥭' });
        } else {
            const gem = gems[Math.floor(rng() * (gems.length - 1))]; // not mango
            objectives.push({ type: 'clear', target: 25, gem, icon: GEM_TYPES[gem]?.emoji || '❓' });
        }

        return {
            id: 9500,
            weekly: true,
            seed,
            themeName: theme.name,
            themeDesc: theme.desc,
            width: w, height: h,
            moves,
            timed: isTimed, timeLimit,
            gems,
            objectives,
            boss: isBoss,
            stars: [10000, 18000, 30000],
            special: {},
            blockers: isFrozen ? ['frozen'] : []
        };
    },

    getData() {
        return JSON.parse(localStorage.getItem('mango_weekly') || '{}');
    },

    getBestScore() {
        const data = this.getData();
        return data.weekSeed === this.getWeekSeed() ? (data.bestScore || 0) : 0;
    },

    getAttempts() {
        const data = this.getData();
        return data.weekSeed === this.getWeekSeed() ? (data.attempts || 0) : 0;
    },

    recordAttempt(score, stars) {
        const data = this.getData();
        const seed = this.getWeekSeed();
        if (data.weekSeed !== seed) {
            // New week — reset
            data.weekSeed = seed;
            data.bestScore = 0;
            data.attempts = 0;
            data.bestStars = 0;
        }
        data.attempts++;
        if (score > (data.bestScore || 0)) {
            data.bestScore = score;
            data.bestStars = stars;
        }
        localStorage.setItem('mango_weekly', JSON.stringify(data));
    },

    // Simulated leaderboard (seeded fake players for competition feel)
    getLeaderboard() {
        const seed = this.getWeekSeed();
        const rng = DailyChallenge.seededRandom(seed * 31);
        const names = ['小明', '芒果达人', '消消乐王', '无敌破坏王', '甜蜜冒险家',
                       '宝石猎人', 'Boss终结者', '三星大师', '连击之王', '庄园领主',
                       '阿花', '大黄', '小胖', '蜜蜂侠', '彩虹仙子'];
        const board = [];
        for (let i = 0; i < 10; i++) {
            board.push({
                rank: i + 1,
                name: names[Math.floor(rng() * names.length)],
                score: Math.floor(15000 + rng() * 25000 - i * 2000)
            });
        }
        board.sort((a, b) => b.score - a.score);
        board.forEach((e, i) => e.rank = i + 1);

        // Insert player's best score
        const myBest = this.getBestScore();
        if (myBest > 0) {
            board.push({ rank: 0, name: '🥭 你', score: myBest, isPlayer: true });
            board.sort((a, b) => b.score - a.score);
            board.forEach((e, i) => e.rank = i + 1);
        }
        return board.slice(0, 15);
    }
};

// ══════════════════════════════════════
// 👹 Boss Revenge — beaten bosses return stronger
// ══════════════════════════════════════
const BossRevenge = {
    // Check if a revenge boss is available today
    getRevengeBoss() {
        const seed = DailyChallenge.getSeed();
        const rng = DailyChallenge.seededRandom(seed * 7);

        // Which bosses has player beaten?
        const beatenBosses = [];
        for (const lvl of [10,20,30,40,50,60,70,80,90,100]) {
            if (Storage.data?.bossLoot?.[lvl]) beatenBosses.push(lvl);
        }
        if (beatenBosses.length === 0) return null;

        // 60% chance of revenge boss each day
        if (rng() > 0.6) return null;

        // Pick a random beaten boss
        const bossLvl = beatenBosses[Math.floor(rng() * beatenBosses.length)];
        const baseBoss = Boss.BOSSES[bossLvl];
        if (!baseBoss) return null;

        // Revenge count increases each time they appear
        const revengeCount = this.getRevengeCount(bossLvl);

        // Scale up: +30% HP per revenge, +1 attack type, faster interval
        const hpMultiplier = 1.3 + revengeCount * 0.3;
        const allAttacks = ['ice','lock','shuffle','transform','steal'];

        // Add new attacks from pool
        const phases = baseBoss.phases.map(p => {
            const newAtks = [...p.attacks];
            for (let i = 0; i < revengeCount && newAtks.length < allAttacks.length; i++) {
                const unused = allAttacks.filter(a => !newAtks.includes(a));
                if (unused.length > 0) newAtks.push(unused[Math.floor(rng() * unused.length)]);
            }
            return { ...p, attacks: newAtks, interval: Math.max(1, p.interval - Math.floor(revengeCount / 2)) };
        });

        return {
            bossLvl,
            name: `${baseBoss.name}·复仇`,
            hp: Math.floor(baseBoss.hp * hpMultiplier),
            phases,
            weakness: baseBoss.weakness,
            desc: `${baseBoss.name}带着怒火回来了！(复仇第${revengeCount + 1}次)`,
            revengeCount,
            // Revenge loot: scaled rewards
            loot: {
                gold: Math.floor((Boss.LOOT[bossLvl]?.gold || 500) * (1 + revengeCount * 0.5)),
                gems: Math.floor((Boss.LOOT[bossLvl]?.gems || 5) * (1 + revengeCount * 0.3)),
                title: revengeCount >= 3 ? `${baseBoss.name}克星` : null
            }
        };
    },

    getRevengeCount(bossLvl) {
        return Storage.data?.bossRevenge?.[bossLvl] || 0;
    },

    recordRevenge(bossLvl) {
        if (!Storage.data.bossRevenge) Storage.data.bossRevenge = {};
        Storage.data.bossRevenge[bossLvl] = (Storage.data.bossRevenge[bossLvl] || 0) + 1;
        Storage.save();
    },

    // Generate revenge boss as a playable level
    generateRevengeLevel(revengeBoss) {
        const allGems = Object.keys(GEM_TYPES);
        const gems = allGems.filter(g => GEM_TYPES[g].rarity === 'common').slice(0, 6);
        gems.push('mango');
        if (revengeBoss.revengeCount >= 2) gems.push('dragon');

        return {
            id: 9000 + revengeBoss.bossLvl,
            revenge: true,
            revengeBoss,
            chapter: 10,
            width: 8, height: 10,
            moves: Math.max(25, 40 - revengeBoss.revengeCount * 2),
            timed: false, timeLimit: 0,
            gems,
            objectives: [{ type: 'score', target: 10000 + revengeBoss.revengeCount * 5000, icon: '⭐' }],
            boss: true,
            stars: [10000, 20000, 35000],
            special: {},
            blockers: []
        };
    }
};


// ══════════════════════════════════════
// 🏅 Season System — monthly themes + progression
// ══════════════════════════════════════
const SeasonSystem = {
    THEMES: [
        { name: '烈焰赛季', emoji: '🔥', color: '#ef4444', bonus: 'fire gems deal 2x damage', spiritBonus: 'dragon_spirit' },
        { name: '冰霜赛季', emoji: '❄️', color: '#3b82f6', bonus: 'frozen cells auto-defrost after 3 turns', spiritBonus: 'frost_spirit' },
        { name: '混沌赛季', emoji: '🌀', color: '#a855f7', bonus: 'random special gem every 5 matches', spiritBonus: 'chaos_spirit' },
        { name: '丰收赛季', emoji: '🥭', color: '#f59e0b', bonus: 'gold rewards doubled', spiritBonus: 'mango_fairy' },
        { name: '暗影赛季', emoji: '👿', color: '#6b7280', bonus: 'boss damage +50%', spiritBonus: 'phoenix_spirit' },
        { name: '时光赛季', emoji: '⏳', color: '#eab308', bonus: '+3 moves every level', spiritBonus: 'time_spirit' },
        { name: '彩虹赛季', emoji: '🌈', color: '#ec4899', bonus: 'rainbow gem spawn rate +25%', spiritBonus: 'rainbow_spirit' },
        { name: '蜂群赛季', emoji: '🐝', color: '#fbbf24', bonus: 'combo multiplier +0.5x', spiritBonus: 'bee_spirit' },
        { name: '翡翠赛季', emoji: '💚', color: '#22c55e', bonus: 'all tree buffs +20%', spiritBonus: null },
        { name: '部落赛季', emoji: '🚩', color: '#dc2626', bonus: 'all spirit affinity gain x2', spiritBonus: null },
        { name: '龙息赛季', emoji: '🐉', color: '#f97316', bonus: 'line gems deal 3x damage', spiritBonus: 'dragon_spirit' },
        { name: '凤凰赛季', emoji: '🔥', color: '#fb923c', bonus: 'free revive once per level', spiritBonus: 'phoenix_spirit' }
    ],

    getCurrentSeason() {
        const now = new Date();
        const monthIndex = now.getMonth();
        const theme = this.THEMES[monthIndex];
        const daysInMonth = new Date(now.getFullYear(), monthIndex + 1, 0).getDate();
        const dayOfMonth = now.getDate();
        return {
            ...theme,
            month: monthIndex + 1,
            year: now.getFullYear(),
            seasonId: `${now.getFullYear()}-${String(monthIndex+1).padStart(2,'0')}`,
            daysRemaining: daysInMonth - dayOfMonth,
            progress: dayOfMonth / daysInMonth
        };
    },

    PASS_TIERS: [
        { points: 0,    reward: '开始！', icon: '🎯' },
        { points: 100,  reward: '500💰', icon: '💰', gold: 500 },
        { points: 300,  reward: '10💎', icon: '💎', gems: 10 },
        { points: 600,  reward: '专属装饰', icon: '🎨', decoration: true },
        { points: 1000, reward: '20💎+赛季称号', icon: '🏅', gems: 20, title: true },
        { points: 1500, reward: '50💎+赛季精灵皮肤', icon: '👑', gems: 50, skin: true },
        { points: 2500, reward: '100💎+传说称号', icon: '🔥', gems: 100, legendTitle: true }
    ],

    getSeasonPoints() {
        const s = this.getCurrentSeason();
        return Storage.data?.seasonPoints?.[s.seasonId] || 0;
    },

    addSeasonPoints(amount) {
        const s = this.getCurrentSeason();
        if (!Storage.data.seasonPoints) Storage.data.seasonPoints = {};
        Storage.data.seasonPoints[s.seasonId] = (Storage.data.seasonPoints[s.seasonId] || 0) + amount;
        Storage.save();
    },

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
        if (!tier) return;
        const s = this.getCurrentSeason();
        if (!Storage.data.seasonClaimed) Storage.data.seasonClaimed = {};
        const key = `${s.seasonId}-${tierIndex}`;
        if (Storage.data.seasonClaimed[key]) return;
        Storage.data.seasonClaimed[key] = true;
        if (tier.gold) Storage.addGold(tier.gold);
        if (tier.gems) Storage.addGems(tier.gems);
        if (tier.title) {
            if (!Storage.data.titles) Storage.data.titles = [];
            Storage.data.titles.push(`${s.name}征服者`);
        }
        if (tier.legendTitle) {
            if (!Storage.data.titles) Storage.data.titles = [];
            Storage.data.titles.push(`${s.name}传说`);
        }
        Storage.save();
    }
};
