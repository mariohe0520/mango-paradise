/* ==========================================
   芒果庄园 - Boss战斗系统 (P1-1)
   Boss Battle: HP bar, damage, counterattacks
   ========================================== */

const Boss = {
    // Boss definitions keyed by level ID
    BOSSES: {
        10:  { name: '树精长老', emoji: '🌳', hp: 5000,  attack: 'ice',  interval: 3, desc: '艾尔文森林的古老守护者' },
        20:  { name: '沙漠蝎王', emoji: '🦂', hp: 8000,  attack: 'lock', interval: 3, desc: '西部荒野的霸主' },
        30:  { name: '暴风巨龙', emoji: '🐲', hp: 12000, attack: 'ice',  interval: 2, desc: '暴风城上空的阴影' },
        40:  { name: '暗影领主', emoji: '👿', hp: 18000, attack: 'both', interval: 2, desc: '诅咒之地的主宰' },
        50:  { name: '熔火之王', emoji: '🔥', hp: 25000, attack: 'both', interval: 2, desc: '燃烧平原的炎魔' },
        60:  { name: '巫妖王',   emoji: '💀', hp: 30000, attack: 'both', interval: 2, desc: '诺森德的终极霸主' },
        70:  { name: '虚空行者', emoji: '🌀', hp: 35000, attack: 'both', interval: 2, desc: '虚空深渊的使者' },
        80:  { name: '翡翠巨龙', emoji: '🐉', hp: 40000, attack: 'both', interval: 2, desc: '翡翠梦境的守望者' },
        90:  { name: '时光之龙', emoji: '⏳', hp: 45000, attack: 'both', interval: 2, desc: '时光之穴的永恒守护' },
        100: { name: '萨格拉斯', emoji: '😈', hp: 55000, attack: 'both', interval: 1, desc: '燃烧军团的堕落泰坦' }
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
        return this.bossHP <= 0 ? 'defeated' : 'alive';
    },

    counterattack(game) {
        if (!this.currentBoss) return [];
        this.movesSinceAttack++;
        if (this.movesSinceAttack < this.currentBoss.interval) return [];
        this.movesSinceAttack = 0;

        const attacks = [];
        const atkType = this.currentBoss.attack;
        const diff = Math.floor(this.currentBoss.levelId / 20) + 1;

        // Ice attack
        if (atkType === 'ice' || atkType === 'both') {
            const count = Math.min(3, diff);
            for (let i = 0; i < count; i++) {
                let attempts = 0;
                while (attempts < 20) {
                    const x = Utils.randomInt(0, game.width - 1);
                    const y = Utils.randomInt(0, game.height - 1);
                    if (game.board[y][x] && !game.cellStates[y][x].frozen && game.cellStates[y][x].locked === 0) {
                        game.cellStates[y][x].frozen = true;
                        attacks.push({ type: 'ice', x, y });
                        break;
                    }
                    attempts++;
                }
            }
        }

        // Lock attack
        if (atkType === 'lock' || (atkType === 'both' && Math.random() > 0.4)) {
            const count = Math.min(2, diff);
            for (let i = 0; i < count; i++) {
                let attempts = 0;
                while (attempts < 20) {
                    const x = Utils.randomInt(0, game.width - 1);
                    const y = Utils.randomInt(0, game.height - 1);
                    if (game.board[y][x] && !game.cellStates[y][x].frozen && game.cellStates[y][x].locked === 0) {
                        game.cellStates[y][x].locked = 2;
                        attacks.push({ type: 'lock', x, y });
                        break;
                    }
                    attempts++;
                }
            }
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
