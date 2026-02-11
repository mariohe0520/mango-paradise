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
        
        document.getElementById('btn-leaderboard')?.addEventListener('click', () => {
            Audio.play('click');
            this.showLeaderboard();
        });
        
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

        // 胜利界面
        document.getElementById('btn-victory-menu')?.addEventListener('click', () => {
            Audio.play('click');
            this.hideModal('victory-screen');
            this.showScreen('main-menu');
        });
        
        document.getElementById('btn-next-level')?.addEventListener('click', () => {
            Audio.play('click');
            this.hideModal('victory-screen');
            const nextLevel = game.level.id + 1;
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
        
        // 玩家信息
        document.getElementById('menu-avatar')?.textContent && 
            (document.getElementById('menu-avatar').textContent = player.avatar);
        document.getElementById('menu-player-name')?.textContent && 
            (document.getElementById('menu-player-name').textContent = player.name);
        document.getElementById('menu-player-level')?.textContent && 
            (document.getElementById('menu-player-level').textContent = player.level);
        
        // 货币
        document.getElementById('menu-gold')?.textContent && 
            (document.getElementById('menu-gold').textContent = Utils.formatNumber(Storage.getGold()));
        document.getElementById('menu-gems')?.textContent && 
            (document.getElementById('menu-gems').textContent = Utils.formatNumber(Storage.getGems()));
        
        // 当前关卡
        const currentLevel = Storage.getMaxUnlockedLevel();
        document.getElementById('current-level-display')?.textContent && 
            (document.getElementById('current-level-display').textContent = Math.min(currentLevel, getTotalLevels()));

        // 每日签到徽章
        const dailyBadge = document.getElementById('daily-badge');
        if (dailyBadge) {
            dailyBadge.style.display = Storage.canCheckin() ? 'flex' : 'none';
        }

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
        document.getElementById('levels-gold')?.textContent && 
            (document.getElementById('levels-gold').textContent = Utils.formatNumber(Storage.getGold()));
        document.getElementById('levels-gems')?.textContent && 
            (document.getElementById('levels-gems').textContent = Utils.formatNumber(Storage.getGems()));

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
        const levels = getChapterLevels(chapterId);
        const maxUnlocked = Storage.getMaxUnlockedLevel();
        
        // 更新章节信息
        document.getElementById('chapter-name')?.textContent && 
            (document.getElementById('chapter-name').textContent = `${chapter.icon} ${chapter.name}`);
        document.getElementById('chapter-desc')?.textContent && 
            (document.getElementById('chapter-desc').textContent = chapter.description);

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

    // 开始关卡
    startLevel(levelId) {
        const level = getLevel(levelId);
        
        // 更新游戏界面信息
        const chapter = getChapter(level.chapter);
        document.getElementById('game-chapter')?.textContent && 
            (document.getElementById('game-chapter').textContent = chapter.name);
        document.getElementById('game-level')?.textContent && 
            (document.getElementById('game-level').textContent = levelId);

        // 切换到游戏界面
        this.showScreen('game-screen');
        
        // 初始化游戏
        game.init(levelId);
        
        // 首次游戏显示教程
        if (!Storage.getTutorial().completed && levelId === 1) {
            Tutorial.start();
        }
    },

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

    // 胜利界面
    showVictory(stars, score, maxCombo, goldReward) {
        // 更新显示
        document.getElementById('victory-score').textContent = Utils.formatNumber(score);
        document.getElementById('victory-combo').textContent = `x${maxCombo}`;
        document.getElementById('victory-gold').textContent = Utils.formatNumber(goldReward);

        // 星星动画
        const starsEl = document.getElementById('victory-stars');
        if (starsEl) {
            starsEl.querySelectorAll('.star').forEach((star, i) => {
                star.classList.remove('earned');
                if (i < stars) {
                    setTimeout(() => {
                        star.classList.add('earned');
                        Audio.play('star');
                    }, 300 + i * 400);
                }
            });
        }

        this.showModal('victory-screen');

        // 显示解锁的成就
        setTimeout(() => {
            this.showPendingAchievements();
        }, 2000);
    },

    // 失败界面
    showDefeat(score, progressPercent) {
        document.getElementById('defeat-score').textContent = Utils.formatNumber(score);
        document.getElementById('defeat-progress').textContent = `${progressPercent}%`;
        
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

    // 成就界面
    showAchievements() {
        const unlockedCount = Achievements.getUnlockedCount();
        const totalCount = Achievements.getTotalCount();
        
        document.getElementById('achievements-unlocked').textContent = unlockedCount;
        document.getElementById('achievements-total').textContent = totalCount;

        const listEl = document.getElementById('achievements-list');
        if (listEl) {
            const achievements = Achievements.getAll();
            
            listEl.innerHTML = achievements.map(achievement => {
                const isUnlocked = Achievements.isUnlocked(achievement.id);
                const progress = Achievements.getProgress(achievement.id);
                
                return `
                    <div class="achievement-item ${isUnlocked ? 'unlocked' : 'locked'}">
                        <div class="achievement-icon">${achievement.icon}</div>
                        <div class="achievement-info">
                            <div class="achievement-name">${achievement.name}</div>
                            <div class="achievement-desc">${achievement.description}</div>
                            ${!isUnlocked && progress ? `
                                <div class="achievement-progress-bar">
                                    <div class="progress" style="width: ${progress.percentage}%"></div>
                                </div>
                                <div class="achievement-progress-text">${progress.current}/${progress.target}</div>
                            ` : ''}
                        </div>
                        <div class="achievement-reward">
                            ${achievement.reward.gold ? `💰${achievement.reward.gold}` : ''}
                            ${achievement.reward.gems ? `💎${achievement.reward.gems}` : ''}
                        </div>
                    </div>
                `;
            }).join('');
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

    // 设置界面
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
        
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    },

    // 显示成就解锁弹窗
    showAchievementPopup(achievement) {
        const popup = document.getElementById('achievement-popup');
        if (!popup) return;
        
        document.getElementById('popup-achievement-icon').textContent = achievement.icon;
        document.getElementById('popup-achievement-name').textContent = achievement.name;
        
        popup.classList.add('show');
        Audio.play('achievement');
        
        setTimeout(() => {
            popup.classList.remove('show');
        }, 3000);
    },

    // 显示待处理的成就
    showPendingAchievements() {
        const pending = Achievements.getPendingUnlocks();
        
        pending.forEach((achievement, index) => {
            setTimeout(() => {
                this.showAchievementPopup(achievement);
            }, index * 3500);
        });
    }
};
