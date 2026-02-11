/* ==========================================
   芒果庄园 - 核心游戏逻辑
   Mango Paradise - Core Game Logic
   高质量三消游戏引擎
   ========================================== */

class Game {
    constructor() {
        this.board = [];
        this.width = 8;
        this.height = 8;
        this.gems = [];
        this.level = null;
        this.score = 0;
        this.movesLeft = 0;
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
        
        // 特殊宝石类型
        this.SPECIAL_TYPES = {
            NONE: 'none',
            HORIZONTAL: 'horizontal',
            VERTICAL: 'vertical',
            BOMB: 'bomb',
            RAINBOW: 'rainbow'
        };
        
        // 分数配置
        this.SCORES = {
            MATCH_3: 50,
            MATCH_4: 100,
            MATCH_5: 200,
            MATCH_6: 500,
            COMBO_BONUS: 25,
            SPECIAL_ACTIVATE: 150,
            SPECIAL_COMBO: 500
        };
    }

    // 初始化游戏
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
        
        // 初始化目标进度
        this.objectives = Utils.deepClone(this.level.objectives);
        this.objectiveProgress = {};
        this.objectives.forEach((obj, i) => {
            this.objectiveProgress[i] = 0;
        });
        
        // 创建棋盘
        this.createBoard();
        
        // 确保初始棋盘没有配对
        this.ensureNoInitialMatches();
        
        // 渲染棋盘
        this.render();
        
        // 更新 UI
        this.updateUI();
        
        // 开始提示计时器
        this.startHintTimer();
        
        Utils.log.info(`Game initialized: Level ${levelId}`);
        
