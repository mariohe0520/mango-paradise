/* ==========================================
   芒果庄园 - 轻量粒子系统 (Performance-first)
   CSS-only animations — zero JS animation loop
   ========================================== */

class ParticleSystem {
    constructor() {
        this.container = null;
        this.enabled = true;
        this._count = 0;
        this.MAX_PARTICLES = 15; // hard cap (was 30 — too many for iPhone)
    }

    init(containerId = 'game-particles') {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = containerId;
            this.container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:500;overflow:hidden;';
            document.body.appendChild(this.container);
        }
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) this.clear();
    }

    clear() {
        if (this.container) this.container.innerHTML = '';
        this._count = 0;
    }

    // Core: create a CSS-animated particle (no JS loop)
    _spawn(x, y, color, size, duration, keyframes, extraStyle = '') {
        if (!this.enabled || !this.container) return;
        if (this._count >= this.MAX_PARTICLES) return; // budget exceeded
        this._count++;

        const el = document.createElement('div');
        el.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;background:${color};border-radius:50%;pointer-events:none;animation:${keyframes} ${duration}ms ease-out forwards;${extraStyle}`;
        this.container.appendChild(el);

        // Self-cleanup after animation
        setTimeout(() => {
            el.remove();
            this._count--;
        }, duration + 50);
    }

    // ==========================================
    // Effects
    // ==========================================

    burst(x, y, color, count = 6) {
        if (!this.enabled) return;
        const colors = Array.isArray(color) ? color : [color];
        const actual = Math.min(count, 6); // cap at 6 particles per burst
        for (let i = 0; i < actual; i++) {
            const angle = (i / actual) * Math.PI * 2 + Math.random() * 0.5;
            const dist = 20 + Math.random() * 30;
            const tx = Math.cos(angle) * dist;
            const ty = Math.sin(angle) * dist;
            const c = colors[i % colors.length];
            const s = 4 + Math.random() * 4;
            const name = `p-burst-${Date.now()}-${i}`;
            // Inject keyframes inline via style tag trick — or use transform+opacity
            const el = document.createElement('div');
            el.style.cssText = `position:absolute;left:${x - s/2}px;top:${y - s/2}px;width:${s}px;height:${s}px;background:${c};border-radius:50%;pointer-events:none;opacity:1;transition:all 0.4s ease-out;`;
            if (this.container && this._count < this.MAX_PARTICLES) {
                this.container.appendChild(el);
                this._count++;
                // Trigger transition in next frame
                requestAnimationFrame(() => {
                    el.style.transform = `translate(${tx}px, ${ty}px) scale(0.2)`;
                    el.style.opacity = '0';
                });
                setTimeout(() => { el.remove(); this._count--; }, 450);
            }
        }
    }

    sparkle(x, y) {
        this.burst(x, y, ['#ffd700', '#fff', '#fbbf24'], 4);
    }

    spark(x, y) {
        this.burst(x, y, ['#ff6b35', '#ffd700'], Math.min(3, this.MAX_PARTICLES - this._count));
    }

    rainbow(x, y) {
        this.burst(x, y, ['#ef4444', '#f97316', '#fbbf24', '#22c55e', '#3b82f6', '#8b5cf6'], 6);
    }

    explosion(x, y, color = '#ef4444') {
        this.burst(x, y, [color, '#ff8800', '#ffd700'], 6);
    }

    lineHorizontal(y, startX, endX, color = '#3b82f6') {
        // Simple line flash — no particle loop
        if (!this.enabled || !this.container) return;
        const el = document.createElement('div');
        el.style.cssText = `position:absolute;left:${startX}px;top:${y - 2}px;width:${endX - startX}px;height:4px;background:${color};pointer-events:none;opacity:1;transition:opacity 0.3s ease;`;
        this.container.appendChild(el);
        setTimeout(() => { el.style.opacity = '0'; }, 50);
        setTimeout(() => { el.remove(); }, 400);
    }

    floatingText(x, y, text, color = '#ffd700') {
        if (!this.enabled || !this.container) return;
        const el = document.createElement('div');
        el.textContent = text;
        el.style.cssText = `position:absolute;left:${x}px;top:${y}px;color:${color};font-weight:900;font-size:1rem;pointer-events:none;text-shadow:0 1px 3px rgba(0,0,0,0.5);white-space:nowrap;transform:translate(-50%,-50%);opacity:1;transition:all 0.6s ease-out;`;
        this.container.appendChild(el);
        requestAnimationFrame(() => {
            el.style.transform = 'translate(-50%, -80px) scale(1.3)';
            el.style.opacity = '0';
        });
        setTimeout(() => el.remove(), 700);
    }

    magicRing(x, y, color = '#8b5cf6') {
        if (!this.enabled || !this.container) return;
        const el = document.createElement('div');
        el.style.cssText = `position:absolute;left:${x - 30}px;top:${y - 30}px;width:60px;height:60px;border:3px solid ${color};border-radius:50%;pointer-events:none;opacity:1;transition:all 0.5s ease-out;`;
        this.container.appendChild(el);
        requestAnimationFrame(() => {
            el.style.width = '120px';
            el.style.height = '120px';
            el.style.left = `${x - 60}px`;
            el.style.top = `${y - 60}px`;
            el.style.opacity = '0';
        });
        setTimeout(() => el.remove(), 600);
    }

    // Combo text with BIG scale pop animation
    comboText(x, y, combo, color = '#ffd700') {
        if (!this.enabled || !this.container) return;
        const comboNames = ['', '', 'GOOD!', 'GREAT!', 'AMAZING!', 'INCREDIBLE!', 'LEGENDARY!', 'GODLIKE!'];
        const comboName = comboNames[Math.min(combo, comboNames.length - 1)] || `x${combo}`;
        const el = document.createElement('div');
        el.innerHTML = `<div style="font-size:2rem;font-weight:900;line-height:1;">${comboName}</div><div style="font-size:1.2rem;opacity:0.8;">x${combo} COMBO</div>`;
        const colors = ['', '', '#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444', '#ff0000'];
        const c = colors[Math.min(combo, colors.length - 1)] || '#ff0000';
        el.style.cssText = `position:absolute;left:${x}px;top:${y}px;color:${c};font-weight:900;pointer-events:none;text-shadow:0 0 20px ${c}, 0 2px 4px rgba(0,0,0,0.8);white-space:nowrap;transform:translate(-50%,-50%) scale(0.3);opacity:0;transition:all 0.5s cubic-bezier(0.175,0.885,0.32,1.275);text-align:center;z-index:100;`;
        this.container.appendChild(el);
        requestAnimationFrame(() => {
            el.style.transform = 'translate(-50%, -80px) scale(1.2)';
            el.style.opacity = '1';
        });
        setTimeout(() => {
            el.style.transform = 'translate(-50%, -120px) scale(0.8)';
            el.style.opacity = '0';
        }, 500);
        setTimeout(() => el.remove(), 1100);
    }

    // Gem shatter effect — small colored fragments flying outward
    shatter(x, y, color, count = 8) {
        if (!this.enabled || !this.container) return;
        const actual = Math.min(count, 10);
        for (let i = 0; i < actual; i++) {
            const angle = (i / actual) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
            const dist = 25 + Math.random() * 40;
            const tx = Math.cos(angle) * dist;
            const ty = Math.sin(angle) * dist - 10; // slight upward bias
            const size = 3 + Math.random() * 4;
            const rotation = Math.random() * 360;
            const el = document.createElement('div');
            // Shard shape: slightly elongated, not round
            el.style.cssText = `position:absolute;left:${x - size/2}px;top:${y - size/2}px;width:${size}px;height:${size * 1.4}px;background:${color};border-radius:2px;pointer-events:none;opacity:1;transform:rotate(${rotation}deg);transition:all 0.45s cubic-bezier(0.25,0.46,0.45,0.94);box-shadow:0 0 4px ${color};`;
            if (this.container && this._count < this.MAX_PARTICLES) {
                this.container.appendChild(el);
                this._count++;
                requestAnimationFrame(() => {
                    el.style.transform = `translate(${tx}px, ${ty}px) rotate(${rotation + 180}deg) scale(0.2)`;
                    el.style.opacity = '0';
                });
                setTimeout(() => { el.remove(); this._count--; }, 500);
            }
        }
    }

    // Score floating number (big, fades up)
    scoreFloat(x, y, score, color = '#ffd700') {
        if (!this.enabled || !this.container) return;
        const el = document.createElement('div');
        el.textContent = `+${score}`;
        el.style.cssText = `position:absolute;left:${x}px;top:${y}px;color:${color};font-weight:900;font-size:1.4rem;pointer-events:none;text-shadow:0 1px 4px rgba(0,0,0,0.7), 0 0 8px ${color}40;white-space:nowrap;transform:translate(-50%,-50%);opacity:1;transition:all 0.7s ease-out;z-index:100;`;
        this.container.appendChild(el);
        requestAnimationFrame(() => {
            el.style.transform = 'translate(-50%, -60px) scale(1.1)';
            el.style.opacity = '0';
        });
        setTimeout(() => el.remove(), 800);
    }

    // Line vertical
    lineVertical(x, startY, endY, color = '#3b82f6') {
        if (!this.enabled || !this.container) return;
        const el = document.createElement('div');
        el.style.cssText = `position:absolute;left:${x - 2}px;top:${startY}px;width:4px;height:${endY - startY}px;background:${color};pointer-events:none;opacity:1;transition:opacity 0.3s ease;`;
        this.container.appendChild(el);
        setTimeout(() => { el.style.opacity = '0'; }, 50);
        setTimeout(() => el.remove(), 400);
    }

    // Confetti
    confetti() {
        if (!this.enabled || !this.container) return;
        const colors = ['#ef4444', '#f97316', '#fbbf24', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];
        for (let i = 0; i < 10; i++) {
            const el = document.createElement('div');
            const c = colors[i % colors.length];
            const x = Math.random() * window.innerWidth;
            const size = 4 + Math.random() * 6;
            el.style.cssText = `position:absolute;left:${x}px;top:-10px;width:${size}px;height:${size * 1.5}px;background:${c};pointer-events:none;opacity:1;border-radius:1px;transition:all ${1 + Math.random()}s ease-out;`;
            this.container.appendChild(el);
            requestAnimationFrame(() => {
                el.style.transform = `translateY(${window.innerHeight + 50}px) rotate(${Math.random()*720}deg)`;
                el.style.opacity = '0';
            });
            setTimeout(() => el.remove(), 2500);
        }
    }

    // Coins
    coins(x, y) {
        this.burst(x, y, ['#fbbf24', '#ffd700', '#f59e0b'], 5);
    }

    // Background particles in a container
    backgroundParticles(selector, count = 10) {
        if (!this.enabled) return;
        const container = typeof selector === 'string' ? document.querySelector(selector) : selector;
        if (!container) return;
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.style.cssText = `
                position: absolute;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                width: ${3 + Math.random() * 6}px;
                height: ${3 + Math.random() * 6}px;
                background: rgba(247, 147, 30, ${0.15 + Math.random() * 0.2});
                border-radius: 50%;
                pointer-events: none;
                animation: float ${4 + Math.random() * 6}s ease-in-out infinite;
                animation-delay: ${-Math.random() * 5}s;
            `;
            container.appendChild(p);
        }
    }

    // Backward compat stubs
    startLoop() {}
    stopLoop() {}
    update() {}
}

const Particles = new ParticleSystem();
