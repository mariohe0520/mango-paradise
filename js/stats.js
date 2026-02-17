/* ==========================================
   芒果庄园 - 统计系统
   Mango Paradise - Statistics System
   全面的游戏数据统计与分析
   ========================================== */

const Stats = {
    // ══════════════════════════════════════
    // Data Storage
    // ══════════════════════════════════════

    _getKey() { return 'mango_stats_v2'; },

    _getData() {
        const raw = localStorage.getItem(this._getKey());
        if (!raw) return this._createDefault();
        try {
            return { ...this._createDefault(), ...JSON.parse(raw) };
        } catch (e) {
            return this._createDefault();
        }
    },

    _save(data) {
        localStorage.setItem(this._getKey(), JSON.stringify(data));
    },

    _createDefault() {
        return {
            // Core stats
            totalLevelsCleared: 0,
            totalScore: 0,
            totalTimePlayed: 0, // seconds
            totalMoves: 0,
            totalGamesPlayed: 0,
            totalWins: 0,
            totalLosses: 0,

            // Gem stats
            gemStats: {}, // { gemType: { matched: 0, cleared: 0 } }

            // Special gem stats
            specialsCreated: { line: 0, bomb: 0, rainbow: 0, total: 0 },
            specialCombosUsed: 0,

            // Combo stats
            maxCombo: 0,
            totalCombos: 0,
            comboDistribution: {}, // { "3": count, "4": count, ... }

            // Chapter stats
            chapterStats: {}, // { chapterId: { played: 0, wins: 0, bestScore: 0 } }

            // Daily challenge stats
            dailyChallengesPlayed: 0,
            dailyChallengesWon: 0,
            dailyBestScore: 0,
            dailyCurrentStreak: 0,
            dailyBestStreak: 0,

            // Endless mode stats
            endlessTimedHighScore: 0,
            endlessTimedHighWave: 0,
            endlessSurvivalHighScore: 0,
            endlessSurvivalHighWave: 0,

            // Boss stats
            bossesDefeated: 0,
            bossAttempts: 0,
            fastestBossKill: null, // { levelId, timeMs }

            // Seasonal stats
            seasonalLevelsCompleted: 0,
            seasonalBossesDefeated: 0,

            // Time tracking
            dailyPlayTime: {}, // { "2026-02-17": seconds }
            weeklyPlayTime: {}, // { "2026-W07": seconds }
            monthlyPlayTime: {}, // { "2026-02": seconds }

            // Session tracking
            sessionStart: null,
            lastUpdate: Date.now(),
        };
    },

    // ══════════════════════════════════════
    // Recording Events
    // ══════════════════════════════════════

    recordLevelComplete(levelId, score, stars, movesUsed, timeMs) {
        const data = this._getData();
        data.totalLevelsCleared++;
        data.totalScore += score;
        data.totalWins++;
        data.totalGamesPlayed++;
        data.totalMoves += movesUsed;

        // Chapter stats
        const chapter = Math.ceil(levelId / 10);
        if (!data.chapterStats[chapter]) {
            data.chapterStats[chapter] = { played: 0, wins: 0, bestScore: 0, totalScore: 0 };
        }
        data.chapterStats[chapter].played++;
        data.chapterStats[chapter].wins++;
        data.chapterStats[chapter].bestScore = Math.max(data.chapterStats[chapter].bestScore, score);
        data.chapterStats[chapter].totalScore += score;

        this._save(data);
    },

    recordLevelFail(levelId, score, movesUsed) {
        const data = this._getData();
        data.totalGamesPlayed++;
        data.totalLosses++;
        data.totalMoves += movesUsed;
        data.totalScore += score;

        const chapter = Math.ceil(levelId / 10);
        if (!data.chapterStats[chapter]) {
            data.chapterStats[chapter] = { played: 0, wins: 0, bestScore: 0, totalScore: 0 };
        }
        data.chapterStats[chapter].played++;

        this._save(data);
    },

    recordGemMatch(gemType, count) {
        const data = this._getData();
        if (!data.gemStats[gemType]) {
            data.gemStats[gemType] = { matched: 0, cleared: 0 };
        }
        data.gemStats[gemType].matched += count;
        data.gemStats[gemType].cleared += count;
        this._save(data);
    },

    recordSpecialCreated(specialType) {
        const data = this._getData();
        if (specialType === 'horizontal' || specialType === 'vertical') {
            data.specialsCreated.line++;
        } else if (specialType === 'bomb') {
            data.specialsCreated.bomb++;
        } else if (specialType === 'rainbow') {
            data.specialsCreated.rainbow++;
        }
        data.specialsCreated.total++;
        this._save(data);
    },

    recordCombo(comboCount) {
        const data = this._getData();
        data.totalCombos++;
        data.maxCombo = Math.max(data.maxCombo, comboCount);
        const key = String(comboCount);
        data.comboDistribution[key] = (data.comboDistribution[key] || 0) + 1;
        this._save(data);
    },

    recordDailyChallenge(won, score) {
        const data = this._getData();
        data.dailyChallengesPlayed++;
        if (won) {
            data.dailyChallengesWon++;
            data.dailyBestScore = Math.max(data.dailyBestScore, score);
            data.dailyCurrentStreak++;
            data.dailyBestStreak = Math.max(data.dailyBestStreak, data.dailyCurrentStreak);
        } else {
            data.dailyCurrentStreak = 0;
        }
        this._save(data);
    },

    recordEndless(mode, score, wave) {
        const data = this._getData();
        if (mode === 'sprint' || mode === 'timed') {
            data.endlessTimedHighScore = Math.max(data.endlessTimedHighScore || 0, score);
            data.endlessTimedHighWave = Math.max(data.endlessTimedHighWave || 0, wave);
        } else if (mode === 'survival') {
            data.endlessSurvivalHighScore = Math.max(data.endlessSurvivalHighScore, score);
            data.endlessSurvivalHighWave = Math.max(data.endlessSurvivalHighWave, wave);
        }
        this._save(data);
    },

    recordBossAttempt(won) {
        const data = this._getData();
        data.bossAttempts++;
        if (won) data.bossesDefeated++;
        this._save(data);
    },

    // Time tracking
    startSession() {
        const data = this._getData();
        data.sessionStart = Date.now();
        this._save(data);
    },

    recordPlayTime(seconds) {
        const data = this._getData();
        data.totalTimePlayed += seconds;

        const now = new Date();
        const dateKey = now.toISOString().slice(0, 10);
        data.dailyPlayTime[dateKey] = (data.dailyPlayTime[dateKey] || 0) + seconds;

        // Week key
        const jan1 = new Date(now.getFullYear(), 0, 1);
        const weekNum = Math.ceil(((now - jan1) / 86400000 + jan1.getDay() + 1) / 7);
        const weekKey = `${now.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
        data.weeklyPlayTime[weekKey] = (data.weeklyPlayTime[weekKey] || 0) + seconds;

        // Month key
        const monthKey = now.toISOString().slice(0, 7);
        data.monthlyPlayTime[monthKey] = (data.monthlyPlayTime[monthKey] || 0) + seconds;

        // Clean old data (keep last 90 days, 13 weeks, 12 months)
        const dateKeys = Object.keys(data.dailyPlayTime).sort();
        while (dateKeys.length > 90) {
            delete data.dailyPlayTime[dateKeys.shift()];
        }

        this._save(data);
    },

    // ══════════════════════════════════════
    // Queries
    // ══════════════════════════════════════

    getOverview() {
        const data = this._getData();
        return {
            totalLevelsCleared: data.totalLevelsCleared,
            totalScore: data.totalScore,
            totalTimePlayed: data.totalTimePlayed,
            totalGamesPlayed: data.totalGamesPlayed,
            totalWins: data.totalWins,
            totalLosses: data.totalLosses,
            winRate: data.totalGamesPlayed > 0 ? Math.round((data.totalWins / data.totalGamesPlayed) * 100) : 0,
            maxCombo: data.maxCombo,
            totalMoves: data.totalMoves,
        };
    },

    getGemStats() {
        const data = this._getData();
        const gems = Object.entries(data.gemStats || {})
            .map(([type, stats]) => ({
                type,
                emoji: (typeof GEM_TYPES !== 'undefined' && GEM_TYPES[type]) ? GEM_TYPES[type].emoji : '?',
                name: (typeof GEM_TYPES !== 'undefined' && GEM_TYPES[type]) ? GEM_TYPES[type].name : type,
                ...stats
            }))
            .sort((a, b) => b.matched - a.matched);
        return gems;
    },

    getMostMatchedGem() {
        const gems = this.getGemStats();
        return gems.length > 0 ? gems[0] : null;
    },

    getChapterWinRates() {
        const data = this._getData();
        const results = [];
        for (let ch = 1; ch <= 10; ch++) {
            const stats = data.chapterStats[ch];
            if (stats) {
                results.push({
                    chapter: ch,
                    played: stats.played,
                    wins: stats.wins,
                    winRate: stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0,
                    bestScore: stats.bestScore,
                    avgScore: stats.played > 0 ? Math.round(stats.totalScore / stats.played) : 0,
                });
            } else {
                results.push({ chapter: ch, played: 0, wins: 0, winRate: 0, bestScore: 0, avgScore: 0 });
            }
        }
        return results;
    },

    getComboDistribution() {
        const data = this._getData();
        return data.comboDistribution || {};
    },

    getSpecialStats() {
        const data = this._getData();
        return data.specialsCreated || { line: 0, bomb: 0, rainbow: 0, total: 0 };
    },

    getDailyStats() {
        const data = this._getData();
        return {
            played: data.dailyChallengesPlayed,
            won: data.dailyChallengesWon,
            bestScore: data.dailyBestScore,
            currentStreak: data.dailyCurrentStreak,
            bestStreak: data.dailyBestStreak,
            winRate: data.dailyChallengesPlayed > 0 ? Math.round((data.dailyChallengesWon / data.dailyChallengesPlayed) * 100) : 0,
        };
    },

    getEndlessStats() {
        const data = this._getData();
        return {
            timedHighScore: data.endlessTimedHighScore,
            timedHighWave: data.endlessTimedHighWave,
            survivalHighScore: data.endlessSurvivalHighScore,
            survivalHighWave: data.endlessSurvivalHighWave,
        };
    },

    getBossStats() {
        const data = this._getData();
        return {
            defeated: data.bossesDefeated,
            attempts: data.bossAttempts,
            winRate: data.bossAttempts > 0 ? Math.round((data.bossesDefeated / data.bossAttempts) * 100) : 0,
        };
    },

    // Time trends
    getPlayTimeTrend(period) {
        const data = this._getData();
        switch (period) {
            case 'daily': {
                // Last 7 days
                const result = [];
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const key = d.toISOString().slice(0, 10);
                    const dayName = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()];
                    result.push({
                        label: `周${dayName}`,
                        key,
                        seconds: data.dailyPlayTime[key] || 0,
                    });
                }
                return result;
            }
            case 'weekly': {
                const result = [];
                const now = new Date();
                for (let i = 3; i >= 0; i--) {
                    const d = new Date(now);
                    d.setDate(d.getDate() - i * 7);
                    const jan1 = new Date(d.getFullYear(), 0, 1);
                    const weekNum = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
                    const key = `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
                    result.push({
                        label: `第${weekNum}周`,
                        key,
                        seconds: data.weeklyPlayTime[key] || 0,
                    });
                }
                return result;
            }
            case 'monthly': {
                const result = [];
                const now = new Date();
                for (let i = 5; i >= 0; i--) {
                    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    const key = d.toISOString().slice(0, 7);
                    const monthName = `${d.getMonth() + 1}月`;
                    result.push({
                        label: monthName,
                        key,
                        seconds: data.monthlyPlayTime[key] || 0,
                    });
                }
                return result;
            }
            default:
                return [];
        }
    },

    // Format seconds to readable string
    formatTime(seconds) {
        if (seconds < 60) return `${seconds}秒`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}分${seconds % 60}秒`;
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}小时${m}分`;
    },
};
