/* ==========================================
   芒果庄园 - 硬核深度系统
   Mango Paradise - Hardcore Depth Systems
   
   1. Combo Theory (连锁理论)
   2. Skill-Based Mechanics (技巧机制)
   3. Difficulty Tiers (难度分级)
   4. Spirit Loadout / Meta Strategy (精灵编队)
   5. Challenge Tower (挑战塔)
   ========================================== */

// ============================================================
// 1. COMBO THEORY SYSTEM
// ============================================================

const ComboTheory = {
    // Chain multipliers: exponential scaling
    CHAIN_MULTIPLIERS: {
        1: 1,    // single match
        2: 2,    // 2-chain
        3: 4,    // 3-chain
        4: 8,    // 4-chain
        5: 16,   // 5+ chain
    },

    getMultiplier(chainDepth) {
        if (chainDepth >= 5) return 16;
        return this.CHAIN_MULTIPLIERS[chainDepth] || 1;
    },

    // Perfect Clear: check if board is entirely empty after cascades
    checkPerfectClear(board, width, height) {
        for (let y = 0; y < height; y++)
            for (let x = 0; x < width; x++)
                if (board[y][x]) return false;
        return true;
    },

    PERFECT_CLEAR_BONUS: 50000,

    // T-Spin / L-Spin detection: check if a match forms T or L shape
    // Returns bonus type: 'T', 'L', or null
    detectShapeCombo(matchCells) {
        if (matchCells.length < 5) return null;
        const cellSet = new Set(matchCells.map(c => `${c.x},${c.y}`));

        // Check for T-shape: 3 in a row + 1 perpendicular from center
        // Check for L-shape: 3 in a row + 2 perpendicular from end
        let hasHorizontal = false, hasVertical = false;
        const xs = matchCells.map(c => c.x);
        const ys = matchCells.map(c => c.y);
        const minX = Math.min(...xs), maxX = Math.max(...xs);
        const minY = Math.min(...ys), maxY = Math.max(...ys);

        // T-shape: width >= 3 AND height >= 2, with intersection
        if (maxX - minX >= 2 && maxY - minY >= 1) {
            // Find horizontal runs
            for (let y = minY; y <= maxY; y++) {
                let runLen = 0;
                for (let x = minX; x <= maxX; x++) {
                    if (cellSet.has(`${x},${y}`)) runLen++;
                    else runLen = 0;
                    if (runLen >= 3) hasHorizontal = true;
                }
            }
            // Find vertical runs
            for (let x = minX; x <= maxX; x++) {
                let runLen = 0;
                for (let y = minY; y <= maxY; y++) {
                    if (cellSet.has(`${x},${y}`)) runLen++;
                    else runLen = 0;
                    if (runLen >= 2) hasVertical = true;
                }
            }
        }
        if (maxY - minY >= 2 && maxX - minX >= 1) {
            for (let x = minX; x <= maxX; x++) {
                let runLen = 0;
                for (let y = minY; y <= maxY; y++) {
                    if (cellSet.has(`${x},${y}`)) runLen++;
                    else runLen = 0;
                    if (runLen >= 3) hasVertical = true;
                }
            }
            for (let y = minY; y <= maxY; y++) {
                let runLen = 0;
                for (let x = minX; x <= maxX; x++) {
                    if (cellSet.has(`${x},${y}`)) runLen++;
                    else runLen = 0;
                    if (runLen >= 2) hasHorizontal = true;
                }
            }
        }

        if (hasHorizontal && hasVertical) {
            // T vs L: T has the perpendicular at center, L at corner
            const centerX = Math.round((minX + maxX) / 2);
            const centerY = Math.round((minY + maxY) / 2);
            if (cellSet.has(`${centerX},${centerY}`)) return 'T';
            return 'L';
        }
        return null;
    },

    SHAPE_BONUSES: {
        'T': { score: 500, label: 'T-SPIN! ◎' },
        'L': { score: 300, label: 'L-COMBO! △' },
    },

    // Setup Preview: find all potential cascade chains from a swap
    findCascadePotential(game, x1, y1, x2, y2) {
        // Simulate the swap and count cascade depth
        const boardCopy = game.board.map(row => row.map(cell => cell ? {...cell} : null));
        // Swap
        const tmp = boardCopy[y1][x1];
        boardCopy[y1][x1] = boardCopy[y2][x2];
        boardCopy[y2][x2] = tmp;

        let cascades = 0;
        let hasMatch = true;
        const simBoard = boardCopy;

        while (hasMatch && cascades < 20) {
            hasMatch = false;
            // Find matches on simBoard
            for (let y = 0; y < game.height; y++) {
                for (let x = 0; x < game.width - 2; x++) {
                    if (simBoard[y][x] && simBoard[y][x+1] && simBoard[y][x+2] &&
                        simBoard[y][x].type === simBoard[y][x+1].type &&
                        simBoard[y][x].type === simBoard[y][x+2].type) {
                        // Mark for removal
                        simBoard[y][x] = null; simBoard[y][x+1] = null; simBoard[y][x+2] = null;
                        hasMatch = true;
                    }
                }
            }
            for (let x = 0; x < game.width; x++) {
                for (let y = 0; y < game.height - 2; y++) {
                    if (simBoard[y][x] && simBoard[y+1][x] && simBoard[y+2][x] &&
                        simBoard[y][x].type === simBoard[y+1][x].type &&
                        simBoard[y][x].type === simBoard[y+2][x].type) {
                        simBoard[y][x] = null; simBoard[y+1][x] = null; simBoard[y+2][x] = null;
                        hasMatch = true;
                    }
                }
            }
            if (hasMatch) {
                cascades++;
                // Simulate gravity
                for (let x = 0; x < game.width; x++) {
                    let emptyY = game.height - 1;
                    for (let y = game.height - 1; y >= 0; y--) {
                        if (simBoard[y][x]) {
                            if (y !== emptyY) {
                                simBoard[emptyY][x] = simBoard[y][x];
                                simBoard[y][x] = null;
                            }
                            emptyY--;
                        }
                    }
                }
            }
        }
        return cascades;
    },

    // Highlight cells that could cascade from selecting a gem
    getSetupPreviewCells(game, x, y) {
        const highlights = [];
        const dirs = [{dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1}];
        for (const {dx, dy} of dirs) {
            const nx = x + dx, ny = y + dy;
            if (!game.isValidCell(nx, ny)) continue;
            const cascades = this.findCascadePotential(game, x, y, nx, ny);
            if (cascades >= 2) {
                highlights.push({ x: nx, y: ny, cascades });
            }
        }
        return highlights;
    },

    // Level tips for combo theory
    LEVEL_TIPS: {
        chain: '≡ 这关奖励连锁消除 — 设置多层级联！',
        shape: '◎ 尝试T形和L形消除获得额外奖金！',
        perfect: '✦ 清空棋盘可获得完美清除奖金！',
        setup: '※ 选中宝石时会显示级联预览',
    },

    getLevelTip(level) {
        if (level.special?.chainBonus) return this.LEVEL_TIPS.chain;
        if (level.moves <= 20) return this.LEVEL_TIPS.setup;
        if (level.objectives?.some(o => o.type === 'combo')) return this.LEVEL_TIPS.chain;
        if (level.objectives?.some(o => o.type === 'special')) return this.LEVEL_TIPS.shape;
        return this.LEVEL_TIPS.setup;
    }
};