        return this;
    }

    // 创建棋盘
    createBoard() {
        this.board = [];
        for (let y = 0; y < this.height; y++) {
            this.board[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.board[y][x] = this.createGem(x, y);
            }
        }
    }

    // 创建单个宝石
    createGem(x, y, gemType = null) {
        const type = gemType || Utils.randomChoice(this.gems);
        return {
            type,
            special: this.SPECIAL_TYPES.NONE,
            x,
            y,
            id: Utils.generateId()
        };
    }

    // 确保初始棋盘没有配对
    ensureNoInitialMatches() {
        let hasMatches = true;
        let attempts = 0;
        const maxAttempts = 100;
        
        while (hasMatches && attempts < maxAttempts) {
            hasMatches = false;
            attempts++;
            
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    // 检查横向
                    if (x >= 2) {
                        if (this.board[y][x].type === this.board[y][x-1].type &&
                            this.board[y][x].type === this.board[y][x-2].type) {
                            this.board[y][x] = this.createGem(x, y);
                            hasMatches = true;
                        }
                    }
                    // 检查纵向
                    if (y >= 2) {
                        if (this.board[y][x].type === this.board[y-1][x].type &&
                            this.board[y][x].type === this.board[y-2][x].type) {
                            this.board[y][x] = this.createGem(x, y);
                            hasMatches = true;
                        }
                    }
                }
            }
        }
    }

    // 渲染棋盘
    render() {
        const boardEl = document.getElementById('game-board');
        if (!boardEl) return;
        
        boardEl.style.gridTemplateColumns = `repeat(${this.width}, var(--cell-size))`;
        boardEl.innerHTML = '';
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const gem = this.board[y][x];
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                
                if (gem) {
                    const gemEl = this.createGemElement(gem);
                    cell.appendChild(gemEl);
                }
                
                // 添加事件监听
                cell.addEventListener('click', (e) => this.onCellClick(x, y));
                cell.addEventListener('touchstart', (e) => this.onTouchStart(e, x, y), { passive: false });
                cell.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
                cell.addEventListener('touchend', (e) => this.onTouchEnd(e, x, y), { passive: false });
                
                boardEl.appendChild(cell);
            }
        }
    }

    // 创建宝石元素
    createGemElement(gem) {
        const gemEl = document.createElement('div');
        gemEl.className = 'gem';
        gemEl.dataset.type = gem.type;
        gemEl.dataset.id = gem.id;
        
        const gemData = GEM_TYPES[gem.type];
        gemEl.textContent = gemData ? gemData.emoji : '❓';
        
        if (gem.special !== this.SPECIAL_TYPES.NONE) {
            gemEl.classList.add('special', gem.special);
        }
        
        return gemEl;
    }

    // 更新单个格子
    updateCell(x, y) {
        const cell = this.getCell(x, y);
        if (!cell) return;
        
        cell.innerHTML = '';
        const gem = this.board[y][x];
        
        if (gem) {
            const gemEl = this.createGemElement(gem);
            cell.appendChild(gemEl);
        }
    }

    // 获取格子元素
    getCell(x, y) {
        return document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
    }

    // 获取宝石元素
    getGemElement(x, y) {
        const cell = this.getCell(x, y);
        return cell ? cell.querySelector('.gem') : null;
    }

    // 触摸事件处理
    touchStartX = 0;
    touchStartY = 0;
    touchStartCell = null;

    onTouchStart(e, x, y) {
        if (this.isProcessing || this.isPaused || this.isGameOver) return;
        
        const touch = e.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
        this.touchStartCell = { x, y };
    }

    onTouchMove(e) {
        if (!this.touchStartCell) return;
        e.preventDefault();
    }

    onTouchEnd(e, x, y) {
        if (!this.touchStartCell || this.isProcessing) return;
        
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - this.touchStartX;
        const deltaY = touch.clientY - this.touchStartY;
        const threshold = 30;
        
        if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
            // 滑动操作
            let targetX = this.touchStartCell.x;
            let targetY = this.touchStartCell.y;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                targetX += deltaX > 0 ? 1 : -1;
            } else {
                targetY += deltaY > 0 ? 1 : -1;
            }
            
            if (this.isValidCell(targetX, targetY)) {
                this.trySwap(this.touchStartCell.x, this.touchStartCell.y, targetX, targetY);
            }
        } else {
            // 点击操作
            this.onCellClick(x, y);
        }
        
        this.touchStartCell = null;
    }

    // 点击格子
    onCellClick(x, y) {
        if (this.isProcessing || this.isPaused || this.isGameOver) return;
        
        // 道具模式
        if (this.powerupMode) {
            this.usePowerup(x, y);
            return;
        }
        
        // 清除提示
        this.clearHint();
        
        if (this.selectedCell) {
            const { x: sx, y: sy } = this.selectedCell;
            
            // 点击同一个格子，取消选择
            if (sx === x && sy === y) {
                this.deselectCell();
                return;
            }
            
            // 检查是否相邻
            if (this.isAdjacent(sx, sy, x, y)) {
                this.trySwap(sx, sy, x, y);
            } else {
                // 选择新格子
                this.deselectCell();
                this.selectCell(x, y);
            }
        } else {
            this.selectCell(x, y);
        }
    }

    // 选择格子
    selectCell(x, y) {
        this.selectedCell = { x, y };
        const cell = this.getCell(x, y);
        if (cell) {
            cell.classList.add('selected');
            const gem = cell.querySelector('.gem');
            if (gem) gem.classList.add('selected');
        }
        Audio.play('click');
    }

    // 取消选择
    deselectCell() {
        if (this.selectedCell) {
            const { x, y } = this.selectedCell;
            const cell = this.getCell(x, y);
            if (cell) {
                cell.classList.remove('selected');
                const gem = cell.querySelector('.gem');
                if (gem) gem.classList.remove('selected');
            }
        }
        this.selectedCell = null;
    }

    // 检查是否相邻
    isAdjacent(x1, y1, x2, y2) {
        return (Math.abs(x1 - x2) === 1 && y1 === y2) ||
               (Math.abs(y1 - y2) === 1 && x1 === x2);
    }

    // 检查格子是否有效
    isValidCell(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    // 尝试交换
    async trySwap(x1, y1, x2, y2) {
        this.deselectCell();
        this.isProcessing = true;
        this.resetHintTimer();
        
        // 执行交换动画
        await this.animateSwap(x1, y1, x2, y2);
        
        // 实际交换
        this.swap(x1, y1, x2, y2);
        
        // 检查是否有配对
        const matches = this.findMatches();
        
        if (matches.length > 0 || this.hasSpecialSwap(x1, y1, x2, y2)) {
            // 有效移动
            this.movesLeft--;
            Audio.play('swap');
            Utils.vibrate(30);
            
            // 处理特殊宝石组合
            if (this.hasSpecialSwap(x1, y1, x2, y2)) {
                await this.processSpecialSwap(x1, y1, x2, y2);
            }
            
            // 处理消除
            await this.processMatches();
        } else {
            // 无效移动，交换回来
            Audio.play('invalid');
            Utils.vibrate([50, 50, 50]);
            
            const cell1 = this.getCell(x1, y1);
            const cell2 = this.getCell(x2, y2);
            if (cell1) cell1.classList.add('invalid');
            if (cell2) cell2.classList.add('invalid');
            
            await Utils.wait(200);
            
            if (cell1) cell1.classList.remove('invalid');
            if (cell2) cell2.classList.remove('invalid');
            
            await this.animateSwap(x1, y1, x2, y2);
            this.swap(x1, y1, x2, y2);
        }
        
        this.updateUI();
        this.isProcessing = false;
        
        // 检查游戏结束
        this.checkGameOver();
    }

    // 交换宝石
    swap(x1, y1, x2, y2) {
        const temp = this.board[y1][x1];
        this.board[y1][x1] = this.board[y2][x2];
        this.board[y2][x2] = temp;
        
        if (this.board[y1][x1]) {
            this.board[y1][x1].x = x1;
            this.board[y1][x1].y = y1;
        }
        if (this.board[y2][x2]) {
            this.board[y2][x2].x = x2;
            this.board[y2][x2].y = y2;
        }
        
        this.updateCell(x1, y1);
        this.updateCell(x2, y2);
    }

    // 交换动画
    async animateSwap(x1, y1, x2, y2) {
        const gem1 = this.getGemElement(x1, y1);
        const gem2 = this.getGemElement(x2, y2);
        
        if (!gem1 || !gem2) return;
        
        const dx = (x2 - x1) * 100;
        const dy = (y2 - y1) * 100;
        
        gem1.style.transition = 'transform 0.2s ease';
        gem2.style.transition = 'transform 0.2s ease';
        
        gem1.style.transform = `translate(${dx}%, ${dy}%)`;
        gem2.style.transform = `translate(${-dx}%, ${-dy}%)`;
        
        await Utils.wait(200);
        
        gem1.style.transition = '';
        gem2.style.transition = '';
        gem1.style.transform = '';
        gem2.style.transform = '';
    }

    // 检查是否有特殊宝石交换
    hasSpecialSwap(x1, y1, x2, y2) {
        const gem1 = this.board[y1][x1];
        const gem2 = this.board[y2][x2];
        return (gem1 && gem1.special === this.SPECIAL_TYPES.RAINBOW) ||
               (gem2 && gem2.special === this.SPECIAL_TYPES.RAINBOW);
    }

    // 处理特殊宝石交换
    async processSpecialSwap(x1, y1, x2, y2) {
        const gem1 = this.board[y1][x1];
        const gem2 = this.board[y2][x2];
        
        let rainbowGem = null;
        let targetGem = null;
        let rainbowPos = null;
        
        if (gem1 && gem1.special === this.SPECIAL_TYPES.RAINBOW) {
            rainbowGem = gem1;
            targetGem = gem2;
            rainbowPos = { x: x1, y: y1 };
        } else if (gem2 && gem2.special === this.SPECIAL_TYPES.RAINBOW) {
            rainbowGem = gem2;
            targetGem = gem1;
            rainbowPos = { x: x2, y: y2 };
        }
        
        if (!rainbowGem || !targetGem) return;
        
        // 彩虹宝石 + 彩虹宝石 = 全屏消除
        if (targetGem.special === this.SPECIAL_TYPES.RAINBOW) {
            Audio.play('special');
            await this.clearAllGems();
            Collection.checkUnlock('special_combo', { type: 'double_rainbow' });
            return;
        }
        
        // 彩虹宝石 + 普通宝石 = 消除所有该类型
        Audio.play('special');
        
        const cell = this.getCell(rainbowPos.x, rainbowPos.y);
        if (cell) {
            Particles.rainbow(
                cell.getBoundingClientRect().left + cell.offsetWidth / 2,
                cell.getBoundingClientRect().top + cell.offsetHeight / 2
            );
        }
        
        await this.clearGemType(targetGem.type);
        
        // 移除彩虹宝石
        this.board[rainbowPos.y][rainbowPos.x] = null;
        this.updateCell(rainbowPos.x, rainbowPos.y);
        
        this.addScore(this.SCORES.SPECIAL_COMBO);
        Collection.checkUnlock('special_combo');
    }

    // 清除所有宝石
    async clearAllGems() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.board[y][x]) {
                    this.addScore(50);
                    this.updateObjective(this.board[y][x].type);
                    this.board[y][x] = null;
                    
                    const cell = this.getCell(x, y);
                    if (cell) {
                        Particles.burst(
                            cell.getBoundingClientRect().left + cell.offsetWidth / 2,
                            cell.getBoundingClientRect().top + cell.offsetHeight / 2,
                            '#ffd700'
                        );
                    }
                }
            }
        }
        
        this.render();
        await Utils.wait(300);
    }

    // 清除指定类型宝石
    async clearGemType(type) {
        const cellsToClear = [];
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const gem = this.board[y][x];
                if (gem && gem.type === type) {
                    cellsToClear.push({ x, y, gem });
                }
            }
        }
        
        for (const { x, y, gem } of cellsToClear) {
            this.addScore(100);
            this.updateObjective(gem.type);
            this.board[y][x] = null;
            
            const cell = this.getCell(x, y);
            if (cell) {
                const gemData = GEM_TYPES[gem.type];
                Particles.burst(
                    cell.getBoundingClientRect().left + cell.offsetWidth / 2,
                    cell.getBoundingClientRect().top + cell.offsetHeight / 2,
                    gemData ? gemData.color : '#fff'
                );
            }
            
            await Utils.wait(30);
        }
        
        this.render();
    }

    // 查找所有配对
    findMatches() {
        const matches = [];
        const checked = new Set();
        
        // 横向检查
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width - 2; x++) {
                const gem = this.board[y][x];
                if (!gem) continue;
                
                let count = 1;
                while (x + count < this.width && 
                       this.board[y][x + count] && 
                       this.board[y][x + count].type === gem.type) {
                    count++;
                }
                
                if (count >= 3) {
                    const match = [];
                    for (let i = 0; i < count; i++) {
                        const key = `${x + i},${y}`;
                        if (!checked.has(key)) {
                            match.push({ x: x + i, y, gem: this.board[y][x + i] });
                            checked.add(key);
                        }
                    }
                    if (match.length >= 3) {
                        matches.push({ cells: match, type: gem.type, direction: 'horizontal' });
                    }
                }
            }
        }
        
        // 纵向检查
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height - 2; y++) {
                const gem = this.board[y][x];
                if (!gem) continue;
                
                let count = 1;
                while (y + count < this.height && 
                       this.board[y + count][x] && 
                       this.board[y + count][x].type === gem.type) {
                    count++;
                }
                
                if (count >= 3) {
                    const match = [];
                    for (let i = 0; i < count; i++) {
                        const key = `${x},${y + i}`;
                        if (!checked.has(key)) {
                            match.push({ x, y: y + i, gem: this.board[y + i][x] });
                            checked.add(key);
                        }
                    }
                    if (match.length >= 3) {
                        matches.push({ cells: match, type: gem.type, direction: 'vertical' });
                    }
                }
            }
        }
        
        return this.mergeMatches(matches);
    }

    // 合并相邻的配对（用于检测 L 型和 T 型）
    mergeMatches(matches) {
        // 简单实现：按类型分组，检查是否有交叉
        const byType = {};
        
        for (const match of matches) {
            if (!byType[match.type]) {
                byType[match.type] = [];
            }
            byType[match.type].push(match);
        }
        
        const result = [];
        
        for (const type in byType) {
            const typeMatches = byType[type];
            if (typeMatches.length === 1) {
                result.push(typeMatches[0]);
            } else {
                // 检查是否可以合并
                const allCells = new Map();
                for (const match of typeMatches) {
                    for (const cell of match.cells) {
                        const key = `${cell.x},${cell.y}`;
                        if (!allCells.has(key)) {
                            allCells.set(key, cell);
                        }
                    }
                }
                
                // 检查是否有交叉点
                let hasIntersection = false;
                for (const match1 of typeMatches) {
                    for (const match2 of typeMatches) {
                        if (match1 === match2) continue;
                        for (const c1 of match1.cells) {
                            for (const c2 of match2.cells) {
                                if (c1.x === c2.x && c1.y === c2.y) {
                                    hasIntersection = true;
                                    break;
                                }
                            }
                            if (hasIntersection) break;
                        }
                        if (hasIntersection) break;
                    }
                    if (hasIntersection) break;
                }
                
                if (hasIntersection) {
                    // 合并为一个大配对
                    result.push({
                        cells: Array.from(allCells.values()),
                        type,
                        direction: 'cross'
                    });
                } else {
                    // 保持分开
                    result.push(...typeMatches);
                }
            }
        }
        
        return result;
    }

    // 处理配对消除
    async processMatches() {
        let hasMatches = true;
        this.combo = 0;
        
        while (hasMatches) {
            const matches = this.findMatches();
            
            if (matches.length === 0) {
                hasMatches = false;
                break;
            }
            
            this.combo++;
            if (this.combo > this.maxCombo) {
                this.maxCombo = this.combo;
                Storage.updateMaxCombo(this.maxCombo);
            }
            
            // 显示连击
            if (this.combo > 1) {
                this.showCombo();
                Audio.play('combo');
            }
            
            // 处理每个配对
            for (const match of matches) {
                await this.processMatch(match);
            }
            
            // 检查成就
            Achievements.check('combo', this.combo);
            
            // 等待动画
            await Utils.wait(200);
            
            // 掉落填充
            await this.dropGems();
            await this.fillGems();
            
            this.updateUI();
        }
        
        this.combo = 0;
        
        // 检查是否还有可行移动
        if (!this.hasValidMoves()) {
            await this.shuffleBoard();
        }
    }

    // 处理单个配对
    async processMatch(match) {
        const count = match.cells.length;
        let specialType = this.SPECIAL_TYPES.NONE;
        let specialPosition = null;
        
        // 确定特殊宝石类型
        if (count === 4) {
            specialType = match.direction === 'horizontal' ? 
                this.SPECIAL_TYPES.VERTICAL : this.SPECIAL_TYPES.HORIZONTAL;
            specialPosition = match.cells[1]; // 中间位置
            
            Collection.checkUnlock('special_create', { 
                specialType: match.direction === 'horizontal' ? 'vertical' : 'horizontal' 
            });
        } else if (count >= 5) {
            if (match.direction === 'cross') {
                specialType = this.SPECIAL_TYPES.BOMB;
                // 找交叉点
                specialPosition = match.cells[Math.floor(match.cells.length / 2)];
                Collection.checkUnlock('special_create', { specialType: 'bomb' });
            } else {
                specialType = this.SPECIAL_TYPES.RAINBOW;
                specialPosition = match.cells[2];
                Collection.checkUnlock('special_create', { specialType: 'rainbow' });
                Achievements.check('rainbow');
            }
        }
        
        // 计算分数
        let score = 0;
        switch (count) {
            case 3: score = this.SCORES.MATCH_3; break;
            case 4: score = this.SCORES.MATCH_4; break;
            case 5: score = this.SCORES.MATCH_5; break;
            default: score = this.SCORES.MATCH_6; break;
        }
        score += this.SCORES.COMBO_BONUS * (this.combo - 1);
        this.addScore(score);
        
        // 播放音效
        if (count >= 5) {
            Audio.play('match5');
        } else if (count >= 4) {
            Audio.play('match4');
        } else {
            Audio.play('match3');
        }
        
        // 消除动画
        for (const cell of match.cells) {
            const { x, y, gem } = cell;
            
            // 更新目标进度
            this.updateObjective(gem.type);
            Collection.checkUnlock('gem_match', { gemType: gem.type });
            Achievements.check('collect', 1, { gem: gem.type });
            
            // 检查是否激活特殊宝石
            if (gem.special !== this.SPECIAL_TYPES.NONE) {
                await this.activateSpecial(x, y, gem.special);
            }
            
            // 如果是创建特殊宝石的位置，跳过消除
            if (specialPosition && x === specialPosition.x && y === specialPosition.y) {
                continue;
            }
            
            // 消除
            this.board[y][x] = null;
            
            // 粒子效果
            const cellEl = this.getCell(x, y);
            if (cellEl) {
                const gemData = GEM_TYPES[gem.type];
                Particles.burst(
                    cellEl.getBoundingClientRect().left + cellEl.offsetWidth / 2,
                    cellEl.getBoundingClientRect().top + cellEl.offsetHeight / 2,
                    gemData ? gemData.color : '#fff'
                );
            }
        }
        
        // 创建特殊宝石
        if (specialType !== this.SPECIAL_TYPES.NONE && specialPosition) {
            const { x, y } = specialPosition;
            this.board[y][x] = {
                type: match.type,
                special: specialType,
                x,
                y,
                id: Utils.generateId()
            };
            
            Audio.play('special');
            Storage.data.statistics.specialGemsCreated++;
            Achievements.check('special');
            
            this.updateObjective('special', specialType);
        }
        
        // 更新显示
        this.render();
        
        Storage.addMatch();
        Achievements.check('match');
    }

    // 激活特殊宝石
    async activateSpecial(x, y, specialType) {
        const cell = this.getCell(x, y);
        const cellRect = cell ? cell.getBoundingClientRect() : { left: 0, top: 0 };
        
        Audio.play('explosion');
        this.addScore(this.SCORES.SPECIAL_ACTIVATE);
        
        switch (specialType) {
            case this.SPECIAL_TYPES.HORIZONTAL:
                // 清除整行
                Particles.lineHorizontal(
                    cellRect.top + cellRect.height / 2,
                    0,
                    window.innerWidth,
                    '#3b82f6'
                );
                for (let i = 0; i < this.width; i++) {
                    if (this.board[y][i]) {
                        this.updateObjective(this.board[y][i].type);
                        this.board[y][i] = null;
                        this.addScore(50);
                    }
                }
                break;
                
            case this.SPECIAL_TYPES.VERTICAL:
                // 清除整列
                Particles.lineVertical(
                    cellRect.left + cellRect.width / 2,
                    0,
                    window.innerHeight,
                    '#3b82f6'
                );
                for (let i = 0; i < this.height; i++) {
                    if (this.board[i][x]) {
                        this.updateObjective(this.board[i][x].type);
                        this.board[i][x] = null;
                        this.addScore(50);
                    }
                }
                break;
                
            case this.SPECIAL_TYPES.BOMB:
                // 3x3 爆炸
                Particles.explosion(
                    cellRect.left + cellRect.width / 2,
                    cellRect.top + cellRect.height / 2,
                    '#ef4444'
                );
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const nx = x + dx;
                        const ny = y + dy;
                        if (this.isValidCell(nx, ny) && this.board[ny][nx]) {
                            this.updateObjective(this.board[ny][nx].type);
                            this.board[ny][nx] = null;
                            this.addScore(50);
                        }
                    }
                }
                break;
        }
        
        await Utils.wait(200);
        this.render();
    }

    // 宝石掉落
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
                        dropped = true;
                    }
                    emptyY--;
                }
            }
        }
        
        if (dropped) {
            this.render();
            Audio.play('cascade');
            await Utils.wait(200);
        }
    }

    // 填充新宝石
    async fillGems() {
        let filled = false;
        
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                if (!this.board[y][x]) {
                    this.board[y][x] = this.createGem(x, y);
                    filled = true;
                }
            }
        }
        
        if (filled) {
            this.render();
            
            // 添加新宝石动画
            document.querySelectorAll('.gem').forEach(gem => {
                gem.classList.add('new');
                setTimeout(() => gem.classList.remove('new'), 300);
            });
            
            await Utils.wait(300);
        }
    }

    // 检查是否有有效移动
    hasValidMoves() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                // 检查向右交换
                if (x < this.width - 1) {
                    this.swap(x, y, x + 1, y);
                    const hasMatch = this.findMatches().length > 0;
                    this.swap(x, y, x + 1, y);
                    if (hasMatch) return true;
                }
                
                // 检查向下交换
                if (y < this.height - 1) {
                    this.swap(x, y, x, y + 1);
                    const hasMatch = this.findMatches().length > 0;
                    this.swap(x, y, x, y + 1);
                    if (hasMatch) return true;
                }
            }
        }
        return false;
    }

    // 找到一个有效移动（用于提示）
    findValidMove() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (x < this.width - 1) {
                    this.swap(x, y, x + 1, y);
                    const hasMatch = this.findMatches().length > 0;
                    this.swap(x, y, x + 1, y);
                    if (hasMatch) return [{ x, y }, { x: x + 1, y }];
                }
                
                if (y < this.height - 1) {
                    this.swap(x, y, x, y + 1);
                    const hasMatch = this.findMatches().length > 0;
                    this.swap(x, y, x, y + 1);
                    if (hasMatch) return [{ x, y }, { x, y: y + 1 }];
                }
            }
        }
        return null;
    }

    // 洗牌
    async shuffleBoard() {
        // 收集所有宝石
        const gems = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.board[y][x]) {
                    gems.push(this.board[y][x]);
                }
            }
        }
        
        // 打乱
        const shuffled = Utils.shuffle(gems);
        
        // 重新放置
        let index = 0;
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (index < shuffled.length) {
                    this.board[y][x] = shuffled[index];
                    this.board[y][x].x = x;
                    this.board[y][x].y = y;
                    index++;
                }
            }
        }
        
        // 确保没有配对
        this.ensureNoInitialMatches();
        
        // 确保有有效移动
        if (!this.hasValidMoves()) {
            await this.shuffleBoard();
            return;
        }
        
        this.render();
        UI.showToast('棋盘已重新洗牌！');
        Audio.play('shuffle');
        await Utils.wait(500);
    }

    // 添加分数
    addScore(points) {
        this.score += points;
        
        // 显示飘分
        const boardEl = document.getElementById('game-board');
        if (boardEl) {
            const rect = boardEl.getBoundingClientRect();
            Particles.floatingText(
                rect.left + rect.width / 2,
                rect.top + rect.height / 2,
                `+${points}`,
                '#ffd700'
            );
        }
    }

    // 更新目标进度
    updateObjective(gemType, specialType = null) {
        this.objectives.forEach((obj, i) => {
            switch (obj.type) {
                case OBJECTIVE_TYPES.SCORE:
                    this.objectiveProgress[i] = this.score;
                    break;
                    
                case OBJECTIVE_TYPES.CLEAR:
                    if (obj.gem === gemType || obj.gem === 'any') {
                        this.objectiveProgress[i]++;
                    }
                    break;
                    
                case OBJECTIVE_TYPES.COMBO:
                    this.objectiveProgress[i] = Math.max(this.objectiveProgress[i], this.combo);
                    break;
                    
                case OBJECTIVE_TYPES.SPECIAL:
                    if (specialType) {
                        if (obj.specialType === 'any' || 
                            obj.specialType === 'line' && (specialType === 'horizontal' || specialType === 'vertical') ||
                            obj.specialType === specialType) {
                            this.objectiveProgress[i]++;
                        }
                    }
                    break;
            }
        });
    }

    // 检查目标是否完成
    isObjectiveComplete(index) {
        const obj = this.objectives[index];
        return this.objectiveProgress[index] >= obj.target;
    }

    // 检查所有目标是否完成
    areAllObjectivesComplete() {
        return this.objectives.every((_, i) => this.isObjectiveComplete(i));
    }

    // 显示连击
    showCombo() {
        const display = document.getElementById('combo-display');
        const count = document.getElementById('combo-count');
        
        if (display && count) {
            count.textContent = `x${this.combo}`;
            display.style.display = 'block';
            
            // 重新触发动画
            display.style.animation = 'none';
            display.offsetHeight; // 强制重排
            display.style.animation = 'combo-pop 0.8s ease forwards';
            
            setTimeout(() => {
                display.style.display = 'none';
            }, 800);
        }
        
        // 粒子效果
        const boardEl = document.getElementById('game-board');
        if (boardEl) {
            const rect = boardEl.getBoundingClientRect();
            Particles.comboText(
                rect.left + rect.width / 2,
                rect.top + rect.height / 2,
                this.combo
            );
        }
    }

    // 更新 UI
    updateUI() {
        // 更新步数
        const movesEl = document.getElementById('moves-left');
        if (movesEl) movesEl.textContent = this.movesLeft;
        
        // 更新分数
        const scoreEl = document.getElementById('current-score');
        if (scoreEl) scoreEl.textContent = Utils.formatNumber(this.score);
        
        // 更新目标
        const objectivesEl = document.getElementById('game-objectives');
        if (objectivesEl) {
            objectivesEl.innerHTML = this.objectives.map((obj, i) => {
                const current = this.objectiveProgress[i];
                const target = obj.target;
                const complete = current >= target;
                
                return `
                    <div class="objective ${complete ? 'completed' : ''}">
                        <span class="objective-icon">${obj.icon}</span>
                        <span class="objective-count">
                            <span class="current">${Utils.formatNumber(Math.min(current, target))}</span>/${Utils.formatNumber(target)}
                        </span>
                    </div>
                `;
            }).join('');
        }
        
        // 更新道具数量
        const hammerCount = document.getElementById('hammer-count');
        const shuffleCount = document.getElementById('shuffle-count');
        const hintCount = document.getElementById('hint-count');
        
        if (hammerCount) hammerCount.textContent = Storage.getItemCount('hammer');
        if (shuffleCount) shuffleCount.textContent = Storage.getItemCount('shuffle');
        if (hintCount) hintCount.textContent = Storage.getItemCount('hint');
    }

    // 检查游戏结束
    checkGameOver() {
        if (this.isGameOver) return;
        
        if (this.areAllObjectivesComplete()) {
            this.victory();
        } else if (this.movesLeft <= 0) {
            this.defeat();
        }
    }

    // 胜利
    victory() {
        this.isGameOver = true;
        
        // 计算星星
        const stars = this.calculateStars();
        
        // 计算奖励
        const goldReward = Math.floor(this.score / 100) + stars * 50;
        
        // 保存进度
        const result = Storage.completedLevel(this.level.id, stars, this.score);
        Storage.addScore(this.score);
        Storage.addGold(goldReward);
        Storage.addExp(this.score / 10);
        Storage.recordGame(true);
        
        // 计算游戏时间
        const gameTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
        Storage.addPlayTime(gameTime);
        
        // 检查成就
        Achievements.check('win', this.level.id, {
            noPowerup: this.powerupsUsed === 0,
            time: gameTime
        });
        Achievements.check('level_complete', this.level.id);
        Achievements.check('score', this.score);
        Achievements.check('stars', Storage.getTotalStars());
        if (stars === 3) {
            Achievements.check('perfect');
        }
        
        // 检查图鉴
        Collection.checkUnlock('level_complete', { level: this.level.id });
        
        // 播放音效
        Audio.play('victory');
        
        // 显示胜利界面
        UI.showVictory(stars, this.score, this.maxCombo, goldReward);
        
        // 彩带效果
        Particles.confetti();
    }

    // 失败
    defeat() {
        this.isGameOver = true;
        
        Storage.recordGame(false);
        Storage.addPlayTime(Math.floor((Date.now() - this.gameStartTime) / 1000));
        
        Achievements.check('game');
        
        Audio.play('defeat');
        
        // 计算完成度
        let totalProgress = 0;
        this.objectives.forEach((obj, i) => {
            totalProgress += Math.min(this.objectiveProgress[i] / obj.target, 1);
        });
        const progressPercent = Math.floor((totalProgress / this.objectives.length) * 100);
        
        UI.showDefeat(this.score, progressPercent);
    }

    // 计算星星数
    calculateStars() {
        const thresholds = this.level.stars;
        if (this.score >= thresholds[2]) return 3;
        if (this.score >= thresholds[1]) return 2;
        if (this.score >= thresholds[0]) return 1;
        return 0;
    }

    // 道具相关
    activatePowerup(type) {
        if (this.isProcessing || this.isPaused || this.isGameOver) return;
        
        const count = Storage.getItemCount(type);
        if (count <= 0) {
            UI.showToast('道具不足！');
            return;
        }
        
        if (type === 'shuffle') {
            this.useShuffle();
        } else if (type === 'hint') {
            this.useHint();
        } else {
            // 需要选择目标的道具
            this.powerupMode = type;
            document.querySelectorAll('.powerup-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelector(`[data-powerup="${type}"]`)?.classList.add('active');
            UI.showToast('请选择目标');
        }
    }

    cancelPowerup() {
        this.powerupMode = null;
        document.querySelectorAll('.powerup-btn').forEach(btn => {
            btn.classList.remove('active');
        });
    }

    usePowerup(x, y) {
        if (!this.powerupMode) return;
        
        const type = this.powerupMode;
        this.cancelPowerup();
        
        if (!Storage.useItem(type)) {
            UI.showToast('道具不足！');
            return;
        }
        
        this.powerupsUsed++;
        Collection.checkUnlock('item_use', { itemId: type });
        Audio.play('powerup');
        
        switch (type) {
            case 'hammer':
                this.useHammer(x, y);
                break;
        }
        
        this.updateUI();
    }

    async useHammer(x, y) {
        const gem = this.board[y][x];
        if (!gem) return;
        
        this.isProcessing = true;
        
        // 如果是特殊宝石，激活它
        if (gem.special !== this.SPECIAL_TYPES.NONE) {
            await this.activateSpecial(x, y, gem.special);
        }
        
        this.board[y][x] = null;
        this.updateObjective(gem.type);
        
        const cell = this.getCell(x, y);
        if (cell) {
            Particles.explosion(
                cell.getBoundingClientRect().left + cell.offsetWidth / 2,
                cell.getBoundingClientRect().top + cell.offsetHeight / 2,
                '#f97316'
            );
        }
        
        this.render();
        await Utils.wait(200);
        
        await this.dropGems();
        await this.fillGems();
        await this.processMatches();
        
        this.isProcessing = false;
        this.updateUI();
        this.checkGameOver();
    }

    async useShuffle() {
        if (!Storage.useItem('shuffle')) {
            UI.showToast('道具不足！');
            return;
        }
        
        this.powerupsUsed++;
        Collection.checkUnlock('item_use', { itemId: 'shuffle' });
        Audio.play('powerup');
        
        await this.shuffleBoard();
        this.updateUI();
    }

    useHint() {
        if (!Storage.useItem('hint')) {
            UI.showToast('道具不足！');
            return;
        }
        
        this.powerupsUsed++;
        Collection.checkUnlock('item_use', { itemId: 'hint' });
        Audio.play('hint');
        
        this.showHint();
        this.updateUI();
    }

    // 提示系统
    startHintTimer() {
        this.clearHint();
        this.hintTimer = setTimeout(() => {
            if (!this.isProcessing && !this.isPaused && !this.isGameOver) {
                this.showHint(true);
            }
        }, 5000);
    }

    resetHintTimer() {
        if (this.hintTimer) {
            clearTimeout(this.hintTimer);
        }
        this.clearHint();
        this.startHintTimer();
    }

    showHint(auto = false) {
        this.clearHint();
        
        const move = this.findValidMove();
        if (!move) return;
        
        this.hintCells = move;
        
        for (const { x, y } of move) {
            const cell = this.getCell(x, y);
            if (cell) {
                cell.classList.add('hint');
            }
        }
        
        if (!auto) {
            UI.showToast('💡 看这里！');
        }
    }

    clearHint() {
        for (const { x, y } of this.hintCells) {
            const cell = this.getCell(x, y);
            if (cell) {
                cell.classList.remove('hint');
            }
        }
        this.hintCells = [];
    }

    // 暂停/继续
    pause() {
        this.isPaused = true;
        if (this.hintTimer) {
            clearTimeout(this.hintTimer);
        }
    }

    resume() {
        this.isPaused = false;
        this.startHintTimer();
    }

    // 重新开始
    restart() {
        this.init(this.level.id);
    }

    // 退出
    quit() {
        if (this.hintTimer) {
            clearTimeout(this.hintTimer);
        }
    }
}

// 全局游戏实例
const game = new Game();
