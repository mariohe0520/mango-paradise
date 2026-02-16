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

    init(levelId) {
        this.level = getLevel(levelId);
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
                this.movesLeft += 2;
                buffMessages.push('🌙 月光树: +2步');
            }
            if (this.scoreMultiplier > 1) buffMessages.push(`✨ 幸福度: 分数x${this.scoreMultiplier}`);
            if (Estate.hasBuff('rainbow_4')) buffMessages.push('🌈 彩虹树: 4消出彩虹');
            if (Estate.hasBuff('start_bomb')) buffMessages.push('🌟 金芒树: 开局炸弹');
            // Show buff summary after short delay
            if (buffMessages.length > 0) {
                setTimeout(() => UI.showToast(buffMessages.join(' | '), 'success'), 800);
            }
        } catch (e) {
            console.warn('[Game.init] Estate buff error (fallback to defaults):', e);
            this.scoreMultiplier = 1.0;
        }

        // Skill bar
        this.skillCharge = 0;
        this.skillMax = 100;

        // Boss
        try {
            this.isBossLevel = Boss.isBossLevel(levelId);
            if (this.isBossLevel) {
                Boss.init(levelId);
            }
        } catch (e) {
            console.warn('[Game.init] Boss init error (fallback to non-boss):', e);
            this.isBossLevel = false;
        }

        // Init objectives
        this.objectives = Utils.deepClone(this.level.objectives);
        this.objectiveProgress = {};
        this.objectives.forEach((obj, i) => { this.objectiveProgress[i] = 0; });

        // Create board
        this.createBoard();
        this.ensureNoInitialMatches();

        // Place start bomb if buff active
        try {
            if (Estate.hasBuff('start_bomb')) {
                const rx = Utils.randomInt(0, this.width - 1);
                const ry = Utils.randomInt(0, this.height - 1);
                if (this.board[ry][rx]) {
                    this.board[ry][rx].special = this.SPECIAL_TYPES.BOMB;
                }
            }
        } catch (e) {
            console.warn('[Game.init] start_bomb buff error:', e);
        }

        // Timed level
        if (this.level.timed) {
            this.timeLeft = this.level.timeLimit;
            this.startTimer();
        } else {
            this.timeLeft = 0;
            if (this.timerInterval) { clearInterval(this.timerInterval); this.timerInterval = null; }
        }

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
    // Rendering
    // ==========================================

    render() {
        try {
            const boardEl = document.getElementById('game-board');
            if (!boardEl) { console.error('[Game.render] #game-board not found'); return; }

            // ── Cell size: TARGET 90% screen width, constrain by height ──
            const gap = 2; // matches --board-gap

            // Width-first: board should fill 95% of screen width (maximize touch area)
            const targetBoardW = Math.floor(window.innerWidth * 0.97);
            const cellFromW = Math.floor((targetBoardW - (this.width - 1) * gap) / this.width);

            // Height constraint: measure actual non-board elements
            const gameScreen = document.getElementById('game-screen');
            const container = document.querySelector('.game-board-container');
            let cellFromH = 999;
            if (gameScreen && container) {
                // Measure chrome height directly (no getComputedStyle, fast)
                let chromeH = 0;
                for (const el of gameScreen.children) {
                    if (el === container || el.style.display === 'none' || !el.offsetHeight) continue;
                    chromeH += el.offsetHeight;
                }
                const availH = window.innerHeight - chromeH - 4; // minimal 4px safety
                cellFromH = Math.floor((availH - (this.height - 1) * gap) / this.height);
            }

            let cellPx = Math.min(cellFromW, cellFromH);
            cellPx = Math.max(32, cellPx); // minimum 32px (no upper clamp — let it breathe)

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

            // ── Ultra-fast update: skip unchanged cells entirely ──
            const children = boardEl.children;
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    const idx = y * this.width + x;
                    const cell = children[idx];
                    if (!cell) continue;
                    const gem = this.board[y][x];
                    const gemId = gem ? gem.id : '';

                    // Skip entirely if gem hasn't changed
                    if (cell._lastGemId === gemId && !cell._dirty) continue;
                    cell._lastGemId = gemId;
                    cell._dirty = false;

                    // Update gem content
                    const existingGem = cell.firstChild;
                    if (gem) {
                        if (!existingGem || existingGem.dataset.id !== gem.id) {
                            cell.textContent = '';
                            cell.appendChild(this.createGemElement(gem));
                        }
                    } else if (existingGem) {
                        cell.textContent = '';
                    }
                }
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
        const gemData = GEM_TYPES[gem.type];
        gemEl.textContent = gemData ? gemData.emoji : '❓';
        if (gem.special !== this.SPECIAL_TYPES.NONE) {
            gemEl.classList.add('special', gem.special);
        }
        return gemEl;
    }

    updateCell(x, y) {
        const cell = this.getCell(x, y);
        if (!cell) return;
        cell.innerHTML = '';
        // Reapply cell state classes
        const cs = this.cellStates[y] && this.cellStates[y][x];
        cell.classList.remove('frozen', 'locked-cell');
        if (cs) {
            if (cs.frozen) cell.classList.add('frozen');
            if (cs.locked > 0) { cell.classList.add('locked-cell'); cell.dataset.lockLevel = cs.locked; }
            else { delete cell.dataset.lockLevel; }
        }
        const gem = this.board[y][x];
        if (gem) cell.appendChild(this.createGemElement(gem));
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
        if (this.isProcessing || this.isPaused || this.isGameOver) return;
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

        await this.animateSwap(x1, y1, x2, y2);
        this.swap(x1, y1, x2, y2);

        const matches = this.findMatches();
        if (matches.length > 0 || this.hasSpecialSwap(x1, y1, x2, y2)) {
            if (!this.level.timed) this.movesLeft--;
            Audio.play('swap'); Utils.vibrate(30);

            if (this.hasSpecialSwap(x1, y1, x2, y2)) await this.processSpecialSwap(x1, y1, x2, y2);
            await this.processMatches();

            // Boss counterattack after player move
            if (this.isBossLevel && Boss.currentBoss && Boss.bossHP > 0) {
                const attacks = Boss.counterattack(this);
                if (attacks.length > 0) await this.showBossAttack(attacks);
            }
        } else {
            Audio.play('invalid'); Utils.vibrate([50,50,50]);
            const c1 = this.getCell(x1,y1), c2 = this.getCell(x2,y2);
            if(c1) c1.classList.add('invalid'); if(c2) c2.classList.add('invalid');
            await Utils.wait(200);
            if(c1) c1.classList.remove('invalid'); if(c2) c2.classList.remove('invalid');
            await this.animateSwap(x1, y1, x2, y2);
            this.swap(x1, y1, x2, y2);
        }

        this.updateUI();
        this.isProcessing = false;
        this.checkGameOver();
    }

    swap(x1, y1, x2, y2) {
        const tmp = this.board[y1][x1];
        this.board[y1][x1] = this.board[y2][x2];
        this.board[y2][x2] = tmp;
        if (this.board[y1][x1]) { this.board[y1][x1].x = x1; this.board[y1][x1].y = y1; }
        if (this.board[y2][x2]) { this.board[y2][x2].x = x2; this.board[y2][x2].y = y2; }
        this.updateCell(x1, y1); this.updateCell(x2, y2);
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
        return (g1 && g1.special === this.SPECIAL_TYPES.RAINBOW) || (g2 && g2.special === this.SPECIAL_TYPES.RAINBOW);
    }

    async processSpecialSwap(x1, y1, x2, y2) {
        const g1 = this.board[y1][x1], g2 = this.board[y2][x2];
        let rainbow = null, target = null, rPos = null;
        if (g1 && g1.special === this.SPECIAL_TYPES.RAINBOW) { rainbow = g1; target = g2; rPos = {x:x1,y:y1}; }
        else if (g2 && g2.special === this.SPECIAL_TYPES.RAINBOW) { rainbow = g2; target = g1; rPos = {x:x2,y:y2}; }
        if (!rainbow || !target) return;
        if (target.special === this.SPECIAL_TYPES.RAINBOW) {
            Audio.play('special'); await this.clearAllGems();
            Collection.checkUnlock('special_combo', {type:'double_rainbow'}); return;
        }
        Audio.play('special');
        const cell = this.getCell(rPos.x, rPos.y);
        if (cell) Particles.rainbow(cell.getBoundingClientRect().left + cell.offsetWidth/2, cell.getBoundingClientRect().top + cell.offsetHeight/2);
        await this.clearGemType(target.type);
        this.board[rPos.y][rPos.x] = null; this.updateCell(rPos.x, rPos.y);
        this.addScore(this.SCORES.SPECIAL_COMBO);
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
        const checked = new Set();
        // Horizontal
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width - 2; x++) {
                const gem = this.board[y][x]; if (!gem) continue;
                let count = 1;
                while (x+count < this.width && this.board[y][x+count] && this.board[y][x+count].type === gem.type) count++;
                if (count >= 3) {
                    const match = [];
                    for (let i = 0; i < count; i++) { const k=`${x+i},${y}`; if(!checked.has(k)){ match.push({x:x+i,y,gem:this.board[y][x+i]}); checked.add(k); } }
                    if (match.length >= 3) matches.push({cells:match, type:gem.type, direction:'horizontal'});
                }
            }
        }
        // Vertical
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height - 2; y++) {
                const gem = this.board[y][x]; if (!gem) continue;
                let count = 1;
                while (y+count < this.height && this.board[y+count][x] && this.board[y+count][x].type === gem.type) count++;
                if (count >= 3) {
                    const match = [];
                    for (let i = 0; i < count; i++) { const k=`${x},${y+i}`; if(!checked.has(k)){ match.push({x,y:y+i,gem:this.board[y+i][x]}); checked.add(k); } }
                    if (match.length >= 3) matches.push({cells:match, type:gem.type, direction:'vertical'});
                }
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
        let cascadeDepth = 0;
        const MAX_CASCADE = 50; // safety valve: no infinite loops

        while (hasMatches && cascadeDepth < MAX_CASCADE) {
            cascadeDepth++;
            const matches = this.findMatches();
            if (matches.length === 0) { hasMatches = false; break; }

            this.combo++;
            if (this.combo > this.maxCombo) { this.maxCombo = this.combo; Storage.updateMaxCombo(this.maxCombo); }

            if (this.combo > 1) {
                this.showCombo();
                // Progressive combo sound (do-re-mi-fa-sol)
                Audio.playComboNote(this.combo);
            }

            // ── Apply "matching" visual to all matched gems THEN process ──
            for (const match of matches) {
                for (const cell of match.cells) {
                    const gemEl = this.getGemElement(cell.x, cell.y);
                    if (gemEl) gemEl.classList.add('matching');
                }
            }
            await Utils.wait(120);

            for (const match of matches) await this.processMatch(match);
            Achievements.check('combo', this.combo);

            // Tight cascade: drop+fill in quick sequence
            await this.dropGems();
            await this.fillGems();
            this.updateUI();
        }

        this.combo = 0;
        if (!this.hasValidMoves()) await this.shuffleBoard();
    }

    async processMatch(match) {
        const count = match.cells.length;
        let specialType = this.SPECIAL_TYPES.NONE;
        let specialPosition = null;

        // Determine special gem - with rainbow_4 buff check
        if (count === 4) {
            if (Estate.hasBuff('rainbow_4')) {
                // 4-match creates rainbow instead of line gem! (彩虹树 Buff)
                specialType = this.SPECIAL_TYPES.RAINBOW;
                specialPosition = match.cells[2];
                Collection.checkUnlock('special_create', {specialType:'rainbow'});
                // Visual: rainbow flash to celebrate buff activation
                const c = this.getCell(match.cells[2].x, match.cells[2].y);
                if (c) { const r = c.getBoundingClientRect(); Particles.rainbow(r.left+r.width/2, r.top+r.height/2); }
            } else {
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

        // Score
        let score = 0;
        switch(count) { case 3: score=this.SCORES.MATCH_3; break; case 4: score=this.SCORES.MATCH_4; break; case 5: score=this.SCORES.MATCH_5; break; default: score=this.SCORES.MATCH_6; }
        score += this.SCORES.COMBO_BONUS * (this.combo - 1);
        this.addScore(score);

        // Charge skill bar
        const chargeAmount = count >= 5 ? 25 : count >= 4 ? 15 : 8;
        this.skillCharge = Math.min(this.skillMax, this.skillCharge + chargeAmount);
        this.updateSkillBarUI();

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

            // Lightweight clear: just CSS flash, no per-cell particles (perf)
            const cellEl = this.getCell(x, y);
            if (cellEl) cellEl.style.animation = 'cell-flash 0.15s ease';
        }

        // Create special gem
        if (specialType !== this.SPECIAL_TYPES.NONE && specialPosition) {
            const {x,y} = specialPosition;
            this.board[y][x] = { type: match.type, special: specialType, x, y, id: Utils.generateId() };
            Audio.play('special');
            Storage.data.statistics.specialGemsCreated++;
            Achievements.check('special');
            this.updateObjective('special', specialType);
        }

        this.render();
        // Single particle burst for the whole match (1 reflow instead of N)
        if (match.cells.length > 0) {
            const boardEl = document.getElementById('game-board');
            if (boardEl) {
                const r = boardEl.getBoundingClientRect();
                const mid = match.cells[Math.floor(match.cells.length/2)];
                const cellPx = this._cellPx || 42, gap = 2;
                const cx = r.left + mid.x * (cellPx+gap) + cellPx/2;
                const cy = r.top + mid.y * (cellPx+gap) + cellPx/2;
                const gd = GEM_TYPES[match.cells[0].gem.type];
                Particles.burst(cx, cy, gd?gd.color:'#fff', Math.min(count+2, 8));
            }
        }
        Storage.addMatch();
        Achievements.check('match');
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
            case this.SPECIAL_TYPES.HORIZONTAL:
                Particles.lineHorizontal(rect.top+rect.height/2, 0, window.innerWidth, '#3b82f6');
                for (let i = 0; i < this.width; i++) {
                    if (this.board[y][i]) { this.updateObjective(this.board[y][i].type); this.board[y][i] = null; this.addScore(50); }
                    if (this.cellStates[y][i]) { this.cellStates[y][i].frozen = false; this.cellStates[y][i].locked = 0; }
                }
                break;
            case this.SPECIAL_TYPES.VERTICAL:
                Particles.lineVertical(rect.left+rect.width/2, 0, window.innerHeight, '#3b82f6');
                for (let i = 0; i < this.height; i++) {
                    if (this.board[i][x]) { this.updateObjective(this.board[i][x].type); this.board[i][x] = null; this.addScore(50); }
                    if (this.cellStates[i][x]) { this.cellStates[i][x].frozen = false; this.cellStates[i][x].locked = 0; }
                }
                break;
            case this.SPECIAL_TYPES.BOMB:
                Particles.explosion(rect.left+rect.width/2, rect.top+rect.height/2, '#ef4444');
                for (let dy=-1; dy<=1; dy++) for (let dx=-1; dx<=1; dx++) {
                    const nx=x+dx, ny=y+dy;
                    if (this.isValidCell(nx,ny)) {
                        if (this.board[ny][nx]) { this.updateObjective(this.board[ny][nx].type); this.board[ny][nx]=null; this.addScore(50); }
                        if (this.cellStates[ny][nx]) { this.cellStates[ny][nx].frozen = false; this.cellStates[ny][nx].locked = 0; }
                    }
                }
                break;
        }
        await Utils.wait(200);
        this.render();
    }

    // ==========================================
    // Boss Attack Visualization
    // ==========================================

    async showBossAttack(attacks) {
        // Flash boss warning
        const bossUI = document.getElementById('boss-bar');
        if (bossUI) { bossUI.classList.add('boss-attacking'); }
        Audio.play('explosion');
        UI.showToast('⚠️ Boss 反击！', 'error');
        await Utils.wait(400);

        for (const atk of attacks) {
            const cell = this.getCell(atk.x, atk.y);
            if (cell) {
                if (atk.type === 'ice') {
                    Particles.burst(cell.getBoundingClientRect().left+cell.offsetWidth/2, cell.getBoundingClientRect().top+cell.offsetHeight/2, ['#88ddff','#aaeeff','#ffffff']);
                    cell.classList.add('frozen');
                } else if (atk.type === 'lock') {
                    Particles.burst(cell.getBoundingClientRect().left+cell.offsetWidth/2, cell.getBoundingClientRect().top+cell.offsetHeight/2, ['#888','#aaa','#666']);
                    cell.classList.add('locked-cell');
                    cell.dataset.lockLevel = '2';
                }
            }
        }

        await Utils.wait(300);
        if (bossUI) bossUI.classList.remove('boss-attacking');
        this.render();
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
                // Place 3 random bombs with staggered visual
                for (let i = 0; i < 3; i++) {
                    let attempts = 0;
                    while (attempts < 30) {
                        const x = Utils.randomInt(0, this.width-1), y = Utils.randomInt(0, this.height-1);
                        if (this.board[y][x] && this.board[y][x].special === this.SPECIAL_TYPES.NONE) {
                            this.board[y][x].special = this.SPECIAL_TYPES.BOMB;
                            this.render(); // show bomb appear
                            const c = this.getCell(x,y);
                            if (c) {
                                const r = c.getBoundingClientRect();
                                Particles.burst(r.left+r.width/2, r.top+r.height/2, ['#ef4444','#ff6b35','#ffd700'], 12);
                                Particles.sparkle(r.left+r.width/2, r.top+r.height/2);
                            }
                            Audio.play('powerup');
                            await Utils.wait(200); // stagger for drama
                            break;
                        }
                        attempts++;
                    }
                }
                break;
            case 'bee_spirit': {
                // Clear a random row — with sweep animation
                const row = Utils.randomInt(0, this.height-1);
                // Visual: flash each cell in sequence (sweep effect)
                for (let x = 0; x < this.width; x++) {
                    const c = this.getCell(x, row);
                    if (c) {
                        c.style.animation = 'cell-flash 0.2s ease';
                        const r = c.getBoundingClientRect();
                        Particles.burst(r.left+r.width/2, r.top+r.height/2, '#eab308', 4);
                    }
                    if (this.board[row][x]) {
                        this.addScore(50);
                        this.updateObjective(this.board[row][x].type);
                        this.board[row][x] = null;
                    }
                    if (this.cellStates[row][x]) { this.cellStates[row][x].frozen = false; this.cellStates[row][x].locked = 0; }
                    await Utils.wait(40); // stagger sweep left-to-right
                }
                this.screenShake(6, 200);
                const boardEl = document.getElementById('game-board');
                if (boardEl) {
                    const r = boardEl.getBoundingClientRect();
                    Particles.lineHorizontal(r.top + (row+0.5)*(r.height/this.height), r.left, r.right, '#eab308');
                }
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
        }

        this.render();
        await Utils.wait(200);
        await this.dropGems();
        await this.fillGems();
        await this.processMatches();

        this.isProcessing = false;
        this.updateSkillBarUI();
        this.updateUI();
        this.checkGameOver();
    }

    // ==========================================
    // Gem Drop & Fill
    // ==========================================

    async dropGems() {
        let dropped = false;
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
        if (dropped) {
            this.render();
            Audio.play('cascade');
            await Utils.wait(80);
        }
    }

    async fillGems() {
        let filled = false;
        for (let x = 0; x < this.width; x++)
            for (let y = 0; y < this.height; y++)
                if (!this.board[y][x]) {
                    this.board[y][x] = this.createGem(x, y);
                    this.cellStates[y][x] = { frozen: false, locked: 0 };
                    filled = true;
                }
        if (filled) {
            this.render();
            await Utils.wait(60);
        }
    }

    // ==========================================
    // Valid Moves & Shuffle
    // ==========================================

    hasValidMoves() {
        for (let y=0;y<this.height;y++) for (let x=0;x<this.width;x++) {
            if (x<this.width-1) { this.swap(x,y,x+1,y); if(this.findMatches().length>0){this.swap(x,y,x+1,y);return true;} this.swap(x,y,x+1,y); }
            if (y<this.height-1) { this.swap(x,y,x,y+1); if(this.findMatches().length>0){this.swap(x,y,x,y+1);return true;} this.swap(x,y,x,y+1); }
        }
        return false;
    }

    findValidMove() {
        for (let y=0;y<this.height;y++) for (let x=0;x<this.width;x++) {
            if (x<this.width-1) { this.swap(x,y,x+1,y); if(this.findMatches().length>0){this.swap(x,y,x+1,y);return[{x,y},{x:x+1,y}];} this.swap(x,y,x+1,y); }
            if (y<this.height-1) { this.swap(x,y,x,y+1); if(this.findMatches().length>0){this.swap(x,y,x,y+1);return[{x,y},{x,y:y+1}];} this.swap(x,y,x,y+1); }
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
        const adjusted = Math.floor(points * this.scoreMultiplier);
        this.score += adjusted;

        const boardEl = document.getElementById('game-board');
        if (boardEl) {
            const r = boardEl.getBoundingClientRect();
            // Show multiplier if active
            const text = this.scoreMultiplier > 1 ? `+${adjusted} (x${this.scoreMultiplier})` : `+${adjusted}`;
            const color = this.scoreMultiplier > 1 ? '#ff8800' : '#ffd700';
            Particles.floatingText(r.left+r.width/2, r.top+r.height/2, text, color);
        }

        // Boss damage
        if (this.isBossLevel && Boss.currentBoss) Boss.dealDamage(adjusted);
    }

    updateObjective(gemType, specialType = null) {
        this.objectives.forEach((obj, i) => {
            switch (obj.type) {
                case OBJECTIVE_TYPES.SCORE: this.objectiveProgress[i] = this.score; break;
                case OBJECTIVE_TYPES.CLEAR:
                    if (obj.gem === gemType || obj.gem === 'any') this.objectiveProgress[i]++;
                    break;
                case OBJECTIVE_TYPES.COMBO: this.objectiveProgress[i] = Math.max(this.objectiveProgress[i], this.combo); break;
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

        // 🔥 Screen shake — intensity scales with combo
        this.screenShake(Math.min(this.combo * 2, 12), 200 + this.combo * 50);

        // 🎆 Particle burst at board center
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

        // 🔊 Vibration escalation
        if (this.combo >= 2) Utils.vibrate(20 + this.combo * 15);
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
        if (movesEl) movesEl.textContent = this.movesLeft;

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
                return `<div class="objective ${done?'completed':''}"><span class="objective-icon">${obj.icon}</span><span class="objective-count"><span class="current">${Utils.formatNumber(Math.min(cur,tar))}</span>/${Utils.formatNumber(tar)}</span></div>`;
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

    updateBuffIndicators() {
        const container = document.getElementById('active-buffs');
        if (!container) return;
        const buffs = Estate.getActiveBuffs();
        if (buffs.length === 0) { container.style.display = 'none'; return; }
        container.style.display = 'flex';
        container.innerHTML = buffs.map(b => {
            switch(b) {
                case 'start_bomb': return '<span class="buff-icon" title="开局炸弹">🌟</span>';
                case 'extra_moves': return '<span class="buff-icon" title="额外步数">🌙</span>';
                case 'rainbow_4': return '<span class="buff-icon" title="4消彩虹">🌈</span>';
                case 'score_multiplier': return '<span class="buff-icon" title="1.2x分数">✨</span>';
                default: return '';
            }
        }).join('');
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
        const stars = this.calculateStars();
        const goldReward = Math.floor(this.score / 100) + stars * 50;
        Storage.completedLevel(this.level.id, stars, this.score);
        Storage.addScore(this.score);
        Storage.addGold(goldReward);
        Storage.addExp(this.score / 10);
        Storage.recordGame(true);
        Estate.addHappiness(10 + stars * 5);
        const gameTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
        Storage.addPlayTime(gameTime);
        Achievements.check('win', this.level.id, { noPowerup: this.powerupsUsed===0, time: gameTime });
        Achievements.check('level_complete', this.level.id);
        Achievements.check('score', this.score);
        Achievements.check('stars', Storage.getTotalStars());
        if (stars === 3) Achievements.check('perfect');
        Collection.checkUnlock('level_complete', {level: this.level.id});
        Audio.play('victory');
        UI.showVictory(stars, this.score, this.maxCombo, goldReward);
        Particles.confetti();
    }

    defeat() {
        this.isGameOver = true;
        if (this.timerInterval) clearInterval(this.timerInterval);
        Storage.recordGame(false);
        Storage.addPlayTime(Math.floor((Date.now()-this.gameStartTime)/1000));
        Achievements.check('game');
        Audio.play('defeat');
        let totalProg = 0;
        if (this.isBossLevel && Boss.currentBoss) {
            totalProg = 1 - (Boss.bossHP / Boss.bossMaxHP);
        } else {
            this.objectives.forEach((obj,i) => { totalProg += Math.min(this.objectiveProgress[i]/obj.target, 1); });
            totalProg /= this.objectives.length;
        }
        UI.showDefeat(this.score, Math.floor(totalProg * 100));
    }

    calculateStars() {
        const t = this.level.stars;
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
        if (gem.special !== this.SPECIAL_TYPES.NONE) await this.activateSpecial(x, y, gem.special);
        this.board[y][x] = null;
        if (this.cellStates[y][x]) { this.cellStates[y][x].frozen = false; this.cellStates[y][x].locked = 0; }
        this.updateObjective(gem.type);
        const c = this.getCell(x,y);
        if(c) Particles.explosion(c.getBoundingClientRect().left+c.offsetWidth/2, c.getBoundingClientRect().top+c.offsetHeight/2, '#f97316');
        this.render(); await Utils.wait(200);
        await this.dropGems(); await this.fillGems(); await this.processMatches();
        this.isProcessing = false; this.updateUI(); this.checkGameOver();
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
        if (!auto) UI.showToast('💡 看这里！');
    }
    clearHint() { for (const {x,y} of this.hintCells) { const c = this.getCell(x,y); if(c) c.classList.remove('hint'); } this.hintCells = []; }

    // Pause/Resume/Restart/Quit
    pause() { this.isPaused = true; if (this.hintTimer) clearTimeout(this.hintTimer); }
    resume() { this.isPaused = false; this.startHintTimer(); }
    restart() { this.init(this.level.id); }
    quit() { if (this.hintTimer) clearTimeout(this.hintTimer); if (this.timerInterval) clearInterval(this.timerInterval); Boss.reset(); }
}

const game = new Game();