// ============================================================
// 2. SKILL-BASED MECHANICS
// ============================================================

const SkillMechanics = {
    // Power Meter: builds from combos, separate from spirit skill bar
    powerMeter: 0,
    powerMeterMax: 200,
    powerMeterLevel: 0, // 0-3, unlocks at thresholds

    POWER_THRESHOLDS: [50, 100, 150, 200],
    POWER_EFFECTS: [
        { name: '小震荡', desc: '清除随机5个宝石', emoji: '✸' },
        { name: '中震荡', desc: '清除随机一行', emoji: '↯' },
        { name: '大震荡', desc: '清除随机两行+一列', emoji: '◎' },
        { name: '终极震荡', desc: '清除全屏50%宝石', emoji: '✸' },
    ],

    addPowerFromCombo(comboDepth) {
        const gain = comboDepth * comboDepth * 5; // quadratic scaling
        this.powerMeter = Math.min(this.powerMeterMax, this.powerMeter + gain);
        // Update available level
        this.powerMeterLevel = 0;
        for (let i = this.POWER_THRESHOLDS.length - 1; i >= 0; i--) {
            if (this.powerMeter >= this.POWER_THRESHOLDS[i]) {
                this.powerMeterLevel = i + 1;
                break;
            }
        }
    },

    canDischarge(level) {
        return this.powerMeter >= this.POWER_THRESHOLDS[level - 1];
    },

    discharge(level, game) {
        if (!this.canDischarge(level)) return false;
        this.powerMeter -= this.POWER_THRESHOLDS[level - 1];
        // Recalculate level
        this.powerMeterLevel = 0;
        for (let i = this.POWER_THRESHOLDS.length - 1; i >= 0; i--) {
            if (this.powerMeter >= this.POWER_THRESHOLDS[i]) {
                this.powerMeterLevel = i + 1;
                break;
            }
        }
        return true;
    },

    reset() {
        this.powerMeter = 0;
        this.powerMeterLevel = 0;
    },

    // 2x2 Rotation: long-press to rotate a 2x2 block (costs 1 move)
    rotate2x2(game, x, y, clockwise = true) {
        // x,y is top-left of 2x2 block
        if (x + 1 >= game.width || y + 1 >= game.height) return false;

        const tl = game.board[y][x];
        const tr = game.board[y][x + 1];
        const bl = game.board[y + 1][x];
        const br = game.board[y + 1][x + 1];

        if (!tl || !tr || !bl || !br) return false;

        // Check frozen/locked
        for (const [cx, cy] of [[x,y],[x+1,y],[x,y+1],[x+1,y+1]]) {
            const cs = game.cellStates[cy]?.[cx];
            if (cs && (cs.frozen || cs.locked > 0)) return false;
        }

        if (clockwise) {
            game.board[y][x] = bl;
            game.board[y][x + 1] = tl;
            game.board[y + 1][x + 1] = tr;
            game.board[y + 1][x] = br;
        } else {
            game.board[y][x] = tr;
            game.board[y][x + 1] = br;
            game.board[y + 1][x + 1] = bl;
            game.board[y + 1][x] = tl;
        }

        // Update positions
        game.board[y][x].x = x; game.board[y][x].y = y;
        game.board[y][x+1].x = x+1; game.board[y][x+1].y = y;
        game.board[y+1][x].x = x; game.board[y+1][x].y = y+1;
        game.board[y+1][x+1].x = x+1; game.board[y+1][x+1].y = y+1;

        return true;
    },

    // Board Reading Score: rate how optimal the player's moves were
    calculateBoardReadingScore(game) {
        const totalMoves = game.level.moves;
        const movesUsed = totalMoves - game.movesLeft;
        if (movesUsed <= 0) return { score: 100, grade: 'S', label: '完美策略' };

        const scorePerMove = game.score / movesUsed;
        const comboEfficiency = game.maxCombo / Math.max(1, movesUsed) * 10;
        const moveEfficiency = game.movesLeft / totalMoves;

        // Combine metrics: score/move (40%), combo efficiency (30%), moves saved (30%)
        const baseScore = Math.min(100, scorePerMove / 150); // ~150 points/move = perfect
        const comboScore = Math.min(100, comboEfficiency * 20);
        const saveScore = moveEfficiency * 100;

        const finalScore = Math.round(baseScore * 0.4 + comboScore * 0.3 + saveScore * 0.3);

        let grade, label;
        if (finalScore >= 95) { grade = 'S+'; label = '※ 神级策略'; }
        else if (finalScore >= 85) { grade = 'S'; label = '◎ 大师水平'; }
        else if (finalScore >= 70) { grade = 'A'; label = '※ 高手操作'; }
        else if (finalScore >= 55) { grade = 'B'; label = '■ 不错表现'; }
        else if (finalScore >= 40) { grade = 'C'; label = '? 还有提升空间'; }
        else { grade = 'D'; label = '↯ 继续练习'; }

        return { score: finalScore, grade, label, scorePerMove: Math.round(scorePerMove), comboEfficiency: Math.round(comboEfficiency * 10) };
    },

    // Strategic Bomb: store pending special gems for manual detonation
    pendingSpecials: [], // [{x, y, type}]

    addPendingSpecial(x, y, type) {
        this.pendingSpecials.push({ x, y, type });
    },

    hasPendingAt(x, y) {
        return this.pendingSpecials.some(p => p.x === x && p.y === y);
    },

    removePending(x, y) {
        this.pendingSpecials = this.pendingSpecials.filter(p => !(p.x === x && p.y === y));
    },

    clearPending() {
        this.pendingSpecials = [];
    },

    // Long-press detection state
    longPressTimer: null,
    longPressTarget: null,
    LONG_PRESS_MS: 500,
};

