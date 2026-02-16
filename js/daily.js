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
