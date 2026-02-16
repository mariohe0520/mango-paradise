/* ==========================================
   芒果庄园 - 主入口
   Mango Paradise - Main Entry
   游戏初始化和启动
   ========================================== */

// 加载提示
const LOADING_TIPS = [
    '💡 提示：连接4个以上可以产生特殊宝石！',
    '💡 彩虹宝石可以消除所有同类型的宝石！',
    '💡 尝试创造连击来获得更高分数！',
    '💡 每日签到可以获得丰厚奖励！',
    '💡 收集图鉴可以解锁更多内容！',
    '💡 完成成就可以获得金币和宝石！',
    '💡 L型和T型消除可以创建炸弹宝石！',
    '💡 道具可以帮你渡过难关！',
    '🥭 芒果过敏最喜欢魔兽世界！',
    '⚔️ 为了部落！为了芒果！'
];

// 应用程序主类
class App {
    constructor() {
        this.isInitialized = false;
        this.loadingProgress = 0;
    }

    // 初始化应用
    async init() {
        try {
            // 显示加载画面
            this.showLoading();
            this.updateLoadingTip();
            
            // 步骤1：预加载字体
            this.updateProgress(10, '加载字体...');
            await Utils.preloadFonts();
            
            // 步骤2：初始化存储
            this.updateProgress(30, '读取存档...');
            Storage.init();
            
            // 步骤3：初始化音频（等待用户交互）
            this.updateProgress(50, '初始化音效...');
            this.setupAudioInit();
            
            // 步骤4：初始化粒子系统
            this.updateProgress(70, '准备特效...');
            Particles.init('game-particles');
            
            // 步骤5：初始化 UI
            this.updateProgress(85, '准备界面...');
            UI.init();
            
            // 步骤6：应用保存的设置
            this.updateProgress(95, '应用设置...');
            this.applySettings();
            
            // 完成
            this.updateProgress(100, '准备就绪！');
            
            await Utils.wait(500);
            
            // 隐藏加载画面，显示主菜单
            this.hideLoading();
            UI.showScreen('main-menu');
            
            // 添加背景粒子
            Particles.backgroundParticles('.floating-elements', 15);
            
            this.isInitialized = true;
            Utils.log.success('App initialized successfully');
            
        } catch (error) {
            Utils.log.error('Failed to initialize app:', error);
            this.showError('初始化失败，请刷新页面重试');
        }
    }

    // 显示加载画面
    showLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('active');
        }
        
        // 添加加载粒子
        const particlesContainer = document.getElementById('loading-particles');
        if (particlesContainer) {
            for (let i = 0; i < 20; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.cssText = `
                    position: absolute;
                    left: ${Math.random() * 100}%;
                    top: ${Math.random() * 100}%;
                    width: ${4 + Math.random() * 8}px;
                    height: ${4 + Math.random() * 8}px;
                    background: rgba(247, 147, 30, ${0.2 + Math.random() * 0.3});
                    border-radius: 50%;
                    animation: float ${3 + Math.random() * 4}s ease-in-out infinite;
                    animation-delay: ${-Math.random() * 3}s;
                `;
                particlesContainer.appendChild(particle);
            }
        }
    }

    // 隐藏加载画面
    hideLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            loadingScreen.style.transition = 'opacity 0.5s ease';
            
            setTimeout(() => {
                loadingScreen.classList.remove('active');
                loadingScreen.style.opacity = '';
            }, 500);
        }
    }

    // 更新加载进度
    updateProgress(percent, text) {
        this.loadingProgress = percent;
        
        const progressBar = document.querySelector('.loading-progress');
        const loadingText = document.querySelector('.loading-text');
        
        if (progressBar) {
            progressBar.style.width = `${percent}%`;
        }
        
        if (loadingText && text) {
            loadingText.textContent = text;
        }
    }

    // 更新加载提示
    updateLoadingTip() {
        const tipEl = document.getElementById('loading-tip');
        if (tipEl) {
            let tipIndex = 0;
            tipEl.textContent = LOADING_TIPS[tipIndex];
            
            const tipInterval = setInterval(() => {
                if (this.loadingProgress >= 100) {
                    clearInterval(tipInterval);
                    return;
                }
                
                tipIndex = (tipIndex + 1) % LOADING_TIPS.length;
                tipEl.style.opacity = '0';
                
                setTimeout(() => {
                    tipEl.textContent = LOADING_TIPS[tipIndex];
                    tipEl.style.opacity = '1';
                }, 300);
            }, 3000);
        }
    }

    // 设置音频初始化（需要用户交互）
    setupAudioInit() {
        const initAudio = async () => {
            await Audio.init();
            // 可选：播放背景音乐
            // Audio.startBGM();
            
            // 移除监听器
            document.removeEventListener('click', initAudio);
            document.removeEventListener('touchstart', initAudio);
        };
        
        document.addEventListener('click', initAudio, { once: true });
        document.addEventListener('touchstart', initAudio, { once: true });
    }

    // 应用保存的设置
    applySettings() {
        const settings = Storage.getSettings();
        
        Audio.setSfxEnabled(settings.sfxEnabled);
        Audio.setMusicEnabled(settings.musicEnabled);
        Audio.setVolume(settings.volume / 100);
        Particles.setEnabled(settings.particles);
    }

    // 显示错误
    showError(message) {
        const loadingText = document.querySelector('.loading-text');
        if (loadingText) {
            loadingText.textContent = message;
            loadingText.style.color = '#ef4444';
        }
    }
}

