/* ==========================================
   芒果庄园 - 庄园系统 (P0-1 & P0-2)
   Estate System: Trees → Buffs + Spirit Skills
   ========================================== */

const Estate = {
    // Tree definitions - planting gives permanent buffs
    TREES: {
        golden_mango: {
            id: 'golden_mango', name: '金芒树', emoji: '🌟',
            description: '开局自带1个炸弹宝石',
            cost: 500, buff: 'start_bomb',
            buffDesc: '每关开始时随机放置1个炸弹宝石',
            growthTime: '传说中金色芒果的母树，果实能引发爆炸般的能量'
        },
        moonlight: {
            id: 'moonlight', name: '月光树', emoji: '🌙',
            description: '每关多2步',
            cost: 800, buff: 'extra_moves',
            buffDesc: '每关额外获得2步移动机会',
            growthTime: '月光下生长的神秘树木，能延缓时间的流逝'
        },
        rainbow: {
            id: 'rainbow', name: '彩虹树', emoji: '🌈',
            description: '4消就出彩虹宝石',
            cost: 1200, buff: 'rainbow_4',
            buffDesc: '连接4个即可创建彩虹宝石（原需5个）',
            growthTime: '七色光芒的圣树，让普通的连接也能绽放彩虹'
        }
    },

    // Spirit definitions - determine skill bar ultimate
    SPIRITS: {
        mango_fairy: {
            id: 'mango_fairy', name: '芒果仙子', emoji: '🧚',
            description: '随机变出3个炸弹',
            skillName: '芒果轰炸', unlockCost: 0,
            lore: '芒果庄园最古老的精灵，掌握着爆炸的奥秘'
        },
        bee_spirit: {
            id: 'bee_spirit', name: '蜜蜂精灵', emoji: '🐝',
            description: '清除一整行',
            skillName: '蜂群横扫', unlockCost: 600,
            lore: '勤劳的蜜蜂精灵，能召唤蜂群横扫一切'
        },
        rainbow_spirit: {
            id: 'rainbow_spirit', name: '彩虹精灵', emoji: '🦋',
            description: '消除场上最多的同色宝石',
            skillName: '彩虹裁决', unlockCost: 1000,
            lore: '虹光化身的蝴蝶精灵，一挥翅膀便是彩虹风暴'
        }
    },

    // Get all active buffs as an array of buff names
    getActiveBuffs() {
        const estate = Storage.getEstate();
        const buffs = [];
        for (const treeId in this.TREES) {
            if (estate.trees[treeId]) {
                buffs.push(this.TREES[treeId].buff);
            }
        }
        if (estate.happiness > 200) buffs.push('score_multiplier');
        return buffs;
    },

    hasBuff(buffName) {
        return this.getActiveBuffs().includes(buffName);
    },

    getScoreMultiplier() {
        return Storage.getEstate().happiness > 200 ? 1.2 : 1.0;
    },

    plantTree(treeId) {
        const tree = this.TREES[treeId];
        if (!tree) return false;
        const estate = Storage.getEstate();
        if (estate.trees[treeId]) { UI.showToast('已经种过了！'); return false; }
        if (!Storage.spendGold(tree.cost)) { UI.showToast('金币不足！'); return false; }
        estate.trees[treeId] = true;
        estate.happiness += 50;
        Storage.saveEstate(estate);
        Audio.play('levelUp');
        UI.showToast(`🌱 ${tree.name}种植成功！`);
        Achievements.check('collection');
        return true;
    },

    isTreePlanted(treeId) {
        return Storage.getEstate().trees[treeId] === true;
    },

    selectSpirit(spiritId) {
        const spirit = this.SPIRITS[spiritId];
        if (!spirit) return false;
        const estate = Storage.getEstate();
        if (!estate.spirits[spiritId] && spirit.unlockCost > 0) {
            if (!Storage.spendGold(spirit.unlockCost)) { UI.showToast('金币不足！'); return false; }
            estate.spirits[spiritId] = true;
            UI.showToast(`🎉 ${spirit.name}已解锁！`);
        }
        estate.activeSpirit = spiritId;
        Storage.saveEstate(estate);
        Audio.play('click');
        return true;
    },

    isSpiritUnlocked(spiritId) {
        const estate = Storage.getEstate();
        return estate.spirits[spiritId] === true;
    },

    getCurrentSpirit() {
        const estate = Storage.getEstate();
        return this.SPIRITS[estate.activeSpirit] || this.SPIRITS.mango_fairy;
    },

    addHappiness(amount) {
        const estate = Storage.getEstate();
        estate.happiness = Math.max(0, estate.happiness + amount);
        Storage.saveEstate(estate);
    },

    getHappiness() {
        return Storage.getEstate().happiness;
    }
};