// ============================================================
// 3. DIFFICULTY TIERS
// ============================================================

const DifficultyTiers = {
    TIERS: {
        normal: { id: 'normal', name: '普通', nameEn: 'Normal', icon: '🟢', color: '#22c55e',
            moveMult: 1.0, scoreMult: 1.0, starMult: 1.0, obstacleBonus: 0, timedBonus: 0 },
        hard: { id: 'hard', name: '困难', nameEn: 'Hard', icon: '🟡', color: '#eab308',
            moveMult: 0.7, scoreMult: 1.5, starMult: 1.3, obstacleBonus: 3, timedBonus: 0 },
        insane: { id: 'insane', name: '疯狂', nameEn: 'Insane', icon: '●', color: '#ef4444',
            moveMult: 0.5, scoreMult: 2.5, starMult: 1.8, obstacleBonus: 6, timedBonus: 1, spawnObstacles: true },
    },

    // Get difficulty-modified level config
    applyDifficulty(baseLevel, tier) {
        if (!tier || tier === 'normal') return { ...baseLevel };
        const t = this.TIERS[tier];
        if (!t) return { ...baseLevel };

        const modified = { ...baseLevel };

        // Fewer moves
        modified.moves = Math.max(5, Math.floor(baseLevel.moves * t.moveMult));

        // Harder star thresholds
        modified.stars = baseLevel.stars.map(s => Math.floor(s * t.starMult));

        // More objectives (increase targets by 30-50%)
        modified.objectives = baseLevel.objectives.map(obj => {
            const newObj = { ...obj };
            if (obj.type === 'score') newObj.target = Math.floor(obj.target * 1.4);
            else if (obj.type === 'clear') newObj.target = Math.floor(obj.target * 1.3);
            else if (obj.type === 'combo') newObj.target = Math.floor(obj.target * 1.2);
            else if (obj.type === 'special') newObj.target = Math.floor(obj.target * 1.3);
            return newObj;
        });

        // Add time pressure for Insane
        if (tier === 'insane' && !baseLevel.timed) {
            modified.timed = true;
            modified.timeLimit = Math.max(30, modified.moves * 4); // ~4 seconds per move
        }

        // Store tier info
        modified._difficultyTier = tier;
        modified._scoreMultiplier = t.scoreMult;
        modified._obstacleBonus = t.obstacleBonus;

        return modified;
    },

    // Get completion status for a level at a specific difficulty
    getCompletion(levelId, tier) {
        const key = `mango_difficulty_${levelId}_${tier}`;
        return JSON.parse(localStorage.getItem(key) || '{"completed":false,"stars":0,"bestScore":0}');
    },

    saveCompletion(levelId, tier, stars, score) {
        const key = `mango_difficulty_${levelId}_${tier}`;
        const current = this.getCompletion(levelId, tier);
        const updated = {
            completed: true,
            stars: Math.max(current.stars, stars),
            bestScore: Math.max(current.bestScore, score)
        };
        localStorage.setItem(key, JSON.stringify(updated));
    },

    // Rewards for completing harder difficulties
    getRewards(tier) {
        switch (tier) {
            case 'hard': return { gold: 500, gems: 2, title: '↯ 困难征服者' };
            case 'insane': return { gold: 1500, gems: 5, title: '☆ 疯狂统治者' };
            default: return { gold: 0, gems: 0, title: '' };
        }
    },

    // Leaderboard per tier
    getLeaderboard(tier) {
        const key = `mango_lb_${tier}`;
        return JSON.parse(localStorage.getItem(key) || '[]');
    },

    addToLeaderboard(tier, entry) {
        const key = `mango_lb_${tier}`;
        const lb = this.getLeaderboard(tier);
        lb.push(entry);
        lb.sort((a, b) => b.score - a.score);
        localStorage.setItem(key, JSON.stringify(lb.slice(0, 50)));
    },

    // Insane mode: spawn random obstacles during gameplay
    spawnRandomObstacle(game) {
        if (!game.level._difficultyTier || game.level._difficultyTier !== 'insane') return;
        // 20% chance each move
        if (Math.random() > 0.2) return;

        const type = Math.random() < 0.5 ? 'frozen' : 'locked';
        let attempts = 0;
        while (attempts < 20) {
            const x = Math.floor(Math.random() * game.width);
            const y = Math.floor(Math.random() * game.height);
            const cs = game.cellStates[y]?.[x];
            if (cs && !cs.frozen && cs.locked === 0) {
                if (type === 'frozen') cs.frozen = true;
                else cs.locked = 1;

                const cell = game.getCell(x, y);
                if (cell) {
                    cell.classList.add('obstacle-spawn');
                    setTimeout(() => cell.classList.remove('obstacle-spawn'), 600);
                }
                return;
            }
            attempts++;
        }
    }
};

