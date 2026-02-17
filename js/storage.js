/* ==========================================
   芒果庄园 - 存档系统
   Mango Paradise - Storage System
   完整的 localStorage 存档管理
   ========================================== */

class StorageSystem {
    constructor() {
        this.STORAGE_KEY = 'mango_paradise_save';
        this.VERSION = '1.0.0';
        
        // 默认存档数据结构
        this.defaultData = {
            version: this.VERSION,
            created: Date.now(),
            lastPlayed: Date.now(),
            
            // 玩家信息
            player: {
                name: '冒险者',
                avatar: '法',
                level: 1,
                exp: 0,
                expToNext: 100,
                title: '初入芒果庄园'
            },
            
            // 货币
            currency: {
                gold: 100,
                gems: 10
            },
            
            // 游戏进度
            progress: {
                currentLevel: 1,
                maxUnlockedLevel: 1,
                totalStars: 0,
                levelsCompleted: 0,
                levelsData: {} // { levelId: { stars: 0-3, bestScore: 0, completed: false } }
            },
            
            // 道具库存
            inventory: {
                hammer: 3,      // 锤子 - 消除单个
                shuffle: 3,    // 洗牌
                hint: 5,       // 提示
                extraMoves: 2, // 额外步数
                colorBomb: 1   // 彩虹炸弹
            },
            
            // 统计数据
            statistics: {
                totalScore: 0,
                totalMatches: 0,
                totalGames: 0,
                totalWins: 0,
                totalLosses: 0,
                maxCombo: 0,
                totalPlayTime: 0, // 秒
                gemsCollected: 0,
                specialGemsCreated: 0,
                powerupsUsed: 0,
                perfectLevels: 0 // 3星关卡数
            },
            
            // 签到系统
            checkin: {
                lastCheckinDate: null,
                streak: 0,
                totalCheckins: 0,
                monthlyCheckins: [] // 当月已签到的日期
            },
            
            // 成就
            achievements: {
                unlocked: [],
                progress: {} // { achievementId: currentProgress }
            },
            
            // 图鉴
            collection: {
                creatures: [],
                items: [],
                specials: []
            },
            
            // 设置
            settings: {
                sfxEnabled: true,
                musicEnabled: true,
                volume: 80,
                vibration: true,
                particles: true,
                language: 'zh-CN'
            },
            
            // 教程
            tutorial: {
                completed: false,
                step: 0
            },
            
            // 排行榜（本地）
            leaderboard: {
                scores: [],    // [{ name, avatar, score, level, date }]
                lastUpdated: null
            },
            
            // 庄园系统
            estate: {
                trees: { golden_mango: false, moonlight: false, rainbow: false },
                spirits: { mango_fairy: true, bee_spirit: false, rainbow_spirit: false },
                activeSpirit: 'mango_fairy',
                happiness: 0
            },

            // 离线收益
            offline: {
                lastOnline: Date.now(),
                accumulatedGold: 0
            }
        };
        
        this.data = null;
    }

    // 初始化存档系统
    init() {
        this.load();
        
        // 检查离线收益
        this.calculateOfflineRewards();
        
        // 更新最后在线时间
        this.data.lastPlayed = Date.now();
        this.data.offline.lastOnline = Date.now();
        
        this.save();
        
        // 定期自动保存
        setInterval(() => this.save(), 30000); // 每30秒保存一次
        
        // 页面关闭前保存
        window.addEventListener('beforeunload', () => this.save());
        
        Utils.log.success('Storage system initialized');
        return this.data;
    }

