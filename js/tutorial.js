/* ==========================================
   芒果庄园 - 新手教程
   Mango Paradise - Tutorial System
   引导新玩家入门
   ========================================== */

const Tutorial = {
    isActive: false,
    currentStep: 0,
    steps: [],
    
    // 教程步骤定义
    tutorialSteps: [
        {
            id: 'welcome',
            text: '欢迎来到芒果庄园！🥭 我是芒果精灵，让我来教你如何游戏！',
            target: null,
            position: 'center'
        },
        {
            id: 'board',
            text: '这是游戏棋盘，上面有各种艾泽拉斯的种族宝石。你的目标是消除它们！',
            target: '#game-board',
            position: 'bottom'
        },
        {
            id: 'match',
            text: '点击一个宝石，然后点击相邻的另一个宝石来交换它们。当三个或更多相同的宝石连成一线时，它们就会消除！',
            target: '#game-board',
            position: 'bottom',
            highlight: true
        },
        {
            id: 'objectives',
            text: '每一关都有不同的目标，比如收集特定数量的宝石或达到一定分数。完成目标才能过关！',
            target: '#game-objectives',
            position: 'bottom'
        },
        {
            id: 'moves',
            text: '注意！你的步数是有限的。每交换一次就会消耗一步，要合理规划哦！',
            target: '.stat.moves',
            position: 'bottom'
        },
        {
            id: 'special4',
            text: '💡 小技巧：连接 4 个相同的宝石可以创建闪电宝石，激活时会清除整行或整列！',
            target: '#game-board',
            position: 'bottom'
        },
        {
            id: 'special5',
            text: '🌈 连接 5 个或更多宝石可以创建彩虹宝石！它可以消除棋盘上所有同类型的宝石！',
            target: '#game-board',
            position: 'bottom'
        },
        {
            id: 'powerups',
            text: '这些是道具按钮。锤子可以消除单个宝石，洗牌可以重排棋盘，灯泡可以给你提示！',
            target: '.game-powerups',
            position: 'top'
        },
        {
            id: 'combo',
            text: '连续消除会触发连击，连击越多分数加成越高！尝试规划你的移动来获得更高连击！',
            target: '#game-board',
            position: 'bottom'
        },
        {
            id: 'ready',
            text: '准备好了吗？现在就开始你的芒果庄园冒险吧！祝你玩得开心！🎮',
            target: null,
            position: 'center'
        }
    ],

    // 开始教程
    start() {
        if (Storage.getTutorial().completed) return;
        
        this.isActive = true;
        this.currentStep = 0;
        this.steps = [...this.tutorialSteps];
        
        const overlay = document.getElementById('tutorial-overlay');
        if (overlay) {
            overlay.style.display = 'block';
        }
        
        this.showStep(0);
        this.bindEvents();
    },

    // 绑定事件
    bindEvents() {
        document.getElementById('tutorial-next')?.addEventListener('click', () => {
            this.nextStep();
        });
        
        document.getElementById('tutorial-skip')?.addEventListener('click', () => {
            this.skip();
        });
    },

    // 显示步骤
    showStep(index) {
        if (index >= this.steps.length) {
            this.complete();
            return;
        }
        
        const step = this.steps[index];
        this.currentStep = index;
        
        // 更新文本
        const textEl = document.getElementById('tutorial-text');
        if (textEl) {
            textEl.innerHTML = step.text;
        }
        
        // 更新进度指示器
        this.updateProgress();
        
        // 更新聚光灯
        this.updateSpotlight(step);
        
        // 更新对话框位置
        this.updateDialogPosition(step);
        
        // 更新按钮
        const nextBtn = document.getElementById('tutorial-next');
        if (nextBtn) {
            nextBtn.textContent = index === this.steps.length - 1 ? '开始游戏！' : '下一步';
        }
    },

    // 更新进度指示器
    updateProgress() {
        const progressEl = document.getElementById('tutorial-progress');
        if (progressEl) {
            progressEl.innerHTML = this.steps.map((_, i) => 
                `<span class="dot ${i === this.currentStep ? 'active' : ''}"></span>`
            ).join('');
        }
    },

    // 更新聚光灯
    updateSpotlight(step) {
        const spotlight = document.getElementById('tutorial-spotlight');
        if (!spotlight) return;
        
        if (step.target) {
            const target = document.querySelector(step.target);
            if (target) {
                const rect = target.getBoundingClientRect();
                const padding = 10;
                
                spotlight.style.display = 'block';
                spotlight.style.left = `${rect.left - padding}px`;
                spotlight.style.top = `${rect.top - padding}px`;
                spotlight.style.width = `${rect.width + padding * 2}px`;
                spotlight.style.height = `${rect.height + padding * 2}px`;
                
                if (step.highlight) {
                    spotlight.style.animation = 'hint-glow 1s ease-in-out infinite';
                } else {
                    spotlight.style.animation = 'none';
                }
            }
        } else {
            spotlight.style.display = 'none';
        }
    },

    // 更新对话框位置
    updateDialogPosition(step) {
        const dialog = document.getElementById('tutorial-dialog');
        if (!dialog) return;
        
        dialog.style.position = 'absolute';
        
        if (step.position === 'center' || !step.target) {
            dialog.style.bottom = '100px';
            dialog.style.top = 'auto';
            dialog.style.left = '50%';
            dialog.style.transform = 'translateX(-50%)';
        } else if (step.position === 'top') {
            const target = document.querySelector(step.target);
            if (target) {
                const rect = target.getBoundingClientRect();
                dialog.style.bottom = `${window.innerHeight - rect.top + 20}px`;
                dialog.style.top = 'auto';
            }
        } else if (step.position === 'bottom') {
            const target = document.querySelector(step.target);
            if (target) {
                const rect = target.getBoundingClientRect();
                dialog.style.top = `${rect.bottom + 20}px`;
                dialog.style.bottom = 'auto';
            }
        }
    },

    // 下一步
    nextStep() {
        Audio.play('click');
        
        if (this.currentStep < this.steps.length - 1) {
            this.showStep(this.currentStep + 1);
        } else {
            this.complete();
        }
    },

    // 跳过教程
    skip() {
        Audio.play('click');
        this.complete();
    },

    // 完成教程
    complete() {
        this.isActive = false;
        
        const overlay = document.getElementById('tutorial-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
        
        Storage.completeTutorial();
        Achievements.check('tutorial');
        
        UI.showToast('教程完成！开始你的冒险吧！', 'success');
    },

    // 检查是否需要显示特定教程
    checkTrigger(trigger, data = {}) {
        // 可以在这里添加更多的情境教程
        switch (trigger) {
            case 'first_special':
                if (!Storage.data.tutorial.seenSpecial) {
                    Storage.data.tutorial.seenSpecial = true;
                    Storage.save();
                    this.showTip('🎉 你创建了第一个特殊宝石！激活它可以产生强大的效果！');
                }
                break;
                
            case 'low_moves':
                if (data.moves <= 5 && !Storage.data.tutorial.seenLowMoves) {
                    Storage.data.tutorial.seenLowMoves = true;
                    Storage.save();
                    this.showTip('⚠️ 步数不多了！仔细考虑每一步！');
                }
                break;
                
            case 'high_combo':
                if (data.combo >= 5 && !Storage.data.tutorial.seenHighCombo) {
                    Storage.data.tutorial.seenHighCombo = true;
                    Storage.save();
                    this.showTip('🔥 太棒了！高连击可以获得更多分数！');
                }
                break;
        }
    },

    // 显示简短提示
    showTip(text) {
        UI.showToast(text, 'info');
    }
};
