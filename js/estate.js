/* ==========================================
   芒果庄园 - 庄园系统 (Deep Edition)
   Estate: Trees (Lv1→10) + Spirits (8, upgradeable) + Decorations
   This is our CC-killer: infinite progression loop
   ========================================== */

const Estate = {
    // ── Trees: 6 trees, each upgradeable Lv1→10 ──
    TREES: {
        golden_mango: {
            id: 'golden_mango', name: '金芒树', emoji: '🌟',
            description: '开局自带炸弹宝石',
            baseCost: 500, buff: 'start_bomb',
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
            id: 'moonlight', name: '月光树', emoji: '🌙',
            description: '每关额外步数',
            baseCost: 800, buff: 'extra_moves',
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
            id: 'rainbow', name: '彩虹树', emoji: '🌈',
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
            id: 'crystal', name: '水晶树', emoji: '💎',
            description: '通关额外宝石奖励',
            baseCost: 1500, buff: 'gem_bonus',
            levels: [
                { desc: '通关+1💎', value: 1 },
                { desc: '通关+2💎', value: 2 },
                { desc: '通关+3💎', value: 3 },
                { desc: '三星通关+5💎', value: 5 },
                { desc: '三星通关+8💎', value: 8 },
            ],
            lore: '折射光芒的远古水晶'
        },
        phoenix: {
            id: 'phoenix', name: '凤凰树', emoji: '🔥',
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
            id: 'ancient', name: '远古之树', emoji: '🌳',
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
            id: 'mango_fairy', name: '芒果仙子', emoji: '🧚',
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
            id: 'bee_spirit', name: '蜜蜂精灵', emoji: '🐝',
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
            id: 'rainbow_spirit', name: '彩虹精灵', emoji: '🦋',
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
            id: 'dragon_spirit', name: '龙灵', emoji: '🐉',
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
            id: 'phoenix_spirit', name: '凤凰灵', emoji: '🔥',
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
            id: 'frost_spirit', name: '冰霜精灵', emoji: '❄️',
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
            id: 'chaos_spirit', name: '混沌精灵', emoji: '🌀',
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
        lantern: { id: 'lantern', name: '庄园灯笼', emoji: '🏮', cost: 200, happiness: 20 },
        fountain: { id: 'fountain', name: '许愿喷泉', emoji: '⛲', cost: 500, happiness: 40 },
        statue: { id: 'statue', name: '芒果雕像', emoji: '🗿', cost: 800, happiness: 60 },
        garden: { id: 'garden', name: '花园', emoji: '🌺', cost: 300, happiness: 25 },
        bridge: { id: 'bridge', name: '小桥', emoji: '🌉', cost: 600, happiness: 45 },
        windmill: { id: 'windmill', name: '风车', emoji: '🎡', cost: 1000, happiness: 70 },
        castle: { id: 'castle', name: '芒果城堡', emoji: '🏰', cost: 5000, happiness: 200 },
        dragon_nest: { id: 'dragon_nest', name: '龙巢', emoji: '🐲', cost: 3000, happiness: 120 },
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

        if (level >= tree.levels.length) { UI.showToast('已经满级了！🌟'); return false; }

        const cost = this.getTreeUpgradeCost(treeId);
        if (!Storage.spendGold(cost)) { UI.showToast('金币不足！'); return false; }

        if (level === 0) {
            estate.trees[treeId] = true;
            if (!estate.treeLevels) estate.treeLevels = {};
            estate.treeLevels[treeId] = 1;
            estate.happiness = (estate.happiness || 0) + 50;
            UI.showToast(`🌱 ${tree.name}种植成功！`);
        } else {
            if (!estate.treeLevels) estate.treeLevels = {};
            estate.treeLevels[treeId] = level + 1;
            estate.happiness = (estate.happiness || 0) + 20;
            UI.showToast(`⬆️ ${tree.name}升级到Lv.${level + 1}！`);
        }
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
            UI.showToast(`🎉 ${spirit.name}已解锁！`);
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
        if (!estate.spiritLevels) estate.spiritLevels = {};
        estate.spiritLevels[spiritId] = level + 1;
        estate.happiness = (estate.happiness || 0) + 30;
        Storage.saveEstate(estate);
        Audio.play('levelUp');
        UI.showToast(`⬆️ ${spirit.skillName}升级到Lv.${level + 1}！`);
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
        UI.showToast(`🎉 ${deco.name}已购买！幸福度+${deco.happiness}`);
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
    }
};
