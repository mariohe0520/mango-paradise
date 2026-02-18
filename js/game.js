/* ==========================================
   芒果庄园 - 核心游戏逻辑 (升级版)
   Mango Paradise - Core Game Logic
   集成: 庄园Buff、觉醒技能条、Boss战、冰/锁
   ========================================== */

class Game {
    constructor() {
        this.board = [];
        this.cellStates = []; // { frozen, locked }
        this.width = 8;
        this.height = 8;
        this.gems = [];
        this.level = null;
        this.score = 0;
        this.movesLeft = 0;
        this.timeLeft = 0;
        this.timerInterval = null;
        this.combo = 0;
        this.maxCombo = 0;
        this.objectives = [];
        this.objectiveProgress = {};
        this.selectedCell = null;
        this.isSwapping = false;
        this.isProcessing = false;
        this.isPaused = false;
        this.isGameOver = false;
        this.powerupMode = null;
        this.hintCells = [];
        this.hintTimer = null;
        this.gameStartTime = 0;
        this.powerupsUsed = 0;

        // Buff system
        this.scoreMultiplier = 1.0;

        // Skill bar
        this.skillCharge = 0;
        this.skillMax = 100;

        // Boss
        this.isBossLevel = false;

        // Ch7-10 Special Mechanics
        this.fogCells = [];          // [{x, y}] fog overlay positions
        this.gravityShiftActive = false;
        this.chainBonusActive = false;
        this.chainDepth = 0;         // current cascade depth for chain bonus

        // Special gem types
        this.SPECIAL_TYPES = {
            NONE: 'none',
            HORIZONTAL: 'horizontal',
            VERTICAL: 'vertical',
            BOMB: 'bomb',
            RAINBOW: 'rainbow'
        };

        // Score config
        this.SCORES = {
            MATCH_3: 50, MATCH_4: 100, MATCH_5: 200, MATCH_6: 500,
            COMBO_BONUS: 25, SPECIAL_ACTIVATE: 150, SPECIAL_COMBO: 500
        };
    }

    // ==========================================
    // Initialization
    // ==========================================

    // Init from a procedural level config (daily/endless)
    initSpecial(config) {
        this.level = config;
        this.level.id = config.id || 9999;
        this.init(config.id, config);
    }

