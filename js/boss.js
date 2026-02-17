/* ==========================================
   芒果庄园 - Boss战斗系统 (P1-1)
   Boss Battle: HP bar, damage, counterattacks
   ========================================== */

const Boss = {
    // Boss definitions keyed by level ID
    // Multi-phase bosses: each phase has different attacks, emoji, taunt
    // weakness: which spirit type deals 2x damage
    BOSSES: {
        10: {
            name: '树精长老', desc: '艾尔文森林的古老守护者', weakness: 'phoenix_spirit',
            phases: [
                { emoji: '🌳', hpPct: 1.0, attacks: ['ice'], interval: 3, taunt: '树木会记住你的傲慢！' },
                { emoji: '🌲', hpPct: 0.4, attacks: ['ice','transform'], interval: 2, taunt: '吾根深不可拔！', announce: '树精长老进入根系形态！' }
            ], hp: 5000
        },
        20: {
            name: '沙漠蝎王', desc: '西部荒野的霸主', weakness: 'frost_spirit',
            phases: [
                { emoji: '🦂', hpPct: 1.0, attacks: ['lock'], interval: 3, taunt: '我的毒液会让你动弹不得！' },
                { emoji: '🦂', hpPct: 0.3, attacks: ['lock','steal'], interval: 2, taunt: '毒性全开！', announce: '蝎王狂暴了！尾刺开始发光！' }
            ], hp: 8000
        },
        30: {
            name: '暴风巨龙', desc: '暴风城上空的阴影', weakness: 'dragon_spirit',
            phases: [
                { emoji: '🐲', hpPct: 1.0, attacks: ['ice','shuffle'], interval: 2, taunt: '暴风洗礼，凡人颤抖吧！' },
                { emoji: '🐲', hpPct: 0.5, attacks: ['ice','shuffle','transform'], interval: 2, taunt: '让暴风更猛烈些吧！', announce: '暴风巨龙展开双翼，风暴升级！' },
                { emoji: '🌪️', hpPct: 0.2, attacks: ['shuffle','shuffle','steal'], interval: 1, taunt: '我就是暴风本身！', announce: '巨龙化为风暴之体！' }
            ], hp: 12000
        },
        40: {
            name: '暗影领主', desc: '诅咒之地的主宰', weakness: 'rainbow_spirit',
            phases: [
                { emoji: '👿', hpPct: 1.0, attacks: ['lock','transform'], interval: 2, taunt: '黑暗会吞噬一切光明...' },
                { emoji: '😈', hpPct: 0.4, attacks: ['lock','transform','steal'], interval: 2, taunt: '感受绝望吧！', announce: '暗影领主揭开面具，露出真容！' }
            ], hp: 18000
        },
        50: {
            name: '熔火之王', desc: '燃烧平原的炎魔', weakness: 'frost_spirit',
            phases: [
                { emoji: '🔥', hpPct: 1.0, attacks: ['ice','lock'], interval: 2, taunt: '在烈焰中化为灰烬吧！' },
                { emoji: '🌋', hpPct: 0.5, attacks: ['lock','steal','transform'], interval: 2, taunt: '岩浆沸腾！', announce: '熔火之王坠入熔岩，浴火重生！' },
                { emoji: '☄️', hpPct: 0.15, attacks: ['ice','lock','shuffle','steal'], interval: 1, taunt: '这不是终结...是开始！', announce: '他从熔岩中升起，烈焰灌体！' }
            ], hp: 25000
        },
        60: {
            name: '巫妖王', desc: '诺森德的终极霸主', weakness: 'phoenix_spirit',
            phases: [
                { emoji: '💀', hpPct: 1.0, attacks: ['ice','lock'], interval: 2, taunt: '这里没有希望，只有永恒的寒冬。' },
                { emoji: '💀', hpPct: 0.6, attacks: ['ice','lock','transform'], interval: 2, taunt: '霜之哀伤渴望鲜血...', announce: '巫妖王拔出霜之哀伤！寒气逼人！' },
                { emoji: '👑', hpPct: 0.25, attacks: ['ice','ice','lock','steal'], interval: 1, taunt: '跪下！', announce: '巫妖王摘下头盔！"够了，不再留手。"' }
            ], hp: 30000
        },
        70: {
            name: '虚空行者', desc: '虚空深渊的使者', weakness: 'time_spirit',
            phases: [
                { emoji: '🌀', hpPct: 1.0, attacks: ['shuffle','transform'], interval: 2, taunt: '虚空会扭曲你所见的一切！' },
                { emoji: '🕳️', hpPct: 0.4, attacks: ['shuffle','transform','steal'], interval: 1, taunt: '现实正在崩塌！', announce: '虚空行者撕裂空间，维度开始扭曲！' }
            ], hp: 35000
        },
        80: {
            name: '翡翠巨龙', desc: '翡翠梦境的守望者', weakness: 'chaos_spirit',
            phases: [
                { emoji: '🐉', hpPct: 1.0, attacks: ['ice','lock','shuffle'], interval: 2, taunt: '梦境与现实的界限正在模糊...' },
                { emoji: '🐲', hpPct: 0.5, attacks: ['ice','shuffle','transform'], interval: 2, taunt: '你正在沉入梦境...', announce: '翡翠巨龙吐出梦境之息！' },
                { emoji: '💚', hpPct: 0.15, attacks: ['shuffle','shuffle','transform','steal'], interval: 1, taunt: '在梦中，我就是神。', announce: '梦境崩塌！巨龙展露真实力量！' }
            ], hp: 40000
        },
        90: {
            name: '时光之龙', desc: '时光之穴的永恒守护', weakness: 'time_spirit',
            phases: [
                { emoji: '⏳', hpPct: 1.0, attacks: ['steal','transform'], interval: 2, taunt: '时间站在我这边！' },
                { emoji: '⏰', hpPct: 0.5, attacks: ['steal','transform','ice'], interval: 2, taunt: '我加速了时间！', announce: '时光之龙扭曲时间线！一切加速！' },
                { emoji: '🕐', hpPct: 0.2, attacks: ['steal','steal','shuffle','lock'], interval: 1, taunt: '在时间的尽头，等待你的只有虚无。', announce: '时光之龙冻结时间！"这一刻，永恒。"' }
            ], hp: 45000
        },
        100: {
            name: '萨格拉斯', desc: '燃烧军团的堕落泰坦', weakness: null,
            phases: [
                { emoji: '😈', hpPct: 1.0, attacks: ['ice','lock','shuffle'], interval: 2, taunt: '小小的凡人，竟敢直面泰坦？' },
                { emoji: '👹', hpPct: 0.6, attacks: ['lock','shuffle','transform','steal'], interval: 2, taunt: '够了！让我展现真正的力量！', announce: '萨格拉斯脱去伪装！巨大的身影遮蔽天空！' },
                { emoji: '🔥', hpPct: 0.3, attacks: ['ice','lock','shuffle','transform','steal'], interval: 1, taunt: '燃烧吧！一切都将化为灰烬！', announce: '萨格拉斯拔出戈尔希法斯！大地在他脚下碎裂！' },
                { emoji: '💥', hpPct: 0.1, attacks: ['ice','lock','shuffle','transform','steal'], interval: 1, taunt: '就算倒下...我也要带走这个世界！', announce: '萨格拉斯最终形态！"这是...我最后的燃烧！"' }
            ], hp: 55000
        }
    },

    // Skull gem type — worth 0 points, placed by boss attacks
    SKULL_TYPE: 'skull',

    currentBoss: null,
    bossHP: 0,
    bossMaxHP: 0,
    movesSinceAttack: 0,
    currentPhase: 0,
    phaseAnnounced: {},
    rageMeter: 0,
    rageMax: 100,
    _skullAttackInterval: 3, // every 3 player moves, boss places skulls

    isBossLevel(levelId) { return !!this.BOSSES[levelId]; },

    init(levelId) {
        const bd = this.BOSSES[levelId];
        if (!bd) { this.currentBoss = null; return false; }
        this.currentBoss = { ...bd, levelId };
        this.bossHP = bd.hp;
        this.bossMaxHP = bd.hp;
        this.movesSinceAttack = 0;
        this.currentPhase = 0;
        this.phaseAnnounced = { 0: true };
        this._rageMode = false;
        this._saidFear = false;
        this.rageMeter = 0;
        this._skullCounter = 0;
        this.updateUI();
        this.updateRageMeterUI();
        return true;
    },

    getCurrentPhase() {
        if (!this.currentBoss || !this.currentBoss.phases) return this.currentBoss?.phases?.[0] || null;
        const hpPct = this.bossHP / this.bossMaxHP;
        for (let i = this.currentBoss.phases.length - 1; i >= 0; i--) {
            if (hpPct <= this.currentBoss.phases[i].hpPct) {
                return this.currentBoss.phases[i];
            }
        }
        return this.currentBoss.phases[0];
    },

    checkPhaseTransition() {
        if (!this.currentBoss?.phases) return null;
        const hpPct = this.bossHP / this.bossMaxHP;
        for (let i = this.currentBoss.phases.length - 1; i >= 0; i--) {
            if (hpPct <= this.currentBoss.phases[i].hpPct && !this.phaseAnnounced[i]) {
                this.phaseAnnounced[i] = true;
                this.currentPhase = i;
                return this.currentBoss.phases[i]; // Return new phase for announcement
            }
        }
        return null;
    },

    // Spirit weakness: 2x damage if using the right spirit
    getDamageMultiplier(spiritId) {
        if (this.currentBoss?.weakness && this.currentBoss.weakness === spiritId) return 2.0;
        return 1.0;
    },

    dealDamage(dmg, spiritId) {
        if (!this.currentBoss) return 'none';
        // Apply weakness multiplier
        if (spiritId) dmg = Math.floor(dmg * this.getDamageMultiplier(spiritId));
        // Apply trial boss damage bonus
        try {
            const trialBonus = Estate.getTrialBossDamageBonus();
            if (trialBonus > 0) dmg = Math.floor(dmg * (1 + trialBonus / 100));
        } catch(e) {}
        this.bossHP = Math.max(0, this.bossHP - dmg);
        // Check phase transition
        const newPhase = this.checkPhaseTransition();
        if (newPhase && newPhase.announce) {
            UI.showToast(`⚠️ ${newPhase.announce}`, 'error');
            const bossIcon = document.getElementById('boss-icon');
            if (bossIcon) bossIcon.textContent = newPhase.emoji;
        }
        this.updateUI();

        // Shake boss on hit + bounce animation
        const bossIcon = document.getElementById('boss-icon');
        if (bossIcon) {
            bossIcon.classList.remove('boss-hit', 'boss-bounce-hit');
            void bossIcon.offsetWidth;
            bossIcon.classList.add('boss-hit', 'boss-bounce-hit');
            setTimeout(() => bossIcon.classList.remove('boss-bounce-hit'), 600);
        }

        // HP bar shake when hit
        const hpBar = document.getElementById('boss-hp-fill');
        if (hpBar) {
            hpBar.classList.remove('hp-shake');
            void hpBar.offsetWidth;
            hpBar.classList.add('hp-shake');
            setTimeout(() => hpBar.classList.remove('hp-shake'), 400);
        }

        // 🔥 Floating damage number
        const bar = document.getElementById('boss-bar');
        if (bar && dmg > 0) {
            const popup = document.createElement('div');
            popup.className = 'boss-damage-popup';
            popup.textContent = `-${Utils.formatNumber(Math.round(dmg))}`;
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

        if (this.bossHP <= 0) { this._rageMode = false; this.rageMeter = 0; }
        return this.bossHP <= 0 ? 'defeated' : 'alive';
    },

    // Place skull gems on the board (skulls worth 0 points)
    placeSkullGems(game, count) {
        const placed = [];
        for (let i = 0; i < count; i++) {
            let attempts = 0;
            while (attempts++ < 30) {
                const x = Utils.randomInt(0, game.width - 1);
                const y = Utils.randomInt(0, game.height - 1);
                if (game.board[y][x] && game.board[y][x].type !== this.SKULL_TYPE
                    && game.board[y][x].special === game.SPECIAL_TYPES.NONE) {
                    game.board[y][x] = {
                        type: this.SKULL_TYPE,
                        special: game.SPECIAL_TYPES.NONE,
                        x, y,
                        id: Utils.generateId()
                    };
                    placed.push({ x, y });
                    // Track skull presence for achievement detection
                    if (game._hadSkulls !== undefined) game._hadSkulls = true;
                    break;
                }
            }
        }
        return placed;
    },

    // Boss attack animation: screen flash red + boss emoji bounce
    playAttackAnimation() {
        // Screen flash red
        const flash = document.createElement('div');
        flash.className = 'boss-attack-flash';
        flash.style.cssText = 'position:fixed;inset:0;background:rgba(239,68,68,0.35);z-index:800;pointer-events:none;animation:bossFlashRed 0.5s ease forwards;';
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 600);

        // Boss emoji bounce
        const bossIcon = document.getElementById('boss-icon');
        if (bossIcon) {
            bossIcon.classList.remove('boss-attack-bounce');
            void bossIcon.offsetWidth;
            bossIcon.classList.add('boss-attack-bounce');
            setTimeout(() => bossIcon.classList.remove('boss-attack-bounce'), 800);
        }
    },

    // Boss Ultimate: triggered at 100% rage — converts 5 gems to skulls
    bossUltimate(game) {
        if (!this.currentBoss || !game) return [];
        this.rageMeter = 0;
        this.updateRageMeterUI();

        // Big dramatic flash
        const flash = document.createElement('div');
        flash.style.cssText = 'position:fixed;inset:0;background:rgba(139,0,0,0.5);z-index:800;pointer-events:none;animation:bossFlashRed 0.8s ease forwards;';
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 900);

        const phase = this.getCurrentPhase();
        UI.showToast(`💀 ${phase?.emoji || '👹'} 终极技能！骷髅侵蚀！`, 'error');

        // Place 5 skulls
        const skulls = this.placeSkullGems(game, 5);
        game.render();
        return skulls.map(s => ({ type: 'skull_ultimate', ...s }));
    },

    // Update rage meter UI
    updateRageMeterUI() {
        const fill = document.getElementById('boss-rage-fill');
        const text = document.getElementById('boss-rage-text');
        if (fill) {
            const pct = (this.rageMeter / this.rageMax) * 100;
            fill.style.width = `${pct}%`;
            // Color escalation
            if (pct >= 80) fill.style.background = 'linear-gradient(90deg, #dc2626, #ff0000)';
            else if (pct >= 50) fill.style.background = 'linear-gradient(90deg, #f97316, #ef4444)';
            else fill.style.background = 'linear-gradient(90deg, #eab308, #f97316)';
        }
        if (text) text.textContent = `${Math.floor(this.rageMeter)}%`;
    },

    counterattack(game) {
        if (!this.currentBoss) return [];
        this.movesSinceAttack++;

        // Fill rage meter each turn (15 per turn, faster in rage mode)
        const rageGain = this._rageMode ? 25 : 15;
        this.rageMeter = Math.min(this.rageMax, this.rageMeter + rageGain);
        this.updateRageMeterUI();

        // Check for ultimate at 100% rage
        if (this.rageMeter >= this.rageMax) {
            this.playAttackAnimation();
            return this.bossUltimate(game);
        }

        const phase = this.getCurrentPhase();
        const interval = phase?.interval || 2;
        if (this.movesSinceAttack < interval) return [];
        this.movesSinceAttack = 0;

        // Play attack animation
        this.playAttackAnimation();

        const attacks = [];

        // Skull attack: every _skullAttackInterval (3) counterattacks, place 2 skull gems
        if (!this._skullCounter) this._skullCounter = 0;
        this._skullCounter++;
        if (this._skullCounter >= this._skullAttackInterval) {
            this._skullCounter = 0;
            const skullCount = this._rageMode ? 3 : 2;
            const skulls = this.placeSkullGems(game, skullCount);
            skulls.forEach(s => attacks.push({ type: 'skull', ...s }));
            if (skulls.length > 0) {
                UI.showToast(`💀 Boss放置了${skulls.length}个骷髅！`, 'error');
            }
        }
        // Pick from CURRENT PHASE's attacks (phase-specific!)
        const bossAttacks = phase?.attacks || ['ice'];
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

        // 🎭 Dynamic Boss dialogue — reacts to battle state
        const curPhase = this.getCurrentPhase();
        if (Math.random() < 0.25 || this._rageMode) {
            const hpPct = this.bossHP / this.bossMaxHP;
            const emoji = curPhase?.emoji || '👹';
            let line = curPhase?.taunt || '';
            // Boss gets SCARED when low HP
            if (hpPct < 0.15 && !this._saidFear) {
                this._saidFear = true;
                const fearLines = ['不...不可能！', '你...你到底是什么怪物？', '等等...我们可以谈谈！', '这不应该发生的...'];
                line = fearLines[Math.floor(Math.random() * fearLines.length)];
            }
            // Boss MOCKS you when you're low on moves
            else if (game.movesLeft <= 5 && !game.level?.timed) {
                const mockLines = ['就剩这几步了？哈哈哈！', '时间不多了，小虫子！', '放弃吧，你赢不了的。'];
                line = mockLines[Math.floor(Math.random() * mockLines.length)];
            }
            // Boss reacts to big combos
            else if (game.combo >= 5) {
                const shockLines = ['什...什么？！', '这个连击...！', '可恶！'];
                line = shockLines[Math.floor(Math.random() * shockLines.length)];
            }
            if (line) UI.showToast(`${emoji} "${line}"`, 'error');
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
            bar.style.transition = 'width 0.4s ease, background 0.3s';
            if (pct > 50) bar.style.background = 'linear-gradient(90deg, #22c55e, #4ade80, #86efac)';
            else if (pct > 25) bar.style.background = 'linear-gradient(90deg, #dc2626, #eab308, #facc15)';
            else bar.style.background = 'linear-gradient(90deg, #7f1d1d, #ef4444, #f87171)';
            // Add glow effect at low HP
            if (pct <= 25) bar.style.boxShadow = '0 0 8px rgba(239,68,68,0.6)';
            else bar.style.boxShadow = 'none';
        }
        if (txt) txt.textContent = `${Utils.formatNumber(Math.ceil(this.bossHP))} / ${Utils.formatNumber(this.bossMaxHP)}`;
        if (nm) nm.textContent = this.currentBoss.name;
        const phase = this.getCurrentPhase();
        if (icon) icon.textContent = phase?.emoji || this.currentBoss.phases?.[0]?.emoji || '👹';
        // Update rage meter
        this.updateRageMeterUI();
    },

    // 🏆 Boss Loot — unique rewards per boss
    LOOT: {
        10: { gold: 500,  gems: 5,  title: '森林守护者', lore: '树精长老倒下了，他的根须化为一颗翠绿的芒果种子...' },
        20: { gold: 800,  gems: 8,  title: '荒野征服者', lore: '蝎王的毒刺碎裂，沙漠中涌出清澈的泉水...' },
        30: { gold: 1200, gems: 12, title: '屠龙勇士',   lore: '暴风巨龙化为万千光点，暴风城上空重现蓝天。' },
        40: { gold: 1800, gems: 15, title: '暗影克星',   lore: '暗影消散，诅咒之地的花朵时隔百年再次绽放。' },
        50: { gold: 2500, gems: 20, title: '灭火者',     lore: '熔火之王的火焰熄灭了。但他最后说了一句："这只是序幕。"' },
        60: { gold: 3000, gems: 25, title: '巫妖王终结者', lore: '霜之哀伤坠地碎裂。诺森德的冰雪开始融化。但王座上刻着一行字："总要有人...坐在这里。"' },
        70: { gold: 3500, gems: 28, title: '虚空行者',   lore: '虚空裂缝闭合了。但你的影子里，似乎多了什么东西...' },
        80: { gold: 4000, gems: 30, title: '梦境觉醒者', lore: '翡翠巨龙安详地闭上眼。"谢谢你...让我从噩梦中醒来。"' },
        90: { gold: 4500, gems: 35, title: '时间掌控者', lore: '时光之龙消逝前说："过去的已经过去，但你改变了未来。"' },
        100: { gold: 10000, gems: 100, title: '泰坦征服者', lore: '萨格拉斯倒下的那一刻，整个世界都安静了。\n\n然后你听到远方传来鼓声。\n\n部落的鼓声。\n\n"洛克塔尔·奥加尔！"\n\n你回头，所有的精灵、所有的盟友，都在你身后。\n\n冒险结束了吗？不，这才刚刚开始。' }
    },

    getLoot(levelId) {
        const loot = this.LOOT[levelId];
        if (!loot) return null;
        // Check if already claimed
        const claimed = Storage.data?.bossLoot || {};
        if (claimed[levelId]) return { ...loot, alreadyClaimed: true };
        return loot;
    },

    claimLoot(levelId) {
        const loot = this.LOOT[levelId];
        if (!loot) return;
        if (!Storage.data.bossLoot) Storage.data.bossLoot = {};
        if (Storage.data.bossLoot[levelId]) return;
        Storage.data.bossLoot[levelId] = true;
        Storage.addGold(loot.gold);
        Storage.addGems(loot.gems);
        if (loot.title) {
            if (!Storage.data.titles) Storage.data.titles = [];
            if (!Storage.data.titles.includes(loot.title)) Storage.data.titles.push(loot.title);
        }
        Storage.save();
    },

    reset() {
        this.currentBoss = null;
        this.bossHP = 0;
        this.bossMaxHP = 0;
        this.movesSinceAttack = 0;
        this.currentPhase = 0;
        this.phaseAnnounced = {};
        this._rageMode = false;
        this._saidFear = false;
        this.rageMeter = 0;
        this._skullCounter = 0;
    }
};
