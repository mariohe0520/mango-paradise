/* ==========================================
   芒果庄园 - Boss战斗系统 (P1-1)
   Boss Battle: HP bar, damage, counterattacks
   ========================================== */

const Boss = {
    // Boss definitions keyed by level ID
    // Attack types: ice(冰冻), lock(上锁), shuffle(打乱一区域), transform(变色), steal(偷步数)
    BOSSES: {
        10:  { name: '树精长老', emoji: '🌳', hp: 5000,  attacks: ['ice'],                interval: 3, desc: '艾尔文森林的古老守护者', taunt: '树木会记住你的傲慢！' },
        20:  { name: '沙漠蝎王', emoji: '🦂', hp: 8000,  attacks: ['lock'],               interval: 3, desc: '西部荒野的霸主', taunt: '我的毒液会让你动弹不得！' },
        30:  { name: '暴风巨龙', emoji: '🐲', hp: 12000, attacks: ['ice','shuffle'],       interval: 2, desc: '暴风城上空的阴影', taunt: '暴风洗礼，凡人颤抖吧！' },
        40:  { name: '暗影领主', emoji: '👿', hp: 18000, attacks: ['lock','transform'],    interval: 2, desc: '诅咒之地的主宰', taunt: '黑暗会吞噬一切光明...' },
        50:  { name: '熔火之王', emoji: '🔥', hp: 25000, attacks: ['ice','lock','steal'],  interval: 2, desc: '燃烧平原的炎魔', taunt: '在烈焰中化为灰烬吧！' },
        60:  { name: '巫妖王',   emoji: '💀', hp: 30000, attacks: ['ice','lock','transform'], interval: 2, desc: '诺森德的终极霸主', taunt: '这里没有希望，只有永恒的寒冬。' },
        70:  { name: '虚空行者', emoji: '🌀', hp: 35000, attacks: ['shuffle','transform','steal'], interval: 2, desc: '虚空深渊的使者', taunt: '虚空会扭曲你所见的一切！' },
        80:  { name: '翡翠巨龙', emoji: '🐉', hp: 40000, attacks: ['ice','lock','shuffle'], interval: 2, desc: '翡翠梦境的守望者', taunt: '梦境与现实的界限正在模糊...' },
        90:  { name: '时光之龙', emoji: '⏳', hp: 45000, attacks: ['steal','transform','ice','lock'], interval: 2, desc: '时光之穴的永恒守护', taunt: '时间站在我这边！' },
        100: { name: '萨格拉斯', emoji: '😈', hp: 55000, attacks: ['ice','lock','shuffle','transform','steal'], interval: 1, desc: '燃烧军团的堕落泰坦', taunt: '燃烧军团万岁！这个世界将在烈焰中终结！' }
    },

    currentBoss: null,
    bossHP: 0,
    bossMaxHP: 0,
    movesSinceAttack: 0,

    isBossLevel(levelId) { return !!this.BOSSES[levelId]; },

    init(levelId) {
        const bd = this.BOSSES[levelId];
        if (!bd) { this.currentBoss = null; return false; }
        this.currentBoss = { ...bd, levelId };
        this.bossHP = bd.hp;
        this.bossMaxHP = bd.hp;
        this.movesSinceAttack = 0;
        this.updateUI();
        return true;
    },

    dealDamage(dmg) {
        if (!this.currentBoss) return 'none';
        this.bossHP = Math.max(0, this.bossHP - dmg);
        this.updateUI();

        // Shake boss on hit
        const bossIcon = document.getElementById('boss-icon');
        if (bossIcon) { bossIcon.classList.remove('boss-hit'); void bossIcon.offsetWidth; bossIcon.classList.add('boss-hit'); }

        // 🔥 Floating damage number
        const bar = document.getElementById('boss-bar');
        if (bar && dmg > 0) {
            const popup = document.createElement('div');
            popup.className = 'boss-damage-popup';
            popup.textContent = `-${Utils.formatNumber(Math.round(dmg))}`;
            // Bigger text for bigger damage
            const scale = Math.min(1 + dmg / 5000, 2.5);
            popup.style.fontSize = `${scale}rem`;
            popup.style.color = dmg > 3000 ? '#ff3333' : dmg > 1000 ? '#ff8800' : '#ffcc00';
            bar.appendChild(popup);
            setTimeout(() => popup.remove(), 1200);
        }

        // 🔥 Boss rage mode — HP below 25%, attack faster
        if (this.bossHP > 0 && this.bossHP / this.bossMaxHP < 0.25 && !this._rageMode) {
            this._rageMode = true;
            if (bossIcon) bossIcon.classList.add('boss-rage');
            const bossBar = document.getElementById('boss-bar');
            if (bossBar) bossBar.classList.add('rage-active');
        }

        if (this.bossHP <= 0) this._rageMode = false;
        return this.bossHP <= 0 ? 'defeated' : 'alive';
    },

    counterattack(game) {
        if (!this.currentBoss) return [];
        this.movesSinceAttack++;
        if (this.movesSinceAttack < this.currentBoss.interval) return [];
        this.movesSinceAttack = 0;

        const attacks = [];
        // Pick 1-2 random attack types from boss's repertoire
        const bossAttacks = this.currentBoss.attacks || ['ice'];
        const numAttacks = this._rageMode ? 2 : 1;
        const diff = Math.floor(this.currentBoss.levelId / 20) + 1;

        for (let a = 0; a < numAttacks; a++) {
            const atkType = bossAttacks[Math.floor(Math.random() * bossAttacks.length)];
            switch (atkType) {
                case 'ice': {
                    const count = Math.min(2 + diff, 5);
                    for (let i = 0; i < count; i++) {
                        let at = 0;
                        while (at++ < 20) {
                            const x = Utils.randomInt(0, game.width-1), y = Utils.randomInt(0, game.height-1);
                            if (game.board[y][x] && !game.cellStates[y]?.[x]?.frozen) {
                                if (game.cellStates[y]) game.cellStates[y][x].frozen = true;
                                attacks.push({ type: 'ice', x, y }); break;
                            }
                        }
                    }
                    break;
                }
                case 'lock': {
                    const count = Math.min(1 + diff, 4);
                    for (let i = 0; i < count; i++) {
                        let at = 0;
                        while (at++ < 20) {
                            const x = Utils.randomInt(0, game.width-1), y = Utils.randomInt(0, game.height-1);
                            if (game.board[y][x] && !game.cellStates[y]?.[x]?.locked) {
                                if (game.cellStates[y]) game.cellStates[y][x].locked = 2;
                                attacks.push({ type: 'lock', x, y }); break;
                            }
                        }
                    }
                    break;
                }
                case 'shuffle': {
                    // Shuffle a 3x3 area — disorients player
                    const cx = Utils.randomInt(1, game.width-2), cy = Utils.randomInt(1, game.height-2);
                    const cells = [];
                    for (let dy=-1; dy<=1; dy++) for (let dx=-1; dx<=1; dx++) {
                        if (game.board[cy+dy]?.[cx+dx]) cells.push({x:cx+dx, y:cy+dy, gem: game.board[cy+dy][cx+dx]});
                    }
                    // Fisher-Yates shuffle
                    for (let i = cells.length-1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i+1));
                        [cells[i].gem, cells[j].gem] = [cells[j].gem, cells[i].gem];
                    }
                    cells.forEach(c => { game.board[c.y][c.x] = c.gem; c.gem.x = c.x; c.gem.y = c.y; });
                    attacks.push({ type: 'shuffle', x: cx, y: cy });
                    break;
                }
                case 'transform': {
                    // Transform 3-5 gems to a random different type
                    const count = 3 + Math.floor(Math.random() * 3);
                    for (let i = 0; i < count; i++) {
                        let at = 0;
                        while (at++ < 20) {
                            const x = Utils.randomInt(0, game.width-1), y = Utils.randomInt(0, game.height-1);
                            if (game.board[y][x]) {
                                const types = game.gems || game.level.gems;
                                const newType = types[Math.floor(Math.random() * types.length)];
                                game.board[y][x].type = newType;
                                attacks.push({ type: 'transform', x, y }); break;
                            }
                        }
                    }
                    break;
                }
                case 'steal': {
                    // Steal 1-2 moves from player
                    const stolen = Math.min(this._rageMode ? 2 : 1, game.movesLeft - 1);
                    if (stolen > 0 && !game.level.timed) {
                        game.movesLeft -= stolen;
                        attacks.push({ type: 'steal', value: stolen });
                    }
                    break;
                }
            }
        }

        // Boss taunt (10% chance or rage mode)
        if ((Math.random() < 0.1 || this._rageMode) && this.currentBoss.taunt) {
            UI.showToast(`${this.currentBoss.emoji} "${this.currentBoss.taunt}"`, 'error');
        }

        return attacks;
    },

    updateUI() {
        const bar = document.getElementById('boss-hp-fill');
        const txt = document.getElementById('boss-hp-text');
        const nm = document.getElementById('boss-name');
        const icon = document.getElementById('boss-icon');
        if (!this.currentBoss) return;
        const pct = (this.bossHP / this.bossMaxHP) * 100;
        if (bar) {
            bar.style.width = `${pct}%`;
            if (pct > 50) bar.style.background = 'linear-gradient(90deg, #22c55e, #4ade80)';
            else if (pct > 25) bar.style.background = 'linear-gradient(90deg, #eab308, #facc15)';
            else bar.style.background = 'linear-gradient(90deg, #ef4444, #f87171)';
        }
        if (txt) txt.textContent = `${Utils.formatNumber(Math.ceil(this.bossHP))} / ${Utils.formatNumber(this.bossMaxHP)}`;
        if (nm) nm.textContent = this.currentBoss.name;
        if (icon) icon.textContent = this.currentBoss.emoji;
    },

    reset() {
        this.currentBoss = null;
        this.bossHP = 0;
        this.bossMaxHP = 0;
        this.movesSinceAttack = 0;
    }
};
