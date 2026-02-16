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
            if (DailyChallenge.hasPlayedToday()) {
                this.showToast('今天已挑战过了，明天再来！', 'info');
                return;
            }
            const level = DailyChallenge.generate();
            this.startSpecialLevel(level);
        });

        document.getElementById('btn-endless')?.addEventListener('click', () => {
            Audio.play('click');
            const level = EndlessMode.start();
            this.startSpecialLevel(level);
        });

        document.getElementById('btn-leaderboard')?.addEventListener('click', () => {
            Audio.play('click');
            this.showLeaderboard();
        });

        document.getElementById('btn-weekly')?.addEventListener('click', () => {
            Audio.play('click');
            this.showWeeklyChallenge();
        });
        
        document.getElementById('btn-estate')?.addEventListener('click', () => {
            Audio.play('click');
            this.showEstate();
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

        // Story dialog
        document.getElementById('story-continue-btn')?.addEventListener('click', () => {
            this.advanceStoryDialog();
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
    showDefeat(score, progressPercent) {
        document.getElementById('defeat-score').textContent = Utils.formatNumber(score);
        document.getElementById('defeat-progress').textContent = `${progressPercent}%`;

        // Encouraging message based on how close they were
        const msgEl = document.getElementById('defeat-message');
        if (msgEl) {
            if (progressPercent >= 90) msgEl.textContent = '就差一点点！再来一次绝对能过！💪';
            else if (progressPercent >= 70) msgEl.textContent = '已经很接近了！试试不同的策略？';
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
            setTimeout(() => { this.showAchievementPopup(achievement); }, index * 3500);
        });
    },

    // ==========================================
    // 庄园系统 UI
    // ==========================================

    showEstate() {
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

        // Spirits — with upgrade + more spirits
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
                return `<div class="spirit-card ${active ? 'active' : ''} ${unlocked ? '' : 'locked'}" data-spirit="${spirit.id}">
                    <div class="spirit-emoji">${spirit.emoji}</div>
                    <div class="spirit-name">${spirit.name} ${level > 0 ? `<small>Lv.${level}</small>` : ''}</div>
                    <div class="spirit-desc">${spirit.skillName}: ${skillDesc}</div>
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

            // Show story if available
            const story = StoryData.getLevel(levelId);
            if (story) {
                const introTexts = [];
                if (story.pre) introTexts.push(story.pre);
                if (story.bossIntro) introTexts.push(...story.bossIntro);

                if (introTexts.length > 0) {
                    // Show story character — bigger for boss
                    const charEl = document.getElementById('story-character');
                    if (charEl) {
                        charEl.textContent = story.bossIntro ? (Boss.BOSSES[levelId]?.emoji || '🥭') : '🥭';
                        charEl.classList.toggle('boss-intro', !!story.bossIntro);
                    }

                    this.showStoryDialog(introTexts, () => {
                        this.doStartLevel(levelId);
                    });
                    return;
                }
            }

            this.doStartLevel(levelId);
        } catch (e) {
            console.error('[UI.startLevel] error:', e);
            // Fallback: try direct init
            this.doStartLevel(levelId);
        }
    },

    // Start a special/procedural level (daily challenge, endless mode)
    startSpecialLevel(levelConfig) {
        try {
            // Inject the level config into the levels system temporarily
            window._specialLevel = levelConfig;
            this.showScreen('game-screen');
            game.initSpecial(levelConfig);
            const gameScreen = document.getElementById('game-screen');
            if (gameScreen) {
                gameScreen.classList.toggle('boss-active', !!levelConfig.boss);
                gameScreen.dataset.theme = levelConfig.boss ? 'fire' : 'forest';
            }
            const bossBar = document.getElementById('boss-bar');
            if (bossBar) bossBar.style.display = levelConfig.boss ? 'block' : 'none';
        } catch (e) {
            console.error('[startSpecialLevel] error:', e);
            this.showToast('加载失败，请重试', 'error');
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

            if (!Storage.getTutorial().completed && levelId === 1) Tutorial.start();

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
            setTimeout(() => this.showPendingAchievements(), 2000);
        } catch (e) {
            console.error('[UI.showVictory] error:', e);
            this.showModal('victory-screen');
        }
    }
};