// ============================================================
// 4. SPIRIT LOADOUT / META STRATEGY
// ============================================================

const SpiritLoadout = {
    // 5 battle spirits (different from Estate spirits — these are tactical loadout)
    BATTLE_SPIRITS: {
        fire: {
            id: 'fire', name: '火灵', emoji: '☆', color: '#ef4444',
            desc: '连锁时有概率自动清除一行',
            effect: 'auto_clear_row',
            triggerChance: 0.25,
            upgrades: [
                { level: 1, desc: '25%概率清行', chance: 0.25 },
                { level: 2, desc: '35%概率清行', chance: 0.35 },
                { level: 3, desc: '45%概率清行+列', chance: 0.45 },
            ]
        },
        water: {
            id: 'water', name: '水灵', emoji: '≈', color: '#3b82f6',
            desc: '每5次连锁+2步',
            effect: 'extra_moves',
            comboThreshold: 5,
            movesGain: 2,
            upgrades: [
                { level: 1, desc: '每5连锁+2步', threshold: 5, moves: 2 },
                { level: 2, desc: '每4连锁+2步', threshold: 4, moves: 2 },
                { level: 3, desc: '每3连锁+3步', threshold: 3, moves: 3 },
            ]
        },
        earth: {
            id: 'earth', name: '地灵', emoji: '▣', color: '#92400e',
            desc: '障碍物HP-1',
            effect: 'reduce_obstacle_hp',
            upgrades: [
                { level: 1, desc: '锁定-1HP', reduction: 1 },
                { level: 2, desc: '锁定-1HP, 冰冻50%概率自解', reduction: 1, frozenChance: 0.5 },
                { level: 3, desc: '锁定-2HP, 冰冻70%概率自解', reduction: 2, frozenChance: 0.7 },
            ]
        },
        wind: {
            id: 'wind', name: '风灵', emoji: '◎', color: '#06b6d4',
            desc: '每步后宝石随机移位(混沌模式)',
            effect: 'shuffle_after_move',
            shuffleCount: 3,
            upgrades: [
                { level: 1, desc: '每步随机交换3对', count: 3 },
                { level: 2, desc: '每步随机交换5对+特殊宝石', count: 5 },
                { level: 3, desc: '全局洗牌+保证可消除', count: -1 },
            ]
        },
        lightning: {
            id: 'lightning', name: '雷灵', emoji: '↯', color: '#eab308',
            desc: '每3步随机消除一个宝石',
            effect: 'random_destroy',
            interval: 3,
            upgrades: [
                { level: 1, desc: '每3步消1个', interval: 3, count: 1 },
                { level: 2, desc: '每3步消2个', interval: 3, count: 2 },
                { level: 3, desc: '每2步消3个', interval: 2, count: 3 },
            ]
        }
    },

    // Player's loadout (max 3 spirits)
    MAX_LOADOUT: 3,
    currentLoadout: [], // ['fire', 'water', 'earth']

    // Spirit levels (persistent upgrades)
    getSpiritLevel(spiritId) {
        const data = JSON.parse(localStorage.getItem('mango_battle_spirits') || '{}');
        return data[spiritId] || 1;
    },

    setSpiritLevel(spiritId, level) {
        const data = JSON.parse(localStorage.getItem('mango_battle_spirits') || '{}');
        data[spiritId] = level;
        localStorage.setItem('mango_battle_spirits', JSON.stringify(data));
    },

    getUpgradeCost(spiritId) {
        const level = this.getSpiritLevel(spiritId);
        return level >= 3 ? null : (level + 1) * 500; // 1000, 1500 gold
    },

    upgradeSpirit(spiritId) {
        const level = this.getSpiritLevel(spiritId);
        if (level >= 3) return false;
        const cost = this.getUpgradeCost(spiritId);
        if (Storage.getGold() < cost) return false;
        Storage.spendGold(cost);
        this.setSpiritLevel(spiritId, level + 1);
        return true;
    },

    // Set loadout
    setLoadout(spirits) {
        this.currentLoadout = spirits.slice(0, this.MAX_LOADOUT);
        localStorage.setItem('mango_loadout', JSON.stringify(this.currentLoadout));
    },

    getLoadout() {
        if (this.currentLoadout.length === 0) {
            this.currentLoadout = JSON.parse(localStorage.getItem('mango_loadout') || '["fire","water","earth"]');
        }
        return this.currentLoadout;
    },

    // Spirit effects during gameplay
    _comboCounter: 0,
    _moveCounter: 0,

    resetCounters() {
        this._comboCounter = 0;
        this._moveCounter = 0;
    },

    // Called after each move
    onMove(game) {
        this._moveCounter++;
        const loadout = this.getLoadout();

        for (const spiritId of loadout) {
            const spirit = this.BATTLE_SPIRITS[spiritId];
            if (!spirit) continue;
            const level = this.getSpiritLevel(spiritId);
            const upgrade = spirit.upgrades[Math.min(level - 1, spirit.upgrades.length - 1)];

            switch (spirit.effect) {
                case 'shuffle_after_move': {
                    // Wind spirit: shuffle some gems
                    const count = upgrade.count;
                    if (count === -1) {
                        // Full shuffle (level 3)
                        // Handled by game.shuffleBoard-like logic
                        this._windFullShuffle = true;
                    } else {
                        for (let i = 0; i < count; i++) {
                            const x1 = Math.floor(Math.random() * game.width);
                            const y1 = Math.floor(Math.random() * game.height);
                            const x2 = Math.floor(Math.random() * game.width);
                            const y2 = Math.floor(Math.random() * game.height);
                            if (game.board[y1]?.[x1] && game.board[y2]?.[x2]) {
                                game.swapData(x1, y1, x2, y2);
                            }
                        }
                    }
                    break;
                }
                case 'random_destroy': {
                    const interval = upgrade.interval || 3;
                    const destroyCount = upgrade.count || 1;
                    if (this._moveCounter % interval === 0) {
                        for (let i = 0; i < destroyCount; i++) {
                            let at = 0;
                            while (at++ < 30) {
                                const rx = Math.floor(Math.random() * game.width);
                                const ry = Math.floor(Math.random() * game.height);
                                if (game.board[ry]?.[rx]) {
                                    game.updateObjective(game.board[ry][rx].type);
                                    game.board[ry][rx] = null;
                                    game.addScore(25);
                                    const cell = game.getCell(rx, ry);
                                    if (cell) cell.style.animation = 'cell-flash 0.15s ease';
                                    break;
                                }
                            }
                        }
                    }
                    break;
                }
            }
        }
    },

    // Called after each combo
    onCombo(comboDepth, game) {
        this._comboCounter++;
        const loadout = this.getLoadout();

        for (const spiritId of loadout) {
            const spirit = this.BATTLE_SPIRITS[spiritId];
            if (!spirit) continue;
            const level = this.getSpiritLevel(spiritId);
            const upgrade = spirit.upgrades[Math.min(level - 1, spirit.upgrades.length - 1)];

            switch (spirit.effect) {
                case 'auto_clear_row': {
                    const chance = upgrade.chance || 0.25;
                    if (Math.random() < chance) {
                        const row = Math.floor(Math.random() * game.height);
                        for (let x = 0; x < game.width; x++) {
                            if (game.board[row]?.[x]) {
                                game.updateObjective(game.board[row][x].type);
                                game.board[row][x] = null;
                                game.addScore(25);
                            }
                        }
                        // Level 3: also clear a column
                        if (level >= 3) {
                            const col = Math.floor(Math.random() * game.width);
                            for (let y = 0; y < game.height; y++) {
                                if (game.board[y]?.[col]) {
                                    game.updateObjective(game.board[y][col].type);
                                    game.board[y][col] = null;
                                    game.addScore(25);
                                }
                            }
                        }
                        UI.showToast(`☆ 火灵清行！`, 'success');
                    }
                    break;
                }
                case 'extra_moves': {
                    const threshold = upgrade.threshold || 5;
                    const moves = upgrade.moves || 2;
                    if (this._comboCounter % threshold === 0 && !game.level.timed) {
                        game.movesLeft += moves;
                        UI.showToast(`≈ 水灵: +${moves}步！`, 'success');
                    }
                    break;
                }
                case 'reduce_obstacle_hp': {
                    // Reduce all locked cells by reduction amount
                    const reduction = upgrade.reduction || 1;
                    const frozenChance = upgrade.frozenChance || 0;
                    for (let y = 0; y < game.height; y++) {
                        for (let x = 0; x < game.width; x++) {
                            const cs = game.cellStates[y]?.[x];
                            if (!cs) continue;
                            if (cs.locked > 0) {
                                cs.locked = Math.max(0, cs.locked - reduction);
                                if (cs.locked === 0) {
                                    const cell = game.getCell(x, y);
                                    if (cell) cell.classList.remove('locked-cell');
                                }
                            }
                            if (cs.frozen && frozenChance > 0 && Math.random() < frozenChance) {
                                cs.frozen = false;
                                const cell = game.getCell(x, y);
                                if (cell) cell.classList.remove('frozen');
                            }
                        }
                    }
                    break;
                }
            }
        }
    }
};