    // 加载存档
    load() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                // 合并默认值（处理版本升级）
                this.data = this.mergeDeep(Utils.deepClone(this.defaultData), parsed);
                this.data.version = this.VERSION;
                Utils.log.info('Save data loaded');
            } else {
                this.data = Utils.deepClone(this.defaultData);
                Utils.log.info('New save created');
            }
        } catch (error) {
            Utils.log.error('Failed to load save (corrupted data, resetting):', error);
            // Backup corrupted data for potential recovery
            try { localStorage.setItem(this.STORAGE_KEY + '_corrupt_backup', localStorage.getItem(this.STORAGE_KEY) || ''); } catch(e) {}
            this.data = Utils.deepClone(this.defaultData);
        }
        return this.data;
    }

    // 保存存档
    save() {
        try {
            this.data.lastPlayed = Date.now();
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
            return true;
        } catch (error) {
            Utils.log.error('Failed to save:', error);
            return false;
        }
    }

    // 深度合并对象
    mergeDeep(target, source) {
        const output = { ...target };
        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this.isObject(source[key])) {
                    if (!(key in target)) {
                        output[key] = source[key];
                    } else {
                        output[key] = this.mergeDeep(target[key], source[key]);
                    }
                } else {
                    output[key] = source[key];
                }
            });
        }
        return output;
    }

    isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }

    // 重置存档
    reset() {
        this.data = Utils.deepClone(this.defaultData);
        this.save();
        // v10: Also reset tutorial state
        try { Tutorial.reset(); } catch(e) {}
        Utils.log.info('Save data reset');
        return this.data;
    }

    // 导出存档
    export() {
        const exportData = {
            ...this.data,
            exportDate: Date.now(),
            exportVersion: this.VERSION
        };
        const json = JSON.stringify(exportData, null, 2);
        const filename = `mango_paradise_save_${Utils.getTodayString()}.json`;
        Utils.downloadFile(json, filename);
        return json;
    }

    // 导入存档
    async import(file) {
        try {
            const content = await Utils.readFile(file);
            const importData = JSON.parse(content);
            
            // 验证数据结构
            if (!importData.version || !importData.player) {
                throw new Error('Invalid save file format');
            }
            
            this.data = this.mergeDeep(Utils.deepClone(this.defaultData), importData);
            this.data.version = this.VERSION;
            this.save();
            
            Utils.log.success('Save imported successfully');
            return true;
        } catch (error) {
            Utils.log.error('Failed to import save:', error);
            return false;
        }
    }

    // 计算离线收益
    calculateOfflineRewards() {
        const now = Date.now();
        const lastOnline = this.data.offline.lastOnline;
        const offlineTime = now - lastOnline;
        
        // 最少离线5分钟才有收益，最多计算24小时
        const minOffline = 5 * 60 * 1000;
        const maxOffline = 24 * 60 * 60 * 1000;
        
        if (offlineTime > minOffline) {
            const effectiveTime = Math.min(offlineTime, maxOffline);
            const hours = effectiveTime / (60 * 60 * 1000);
            
            // 基础收益：每小时10金币，随等级增加
            const baseRate = 10 + (this.data.player.level - 1) * 2;
            const goldEarned = Math.floor(hours * baseRate);
            
            this.data.offline.accumulatedGold = goldEarned;
            
            Utils.log.info(`Offline rewards: ${goldEarned} gold for ${Utils.formatTimeDiff(effectiveTime)}`);
        }
    }

    // 领取离线收益
    claimOfflineRewards() {
        const gold = this.data.offline.accumulatedGold;
        if (gold > 0) {
            this.addGold(gold);
            this.data.offline.accumulatedGold = 0;
            this.save();
            return gold;
        }
        return 0;
    }

    // 获取离线时间
    getOfflineTime() {
        return Date.now() - this.data.offline.lastOnline;
    }

    // ==========================================
    // 玩家相关
    // ==========================================
    
    getPlayer() {
        return this.data.player;
    }

    setPlayerName(name) {
        this.data.player.name = name.slice(0, 12);
        this.save();
    }

    setPlayerAvatar(avatar) {
        this.data.player.avatar = avatar;
        this.save();
    }

    addExp(amount) {
        this.data.player.exp += amount;
        
        // 检查升级
        while (this.data.player.exp >= this.data.player.expToNext) {
            this.data.player.exp -= this.data.player.expToNext;
            this.data.player.level++;
            this.data.player.expToNext = this.calculateExpToNext(this.data.player.level);
            
            // 升级奖励
            this.addGold(this.data.player.level * 50);
            this.addGems(5);
            
            Utils.log.info(`Level up! Now level ${this.data.player.level}`);
        }
        
        this.save();
        return this.data.player;
    }

    calculateExpToNext(level) {
        return Math.floor(100 * Math.pow(1.2, level - 1));
    }

    // ==========================================
    // 货币相关
    // ==========================================
    
    getGold() {
        return this.data.currency.gold;
    }

    getGems() {
        return this.data.currency.gems;
    }

    addGold(amount) {
        this.data.currency.gold += amount;
        // Track lifetime gold earned for achievements
        if (amount > 0) {
            if (!this.data.statistics.totalGoldEarned) this.data.statistics.totalGoldEarned = 0;
            this.data.statistics.totalGoldEarned += amount;
        }
        this.save();
        return this.data.currency.gold;
    }

    addGems(amount) {
        this.data.currency.gems += amount;
        this.save();
        return this.data.currency.gems;
    }

    spendGold(amount) {
        if (this.data.currency.gold >= amount) {
            this.data.currency.gold -= amount;
            this.save();
            return true;
        }
        return false;
    }

    spendGems(amount) {
        if (this.data.currency.gems >= amount) {
            this.data.currency.gems -= amount;
            this.save();
            return true;
        }
        return false;
    }

    // ==========================================
    // 进度相关
    // ==========================================
    
    getCurrentLevel() {
        return this.data.progress.currentLevel;
    }

    getMaxUnlockedLevel() {
        return this.data.progress.maxUnlockedLevel;
    }

    getTotalStars() {
        return this.data.progress.totalStars;
    }

    getLevelData(levelId) {
        return this.data.progress.levelsData[levelId] || { stars: 0, bestScore: 0, completed: false };
    }

    completedLevel(levelId, stars, score) {
        const current = this.getLevelData(levelId);
        const isNewBest = score > current.bestScore;
        const isNewStars = stars > current.stars;
        const isFirstCompletion = !current.completed;
        
        // 更新关卡数据
        this.data.progress.levelsData[levelId] = {
            stars: Math.max(current.stars, stars),
            bestScore: Math.max(current.bestScore, score),
            completed: true
        };
        
        // 更新总星星数
        if (isNewStars) {
            this.data.progress.totalStars += (stars - current.stars);
        }
        
        // 首次通关
        if (isFirstCompletion) {
            this.data.progress.levelsCompleted++;
            
            // 解锁下一关
            if (levelId >= this.data.progress.maxUnlockedLevel) {
                this.data.progress.maxUnlockedLevel = levelId + 1;
            }
        }
        
        // 统计
        this.data.statistics.totalWins++;
        if (stars === 3) {
            this.data.statistics.perfectLevels++;
        }
        
        this.save();
        
        return {
            isNewBest,
            isNewStars,
            isFirstCompletion,
            starsEarned: isNewStars ? stars - current.stars : 0
        };
    }

    setCurrentLevel(levelId) {
        this.data.progress.currentLevel = levelId;
        this.save();
    }

    // ==========================================
    // 道具相关
    // ==========================================
    
    getInventory() {
        return this.data.inventory;
    }

    getItemCount(itemId) {
        return this.data.inventory[itemId] || 0;
    }

    useItem(itemId) {
        if (this.data.inventory[itemId] > 0) {
            this.data.inventory[itemId]--;
            this.data.statistics.powerupsUsed++;
            this.save();
            return true;
        }
        return false;
    }

    addItem(itemId, amount = 1) {
        if (!this.data.inventory[itemId]) {
            this.data.inventory[itemId] = 0;
        }
        this.data.inventory[itemId] += amount;
        this.save();
    }

    // ==========================================
    // 统计相关
    // ==========================================
    
    getStatistics() {
        return this.data.statistics;
    }

    addScore(score) {
        this.data.statistics.totalScore += score;
        this.save();
    }

    addMatch(count = 1) {
        this.data.statistics.totalMatches += count;
    }

    recordGame(won) {
        this.data.statistics.totalGames++;
        if (!won) {
            this.data.statistics.totalLosses++;
        }
        this.save();
    }

    updateMaxCombo(combo) {
        if (combo > this.data.statistics.maxCombo) {
            this.data.statistics.maxCombo = combo;
            this.save();
        }
    }

    addPlayTime(seconds) {
        this.data.statistics.totalPlayTime += seconds;
        this.save();
    }

    // ==========================================
    // 签到相关
    // ==========================================
    
    getCheckinData() {
        return this.data.checkin;
    }

    canCheckin() {
        const today = Utils.getTodayString();
        return this.data.checkin.lastCheckinDate !== today;
    }

    doCheckin() {
        if (!this.canCheckin()) return null;
        
        const today = Utils.getTodayString();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
        
        // 检查连续签到
        if (this.data.checkin.lastCheckinDate === yesterdayStr) {
            this.data.checkin.streak++;
        } else {
            this.data.checkin.streak = 1;
        }
        
        this.data.checkin.lastCheckinDate = today;
        this.data.checkin.totalCheckins++;
        
        // 更新月度签到记录
        const currentMonth = today.substring(0, 7);
        const lastMonth = this.data.checkin.monthlyCheckins.length > 0 
            ? this.data.checkin.monthlyCheckins[0].substring(0, 7) 
            : null;
        
        if (lastMonth !== currentMonth) {
            this.data.checkin.monthlyCheckins = [];
        }
        this.data.checkin.monthlyCheckins.push(today);
        
        // 计算奖励（基于连续天数）
        const rewards = this.calculateCheckinRewards(this.data.checkin.streak);
        
        // 发放奖励
        this.addGold(rewards.gold);
        this.addGems(rewards.gems);
        rewards.items.forEach(item => this.addItem(item.id, item.amount));
        
        this.save();
        
        return {
            streak: this.data.checkin.streak,
            rewards
        };
    }

    calculateCheckinRewards(streak) {
        const dayInWeek = ((streak - 1) % 7) + 1;
        
        const rewardTable = {
            1: { gold: 100, gems: 0, items: [] },
            2: { gold: 150, gems: 0, items: [] },
            3: { gold: 200, gems: 1, items: [] },
            4: { gold: 250, gems: 0, items: [{ id: 'hint', amount: 1 }] },
            5: { gold: 300, gems: 2, items: [] },
            6: { gold: 400, gems: 0, items: [{ id: 'hammer', amount: 1 }] },
            7: { gold: 500, gems: 5, items: [{ id: 'shuffle', amount: 1 }, { id: 'hint', amount: 2 }] }
        };
        
        return rewardTable[dayInWeek];
    }

    // ==========================================
    // 成就相关
    // ==========================================
    
    getAchievements() {
        return this.data.achievements;
    }

    isAchievementUnlocked(achievementId) {
        return this.data.achievements.unlocked.includes(achievementId);
    }

    unlockAchievement(achievementId) {
        if (!this.isAchievementUnlocked(achievementId)) {
            this.data.achievements.unlocked.push(achievementId);
            this.save();
            return true;
        }
        return false;
    }

    getAchievementProgress(achievementId) {
        return this.data.achievements.progress[achievementId] || 0;
    }

    setAchievementProgress(achievementId, progress) {
        this.data.achievements.progress[achievementId] = progress;
        this.save();
    }

    // ==========================================
    // 图鉴相关
    // ==========================================
    
    getCollection() {
        return this.data.collection;
    }

    isCollected(category, itemId) {
        return this.data.collection[category]?.includes(itemId) || false;
    }

    collect(category, itemId) {
        if (!this.data.collection[category]) {
            this.data.collection[category] = [];
        }
        if (!this.data.collection[category].includes(itemId)) {
            this.data.collection[category].push(itemId);
            this.save();
            return true;
        }
        return false;
    }

    // ==========================================
    // 庄园相关
    // ==========================================

    getEstate() {
        // Defensive: ensure all required sub-objects exist (corruption recovery)
        if (!this.data.estate) this.data.estate = Utils.deepClone(this.defaultData.estate);
        const e = this.data.estate;
        if (!e.trees) e.trees = {};
        if (!e.spirits) e.spirits = { mango_fairy: true };
        if (!e.activeSpirit) e.activeSpirit = 'mango_fairy';
        if (!e.decorations) e.decorations = {};
        if (!e.treeLevels) e.treeLevels = {};
        if (!e.spiritLevels) e.spiritLevels = {};
        if (!e.spiritAffinity) e.spiritAffinity = {};
        if (!e.spiritTrialAffection) e.spiritTrialAffection = {};
        if (typeof e.happiness !== 'number') e.happiness = 0;
        return e;
    }

    saveEstate(estate) {
        this.data.estate = estate;
        this.save();
    }

    // ==========================================
    // 设置相关
    // ==========================================
    
    getSettings() {
        return this.data.settings;
    }

    updateSettings(settings) {
        this.data.settings = { ...this.data.settings, ...settings };
        this.save();
    }

    // ==========================================
    // 教程相关
    // ==========================================
    
    getTutorial() {
        return this.data.tutorial;
    }

    setTutorialStep(step) {
        this.data.tutorial.step = step;
        this.save();
    }

    completeTutorial() {
        this.data.tutorial.completed = true;
        this.save();
    }

    // ==========================================
    // 排行榜相关
    // ==========================================
    
    getLeaderboard() {
        return this.data.leaderboard.scores;
    }

    addLeaderboardEntry(score) {
        const entry = {
            name: this.data.player.name,
            avatar: this.data.player.avatar,
            score: score,
            level: this.data.player.level,
            date: Date.now()
        };
        
        this.data.leaderboard.scores.push(entry);
        
        // 排序并保留前100名
        this.data.leaderboard.scores.sort((a, b) => b.score - a.score);
        this.data.leaderboard.scores = this.data.leaderboard.scores.slice(0, 100);
        this.data.leaderboard.lastUpdated = Date.now();
        
        this.save();
        
        // 返回排名
        return this.data.leaderboard.scores.findIndex(e => e === entry) + 1;
    }
}

// 全局存档实例
const Storage = new StorageSystem();
