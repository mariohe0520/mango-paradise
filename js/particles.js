/* ==========================================
   芒果庄园 - 粒子效果系统
   Mango Paradise - Particle System
   精致的视觉效果
   ========================================== */

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.container = null;
        this.enabled = true;
        this.animationId = null;
        this.lastTime = 0;
    }

    // 初始化
    init(containerId = 'game-particles') {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = containerId;
            this.container.className = 'game-particles';
            document.body.appendChild(this.container);
        }
        
        // 开始动画循环
        this.startLoop();
    }

    // 设置启用状态
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.clear();
        }
    }

    // 开始动画循环
    startLoop() {
        const loop = (time) => {
            const deltaTime = time - this.lastTime;
            this.lastTime = time;
            
            this.update(deltaTime);
            this.animationId = requestAnimationFrame(loop);
        };
        
        this.animationId = requestAnimationFrame(loop);
    }

    // 停止动画循环
    stopLoop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    // 更新所有粒子
    update(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.life -= deltaTime;
            
            if (particle.life <= 0) {
                particle.element.remove();
                this.particles.splice(i, 1);
            } else {
                this.updateParticle(particle, deltaTime);
            }
        }
    }

    // 更新单个粒子
    updateParticle(particle, deltaTime) {
        // 应用速度
        particle.x += particle.vx * (deltaTime / 16);
        particle.y += particle.vy * (deltaTime / 16);
        
        // 应用重力
        particle.vy += particle.gravity * (deltaTime / 16);
        
        // 应用阻力
        particle.vx *= particle.friction;
        particle.vy *= particle.friction;
        
        // 应用旋转
        particle.rotation += particle.rotationSpeed * (deltaTime / 16);
        
        // 计算透明度
        const lifeRatio = particle.life / particle.maxLife;
        const opacity = particle.fadeOut ? lifeRatio : 1;
        
        // 计算缩放
        const scale = particle.scaleEnd !== undefined 
            ? Utils.lerp(particle.scaleEnd, particle.scale, lifeRatio)
            : particle.scale;
        
        // 应用变换
        particle.element.style.transform = `translate(${particle.x}px, ${particle.y}px) rotate(${particle.rotation}deg) scale(${scale})`;
        particle.element.style.opacity = opacity;
    }

    // 创建粒子
    createParticle(options = {}) {
        if (!this.enabled) return null;
        
        const defaults = {
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            gravity: 0,
            friction: 0.99,
            rotation: 0,
            rotationSpeed: 0,
            scale: 1,
            scaleEnd: undefined,
            life: 1000,
            fadeOut: true,
            className: 'particle',
            content: '',
            color: '#fff',
            size: 10
        };
        
        const config = { ...defaults, ...options };
        
        const element = document.createElement('div');
        element.className = config.className;
        element.innerHTML = config.content;
        element.style.cssText = `
            position: absolute;
            left: 0;
            top: 0;
            width: ${config.size}px;
            height: ${config.size}px;
            background: ${config.color};
            border-radius: 50%;
            pointer-events: none;
            transform: translate(${config.x}px, ${config.y}px);
            will-change: transform, opacity;
            ${config.style || ''}
        `;
        
        this.container.appendChild(element);
        
        const particle = {
            element,
            x: config.x,
            y: config.y,
            vx: config.vx,
            vy: config.vy,
            gravity: config.gravity,
            friction: config.friction,
            rotation: config.rotation,
            rotationSpeed: config.rotationSpeed,
            scale: config.scale,
            scaleEnd: config.scaleEnd,
            life: config.life,
            maxLife: config.life,
            fadeOut: config.fadeOut
        };
        
        this.particles.push(particle);
        return particle;
    }

    // 清除所有粒子
    clear() {
        this.particles.forEach(p => p.element.remove());
        this.particles = [];
    }

    // ==========================================
    // 预设效果
    // ==========================================

    // 消除粒子爆发
    burst(x, y, color, count = 8) {
        if (!this.enabled) return;
        
        const colors = Array.isArray(color) ? color : [color];
        
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
            const speed = 3 + Math.random() * 4;
            const particleColor = colors[Math.floor(Math.random() * colors.length)];
            
            this.createParticle({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                gravity: 0.1,
                friction: 0.96,
                size: 6 + Math.random() * 6,
                color: particleColor,
                life: 600 + Math.random() * 400,
                scaleEnd: 0
            });
        }
    }

    // 星星效果
    stars(x, y, count = 5) {
        if (!this.enabled) return;
        
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 3;
            
            this.createParticle({
                x: x + (Math.random() - 0.5) * 20,
                y: y + (Math.random() - 0.5) * 20,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                gravity: 0.05,
                size: 0,
                content: '⭐',
                color: 'transparent',
                life: 800 + Math.random() * 400,
                rotationSpeed: (Math.random() - 0.5) * 10,
                style: `
                    background: transparent;
                    font-size: ${12 + Math.random() * 8}px;
                    width: auto;
                    height: auto;
                    filter: drop-shadow(0 0 3px gold);
                `
            });
        }
    }

    // 金币效果
    coins(x, y, count = 3) {
        if (!this.enabled) return;
        
        for (let i = 0; i < count; i++) {
            const delay = i * 100;
            
            setTimeout(() => {
                this.createParticle({
                    x: x + (Math.random() - 0.5) * 30,
                    y,
                    vx: (Math.random() - 0.5) * 2,
                    vy: -3 - Math.random() * 2,
                    gravity: 0.15,
                    size: 0,
                    content: '💰',
                    color: 'transparent',
                    life: 1000,
                    rotationSpeed: (Math.random() - 0.5) * 5,
                    style: `
                        background: transparent;
                        font-size: 20px;
                        width: auto;
                        height: auto;
                    `
                });
            }, delay);
        }
    }

    // 闪光效果
    sparkle(x, y) {
        if (!this.enabled) return;
        
        const colors = ['#ffd700', '#fff', '#ffc107', '#ffeb3b'];
        
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 / 12) * i;
            const distance = 15 + Math.random() * 15;
            
            this.createParticle({
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance,
                vx: Math.cos(angle) * 0.5,
                vy: Math.sin(angle) * 0.5,
                size: 3 + Math.random() * 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 400 + Math.random() * 200,
                scaleEnd: 0,
                style: 'box-shadow: 0 0 6px currentColor;'
            });
        }
    }

    // 彩虹效果
    rainbow(x, y) {
        if (!this.enabled) return;
        
        const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];
        
        colors.forEach((color, i) => {
            const angle = (Math.PI * 2 / colors.length) * i - Math.PI / 2;
            const speed = 4;
            
            for (let j = 0; j < 3; j++) {
                this.createParticle({
                    x,
                    y,
                    vx: Math.cos(angle) * speed * (1 + j * 0.3),
                    vy: Math.sin(angle) * speed * (1 + j * 0.3),
                    gravity: 0.08,
                    friction: 0.97,
                    size: 8 - j * 2,
                    color,
                    life: 700 + j * 100,
                    scaleEnd: 0,
                    style: `box-shadow: 0 0 8px ${color};`
                });
            }
        });
    }

    // 爆炸效果
    explosion(x, y, color = '#ef4444') {
        if (!this.enabled) return;
        
        // 中心闪光
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: 60px;
            height: 60px;
            margin-left: -30px;
            margin-top: -30px;
            background: radial-gradient(circle, ${color} 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            animation: ring-expand 0.4s ease-out forwards;
        `;
        this.container.appendChild(flash);
        setTimeout(() => flash.remove(), 400);
        
        // 碎片
        for (let i = 0; i < 16; i++) {
            const angle = (Math.PI * 2 / 16) * i + Math.random() * 0.3;
            const speed = 5 + Math.random() * 5;
            
            this.createParticle({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                gravity: 0.15,
                friction: 0.95,
                size: 4 + Math.random() * 6,
                color,
                life: 500 + Math.random() * 300,
                rotationSpeed: (Math.random() - 0.5) * 20,
                scaleEnd: 0,
                style: 'border-radius: 2px;'
            });
        }
    }

    // 横向消除线
    lineHorizontal(y, startX, endX, color = '#3b82f6') {
        if (!this.enabled) return;
        
        const line = document.createElement('div');
        line.style.cssText = `
            position: absolute;
            left: ${startX}px;
            top: ${y}px;
            width: ${endX - startX}px;
            height: 4px;
            background: linear-gradient(90deg, transparent, ${color}, transparent);
            pointer-events: none;
            animation: fade-out 0.3s ease-out forwards;
            box-shadow: 0 0 10px ${color};
        `;
        this.container.appendChild(line);
        setTimeout(() => line.remove(), 300);
        
        // 粒子
        const particleCount = Math.ceil((endX - startX) / 30);
        for (let i = 0; i < particleCount; i++) {
            this.createParticle({
                x: startX + (endX - startX) * (i / particleCount),
                y,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 4,
                size: 4,
                color,
                life: 400,
                scaleEnd: 0
            });
        }
    }

    // 纵向消除线
    lineVertical(x, startY, endY, color = '#3b82f6') {
        if (!this.enabled) return;
        
        const line = document.createElement('div');
        line.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${startY}px;
            width: 4px;
            height: ${endY - startY}px;
            background: linear-gradient(180deg, transparent, ${color}, transparent);
            pointer-events: none;
            animation: fade-out 0.3s ease-out forwards;
            box-shadow: 0 0 10px ${color};
        `;
        this.container.appendChild(line);
        setTimeout(() => line.remove(), 300);
        
        // 粒子
        const particleCount = Math.ceil((endY - startY) / 30);
        for (let i = 0; i < particleCount; i++) {
            this.createParticle({
                x,
                y: startY + (endY - startY) * (i / particleCount),
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 2,
                size: 4,
                color,
                life: 400,
                scaleEnd: 0
            });
        }
    }

    // 分数飘字
    floatingText(x, y, text, color = '#ffd700') {
        if (!this.enabled) return;
        
        const element = document.createElement('div');
        element.textContent = text;
        element.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            color: ${color};
            font-size: 24px;
            font-weight: bold;
            font-family: 'Cinzel', serif;
            pointer-events: none;
            text-shadow: 0 0 10px ${color}, 2px 2px 4px rgba(0,0,0,0.5);
            animation: score-float 1s ease-out forwards;
            z-index: 100;
        `;
        
        this.container.appendChild(element);
        setTimeout(() => element.remove(), 1000);
    }

    // 连击提示
    comboText(x, y, combo) {
        if (!this.enabled) return;
        
        const element = document.createElement('div');
        element.innerHTML = `
            <div style="font-size: 16px; color: #b8a9c9;">COMBO</div>
            <div style="font-size: 36px; font-weight: 900; background: linear-gradient(135deg, #ffd700, #f97316); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">×${combo}</div>
        `;
        element.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            text-align: center;
            font-family: 'Cinzel', serif;
            pointer-events: none;
            animation: combo-pop 0.8s ease forwards;
            z-index: 100;
            transform: translate(-50%, -50%);
        `;
        
        this.container.appendChild(element);
        setTimeout(() => element.remove(), 800);
    }

    // 胜利庆祝彩带
    confetti(duration = 3000) {
        if (!this.enabled) return;
        
        const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];
        const confettiCount = 100;
        const container = document.getElementById('confetti') || this.container;
        
        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti-piece';
                confetti.style.cssText = `
                    position: absolute;
                    left: ${Math.random() * 100}%;
                    top: -20px;
                    width: ${5 + Math.random() * 10}px;
                    height: ${5 + Math.random() * 10}px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
                    animation: confetti-fall ${2 + Math.random() * 2}s linear forwards;
                    animation-delay: ${Math.random() * 0.5}s;
                `;
                container.appendChild(confetti);
                
                setTimeout(() => confetti.remove(), 4000);
            }, Math.random() * duration * 0.5);
        }
    }

    // 魔法光环
    magicRing(x, y, color = '#8b5cf6') {
        if (!this.enabled) return;
        
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const ring = document.createElement('div');
                ring.style.cssText = `
                    position: absolute;
                    left: ${x}px;
                    top: ${y}px;
                    width: 20px;
                    height: 20px;
                    margin-left: -10px;
                    margin-top: -10px;
                    border: 2px solid ${color};
                    border-radius: 50%;
                    pointer-events: none;
                    animation: ring-expand 0.6s ease-out forwards;
                    box-shadow: 0 0 10px ${color};
                `;
                this.container.appendChild(ring);
                setTimeout(() => ring.remove(), 600);
            }, i * 150);
        }
    }

    // 尾迹效果
    trail(x, y, color = '#ffd700') {
        if (!this.enabled) return;
        
        this.createParticle({
            x,
            y,
            size: 8,
            color,
            life: 300,
            scaleEnd: 0,
            fadeOut: true,
            style: `box-shadow: 0 0 10px ${color};`
        });
    }

    // 背景浮动粒子（用于菜单等）
    backgroundParticles(container, count = 20) {
        if (!this.enabled) return;
        
        const targetContainer = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;
        
        if (!targetContainer) return;
        
        const emojis = ['🥭', '✨', '⭐', '💎', '🌟'];
        
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'float-item';
            particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            particle.style.cssText = `
                position: absolute;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                font-size: ${12 + Math.random() * 20}px;
                opacity: ${0.1 + Math.random() * 0.3};
                animation: float ${4 + Math.random() * 4}s ease-in-out infinite;
                animation-delay: ${-Math.random() * 4}s;
                pointer-events: none;
            `;
            targetContainer.appendChild(particle);
        }
    }
}

// 全局粒子系统实例
const Particles = new ParticleSystem();