// ============================================================
// 5. CHALLENGE TOWER
// ============================================================

const ChallengeTower = {
    TOTAL_FLOORS: 50,

    // Floor definitions: each floor has special constraints
    getFloor(floorNum) {
        const base = {
            floor: floorNum,
            width: 8,
            height: 8,
            gems: ['murloc', 'orc', 'elf', 'mage', 'knight'],
            moves: Math.max(10, 30 - Math.floor(floorNum / 3)),
            objectives: [],
            special: {},
            constraints: [],
            stars: [5000, 10000, 20000],
        };

        // Scale gems
        if (floorNum > 10) base.gems.push('dwarf');
        if (floorNum > 20) base.gems.push('undead');
        if (floorNum > 30) base.gems.push('mango');
        if (floorNum > 40) base.gems.push('dragon');
        if (floorNum > 45) base.gems.push('phoenix');

        // ── Floor 1-5: basic constraints (no special gems, limited moves) ──
        if (floorNum <= 5) {
            base.constraints.push({ name: '禁特殊', desc: '无法生成特殊宝石', icon: '✗', type: 'no_specials' });
            base.moves = Math.max(12, 22 - floorNum * 2); // 20, 18, 16, 14, 12
        }
        // ── Floor 6-10: harder (fog + gravity combo, restricted gem types) ──
        else if (floorNum <= 10) {
            base.special = { fog: true, fogCount: 6 + (floorNum - 6) * 2, gravityShift: true };
            // Restrict to 4 gem types
            base.gems = base.gems.slice(0, 4);
            base.constraints.push({ name: '迷雾重力', desc: '迷雾+重力偏移', icon: '◎' });
        }

        // Scale objectives
        const scoreTarget = 3000 + floorNum * 500;
        base.objectives.push({ type: 'score', target: scoreTarget, icon: '★' });
        base.stars = [scoreTarget, Math.floor(scoreTarget * 1.5), Math.floor(scoreTarget * 2.5)];

        // Apply floor-specific constraints (only for floors > 10 that aren't bosses)
        const isBoss = floorNum % 5 === 0;
        if (floorNum > 10 && !isBoss) {
            const constraint = this.getFloorConstraint(floorNum);
            if (constraint) {
                base.constraints.push(constraint);
                Object.assign(base, constraint.modifiers || {});
                if (constraint.extraObjectives) base.objectives.push(...constraint.extraObjectives);
            }
        }

        // ── Boss floors: every 5th floor (5, 10, 15, 20, ..., 50) ──
        if (isBoss && floorNum < 50) {
            base.boss = true;
            const bossIndex = Math.floor(floorNum / 5);
            base.moves += 8;
            // Boss HP scales: 3000 + 2000 per boss index
            base._bossHP = 3000 + bossIndex * 2000;
            // Attacks per turn scale: 1 at floor 5, 2+ at higher floors
            base._bossAttacksPerTurn = Math.min(1 + Math.floor(bossIndex / 3), 3);
            base.objectives.push({ type: 'combo', target: Math.min(3 + bossIndex, 8), icon: '☆' });
        }

        // Floor 50: Ultimate Boss
        if (floorNum === 50) {
            base.boss = true;
            base.width = 9;
            base.height = 9;
            base.moves = 50;
            base.gems = ['knight', 'dwarf', 'undead', 'mango', 'dragon', 'phoenix'];
            base._bossHP = 25000;
            base._bossAttacksPerTurn = 3;
            base.objectives = [
                { type: 'score', target: 100000, icon: '★' },
                { type: 'combo', target: 8, icon: '☆' },
                { type: 'special', target: 10, specialType: 'any', icon: '✦' },
            ];
            base.stars = [100000, 150000, 250000];
            base.special = { fog: true, fogCount: 15, gravityShift: true, chainBonus: true };
            base.timed = true;
            base.timeLimit = 180;
            base.constraints.push({ name: '终极考验', desc: '全部机制激活', icon: '☠' });
        }

        // Create proper level config
        return {
            id: 10000 + floorNum,
            chapter: 10,
            tower: true,
            towerFloor: floorNum,
            ...base,
        };
    },

    FLOOR_CONSTRAINTS: [
        { name: '仅三消', desc: '只有3个一排才有效', icon: '[3]', type: 'only_3match' },
        { name: '禁特殊', desc: '无法生成特殊宝石', icon: '✗', type: 'no_specials' },
        { name: '小棋盘', desc: '棋盘缩小为6x6', icon: '▤', type: 'small_board', modifiers: { width: 6, height: 6 } },
        { name: '超小棋盘', desc: '棋盘缩小为5x5', icon: '▤', type: 'tiny_board', modifiers: { width: 5, height: 5 } },
        { name: '迷雾重重', desc: '大量迷雾覆盖', icon: '≋', type: 'heavy_fog', modifiers: { special: { fog: true, fogCount: 20 } } },
        { name: '重力异常', desc: '宝石向左滑落', icon: '←', type: 'gravity', modifiers: { special: { gravityShift: true } } },
        { name: '连锁大师', desc: '必须达成高连锁', icon: '≡', type: 'chain_master', extraObjectives: [{ type: 'combo', target: 8, icon: '☆' }] },
        { name: '限时冲刺', desc: '60秒时间限制', icon: '[限时]', type: 'timed_sprint', modifiers: { timed: true, timeLimit: 60 } },
        { name: '冰封世界', desc: '大量冰冻格子', icon: '※', type: 'frozen_world' },
        { name: '宝石收集', desc: '收集指定宝石', icon: '◎', type: 'collect_gems' },
        { name: '炸弹专家', desc: '只能用炸弹消除', icon: '✸', type: 'bomb_only' },
        { name: '步数极限', desc: '只有8步', icon: '●', type: 'minimal_moves', modifiers: { moves: 8 } },
    ],

    getFloorConstraint(floorNum) {
        if (floorNum === 50) return null; // Boss floor has custom constraints
        // Deterministic constraint based on floor number
        const seed = floorNum * 2654435761;
        const idx = seed % this.FLOOR_CONSTRAINTS.length;
        const constraint = { ...this.FLOOR_CONSTRAINTS[Math.abs(idx) % this.FLOOR_CONSTRAINTS.length] };

        // Scale difficulty with floor number
        if (constraint.type === 'collect_gems') {
            const gemPool = ['murloc', 'orc', 'elf', 'mage', 'knight', 'dwarf'];
            const gem = gemPool[floorNum % gemPool.length];
            constraint.extraObjectives = [{ type: 'clear', target: 15 + floorNum, gem, icon: GEM_TYPES[gem]?.emoji || '?' }];
        }
        if (constraint.type === 'chain_master') {
            constraint.extraObjectives = [{ type: 'combo', target: 3 + Math.floor(floorNum / 5), icon: '☆' }];
        }

        return constraint;
    },

    // Tower progress
    getProgress() {
        return JSON.parse(localStorage.getItem('mango_tower') || '{"currentFloor":1,"bestFloor":0,"totalScore":0,"completedFloors":{}}');
    },

    saveProgress(data) {
        localStorage.setItem('mango_tower', JSON.stringify(data));
    },

    completeFloor(floorNum, score, stars) {
        const progress = this.getProgress();
        progress.completedFloors[floorNum] = { score, stars, time: Date.now() };
        progress.bestFloor = Math.max(progress.bestFloor, floorNum);
        progress.currentFloor = Math.min(this.TOTAL_FLOORS, floorNum + 1);
        progress.totalScore += score;
        this.saveProgress(progress);
        return progress;
    },

    // Monthly reset
    checkMonthlyReset() {
        const progress = this.getProgress();
        const lastReset = progress.lastReset || 0;
        const now = Date.now();
        const lastResetMonth = new Date(lastReset).getMonth();
        const currentMonth = new Date(now).getMonth();
        if (lastResetMonth !== currentMonth || now - lastReset > 30 * 86400000) {
            // Reset tower but keep spirit levels
            progress.currentFloor = 1;
            progress.completedFloors = {};
            progress.totalScore = 0;
            progress.lastReset = now;
            this.saveProgress(progress);
            return true;
        }
        return false;
    },

    // Tower leaderboard
    getLeaderboard() {
        return JSON.parse(localStorage.getItem('mango_tower_lb') || '[]');
    },

    submitScore(playerName, avatar, bestFloor, totalScore) {
        const lb = this.getLeaderboard();
        lb.push({ name: playerName, avatar, floor: bestFloor, score: totalScore, time: Date.now() });
        lb.sort((a, b) => b.floor === a.floor ? b.score - a.score : b.floor - a.floor);
        localStorage.setItem('mango_tower_lb', JSON.stringify(lb.slice(0, 100)));
    }
};

