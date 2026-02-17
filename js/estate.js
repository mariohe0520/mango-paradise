/* ==========================================
   芒果庄园 - 庄园系统 (Deep Edition)
   Estate: Trees (Lv1→10) + Spirits (8, upgradeable) + Decorations
   This is our CC-killer: infinite progression loop
   ========================================== */

const Estate = {
    // ── Trees: 6 trees, each upgradeable Lv1→10 ──
    TREES: {
        golden_mango: {
            id: 'golden_mango', name: '金芒树', emoji: '✦',
            description: '开局自带炸弹宝石',
            baseCost: 200, buff: 'start_bomb',
            levels: [
                { desc: '开局1个炸弹', value: 1 },
                { desc: '开局1个炸弹+更大爆炸范围', value: 1 },
                { desc: '开局2个炸弹', value: 2 },
                { desc: '开局2个炸弹+更大范围', value: 2 },
                { desc: '开局3个炸弹', value: 3 },
            ],
            lore: '传说中金色芒果的母树'
        },
        moonlight: {
            id: 'moonlight', name: '月光树', emoji: '☽',
            description: '每关额外步数',
            baseCost: 400, buff: 'extra_moves',
            levels: [
                { desc: '+2步', value: 2 },
                { desc: '+3步', value: 3 },
                { desc: '+4步', value: 4 },
                { desc: '+5步', value: 5 },
                { desc: '+6步', value: 6 },
            ],
            lore: '月光下生长的神秘树木'
        },
        rainbow: {
            id: 'rainbow', name: '彩虹树', emoji: '◇',
            description: '降低彩虹宝石需求',
            baseCost: 1200, buff: 'rainbow_4',
            levels: [
                { desc: '5消→4消出彩虹', value: 4 },
                { desc: '4消出彩虹+彩虹更强', value: 4 },
                { desc: '4消出彩虹+偶尔3消出彩虹(20%)', value: 3 },
                { desc: '3消30%出彩虹', value: 3 },
                { desc: '3消50%出彩虹', value: 3 },
            ],
            lore: '七色光芒的圣树'
        },
        crystal: {
            id: 'crystal', name: '水晶树', emoji: '◆',
            description: '通关额外宝石奖励',
            baseCost: 1500, buff: 'gem_bonus',
            levels: [
                { desc: '通关+1◆', value: 1 },
                { desc: '通关+2◆', value: 2 },
                { desc: '通关+3◆', value: 3 },
                { desc: '三星通关+5◆', value: 5 },
                { desc: '三星通关+8◆', value: 8 },
            ],
            lore: '折射光芒的远古水晶'
        },
        phoenix: {
            id: 'phoenix', name: '凤凰树', emoji: '☆',
            description: '失败时保护',
            baseCost: 2000, buff: 'second_chance',
            levels: [
                { desc: '失败时20%概率+3步', value: 20 },
                { desc: '失败时30%概率+3步', value: 30 },
                { desc: '失败时40%概率+5步', value: 40 },
                { desc: '失败时50%概率+5步', value: 50 },
                { desc: '失败时60%概率+5步', value: 60 },
            ],
            lore: '浴火重生的不死之树'
        },
        ancient: {
            id: 'ancient', name: '远古之树', emoji: '♠',
            description: '精灵技能充能加速',
            baseCost: 3000, buff: 'skill_boost',
            levels: [
                { desc: '充能+10%', value: 10 },
                { desc: '充能+20%', value: 20 },
                { desc: '充能+30%', value: 30 },
                { desc: '充能+40%', value: 40 },
                { desc: '充能+50%', value: 50 },
            ],
            lore: '世界树的分支，蕴含原始力量'
        }
    },

    // ── Spirits: 8 spirits, each with upgradeable skills ──
    SPIRITS: {
        mango_fairy: {
            id: 'mango_fairy', name: '芒果仙子', emoji: '仙',
            description: '随机清除宝石',
            skillName: '芒果轰炸', unlockCost: 0,
            skillLevels: [
                { desc: '清除10个', value: 10 },
                { desc: '清除15个', value: 15 },
                { desc: '清除20个', value: 20 },
            ],
            lore: '芒果庄园最古老的精灵'
        },
        bee_spirit: {
            id: 'bee_spirit', name: '蜜蜂精灵', emoji: '蜂',
            description: '清除行+列',
            skillName: '蜂群横扫', unlockCost: 600,
            skillLevels: [
                { desc: '清除1行+1列', value: 1 },
                { desc: '清除2行+2列', value: 2 },
                { desc: '清除3行+3列', value: 3 },
            ],
            lore: '勤劳的蜜蜂精灵'
        },
        rainbow_spirit: {
            id: 'rainbow_spirit', name: '彩虹精灵', emoji: '蝶',
            description: '消除最多的同色宝石',
            skillName: '彩虹裁决', unlockCost: 1000,
            skillLevels: [
                { desc: '清除1种颜色', value: 1 },
                { desc: '清除1种+生成3个彩虹', value: 1 },
                { desc: '清除2种颜色', value: 2 },
            ],
            lore: '虹光化身的蝴蝶精灵'
        },
        dragon_spirit: {
            id: 'dragon_spirit', name: '龙灵', emoji: '龙',
            description: '火焰横扫',
            skillName: '龙息吐焰', unlockCost: 2000,
            skillLevels: [
                { desc: '火焰清除2行', value: 2 },
                { desc: '火焰清除3行', value: 3 },
                { desc: '火焰清除3行+所有冰冻', value: 3 },
            ],
            lore: '远古巨龙的灵魂碎片'
        },
        phoenix_spirit: {
            id: 'phoenix_spirit', name: '凤凰灵', emoji: '☆',
            description: '全屏爆炸',
            skillName: '涅槃烈焰', unlockCost: 3000,
            skillLevels: [
                { desc: '3x3区域x3次爆炸', value: 3 },
                { desc: '3x3区域x5次爆炸', value: 5 },
                { desc: '全屏炸弹雨', value: 8 },
            ],
            lore: '浴火重生的凤凰之灵'
        },
        frost_spirit: {
            id: 'frost_spirit', name: '冰霜精灵', emoji: '※',
            description: '冰冻控制',
            skillName: '绝对零度', unlockCost: 1500,
            skillLevels: [
                { desc: '解除所有冰冻+清除5个', value: 5 },
                { desc: '解除所有冰冻+清除10个', value: 10 },
                { desc: '解除所有冰冻+冻结Boss2回合', value: 15 },
            ],
            lore: '极地冰原的精灵守护者'
        },
        time_spirit: {
            id: 'time_spirit', name: '时光精灵', emoji: '⏳',
            description: '时间操控',
            skillName: '时光倒流', unlockCost: 2500,
            skillLevels: [
                { desc: '+5步', value: 5 },
                { desc: '+5步+随机3个特殊宝石', value: 5 },
                { desc: '+8步+随机5个特殊宝石', value: 8 },
            ],
            lore: '能操控时间的神秘精灵'
        },
        chaos_spirit: {
            id: 'chaos_spirit', name: '混沌精灵', emoji: '◎',
            description: '随机强力效果',
            skillName: '混沌风暴', unlockCost: 5000,
            skillLevels: [
                { desc: '随机发动1个其他精灵技能', value: 1 },
                { desc: '随机发动2个其他精灵技能', value: 2 },
                { desc: '随机发动3个其他精灵技能', value: 3 },
            ],
            lore: '混沌之力的化身，不可预测'
        }
    },

    // ── Decorations: collectible cosmetic items ──
    DECORATIONS: {
        mango_banner: { id: 'mango_banner', name: '庄园旗帜', emoji: '▶', cost: 100, happiness: 15 },
        lantern: { id: 'lantern', name: '庄园灯笼', emoji: '◆', cost: 200, happiness: 20 },
        garden: { id: 'garden', name: '芒果花园', emoji: '✿', cost: 300, happiness: 25 },
        totem: { id: 'totem', name: '守护图腾', emoji: '↯', cost: 400, happiness: 30 },
        fountain: { id: 'fountain', name: '许愿喷泉', emoji: '≈', cost: 500, happiness: 40 },
        bridge: { id: 'bridge', name: '小桥', emoji: '♜', cost: 600, happiness: 45 },
        statue: { id: 'statue', name: '芒果之神像', emoji: '♜', cost: 800, happiness: 60 },
        windmill: { id: 'windmill', name: '热带风车', emoji: '◇', cost: 1000, happiness: 70 },
        treehouse: { id: 'treehouse', name: '芒果树屋', emoji: '♠', cost: 1500, happiness: 85 },
        drum: { id: 'drum', name: '丰收之鼓', emoji: '♪', cost: 2000, happiness: 100 },
        dragon_nest: { id: 'dragon_nest', name: '龙巢', emoji: '龙', cost: 3000, happiness: 120 },
        paradise_gate: { id: 'paradise_gate', name: '芒果天堂之门', emoji: '♜', cost: 5000, happiness: 200 },
    },

    // ── Core Methods ──

    getTreeLevel(treeId) {
        const estate = Storage.getEstate();
        if (!estate.trees[treeId]) return 0;
        return estate.treeLevels?.[treeId] || 1;
    },

    getTreeBuffValue(treeId) {
        const tree = this.TREES[treeId];
        if (!tree) return 0;
        const level = this.getTreeLevel(treeId);
        if (level === 0) return 0;
        const lvlData = tree.levels[Math.min(level - 1, tree.levels.length - 1)];
        return lvlData.value;
    },

    getTreeUpgradeCost(treeId) {
        const tree = this.TREES[treeId];
        if (!tree) return 99999;
        const level = this.getTreeLevel(treeId);
        if (level === 0) return tree.baseCost; // plant
        if (level >= tree.levels.length) return -1; // maxed
        return Math.floor(tree.baseCost * (1 + level * 0.8));
    },

    plantTree(treeId) {
        const tree = this.TREES[treeId];
        if (!tree) return false;
        const estate = Storage.getEstate();
        const level = this.getTreeLevel(treeId);

        if (level >= tree.levels.length) { UI.showToast('已经满级了！✦'); return false; }

        const cost = this.getTreeUpgradeCost(treeId);
        if (!Storage.spendGold(cost)) { UI.showToast('金币不足！'); return false; }

        const newLevel = level + 1;
        if (level === 0) {
            estate.trees[treeId] = true;
            if (!estate.treeLevels) estate.treeLevels = {};
            estate.treeLevels[treeId] = 1;
            estate.happiness = (estate.happiness || 0) + 50;
        } else {
            if (!estate.treeLevels) estate.treeLevels = {};
            estate.treeLevels[treeId] = newLevel;
            estate.happiness = (estate.happiness || 0) + 20;
        }
        // ☆ Show EXACTLY what changed — feel the power
        const buffDesc = tree.levels[Math.min(newLevel-1, tree.levels.length-1)]?.desc || '';
        UI.showToast(`${tree.emoji} ${tree.name} Lv.${newLevel}！\n${buffDesc}`, 'success');
        Storage.saveEstate(estate);
        Audio.play('levelUp');
        Achievements.check('collection');
        return true;
    },

    isTreePlanted(treeId) {
        return Storage.getEstate().trees[treeId] === true;
    },

    // ── Spirit Methods ──

    getSpiritLevel(spiritId) {
        const estate = Storage.getEstate();
        if (!estate.spirits[spiritId] && this.SPIRITS[spiritId]?.unlockCost > 0) return 0;
        return estate.spiritLevels?.[spiritId] || 1;
    },

    getSpiritUpgradeCost(spiritId) {
        const spirit = this.SPIRITS[spiritId];
        if (!spirit) return 99999;
        const level = this.getSpiritLevel(spiritId);
        if (level === 0) return spirit.unlockCost;
        if (level >= spirit.skillLevels.length) return -1;
        return Math.floor(500 + level * 800);
    },

    selectSpirit(spiritId) {
        const spirit = this.SPIRITS[spiritId];
        if (!spirit) return false;
        const estate = Storage.getEstate();
        if (!estate.spirits[spiritId] && spirit.unlockCost > 0) {
            if (!Storage.spendGold(spirit.unlockCost)) { UI.showToast('金币不足！'); return false; }
            estate.spirits[spiritId] = true;
            if (!estate.spiritLevels) estate.spiritLevels = {};
            estate.spiritLevels[spiritId] = 1;
            UI.showToast(`♪ ${spirit.name}已解锁！`);
            // v10: Tutorial hint for spirit unlock
            try { Tutorial.onSpiritUnlock(); } catch(e) {}
        }
        estate.activeSpirit = spiritId;
        Storage.saveEstate(estate);
        Audio.play('click');
        return true;
    },

    upgradeSpirit(spiritId) {
        const spirit = this.SPIRITS[spiritId];
        if (!spirit) return false;
        const estate = Storage.getEstate();
        const level = this.getSpiritLevel(spiritId);
        if (level >= spirit.skillLevels.length) { UI.showToast('技能已满级！'); return false; }
        const cost = this.getSpiritUpgradeCost(spiritId);
        if (!Storage.spendGold(cost)) { UI.showToast('金币不足！'); return false; }
        const newLevel = level + 1;
        if (!estate.spiritLevels) estate.spiritLevels = {};
        estate.spiritLevels[spiritId] = newLevel;
        estate.happiness = (estate.happiness || 0) + 30;
        Storage.saveEstate(estate);
        Audio.play('levelUp');
        // ☆ Show skill upgrade details
        const skillInfo = spirit.skillLevels[Math.min(newLevel-1, spirit.skillLevels.length-1)];
        UI.showToast(`${spirit.emoji} ${spirit.skillName} Lv.${newLevel}！\n${skillInfo?.desc || ''}`, 'success');
        return true;
    },

    isSpiritUnlocked(spiritId) {
        const estate = Storage.getEstate();
        if (this.SPIRITS[spiritId]?.unlockCost === 0) return true;
        return estate.spirits[spiritId] === true;
    },

    getCurrentSpirit() {
        const estate = Storage.getEstate();
        return this.SPIRITS[estate.activeSpirit] || this.SPIRITS.mango_fairy;
    },

    // ── Decoration Methods ──

    buyDecoration(decoId) {
        const deco = this.DECORATIONS[decoId];
        if (!deco) return false;
        const estate = Storage.getEstate();
        if (!estate.decorations) estate.decorations = {};
        if (estate.decorations[decoId]) { UI.showToast('已经有了！'); return false; }
        if (!Storage.spendGold(deco.cost)) { UI.showToast('金币不足！'); return false; }
        estate.decorations[decoId] = true;
        estate.happiness = (estate.happiness || 0) + deco.happiness;
        Storage.saveEstate(estate);
        Audio.play('levelUp');
        UI.showToast(`♪ ${deco.name}已购买！幸福度+${deco.happiness}`);
        return true;
    },

    hasDecoration(decoId) {
        return Storage.getEstate().decorations?.[decoId] === true;
    },

    // ── Buff System (reads tree levels for dynamic values) ──

    getActiveBuffs() {
        const estate = Storage.getEstate();
        const buffs = [];
        for (const treeId in this.TREES) {
            if (estate.trees[treeId]) buffs.push(this.TREES[treeId].buff);
        }
        if ((estate.happiness || 0) > 200) buffs.push('score_multiplier');
        return buffs;
    },

    hasBuff(buffName) {
        return this.getActiveBuffs().includes(buffName);
    },

    getScoreMultiplier() {
        const h = Storage.getEstate().happiness || 0;
        // Scale with happiness: 200→1.2x, 500→1.5x, 1000→2.0x
        if (h >= 1000) return 2.0;
        if (h >= 500) return 1.5;
        if (h >= 200) return 1.2;
        return 1.0;
    },

    getExtraMoves() {
        return this.getTreeBuffValue('moonlight');
    },

    getStartBombs() {
        return this.getTreeBuffValue('golden_mango');
    },

    getSkillBoostPercent() {
        return this.getTreeBuffValue('ancient');
    },

    addHappiness(amount) {
        const estate = Storage.getEstate();
        estate.happiness = Math.max(0, (estate.happiness || 0) + amount);
        Storage.saveEstate(estate);
    },

    getHappiness() {
        return Storage.getEstate().happiness || 0;
    },

    // ══════════════════════════════════════
    // 仙 Spirit Affinity System — use them, they grow
    // ══════════════════════════════════════

    // Affinity thresholds and passive bonuses
    AFFINITY_LEVELS: [
        { exp: 0,   name: '初识',   bonus: null },
        { exp: 50,  name: '友好',   bonus: '充能速度+10%' },
        { exp: 150, name: '信赖',   bonus: '技能伤害+20%' },
        { exp: 350, name: '挚友',   bonus: '专属被动效果' },
        { exp: 700, name: '灵魂契约', bonus: '全属性+30%+专属特效' }
    ],

    // Passive bonuses per spirit at affinity level 3+ (挚友)
    AFFINITY_PASSIVES: {
        mango_fairy:    '每次消除芒果宝石额外+50分',
        bee_spirit:     '每回合有10%概率自动消除1个',
        rainbow_spirit: '彩虹宝石出现概率+15%',
        dragon_spirit:  '对Boss额外伤害+25%',
        phoenix_spirit: '每关额外1次复活机会',
        frost_spirit:   '冰冻格子自动减少1层',
        time_spirit:    '每5回合自动+1步',
        chaos_spirit:   '每次消除10%概率触发随机技能'
    },

    getSpiritAffinity(spiritId) {
        const estate = Storage.getEstate();
        return estate.spiritAffinity?.[spiritId] || 0;
    },

    getSpiritAffinityLevel(spiritId) {
        const exp = this.getSpiritAffinity(spiritId);
        let level = 0;
        for (let i = this.AFFINITY_LEVELS.length - 1; i >= 0; i--) {
            if (exp >= this.AFFINITY_LEVELS[i].exp) { level = i; break; }
        }
        return level;
    },

    addSpiritAffinity(spiritId, amount) {
        const estate = Storage.getEstate();
        if (!estate.spiritAffinity) estate.spiritAffinity = {};
        const before = this.getSpiritAffinityLevel(spiritId);
        estate.spiritAffinity[spiritId] = (estate.spiritAffinity[spiritId] || 0) + amount;
        Storage.saveEstate(estate);
        const after = this.getSpiritAffinityLevel(spiritId);
        if (after > before) {
            const spirit = this.SPIRITS[spiritId];
            const lvInfo = this.AFFINITY_LEVELS[after];
            UI.showToast(`♥ ${spirit?.emoji || ''} 亲密度提升！→${lvInfo.name}\n${lvInfo.bonus}`, 'success');
            Audio.play('levelUp');
            // Unlock passive at level 3
            if (after >= 3 && this.AFFINITY_PASSIVES[spiritId]) {
                UI.showToast(`✦ 解锁被动: ${this.AFFINITY_PASSIVES[spiritId]}`, 'success');
            }
        }
    },

    // Get affinity-based charge speed bonus (%)
    getAffinityChargeBonus(spiritId) {
        const level = this.getSpiritAffinityLevel(spiritId);
        if (level >= 4) return 30;
        if (level >= 1) return level * 10;
        return 0;
    },

    // Get affinity-based damage bonus (%)
    getAffinityDamageBonus(spiritId) {
        const level = this.getSpiritAffinityLevel(spiritId);
        if (level >= 4) return 30;
        if (level >= 2) return 20;
        return 0;
    },

    // Check if passive is active
    hasAffinityPassive(spiritId) {
        return this.getSpiritAffinityLevel(spiritId) >= 3;
    },

    // ══════════════════════════════════════
    // ↯ Spirit Trial System — 精灵试炼
    // ══════════════════════════════════════

    // Each spirit has a preferred gem type for trial bonus
    SPIRIT_TRIAL_DATA: {
        mango_fairy:    { preferredGem: 'mango',   gemEmoji: '芒' },
        bee_spirit:     { preferredGem: 'murloc',  gemEmoji: '蛙' },
        rainbow_spirit: { preferredGem: 'elf',     gemEmoji: '灵' },
        dragon_spirit:  { preferredGem: 'dragon',  gemEmoji: '龙' },
        phoenix_spirit: { preferredGem: 'phoenix', gemEmoji: '☆' },
        frost_spirit:   { preferredGem: 'mage',    gemEmoji: '法' },
        time_spirit:    { preferredGem: 'knight',  gemEmoji: '⛊' },
        chaos_spirit:   { preferredGem: 'orc',     gemEmoji: '鬼' }
    },

    // Affection milestones — unlock spirit abilities
    TRIAL_MILESTONES: [
        { affection: 10,  name: '初识之力',   icon: '♥' },
        { affection: 30,  name: '信任之力',   icon: '♥' },
        { affection: 50,  name: '羁绊之力',   icon: '♥' },
        { affection: 80,  name: '契约之力',   icon: '♥' },
        { affection: 100, name: '灵魂共鸣',   icon: '♥' }
    ],

    // Per-spirit abilities at milestones
    SPIRIT_ABILITIES: {
        mango_fairy: [
            { at: 10, id: 'mf_charge', name: '芒果馨香', desc: '充能+5%', type: 'charge_boost', value: 5 },
            { at: 30, id: 'mf_move', name: '仙子祝福', desc: '+1步', type: 'extra_moves', value: 1 },
            { at: 50, id: 'mf_gem', name: '芒果之心', desc: '消芒果+50分', type: 'gem_score_bonus', value: 50 },
            { at: 80, id: 'mf_combo', name: '仙子连锁', desc: '连击+20%', type: 'combo_bonus', value: 20 },
            { at: 100, id: 'mf_soul', name: '灵魂共鸣·芒果', desc: '开局+1彩虹宝石', type: 'start_rainbow', value: 1 }
        ],
        bee_spirit: [
            { at: 10, id: 'bs_charge', name: '蜂蜜能量', desc: '充能+5%', type: 'charge_boost', value: 5 },
            { at: 30, id: 'bs_move', name: '蜂群护佑', desc: '+1步', type: 'extra_moves', value: 1 },
            { at: 50, id: 'bs_gem', name: '蜂巢本能', desc: '消鱼人+50分', type: 'gem_score_bonus', value: 50 },
            { at: 80, id: 'bs_combo', name: '蜂群共振', desc: '连击+20%', type: 'combo_bonus', value: 20 },
            { at: 100, id: 'bs_soul', name: '灵魂共鸣·蜜蜂', desc: '额外+2步', type: 'extra_moves', value: 2 }
        ],
        rainbow_spirit: [
            { at: 10, id: 'rs_charge', name: '虹光脉动', desc: '充能+5%', type: 'charge_boost', value: 5 },
            { at: 30, id: 'rs_move', name: '蝶翼祝福', desc: '+1步', type: 'extra_moves', value: 1 },
            { at: 50, id: 'rs_gem', name: '彩虹之心', desc: '消精灵+50分', type: 'gem_score_bonus', value: 50 },
            { at: 80, id: 'rs_combo', name: '光谱共振', desc: '连击+20%', type: 'combo_bonus', value: 20 },
            { at: 100, id: 'rs_soul', name: '灵魂共鸣·彩虹', desc: '开局+1彩虹宝石', type: 'start_rainbow', value: 1 }
        ],
        dragon_spirit: [
            { at: 10, id: 'ds_charge', name: '龙焰余温', desc: '充能+5%', type: 'charge_boost', value: 5 },
            { at: 30, id: 'ds_move', name: '龙之庇护', desc: '+1步', type: 'extra_moves', value: 1 },
            { at: 50, id: 'ds_gem', name: '龙族之心', desc: '消巨龙+50分', type: 'gem_score_bonus', value: 50 },
            { at: 80, id: 'ds_combo', name: '龙息连锁', desc: '连击+20%', type: 'combo_bonus', value: 20 },
            { at: 100, id: 'ds_soul', name: '灵魂共鸣·龙', desc: 'Boss伤害+15%', type: 'boss_damage', value: 15 }
        ],
        phoenix_spirit: [
            { at: 10, id: 'ps_charge', name: '涅槃余焰', desc: '充能+5%', type: 'charge_boost', value: 5 },
            { at: 30, id: 'ps_move', name: '凤凰祝福', desc: '+1步', type: 'extra_moves', value: 1 },
            { at: 50, id: 'ps_gem', name: '凤凰之心', desc: '消凤凰+50分', type: 'gem_score_bonus', value: 50 },
            { at: 80, id: 'ps_combo', name: '烈焰连锁', desc: '连击+20%', type: 'combo_bonus', value: 20 },
            { at: 100, id: 'ps_soul', name: '灵魂共鸣·凤凰', desc: '复活概率+15%', type: 'revive_bonus', value: 15 }
        ],
        frost_spirit: [
            { at: 10, id: 'fs_charge', name: '冰晶脉动', desc: '充能+5%', type: 'charge_boost', value: 5 },
            { at: 30, id: 'fs_move', name: '冰霜祝福', desc: '+1步', type: 'extra_moves', value: 1 },
            { at: 50, id: 'fs_gem', name: '冰霜之心', desc: '消法师+50分', type: 'gem_score_bonus', value: 50 },
            { at: 80, id: 'fs_combo', name: '寒冰连锁', desc: '连击+20%', type: 'combo_bonus', value: 20 },
            { at: 100, id: 'fs_soul', name: '灵魂共鸣·冰霜', desc: '冰冻减少1层', type: 'defrost', value: 1 }
        ],
        time_spirit: [
            { at: 10, id: 'ts_charge', name: '时间加速', desc: '充能+5%', type: 'charge_boost', value: 5 },
            { at: 30, id: 'ts_move', name: '时光祝福', desc: '+1步', type: 'extra_moves', value: 1 },
            { at: 50, id: 'ts_gem', name: '时光之心', desc: '消骑士+50分', type: 'gem_score_bonus', value: 50 },
            { at: 80, id: 'ts_combo', name: '时间连锁', desc: '连击+20%', type: 'combo_bonus', value: 20 },
            { at: 100, id: 'ts_soul', name: '灵魂共鸣·时光', desc: '额外+2步', type: 'extra_moves', value: 2 }
        ],
        chaos_spirit: [
            { at: 10, id: 'cs_charge', name: '混沌脉动', desc: '充能+5%', type: 'charge_boost', value: 5 },
            { at: 30, id: 'cs_move', name: '混沌祝福', desc: '+1步', type: 'extra_moves', value: 1 },
            { at: 50, id: 'cs_gem', name: '混沌之心', desc: '消兽人+50分', type: 'gem_score_bonus', value: 50 },
            { at: 80, id: 'cs_combo', name: '混沌连锁', desc: '连击+20%', type: 'combo_bonus', value: 20 },
            { at: 100, id: 'cs_soul', name: '灵魂共鸣·混沌', desc: '开局+1特殊宝石', type: 'start_special', value: 1 }
        ]
    },

    // Current trial state
    _currentTrial: null,

    getSpiritTrialAffection(spiritId) {
        const estate = Storage.getEstate();
        return estate.spiritTrialAffection?.[spiritId] || 0;
    },

    addSpiritTrialAffection(spiritId, amount) {
        const estate = Storage.getEstate();
        if (!estate.spiritTrialAffection) estate.spiritTrialAffection = {};
        const before = this.getSpiritTrialAffection(spiritId);
        estate.spiritTrialAffection[spiritId] = Math.min(100, before + amount);
        Storage.saveEstate(estate);
        const after = this.getSpiritTrialAffection(spiritId);
        // Check milestone unlocks
        for (const milestone of this.TRIAL_MILESTONES) {
            if (before < milestone.affection && after >= milestone.affection) {
                const spirit = this.SPIRITS[spiritId];
                const ability = this.SPIRIT_ABILITIES[spiritId]?.find(a => a.at === milestone.affection);
                UI.showToast(`${milestone.icon} ${spirit?.emoji || ''} 亲密度${after}！\n解锁: ${ability?.name || milestone.name} — ${ability?.desc || ''}`, 'success');
                Audio.play('levelUp');
            }
        }
        return after;
    },

    getUnlockedTrialAbilities(spiritId) {
        const affection = this.getSpiritTrialAffection(spiritId);
        const abilities = this.SPIRIT_ABILITIES[spiritId];
        if (!abilities) return [];
        return abilities.filter(a => affection >= a.at);
    },

    // Start a spirit trial — special 15-move puzzle challenge
    startSpiritTrial(spiritId) {
        const spirit = this.SPIRITS[spiritId];
        const trialData = this.SPIRIT_TRIAL_DATA[spiritId];
        if (!spirit || !trialData) { UI.showToast('精灵数据错误！', 'error'); return; }
        if (!this.isSpiritUnlocked(spiritId)) { UI.showToast('请先解锁该精灵！', 'error'); return; }

        // Build gem list: ensure preferred gem is included
        const baseGems = ['murloc', 'orc', 'elf', 'mage', 'knight'];
        const gems = baseGems.includes(trialData.preferredGem)
            ? baseGems
            : [...baseGems.slice(0, 4), trialData.preferredGem];

        // Create special trial level
        const trialLevel = {
            id: 99900 + Object.keys(this.SPIRITS).indexOf(spiritId),
            chapter: 0,
            width: 8,
            height: 8,
            moves: 15,
            gems: gems,
            objectives: [{ type: 'score', target: 3000, icon: '★' }],
            stars: [1500, 2500, 3000],
            procedural: true,
            spiritTrial: true,
            trialSpiritId: spiritId,
            trialPreferredGem: trialData.preferredGem
        };

        this._currentTrial = { spiritId, preferredGem: trialData.preferredGem };
        UI.startSpecialLevel(trialLevel);
        UI.showToast(`${spirit.emoji} ${spirit.name}的试炼！\n${trialData.gemEmoji} 偏好宝石得分x2！`, 'success');
    },

    // Called when a trial ends (hooked from game victory/defeat)
    endSpiritTrial(won) {
        if (!this._currentTrial) return;
        const { spiritId } = this._currentTrial;
        const gain = won ? 10 : 2;
        const spirit = this.SPIRITS[spiritId];
        this.addSpiritTrialAffection(spiritId, gain);
        UI.showToast(won
            ? `♪ 试炼胜利！${spirit?.emoji || ''} 亲密度+${gain}`
            : `♥ 虽败犹荣！${spirit?.emoji || ''} 亲密度+${gain}`,
            won ? 'success' : 'info');
        this._currentTrial = null;
        Achievements.check('spirit_trial');
    },

    isInSpiritTrial() {
        return !!this._currentTrial;
    },

    getTrialPreferredGem() {
        return this._currentTrial?.preferredGem || null;
    },

    // Get active trial buffs for current spirit (used during normal levels)
    getTrialBuffs() {
        const estate = Storage.getEstate();
        const activeSpirit = estate.activeSpirit || 'mango_fairy';
        return this.getUnlockedTrialAbilities(activeSpirit);
    },

    getTrialExtraMoves() {
        const abilities = this.getTrialBuffs();
        return abilities.filter(a => a.type === 'extra_moves').reduce((sum, a) => sum + a.value, 0);
    },

    getTrialChargeBoost() {
        const abilities = this.getTrialBuffs();
        return abilities.filter(a => a.type === 'charge_boost').reduce((sum, a) => sum + a.value, 0);
    },

    getTrialComboBonus() {
        const abilities = this.getTrialBuffs();
        return abilities.filter(a => a.type === 'combo_bonus').reduce((sum, a) => sum + a.value, 0);
    },

    getTrialGemScoreBonus(gemType) {
        const estate = Storage.getEstate();
        const activeSpirit = estate.activeSpirit || 'mango_fairy';
        const trialData = this.SPIRIT_TRIAL_DATA[activeSpirit];
        if (!trialData || trialData.preferredGem !== gemType) return 0;
        const abilities = this.getTrialBuffs();
        return abilities.filter(a => a.type === 'gem_score_bonus').reduce((sum, a) => sum + a.value, 0);
    },

    getTrialBossDamageBonus() {
        const abilities = this.getTrialBuffs();
        return abilities.filter(a => a.type === 'boss_damage').reduce((sum, a) => sum + a.value, 0);
    },

    getTrialReviveBonus() {
        const abilities = this.getTrialBuffs();
        return abilities.filter(a => a.type === 'revive_bonus').reduce((sum, a) => sum + a.value, 0);
    },

    hasTrialStartRainbow() {
        const abilities = this.getTrialBuffs();
        return abilities.some(a => a.type === 'start_rainbow');
    },

    hasTrialStartSpecial() {
        const abilities = this.getTrialBuffs();
        return abilities.some(a => a.type === 'start_special');
    }
};