// 全局应用实例
const app = new App();

// 页面加载完成后启动
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

// 处理页面可见性变化
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // 页面隐藏时
        if (game && !game.isGameOver) {
            game.pause();
        }
        Storage.data.offline.lastOnline = Date.now();
        Storage.save();
    } else {
        // 页面显示时
        if (game && game.isPaused && UI.currentScreen === 'game-screen') {
            // 不自动恢复，让玩家手动点击继续
        }
    }
});

// 处理窗口大小变化
window.addEventListener('resize', Utils.debounce(() => {
    // 重新计算一些尺寸相关的东西
    if (game && UI.currentScreen === 'game-screen') {
        // 可能需要重新定位一些元素
    }
}, 250));

// 防止双指缩放
document.addEventListener('gesturestart', (e) => {
    e.preventDefault();
});

// 防止橡皮筋效果 — 只在游戏棋盘区域阻止默认滚动
// 其他所有页面（菜单、庄园、图鉴、设置等）保留原生滚动
document.body.addEventListener('touchmove', (e) => {
    // Only block scroll inside the game board (swipe = game action, not scroll)
    if (e.target.closest('#game-board, .game-board, .game-board-container')) {
        e.preventDefault();
    }
    // Everything else: allow native scroll
}, { passive: false });

// PWA 支持 - Service Worker 注册
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // 如果需要离线支持，可以注册 service worker
        // navigator.serviceWorker.register('/sw.js');
    });
}

// 错误处理
window.addEventListener('error', (e) => {
    Utils.log.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    Utils.log.error('Unhandled rejection:', e.reason);
});

// 调试工具（开发时使用）
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    window.DEBUG = {
        game,
        Storage,
        Audio,
        Particles,
        Achievements,
        Collection,
        UI,
        Tutorial,
        
        // 便捷方法
        addGold: (amount) => { Storage.addGold(amount); UI.updateMenuDisplay(); },
        addGems: (amount) => { Storage.addGems(amount); UI.updateMenuDisplay(); },
        unlockAll: () => {
            Storage.data.progress.maxUnlockedLevel = getTotalLevels();
            Storage.save();
            UI.updateMenuDisplay();
            console.log(`All ${getTotalLevels()} levels unlocked!`);
        },
        completeLevel: (id, stars = 3) => {
            Storage.completedLevel(id, stars, 50000);
            UI.updateMenuDisplay();
        },
        resetProgress: () => {
            Storage.reset();
            UI.updateMenuDisplay();
            console.log('Progress reset!');
        }
    };
    
    console.log('%c🥭 芒果庄园 Debug Mode', 'color: #f7931e; font-size: 20px; font-weight: bold;');
    console.log('Available commands: window.DEBUG');
}