// ============================================================
// INTEGRATION: Hardcore mode state
// ============================================================

const HardcoreMode = {
    enabled: true, // Always enabled — the casual "Story Mode" is the base, these add on top

    // Called during game init
    onGameInit(game) {
        SkillMechanics.reset();
        SkillMechanics.clearPending();
        SpiritLoadout.resetCounters();
    },

    // Called after a successful swap (before processMatches)
    onMove(game) {
        SpiritLoadout.onMove(game);
        DifficultyTiers.spawnRandomObstacle(game);
        SkillMechanics.addPowerFromCombo(0); // base charge per move
    },

    // Called during processMatches, each combo iteration
    onCombo(comboDepth, game) {
        SkillMechanics.addPowerFromCombo(comboDepth);
        SpiritLoadout.onCombo(comboDepth, game);
    },

    // Called after all matches resolve
    onMatchesComplete(game) {
        // Check perfect clear
        if (ComboTheory.checkPerfectClear(game.board, game.width, game.height)) {
            game.addScore(ComboTheory.PERFECT_CLEAR_BONUS);
            UI.showToast('✦ PERFECT CLEAR! +50000!', 'success');
            game.screenShake(15, 500);
            Utils.vibrate([100, 50, 100, 50, 200]);
        }
    },

    // Called on processMatch for shape detection
    onMatchProcessed(match, game) {
        const shape = ComboTheory.detectShapeCombo(match.cells);
        if (shape) {
            const bonus = ComboTheory.SHAPE_BONUSES[shape];
            game.addScore(bonus.score);
            const boardEl = document.getElementById('game-board');
            if (boardEl) {
                const r = boardEl.getBoundingClientRect();
                Particles.floatingText(r.left + r.width / 2, r.top + r.height * 0.2, bonus.label, '#ff6b6b');
            }
        }
    },

    // Get combo multiplier for current chain depth
    getComboMultiplier(chainDepth) {
        return ComboTheory.getMultiplier(chainDepth);
    },

    // Calculate board reading score at end of level
    getBoardReadingScore(game) {
        return SkillMechanics.calculateBoardReadingScore(game);
    }
};
