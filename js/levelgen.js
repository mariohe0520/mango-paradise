/* ==========================================
   芒果庄园 - 高级程序化关卡生成器
   Mango Paradise - Procedural Level Generator
   无限可玩性的核心引擎
   ========================================== */

const LevelGen = {
    // ══════════════════════════════════════
    // Seeded PRNG (Mulberry32) — deterministic
    // ══════════════════════════════════════
    _createRNG(seed) {
        let s = seed | 0;
        return () => {
            s = (s + 0x6D2B79F5) | 0;
            let t = Math.imul(s ^ (s >>> 15), 1 | s);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    },

    // Pick N items from array using RNG
    _pick(rng, arr, n) {
        const pool = [...arr];
        const result = [];
        for (let i = 0; i < Math.min(n, pool.length); i++) {
            const idx = Math.floor(rng() * pool.length);
            result.push(pool.splice(idx, 1)[0]);
        }
        return result;
    },

    // Weighted random choice
    _weightedChoice(rng, items, weights) {
        const total = weights.reduce((a, b) => a + b, 0);
        let r = rng() * total;
        for (let i = 0; i < items.length; i++) {
            r -= weights[i];
            if (r <= 0) return items[i];
        }
        return items[items.length - 1];
    },

    // ══════════════════════════════════════
    // Difficulty Curve
    // ══════════════════════════════════════
    _getDifficulty(levelNumber) {
        // Level 101 = tier 0, level 200 = tier ~10
        const tier = Math.floor((levelNumber - 101) / 10);
        const subTier = (levelNumber - 101) % 10;

        // Difficulty ramps up but plateaus
        const rawDifficulty = 1 + tier * 0.8 + subTier * 0.05;
        const difficulty = Math.min(rawDifficulty, 15); // cap

        return {
            tier,
            subTier,
            difficulty,
            // Moves: start at 28, decrease to floor of 14
            moves: Math.max(14, Math.floor(28 - tier * 0.8 - subTier * 0.05)),
            // Number of objectives: 1 at start, up to 4
            numObjectives: Math.min(1 + Math.floor(tier / 3), 4),
            // Gem count: 5-7
            numGems: Math.min(5 + Math.floor(tier / 4), 7),
            // Score scaling
            baseScore: 8000 + tier * 3000 + subTier * 200,
            // Board size variation
            boardSizeVariation: Math.min(tier, 5),
            // Blocker intensity
            frozenCount: Math.min(Math.floor(tier * 1.2), 12),
            lockedCount: Math.min(Math.floor(tier * 0.6), 6),
        };
    },

    // ══════════════════════════════════════
    // Mechanic Introduction Schedule
    // ══════════════════════════════════════
    _getMechanics(levelNumber) {
        const mechanics = {
            fog: false,
            fogCount: 0,
            gravityShift: false,
            chainBonus: false,
        };

        // Fog: starts at L101, intensity grows
        if (levelNumber >= 101) {
            mechanics.fog = true;
            mechanics.fogCount = Math.min(6 + Math.floor((levelNumber - 101) / 5), 30);
        }

        // Gravity: starts at L121
        if (levelNumber >= 121) {
            // Gravity every other level at first, then always
            if (levelNumber >= 141 || levelNumber % 2 === 1) {
                mechanics.gravityShift = true;
            }
        }

        // Chains: starts at L141
        if (levelNumber >= 141) {
            mechanics.chainBonus = true;
        }

        // Combined: L161+ has all three
        // (already covered by the above rules)

        return mechanics;
    },

    // ══════════════════════════════════════
    // Gem Pool Selection
    // ══════════════════════════════════════
    _getGemPool(rng, difficulty) {
        const commonGems = ['murloc', 'orc', 'elf', 'mage', 'knight', 'dwarf', 'undead'];
        const rareGems = ['mango', 'dragon', 'phoenix'];

        // Pick common gems
        const numCommon = Math.min(difficulty.numGems, commonGems.length);
        const gems = this._pick(rng, commonGems, numCommon);

        // Add rare gems based on tier
        if (difficulty.tier >= 1 && rng() < 0.4 + difficulty.tier * 0.05) gems.push('mango');
        if (difficulty.tier >= 3 && rng() < 0.25 + difficulty.tier * 0.03) gems.push('dragon');
        if (difficulty.tier >= 6 && rng() < 0.15 + difficulty.tier * 0.02) gems.push('phoenix');

        // Deduplicate
        return [...new Set(gems)];
    },

    // ══════════════════════════════════════
    // Objective Generation
    // ══════════════════════════════════════
    _generateObjectives(rng, difficulty, gems, isBoss) {
        const objectives = [];
        const usedTypes = new Set();

        // Boss levels always have a score objective
        if (isBoss) {
            objectives.push({
                type: 'score',
                target: Math.floor(difficulty.baseScore * 2.5),
                icon: '⭐'
            });
            usedTypes.add('score');
        }

        const numObj = isBoss ? Math.min(difficulty.numObjectives + 1, 4) : difficulty.numObjectives;

        const objectivePool = [
            { type: 'score', weight: 25 },
            { type: 'clear', weight: 30 },
            { type: 'combo', weight: 15 },
            { type: 'special_any', weight: 15 },
            { type: 'special_line', weight: 8 },
            { type: 'special_bomb', weight: 8 },
            { type: 'special_rainbow', weight: 5 },
        ];

        while (objectives.length < numObj) {
            // Filter out already-used types (allow duplicates for clear with different gems)
            const available = objectivePool.filter(o => {
                if (o.type === 'clear') return true; // can have multiple clear objectives
                return !usedTypes.has(o.type);
            });
            if (available.length === 0) break;

            const types = available.map(o => o.type);
            const weights = available.map(o => o.weight);
            const chosen = this._weightedChoice(rng, types, weights);
            usedTypes.add(chosen);

            switch (chosen) {
                case 'score':
                    objectives.push({
                        type: 'score',
                        target: Math.floor(difficulty.baseScore * (0.8 + rng() * 0.6)),
                        icon: '⭐'
                    });
                    break;
                case 'clear': {
                    const gem = gems[Math.floor(rng() * gems.length)];
                    const gd = typeof GEM_TYPES !== 'undefined' ? GEM_TYPES[gem] : null;
                    objectives.push({
                        type: 'clear',
                        target: Math.floor(15 + difficulty.tier * 3 + rng() * 15),
                        gem: gem,
                        icon: gd ? gd.emoji : '❓'
                    });
                    break;
                }
                case 'combo':
                    objectives.push({
                        type: 'combo',
                        target: Math.floor(3 + difficulty.tier * 0.5 + rng() * 3),
                        icon: '🔥'
                    });
                    break;
                case 'special_any':
                    objectives.push({
                        type: 'special',
                        target: Math.floor(3 + difficulty.tier * 0.8 + rng() * 3),
                        specialType: 'any',
                        icon: '✨'
                    });
                    break;
                case 'special_line':
                    objectives.push({
                        type: 'special',
                        target: Math.floor(2 + difficulty.tier * 0.5 + rng() * 2),
                        specialType: 'line',
                        icon: '⚡',
                        label: '连4消生成'
                    });
                    break;
                case 'special_bomb':
                    objectives.push({
                        type: 'special',
                        target: Math.floor(2 + difficulty.tier * 0.4 + rng() * 2),
                        specialType: 'bomb',
                        icon: '💣'
                    });
                    break;
                case 'special_rainbow':
                    objectives.push({
                        type: 'special',
                        target: Math.floor(1 + difficulty.tier * 0.3 + rng()),
                        specialType: 'rainbow',
                        icon: '🌈'
                    });
                    break;
            }
        }

        return objectives;
    },

    // ══════════════════════════════════════
    // Boss Generation (every 10th level)
    // ══════════════════════════════════════
    _generateBoss(rng, levelNumber, difficulty) {
        const bossIndex = Math.floor((levelNumber - 101) / 10);

        // Boss names pool — cycles through with increasing power
        const bossPool = [
            { name: '虚空行者·回响', emoji: '🌀', desc: '虚空的残影再次凝聚...' },
            { name: '焰魔·灰烬', emoji: '🔥', desc: '从灰烬中重生的火焰恶魔' },
            { name: '冰霜巨人', emoji: '❄️', desc: '永冻之地的远古巨人' },
            { name: '暗影织网者', emoji: '🕷️', desc: '编织黑暗之网的恐惧之主' },
            { name: '雷霆泰坦', emoji: '⚡', desc: '掌控雷电的远古泰坦' },
            { name: '翡翠噩梦', emoji: '💚', desc: '梦境深处的腐化之力' },
            { name: '虚空领主', emoji: '🌑', desc: '虚空之中最强大的存在' },
            { name: '时空裂隙', emoji: '🕐', desc: '时间本身的具现化' },
            { name: '混沌元素', emoji: '🌪️', desc: '所有元素的混沌融合' },
            { name: '永恒守望者', emoji: '👁️', desc: '宇宙的终极审判者' },
        ];

        const boss = bossPool[bossIndex % bossPool.length];
        const allAttacks = ['ice', 'lock', 'shuffle', 'transform', 'steal'];

        // Scale boss: HP increases, more attacks, faster intervals
        const hpBase = 8000 + bossIndex * 5000;
        const hpScale = 1 + difficulty.tier * 0.3;
        const hp = Math.floor(hpBase * hpScale);

        // Number of attack types: 2 at start, up to all 5
        const numAttacks = Math.min(2 + Math.floor(bossIndex / 2), allAttacks.length);
        const attacks = this._pick(rng, allAttacks, numAttacks);

        // Phase design
        const phases = [
            {
                emoji: boss.emoji,
                hpPct: 1.0,
                attacks: attacks.slice(0, Math.max(2, Math.floor(attacks.length * 0.6))),
                interval: Math.max(2, 3 - Math.floor(bossIndex / 4)),
                taunt: '你以为你能赢？'
            },
            {
                emoji: boss.emoji,
                hpPct: 0.4,
                attacks: attacks,
                interval: Math.max(1, 2 - Math.floor(bossIndex / 6)),
                taunt: '还不够！再来！',
                announce: `${boss.name}进入狂暴状态！`
            }
        ];

        // High-tier bosses get a 3rd phase
        if (bossIndex >= 5) {
            phases.push({
                emoji: '💀',
                hpPct: 0.15,
                attacks: allAttacks,
                interval: 1,
                taunt: '不...不可能...！',
                announce: `${boss.name}发出最后的咆哮！`
            });
        }

        return {
            name: boss.name,
            desc: boss.desc,
            weakness: null,
            phases,
            hp,
            // Loot scales with boss index
            loot: {
                gold: 1000 + bossIndex * 800,
                gems: 10 + bossIndex * 5,
                title: bossIndex >= 5 ? `${boss.name}征服者` : null,
                lore: `${boss.name}倒下了。但远方似乎还有更强大的力量在等待着你...`
            }
        };
    },

    // ══════════════════════════════════════
    // Main Generator
    // ══════════════════════════════════════
    generateLevel(levelNumber) {
        if (levelNumber <= 100) return null; // Use hand-crafted levels

        const rng = this._createRNG(levelNumber * 2654435761);
        const difficulty = this._getDifficulty(levelNumber);
        const mechanics = this._getMechanics(levelNumber);
        const isBoss = levelNumber % 10 === 0;

        // Board size
        const sizes = [
            [7, 9], [8, 8], [8, 9], [8, 10], [9, 9], [9, 10], [9, 11], [7, 11]
        ];
        const sizeIdx = Math.floor(rng() * Math.min(sizes.length, 3 + difficulty.boardSizeVariation));
        const [w, h] = sizes[sizeIdx];

        // Gems
        const gems = this._getGemPool(rng, difficulty);

        // Moves (bosses get extra moves)
        let moves = difficulty.moves + Math.floor(rng() * 6);
        if (isBoss) moves = Math.floor(moves * 1.4);

        // Timed: 12% chance, increases with tier
        const isTimed = !isBoss && rng() < 0.12 + difficulty.tier * 0.008;
        const timeLimit = isTimed ? Math.max(40, 90 - difficulty.tier * 2) + Math.floor(rng() * 25) : 0;

        // Objectives
        const objectives = this._generateObjectives(rng, difficulty, gems, isBoss);

        // Stars
        const stars = [
            difficulty.baseScore,
            Math.floor(difficulty.baseScore * 1.5),
            Math.floor(difficulty.baseScore * 2.3)
        ];

        // Chapter (cycle through 10 chapters)
        const chapter = (Math.floor((levelNumber - 101) / 10) % 10) + 1;

        // Special mechanics
        const special = {};
        if (mechanics.fog) {
            special.fog = true;
            special.fogCount = mechanics.fogCount;
        }
        if (mechanics.gravityShift) special.gravityShift = true;
        if (mechanics.chainBonus) special.chainBonus = true;

        // Boss data
        let bossData = null;
        if (isBoss) {
            bossData = this._generateBoss(rng, levelNumber, difficulty);
        }

        return {
            id: levelNumber,
            procedural: true,
            chapter,
            width: w,
            height: h,
            moves,
            timed: isTimed,
            timeLimit,
            gems,
            objectives,
            boss: isBoss,
            bossData, // procedural boss config
            stars,
            special,
            blockers: [],
            // Metadata
            tier: difficulty.tier,
            difficulty: difficulty.difficulty,
        };
    },

    // ══════════════════════════════════════
    // Daily Challenge Generator (seeded from date)
    // ══════════════════════════════════════
    generateDailyChallenge(dateStr) {
        // dateStr = "2026-02-17" or auto from today
        if (!dateStr) {
            const d = new Date();
            dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }
        const parts = dateStr.split('-').map(Number);
        const seed = parts[0] * 10000 + parts[1] * 100 + parts[2];
        const rng = this._createRNG(seed * 7919);

        // Daily challenges are HARDER: fewer moves, more objectives
        const dayOfYear = Math.floor((new Date(dateStr) - new Date(parts[0], 0, 1)) / 86400000);
        const tier = Math.floor(dayOfYear / 7); // weekly difficulty escalation

        const commonGems = ['murloc', 'orc', 'elf', 'mage', 'knight', 'dwarf', 'undead'];
        const numGems = 5 + Math.floor(rng() * 2);
        const gems = this._pick(rng, commonGems, numGems);

        // 40% chance rare gem
        if (rng() < 0.4) gems.push('mango');
        if (rng() < 0.2) gems.push('dragon');

        // Board: medium size
        const w = 7 + Math.floor(rng() * 3); // 7-9
        const h = 8 + Math.floor(rng() * 3); // 8-10
        const moves = 18 + Math.floor(rng() * 10);
        const isTimed = rng() < 0.3;
        const timeLimit = isTimed ? 60 + Math.floor(rng() * 45) : 0;

        // Always 2-3 objectives
        const objectives = [];
        const numObj = 2 + (rng() < 0.4 ? 1 : 0);

        // First objective: always score
        objectives.push({
            type: 'score',
            target: 5000 + Math.floor(rng() * 5000) + tier * 500,
            icon: '⭐'
        });

        // Second: clear or combo
        if (rng() < 0.6) {
            const gem = gems[Math.floor(rng() * gems.length)];
            const gd = typeof GEM_TYPES !== 'undefined' ? GEM_TYPES[gem] : null;
            objectives.push({
                type: 'clear',
                target: 15 + Math.floor(rng() * 20),
                gem,
                icon: gd ? gd.emoji : '❓'
            });
        } else {
            objectives.push({
                type: 'combo',
                target: 3 + Math.floor(rng() * 4),
                icon: '🔥'
            });
        }

        // Third (if present): special
        if (numObj >= 3) {
            objectives.push({
                type: 'special',
                target: 2 + Math.floor(rng() * 4),
                specialType: 'any',
                icon: '✨'
            });
        }

        // Mechanics: sometimes fog or gravity for variety
        const special = {};
        if (rng() < 0.25) { special.fog = true; special.fogCount = 6 + Math.floor(rng() * 10); }
        if (rng() < 0.2) special.gravityShift = true;
        if (rng() < 0.3) special.chainBonus = true;

        return {
            id: 9001,
            daily: true,
            seed,
            dateStr,
            width: w,
            height: h,
            moves: isTimed ? 999 : moves,
            timed: isTimed,
            timeLimit,
            gems: [...new Set(gems)],
            objectives,
            boss: false,
            stars: [5000, 10000, 18000],
            special,
            blockers: [],
            chapter: 1,
        };
    },

    // ══════════════════════════════════════
    // Endless Mode Generators
    // ══════════════════════════════════════

    // Timed Endless: play until time runs out
    generateEndlessTimed(wave) {
        const rng = this._createRNG(wave * 31337 + 42);
        const commonGems = ['murloc', 'orc', 'elf', 'mage', 'knight', 'dwarf', 'undead'];
        const numGems = Math.min(4 + Math.floor(wave / 5), 7);
        const gems = this._pick(rng, commonGems, numGems);
        if (wave >= 5) gems.push('mango');
        if (wave >= 10) gems.push('dragon');

        // Each wave: score target increases, time stays constant (60s per wave)
        const scoreTarget = 2000 + wave * 1500;
        const objectives = [
            { type: 'score', target: scoreTarget, icon: '⭐' }
        ];

        if (wave >= 3) {
            const gem = gems[Math.floor(rng() * gems.length)];
            const gd = typeof GEM_TYPES !== 'undefined' ? GEM_TYPES[gem] : null;
            objectives.push({
                type: 'clear',
                target: 10 + wave * 2,
                gem,
                icon: gd ? gd.emoji : '❓'
            });
        }

        const special = {};
        if (wave >= 8) { special.chainBonus = true; }
        if (wave >= 12) { special.fog = true; special.fogCount = Math.min(wave - 10, 15); }

        return {
            id: 7000 + wave,
            endless: true,
            endlessMode: 'timed',
            wave,
            width: 8,
            height: 10,
            moves: 999,
            timed: true,
            timeLimit: 60, // 60 seconds per wave
            gems: [...new Set(gems)],
            objectives,
            boss: wave % 5 === 0,
            stars: [scoreTarget, Math.floor(scoreTarget * 1.5), Math.floor(scoreTarget * 2.5)],
            special,
            blockers: [],
            chapter: 1,
        };
    },

    // Survival Endless: board fills with obstacles, survive as long as possible
    generateEndlessSurvival(wave) {
        const rng = this._createRNG(wave * 48271 + 99);
        const commonGems = ['murloc', 'orc', 'elf', 'mage', 'knight', 'dwarf', 'undead'];
        const numGems = Math.min(5 + Math.floor(wave / 4), 7);
        const gems = this._pick(rng, commonGems, numGems);
        if (wave >= 3) gems.push('mango');

        // Score target per wave
        const scoreTarget = 1500 + wave * 1000;
        const objectives = [
            { type: 'score', target: scoreTarget, icon: '⭐' }
        ];

        // Moves decrease as waves progress — survival pressure
        const moves = Math.max(10, 25 - Math.floor(wave * 1.2));

        // Increasing obstacles
        const special = {};
        if (wave >= 2) { special.fog = true; special.fogCount = Math.min(wave * 2, 25); }
        if (wave >= 6) special.gravityShift = true;
        if (wave >= 4) special.chainBonus = true;

        return {
            id: 7500 + wave,
            endless: true,
            endlessMode: 'survival',
            wave,
            width: 8,
            height: 9,
            moves,
            timed: false,
            timeLimit: 0,
            gems: [...new Set(gems)],
            objectives,
            boss: false,
            stars: [scoreTarget, Math.floor(scoreTarget * 1.5), Math.floor(scoreTarget * 2)],
            special,
            blockers: [],
            chapter: 1,
        };
    },

    // ══════════════════════════════════════
    // Seasonal Event Level Generator
    // ══════════════════════════════════════
    generateSeasonalLevel(seasonId, levelIndex) {
        // seasonId: "2026-02", levelIndex: 0-9
        const parts = seasonId.split('-').map(Number);
        const seed = parts[0] * 100 + parts[1] + levelIndex * 7;
        const rng = this._createRNG(seed * 104729);

        const month = parts[1];
        const difficulty = {
            tier: levelIndex,
            numGems: 5 + Math.floor(levelIndex / 3),
            baseScore: 5000 + levelIndex * 2000,
            numObjectives: Math.min(1 + Math.floor(levelIndex / 3), 3),
        };

        const commonGems = ['murloc', 'orc', 'elf', 'mage', 'knight', 'dwarf', 'undead'];
        const gems = this._pick(rng, commonGems, difficulty.numGems);
        if (levelIndex >= 3) gems.push('mango');
        if (levelIndex >= 7) gems.push('dragon');

        const moves = Math.max(16, 30 - levelIndex);
        const isBoss = levelIndex === 9; // Last seasonal level is boss

        const objectives = this._generateObjectives(rng, difficulty, gems, isBoss);

        const special = {};
        if (levelIndex >= 4) { special.fog = true; special.fogCount = 6 + levelIndex; }
        if (levelIndex >= 6) special.chainBonus = true;
        if (levelIndex >= 8) special.gravityShift = true;

        return {
            id: 10000 + month * 100 + levelIndex,
            seasonal: true,
            seasonId,
            seasonLevelIndex: levelIndex,
            width: 8,
            height: isBoss ? 10 : 9,
            moves: isBoss ? moves + 10 : moves,
            timed: levelIndex === 5, // middle level is timed
            timeLimit: levelIndex === 5 ? 75 : 0,
            gems: [...new Set(gems)],
            objectives,
            boss: isBoss,
            stars: [
                difficulty.baseScore,
                Math.floor(difficulty.baseScore * 1.5),
                Math.floor(difficulty.baseScore * 2.2)
            ],
            special,
            blockers: [],
            chapter: 1,
        };
    },
};