    init(levelId, overrideLevel) {
        this.level = overrideLevel || getLevel(levelId);
        this.width = this.level.width;
        this.height = this.level.height;
        this.gems = this.level.gems;
        this.movesLeft = this.level.moves;
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.selectedCell = null;
        this.isSwapping = false;
        this.isProcessing = false;
        this.isPaused = false;
        this.isGameOver = false;
        this.powerupMode = null;
        this.hintCells = [];
        this.gameStartTime = Date.now();
        this.powerupsUsed = 0;

        // Init cell states
        this.cellStates = [];
        for (let y = 0; y < this.height; y++) {
            this.cellStates[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.cellStates[y][x] = { frozen: false, locked: 0 };
            }
        }

        // Apply Estate Buffs (defensive: never let Estate/Boss errors block board creation)
        try {
            this.scoreMultiplier = Estate.getScoreMultiplier();
            // Buff notifications — show what buffs are active this level
            const buffMessages = [];
            if (Estate.hasBuff('extra_moves')) {
                const extraMoves = Estate.getExtraMoves() || 2;
                this.movesLeft += extraMoves;
                buffMessages.push(`☽ 月光树: +${extraMoves}步`);
            }
            // Spirit Trial buffs: extra moves from affection abilities
            const trialExtraMoves = Estate.getTrialExtraMoves();
            if (trialExtraMoves > 0) {
                this.movesLeft += trialExtraMoves;
                buffMessages.push(`♥ 精灵羁绊: +${trialExtraMoves}步`);
            }
            if (this.scoreMultiplier > 1) buffMessages.push(`✦ 幸福度: 分数x${this.scoreMultiplier}`);
            if (Estate.hasBuff('rainbow_4')) buffMessages.push('◇ 彩虹树: 4消出彩虹');
            if (Estate.hasBuff('start_bomb')) buffMessages.push('✦ 金芒树: 开局炸弹');
            // Trial charge boost
            const trialCharge = Estate.getTrialChargeBoost();
            if (trialCharge > 0) buffMessages.push(`♥ 充能+${trialCharge}%`);
            // Show buff summary with dramatic entrance
            if (buffMessages.length > 0) {
                setTimeout(() => {
                    this.showBuffFlash('rgba(255,215,0,0.2)');
                    UI.showToast('↯ ' + buffMessages.join(' | '), 'success');
                }, 800);
            }
        } catch (e) {
            console.warn('[Game.init] Estate buff error (fallback to defaults):', e);
            this.scoreMultiplier = 1.0;
        }

        // Skill bar
        this.skillCharge = 0;
        this.skillMax = 100;

        // Track if skulls ever appeared on board (for achievements)
        this._hadSkulls = false;

        // Boss
        try {
            this.isBossLevel = Boss.isBossLevel(levelId);
            if (this.isBossLevel) {
                Boss.init(levelId);
                // Boss entrance cinematic
                setTimeout(() => this.showBossEntrance(levelId), 500);
            }
        } catch (e) {
            console.warn('[Game.init] Boss init error (fallback to non-boss):', e);
            this.isBossLevel = false;
        }

        // Init objectives
        this.objectives = Utils.deepClone(this.level.objectives);
        this.objectiveProgress = {};
        this.objectives.forEach((obj, i) => { this.objectiveProgress[i] = 0; });

        // Show how-to guide AFTER objectives are set
        this.showSpecialGuide();

        // Create board
        this.createBoard();
        this.ensureNoInitialMatches();

        // Apply blockers (frozen/locked cells) based on level config
        try {
            const levelId = this.level.id || 0;
            // Auto-generate blockers (starts chapter 2, escalates)
            if (levelId >= 11 && levelId <= 100) {
                const difficulty = levelId >= 31 ? Math.floor((levelId - 31) / 10) + 2 :
                                   levelId >= 21 ? 1 :
                                   0;
                // Frozen cells: gentle at 11-20, more at 21+
                const frozenCount = levelId >= 31 ? Math.min(2 + difficulty, 6) :
                                    levelId >= 21 ? Math.min(1 + Math.floor((levelId-21)/5), 3) :
                                    Math.min(Math.floor((levelId-11)/3), 2); // 0-2 frozen in ch2
                for (let i = 0; i < frozenCount; i++) {
                    const fx = Utils.randomInt(0, this.width-1);
                    const fy = Utils.randomInt(0, this.height-1);
                    if (this.cellStates[fy] && this.cellStates[fy][fx]) {
                        this.cellStates[fy][fx].frozen = true;
                    }
                }
                // Locked cells (level 51+): 1-4
                if (levelId >= 51) {
                    const lockedCount = Math.min(1 + Math.floor(difficulty / 2), 4);
                    for (let i = 0; i < lockedCount; i++) {
                        const lx = Utils.randomInt(0, this.width-1);
                        const ly = Utils.randomInt(0, this.height-1);
                        if (this.cellStates[ly] && this.cellStates[ly][lx] && !this.cellStates[ly][lx].frozen) {
                            this.cellStates[ly][lx].locked = levelId >= 71 ? 2 : 1;
                        }
                    }
                }
            }
        } catch (e) {
            console.warn('[Game.init] blockers error:', e);
        }

        // Place start rainbow from spirit trial ability
        try {
            if (Estate.hasTrialStartRainbow()) {
                let attempts = 0;
                while (attempts < 20) {
                    const rx = Utils.randomInt(0, this.width - 1);
                    const ry = Utils.randomInt(0, this.height - 1);
                    if (this.board[ry][rx] && this.board[ry][rx].special === this.SPECIAL_TYPES.NONE) {
                        this.board[ry][rx].special = this.SPECIAL_TYPES.RAINBOW;
                        break;
                    }
                    attempts++;
                }
            }
            if (Estate.hasTrialStartSpecial()) {
                let attempts = 0;
                while (attempts < 20) {
                    const rx = Utils.randomInt(0, this.width - 1);
                    const ry = Utils.randomInt(0, this.height - 1);
                    if (this.board[ry][rx] && this.board[ry][rx].special === this.SPECIAL_TYPES.NONE) {
                        const types = [this.SPECIAL_TYPES.HORIZONTAL, this.SPECIAL_TYPES.VERTICAL, this.SPECIAL_TYPES.BOMB];
                        this.board[ry][rx].special = types[Math.floor(Math.random() * types.length)];
                        break;
                    }
                    attempts++;
                }
            }
        } catch(e) { console.warn('[Game.init] trial start buff error:', e); }

        // Place start bombs if buff active (scales with tree level)
        this._startBombPositions = [];
        try {
            if (Estate.hasBuff('start_bomb')) {
                const bombCount = Estate.getStartBombs() || 1;
                for (let b = 0; b < bombCount; b++) {
                    let attempts = 0;
                    while (attempts < 20) {
                        const rx = Utils.randomInt(0, this.width - 1);
                        const ry = Utils.randomInt(0, this.height - 1);
                        if (this.board[ry][rx] && this.board[ry][rx].special === this.SPECIAL_TYPES.NONE) {
                            this.board[ry][rx].special = this.SPECIAL_TYPES.BOMB;
                            this._startBombPositions.push({x: rx, y: ry});
                            // Animate bomb entrance after render
                            setTimeout(() => {
                                const cell = document.querySelector(`.cell[data-x="${rx}"][data-y="${ry}"]`);
                                if (cell) {
                                    cell.classList.add('bomb-entrance');
                                    this.showBuffFlash('rgba(245,158,11,0.25)');
                                    setTimeout(() => cell.classList.remove('bomb-entrance'), 600);
                                }
                            }, 1200 + b * 300);
                            break;
                        }
                        attempts++;
                    }
                }
            }
        } catch (e) {
            console.warn('[Game.init] start_bomb buff error:', e);
        }

        // ── Ch7-10 Special Mechanics Init ──
        this.chainBonusActive = !!(this.level.special && this.level.special.chainBonus);
        this.gravityShiftActive = !!(this.level.special && this.level.special.gravityShift);
        this.fogCells = [];
        this.chainDepth = 0;
        // Clean up previous gravity indicator DOM element on restart
        const oldGravInd = document.querySelector('.gravity-shift-indicator');
        if (oldGravInd) oldGravInd.remove();
        if (this.level.special && this.level.special.fog) {
            const fogCount = this.level.special.fogCount || this.level.special.fogCells || 10;
            this.initFog(fogCount);
        }

        // Timed level
        if (this.level.timed) {
            this.timeLeft = this.level.timeLimit;
            this.startTimer();
        } else {
            this.timeLeft = 0;
            if (this.timerInterval) { clearInterval(this.timerInterval); this.timerInterval = null; }
        }

        // ── Hardcore Mode Init ──
        try {
            if (typeof HardcoreMode !== 'undefined') {
                HardcoreMode.onGameInit(this);
            }
        } catch (e) { console.warn('[Game.init] HardcoreMode init error:', e); }

        this.render();
        this.updateUI();
        this.startHintTimer();

        // Resize handler: re-render board on orientation change
        if (!this._resizeHandler) {
            let resizeTimer;
            this._resizeHandler = () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => { if (!this.isGameOver) this.render(); }, 200);
            };
            window.addEventListener('resize', this._resizeHandler);
        }

        try { Utils.log.info(`Game initialized: Level ${levelId}${this.isBossLevel ? ' (BOSS)' : ''}${this.level.timed ? ' (TIMED)' : ''}`); } catch(e) { console.log('Game init: Level', levelId); }
        return this;
    }

    // Timer for timed levels
    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            if (this.isPaused || this.isGameOver) return;
            this.timeLeft--;
            this.updateTimerUI();
            if (this.timeLeft <= 0) {
                clearInterval(this.timerInterval);
                this.defeat();
            }
        }, 1000);
    }

    updateTimerUI() {
        const el = document.getElementById('timer-display');
        if (el) {
            el.textContent = this.timeLeft;
            el.style.color = this.timeLeft <= 10 ? '#ef4444' : '';
        }
    }

    // ==========================================
    // Board Creation
    // ==========================================

    createBoard() {
        this.board = [];
        for (let y = 0; y < this.height; y++) {
            this.board[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.board[y][x] = this.createGem(x, y);
            }
        }
    }

    createGem(x, y, gemType = null) {
        return {
            type: gemType || Utils.randomChoice(this.gems),
            special: this.SPECIAL_TYPES.NONE,
            x, y,
            id: Utils.generateId()
        };
    }

    ensureNoInitialMatches() {
        let hasMatches = true, attempts = 0;
        while (hasMatches && attempts < 100) {
            hasMatches = false; attempts++;
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    if (x >= 2 && this.board[y][x].type === this.board[y][x-1].type && this.board[y][x].type === this.board[y][x-2].type) {
                        this.board[y][x] = this.createGem(x, y); hasMatches = true;
                    }
                    if (y >= 2 && this.board[y][x].type === this.board[y-1][x].type && this.board[y][x].type === this.board[y-2][x].type) {
                        this.board[y][x] = this.createGem(x, y); hasMatches = true;
                    }
                }
            }
        }
    }

    // ==========================================
    // Fog Mechanic (Ch8+)
    // ==========================================

    initFog(count) {
        this.fogCells = [];
        const allPositions = [];
        for (let y = 0; y < this.height; y++)
            for (let x = 0; x < this.width; x++)
                allPositions.push({ x, y });
        // Shuffle and pick
        for (let i = allPositions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allPositions[i], allPositions[j]] = [allPositions[j], allPositions[i]];
        }
        this.fogCells = allPositions.slice(0, Math.min(count, allPositions.length));
    }

    isFogged(x, y) {
        return this.fogCells.some(f => f.x === x && f.y === y);
    }

    revealFogAt(x, y) {
        // Reveal fog at exactly (x,y)
        this.fogCells = this.fogCells.filter(f => !(f.x === x && f.y === y));
    }

    revealFogAdjacent(matchCells) {
        // For each matched cell, reveal fog on adjacent cells
        if (this.fogCells.length === 0) return;
        const revealed = new Set();
        const dirs = [{dx:-1,dy:0},{dx:1,dy:0},{dx:0,dy:-1},{dx:0,dy:1}];
        for (const cell of matchCells) {
            // Also reveal fog ON the matched cell itself
            const selfKey = `${cell.x},${cell.y}`;
            if (this.isFogged(cell.x, cell.y) && !revealed.has(selfKey)) {
                revealed.add(selfKey);
            }
            for (const {dx, dy} of dirs) {
                const nx = cell.x + dx, ny = cell.y + dy;
                if (!this.isValidCell(nx, ny)) continue;
                const key = `${nx},${ny}`;
                if (this.isFogged(nx, ny) && !revealed.has(key)) {
                    revealed.add(key);
                }
            }
        }
        if (revealed.size > 0) {
            for (const key of revealed) {
                const [fx, fy] = key.split(',').map(Number);
                this.revealFogAt(fx, fy);
                // Visual feedback: brief glow on revealed cell
                const cell = this.getCell(fx, fy);
                if (cell) {
                    cell.classList.add('fog-reveal');
                    setTimeout(() => cell.classList.remove('fog-reveal'), 600);
                }
            }
            // Show floating text
            const boardEl = document.getElementById('game-board');
            if (boardEl) {
                const r = boardEl.getBoundingClientRect();
                Particles.floatingText(r.left + r.width / 2, r.top + r.height / 2,
                    `≋ -${revealed.size} fog!`, '#60a5fa');
            }
        }
    }

    // ==========================================
    // Rendering
    // ==========================================

    render() {
        try {
            const boardEl = document.getElementById('game-board');
            if (!boardEl) { console.error('[Game.render] #game-board not found'); return; }

            // ── Cell size: TARGET 90% screen width, constrain by height ──
            const gap = 2; // matches --board-gap

            // Width: fill 98% of screen width
            const targetBoardW = Math.floor(window.innerWidth * 0.98);
            const cellFromW = Math.floor((targetBoardW - (this.width - 1) * gap) / this.width);

            // Height: use the ACTUAL rendered height of board-container (flex:1 gives us remaining space)
            const container = document.querySelector('.game-board-container');
            let cellFromH = cellFromW; // default: square cells, width-first
            if (container) {
                // container.clientHeight = actual available height after flex layout
                const containerH = container.clientHeight;
                if (containerH > 100) { // sanity check
                    // Leave 8px for frame padding
                    cellFromH = Math.floor((containerH - 8 - (this.height - 1) * gap) / this.height);
                }
            }

            let cellPx = Math.min(cellFromW, cellFromH);
            cellPx = Math.max(44, cellPx); // minimum 44px for touch targets (WCAG)

            // Push back to CSS so font-size: calc(var(--cell-size) * 0.65) works
            document.documentElement.style.setProperty('--cell-size', cellPx + 'px');
            boardEl.style.gridTemplateColumns = `repeat(${this.width}, ${cellPx}px)`;
            boardEl.style.gridTemplateRows    = `repeat(${this.height}, ${cellPx}px)`;

            // Store computed cell size for animations
            this._cellPx = cellPx;

            // ── PERFORMANCE: only rebuild DOM on first render or size change ──
            const expectedCells = this.width * this.height;
            const needsRebuild = boardEl.children.length !== expectedCells || this._lastCellPx !== cellPx;

            if (needsRebuild) {
                boardEl.innerHTML = '';
                for (let y = 0; y < this.height; y++) {
                    for (let x = 0; x < this.width; x++) {
                        const cell = document.createElement('div');
                        cell.className = 'cell';
                        cell.dataset.x = x;
                        cell.dataset.y = y;
                        cell.style.width  = cellPx + 'px';
                        cell.style.height = cellPx + 'px';
                        cell.addEventListener('click', () => this.onCellClick(x, y));
                        cell.addEventListener('touchstart', (e) => this.onTouchStart(e, x, y), { passive: false });
                        cell.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
                        cell.addEventListener('touchend', (e) => this.onTouchEnd(e, x, y), { passive: false });
                        boardEl.appendChild(cell);
                    }
                }
                this._lastCellPx = cellPx;
            }

            // ── Ultra-fast update: gem skip optimization + ALWAYS check fog ──
            const children = boardEl.children;
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    const idx = y * this.width + x;
                    const cell = children[idx];
                    if (!cell) continue;
                    const gem = this.board[y][x];
                    const gemId = gem ? gem.id : '';
                    const gemChanged = cell._lastGemId !== gemId || !!cell._dirty;

                    // ── Gem content update (only if changed) ──
                    if (gemChanged) {
                        cell._lastGemId = gemId;
                        cell._dirty = false;

                        // Update gem content
                        const existingGem = cell.querySelector('.gem');
                        if (gem) {
                            if (!existingGem || existingGem.dataset.id !== gem.id) {
                                // Remove old gem (preserve fog overlay if present)
                                const oldGem = cell.querySelector('.gem');
                                if (oldGem) oldGem.remove();
                                cell.insertBefore(this.createGemElement(gem), cell.firstChild);
                            }
                        } else {
                            if (existingGem) existingGem.remove();
                        }

                        // Update cell states (frozen/locked)
                        const cs = this.cellStates[y] && this.cellStates[y][x];
                        if (cs) {
                            cell.classList.toggle('frozen', !!cs.frozen);
                            cell.classList.toggle('locked-cell', cs.locked > 0);
                            if (cs.locked > 0) cell.dataset.lockLevel = cs.locked;
                        }
                    }

                    // ── Fog overlay (Ch8+): ALWAYS check — fog changes independently of gems ──
                    const fogged = this.isFogged(x, y);
                    const wasFogged = cell.classList.contains('fogged');
                    if (fogged !== wasFogged || gemChanged) {
                        cell.classList.toggle('fogged', fogged);
                        if (fogged) {
                            let fogOverlay = cell.querySelector('.fog-overlay');
                            if (!fogOverlay) {
                                fogOverlay = document.createElement('div');
                                fogOverlay.className = 'fog-overlay';
                                fogOverlay.textContent = '?';
                                cell.appendChild(fogOverlay);
                            }
                            const gemEl = cell.querySelector('.gem');
                            if (gemEl) gemEl.style.visibility = 'hidden';
                        } else {
                            const fogOverlay = cell.querySelector('.fog-overlay');
                            if (fogOverlay) fogOverlay.remove();
                            const gemEl = cell.querySelector('.gem');
                            if (gemEl) gemEl.style.visibility = '';
                        }
                    }
                }
            }

            // ── Gravity shift indicator (Ch9+) ──
            const boardFrame = boardEl.parentElement;
            let gravIndicator = boardFrame ? boardFrame.querySelector('.gravity-shift-indicator') : null;
            if (this.gravityShiftActive) {
                if (!gravIndicator && boardFrame) {
                    gravIndicator = document.createElement('div');
                    gravIndicator.className = 'gravity-shift-indicator';
                    gravIndicator.textContent = '⬅ 重力向左';
                    boardFrame.appendChild(gravIndicator);
                }
            } else if (gravIndicator) {
                gravIndicator.remove();
            }
        } catch (e) {
            console.error('[Game.render] error:', e);
        }
    }

    createGemElement(gem) {
        const gemEl = document.createElement('div');
        gemEl.className = `gem gem-${gem.type}`;
        gemEl.dataset.type = gem.type;
        gemEl.dataset.id = gem.id;
        // Skull gems get additional class (visual handled by CSS)
        if (gem.type === 'skull') {
            gemEl.classList.add('gem-skull');
        }
        // NO textContent — gem appearance is 100% CSS-rendered 3D spheres
        if (gem.special !== this.SPECIAL_TYPES.NONE) {
            gemEl.classList.add('special', gem.special);
        }
        return gemEl;
    }

    updateCell(x, y) {
        const cell = this.getCell(x, y);
        if (!cell) return;

        // Remove old gem (preserve fog overlay separately)
        const oldGem = cell.querySelector('.gem');
        if (oldGem) oldGem.remove();

        // Reapply cell state classes
        const cs = this.cellStates[y] && this.cellStates[y][x];
        cell.classList.remove('frozen', 'locked-cell');
        if (cs) {
            if (cs.frozen) cell.classList.add('frozen');
            if (cs.locked > 0) { cell.classList.add('locked-cell'); cell.dataset.lockLevel = cs.locked; }
            else { delete cell.dataset.lockLevel; }
        }
        const gem = this.board[y][x];
        if (gem) {
            const gemEl = this.createGemElement(gem);
            cell.insertBefore(gemEl, cell.firstChild);
        }

        // Fog overlay
        const fogged = this.isFogged(x, y);
        cell.classList.toggle('fogged', fogged);
        if (fogged) {
            let fogOverlay = cell.querySelector('.fog-overlay');
            if (!fogOverlay) {
                fogOverlay = document.createElement('div');
                fogOverlay.className = 'fog-overlay';
                fogOverlay.textContent = '?';
                cell.appendChild(fogOverlay);
            }
            const gemEl = cell.querySelector('.gem');
            if (gemEl) gemEl.style.visibility = 'hidden';
        } else {
            const fogOverlay = cell.querySelector('.fog-overlay');
            if (fogOverlay) fogOverlay.remove();
            const gemEl = cell.querySelector('.gem');
            if (gemEl) gemEl.style.visibility = '';
        }
        // Mark render cache dirty so next render() picks up the change
        cell._lastGemId = gem ? gem.id : '';
    }

    getCell(x, y) {
        // Direct index lookup — O(1) instead of querySelector O(n)
        const boardEl = document.getElementById('game-board');
        if (!boardEl) return null;
        const idx = y * this.width + x;
        return boardEl.children[idx] || null;
    }
    getGemElement(x, y) { const c = this.getCell(x, y); return c ? c.firstChild : null; }

    // ==========================================
    // Input Handling
    // ==========================================

    touchStartX = 0; touchStartY = 0; touchStartCell = null;

    onTouchStart(e, x, y) {
        // Emergency unlock: if stuck for >10s, force reset
        if (this.isProcessing && this._lastProcessingStart && Date.now() - this._lastProcessingStart > 10000) {
            console.warn('[onTouchStart] Emergency unlock: isProcessing stuck >10s');
            this.isProcessing = false;
        }
        if (this.isProcessing || this.isPaused || this.isGameOver) return;
        this._lastProcessingStart = Date.now();
        const touch = e.touches[0];
        this.touchStartX = touch.clientX; this.touchStartY = touch.clientY;
        this.touchStartCell = { x, y };
    }

    onTouchMove(e) { if (this.touchStartCell) e.preventDefault(); }

    onTouchEnd(e, x, y) {
        if (!this.touchStartCell || this.isProcessing) return;
        const touch = e.changedTouches[0];
        const dx = touch.clientX - this.touchStartX;
        const dy = touch.clientY - this.touchStartY;
        // Dynamic swipe threshold: 40% of cell size, minimum 15px
        const swipeThreshold = Math.max(15, (this._cellPx || 40) * 0.4);
        if (Math.abs(dx) > swipeThreshold || Math.abs(dy) > swipeThreshold) {
            let tx = this.touchStartCell.x, ty = this.touchStartCell.y;
            if (Math.abs(dx) > Math.abs(dy)) tx += dx > 0 ? 1 : -1;
            else ty += dy > 0 ? 1 : -1;
            if (this.isValidCell(tx, ty)) this.trySwap(this.touchStartCell.x, this.touchStartCell.y, tx, ty);
        } else {
            this.onCellClick(x, y);
        }
        this.touchStartCell = null;
        // Prevent subsequent click event from firing (fixes mobile double-fire)
        e.preventDefault();
    }

    onCellClick(x, y) {
        if (this.isProcessing || this.isPaused || this.isGameOver) return;

        // Check frozen
        if (this.cellStates[y] && this.cellStates[y][x] && this.cellStates[y][x].frozen) {
            Audio.play('invalid'); Utils.vibrate([50, 50, 50]); return;
        }

        if (this.powerupMode) { this.usePowerup(x, y); return; }
        this.clearHint();

        if (this.selectedCell) {
            const { x: sx, y: sy } = this.selectedCell;
            if (sx === x && sy === y) { this.deselectCell(); return; }
            // Check if target is frozen
            if (this.cellStates[sy] && this.cellStates[sy][sx] && this.cellStates[sy][sx].frozen) {
                this.deselectCell(); return;
            }
            if (this.isAdjacent(sx, sy, x, y)) {
                // Check both cells not frozen (with safe access)
                const csTarget = this.cellStates[y] && this.cellStates[y][x];
                const csSource = this.cellStates[sy] && this.cellStates[sy][sx];
                if ((csTarget && csTarget.frozen) || (csSource && csSource.frozen)) {
                    Audio.play('invalid'); this.deselectCell(); return;
                }
                this.trySwap(sx, sy, x, y);
            } else {
                this.deselectCell();
                this.selectCell(x, y);
            }
        } else {
            this.selectCell(x, y);
        }
    }

    selectCell(x, y) {
        this.selectedCell = { x, y };
        const cell = this.getCell(x, y);
        if (cell) { cell.classList.add('selected'); const g = cell.querySelector('.gem'); if (g) g.classList.add('selected'); }
        Audio.play('click');
    }

    deselectCell() {
        if (this.selectedCell) {
            const { x, y } = this.selectedCell;
            const cell = this.getCell(x, y);
            if (cell) { cell.classList.remove('selected'); const g = cell.querySelector('.gem'); if (g) g.classList.remove('selected'); }
        }
        this.selectedCell = null;
    }

    isAdjacent(x1, y1, x2, y2) { return (Math.abs(x1-x2)===1 && y1===y2) || (Math.abs(y1-y2)===1 && x1===x2); }
    isValidCell(x, y) { return x>=0 && x<this.width && y>=0 && y<this.height; }

    // ==========================================
    // Swap & Match
    // ==========================================

    async trySwap(x1, y1, x2, y2) {
        this.deselectCell();
        this.isProcessing = true;
        this.resetHintTimer();
        // Safety valve: auto-unlock after 8s (never leave game stuck)
        clearTimeout(this._processingTimeout);
        this._processingTimeout = setTimeout(() => {
            if (this.isProcessing) {
                console.warn('[trySwap] Safety valve: forced isProcessing=false');
                this.isProcessing = false;
                this.render();
                this.updateUI();
            }
        }, 8000);

        try {
            await this.animateSwap(x1, y1, x2, y2);
            this.swap(x1, y1, x2, y2);

            const matches = this.findMatches();
            if (matches.length > 0 || this.hasSpecialSwap(x1, y1, x2, y2)) {
                if (!this.level.timed) this.movesLeft--;
                Audio.play('swap'); Utils.vibrate(30);

                // ── Hardcore: onMove hook ──
                try { if (typeof HardcoreMode !== 'undefined') HardcoreMode.onMove(this); } catch(e) {}

                if (this.hasSpecialSwap(x1, y1, x2, y2)) await this.processSpecialSwap(x1, y1, x2, y2);
                await this.processMatches();

                // v10: Tutorial trigger after first match in level 1
                try { if (this.level && this.level.id === 1) Tutorial.onFirstMatch(); } catch(e) {}

                if (this.isBossLevel && Boss.currentBoss && Boss.bossHP > 0) {
                    const attacks = Boss.counterattack(this);
                    if (attacks.length > 0) await this.showBossAttack(attacks);
                }
                // Vine spreading mechanic (levels 61+): frozen cells spread
                this.spreadVines();
            } else {
                Audio.play('invalid'); Utils.vibrate([50,50,50]);
                const c1 = this.getCell(x1,y1), c2 = this.getCell(x2,y2);
                if(c1) c1.classList.add('invalid'); if(c2) c2.classList.add('invalid');
                await Utils.wait(200);
                if(c1) c1.classList.remove('invalid'); if(c2) c2.classList.remove('invalid');
                await this.animateSwap(x1, y1, x2, y2);
                this.swap(x1, y1, x2, y2);
            }
        } catch (e) {
            console.error('[trySwap] error:', e);
        } finally {
            // ALWAYS unlock — never leave isProcessing stuck
            clearTimeout(this._processingTimeout);
            this.isProcessing = false;
            this.updateUI();
            this.checkGameOver();
        }
    }

    swap(x1, y1, x2, y2) {
        const tmp = this.board[y1][x1];
        this.board[y1][x1] = this.board[y2][x2];
        this.board[y2][x2] = tmp;
        if (this.board[y1][x1]) { this.board[y1][x1].x = x1; this.board[y1][x1].y = y1; }
        if (this.board[y2][x2]) { this.board[y2][x2].x = x2; this.board[y2][x2].y = y2; }
        this.updateCell(x1, y1); this.updateCell(x2, y2);
    }

    // Data-only swap — no DOM updates. Used by hasValidMoves/findValidMove for perf.
    swapData(x1, y1, x2, y2) {
        const tmp = this.board[y1][x1];
        this.board[y1][x1] = this.board[y2][x2];
        this.board[y2][x2] = tmp;
        if (this.board[y1][x1]) { this.board[y1][x1].x = x1; this.board[y1][x1].y = y1; }
        if (this.board[y2][x2]) { this.board[y2][x2].x = x2; this.board[y2][x2].y = y2; }
    }

    async animateSwap(x1, y1, x2, y2) {
        const g1 = this.getGemElement(x1,y1), g2 = this.getGemElement(x2,y2);
        if (!g1 || !g2) return;
        const px = this._cellPx || 42;
        const gap = 2; // --board-gap
        const dx = (x2-x1)*(px+gap), dy = (y2-y1)*(px+gap);
        g1.style.transition = g2.style.transition = 'transform 0.12s ease-out';
        g1.style.transform = `translate(${dx}px, ${dy}px)`; g2.style.transform = `translate(${-dx}px, ${-dy}px)`;
        await Utils.wait(130);
        g1.style.transition = g2.style.transition = ''; g1.style.transform = g2.style.transform = '';
    }

    hasSpecialSwap(x1, y1, x2, y2) {
        const g1 = this.board[y1][x1], g2 = this.board[y2][x2];
        const s1 = g1 ? g1.special : 'none', s2 = g2 ? g2.special : 'none';
        return s1 !== 'none' || s2 !== 'none';
    }

    async processSpecialSwap(x1, y1, x2, y2) {
        const g1 = this.board[y1][x1], g2 = this.board[y2][x2];
        if (!g1 || !g2) return;
        const s1 = g1.special || 'none', s2 = g2.special || 'none';
        // If neither is special, skip
        if (s1 === 'none' && s2 === 'none') return;
        // Only one is special? Normal match handles it via activateSpecial
        if (s1 === 'none' || s2 === 'none') return;

        // ── BOTH are special: COMBO EFFECTS (CC's core addiction) ──
        const ST = this.SPECIAL_TYPES;
        const isLine = s => s === ST.HORIZONTAL || s === ST.VERTICAL;
        const cx = Math.floor((x1+x2)/2), cy = Math.floor((y1+y2)/2);
        Audio.play('match5');
        this.screenShake(10, 400);
        Utils.vibrate([50, 30, 80, 30, 100]);

        // ◇+◇ = clear entire board
        if (s1 === ST.RAINBOW && s2 === ST.RAINBOW) {
            Particles.explosion(window.innerWidth/2, window.innerHeight/2, '#ffd700');
            await this.clearAllGems();
            this.addScore(5000);
        }
        // ◇+any special = all gems of that type become that special, then detonate
        else if (s1 === ST.RAINBOW || s2 === ST.RAINBOW) {
            const other = s1 === ST.RAINBOW ? g2 : g1;
            const otherSpecial = s1 === ST.RAINBOW ? s2 : s1;
            Audio.play('special');
            // Turn all gems of target type into specials then detonate
            const targetType = other.type;
            for (let y = 0; y < this.height; y++)
                for (let x = 0; x < this.width; x++)
                    if (this.board[y][x] && this.board[y][x].type === targetType)
                        this.board[y][x].special = otherSpecial;
            this.render(); await Utils.wait(300);
            // Detonate all
            for (let y = 0; y < this.height; y++)
                for (let x = 0; x < this.width; x++)
                    if (this.board[y][x] && this.board[y][x].special === otherSpecial)
                        await this.activateSpecial(x, y, otherSpecial);
            this.addScore(3000);
        }
        // ✸+✸ = 5x5 mega explosion
        else if (s1 === ST.BOMB && s2 === ST.BOMB) {
            Particles.explosion(window.innerWidth/2, window.innerHeight/2, '#ef4444');
            for (let dy=-2; dy<=2; dy++) for (let dx=-2; dx<=2; dx++) {
                const nx=cx+dx, ny=cy+dy;
                if (this.isValidCell(nx,ny) && this.board[ny][nx]) {
                    this.updateObjective(this.board[ny][nx].type); this.board[ny][nx]=null; this.addScore(50);
                    if (this.cellStates[ny]?.[nx]) { this.cellStates[ny][nx].frozen=false; this.cellStates[ny][nx].locked=0; }
                }
            }
            this.addScore(2000);
        }
        // Line+Line = cross (full row + full column)
        else if (isLine(s1) && isLine(s2)) {
            for (let i = 0; i < this.width; i++)
                if (this.board[cy][i]) { this.updateObjective(this.board[cy][i].type); this.board[cy][i]=null; this.addScore(50); }
            for (let i = 0; i < this.height; i++)
                if (this.board[i][cx]) { this.updateObjective(this.board[i][cx].type); this.board[i][cx]=null; this.addScore(50); }
            this.addScore(1500);
        }
        // ✸+Line = clear 3 rows or 3 columns
        else if ((s1 === ST.BOMB && isLine(s2)) || (s2 === ST.BOMB && isLine(s1))) {
            const lineType = isLine(s1) ? s1 : s2;
            if (lineType === ST.HORIZONTAL) {
                for (let row = Math.max(0,cy-1); row <= Math.min(this.height-1,cy+1); row++)
                    for (let i = 0; i < this.width; i++)
                        if (this.board[row][i]) { this.updateObjective(this.board[row][i].type); this.board[row][i]=null; this.addScore(50); }
            } else {
                for (let col = Math.max(0,cx-1); col <= Math.min(this.width-1,cx+1); col++)
                    for (let i = 0; i < this.height; i++)
                        if (this.board[i][col]) { this.updateObjective(this.board[i][col].type); this.board[i][col]=null; this.addScore(50); }
            }
            this.addScore(2000);
        }

        // Clear the two swapped gems
        this.board[y1][x1] = null; this.board[y2][x2] = null;
        this.render(); await Utils.wait(300);
        // CRITICAL: refill board after special swap clears cells
        await this.dropGems();
        await this.fillGems();
        this.render();
        Collection.checkUnlock('special_combo');
    }

    async clearAllGems() {
        for (let y = 0; y < this.height; y++)
            for (let x = 0; x < this.width; x++)
                if (this.board[y][x]) {
                    this.addScore(50); this.updateObjective(this.board[y][x].type);
                    this.board[y][x] = null;
                    const c = this.getCell(x,y);
                    if(c) Particles.burst(c.getBoundingClientRect().left+c.offsetWidth/2, c.getBoundingClientRect().top+c.offsetHeight/2, '#ffd700');
                }
        this.render(); await Utils.wait(300);
    }

    async clearGemType(type) {
        const cells = [];
        for (let y = 0; y < this.height; y++)
            for (let x = 0; x < this.width; x++) {
                const g = this.board[y][x];
                if (g && g.type === type) cells.push({x,y,gem:g});
            }
        for (const {x,y,gem} of cells) {
            this.addScore(100); this.updateObjective(gem.type);
            this.board[y][x] = null;
            // Clear cell state too
            if (this.cellStates[y][x]) { this.cellStates[y][x].frozen = false; this.cellStates[y][x].locked = 0; }
            const c = this.getCell(x,y);
            const gd = GEM_TYPES[gem.type];
            if(c) Particles.burst(c.getBoundingClientRect().left+c.offsetWidth/2, c.getBoundingClientRect().top+c.offsetHeight/2, gd?gd.color:'#fff');
            await Utils.wait(30);
        }
        this.render();
    }

    // ==========================================
    // Match Finding
    // ==========================================

    findMatches() {
        const matches = [];
        // Horizontal — each run is one complete match
        for (let y = 0; y < this.height; y++) {
            let x = 0;
            while (x < this.width) {
                const gem = this.board[y][x];
                if (!gem) { x++; continue; }
                let count = 1;
                while (x+count < this.width && this.board[y][x+count] && this.board[y][x+count].type === gem.type) count++;
                if (count >= 3) {
                    const cells = [];
                    for (let i = 0; i < count; i++) cells.push({x:x+i, y, gem:this.board[y][x+i]});
                    matches.push({cells, type:gem.type, direction:'horizontal'});
                }
                x += count;
            }
        }
        // Vertical — each run is one complete match
        for (let x = 0; x < this.width; x++) {
            let y = 0;
            while (y < this.height) {
                const gem = this.board[y][x];
                if (!gem) { y++; continue; }
                let count = 1;
                while (y+count < this.height && this.board[y+count][x] && this.board[y+count][x].type === gem.type) count++;
                if (count >= 3) {
                    const cells = [];
                    for (let i = 0; i < count; i++) cells.push({x, y:y+i, gem:this.board[y+i][x]});
                    matches.push({cells, type:gem.type, direction:'vertical'});
                }
                y += count;
            }
        }
        return this.mergeMatches(matches);
    }

    mergeMatches(matches) {
        const byType = {};
        for (const m of matches) { (byType[m.type] = byType[m.type] || []).push(m); }
        const result = [];
        for (const type in byType) {
            const tm = byType[type];
            if (tm.length === 1) { result.push(tm[0]); continue; }
            const allCells = new Map();
            for (const m of tm) for (const c of m.cells) allCells.set(`${c.x},${c.y}`, c);
            let hasX = false;
            outer: for (const m1 of tm) for (const m2 of tm) {
                if (m1===m2) continue;
                for (const c1 of m1.cells) for (const c2 of m2.cells) if (c1.x===c2.x && c1.y===c2.y) { hasX=true; break outer; }
            }
            if (hasX) result.push({cells:Array.from(allCells.values()), type, direction:'cross'});
            else result.push(...tm);
        }
        return result;
    }

    // ==========================================
    // Match Processing
    // ==========================================

    async processMatches() {
        let hasMatches = true;
        this.combo = 0;
        this.chainDepth = 0;
        let cascadeDepth = 0;
        const MAX_CASCADE = 50; // safety valve: no infinite loops

        while (hasMatches && cascadeDepth < MAX_CASCADE) {
            cascadeDepth++;
            this.chainDepth = cascadeDepth;
            const matches = this.findMatches();
            if (matches.length === 0) { hasMatches = false; break; }

            this.combo++;
            if (this.combo > this.maxCombo) { this.maxCombo = this.combo; Storage.updateMaxCombo(this.maxCombo); }

            // ── Hardcore: onCombo hook ──
            try { if (typeof HardcoreMode !== 'undefined') HardcoreMode.onCombo(this.combo, this); } catch(e) {}

            // Update combo objectives: track max combo depth reached this level
            this.objectives.forEach((obj, i) => {
                if (obj.type === OBJECTIVE_TYPES.COMBO) {
                    this.objectiveProgress[i] = Math.max(this.objectiveProgress[i], this.combo);
                }
            });

            // ── Chain Bonus (Ch7+): show floating chain multiplier on cascades ──
            if (this.chainBonusActive && cascadeDepth >= 2) {
                const boardEl = document.getElementById('game-board');
                if (boardEl) {
                    const r = boardEl.getBoundingClientRect();
                    const chainText = `≡ Chain x${cascadeDepth}!`;
                    Particles.floatingText(
                        r.left + r.width / 2,
                        r.top + r.height * 0.3 - (cascadeDepth * 10),
                        chainText, '#22d3ee'
                    );
                }
                // Extra vibration for chain
                Utils.vibrate([30, 15, 40 + cascadeDepth * 10]);
            }

            if (this.combo > 1) {
                this.showCombo();
                Audio.playComboNote(this.combo);
                // ☆ Escalating vibration pattern
                const vib = this.combo >= 6 ? [50,30,80,30,120,30,150] : this.combo >= 4 ? [40,20,60,20,80] : [30,15,50];
                Utils.vibrate(vib);
                // ☆ 3D Board shake on combos
                try {
                  const boardEl = document.getElementById('game-board');
                  if (boardEl) {
                    boardEl.classList.remove('shake', 'shake-heavy');
                    void boardEl.offsetWidth; // force reflow
                    boardEl.classList.add(this.combo >= 5 ? 'shake-heavy' : 'shake');
                    setTimeout(() => boardEl.classList.remove('shake', 'shake-heavy'), 500);
                  }
                } catch(e) {}
                // [限时] Slow-motion on big combos: cascade wait gets shorter = feels faster & more intense
                if (this.combo >= 5) this._cascadeSpeed = 60;
                else if (this.combo >= 3) this._cascadeSpeed = 90;
                else this._cascadeSpeed = 120;
            } else { this._cascadeSpeed = 120; }

            // ── Apply "matching" visual to all matched gems THEN process ──
            for (const match of matches) {
                for (const cell of match.cells) {
                    const gemEl = this.getGemElement(cell.x, cell.y);
                    if (gemEl) gemEl.classList.add('matching');
                }
            }
            await Utils.wait(this._cascadeSpeed || 120);

            for (const match of matches) await this.processMatch(match);
            Achievements.check('combo', this.combo);

            // Tight cascade: drop+fill in quick sequence
            await this.dropGems();
            await this.fillGems();
            this.updateUI();
        }

        // ── Hardcore: onMatchesComplete hook ──
        try { if (typeof HardcoreMode !== 'undefined') HardcoreMode.onMatchesComplete(this); } catch(e) {}

        this.combo = 0;
        if (!this.hasValidMoves()) await this.shuffleBoard();
    }

    async processMatch(match) {
        const count = match.cells.length;
        let specialType = this.SPECIAL_TYPES.NONE;
        let specialPosition = null;

        // Determine special gem - with rainbow_4 buff check
        const hasRainbow4 = Estate.hasBuff('rainbow_4');
        if (count === 4) {
            if (match.direction === 'cross') {
                // 4-cell cross (T/L shape) → BOMB (easier to make!)
                specialType = this.SPECIAL_TYPES.BOMB;
                specialPosition = match.cells[Math.floor(match.cells.length/2)];
                Collection.checkUnlock('special_create', {specialType:'bomb'});
            } else if (hasRainbow4) {
                // ◇ 彩虹树 buff: 4 in a row → RAINBOW instead of line!
                specialType = this.SPECIAL_TYPES.RAINBOW;
                specialPosition = match.cells[1];
                Collection.checkUnlock('special_create', {specialType:'rainbow'});
                // Rainbow burst visual!
                setTimeout(() => {
                    const cell = document.querySelector(`.cell[data-x="${specialPosition.x}"][data-y="${specialPosition.y}"]`);
                    if (cell) {
                        const burst = document.createElement('div');
                        burst.className = 'rainbow-burst';
                        cell.appendChild(burst);
                        setTimeout(() => burst.remove(), 900);
                    }
                    this.showBuffFlash('rgba(236,72,153,0.2)');
                }, 100);
            } else {
                // 4 in a row → line gem
                specialType = match.direction === 'horizontal' ? this.SPECIAL_TYPES.VERTICAL : this.SPECIAL_TYPES.HORIZONTAL;
                specialPosition = match.cells[1];
                Collection.checkUnlock('special_create', {specialType: match.direction === 'horizontal' ? 'vertical' : 'horizontal'});
            }
        } else if (count >= 5) {
            if (match.direction === 'cross') {
                specialType = this.SPECIAL_TYPES.BOMB;
                specialPosition = match.cells[Math.floor(match.cells.length/2)];
                Collection.checkUnlock('special_create', {specialType:'bomb'});
            } else {
                specialType = this.SPECIAL_TYPES.RAINBOW;
                specialPosition = match.cells[2];
                Collection.checkUnlock('special_create', {specialType:'rainbow'});
                Achievements.check('rainbow');
            }
        }

        // Score — skulls are worth 0 points
        let score = 0;
        const hasSkull = match.cells.some(c => c.gem.type === 'skull');
        if (hasSkull) {
            // Skull matches: minimal points (just clear them)
            score = 10;
        } else {
            switch(count) { case 3: score=this.SCORES.MATCH_3; break; case 4: score=this.SCORES.MATCH_4; break; case 5: score=this.SCORES.MATCH_5; break; default: score=this.SCORES.MATCH_6; }
            score += this.SCORES.COMBO_BONUS * (this.combo - 1);
            // ☆ Combo multiplier: x1.5 at combo 3, x2 at 5, x3 at 7+
            let comboMultiplier = this.combo >= 7 ? 3 : this.combo >= 5 ? 2 : this.combo >= 3 ? 1.5 : 1;
            // Hardcore combo theory: exponential chain multiplier overlays
            try {
                if (typeof HardcoreMode !== 'undefined') {
                    const hardcoreMult = HardcoreMode.getComboMultiplier(this.combo);
                    if (hardcoreMult > comboMultiplier) comboMultiplier = hardcoreMult;
                }
            } catch(e) {}
            score = Math.floor(score * comboMultiplier);

            // ≡ Chain Bonus (Ch7+): multiply by cascade depth on cascades
            if (this.chainBonusActive && this.chainDepth >= 2) {
                score = Math.floor(score * this.chainDepth);
            }

            // ↯ Spirit Trial: 2x points for preferred gem type
            try {
                if (Estate.isInSpiritTrial()) {
                    const preferredGem = Estate.getTrialPreferredGem();
                    if (preferredGem && match.type === preferredGem) {
                        score *= 2;
                    }
                }
                // Spirit affection gem score bonus (from trial abilities)
                const gemBonus = Estate.getTrialGemScoreBonus(match.type);
                if (gemBonus > 0) score += gemBonus * count;
            } catch(e) {}
        }
        this.addScore(score);

        // ── Hardcore: onMatchProcessed hook (shape detection, etc.) ──
        try { if (typeof HardcoreMode !== 'undefined') HardcoreMode.onMatchProcessed(match, this); } catch(e) {}

        // Charge skill bar — with visual feedback
        let chargeAmount = count >= 5 ? 25 : count >= 4 ? 15 : 8;
        // Skill boost from Ancient Tree
        const skillBoost = Estate.getSkillBoostPercent();
        if (skillBoost > 0) chargeAmount = Math.ceil(chargeAmount * (1 + skillBoost / 100));
        // Trial charge boost from spirit affection abilities
        try {
            const trialCharge = Estate.getTrialChargeBoost();
            if (trialCharge > 0) chargeAmount = Math.ceil(chargeAmount * (1 + trialCharge / 100));
        } catch(e) {}
        const prevCharge = this.skillCharge;
        this.skillCharge = Math.min(this.skillMax, this.skillCharge + chargeAmount);
        this.updateSkillBarUI();
        // Notify when skill becomes ready
        if (prevCharge < this.skillMax && this.skillCharge >= this.skillMax) {
            UI.showToast('↯ 精灵大招已充满！点击释放！', 'success');
            Utils.vibrate([30, 20, 50, 20, 80]);
        }

        // Sound
        if (count >= 5) Audio.play('match5');
        else if (count >= 4) Audio.play('match4');
        else Audio.play('match3');

        // Process each cell in match
        for (const cell of match.cells) {
            const { x, y, gem } = cell;
            this.updateObjective(gem.type);
            Collection.checkUnlock('gem_match', {gemType: gem.type});
            Achievements.check('collect', 1, {gem: gem.type});

            // Defrost adjacent frozen cells (no particle per cell — too expensive)
            [{x:x-1,y},{x:x+1,y},{x,y:y-1},{x,y:y+1}].forEach(n => {
                if (this.isValidCell(n.x, n.y) && this.cellStates[n.y][n.x].frozen) {
                    this.cellStates[n.y][n.x].frozen = false;
                    const nc = this.getCell(n.x, n.y);
                    if (nc) nc.classList.remove('frozen');
                }
            });

            // Handle locked cells
            if (this.cellStates[y][x].locked > 0) {
                this.cellStates[y][x].locked--;
                const lc = this.getCell(x, y);
                if (lc) { lc.dataset.lockLevel = this.cellStates[y][x].locked; if (this.cellStates[y][x].locked === 0) lc.classList.remove('locked-cell'); }
                if (this.cellStates[y][x].locked > 0) continue; // Don't clear yet
            }

            // Activate special
            if (gem.special !== this.SPECIAL_TYPES.NONE) await this.activateSpecial(x, y, gem.special);

            // Skip if this is special position
            if (specialPosition && x === specialPosition.x && y === specialPosition.y) continue;

            // Clear
            this.board[y][x] = null;
            if (this.cellStates[y][x]) { this.cellStates[y][x].frozen = false; this.cellStates[y][x].locked = 0; }

            // Enhanced clear: flash + shockwave ring
            const cellEl = this.getCell(x, y);
            if (cellEl) {
                cellEl.style.animation = 'cell-flash 0.2s ease';
                // Spawn a shockwave ring on the cell
                const ring = document.createElement('div');
                ring.className = 'match-ring';
                cellEl.appendChild(ring);
                setTimeout(() => ring.remove(), 400);
            }
        }

        // ≋ Fog mechanic (Ch8+): reveal fog adjacent to matched cells
        if (this.fogCells.length > 0) {
            this.revealFogAdjacent(match.cells);
        }

        // Create special gem
        if (specialType !== this.SPECIAL_TYPES.NONE && specialPosition) {
            const {x,y} = specialPosition;
            this.board[y][x] = { type: match.type, special: specialType, x, y, id: Utils.generateId() };
            Audio.play('special');
            Storage.data.statistics.specialGemsCreated++;
            Achievements.check('special');
            if (typeof Stats !== 'undefined') Stats.recordSpecialCreated(specialType);
            this.updateObjective('special', specialType);
        }

        this.render();
        // Gem shatter particles for the match (colored fragments)
        if (match.cells.length > 0) {
            const boardEl = document.getElementById('game-board');
            if (boardEl) {
                const r = boardEl.getBoundingClientRect();
                const mid = match.cells[Math.floor(match.cells.length/2)];
                const cellPx = this._cellPx || 42, gap = 2;
                const cx = r.left + mid.x * (cellPx+gap) + cellPx/2;
                const cy = r.top + mid.y * (cellPx+gap) + cellPx/2;
                const gd = GEM_TYPES[match.cells[0].gem.type];
                // Use shatter for gem fragments + burst for sparkle
                Particles.shatter(cx, cy, gd?gd.color:'#fff', Math.min(count+2, 8));
                if (count >= 4) Particles.burst(cx, cy, gd?gd.color:'#fff', 4);
            }
        }
        Storage.addMatch();
        Achievements.check('match');
        // Record gem and combo stats
        if (typeof Stats !== 'undefined') {
            Stats.recordGemMatch(match.type, match.cells.length);
            if (this.combo > 1) Stats.recordCombo(this.combo);
        }
    }

    // ==========================================
    // Special Gem Activation
    // ==========================================

    async activateSpecial(x, y, specialType) {
        const cell = this.getCell(x, y);
        const rect = cell ? cell.getBoundingClientRect() : {left:0,top:0,width:0,height:0};
        Audio.play('explosion');
        this.addScore(this.SCORES.SPECIAL_ACTIVATE);

        switch (specialType) {
            case this.SPECIAL_TYPES.HORIZONTAL: {
                Particles.lineHorizontal(rect.top+rect.height/2, 0, window.innerWidth, '#3b82f6');
                // Laser line VFX
                const boardEl_h = document.getElementById('game-board');
                if (boardEl_h) {
                    const laser = document.createElement('div');
                    laser.className = 'line-blast-h';
                    laser.style.top = rect.top - boardEl_h.getBoundingClientRect().top + rect.height/2 - 2 + 'px';
                    boardEl_h.appendChild(laser);
                    setTimeout(() => laser.remove(), 500);
                }
                this.screenShake(8, 250);
                for (let i = 0; i < this.width; i++) {
                    if (this.board[y][i]) { this.updateObjective(this.board[y][i].type); this.board[y][i] = null; this.addScore(50); }
                    if (this.cellStates[y][i]) { this.cellStates[y][i].frozen = false; this.cellStates[y][i].locked = 0; }
                }
                break;
            }
            case this.SPECIAL_TYPES.VERTICAL: {
                Particles.lineVertical(rect.left+rect.width/2, 0, window.innerHeight, '#3b82f6');
                // Laser line VFX
                const boardEl_v = document.getElementById('game-board');
                if (boardEl_v) {
                    const laser = document.createElement('div');
                    laser.className = 'line-blast-v';
                    laser.style.left = rect.left - boardEl_v.getBoundingClientRect().left + rect.width/2 - 2 + 'px';
                    boardEl_v.appendChild(laser);
                    setTimeout(() => laser.remove(), 500);
                }
                this.screenShake(8, 250);
                for (let i = 0; i < this.height; i++) {
                    if (this.board[i][x]) { this.updateObjective(this.board[i][x].type); this.board[i][x] = null; this.addScore(50); }
                    if (this.cellStates[i][x]) { this.cellStates[i][x].frozen = false; this.cellStates[i][x].locked = 0; }
                }
                break;
            }
            case this.SPECIAL_TYPES.BOMB: {
                Particles.explosion(rect.left+rect.width/2, rect.top+rect.height/2, '#ef4444');
                // Bomb ripple VFX
                if (cell) {
                    const ripple = document.createElement('div');
                    ripple.className = 'bomb-ripple';
                    cell.appendChild(ripple);
                    setTimeout(() => ripple.remove(), 600);
                }
                this.screenShake(12, 350);
                for (let dy=-1; dy<=1; dy++) for (let dx=-1; dx<=1; dx++) {
                    const nx=x+dx, ny=y+dy;
                    if (this.isValidCell(nx,ny)) {
                        if (this.board[ny][nx]) { this.updateObjective(this.board[ny][nx].type); this.board[ny][nx]=null; this.addScore(50); }
                        if (this.cellStates[ny][nx]) { this.cellStates[ny][nx].frozen = false; this.cellStates[ny][nx].locked = 0; }
                    }
                }
                break;
            }
            case this.SPECIAL_TYPES.RAINBOW: {
                // Rainbow in a regular match: clear all gems of the same type as the match
                const gem = this.board[y] && this.board[y][x];
                const matchType = gem ? gem.type : null;
                if (matchType) {
                    Particles.explosion(rect.left+rect.width/2, rect.top+rect.height/2, '#ffd700');
                    Particles.rainbow(rect.left+rect.width/2, rect.top+rect.height/2);
                    // Rainbow full screen flash
                    const rainbowFlash = document.createElement('div');
                    rainbowFlash.className = 'combo-screen-flash';
                    rainbowFlash.style.background = 'linear-gradient(135deg, #ef4444, #f97316, #fbbf24, #22c55e, #3b82f6, #8b5cf6)';
                    document.body.appendChild(rainbowFlash);
                    setTimeout(() => rainbowFlash.remove(), 500);
                    this.screenShake(10, 300);
                    await this.clearGemType(matchType);
                } else {
                    // Fallback: clear a random gem type on the board
                    const types = {};
                    for (let by=0;by<this.height;by++) for (let bx=0;bx<this.width;bx++) {
                        const g = this.board[by][bx];
                        if (g && g.type !== 'skull') types[g.type] = (types[g.type]||0)+1;
                    }
                    let best = null, bestC = 0;
                    for (const t in types) if (types[t]>bestC) { best=t; bestC=types[t]; }
                    if (best) {
                        Particles.explosion(rect.left+rect.width/2, rect.top+rect.height/2, '#ffd700');
                        await this.clearGemType(best);
                    }
                }
                break;
            }
        }
        await Utils.wait(200);
        this.render();
    }

    // ==========================================
    // Boss Attack Visualization
    // ==========================================

    async showBossAttack(attacks) {
        const bossUI = document.getElementById('boss-bar');
        if (bossUI) bossUI.classList.add('boss-attacking');

        // Screen flash red
        const flash = document.createElement('div');
        flash.style.cssText = 'position:fixed;inset:0;background:rgba(239,68,68,0.3);z-index:800;pointer-events:none;transition:opacity 0.4s;';
        document.body.appendChild(flash);
        setTimeout(() => { flash.style.opacity = '0'; }, 100);
        setTimeout(() => flash.remove(), 500);

        Audio.play('explosion');
        this.screenShake(6, 300);
        UI.showToast('▲ Boss 反击！', 'error');
        await Utils.wait(300);

        // Apply attacks — support all 5 types
        const attackMsgs = [];
        for (const atk of attacks) {
            switch (atk.type) {
                case 'ice':
                    if (this.cellStates[atk.y]?.[atk.x]) this.cellStates[atk.y][atk.x].frozen = true;
                    break;
                case 'lock':
                    if (this.cellStates[atk.y]?.[atk.x]) this.cellStates[atk.y][atk.x].locked = 2;
                    break;
                case 'shuffle':
                    if (!attackMsgs.includes('shuffle')) attackMsgs.push('shuffle');
                    break;
                case 'transform':
                    if (!attackMsgs.includes('transform')) attackMsgs.push('transform');
                    break;
                case 'steal':
                    if (!attackMsgs.includes('steal')) attackMsgs.push('steal');
                    break;
            }
        }
        // Show attack-specific messages
        if (attackMsgs.includes('shuffle')) UI.showToast('◎ 棋盘被打乱了！', 'error');
        if (attackMsgs.includes('transform')) UI.showToast('◇ 宝石被变色了！', 'error');
        if (attackMsgs.includes('steal')) {
            const stolen = attacks.find(a => a.type === 'steal');
            UI.showToast(`⏳ 被偷走${stolen?.value || 1}步！`, 'error');
        }

        this.render();
        await Utils.wait(200);
        if (bossUI) bossUI.classList.remove('boss-attacking');
    }

    // ==========================================
    // Skill Bar (Awakening System P0-2)
    // ==========================================

    updateSkillBarUI() {
        const fill = document.getElementById('skill-bar-fill');
        const btn = document.getElementById('skill-activate-btn');
        if (fill) fill.style.width = `${(this.skillCharge / this.skillMax) * 100}%`;
        if (btn) {
            btn.classList.toggle('ready', this.skillCharge >= this.skillMax);
            btn.disabled = this.skillCharge < this.skillMax;
        }
    }

    async activateSkill() {
        if (this.skillCharge < this.skillMax || this.isProcessing || this.isPaused || this.isGameOver) return;
        this.skillCharge = 0;
        this.isProcessing = true;

        try {
        const spirit = Estate.getCurrentSpirit();
        Audio.play('special');

        // ── EPIC skill activation sequence ──
        // 1. Full-screen flash
        const flash = document.createElement('div');
        flash.style.cssText = 'position:fixed;inset:0;background:rgba(255,215,0,0.4);z-index:800;pointer-events:none;animation:cell-flash 0.5s ease forwards;';
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 600);

        // 2. Big centered skill name
        const skillDisplay = document.createElement('div');
        skillDisplay.style.cssText = 'position:fixed;top:40%;left:50%;transform:translate(-50%,-50%);z-index:801;pointer-events:none;font-size:2rem;font-weight:900;color:#ffd700;text-shadow:0 0 30px #ffd700,0 0 60px #ff8800;animation:combo-pop 1.2s cubic-bezier(0.175,0.885,0.32,1.275) forwards;text-align:center;';
        skillDisplay.innerHTML = `${spirit.emoji}<br>${spirit.skillName}`;
        document.body.appendChild(skillDisplay);
        setTimeout(() => skillDisplay.remove(), 1200);

        // 3. Vibrate
        Utils.vibrate([50, 30, 80]);

        // 4. Particles
        Particles.magicRing(window.innerWidth/2, window.innerHeight/2, '#ffd700');
        await Utils.wait(600); // dramatic pause before effect

        switch (spirit.id) {
            case 'mango_fairy':
                // 芒果轰炸：随机清除15个宝石 + 震屏（真正有冲击感）
                const bombTargets = [];
                for (let i = 0; i < 15; i++) {
                    let attempts = 0;
                    while (attempts < 50) {
                        const bx = Utils.randomInt(0, this.width-1), by = Utils.randomInt(0, this.height-1);
                        if (this.board[by][bx] && !bombTargets.some(t => t.x===bx && t.y===by)) {
                            bombTargets.push({x:bx, y:by});
                            break;
                        }
                        attempts++;
                    }
                }
                // Stagger explosions for drama
                for (let i = 0; i < bombTargets.length; i++) {
                    const {x, y} = bombTargets[i];
                    if (!this.board[y][x]) continue;
                    this.addScore(50);
                    this.updateObjective(this.board[y][x].type);
                    this.board[y][x] = null;
                    const c = this.getCell(x, y);
                    if (c) c.style.animation = 'cell-flash 0.15s ease';
                    if (i % 3 === 0) {
                        Audio.play('match3');
                        this.screenShake(4, 150);
                    }
                    await Utils.wait(40); // rapid-fire explosions
                }
                // Big final shake
                this.screenShake(8, 300);
                Audio.play('match5');
                // Single big burst at center
                const boardEl2 = document.getElementById('game-board');
                if (boardEl2) {
                    const r = boardEl2.getBoundingClientRect();
                    Particles.explosion(r.left+r.width/2, r.top+r.height/2, '#ffd700');
                }
                break;
            case 'bee_spirit': {
                // 蜜蜂横扫：清一行 + 一列（十字交叉，超爽）
                const row = Utils.randomInt(0, this.height-1);
                const col = Utils.randomInt(0, this.width-1);
                // Sweep row
                for (let x = 0; x < this.width; x++) {
                    const c = this.getCell(x, row);
                    if (c) c.style.animation = 'cell-flash 0.15s ease';
                    if (this.board[row][x]) { this.addScore(50); this.updateObjective(this.board[row][x].type); this.board[row][x] = null; }
                    if (this.cellStates[row][x]) { this.cellStates[row][x].frozen = false; this.cellStates[row][x].locked = 0; }
                }
                Audio.play('match4');
                this.screenShake(4, 150);
                await Utils.wait(100);
                // Sweep column
                for (let y = 0; y < this.height; y++) {
                    const c = this.getCell(col, y);
                    if (c) c.style.animation = 'cell-flash 0.15s ease';
                    if (this.board[y][col]) { this.addScore(50); this.updateObjective(this.board[y][col].type); this.board[y][col] = null; }
                    if (this.cellStates[y][col]) { this.cellStates[y][col].frozen = false; this.cellStates[y][col].locked = 0; }
                }
                Audio.play('match5');
                this.screenShake(8, 300);
            }
                break;
            case 'rainbow_spirit':
                // Find the most common gem type on board and clear all of it
                const typeCounts = {};
                for (let y=0;y<this.height;y++) for (let x=0;x<this.width;x++) {
                    const g = this.board[y][x];
                    if (g) typeCounts[g.type] = (typeCounts[g.type]||0)+1;
                }
                let maxType = null, maxCount = 0;
                for (const t in typeCounts) { if (typeCounts[t] > maxCount) { maxCount = typeCounts[t]; maxType = t; } }
                if (maxType) await this.clearGemType(maxType);
                break;

            case 'dragon_spirit': {
                // 龙息吐焰：清除2-3行（根据精灵等级）
                const dragonLv = Estate.getSpiritLevel('dragon_spirit');
                const rowCount = dragonLv >= 3 ? 3 : 2;
                const rows = new Set();
                while (rows.size < rowCount) rows.add(Utils.randomInt(0, this.height-1));
                for (const row of rows) {
                    for (let x = 0; x < this.width; x++) {
                        if (this.board[row][x]) { this.addScore(50); this.updateObjective(this.board[row][x].type); this.board[row][x] = null; }
                        if (this.cellStates[row]?.[x]) { this.cellStates[row][x].frozen = false; this.cellStates[row][x].locked = 0; }
                    }
                }
                // Lv3: also clear all frozen
                if (dragonLv >= 3) {
                    for (let y=0;y<this.height;y++) for (let x=0;x<this.width;x++)
                        if (this.cellStates[y]?.[x]?.frozen) this.cellStates[y][x].frozen = false;
                }
                Audio.play('match5'); this.screenShake(10, 400);
                break;
            }
            case 'phoenix_spirit': {
                // 涅槃烈焰：多次3x3爆炸
                const phoenixLv = Estate.getSpiritLevel('phoenix_spirit');
                const blasts = phoenixLv >= 3 ? 8 : phoenixLv >= 2 ? 5 : 3;
                for (let b = 0; b < blasts; b++) {
                    const cx = Utils.randomInt(1, this.width-2), cy = Utils.randomInt(1, this.height-2);
                    for (let dy=-1; dy<=1; dy++) for (let dx=-1; dx<=1; dx++) {
                        const nx=cx+dx, ny=cy+dy;
                        if (this.isValidCell(nx,ny) && this.board[ny][nx]) {
                            this.addScore(50); this.updateObjective(this.board[ny][nx].type); this.board[ny][nx]=null;
                        }
                    }
                    if (b % 2 === 0) { Audio.play('explosion'); this.screenShake(5, 150); }
                    await Utils.wait(60);
                }
                break;
            }
            case 'frost_spirit': {
                // 绝对零度：解除所有冰冻 + 清除N个
                const frostLv = Estate.getSpiritLevel('frost_spirit');
                const clearCount = frostLv >= 3 ? 15 : frostLv >= 2 ? 10 : 5;
                // Defrost all
                for (let y=0;y<this.height;y++) for (let x=0;x<this.width;x++)
                    if (this.cellStates[y]?.[x]?.frozen) this.cellStates[y][x].frozen = false;
                // Clear random gems
                let cleared = 0;
                while (cleared < clearCount) {
                    const rx = Utils.randomInt(0, this.width-1), ry = Utils.randomInt(0, this.height-1);
                    if (this.board[ry][rx]) { this.addScore(50); this.updateObjective(this.board[ry][rx].type); this.board[ry][rx]=null; cleared++; }
                    if (cleared > 50) break; // safety
                }
                Audio.play('match4');
                break;
            }
            case 'time_spirit': {
                // 时光倒流：+步数 + 随机特殊宝石
                const timeLv = Estate.getSpiritLevel('time_spirit');
                const extraMoves = timeLv >= 3 ? 8 : 5;
                const specials = timeLv >= 3 ? 5 : timeLv >= 2 ? 3 : 0;
                this.movesLeft += extraMoves;
                for (let i = 0; i < specials; i++) {
                    let at = 0;
                    while (at++ < 30) {
                        const rx = Utils.randomInt(0, this.width-1), ry = Utils.randomInt(0, this.height-1);
                        if (this.board[ry][rx] && this.board[ry][rx].special === this.SPECIAL_TYPES.NONE) {
                            const types = [this.SPECIAL_TYPES.HORIZONTAL, this.SPECIAL_TYPES.VERTICAL, this.SPECIAL_TYPES.BOMB];
                            this.board[ry][rx].special = types[Math.floor(Math.random()*types.length)];
                            break;
                        }
                    }
                }
                Audio.play('powerup');
                UI.showToast(`⏳ +${extraMoves}步！${specials > 0 ? `+${specials}个特殊宝石！` : ''}`, 'success');
                break;
            }
            case 'chaos_spirit': {
                // 混沌风暴：随机触发1-3个其他精灵技能
                const chaosLv = Estate.getSpiritLevel('chaos_spirit');
                const skillCount = Math.min(chaosLv, 3);
                const otherSpirits = ['mango_fairy','bee_spirit','rainbow_spirit','dragon_spirit','phoenix_spirit','frost_spirit','time_spirit'];
                for (let i = 0; i < skillCount; i++) {
                    const pick = otherSpirits[Math.floor(Math.random() * otherSpirits.length)];
                    const savedSpirit = Estate.getCurrentSpirit();
                    // Temporarily set spirit to trigger its skill
                    UI.showToast(`◎ 混沌召唤: ${Estate.SPIRITS[pick]?.name || pick}！`, 'success');
                    await Utils.wait(200);
                    // Execute inline (simplified: just call the key effects)
                    if (pick === 'mango_fairy') {
                        for (let j = 0; j < 8; j++) {
                            const rx = Utils.randomInt(0,this.width-1), ry = Utils.randomInt(0,this.height-1);
                            if (this.board[ry]?.[rx]) { this.addScore(50); this.board[ry][rx]=null; }
                        }
                    } else if (pick === 'bee_spirit') {
                        const row = Utils.randomInt(0,this.height-1);
                        for (let x=0;x<this.width;x++) if(this.board[row]?.[x]){this.addScore(50);this.board[row][x]=null;}
                    } else if (pick === 'frost_spirit') {
                        for(let y=0;y<this.height;y++) for(let x=0;x<this.width;x++) if(this.cellStates[y]?.[x]?.frozen) this.cellStates[y][x].frozen=false;
                    } else if (pick === 'time_spirit') {
                        this.movesLeft += 3;
                    } else {
                        // Generic: clear 5 random
                        for(let j=0;j<5;j++){const rx=Utils.randomInt(0,this.width-1),ry=Utils.randomInt(0,this.height-1);if(this.board[ry]?.[rx]){this.addScore(50);this.board[ry][rx]=null;}}
                    }
                    this.render(); await Utils.wait(150);
                }
                Audio.play('match5'); this.screenShake(8, 300);
                break;
            }
        }

        this.render();
        await Utils.wait(200);
        await this.dropGems();
        await this.fillGems();
        await this.processMatches();
        } catch (e) {
            console.error('[activateSkill] error:', e);
        } finally {
            this.isProcessing = false;
            this.updateSkillBarUI();
            this.updateUI();
            this.checkGameOver();
        }
    }

    // ==========================================
    // Gem Drop & Fill
    // ==========================================

    async dropGems() {
        let dropped = false;

        if (this.gravityShiftActive) {
            // ── Gravity Shift (Ch9+): gems fall LEFT instead of down ──
            // For each row, compact gems to the left, leaving empties on the right
            for (let y = 0; y < this.height; y++) {
                let emptyX = 0; // fill from left
                for (let x = 0; x < this.width; x++) {
                    if (this.board[y][x]) {
                        if (x !== emptyX) {
                            this.board[y][emptyX] = this.board[y][x];
                            this.board[y][emptyX].x = emptyX;
                            this.board[y][x] = null;
                            // Move cell states too
                            this.cellStates[y][emptyX] = this.cellStates[y][x];
                            this.cellStates[y][x] = { frozen: false, locked: 0 };
                            dropped = true;
                        }
                        emptyX++;
                    }
                }
            }
        } else {
            // ── Normal gravity: gems fall DOWN ──
            for (let x = 0; x < this.width; x++) {
                let emptyY = this.height - 1;
                for (let y = this.height - 1; y >= 0; y--) {
                    if (this.board[y][x]) {
                        if (y !== emptyY) {
                            this.board[emptyY][x] = this.board[y][x];
                            this.board[emptyY][x].y = emptyY;
                            this.board[y][x] = null;
                            // Move cell states too
                            this.cellStates[emptyY][x] = this.cellStates[y][x];
                            this.cellStates[y][x] = { frozen: false, locked: 0 };
                            dropped = true;
                        }
                        emptyY--;
                    }
                }
            }
        }

        if (dropped) {
            this.render();
            Audio.play('cascade');
            await Utils.wait(80);
        }
    }

    async fillGems() {
        let filled = false;
        let emptyCount = 0;

        if (this.gravityShiftActive) {
            // ── Gravity Shift (Ch9+): fill empty cells from the RIGHT side ──
            for (let y = 0; y < this.height; y++)
                for (let x = this.width - 1; x >= 0; x--)
                    if (!this.board[y][x]) {
                        this.board[y][x] = this.createGem(x, y);
                        this.cellStates[y][x] = { frozen: false, locked: 0 };
                        filled = true;
                        emptyCount++;
                    }
        } else {
            // ── Normal: fill from top ──
            for (let x = 0; x < this.width; x++)
                for (let y = 0; y < this.height; y++)
                    if (!this.board[y][x]) {
                        this.board[y][x] = this.createGem(x, y);
                        this.cellStates[y][x] = { frozen: false, locked: 0 };
                        filled = true;
                        emptyCount++;
                    }
        }

        if (filled) {
            this.render();
            await Utils.wait(emptyCount > 20 ? 120 : 60);
        }
        // Safety: if board STILL has nulls after fill, force another pass
        for (let y = 0; y < this.height; y++)
            for (let x = 0; x < this.width; x++)
                if (!this.board[y][x]) this.board[y][x] = this.createGem(x, y);
        if (emptyCount > 20) this.render(); // Re-render after mass refill
    }

    // ==========================================
    // Valid Moves & Shuffle
    // ==========================================

    hasValidMoves() {
        for (let y=0;y<this.height;y++) for (let x=0;x<this.width;x++) {
            if (x<this.width-1) { this.swapData(x,y,x+1,y); if(this.findMatches().length>0){this.swapData(x,y,x+1,y);return true;} this.swapData(x,y,x+1,y); }
            if (y<this.height-1) { this.swapData(x,y,x,y+1); if(this.findMatches().length>0){this.swapData(x,y,x,y+1);return true;} this.swapData(x,y,x,y+1); }
        }
        return false;
    }

    findValidMove() {
        for (let y=0;y<this.height;y++) for (let x=0;x<this.width;x++) {
            if (x<this.width-1) { this.swapData(x,y,x+1,y); if(this.findMatches().length>0){this.swapData(x,y,x+1,y);return[{x,y},{x:x+1,y}];} this.swapData(x,y,x+1,y); }
            if (y<this.height-1) { this.swapData(x,y,x,y+1); if(this.findMatches().length>0){this.swapData(x,y,x,y+1);return[{x,y},{x,y:y+1}];} this.swapData(x,y,x,y+1); }
        }
        return null;
    }

    async shuffleBoard(attempt = 0) {
        if (attempt > 10) {
            console.warn('[shuffleBoard] max attempts, regenerating fresh gems');
            for (let y=0;y<this.height;y++) for (let x=0;x<this.width;x++) this.board[y][x] = this.createGem(x,y);
            this.ensureNoInitialMatches(); this.render(); return;
        }
        const gems = [];
        for (let y=0;y<this.height;y++) for (let x=0;x<this.width;x++) if (this.board[y][x]) gems.push(this.board[y][x]);
        const shuffled = Utils.shuffle(gems);
        let idx = 0;
        for (let y=0;y<this.height;y++) for (let x=0;x<this.width;x++) {
            if (idx < shuffled.length) { this.board[y][x] = shuffled[idx]; this.board[y][x].x=x; this.board[y][x].y=y; idx++; }
        }
        this.ensureNoInitialMatches();
        if (!this.hasValidMoves()) { await this.shuffleBoard(attempt + 1); return; }
        this.render();
        UI.showToast('棋盘已重新洗牌！');
        Audio.play('shuffle');
        await Utils.wait(500);
    }

    // ==========================================
    // Scoring & Objectives
    // ==========================================

    addScore(points) {
        let adjusted = Math.floor(points * this.scoreMultiplier);

        // Spirit trial combo bonus
        try {
            const trialComboBonus = Estate.getTrialComboBonus();
            if (trialComboBonus > 0 && this.combo > 1) {
                adjusted = Math.floor(adjusted * (1 + trialComboBonus / 100));
            }
        } catch(e) {}

        this.score += adjusted;

        // Real-time score display update during chains (don't wait for updateUI)
        const scoreEl = document.getElementById('current-score');
        if (scoreEl) scoreEl.textContent = Utils.formatNumber(this.score);

        const boardEl = document.getElementById('game-board');
        if (boardEl) {
            const r = boardEl.getBoundingClientRect();
            if (this.scoreMultiplier > 1) {
                const text = `+${adjusted} ×${this.scoreMultiplier}`;
                Particles.floatingText(r.left+r.width/2, r.top+r.height/2, text, '#ff8800');
                if (adjusted >= 500) {
                    this.showScorePopup(`✦ ×${this.scoreMultiplier} → +${adjusted}`);
                    this.showBuffFlash('rgba(255,136,0,0.2)');
                }
            } else {
                Particles.floatingText(r.left+r.width/2, r.top+r.height/2, `+${adjusted}`, '#ffd700');
            }
        }

        // Boss damage — pass active spirit for weakness multiplier
        if (this.isBossLevel && Boss.currentBoss) {
            const spiritId = Estate.getCurrentSpirit()?.id;
            Boss.dealDamage(adjusted, spiritId);
        }
    }

    updateObjective(gemType, specialType = null) {
        this.objectives.forEach((obj, i) => {
            switch (obj.type) {
                case OBJECTIVE_TYPES.SCORE: this.objectiveProgress[i] = this.score; break;
                case OBJECTIVE_TYPES.CLEAR:
                    if (obj.gem === gemType || obj.gem === 'any') this.objectiveProgress[i]++;
                    break;
                case OBJECTIVE_TYPES.COMBO:
                    // Combo objective: tracks max combo depth (updated in processMatches)
                    break;
                case OBJECTIVE_TYPES.SPECIAL:
                    if (specialType) {
                        if (obj.specialType === 'any' || (obj.specialType === 'line' && (specialType === 'horizontal' || specialType === 'vertical')) || obj.specialType === specialType)
                            this.objectiveProgress[i]++;
                    }
                    break;
            }
        });
    }

    isObjectiveComplete(i) { return this.objectiveProgress[i] >= this.objectives[i].target; }
    areAllObjectivesComplete() { return this.objectives.every((_,i) => this.isObjectiveComplete(i)); }

    // ==========================================
    // Combo Display
    // ==========================================

    showCombo() {
        const display = document.getElementById('combo-display');
        const count = document.getElementById('combo-count');
        if (display && count) {
            // Escalating combo text
            const comboNames = ['', '', 'GOOD!', 'GREAT!', 'AMAZING!', 'INCREDIBLE!', 'LEGENDARY!', 'GODLIKE!'];
            const comboName = comboNames[Math.min(this.combo, comboNames.length - 1)] || 'GODLIKE!';
            count.textContent = `x${this.combo} ${comboName}`;
            display.style.display = 'block';
            display.style.animation = 'none';
            display.offsetHeight;
            display.style.animation = 'combo-pop 0.8s ease forwards';
            // Color escalation
            const colors = ['', '', '#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444', '#ff0000'];
            display.style.color = colors[Math.min(this.combo, colors.length - 1)] || '#ff0000';
            // Scale escalation
            const scale = 1 + Math.min(this.combo * 0.15, 1.0);
            display.style.setProperty('--combo-scale', scale);
            setTimeout(() => { display.style.display = 'none'; }, 1000);
        }

        // ☆ Screen shake — intensity scales with combo
        this.screenShake(Math.min(this.combo * 2, 12), 200 + this.combo * 50);

        // ★ Full screen flash on big combos
        if (this.combo >= 3) {
            const flash = document.createElement('div');
            flash.className = 'combo-screen-flash';
            flash.style.background = colors[Math.min(this.combo, colors.length - 1)] || '#ff0000';
            document.body.appendChild(flash);
            setTimeout(() => flash.remove(), 400);
        }

        // ✦ Particle burst at board center
        const boardEl = document.getElementById('game-board');
        if (boardEl) {
            const r = boardEl.getBoundingClientRect();
            Particles.comboText(r.left+r.width/2, r.top+r.height/2, this.combo);
            // Extra particles for high combos
            if (this.combo >= 3) {
                const sparkCount = Math.min(this.combo * 2, 10); // cap at 10 particles
                for (let i = 0; i < sparkCount; i++) {
                    Particles.spark(r.left + Math.random()*r.width, r.top + Math.random()*r.height);
                }
            }
        }

        // ♪ Vibration escalation
        if (this.combo >= 2) Utils.vibrate(20 + this.combo * 15);

        // 仙 Spirit personality — spirits cheer you on
        if (this.combo >= 4 && Math.random() < 0.4) {
            const spirit = Estate.getCurrentSpirit();
            const cheers = {
                mango_fairy: ['芒果万岁～！芒', '好棒好棒！继续！', '嘿嘿，看我的！'],
                bee_spirit: ['嗡嗡！漂亮！蜂', '蜂群为你欢呼！', '甜蜜的连击！'],
                rainbow_spirit: ['七彩光芒！◇', '太美了这个连击！', '彩虹之力！'],
                dragon_spirit: ['燃烧吧！☆', '龙息都被你震到了！', '勇士！继续！'],
                phoenix_spirit: ['涅槃之力与你同在！', '凤凰为你展翅！', '灰烬中重生！'],
                frost_spirit: ['冰霜认可你的力量。※', '绝对零度...的帅。', '冷静且致命。'],
                time_spirit: ['时间都为你停下了！⏳', '这一刻值得永恒！', '过去未来都是你的。'],
                chaos_spirit: ['哈哈哈混沌万岁！◎', '秩序是弱者的借口！', '让一切都乱起来吧！']
            };
            const lines = cheers[spirit?.id] || cheers.mango_fairy;
            if (lines) {
                const line = lines[Math.floor(Math.random() * lines.length)];
                UI.showToast(`${spirit?.emoji || '仙'} ${line}`, 'success');
            }
        }
    }

    // Vine spreading: frozen cells spread to 1 random neighbor (levels 61+)
    spreadVines() {
        const levelId = this.level.id || 0;
        if (levelId < 61 && !this.level.procedural && !this.level.endless) return;
        // Find all frozen cells
        const frozenCells = [];
        for (let y = 0; y < this.height; y++)
            for (let x = 0; x < this.width; x++)
                if (this.cellStates[y]?.[x]?.frozen) frozenCells.push({x, y});
        if (frozenCells.length === 0 || frozenCells.length >= this.width * this.height * 0.4) return; // cap at 40%
        // 30% chance per turn to spread one vine
        if (Math.random() > 0.3) return;
        // Pick random frozen cell, spread to random neighbor
        const src = frozenCells[Math.floor(Math.random() * frozenCells.length)];
        const dirs = [{dx:0,dy:-1},{dx:0,dy:1},{dx:-1,dy:0},{dx:1,dy:0}];
        const shuffled = dirs.sort(() => Math.random() - 0.5);
        for (const {dx, dy} of shuffled) {
            const nx = src.x + dx, ny = src.y + dy;
            if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height
                && this.cellStates[ny]?.[nx] && !this.cellStates[ny][nx].frozen) {
                this.cellStates[ny][nx].frozen = true;
                this.render();
                return;
            }
        }
    }

    // Screen shake effect — lightweight CSS-only version
    screenShake(intensity = 5, duration = 300) {
        const el = document.getElementById('game-board');
        if (!el) return;
        el.style.animation = 'none';
        el.offsetHeight; // force reflow
        el.style.animation = `shake ${duration}ms ease`;
        setTimeout(() => { el.style.animation = ''; }, duration);
    }

    // ==========================================
    // UI Update
    // ==========================================

    updateUI() {
        const movesEl = document.getElementById('moves-left');
        if (movesEl) {
            movesEl.textContent = this.movesLeft;
            // Last moves tension: pulse + shake + board tint when ≤3 moves
            if (this.movesLeft <= 3 && this.movesLeft > 0 && !this.level.timed) {
                movesEl.style.color = '#ef4444';
                movesEl.style.fontWeight = '900';
                movesEl.style.fontSize = '1.3em';
                // Board urgency tint
                const board = document.getElementById('game-board');
                if (board && !board.classList.contains('urgent-mode')) {
                    board.classList.add('urgent-mode');
                    Utils.vibrate([100, 50, 100]);
                }
                // Screen shake on each move when ≤2
                if (this.movesLeft <= 2) {
                    const gameScreen = document.getElementById('game-screen');
                    if (gameScreen) {
                        gameScreen.style.animation = 'none';
                        void gameScreen.offsetWidth;
                        gameScreen.style.animation = 'urgentShake 0.3s ease';
                    }
                }
            } else {
                movesEl.style.color = '';
                movesEl.style.fontWeight = '';
                movesEl.style.fontSize = '';
                const board = document.getElementById('game-board');
                if (board) board.classList.remove('urgent-mode');
            }
        }

        const scoreEl = document.getElementById('current-score');
        if (scoreEl) scoreEl.textContent = Utils.formatNumber(this.score);

        // Timer
        const timerWrap = document.getElementById('timer-wrap');
        if (timerWrap) timerWrap.style.display = this.level.timed ? 'flex' : 'none';
        if (this.level.timed) this.updateTimerUI();

        // Objectives
        const objEl = document.getElementById('game-objectives');
        if (objEl) {
            objEl.innerHTML = this.objectives.map((obj, i) => {
                const cur = this.objectiveProgress[i], tar = obj.target, done = cur >= tar;
                // Render objective icons as mini CSS gem spheres (not emoji)
                let icon = obj.icon;
                if (obj.gem && typeof GEM_TYPES !== 'undefined' && GEM_TYPES[obj.gem]) {
                    icon = `<span class="obj-gem obj-gem-${obj.gem}"></span>`;
                }
                // Add tooltip for special objectives
                let hint = '';
                if (obj.type === 'special') {
                    if (obj.specialType === 'line') hint = '排4个';
                    else if (obj.specialType === 'bomb') hint = '拐弯排';
                    else if (obj.specialType === 'rainbow') hint = '排5个';
                    else hint = '特殊';
                } else if (obj.type === 'combo') hint = '连锁';
                const hintHtml = hint ? `<span class="objective-hint">${hint}</span>` : '';
                return `<div class="objective ${done?'completed':''}"><span class="objective-icon">${icon}</span>${hintHtml}<span class="objective-count"><span class="current">${Utils.formatNumber(Math.min(cur,tar))}</span>/${Utils.formatNumber(tar)}</span></div>`;
            }).join('');
        }

        // Boss HP bar visibility
        const bossBar = document.getElementById('boss-bar');
        if (bossBar) bossBar.style.display = this.isBossLevel ? 'block' : 'none';

        // Skill bar
        this.updateSkillBarUI();

        // Powerup counts
        const hc = document.getElementById('hammer-count'), sc = document.getElementById('shuffle-count'), hic = document.getElementById('hint-count');
        if(hc) hc.textContent = Storage.getItemCount('hammer');
        if(sc) sc.textContent = Storage.getItemCount('shuffle');
        if(hic) hic.textContent = Storage.getItemCount('hint');

        // Buff indicators
        this.updateBuffIndicators();
    }

    showSpecialGuide() {
        const specials = this.objectives?.filter(o => o.type === 'special' || o.type === 'combo') || [];
        // Also show guide if new mechanics are active (even without special/combo objectives)
        const hasNewMechanics = this.chainBonusActive || this.fogCells.length > 0 || this.gravityShiftActive;
        if (specials.length === 0 && !hasNewMechanics) return;
        const hasRainbow4 = Estate.hasBuff('rainbow_4');

        // Build mechanics tips for Ch7-10
        const mechanicTips = [];
        if (this.chainBonusActive) {
            mechanicTips.push('<div style="font-size:1rem;margin:6px 0;">≡ <b>连锁加分</b>: 连锁越深分越高！x2, x3...</div>');
        }
        if (this.fogCells.length > 0) {
            mechanicTips.push(`<div style="font-size:1rem;margin:6px 0;">≋ <b>迷雾</b>: ${this.fogCells.length}个格子被迷雾覆盖，在旁边消除可以清雾！</div>`);
        }
        if (this.gravityShiftActive) {
            mechanicTips.push('<div style="font-size:1rem;margin:6px 0;">← <b>重力偏移</b>: 宝石向左滑落而非向下！新宝石从右边出现。</div>');
        }

        const guides = {
            line: { icon: '↯', how: '4个排一排', desc: '●●●● → ↯线宝石' },
            bomb: { icon: '✸', how: '拐个弯', desc: '●●●<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;●<br>↑ 3个+拐1个就出✸' },
            rainbow: { icon: '◇', how: hasRainbow4 ? '4个排一排就行！' : '5个排一排', desc: hasRainbow4 ? '◇ 你有彩虹树！<br>●●●● 四个一排就出彩虹！' : '●●●●● → ◇彩虹' },
            any: { icon: '✦', how: hasRainbow4 ? '4个一排=◇ 拐弯=✸' : '排4个或5个', desc: hasRainbow4 ? '你有彩虹树加成！4个=◇ 拐弯=✸' : '4个一排=↯ 5个一排=◇ 拐弯=✸' }
        };
        const comboGuide = { icon: '☆', how: '连锁反应', desc: '消完之后掉下来的自动又消了=连击！' };
        const tips = specials.map(s => {
            if (s.type === 'combo') return `<div style="font-size:1rem;margin:6px 0;">☆ 触发${s.target}次连锁</div>`;
            const g = guides[s.specialType] || guides.any;
            return `<div style="font-size:1rem;margin:6px 0;">${g.icon} ${g.how} → 做${s.target}个</div>`;
        });
        const descs = [...new Set(specials.map(s => {
            if (s.type === 'combo') return comboGuide.desc;
            return (guides[s.specialType]||guides.any).desc;
        }))];
        const guide = document.createElement('div');
        guide.id = 'special-guide';
        guide.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:800;display:flex;align-items:center;justify-content:center;-webkit-tap-highlight-color:transparent;';
        const mechanicHtml = mechanicTips.length > 0 ?
            `<div style="margin-top:12px;padding:10px;background:rgba(34,211,238,0.15);border-radius:10px;border:1px solid rgba(34,211,238,0.3);">
                <div style="font-size:0.75rem;color:#67e8f9;margin-bottom:4px;">◆ 本章新机制</div>
                ${mechanicTips.join('')}
            </div>` : '';
        guide.innerHTML = `<div style="background:#1e1b4b;border:2px solid #fbbf24;border-radius:16px;padding:20px;max-width:300px;text-align:center;">
            <div style="font-size:1.2rem;font-weight:900;color:#fbbf24;margin-bottom:10px;">◎ 本关目标</div>
            ${tips.join('')}
            ${mechanicHtml}
            <div style="margin-top:12px;padding:10px;background:rgba(139,92,246,0.2);border-radius:10px;">
                <div style="font-size:0.75rem;color:#a5b4fc;margin-bottom:4px;">※ 怎么做？</div>
                ${descs.map(d => `<div style="font-size:0.85rem;color:#e0e7ff;">${d}</div>`).join('')}
            </div>
            <div style="margin-top:14px;font-size:0.75rem;color:#94a3b8;">↑ 点任意位置开始游戏</div>
        </div>`;
        // iOS Safari: 'click' may not fire on non-interactive fixed overlays
        // Use both 'click' and 'touchend' for reliable dismissal
        const dismiss = () => { if (guide.parentNode) guide.remove(); };
        guide.addEventListener('click', dismiss);
        guide.addEventListener('touchend', (e) => { e.preventDefault(); dismiss(); });
        guide.style.cursor = 'pointer'; // iOS needs cursor:pointer for click on non-<a> elements
        setTimeout(dismiss, 6000);
        document.body.appendChild(guide);
    }

    updateBuffIndicators() {
        const container = document.getElementById('active-buffs');
        if (!container) return;
        const buffs = Estate.getActiveBuffs();
        if (buffs.length === 0) { container.style.display = 'none'; return; }
        container.style.display = 'flex';
        container.innerHTML = buffs.map(b => {
            switch(b) {
                case 'start_bomb': return '<span class="buff-chip buff-bomb"><span class="buff-emoji">✦</span><span class="buff-label">炸弹</span></span>';
                case 'extra_moves': return `<span class="buff-chip buff-moves"><span class="buff-emoji">☽</span><span class="buff-label">+${Estate.getExtraMoves()||2}步</span></span>`;
                case 'rainbow_4': return '<span class="buff-chip buff-rainbow"><span class="buff-emoji">◇</span><span class="buff-label">4消彩虹</span></span>';
                case 'score_multiplier': return `<span class="buff-chip buff-score"><span class="buff-emoji">✦</span><span class="buff-label">x${this.scoreMultiplier}</span></span>`;
                case 'gem_bonus': return '<span class="buff-chip buff-gem"><span class="buff-emoji">◆</span><span class="buff-label">宝石加成</span></span>';
                default: return '';
            }
        }).join('');
    }

    // Boss entrance cinematic
    showBossEntrance(levelId) {
        const bd = Boss.BOSSES[levelId];
        if (!bd) return;
        const phase = bd.phases[0];
        const overlay = document.createElement('div');
        overlay.className = 'boss-entrance-overlay';
        overlay.innerHTML = `
            <div class="boss-entrance-content">
                <div class="boss-entrance-emoji">${phase.emoji}</div>
                <div class="boss-entrance-name">${bd.name}</div>
                <div class="boss-entrance-desc">${bd.desc}</div>
                <div class="boss-entrance-taunt">"${phase.taunt}"</div>
            </div>
        `;
        document.body.appendChild(overlay);
        Audio.play('boss_appear');
        this.screenShake(5, 400);
        Utils.vibrate([50, 30, 80, 30, 120]);
        setTimeout(() => {
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.5s';
            setTimeout(() => overlay.remove(), 600);
        }, 2500);
    }

    // Flash screen when buff triggers (score multiplier, rainbow, etc.)
    showBuffFlash(color) {
        const el = document.createElement('div');
        el.className = 'buff-flash';
        if (color) el.style.background = color;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 700);
    }

    // Big score popup for multiplied scores
    showScorePopup(text) {
        const el = document.createElement('div');
        el.className = 'score-popup-multi';
        el.textContent = text;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1100);
    }

    // ==========================================
    // Game Over
    // ==========================================

    checkGameOver() {
        if (this.isGameOver) return;
        if (this.isBossLevel) {
            if (Boss.bossHP <= 0) this.victory();
            else if (this.movesLeft <= 0) this.defeat();
        } else {
            if (this.areAllObjectivesComplete()) this.victory();
            else if (this.movesLeft <= 0 && !this.level.timed) this.defeat();
        }
    }

    victory() {
        this.isGameOver = true;
        if (this.timerInterval) clearInterval(this.timerInterval);

        // Spirit Trial: end with win
        if (this.level.spiritTrial && Estate.isInSpiritTrial()) {
            Estate.endSpiritTrial(true);
            Audio.play('victory');
            UI.showToast('♪ 精灵试炼胜利！', 'success');
            setTimeout(() => UI.showScreen('estate-screen'), 1500);
            setTimeout(() => UI.showEstate(), 1600);
            return;
        }

        const stars = this.calculateStars();
        const goldReward = Math.floor(this.score / 100) + stars * 50;
        Storage.completedLevel(this.level.id, stars, this.score);
        Storage.addScore(this.score);
        Storage.addGold(goldReward);
        // ◆ Crystal Tree: bonus gems on victory
        if (Estate.hasBuff('gem_bonus')) {
            const gemBonus = Estate.getTreeBuffValue('crystal') || 1;
            const actualBonus = (stars === 3 && Estate.getTreeLevel('crystal') >= 4) ? gemBonus : Math.min(gemBonus, 3);
            if (actualBonus > 0) {
                Storage.addGems(actualBonus);
                UI.showToast(`◆ 水晶树: +${actualBonus}宝石！`, 'success');
            }
        }
        Storage.addExp(this.score / 10);
        Storage.recordGame(true);
        Estate.addHappiness(10 + stars * 5);
        // ♥ Spirit affinity: gain exp from battles
        const activeSpirit = Estate.getCurrentSpirit();
        if (activeSpirit) {
            const affinityGain = 5 + stars * 3 + (this.isBossLevel ? 15 : 0);
            Estate.addSpiritAffinity(activeSpirit.id, affinityGain);
        }
        // ◎ Season points (legacy — new Seasons system handles this above)
        if (typeof SeasonSystem !== 'undefined' && typeof Seasons === 'undefined') {
            const seasonPts = 10 + stars * 5 + (this.isBossLevel ? 20 : 0);
            SeasonSystem.addSeasonPoints(seasonPts);
        }
        const gameTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
        Storage.addPlayTime(gameTime);
        // Use tracked skull flag (not just current board state — skulls may have been cleared)
        const hadSkulls = this._hadSkulls || false;
        const bossRaged = this.isBossLevel && Boss._rageMode;
        // Record to Stats system
        if (typeof Stats !== 'undefined') {
            Stats.recordLevelComplete(this.level.id, this.score, stars, this.level.moves - this.movesLeft, gameTime * 1000);
            Stats.recordPlayTime(gameTime);
            if (this.isBossLevel) Stats.recordBossAttempt(true);
        }
        // Record to Seasons system
        if (typeof Seasons !== 'undefined') {
            Seasons.addPoints(10 + stars * 5 + (this.isBossLevel ? 20 : 0));
            if (this.level.seasonal) Seasons.completeSeasonalLevel(this.level.seasonLevelIndex, this.score, stars);
        }
        // Record daily challenge
        if (this.level.daily) {
            const dcResult = DailyChallenge.recordAttempt(this.score, stars, true);
            if (dcResult.streakBonus > 0) {
                Storage.addGold(dcResult.streakBonus);
                UI.showToast(`☆ 连续${dcResult.streak}天！+${dcResult.streakBonus}金币`, 'success');
            }
            Achievements.check('daily_complete', 1);
        }
        // Record endless
        if (this.level.endless) {
            EndlessMode.saveHighScore();
            const mode = this.level.endlessMode || 'zen';
            Achievements.check(mode === 'survival' ? 'survival_complete' : 'endless_complete', EndlessMode.currentWave, { totalScore: EndlessMode.totalScore });
        }
        Achievements.check('win', this.level.id, {
            noPowerup: this.powerupsUsed===0,
            time: gameTime,
            bossLevel: this.isBossLevel ? this.level.id : null,
            hadSkulls: hadSkulls,
            bossRaged: bossRaged,
            movesLeft: this.movesLeft,
        });
        Achievements.check('level_complete', this.level.id);
        Achievements.check('score', this.score);
        Achievements.check('stars', Storage.getTotalStars());
        if (stars === 3) Achievements.check('perfect');
        Collection.checkUnlock('level_complete', {level: this.level.id});
        Audio.play('victory');

        // ♕ Boss loot — unique rewards + lore
        if (this.isBossLevel) {
            const loot = Boss.getLoot(this.level.id);
            if (loot && !loot.alreadyClaimed) {
                Boss.claimLoot(this.level.id);
                // Show loot screen before normal victory
                UI.showBossLoot(loot, this.level.id, () => {
                    UI.showVictory(stars, this.score, this.maxCombo, goldReward + loot.gold);
                });
            } else {
                UI.showVictory(stars, this.score, this.maxCombo, goldReward);
            }
        } else {
            UI.showVictory(stars, this.score, this.maxCombo, goldReward);
        }
        // Epic multi-wave confetti celebration
        Particles.confetti();
        this.screenShake(3, 200);
        Utils.vibrate([30, 20, 50, 20, 80, 30, 100]);
        setTimeout(() => Particles.confetti(), 400);
        if (stars >= 3) setTimeout(() => Particles.confetti(), 800);

        // ── Hardcore: Board Reading Score display ──
        try {
            if (typeof HardcoreMode !== 'undefined') {
                const reading = HardcoreMode.getBoardReadingScore(this);
                if (reading && reading.grade) {
                    setTimeout(() => {
                        UI.showToast(`${reading.label} · 策略评级: ${reading.grade} (${reading.score}分)`, 'success');
                    }, 1500);
                }
            }
        } catch(e) {}

        // ── Challenge Tower: record floor completion ──
        try {
            if (this.level.tower && typeof ChallengeTower !== 'undefined') {
                ChallengeTower.completeFloor(this.level.towerFloor, this.score, stars);
            }
        } catch(e) {}
    }

    defeat() {
        // Spirit Trial: end with loss
        if (this.level.spiritTrial && Estate.isInSpiritTrial()) {
            this.isGameOver = true;
            if (this.timerInterval) clearInterval(this.timerInterval);
            Estate.endSpiritTrial(false);
            Audio.play('defeat');
            UI.showToast('♥ 试炼结束，再接再厉！', 'info');
            setTimeout(() => UI.showScreen('estate-screen'), 1500);
            setTimeout(() => UI.showEstate(), 1600);
            return;
        }

        // ☆ Phoenix Tree: chance to survive defeat
        if (Estate.hasBuff('second_chance') && !this._usedSecondChance) {
            const chance = Estate.getTreeBuffValue('phoenix') || 20;
            if (Math.random() * 100 < chance) {
                this._usedSecondChance = true;
                const bonusMoves = Estate.getTreeLevel('phoenix') >= 4 ? 5 : 3;
                this.movesLeft += bonusMoves;
                this.updateUI();
                Audio.play('powerup');
                UI.showToast(`☆ 凤凰树发动！+${bonusMoves}步！`, 'success');
                Utils.vibrate([50, 30, 80, 30, 100]);
                this.screenShake(6, 300);
                return; // Don't defeat!
            }
        }

        this.isGameOver = true;
        if (this.timerInterval) clearInterval(this.timerInterval);
        Storage.recordGame(false);
        const defeatTime = Math.floor((Date.now()-this.gameStartTime)/1000);
        Storage.addPlayTime(defeatTime);
        // Record to Stats
        if (typeof Stats !== 'undefined') {
            Stats.recordLevelFail(this.level.id, this.score, this.level.moves - this.movesLeft);
            Stats.recordPlayTime(defeatTime);
            if (this.isBossLevel) Stats.recordBossAttempt(false);
        }
        // Record daily challenge failure
        if (this.level.daily) {
            DailyChallenge.recordAttempt(this.score, 0, false);
        }
        // Endless: save high score on defeat
        if (this.level.endless) {
            EndlessMode.totalScore += this.score;
            EndlessMode.saveHighScore();
            EndlessMode.isActive = false;
        }
        Achievements.check('game');
        Audio.play('defeat');
        let totalProg = 0;
        if (this.isBossLevel && Boss.currentBoss) {
            totalProg = 1 - (Boss.bossHP / Boss.bossMaxHP);
        } else {
            this.objectives.forEach((obj,i) => { totalProg += Math.min(this.objectiveProgress[i]/obj.target, 1); });
            totalProg /= this.objectives.length;
        }
        // ※ "Almost!" psychology — tell them EXACTLY how close
        const pct = Math.floor(totalProg * 100);
        let nearMissInfo = '';
        if (pct >= 90) {
            // Calculate how many more moves they'd need
            nearMissInfo = '再多1-2步就过了！';
        } else if (pct >= 80) {
            nearMissInfo = '再多3步绝对能过！';
        }
        // Check if any single objective was super close
        if (!this.isBossLevel) {
            this.objectives.forEach((obj, i) => {
                const remaining = obj.target - this.objectiveProgress[i];
                if (remaining > 0 && remaining <= 3) {
                    nearMissInfo = `只差${remaining}个${obj.type === 'score' ? '分' : obj.type}就过了！`;
                }
            });
        } else if (Boss.currentBoss && Boss.bossHP > 0) {
            const bossHpPct = (Boss.bossHP / Boss.bossMaxHP * 100).toFixed(0);
            if (bossHpPct <= 15) nearMissInfo = `Boss只剩${bossHpPct}%血！再来一次稳过！`;
        }
        UI.showDefeat(this.score, pct, nearMissInfo);

        // v10: Tutorial hint for out of moves
        if (this.movesLeft <= 0 && !this.level.timed) {
            try { Tutorial.onOutOfMoves(); } catch(e) {}
        }
    }

    calculateStars() {
        const t = this.level.stars;
        if (!t || !Array.isArray(t) || t.length < 3) {
            // Fallback for special levels without proper star thresholds
            if (this.score >= 3000) return 3;
            if (this.score >= 1500) return 2;
            if (this.score >= 500) return 1;
            return 0;
        }
        if (this.score >= t[2]) return 3;
        if (this.score >= t[1]) return 2;
        if (this.score >= t[0]) return 1;
        return 0;
    }

    // ==========================================
    // Powerups
    // ==========================================

    activatePowerup(type) {
        if (this.isProcessing || this.isPaused || this.isGameOver) return;
        if (Storage.getItemCount(type) <= 0) { UI.showToast('道具不足！'); return; }
        if (type === 'shuffle') { this.useShuffle(); }
        else if (type === 'hint') { this.useHint(); }
        else {
            this.powerupMode = type;
            document.querySelectorAll('.powerup-btn').forEach(b => b.classList.remove('active'));
            document.querySelector(`[data-powerup="${type}"]`)?.classList.add('active');
            UI.showToast('请选择目标');
        }
    }

    cancelPowerup() { this.powerupMode = null; document.querySelectorAll('.powerup-btn').forEach(b => b.classList.remove('active')); }

    usePowerup(x, y) {
        if (!this.powerupMode) return;
        const type = this.powerupMode; this.cancelPowerup();
        if (!Storage.useItem(type)) { UI.showToast('道具不足！'); return; }
        this.powerupsUsed++;
        Collection.checkUnlock('item_use', {itemId: type});
        Audio.play('powerup');
        if (type === 'hammer') this.useHammer(x, y);
        this.updateUI();
    }

    async useHammer(x, y) {
        const gem = this.board[y][x]; if (!gem) return;
        this.isProcessing = true;
        try {
            if (gem.special !== this.SPECIAL_TYPES.NONE) await this.activateSpecial(x, y, gem.special);
            this.board[y][x] = null;
            if (this.cellStates[y][x]) { this.cellStates[y][x].frozen = false; this.cellStates[y][x].locked = 0; }
            this.updateObjective(gem.type);
            const c = this.getCell(x,y);
            if(c) Particles.explosion(c.getBoundingClientRect().left+c.offsetWidth/2, c.getBoundingClientRect().top+c.offsetHeight/2, '#f97316');
            this.render(); await Utils.wait(200);
            await this.dropGems(); await this.fillGems(); await this.processMatches();
        } catch(e) { console.error('[useHammer]', e); }
        finally { this.isProcessing = false; this.updateUI(); this.checkGameOver(); }
    }

    async useShuffle() {
        if (!Storage.useItem('shuffle')) { UI.showToast('道具不足！'); return; }
        this.powerupsUsed++; Collection.checkUnlock('item_use', {itemId:'shuffle'}); Audio.play('powerup');
        await this.shuffleBoard(); this.updateUI();
    }

    useHint() {
        if (!Storage.useItem('hint')) { UI.showToast('道具不足！'); return; }
        this.powerupsUsed++; Collection.checkUnlock('item_use', {itemId:'hint'}); Audio.play('hint');
        this.showHint(); this.updateUI();
    }

    // Hint system
    startHintTimer() { this.clearHint(); this.hintTimer = setTimeout(() => { if (!this.isProcessing && !this.isPaused && !this.isGameOver) this.showHint(true); }, 5000); }
    resetHintTimer() { if (this.hintTimer) clearTimeout(this.hintTimer); this.clearHint(); this.startHintTimer(); }
    showHint(auto = false) {
        this.clearHint();
        const move = this.findValidMove(); if (!move) return;
        this.hintCells = move;
        for (const {x,y} of move) { const c = this.getCell(x,y); if(c) c.classList.add('hint'); }
        if (!auto) UI.showToast('※ 看这里！');
    }
    clearHint() { for (const {x,y} of this.hintCells) { const c = this.getCell(x,y); if(c) c.classList.remove('hint'); } this.hintCells = []; }

    // Pause/Resume/Restart/Quit
    pause() { this.isPaused = true; if (this.hintTimer) clearTimeout(this.hintTimer); }
    resume() { this.isPaused = false; this.startHintTimer(); }
    restart() {
        // Special levels (daily/endless/trial) need initSpecial with the full config
        if (this.level && (this.level.procedural || this.level.daily || this.level.endless || this.level.weekly || this.level.spiritTrial || this.level.revenge)) {
            this.initSpecial(this.level);
        } else {
            this.init(this.level.id);
        }
    }
    quit() { if (this.hintTimer) clearTimeout(this.hintTimer); if (this.timerInterval) clearInterval(this.timerInterval); Boss.reset(); }
}

const game = new Game();
