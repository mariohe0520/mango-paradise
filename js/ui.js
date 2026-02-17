/* ==========================================
   芒果庄园 - UI 管理
   Mango Paradise - UI Manager
   界面交互和显示管理
   ========================================== */

const UI = {
    currentScreen: null,
    
    // 初始化 UI
    init() {
        this.bindEvents();
        this.updateMenuDisplay();
    },

    // 绑定事件
    bindEvents() {
        // 主菜单按钮
        document.getElementById('btn-adventure')?.addEventListener('click', () => {
            Audio.play('click');
            this.showScreen('level-select');
        });
        
        document.getElementById('btn-collection')?.addEventListener('click', () => {
            Audio.play('click');
            this.showCollection();
        });
        
        document.getElementById('btn-achievements')?.addEventListener('click', () => {
            Audio.play('click');
            this.showAchievements();
        });
        
        document.getElementById('btn-daily')?.addEventListener('click', () => {
            Audio.play('click');
            this.showDailyCheckin();
        });
        
        document.getElementById('btn-daily-challenge')?.addEventListener('click', () => {
            Audio.play('click');
            if (!DailyChallenge.canPlay()) {
                this.showToast(`今日 3 次已用完！最高分: ${Utils.formatNumber(DailyChallenge.getBestScore())} 🔥连续${DailyChallenge.getStreak()}天`, 'info');
                return;
            }
            const attemptsLeft = DailyChallenge.getAttemptsLeft();
            this.showToast(`每日挑战 (剩余${attemptsLeft}次) 🔥连续${DailyChallenge.getStreak()}天`, 'info');
            // Use LevelGen if available
            const level = typeof LevelGen !== 'undefined'
                ? LevelGen.generateDailyChallenge()
                : DailyChallenge.generate();
            this.startSpecialLevel(level);
        });

        document.getElementById('btn-endless')?.addEventListener('click', () => {
            Audio.play('click');
            this.showEndlessModePicker();
        });

        document.getElementById('btn-stats')?.addEventListener('click', () => {
            Audio.play('click');
            this.showStats();
        });

        document.getElementById('btn-seasonal')?.addEventListener('click', () => {
            Audio.play('click');
            this.showSeasonalEvents();
        });

        document.getElementById('btn-back-stats')?.addEventListener('click', () => {
            Audio.play('click');
            this.showScreen('main-menu');
        });

        document.getElementById('btn-back-seasonal')?.addEventListener('click', () => {
            Audio.play('click');
            this.showScreen('main-menu');
        });

        document.getElementById('btn-leaderboard')?.addEventListener('click', () => {
            Audio.play('click');
            this.showLeaderboard();
        });

        document.getElementById('btn-weekly')?.addEventListener('click', () => {
            Audio.play('click');
            this.showWeeklyChallenge();
        });
        
        // Boss Revenge button — show/hide based on availability
        const revengeBtn = document.getElementById('btn-revenge');
        if (revengeBtn) {
            const revenge = typeof BossRevenge !== 'undefined' ? BossRevenge.getRevengeBoss() : null;
            if (revenge) {
                revengeBtn.style.display = '';
                revengeBtn.querySelector('.btn-subtitle').textContent = `${revenge.name} 等你再战！`;
                revengeBtn.addEventListener('click', () => {
                    Audio.play('click');
                    const level = BossRevenge.generateRevengeLevel(revenge);
                    // Init revenge boss in Boss system
                    Boss.currentBoss = { ...revenge, levelId: level.id };
                    Boss.bossHP = revenge.hp;
                    Boss.bossMaxHP = revenge.hp;
                    Boss.movesSinceAttack = 0;
                    Boss.currentPhase = 0;
                    Boss.phaseAnnounced = { 0: true };
                    Boss._rageMode = false;
                    Boss._saidFear = false;
                    this.showSpiritPicker(revenge.bossLvl, () => {
                        this.doStartLevel(level.id, level);
                    });
                });
            }
        }

        document.getElementById('btn-estate')?.addEventListener('click', () => {
            Audio.play('click');
            this.showEstate();
        });

        // Season button
        const seasonBtn = document.getElementById('btn-season');
        if (seasonBtn && typeof SeasonSystem !== 'undefined') {
            const season = SeasonSystem.getCurrentSeason();
            const sub = document.getElementById('season-subtitle');
            if (sub) sub.textContent = `${season.emoji} ${season.name} · 剩${season.daysRemaining}天`;
            seasonBtn.addEventListener('click', () => {
                Audio.play('click');
                this.showSeason();
            });
        }

        document.getElementById('btn-settings')?.addEventListener('click', () => {
            Audio.play('click');
            this.showSettings();
        });

        // 返回按钮
        document.getElementById('btn-back-levels')?.addEventListener('click', () => {
            Audio.play('click');
            this.showScreen('main-menu');
        });
        
        document.getElementById('btn-back-achievements')?.addEventListener('click', () => {
            Audio.play('click');
            this.showScreen('main-menu');
        });
        
        document.getElementById('btn-back-collection')?.addEventListener('click', () => {
            Audio.play('click');
            this.showScreen('main-menu');
        });
        
        document.getElementById('btn-back-leaderboard')?.addEventListener('click', () => {
            Audio.play('click');
            this.showScreen('main-menu');
        });
        
        document.getElementById('btn-back-estate')?.addEventListener('click', () => {
            Audio.play('click');
            this.showScreen('main-menu');
        });

        document.getElementById('btn-back-settings')?.addEventListener('click', () => {
            Audio.play('click');
            this.saveSettings();
            this.showScreen('main-menu');
        });

        // 游戏控制
        document.getElementById('btn-pause')?.addEventListener('click', () => {
            Audio.play('click');
            this.showPauseMenu();
        });
        
        document.getElementById('btn-resume')?.addEventListener('click', () => {
            Audio.play('click');
            this.hidePauseMenu();
        });
        
        document.getElementById('btn-restart')?.addEventListener('click', () => {
            Audio.play('click');
            this.hidePauseMenu();
            game.restart();
        });
        
        document.getElementById('btn-quit')?.addEventListener('click', () => {
            Audio.play('click');
            this.hidePauseMenu();
            game.quit();
            this.showScreen('main-menu');
        });

        // 道具按钮
        document.getElementById('powerup-hammer')?.addEventListener('click', () => {
            game.activatePowerup('hammer');
        });
        
        document.getElementById('powerup-shuffle')?.addEventListener('click', () => {
            game.activatePowerup('shuffle');
        });
        
        document.getElementById('powerup-hint')?.addEventListener('click', () => {
            game.activatePowerup('hint');
        });

        // Skill bar
        document.getElementById('skill-activate-btn')?.addEventListener('click', () => {
            game.activateSkill();
        });

        // Story dialog — button + tap anywhere to advance
        document.getElementById('story-continue-btn')?.addEventListener('click', () => {
            this.advanceStoryDialog();
        });
        document.getElementById('story-dialog')?.addEventListener('click', (e) => {
            if (e.target.id === 'story-dialog') this.advanceStoryDialog();
        });

        // 胜利界面
        document.getElementById('btn-victory-menu')?.addEventListener('click', () => {
            Audio.play('click');
            this.hideModal('victory-screen');
            this.showScreen('main-menu');
            // v10: Tutorial hint after first level complete
            try { if (game.level && game.level.id === 1) Tutorial.onFirstLevelComplete(); } catch(e) {}
        });
        
        document.getElementById('btn-next-level')?.addEventListener('click', () => {
            Audio.play('click');
            this.hideModal('victory-screen');
            // v10: Tutorial hint after first level complete
            try { if (game.level && game.level.id === 1) Tutorial.onFirstLevelComplete(); } catch(e) {}
            // Special levels: return to menu or start next wave
            const level = game.level;
            if (level.daily || level.weekly || level.revenge) {
                this.showScreen('main-menu');
                return;
            }
            if (level.endless && typeof EndlessMode !== 'undefined') {
                const nextWave = EndlessMode.nextWave(game.score);
                this.startSpecialLevel(nextWave);
                return;
            }
            const nextLevel = level.id + 1;
            if (nextLevel <= getTotalLevels()) {
                this.startLevel(nextLevel);
            } else {
                this.showToast('恭喜通关全部关卡！');
                this.showScreen('main-menu');
            }
        });

        // 失败界面
        document.getElementById('btn-defeat-menu')?.addEventListener('click', () => {
            Audio.play('click');
            this.hideModal('defeat-screen');
            this.showScreen('main-menu');
        });
        
        document.getElementById('btn-retry')?.addEventListener('click', () => {
            Audio.play('click');
            this.hideModal('defeat-screen');
            game.restart();
        });

        // Continue with +5 moves (spend gems)
        document.getElementById('btn-continue-moves')?.addEventListener('click', () => {
            const cost = 50;
            if (Storage.getGems() < cost) {
                this.showToast('💎不够啦！通关和成就可以获得💎', 'error');
                return;
            }
            Audio.play('powerup');
            Storage.spendGems(cost);
            this.hideModal('defeat-screen');
            game.isGameOver = false;
            game.movesLeft += 5;
            game.updateUI();
            this.showToast('💎 +5步！继续加油！', 'success');
            Utils.vibrate([30, 20, 60]);
        });

        // 签到
        document.getElementById('close-daily')?.addEventListener('click', () => {
            Audio.play('click');
            this.hideModal('daily-checkin');
        });
        
        document.getElementById('btn-checkin')?.addEventListener('click', () => {
            this.doCheckin();
        });

        // 离线奖励
        document.getElementById('btn-claim-offline')?.addEventListener('click', () => {
            this.claimOfflineReward();
        });

        // 设置
        document.getElementById('setting-sfx')?.addEventListener('change', (e) => {
            Audio.setSfxEnabled(e.target.checked);
        });
        
        document.getElementById('setting-music')?.addEventListener('change', (e) => {
            Audio.setMusicEnabled(e.target.checked);
        });
        
        document.getElementById('setting-volume')?.addEventListener('input', (e) => {
            Audio.setVolume(e.target.value / 100);
        });
        
        document.getElementById('setting-name')?.addEventListener('change', (e) => {
            Storage.setPlayerName(e.target.value);
            this.updateMenuDisplay();
        });

        // 头像选择
        document.querySelectorAll('.avatar-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.avatar-option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                Storage.setPlayerAvatar(option.dataset.avatar);
                this.updateMenuDisplay();
            });
        });

        // 数据管理
        document.getElementById('btn-reset-progress')?.addEventListener('click', () => {
            if (confirm('确定要重置所有游戏进度吗？此操作不可恢复！')) {
                Storage.reset();
                this.updateMenuDisplay();
                this.showToast('进度已重置');
            }
        });
        
        document.getElementById('btn-export-save')?.addEventListener('click', () => {
            Storage.export();
            this.showToast('存档已导出');
        });
        
        document.getElementById('btn-import-save')?.addEventListener('click', () => {
            document.getElementById('import-file')?.click();
        });
        
        document.getElementById('import-file')?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                const success = await Storage.import(file);
                if (success) {
                    this.showToast('存档导入成功！');
                    this.updateMenuDisplay();
                } else {
                    this.showToast('存档导入失败', 'error');
                }
            }
        });

        // 图鉴标签
        document.querySelectorAll('.collection-tabs .tab-btn').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.collection-tabs .tab-btn').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.renderCollectionTab(tab.dataset.tab);
            });
        });

        // 排行榜标签
        document.querySelectorAll('.leaderboard-tabs .tab-btn').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.leaderboard-tabs .tab-btn').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.renderLeaderboardTab(tab.dataset.tab);
            });
        });
    },

    // 切换屏幕
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.add('active');
            this.currentScreen = screenId;
        }
        
        // 屏幕特定初始化
        if (screenId === 'main-menu') {
            this.updateMenuDisplay();
        } else if (screenId === 'level-select') {
            this.renderLevelSelect();
        }
    },

    // 显示/隐藏模态框
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    },

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    },

    // 更新菜单显示
    updateMenuDisplay() {
        const player = Storage.getPlayer();
        
        // 玩家信息 — use safe setter pattern
        const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        setEl('menu-avatar', player.avatar);
        setEl('menu-player-name', player.name);
        setEl('menu-player-level', player.level);
        
        // 货币
        setEl('menu-gold', Utils.formatNumber(Storage.getGold()));
        setEl('menu-gems', Utils.formatNumber(Storage.getGems()));
        
        // 当前关卡
        const currentLevel = Storage.getMaxUnlockedLevel();
        setEl('current-level-display', Math.min(currentLevel, getTotalLevels()));

        // 每日签到徽章
        const dailyBadge = document.getElementById('daily-badge');
        if (dailyBadge) {
            dailyBadge.style.display = Storage.canCheckin() ? 'flex' : 'none';
        }

        // Power stats — show active buffs and progression summary
        const powerEl = document.getElementById('power-stats');
        if (powerEl) {
            try {
                const buffs = Estate.getActiveBuffs();
                const totalStars = Storage.getTotalStars();
                const maxLevel = Storage.getMaxUnlockedLevel();
                const spirit = Estate.getCurrentSpirit();
                
                let html = '<div class="power-bar">';
                html += `<span class="power-item">⭐${totalStars}</span>`;
                if (buffs.length > 0) html += `<span class="power-item power-buff">🌳${buffs.length}Buff</span>`;
                if (spirit) html += `<span class="power-item">${spirit.emoji||'🧚'}${spirit.name||''}</span>`;
                if (Estate.getScoreMultiplier() > 1) html += `<span class="power-item power-buff">×${Estate.getScoreMultiplier()}</span>`;
                html += '</div>';
                powerEl.innerHTML = html;
            } catch(e) { powerEl.innerHTML = ''; }
        }

        // Season indicator
        try {
            if (typeof Seasons !== 'undefined') {
                const season = Seasons.getCurrentSeason();
                const subEl = document.getElementById('seasonal-subtitle');
                if (subEl) subEl.textContent = `${season.emoji} ${season.nameShort} · 剩${season.daysRemaining}天`;
            }
        } catch(e) {}

        // Daily challenge subtitle update
        try {
            const dcBtn = document.getElementById('btn-daily-challenge');
            if (dcBtn) {
                const sub = dcBtn.querySelector('.btn-subtitle');
                if (sub) {
                    const attemptsLeft = DailyChallenge.getAttemptsLeft();
                    const streak = DailyChallenge.getStreak();
                    sub.textContent = `剩${attemptsLeft}次 · 🔥${streak}天连续`;
                }
            }
        } catch(e) {}

        // 离线奖励
        this.checkOfflineReward();
    },

    // 检查离线奖励
    checkOfflineReward() {
        const offlineGold = Storage.data?.offline?.accumulatedGold || 0;
        const offlineReward = document.getElementById('offline-reward');
        
        if (offlineGold > 0 && offlineReward) {
            const offlineTime = Storage.getOfflineTime();
            document.getElementById('offline-time').textContent = Utils.formatTimeDiff(offlineTime);
            document.getElementById('offline-gold').textContent = Utils.formatNumber(offlineGold);
            offlineReward.style.display = 'block';
        }
    },

    // 领取离线奖励
    claimOfflineReward() {
        const gold = Storage.claimOfflineRewards();
        if (gold > 0) {
            Audio.play('coin');
            Particles.coins(window.innerWidth / 2, window.innerHeight / 2, 5);
            this.showToast(`获得 ${Utils.formatNumber(gold)} 金币！`, 'success');
        }
        document.getElementById('offline-reward').style.display = 'none';
        this.updateMenuDisplay();
    },

    // 渲染关卡选择
    renderLevelSelect() {
        // 更新货币显示
        const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        setEl('levels-gold', Utils.formatNumber(Storage.getGold()));
        setEl('levels-gems', Utils.formatNumber(Storage.getGems()));

        // 渲染章节标签
        const tabsEl = document.getElementById('chapter-tabs');
        const maxUnlocked = Storage.getMaxUnlockedLevel();
        
        if (tabsEl) {
            tabsEl.innerHTML = CHAPTERS.map(chapter => {
                const isUnlocked = isChapterUnlocked(chapter.id, maxUnlocked);
                return `
                    <button class="chapter-tab ${chapter.id === 1 ? 'active' : ''} ${isUnlocked ? '' : 'locked'}" 
                            data-chapter="${chapter.id}" ${isUnlocked ? '' : 'disabled'}>
                        ${chapter.icon} ${chapter.name}
                    </button>
                `;
            }).join('');

            // 绑定章节切换事件
            tabsEl.querySelectorAll('.chapter-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    if (tab.disabled) return;
                    
                    Audio.play('click');
                    tabsEl.querySelectorAll('.chapter-tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    
                    this.renderChapterLevels(parseInt(tab.dataset.chapter));
                });
            });
        }

        // 渲染第一章的关卡
        this.renderChapterLevels(1);
    },

    // 渲染章节关卡
    renderChapterLevels(chapterId) {
        const chapter = getChapter(chapterId);
        // Use extended function to include procedural levels (101+) mapped to chapters
        const levels = typeof getChapterLevelsExtended === 'function'
            ? getChapterLevelsExtended(chapterId)
            : getChapterLevels(chapterId);
        const maxUnlocked = Storage.getMaxUnlockedLevel();
        
        // 更新章节信息
        const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        setEl('chapter-name', `${chapter.icon} ${chapter.name}`);
        setEl('chapter-desc', chapter.description);

        // 渲染关卡按钮
        const gridEl = document.getElementById('levels-grid');
        if (gridEl) {
            gridEl.innerHTML = levels.map(level => {
                const levelData = Storage.getLevelData(level.id);
                const isUnlocked = level.id <= maxUnlocked;
                const isCurrent = level.id === maxUnlocked;
                const isCompleted = levelData.completed;
                
                let starsHtml = '';
                if (isCompleted) {
                    starsHtml = '<div class="level-stars">' +
                        [1, 2, 3].map(s => 
                            `<span class="star ${s <= levelData.stars ? 'earned' : ''}">⭐</span>`
                        ).join('') +
                        '</div>';
                }
                
                return `
                    <button class="level-btn ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isUnlocked ? '' : 'locked'}" 
                            data-level="${level.id}" ${isUnlocked ? '' : 'disabled'}>
                        ${isUnlocked ? level.id : ''}
                        ${starsHtml}
                    </button>
                `;
            }).join('');

            // 绑定关卡点击事件
            gridEl.querySelectorAll('.level-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (btn.disabled) return;
                    
                    Audio.play('click');
                    const levelId = parseInt(btn.dataset.level);
                    this.startLevel(levelId);
                });
            });
        }
    },

    // startLevel: see story-aware version below

    // 暂停菜单
    showPauseMenu() {
        game.pause();
        
        document.getElementById('pause-score').textContent = Utils.formatNumber(game.score);
        document.getElementById('pause-moves').textContent = game.movesLeft;
        
        this.showModal('pause-menu');
    },

    hidePauseMenu() {
        this.hideModal('pause-menu');
        game.resume();
    },

    // showVictory: see story-aware version below

    // 失败界面
    showDefeat(score, progressPercent, nearMissInfo) {
        document.getElementById('defeat-score').textContent = Utils.formatNumber(score);
        document.getElementById('defeat-progress').textContent = `${progressPercent}%`;

        const msgEl = document.getElementById('defeat-message');
        if (msgEl) {
            if (nearMissInfo) {
                // 🔥 Near-miss is the MOST addictive text — make it prominent
                msgEl.innerHTML = `<span style="color:#ef4444;font-weight:900;font-size:1.1em;">${nearMissInfo}</span>`;
            } else if (progressPercent >= 90) msgEl.textContent = '就差一点点！再来一次绝对能过！💪';
            else if (progressPercent >= 70) msgEl.textContent = '已经很接近了！试试不同的策略？🤔';
            else if (progressPercent >= 50) msgEl.textContent = '快到一半了，继续加油！';
            else msgEl.textContent = '每次失败都是经验，再来！';
        }

        this.showModal('defeat-screen');
    },

    // 每日签到
    showDailyCheckin() {
        const checkinData = Storage.getCheckinData();
        
        document.getElementById('checkin-streak').textContent = checkinData.streak;
        
        // 渲染日历
        const calendarEl = document.getElementById('checkin-calendar');
        if (calendarEl) {
            const rewards = ['💰', '💰', '💎', '💡', '💰', '🔨', '🎁'];
            
            calendarEl.innerHTML = [1, 2, 3, 4, 5, 6, 7].map(day => {
                const dayInStreak = ((checkinData.streak) % 7) || 7;
                const isChecked = day <= dayInStreak && checkinData.streak > 0;
                const isToday = day === (dayInStreak % 7) + 1 || (day === 1 && dayInStreak === 7);
                
                return `
                    <div class="checkin-day ${isChecked ? 'checked' : ''} ${isToday && Storage.canCheckin() ? 'today' : ''}">
                        <span class="reward">${rewards[day - 1]}</span>
                        <span class="day-num">第${day}天</span>
                    </div>
                `;
            }).join('');
        }

        // 更新签到按钮
        const btnCheckin = document.getElementById('btn-checkin');
        if (btnCheckin) {
            const canCheckin = Storage.canCheckin();
            btnCheckin.disabled = !canCheckin;
            btnCheckin.textContent = canCheckin ? '签到领取' : '今日已签到';
        }

        this.showModal('daily-checkin');
    },

    doCheckin() {
        const result = Storage.doCheckin();
        if (result) {
            Audio.play('coin');
            Particles.coins(window.innerWidth / 2, window.innerHeight / 2, 5);
            
            let rewardText = `获得 ${result.rewards.gold} 金币`;
            if (result.rewards.gems > 0) {
                rewardText += `，${result.rewards.gems} 宝石`;
            }
            
            this.showToast(rewardText, 'success');
            
            // 检查签到成就
            Achievements.check('checkin', result.streak);
            
            // 刷新显示
            this.showDailyCheckin();
            this.updateMenuDisplay();
        }
    },

    // 成就界面 — grid of badges
    showAchievements() {
        const unlockedCount = Achievements.getUnlockedCount();
        const totalCount = Achievements.getTotalCount();
        
        document.getElementById('achievements-unlocked').textContent = unlockedCount;
        document.getElementById('achievements-total').textContent = totalCount;

        const listEl = document.getElementById('achievements-list');
        if (listEl) {
            const achievements = Achievements.getAll();

            // Group by category
            const categories = {};
            achievements.forEach(a => {
                const cat = a.category || 'other';
                if (!categories[cat]) categories[cat] = [];
                categories[cat].push(a);
            });

            const categoryNames = {
                basic: '🎯 入门', match: '💫 消除', combo: '🔥 连击',
                special: '✨ 特殊', level: '🗺️ 关卡', stars: '⭐ 星星',
                score: '📊 分数', daily: '📅 签到', collect: '🐟 收集',
                play: '🎮 游玩', spirit: '🏋️ 精灵试炼', estate: '🏡 庄园',
                boss: '👹 Boss', wealth: '💰 财富',
                daily_challenge: '🌅 每日挑战', endless: '♾️ 无尽模式',
                seasonal: '🎄 季节活动', procedural: '🗺️ 无限冒险',
                collection: '🎨 收藏', skill: '🎯 技巧', other: '📋 其他'
            };

            let html = '';
            for (const cat of Object.keys(categories)) {
                const items = categories[cat];
                html += `<div class="achievement-category">
                    <h3 class="achievement-cat-title">${categoryNames[cat] || cat}</h3>
                    <div class="achievement-grid">`;

                html += items.map(achievement => {
                    const isUnlocked = Achievements.isUnlocked(achievement.id);
                    const progress = Achievements.getProgress(achievement.id);
                    
                    return `
                        <div class="achievement-badge ${isUnlocked ? 'unlocked' : 'locked'}" title="${achievement.description}">
                            <div class="badge-icon ${isUnlocked ? 'badge-glow' : ''}">${achievement.icon}</div>
                            <div class="badge-name">${achievement.name}</div>
                            ${!isUnlocked && progress && typeof progress.target === 'number' ? `
                                <div class="badge-progress-bar">
                                    <div class="badge-progress-fill" style="width: ${progress.percentage}%"></div>
                                </div>
                                <div class="badge-progress-text">${progress.current}/${progress.target}</div>
                            ` : isUnlocked ? `
                                <div class="badge-reward">
                                    ${achievement.reward.gold ? `💰${achievement.reward.gold}` : ''}
                                    ${achievement.reward.gems ? ` 💎${achievement.reward.gems}` : ''}
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('');

                html += `</div></div>`;
            }
            
            listEl.innerHTML = html;
        }

        this.showScreen('achievements-screen');
    },

    // 图鉴界面
    showCollection() {
        const totalUnlocked = Object.values(Storage.getCollection())
            .reduce((sum, arr) => sum + arr.length, 0);
        const totalCount = Collection.getTotalCount();
        
        document.getElementById('collection-unlocked').textContent = totalUnlocked;
        document.getElementById('collection-total').textContent = totalCount;

        // 渲染第一个标签
        this.renderCollectionTab('creatures');
        
        this.showScreen('collection-screen');
    },

    renderCollectionTab(category) {
        const gridEl = document.getElementById('collection-grid');
        if (!gridEl) return;
        
        const items = Collection.getCategory(category);
        
        gridEl.innerHTML = items.map(item => {
            const isUnlocked = Collection.isUnlocked(category, item.id);
            return Collection.renderItem(category, item.id, isUnlocked);
        }).join('');

        // 绑定点击事件
        gridEl.querySelectorAll('.collection-item').forEach(el => {
            el.addEventListener('click', () => {
                const id = el.dataset.id;
                const cat = el.dataset.category;
                this.showCollectionDetail(cat, id);
            });
        });
    },

    showCollectionDetail(category, id) {
        const detailEl = document.getElementById('collection-detail');
        if (!detailEl) return;
        
        detailEl.innerHTML = Collection.renderDetail(category, id);
        detailEl.style.display = 'block';

        // 点击关闭
        detailEl.addEventListener('click', () => {
            detailEl.style.display = 'none';
        }, { once: true });
    },

    // 排行榜
    showLeaderboard() {
        this.renderLeaderboardTab('score');
        this.showScreen('leaderboard-screen');
    },

    renderLeaderboardTab(type) {
        const listEl = document.getElementById('leaderboard-list');
        if (!listEl) return;
        
        const scores = Storage.getLeaderboard();
        
        // 排序
        let sortedScores = [...scores];
        if (type === 'score') {
            sortedScores.sort((a, b) => b.score - a.score);
        } else if (type === 'level') {
            sortedScores.sort((a, b) => b.level - a.level);
        }
        
        // 只取前20
        sortedScores = sortedScores.slice(0, 20);
        
        if (sortedScores.length === 0) {
            listEl.innerHTML = '<div style="text-align:center;padding:2rem;color:#6b5b7a;">还没有记录，快去挑战吧！</div>';
            return;
        }
        
        listEl.innerHTML = sortedScores.map((entry, index) => {
            const rankClass = index === 0 ? 'top-1' : index === 1 ? 'top-2' : index === 2 ? 'top-3' : '';
            
            return `
                <div class="leaderboard-item ${rankClass}">
                    <div class="rank">${index + 1}</div>
                    <div class="leaderboard-avatar">${entry.avatar}</div>
                    <div class="leaderboard-info">
                        <div class="leaderboard-name">${entry.name}</div>
                        <div class="leaderboard-level">Lv.${entry.level}</div>
                    </div>
                    <div class="leaderboard-score">${Utils.formatNumber(entry.score)}</div>
                </div>
            `;
        }).join('');
    },

    // 周赛界面 — CC没有的独家玩法
    showWeeklyChallenge() {
        const challenge = WeeklyChallenge.generate();
        const bestScore = WeeklyChallenge.getBestScore();
        const attempts = WeeklyChallenge.getAttempts();
        const leaderboard = WeeklyChallenge.getLeaderboard();

        // Build leaderboard HTML
        const lbHtml = leaderboard.map(e =>
            `<div class="lb-row ${e.isPlayer ? 'lb-player' : ''}" style="display:flex;justify-content:space-between;padding:0.3rem 0.5rem;${e.isPlayer ? 'background:rgba(255,215,0,0.15);border-radius:6px;font-weight:700;' : ''}">
                <span>${e.rank}. ${e.name}</span><span>${Utils.formatNumber(e.score)}</span>
            </div>`
        ).join('');

        // Use a generic modal approach
        const overlay = document.createElement('div');
        overlay.className = 'modal active';
        overlay.id = 'weekly-modal';
        overlay.innerHTML = `
            <div class="modal-content" style="max-height:80vh;overflow-y:auto;">
                <h2>${challenge.themeName}</h2>
                <p style="color:var(--text-secondary);margin-bottom:0.5rem;">${challenge.themeDesc}</p>
                <div style="display:flex;gap:1rem;justify-content:center;margin:0.5rem 0;">
                    <span>🎯 ${challenge.objectives.map(o => o.icon + o.target).join(' + ')}</span>
                    <span>👣 ${challenge.moves}步</span>
                    ${challenge.timed ? `<span>⏱️ ${challenge.timeLimit}s</span>` : ''}
                </div>
                <div style="text-align:center;margin:0.5rem 0;">
                    <p>🏅 你的最高分: <strong>${bestScore > 0 ? Utils.formatNumber(bestScore) : '未挑战'}</strong></p>
                    <p style="font-size:0.8rem;color:var(--text-secondary);">本周已挑战 ${attempts} 次（无限制）</p>
                </div>
                <h3 style="margin:0.5rem 0 0.3rem;">🏆 排行榜</h3>
                <div style="font-size:0.85rem;">${lbHtml}</div>
                <div style="display:flex;gap:0.5rem;margin-top:0.8rem;">
                    <button class="modal-btn" onclick="document.getElementById('weekly-modal').remove()">返回</button>
                    <button class="modal-btn primary" id="btn-weekly-start">⚔️ 开始挑战</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        document.getElementById('btn-weekly-start')?.addEventListener('click', () => {
            overlay.remove();
            this.startSpecialLevel(challenge);
        });
    },

    // 设置界面
    showSeason() {
        if (typeof SeasonSystem === 'undefined') return;
        const season = SeasonSystem.getCurrentSeason();
        const points = SeasonSystem.getSeasonPoints();
        const tier = SeasonSystem.getCurrentTier();

        let tiersHtml = SeasonSystem.PASS_TIERS.map((t, i) => {
            const unlocked = points >= t.points;
            const claimed = Storage.data?.seasonClaimed?.[`${season.seasonId}-${i}`];
            return `<div style="display:flex;align-items:center;gap:8px;padding:6px;border-radius:8px;
                background:${unlocked ? 'rgba(34,197,94,0.15)' : 'rgba(100,100,100,0.1)'};
                border:1px solid ${unlocked ? '#22c55e' : '#333'};margin-bottom:4px;">
                <span style="font-size:1.2rem;">${t.icon}</span>
                <div style="flex:1;">
                    <div style="font-size:0.75rem;font-weight:700;color:${unlocked ? '#22c55e' : 'var(--text-secondary)'};">${t.points}分 — ${t.reward}</div>
                </div>
                ${unlocked && !claimed && i > 0 ? `<button class="season-claim-btn" data-tier="${i}" style="padding:4px 8px;background:var(--wow-gold);color:#000;border:none;border-radius:6px;font-size:0.7rem;font-weight:700;cursor:pointer;">领取</button>` : ''}
                ${claimed ? '<span style="font-size:0.7rem;color:#22c55e;">✅</span>' : ''}
            </div>`;
        }).join('');

        const nextTier = SeasonSystem.PASS_TIERS[tier + 1];
        const progressPct = nextTier ? ((points - SeasonSystem.PASS_TIERS[tier].points) / (nextTier.points - SeasonSystem.PASS_TIERS[tier].points) * 100) : 100;

        const overlay = document.createElement('div');
        overlay.id = 'season-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:900;overflow-y:auto;padding:20px;';
        overlay.innerHTML = `<div style="max-width:360px;margin:0 auto;">
            <div style="text-align:center;margin-bottom:12px;">
                <div style="font-size:2.5rem;">${season.emoji}</div>
                <div style="font-weight:900;font-size:1.3rem;color:${season.color};">${season.name}</div>
                <div style="font-size:0.8rem;color:var(--text-secondary);">剩余${season.daysRemaining}天 · ${season.bonus}</div>
                ${season.spiritBonus ? `<div style="font-size:0.75rem;color:#f472b6;">本赛季精灵加成: ${Estate.SPIRITS[season.spiritBonus]?.emoji || ''} ${Estate.SPIRITS[season.spiritBonus]?.name || ''}</div>` : ''}
            </div>
            <div style="margin-bottom:12px;">
                <div style="font-size:0.8rem;font-weight:700;">赛季积分: ${points}</div>
                <div style="background:#333;border-radius:6px;height:8px;margin:4px 0;">
                    <div style="background:${season.color};height:100%;border-radius:6px;width:${Math.min(progressPct, 100)}%;transition:width 0.3s;"></div>
                </div>
                ${nextTier ? `<div style="font-size:0.7rem;color:var(--text-secondary);">下一级: ${nextTier.points}分 (还差${nextTier.points - points})</div>` : '<div style="font-size:0.7rem;color:var(--wow-gold);">🏆 已达最高等级！</div>'}
            </div>
            <div style="font-weight:700;margin-bottom:6px;">赛季通行证</div>
            ${tiersHtml}
            <button id="season-close" style="margin-top:12px;width:100%;padding:10px;background:var(--bg-secondary);color:var(--text-primary);border:1px solid var(--border-color);border-radius:10px;font-weight:700;cursor:pointer;">返回</button>
        </div>`;
        document.body.appendChild(overlay);

        overlay.querySelectorAll('.season-claim-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                SeasonSystem.claimTierReward(parseInt(btn.dataset.tier));
                Audio.play('levelUp');
                overlay.remove();
                this.showSeason(); // Refresh
            });
        });
        document.getElementById('season-close').addEventListener('click', () => overlay.remove());
    },

    showSettings() {
        const settings = Storage.getSettings();
        const player = Storage.getPlayer();
        
        document.getElementById('setting-sfx').checked = settings.sfxEnabled;
        document.getElementById('setting-music').checked = settings.musicEnabled;
        document.getElementById('setting-volume').value = settings.volume;
        document.getElementById('setting-vibration').checked = settings.vibration;
        document.getElementById('setting-particles').checked = settings.particles;
        document.getElementById('setting-name').value = player.name;
        
        // 头像选择
        document.querySelectorAll('.avatar-option').forEach(option => {
            option.classList.toggle('selected', option.dataset.avatar === player.avatar);
        });
        
        this.showScreen('settings-screen');
    },

    saveSettings() {
        const settings = {
            sfxEnabled: document.getElementById('setting-sfx').checked,
            musicEnabled: document.getElementById('setting-music').checked,
            volume: parseInt(document.getElementById('setting-volume').value),
            vibration: document.getElementById('setting-vibration').checked,
            particles: document.getElementById('setting-particles').checked
        };
        
        Storage.updateSettings(settings);
        
        // 应用设置
        Audio.setSfxEnabled(settings.sfxEnabled);
        Audio.setMusicEnabled(settings.musicEnabled);
        Audio.setVolume(settings.volume / 100);
        Particles.setEnabled(settings.particles);
    },

    // Toast 提示
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        if (!toast) return;
        
        // Reset any previous animation
        toast.className = 'toast';
        toast.style.display = 'block';
        toast.textContent = message;
        
        // Force reflow then show (triggers CSS animation)
        void toast.offsetHeight;
        toast.className = `toast ${type} show`;
        
        // JS fallback: force hide after 2.8s (CSS animation is 2.5s)
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => {
            toast.className = 'toast';
            toast.style.display = 'none';
        }, 2800);
    },

    // 显示成就解锁弹窗
    showAchievementPopup(achievement) {
        const popup = document.getElementById('achievement-popup');
        if (!popup) return;
        
        document.getElementById('popup-achievement-icon').textContent = achievement.icon;
        document.getElementById('popup-achievement-name').textContent = achievement.name;
        
        popup.classList.add('show');
        Audio.play('achievement');

        // v10: Contextual hint for first achievement
        try { Tutorial.onAchievementUnlock(); } catch(e) {}
        
        setTimeout(() => {
            popup.classList.remove('show');
        }, 3000);
    },

    // 显示待处理的成就
    showPendingAchievements() {
        const pending = Achievements.getPendingUnlocks();
        pending.forEach((achievement, index) => {
            setTimeout(() => { this.showAchievementPopup(achievement); }, index * 3500);
        });
    },

    // ==========================================
    // 庄园系统 UI
    // ==========================================

    showEstate() {
        // v10: Tutorial hint for estate
        try { Tutorial.onEstateOpen(); } catch(e) {}

        // Update gold display
        const goldEl = document.getElementById('estate-gold');
        if (goldEl) goldEl.textContent = Utils.formatNumber(Storage.getGold());

        // Happiness — scaled display
        const happiness = Estate.getHappiness();
        const hEl = document.getElementById('estate-happiness');
        if (hEl) hEl.textContent = happiness;
        const hFill = document.getElementById('happiness-fill');
        if (hFill) hFill.style.width = `${Math.min(100, (happiness / 1000) * 100)}%`;
        const hHint = document.getElementById('happiness-hint');
        if (hHint) {
            const mult = Estate.getScoreMultiplier();
            if (happiness >= 1000) hHint.textContent = `🏆 幸福度MAX！分数永久${mult}倍！`;
            else if (happiness >= 200) hHint.textContent = `✅ 分数${mult}倍！下一级: ${happiness >= 500 ? 1000 : 500}`;
            else hHint.textContent = `幸福度200后分数加成！(还差${200-happiness})`;
        }

        // Trees — with upgrade levels
        const treeGrid = document.getElementById('tree-grid');
        if (treeGrid) {
            treeGrid.innerHTML = Object.values(Estate.TREES).map(tree => {
                const level = Estate.getTreeLevel(tree.id);
                const maxLevel = tree.levels.length;
                const upgradeCost = Estate.getTreeUpgradeCost(tree.id);
                const isMaxed = level >= maxLevel;
                const currentDesc = level > 0 ? tree.levels[Math.min(level-1, maxLevel-1)].desc : tree.description;
                const nextDesc = !isMaxed && level > 0 ? tree.levels[level].desc : '';

                return `<div class="tree-card ${level > 0 ? 'planted' : ''}" data-tree="${tree.id}">
                    <div class="tree-emoji">${tree.emoji}</div>
                    <div class="tree-name">${tree.name} ${level > 0 ? `<small>Lv.${level}/${maxLevel}</small>` : ''}</div>
                    <div class="tree-desc">${currentDesc}</div>
                    ${nextDesc ? `<div class="tree-next" style="font-size:0.7rem;color:var(--text-secondary);">下一级: ${nextDesc}</div>` : ''}
                    ${isMaxed
                        ? '<div class="tree-status">🌟 满级</div>'
                        : `<button class="tree-plant-btn" data-tree="${tree.id}">${level === 0 ? '种植' : '升级'} 💰${Utils.formatNumber(upgradeCost)}</button>`}
                </div>`;
            }).join('');

            treeGrid.querySelectorAll('.tree-plant-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (Estate.plantTree(btn.dataset.tree)) this.showEstate();
                });
            });
        }

        // Spirits — with upgrade, trial, and affection progress
        const spiritGrid = document.getElementById('spirit-grid');
        if (spiritGrid) {
            const currentSpirit = Estate.getCurrentSpirit();
            spiritGrid.innerHTML = Object.values(Estate.SPIRITS).map(spirit => {
                const unlocked = Estate.isSpiritUnlocked(spirit.id);
                const active = currentSpirit.id === spirit.id;
                const level = Estate.getSpiritLevel(spirit.id);
                const maxLevel = spirit.skillLevels.length;
                const isMaxed = level >= maxLevel;
                const upgradeCost = Estate.getSpiritUpgradeCost(spirit.id);
                const skillDesc = level > 0 ? spirit.skillLevels[Math.min(level-1, maxLevel-1)].desc : spirit.skillLevels[0].desc;

                // Trial affection data
                const affection = Estate.getSpiritTrialAffection(spirit.id);
                const trialData = Estate.SPIRIT_TRIAL_DATA[spirit.id];
                const unlockedAbilities = Estate.getUnlockedTrialAbilities(spirit.id);
                const nextMilestone = Estate.TRIAL_MILESTONES.find(m => affection < m.affection);

                // Affection bar
                const affPct = Math.min(100, affection);
                const affColor = affection >= 100 ? '#ef4444' : affection >= 50 ? '#a855f7' : affection >= 30 ? '#3b82f6' : '#22c55e';

                // Abilities list
                const abilitiesHtml = (Estate.SPIRIT_ABILITIES[spirit.id] || []).map(a => {
                    const isUnlocked = affection >= a.at;
                    return `<span style="font-size:0.6rem;padding:2px 4px;border-radius:4px;
                        background:${isUnlocked ? 'rgba(34,197,94,0.2)' : 'rgba(100,100,100,0.2)'};
                        color:${isUnlocked ? '#22c55e' : '#666'};
                        border:1px solid ${isUnlocked ? '#22c55e' : '#444'};"
                        title="${a.desc}">${isUnlocked ? '✅' : '🔒'} ${a.name}</span>`;
                }).join(' ');

                return `<div class="spirit-card ${active ? 'active' : ''} ${unlocked ? '' : 'locked'}" data-spirit="${spirit.id}">
                    <div class="spirit-emoji">${spirit.emoji}</div>
                    <div class="spirit-name">${spirit.name} ${level > 0 ? `<small>Lv.${level}</small>` : ''}</div>
                    <div class="spirit-desc">${spirit.skillName}: ${skillDesc}</div>

                    ${unlocked ? `
                    <!-- Affection Progress Bar -->
                    <div class="spirit-affection-section" style="margin:6px 0;width:100%;">
                        <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.65rem;color:var(--text-secondary);margin-bottom:2px;">
                            <span>💕 亲密度</span>
                            <span style="color:${affColor};font-weight:700;">${affection}/100</span>
                        </div>
                        <div style="background:rgba(100,100,100,0.3);border-radius:6px;height:6px;overflow:hidden;">
                            <div style="background:linear-gradient(90deg, ${affColor}, ${affection >= 80 ? '#f472b6' : affColor});height:100%;width:${affPct}%;border-radius:6px;transition:width 0.3s;"></div>
                        </div>
                        ${nextMilestone ? `<div style="font-size:0.55rem;color:#888;margin-top:1px;">下一级: ${nextMilestone.icon} ${nextMilestone.name} (${nextMilestone.affection})</div>` : '<div style="font-size:0.55rem;color:var(--wow-gold);">❤️‍🔥 满亲密度！</div>'}
                    </div>

                    <!-- Abilities -->
                    <div style="display:flex;flex-wrap:wrap;gap:2px;justify-content:center;margin:4px 0;">
                        ${abilitiesHtml}
                    </div>

                    <!-- Trial Button -->
                    <button class="spirit-trial-btn" data-spirit="${spirit.id}" style="
                        margin-top:4px;padding:4px 10px;border-radius:8px;border:1px solid #a855f7;
                        background:rgba(168,85,247,0.15);color:#c084fc;font-size:0.7rem;font-weight:700;cursor:pointer;">
                        🏋️ 精灵试炼 ${trialData ? `(${trialData.gemEmoji}x2)` : ''}
                    </button>
                    ` : ''}

                    <div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:center;margin-top:4px;">
                    ${active ? '<span class="spirit-status">🌟 已派遣</span>' : ''}
                    ${unlocked && !active ? `<button class="spirit-select-btn" data-spirit="${spirit.id}">派遣</button>` : ''}
                    ${!unlocked ? `<button class="spirit-unlock-btn" data-spirit="${spirit.id}">解锁 💰${spirit.unlockCost}</button>` : ''}
                    ${unlocked && !isMaxed ? `<button class="spirit-upgrade-btn" data-spirit="${spirit.id}">⬆️ 💰${Utils.formatNumber(upgradeCost)}</button>` : ''}
                    ${isMaxed ? '<span style="color:var(--wow-gold);font-size:0.7rem;">MAX</span>' : ''}
                    </div>
                </div>`;
            }).join('');

            spiritGrid.querySelectorAll('.spirit-select-btn, .spirit-unlock-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (Estate.selectSpirit(btn.dataset.spirit)) this.showEstate();
                });
            });
            spiritGrid.querySelectorAll('.spirit-upgrade-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (Estate.upgradeSpirit(btn.dataset.spirit)) this.showEstate();
                });
            });
            // Spirit Trial buttons
            spiritGrid.querySelectorAll('.spirit-trial-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    Estate.startSpiritTrial(btn.dataset.spirit);
                });
            });
        }

        // Decorations
        const decoGrid = document.getElementById('deco-grid');
        if (decoGrid) {
            decoGrid.innerHTML = Object.values(Estate.DECORATIONS).map(deco => {
                const owned = Estate.hasDecoration(deco.id);
                return `<div class="tree-card ${owned ? 'planted' : ''}" style="min-width:80px;">
                    <div class="tree-emoji">${deco.emoji}</div>
                    <div class="tree-name" style="font-size:0.75rem;">${deco.name}</div>
                    <div class="tree-desc" style="font-size:0.65rem;">幸福度+${deco.happiness}</div>
                    ${owned ? '<div class="tree-status" style="font-size:0.65rem;">✅</div>'
                        : `<button class="tree-plant-btn deco-buy-btn" data-deco="${deco.id}" style="font-size:0.7rem;">💰${deco.cost}</button>`}
                </div>`;
            }).join('');
            decoGrid.querySelectorAll('.deco-buy-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (Estate.buyDecoration(btn.dataset.deco)) this.showEstate();
                });
            });
        }

        // Buff summary
        const buffSummary = document.getElementById('buff-summary');
        if (buffSummary) {
            const buffs = Estate.getActiveBuffs();
            if (buffs.length === 0) {
                buffSummary.innerHTML = '<p class="no-buffs">还没有Buff，快去种树吧！</p>';
            } else {
                buffSummary.innerHTML = buffs.map(b => {
                    switch(b) {
                        case 'start_bomb': return '<div class="buff-item">🌟 开局自带炸弹</div>';
                        case 'extra_moves': return '<div class="buff-item">🌙 每关多2步</div>';
                        case 'rainbow_4': return '<div class="buff-item">🌈 4消出彩虹</div>';
                        case 'score_multiplier': return '<div class="buff-item">✨ 分数1.2倍</div>';
                        default: return '';
                    }
                }).join('');
            }
        }

        this.showScreen('estate-screen');
    },

    // ==========================================
    // 故事对话系统
    // ==========================================

    storyQueue: [],
    storyCallback: null,

    async showStoryDialog(texts, callback) {
        try {
            if (!texts || texts.length === 0) { if (callback) callback(); return; }
            this.storyQueue = Array.isArray(texts) ? [...texts] : [texts];
            this.storyCallback = callback;
            this.showNextStoryLine();
            this.showModal('story-dialog');
        } catch (e) {
            console.error('[UI.showStoryDialog] error:', e);
            if (callback) callback();
        }
    },

    showNextStoryLine() {
        try {
            if (this.storyQueue.length === 0) {
                this.hideModal('story-dialog');
                if (this.storyCallback) { this.storyCallback(); this.storyCallback = null; }
                return;
            }
            const line = this.storyQueue.shift();
            const textEl = document.getElementById('story-text');
            if (textEl) {
                // Typewriter effect for dramatic lines (boss intros with「」)
                if (line.includes('「') || line.includes('...')) {
                    textEl.textContent = '';
                    let i = 0;
                    const type = () => {
                        if (i < line.length) {
                            textEl.textContent += line[i]; i++;
                            setTimeout(type, line[i-1] === '.' || line[i-1] === '…' ? 120 : 40);
                        }
                    };
                    type();
                } else {
                    textEl.textContent = line;
                }
            }
            const btnEl = document.getElementById('story-continue-btn');
            if (btnEl) btnEl.textContent = this.storyQueue.length === 0 ? '开始战斗！ ⚔️' : '继续 ▶';
        } catch (e) {
            console.error('[UI.showNextStoryLine] error:', e);
            this.hideModal('story-dialog');
            if (this.storyCallback) { this.storyCallback(); this.storyCallback = null; }
        }
    },

    advanceStoryDialog() {
        Audio.play('click');
        this.showNextStoryLine();
    },

    // 开始关卡（带故事对话支持）
    // 🧚 Spirit picker for boss levels — strategy choice
    showSpiritPicker(levelId, callback) {
        const boss = Boss.BOSSES[levelId];
        if (!boss) { callback(); return; }
        const spirits = Object.values(Estate.SPIRITS).filter(s => Estate.isSpiritUnlocked(s.id));
        if (spirits.length <= 1) { callback(); return; }

        const currentSpirit = Estate.getCurrentSpirit();
        const weaknessSpirit = boss.weakness ? Estate.SPIRITS[boss.weakness] : null;

        let html = `<div style="text-align:center;padding:12px;">
            <div style="font-size:2rem;">${boss.phases?.[0]?.emoji || '👹'}</div>
            <div style="font-weight:900;font-size:1.1rem;margin:4px 0;">${boss.name}</div>
            <div style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:8px;">${boss.desc}</div>
            ${weaknessSpirit ? `<div style="font-size:0.75rem;color:#ef4444;margin-bottom:8px;">💡 弱点: ${weaknessSpirit.emoji} ${weaknessSpirit.name} (伤害x2)</div>` : ''}
            <div style="font-weight:700;margin:8px 0;">选择出战精灵：</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;">`;

        spirits.forEach(s => {
            const isWeak = boss.weakness === s.id;
            const isActive = currentSpirit.id === s.id;
            const affLv = Estate.getSpiritAffinityLevel(s.id);
            const affName = Estate.AFFINITY_LEVELS[affLv]?.name || '';
            const hearts = '💕'.repeat(Math.min(affLv, 4)) || '🤍';
            html += `<button class="spirit-pick-btn" data-spirit="${s.id}" style="
                padding:8px 10px;border-radius:10px;border:2px solid ${isWeak ? '#ef4444' : isActive ? 'var(--wow-gold)' : '#555'};
                background:${isActive ? 'rgba(255,215,0,0.15)' : 'rgba(30,30,30,0.8)'};
                cursor:pointer;min-width:70px;text-align:center;
                ${isWeak ? 'box-shadow:0 0 8px rgba(239,68,68,0.4);' : ''}">
                <div style="font-size:1.3rem;">${s.emoji}</div>
                <div style="font-size:0.7rem;color:var(--text-primary);">${s.name}</div>
                <div style="font-size:0.55rem;color:#f472b6;">${hearts} ${affName}</div>
                ${isWeak ? '<div style="font-size:0.6rem;color:#ef4444;">克制!</div>' : ''}
                ${isActive ? '<div style="font-size:0.6rem;color:var(--wow-gold);">当前</div>' : ''}
            </button>`;
        });
        html += `</div></div>`;

        const overlay = document.createElement('div');
        overlay.id = 'spirit-picker-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:900;display:flex;align-items:center;justify-content:center;';
        overlay.innerHTML = `<div style="background:var(--bg-secondary);border-radius:16px;max-width:340px;width:90%;border:1px solid var(--border-color);">${html}</div>`;
        document.body.appendChild(overlay);

        overlay.querySelectorAll('.spirit-pick-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                Estate.selectSpirit(btn.dataset.spirit);
                overlay.remove();
                callback();
            });
        });
    },

    startLevel(levelId) {
        try {
            const level = getLevel(levelId);
            const chapter = getChapter(level.chapter);
            const chapterNameEl = document.getElementById('game-chapter');
            const levelNumEl = document.getElementById('game-level');
            if (chapterNameEl) chapterNameEl.textContent = chapter.name;
            if (levelNumEl) levelNumEl.textContent = levelId;

            // Update spirit icon in skill bar
            const spiritIcon = document.getElementById('skill-spirit-icon');
            if (spiritIcon) spiritIcon.textContent = Estate.getCurrentSpirit().emoji;

            // Boss level? Show spirit picker FIRST, then story, then game
            const isBoss = Boss.isBossLevel(levelId);
            const launchAfterPick = () => {
                const story = StoryData.getLevel(levelId);
                if (story) {
                    const introTexts = [];
                    if (story.pre) introTexts.push(story.pre);
                    if (story.bossIntro) introTexts.push(...story.bossIntro);
                    if (introTexts.length > 0) {
                        const charEl = document.getElementById('story-character');
                        if (charEl) {
                            charEl.textContent = story.bossIntro ? (Boss.BOSSES[levelId]?.phases?.[0]?.emoji || '🥭') : '🥭';
                            charEl.classList.toggle('boss-intro', !!story.bossIntro);
                        }
                        this.showStoryDialog(introTexts, () => this.doStartLevel(levelId));
                        return;
                    }
                }
                this.doStartLevel(levelId);
            };

            if (isBoss) {
                this.showSpiritPicker(levelId, launchAfterPick);
            } else {
                launchAfterPick();
            }
        } catch (e) {
            console.error('[UI.startLevel] error:', e);
            // Fallback: try direct init
            this.doStartLevel(levelId);
        }
    },

    // Start a special/procedural level (daily challenge, endless mode)
    startSpecialLevel(levelConfig) {
        try {
            if (!levelConfig || !levelConfig.gems || !levelConfig.objectives) {
                throw new Error('Invalid level config');
            }
            // Inject the level config into the levels system temporarily
            window._specialLevel = levelConfig;
            this.showScreen('game-screen');
            game.initSpecial(levelConfig);

            // Update spirit icon in skill bar
            const spiritIcon = document.getElementById('skill-spirit-icon');
            if (spiritIcon) spiritIcon.textContent = Estate.getCurrentSpirit().emoji;

            const gameScreen = document.getElementById('game-screen');
            if (gameScreen) {
                gameScreen.classList.toggle('boss-active', !!levelConfig.boss);
                gameScreen.dataset.theme = levelConfig.boss ? 'fire' : 'forest';
            }
            const bossBar = document.getElementById('boss-bar');
            if (bossBar) bossBar.style.display = levelConfig.boss ? 'block' : 'none';

            // Board render verification (same as doStartLevel)
            requestAnimationFrame(() => {
                try {
                    const boardEl = document.getElementById('game-board');
                    if (boardEl && boardEl.children.length < game.width * game.height) {
                        console.warn('[startSpecialLevel] Board incomplete, forcing re-render');
                        game.render();
                    }
                } catch(e) { console.error('[startSpecialLevel] render check error:', e); }
            });
        } catch (e) {
            console.error('[startSpecialLevel] error:', e);
            this.showToast('加载失败，请重试', 'error');
            this.showScreen('main-menu');
        }
    },

    doStartLevel(levelId) {
        try {
            this.showScreen('game-screen');
            game.init(levelId);

            // Show boss bar if boss level + visual tension
            const isBoss = Boss.isBossLevel(levelId);
            const bossBar = document.getElementById('boss-bar');
            if (bossBar) bossBar.style.display = isBoss ? 'block' : 'none';
            // Switch BGM for boss levels
            if (isBoss) Audio.startBossBGM(); else Audio.startBGM();
            const gameScreen = document.getElementById('game-screen');
            if (gameScreen) {
                gameScreen.classList.toggle('boss-active', isBoss);
                // Apply chapter theme
                const level = getLevel(levelId);
                const chapter = getChapter(level.chapter);
                gameScreen.dataset.theme = chapter.background || 'forest';
            }

            // v10: New tutorial system — non-blocking onboarding
            try { Tutorial.onLevelStart(levelId); } catch(e) { console.warn('[Tutorial] onLevelStart error:', e); }

            // Boss contextual hint
            if (isBoss) {
                try { Tutorial.onBossEncounter(); } catch(e) {}
            }

            // 🛡️ Board render fallback: verify board actually rendered
            requestAnimationFrame(() => {
                try {
                    const boardEl = document.getElementById('game-board');
                    if (boardEl && boardEl.children.length === 0) {
                        console.warn('[doStartLevel] Board empty after init, forcing re-render');
                        game.render();
                    }
                    // Double-check: expected cell count = width * height
                    if (boardEl && boardEl.children.length < game.width * game.height) {
                        console.warn('[doStartLevel] Board incomplete (' + boardEl.children.length + ' cells, expected ' + (game.width * game.height) + '), forcing re-render');
                        game.render();
                    }
                } catch (renderErr) {
                    console.error('[doStartLevel] render fallback error:', renderErr);
                }
            });
        } catch (e) {
            console.error('[UI.doStartLevel] error:', e);
        }
    },

    // 胜利界面（带故事对话支持）
    // 🏆 Boss loot cinematic
    showBossLoot(loot, levelId, callback) {
        const boss = Boss.BOSSES[levelId];
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:950;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.5s;';
        overlay.innerHTML = `<div style="text-align:center;max-width:340px;padding:20px;">
            <div style="font-size:2.5rem;margin-bottom:8px;">🏆</div>
            <div style="font-weight:900;font-size:1.3rem;color:var(--wow-gold);margin-bottom:4px;">${boss?.name || 'Boss'} 已被击败！</div>
            <div style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:12px;line-height:1.5;white-space:pre-line;" id="boss-lore-text"></div>
            <div style="display:flex;gap:12px;justify-content:center;margin:12px 0;">
                <div style="text-align:center;"><div style="font-size:1.5rem;">💰</div><div style="color:var(--wow-gold);font-weight:700;">${Utils.formatNumber(loot.gold)}</div></div>
                <div style="text-align:center;"><div style="font-size:1.5rem;">💎</div><div style="color:#a855f7;font-weight:700;">${loot.gems}</div></div>
            </div>
            ${loot.title ? `<div style="margin:8px 0;padding:6px 12px;background:rgba(255,215,0,0.15);border:1px solid var(--wow-gold);border-radius:8px;display:inline-block;"><span style="color:var(--wow-gold);font-weight:700;">🎖️ 称号: ${loot.title}</span></div>` : ''}
            <br><button id="boss-loot-continue" style="margin-top:16px;padding:10px 32px;background:var(--wow-gold);color:#000;border:none;border-radius:10px;font-weight:900;font-size:1rem;cursor:pointer;">继续</button>
        </div>`;
        document.body.appendChild(overlay);
        requestAnimationFrame(() => { overlay.style.opacity = '1'; });

        // Typewriter lore text
        const loreEl = document.getElementById('boss-lore-text');
        if (loreEl && loot.lore) {
            let i = 0;
            const typeInterval = setInterval(() => {
                if (i < loot.lore.length) { loreEl.textContent += loot.lore[i]; i++; }
                else clearInterval(typeInterval);
            }, 30);
        }

        document.getElementById('boss-loot-continue').addEventListener('click', () => {
            overlay.style.opacity = '0';
            setTimeout(() => { overlay.remove(); if (callback) callback(); }, 400);
        });
    },

    // ==========================================
    // 无尽模式选择器
    // ==========================================
    showEndlessModePicker() {
        const scores = EndlessMode.getAllHighScores();
        const overlay = document.createElement('div');
        overlay.id = 'endless-picker';
        overlay.className = 'modal active';
        overlay.innerHTML = `
            <div class="modal-content" style="max-width:340px;">
                <h2>♾️ 无尽模式</h2>
                <div style="display:flex;flex-direction:column;gap:8px;margin:12px 0;">
                    <button class="modal-btn primary" id="endless-classic" style="text-align:left;padding:12px;">
                        <div style="font-size:1.1rem;font-weight:700;">🎮 经典模式</div>
                        <div style="font-size:0.75rem;color:var(--text-secondary);">无限关卡，步数递减，看你能走多远</div>
                        <div style="font-size:0.7rem;color:var(--wow-gold);">最高: Wave ${scores.classic.wave} · ${Utils.formatNumber(scores.classic.score)}分</div>
                    </button>
                    <button class="modal-btn" id="endless-timed" style="text-align:left;padding:12px;">
                        <div style="font-size:1.1rem;font-weight:700;">⏱️ 限时模式</div>
                        <div style="font-size:0.75rem;color:var(--text-secondary);">每波60秒，完成目标续命！</div>
                        <div style="font-size:0.7rem;color:var(--wow-gold);">最高: Wave ${scores.timed.wave} · ${Utils.formatNumber(scores.timed.score)}分</div>
                    </button>
                    <button class="modal-btn" id="endless-survival" style="text-align:left;padding:12px;">
                        <div style="font-size:1.1rem;font-weight:700;">🛡️ 生存模式</div>
                        <div style="font-size:0.75rem;color:var(--text-secondary);">障碍越来越多，步数越来越少</div>
                        <div style="font-size:0.7rem;color:var(--wow-gold);">最高: Wave ${scores.survival.wave} · ${Utils.formatNumber(scores.survival.score)}分</div>
                    </button>
                </div>
                <button class="modal-btn" onclick="document.getElementById('endless-picker').remove()">返回</button>
            </div>
        `;
        document.body.appendChild(overlay);

        document.getElementById('endless-classic').addEventListener('click', () => {
            overlay.remove();
            const level = EndlessMode.start('classic');
            this.startSpecialLevel(level);
        });
        document.getElementById('endless-timed').addEventListener('click', () => {
            overlay.remove();
            const level = EndlessMode.start('timed');
            this.startSpecialLevel(level);
        });
        document.getElementById('endless-survival').addEventListener('click', () => {
            overlay.remove();
            const level = EndlessMode.start('survival');
            this.startSpecialLevel(level);
        });
    },

    // ==========================================
    // 统计数据界面
    // ==========================================
    showStats() {
        const container = document.getElementById('stats-content');
        if (!container) return;

        const overview = typeof Stats !== 'undefined' ? Stats.getOverview() : { totalLevelsCleared: 0, totalScore: 0, totalTimePlayed: 0, totalGamesPlayed: 0, winRate: 0, maxCombo: 0 };
        const gemStats = typeof Stats !== 'undefined' ? Stats.getGemStats() : [];
        const chapterRates = typeof Stats !== 'undefined' ? Stats.getChapterWinRates() : [];
        const specialStats = typeof Stats !== 'undefined' ? Stats.getSpecialStats() : {};
        const dailyStats = typeof Stats !== 'undefined' ? Stats.getDailyStats() : {};
        const endlessStats = typeof Stats !== 'undefined' ? Stats.getEndlessStats() : {};
        const bossStats = typeof Stats !== 'undefined' ? Stats.getBossStats() : {};
        const playTime = typeof Stats !== 'undefined' ? Stats.getPlayTimeTrend('daily') : [];

        // Also pull from Storage stats as fallback
        const storageStats = Storage.getStatistics();
        const totalScore = overview.totalScore || storageStats.totalScore || 0;
        const totalGames = overview.totalGamesPlayed || storageStats.totalGames || 0;
        const totalWins = overview.totalWins || storageStats.totalWins || 0;
        const maxCombo = overview.maxCombo || storageStats.maxCombo || 0;
        const maxLevel = Storage.getMaxUnlockedLevel();
        const totalStars = Storage.getTotalStars();

        // Build gem bar chart
        const topGems = gemStats.slice(0, 7);
        const maxMatched = topGems.length > 0 ? Math.max(...topGems.map(g => g.matched)) : 1;
        const gemBarsHtml = topGems.map(g => {
            const pct = Math.max(5, (g.matched / maxMatched) * 100);
            return `<div style="display:flex;align-items:center;gap:6px;margin:2px 0;">
                <span style="width:24px;text-align:center;">${g.emoji}</span>
                <div style="flex:1;background:rgba(100,100,100,0.2);border-radius:4px;height:16px;overflow:hidden;">
                    <div style="background:linear-gradient(90deg,#fbbf24,#f97316);height:100%;width:${pct}%;border-radius:4px;transition:width 0.3s;"></div>
                </div>
                <span style="font-size:0.7rem;color:var(--text-secondary);min-width:40px;text-align:right;">${Utils.formatNumber(g.matched)}</span>
            </div>`;
        }).join('');

        // Chapter win rates
        const chapterHtml = chapterRates.map(ch => {
            if (ch.played === 0) return '';
            const chData = typeof CHAPTERS !== 'undefined' ? CHAPTERS[ch.chapter - 1] : null;
            return `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(100,100,100,0.15);">
                <span>${chData ? chData.icon : ''} 第${ch.chapter}章</span>
                <span style="color:${ch.winRate >= 80 ? '#22c55e' : ch.winRate >= 50 ? '#eab308' : '#ef4444'};">${ch.winRate}% (${ch.wins}/${ch.played})</span>
            </div>`;
        }).filter(Boolean).join('');

        // Play time bars
        const maxPlayTime = playTime.length > 0 ? Math.max(...playTime.map(p => p.seconds), 1) : 1;
        const playTimeBars = playTime.map(p => {
            const pct = Math.max(3, (p.seconds / maxPlayTime) * 100);
            const time = typeof Stats !== 'undefined' ? Stats.formatTime(p.seconds) : `${p.seconds}s`;
            return `<div style="text-align:center;flex:1;">
                <div style="height:60px;display:flex;align-items:flex-end;justify-content:center;">
                    <div style="background:linear-gradient(to top,#3b82f6,#60a5fa);width:70%;height:${pct}%;border-radius:4px 4px 0 0;min-height:3px;"></div>
                </div>
                <div style="font-size:0.55rem;color:var(--text-secondary);margin-top:2px;">${p.label}</div>
                <div style="font-size:0.55rem;color:#60a5fa;">${time}</div>
            </div>`;
        }).join('');

        container.innerHTML = `
            <div class="stats-section" style="background:rgba(30,27,75,0.5);border-radius:12px;padding:12px;margin-bottom:10px;">
                <h3 style="margin:0 0 8px;font-size:1rem;">📊 总览</h3>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                    <div class="stat-card" style="background:rgba(100,100,100,0.15);padding:8px;border-radius:8px;text-align:center;">
                        <div style="font-size:1.5rem;">🏆</div>
                        <div style="font-size:0.8rem;font-weight:700;">${Utils.formatNumber(totalScore)}</div>
                        <div style="font-size:0.6rem;color:var(--text-secondary);">总分数</div>
                    </div>
                    <div class="stat-card" style="background:rgba(100,100,100,0.15);padding:8px;border-radius:8px;text-align:center;">
                        <div style="font-size:1.5rem;">⭐</div>
                        <div style="font-size:0.8rem;font-weight:700;">${totalStars} / ${maxLevel * 3}</div>
                        <div style="font-size:0.6rem;color:var(--text-secondary);">星星</div>
                    </div>
                    <div class="stat-card" style="background:rgba(100,100,100,0.15);padding:8px;border-radius:8px;text-align:center;">
                        <div style="font-size:1.5rem;">🎮</div>
                        <div style="font-size:0.8rem;font-weight:700;">${totalGames} (${totalWins}胜)</div>
                        <div style="font-size:0.6rem;color:var(--text-secondary);">总局数 (胜率${totalGames > 0 ? Math.round(totalWins / totalGames * 100) : 0}%)</div>
                    </div>
                    <div class="stat-card" style="background:rgba(100,100,100,0.15);padding:8px;border-radius:8px;text-align:center;">
                        <div style="font-size:1.5rem;">🔥</div>
                        <div style="font-size:0.8rem;font-weight:700;">x${maxCombo}</div>
                        <div style="font-size:0.6rem;color:var(--text-secondary);">最高连击</div>
                    </div>
                </div>
                <div style="margin-top:8px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;text-align:center;font-size:0.7rem;">
                    <div>关卡: <b>${maxLevel - 1}</b></div>
                    <div>消除: <b>${Utils.formatNumber(storageStats.totalMatches || 0)}</b></div>
                    <div>特殊: <b>${Utils.formatNumber(storageStats.specialGemsCreated || 0)}</b></div>
                </div>
            </div>

            ${gemBarsHtml ? `
            <div class="stats-section" style="background:rgba(30,27,75,0.5);border-radius:12px;padding:12px;margin-bottom:10px;">
                <h3 style="margin:0 0 8px;font-size:1rem;">💎 宝石统计</h3>
                ${gemBarsHtml}
            </div>` : ''}

            ${chapterHtml ? `
            <div class="stats-section" style="background:rgba(30,27,75,0.5);border-radius:12px;padding:12px;margin-bottom:10px;">
                <h3 style="margin:0 0 8px;font-size:1rem;">📖 章节胜率</h3>
                <div style="font-size:0.8rem;">${chapterHtml}</div>
            </div>` : ''}

            <div class="stats-section" style="background:rgba(30,27,75,0.5);border-radius:12px;padding:12px;margin-bottom:10px;">
                <h3 style="margin:0 0 8px;font-size:1rem;">⚔️ 特殊模式</h3>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:0.75rem;">
                    <div style="padding:6px;background:rgba(100,100,100,0.15);border-radius:6px;">
                        <div style="font-weight:700;">📆 每日挑战</div>
                        <div>完成: ${dailyStats.won || 0}/${dailyStats.played || 0}</div>
                        <div>最高连续: ${dailyStats.bestStreak || 0}天</div>
                    </div>
                    <div style="padding:6px;background:rgba(100,100,100,0.15);border-radius:6px;">
                        <div style="font-weight:700;">♾️ 无尽模式</div>
                        <div>限时最高: Wave ${endlessStats.timedHighWave || 0}</div>
                        <div>生存最高: Wave ${endlessStats.survivalHighWave || 0}</div>
                    </div>
                    <div style="padding:6px;background:rgba(100,100,100,0.15);border-radius:6px;">
                        <div style="font-weight:700;">👹 Boss战</div>
                        <div>击败: ${bossStats.defeated || 0}/${bossStats.attempts || 0}</div>
                        <div>胜率: ${bossStats.winRate || 0}%</div>
                    </div>
                    <div style="padding:6px;background:rgba(100,100,100,0.15);border-radius:6px;">
                        <div style="font-weight:700;">✨ 特殊宝石</div>
                        <div>线: ${specialStats.line || 0} 炸弹: ${specialStats.bomb || 0}</div>
                        <div>彩虹: ${specialStats.rainbow || 0}</div>
                    </div>
                </div>
            </div>

            ${playTimeBars ? `
            <div class="stats-section" style="background:rgba(30,27,75,0.5);border-radius:12px;padding:12px;margin-bottom:10px;">
                <h3 style="margin:0 0 8px;font-size:1rem;">⏱️ 游玩时间 (最近7天)</h3>
                <div style="display:flex;gap:2px;align-items:flex-end;">${playTimeBars}</div>
            </div>` : ''}
        `;

        this.showScreen('stats-screen');
    },

    // ==========================================
    // 季节活动界面
    // ==========================================
    showSeasonalEvents() {
        if (typeof Seasons === 'undefined') {
            this.showToast('季节系统加载中...', 'info');
            return;
        }

        const season = Seasons.getCurrentSeason();
        const points = Seasons.getSeasonPoints();
        const tier = Seasons.getCurrentTier();
        const completed = Seasons.getCompletedSeasonLevels();
        const seasonData = Seasons.getSeasonData();

        const title = document.getElementById('seasonal-title');
        if (title) title.textContent = `${season.emoji} ${season.name}`;

        // Season pass tiers
        const tiersHtml = Seasons.PASS_TIERS.map((t, i) => {
            const unlocked = points >= t.points;
            const claimed = Seasons.isTierClaimed(i);
            return `<div style="display:flex;align-items:center;gap:8px;padding:6px;border-radius:8px;
                background:${unlocked ? 'rgba(34,197,94,0.15)' : 'rgba(100,100,100,0.1)'};
                border:1px solid ${unlocked ? '#22c55e' : '#333'};margin-bottom:4px;">
                <span style="font-size:1.2rem;">${t.icon}</span>
                <div style="flex:1;">
                    <div style="font-size:0.75rem;font-weight:700;color:${unlocked ? '#22c55e' : 'var(--text-secondary)'};">${t.points}分 — ${t.reward}</div>
                </div>
                ${unlocked && !claimed && i > 0 ? `<button class="season-claim-btn" data-tier="${i}" style="padding:4px 8px;background:var(--wow-gold);color:#000;border:none;border-radius:6px;font-size:0.7rem;font-weight:700;cursor:pointer;">领取</button>` : ''}
                ${claimed ? '<span style="font-size:0.7rem;color:#22c55e;">✅</span>' : ''}
            </div>`;
        }).join('');

        // Season levels grid
        const levelsHtml = Array.from({ length: 10 }, (_, i) => {
            const levelData = seasonData.levels?.[i];
            const isCompleted = levelData?.completed;
            const stars = levelData?.stars || 0;
            const isBoss = i === 9;
            return `<button class="level-btn ${isCompleted ? 'completed' : ''}" data-seasonal-level="${i}" style="min-width:60px;position:relative;">
                ${isBoss ? '👹' : i + 1}
                ${isCompleted ? `<div style="font-size:0.6rem;">${'⭐'.repeat(stars)}</div>` : ''}
            </button>`;
        }).join('');

        const nextTier = Seasons.PASS_TIERS[tier + 1];
        const progressPct = nextTier ? Math.min(100, ((points - Seasons.PASS_TIERS[tier].points) / (nextTier.points - Seasons.PASS_TIERS[tier].points) * 100)) : 100;

        const container = document.getElementById('seasonal-content');
        if (!container) return;

        container.innerHTML = `
            <div style="text-align:center;margin-bottom:12px;">
                <div style="font-size:2.5rem;">${season.emoji}</div>
                <div style="font-weight:900;font-size:1.3rem;color:${season.color};">${season.name}</div>
                <div style="font-size:0.8rem;color:var(--text-secondary);">${season.description}</div>
                <div style="font-size:0.75rem;color:#f472b6;margin-top:4px;">🎁 赛季加成: ${season.bonus}</div>
                <div style="font-size:0.7rem;color:var(--text-secondary);">剩余 ${season.daysRemaining} 天</div>
            </div>

            <div style="margin-bottom:12px;">
                <div style="font-size:0.8rem;font-weight:700;">赛季积分: ${Utils.formatNumber(points)}</div>
                <div style="background:#333;border-radius:6px;height:8px;margin:4px 0;">
                    <div style="background:${season.color};height:100%;border-radius:6px;width:${progressPct}%;transition:width 0.3s;"></div>
                </div>
                ${nextTier ? `<div style="font-size:0.7rem;color:var(--text-secondary);">下一级: ${nextTier.points}分 (还差${nextTier.points - points})</div>` : '<div style="font-size:0.7rem;color:var(--wow-gold);">🏆 已达最高等级！</div>'}
            </div>

            <div style="margin-bottom:12px;">
                <h3 style="margin:0 0 8px;">🎯 季节关卡 (${completed}/10)</h3>
                <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;">
                    ${levelsHtml}
                </div>
            </div>

            <div style="margin-bottom:12px;">
                <h3 style="margin:0 0 8px;">🏅 赛季通行证</h3>
                ${tiersHtml}
            </div>
        `;

        // Wire seasonal level buttons
        container.querySelectorAll('[data-seasonal-level]').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.seasonalLevel);
                Audio.play('click');
                const level = Seasons.getSeasonalLevel(idx);
                this.startSpecialLevel(level);
            });
        });

        // Wire claim buttons
        container.querySelectorAll('.season-claim-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tierIdx = parseInt(btn.dataset.tier);
                if (Seasons.claimTierReward(tierIdx)) {
                    Audio.play('levelUp');
                    this.showSeasonalEvents(); // refresh
                }
            });
        });

        this.showScreen('seasonal-screen');
    },

    showVictory(stars, score, maxCombo, goldReward) {
        try {
            document.getElementById('victory-score').textContent = Utils.formatNumber(score);
            document.getElementById('victory-combo').textContent = `x${maxCombo}`;
            document.getElementById('victory-gold').textContent = Utils.formatNumber(goldReward);

            // "Almost next star" encouragement
            const starThresholds = game.level.stars || [0,0,0];
            let nextStarMsg = '';
            if (stars < 3) {
                const nextTarget = starThresholds[stars]; // threshold for next star
                const diff = nextTarget - score;
                if (diff > 0 && diff < nextTarget * 0.3) {
                    nextStarMsg = `差 ${Utils.formatNumber(diff)} 分就 ${stars+1} 星了！再来一次？`;
                } else if (stars < 2) {
                    nextStarMsg = `下一颗星需要 ${Utils.formatNumber(nextTarget)} 分`;
                }
            } else {
                nextStarMsg = '🏆 完美通关！';
            }
            const msgEl = document.getElementById('victory-next-star');
            if (msgEl) msgEl.textContent = nextStarMsg;

            // Buff contribution summary (inside victory modal)
            const buffSummaryEl = document.getElementById('victory-buff-summary');
            if (buffSummaryEl) {
                const buffs = Estate.getActiveBuffs();
                if (buffs.length > 0) {
                    const contributions = [];
                    if (game.scoreMultiplier > 1) {
                        const bonus = score - Math.floor(score / game.scoreMultiplier);
                        contributions.push(`✨ 分数加成: +${Utils.formatNumber(bonus)}分`);
                    }
                    if (buffs.includes('extra_moves')) contributions.push(`🌙 额外步数: +${Estate.getExtraMoves()||2}步`);
                    if (buffs.includes('rainbow_4')) contributions.push('🌈 4消彩虹: 更强消除');
                    if (buffs.includes('start_bomb')) contributions.push('🌟 开局炸弹: 快速开局');
                    if (buffs.includes('gem_bonus')) contributions.push('💎 通关宝石加成');
                    if (contributions.length > 0) {
                        buffSummaryEl.innerHTML = '<div style="font-size:0.75rem;color:#fbbf24;margin-top:6px;padding:6px;background:rgba(251,191,36,0.1);border-radius:8px;border:1px solid rgba(251,191,36,0.2)"><b>🌳 庄园Buff贡献:</b><br>' + contributions.join('<br>') + '</div>';
                        buffSummaryEl.style.display = 'block';
                    } else {
                        buffSummaryEl.style.display = 'none';
                    }
                } else {
                    buffSummaryEl.innerHTML = '<div style="font-size:0.7rem;color:#999;margin-top:6px">💡 升级庄园获得Buff加成 →</div>';
                    buffSummaryEl.style.display = 'block';
                }
            }

            const starsEl = document.getElementById('victory-stars');
            if (starsEl) {
                starsEl.querySelectorAll('.star').forEach((star, i) => {
                    star.classList.remove('earned');
                    if (i < stars) setTimeout(() => { star.classList.add('earned'); Audio.play('star'); }, 300 + i * 400);
                });
            }

            // Show post-level story
            const story = StoryData.getLevel(game.level.id);
            if (story) {
                const outroTexts = [];
                if (story.bossOutro) outroTexts.push(...story.bossOutro);
                else if (story.post) outroTexts.push(story.post);

                if (outroTexts.length > 0) {
                    const charEl = document.getElementById('story-character');
                    if (charEl) charEl.textContent = '🥭';
                    this.showStoryDialog(outroTexts, () => {
                        this.showModal('victory-screen');
                        setTimeout(() => this.showPendingAchievements(), 2000);
                    });
                    return;
                }
            }

            this.showModal('victory-screen');
            // Update next-level button text for special modes
            const nextBtn = document.getElementById('btn-next-level');
            if (nextBtn) {
                const lvl = game.level;
                if (lvl.daily || lvl.weekly || lvl.revenge) {
                    nextBtn.textContent = '返回菜单';
                } else if (lvl.endless) {
                    nextBtn.textContent = `下一波 (Wave ${(lvl.wave || 1) + 1}) ➡️`;
                } else {
                    nextBtn.innerHTML = '下一关 ➡️';
                }
            }

            // Estate nudge after level 3 if no trees planted yet
            if (game.level.id === 3 && !Estate.isTreePlanted('golden_mango') && Storage.getGold() >= 150) {
                setTimeout(() => {
                    this.showToast('💡 攒够金币了！去庄园种棵金芒树，开局自带炸弹！', 'info', 4000);
                }, 3000);
            }
            setTimeout(() => this.showPendingAchievements(), 2000);
        } catch (e) {
            console.error('[UI.showVictory] error:', e);
            this.showModal('victory-screen');
        }
    }
};
