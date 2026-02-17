/* ==========================================
   芒果庄园 - 新手教程 & 上下文提示 (v10)
   Mango Paradise - Onboarding Tutorial + Contextual Hints
   ========================================== */

const Tutorial = {
    // ─── State ───
    isActive: false,
    currentStepIndex: -1,
    _overlay: null,
    _tooltip: null,
    _arrow: null,
    _boundTap: null,

    // ─── localStorage key ───
    STORAGE_KEY: 'mango_tutorial_state',

    // ─── Default persisted state ───
    _defaultState: {
        // First-time tutorial steps
        ft_welcome: false,
        ft_special: false,
        ft_gold: false,
        ft_plant: false,
        // Contextual hints (show once each)
        ctx_boss: false,
        ctx_spirit: false,
        ctx_no_moves: false,
        ctx_achievement: false,
        // Master flag — entire first-time flow done
        ftCompleted: false
    },

    // ─── First-time tutorial step definitions ───
    //   target : CSS selector for spotlight, or null for center
    //   text   : tooltip body (HTML ok)
    //   screen : which screen must be active (null = any)
    //   waitFor: 'tap' (default) or 'auto' (advances programmatically)
    STEPS: [
        {
            id: 'ft_welcome',
            target: '#game-board',
            text: '欢迎来到芒果庄园！🥭<br>滑动宝石，连成3个即可消除！',
            arrow: 'swipe',   // special animated swipe arrows
            screen: 'game-screen'
        },
        {
            id: 'ft_special',
            target: '#game-board',
            text: '连成 <b>4个一排</b> 可以创造特殊宝石！💎<br>试试看！',
            arrow: 'down',
            screen: 'game-screen',
            waitFor: 'auto'   // triggered after first match
        },
        {
            id: 'ft_gold',
            target: '.currency.gold',
            text: '你赢得了金币！💰<br>前往 <b>芒果庄园</b> 种树发展你的农场吧！',
            arrow: 'down',
            screen: 'main-menu'
        },
        {
            id: 'ft_plant',
            target: '#tree-grid',
            text: '种下你的第一棵树 🌳<br>获得永久增益，开始被动收入！',
            arrow: 'down',
            screen: 'estate-screen'
        }
    ],

    // ─── Contextual hint definitions ───
    HINTS: {
        ctx_boss: {
            text: 'Boss会反击！注意狂暴条 ⚠️<br>狂暴后Boss每回合双重攻击！',
            target: '#boss-bar',
            arrow: 'up'
        },
        ctx_spirit: {
            text: '喂养精灵提升羁绊！🧚<br>羁绊越高 → buff越强！',
            target: '#spirit-grid',
            arrow: 'down'
        },
        ctx_no_moves: {
            text: '步数用光了！😅<br>下次注意规划连击组合哦',
            target: null,
            arrow: null
        },
        ctx_achievement: {
            text: '成就解锁！🏆<br>去成就殿堂看看更多挑战吧！',
            target: '#btn-achievements',
            arrow: 'down'
        }
    },

    // ═══════════════════════════════════════
    // Lifecycle
    // ═══════════════════════════════════════

    /** Call once at app boot (from main.js init) */
    init() {
        this._ensureState();
        this._injectCSS();
        this._createOverlay();
    },

    // ═══════════════════════════════════════
    // First-Time Tutorial
    // ═══════════════════════════════════════

    /** Kick off the guided tutorial on level 1, first play */
    startFirstTime() {
        const state = this._getState();
        if (state.ftCompleted) return;
        // Start at step 0 (welcome)
        this._showFTStep(0);
    },

    /** Advance first-time tutorial to the next uncompleted step.
     *  Called from game hooks. */
    advanceFirstTime(triggerId) {
        const state = this._getState();
        if (state.ftCompleted) return;
        // Find the step matching triggerId
        const idx = this.STEPS.findIndex(s => s.id === triggerId);
        if (idx < 0) return;
        if (state[triggerId]) return; // already done
        this._showFTStep(idx);
    },

    _showFTStep(idx) {
        if (idx >= this.STEPS.length) {
            this._completeFT();
            return;
        }
        const step = this.STEPS[idx];
        const state = this._getState();
        if (state[step.id]) {
            // Already completed — try next
            this._showFTStep(idx + 1);
            return;
        }
        this.isActive = true;
        this.currentStepIndex = idx;
        this._showOverlay(step);
    },

    _completeFTStep() {
        if (this.currentStepIndex < 0) return;
        const step = this.STEPS[this.currentStepIndex];
        this._markDone(step.id);
        this._hideOverlay();
        this.isActive = false;
        this.currentStepIndex = -1;
    },

    _completeFT() {
        const state = this._getState();
        state.ftCompleted = true;
        this._saveState(state);
        this._hideOverlay();
        this.isActive = false;
        this.currentStepIndex = -1;
        // Also mark the legacy Storage tutorial as completed
        try { Storage.completeTutorial(); } catch(e) {}
        try { Achievements.check('tutorial'); } catch(e) {}
    },

    // ═══════════════════════════════════════
    // Contextual Hints (show once per feature)
    // ═══════════════════════════════════════

    /** Call from game hooks: Tutorial.showHint('ctx_boss') */
    showHint(hintId) {
        const state = this._getState();
        if (state[hintId]) return;  // already shown
        const hint = this.HINTS[hintId];
        if (!hint) return;
        this._markDone(hintId);
        this._showTooltipOnly(hint);
    },

    // ═══════════════════════════════════════
    // Trigger hooks — called from game/UI code
    // ═══════════════════════════════════════

    /** Called from game.js when level starts (levelId) */
    onLevelStart(levelId) {
        const state = this._getState();
        if (!state.ftCompleted && levelId === 1 && !state.ft_welcome) {
            // Delay a beat so the board renders first
            setTimeout(() => this.startFirstTime(), 600);
        }
    },

    /** Called after the first match in level 1 */
    onFirstMatch() {
        this.advanceFirstTime('ft_special');
    },

    /** Called when player returns to main menu after completing level 1 */
    onFirstLevelComplete() {
        // Only fire once
        const state = this._getState();
        if (state.ft_gold) return;
        setTimeout(() => this.advanceFirstTime('ft_gold'), 800);
    },

    /** Called when estate screen opens for the first time */
    onEstateOpen() {
        this.advanceFirstTime('ft_plant');
    },

    /** Called when a boss level starts */
    onBossEncounter() {
        setTimeout(() => this.showHint('ctx_boss'), 1200);
    },

    /** Called when first spirit is unlocked/shown */
    onSpiritUnlock() {
        setTimeout(() => this.showHint('ctx_spirit'), 800);
    },

    /** Called when moves hit 0 */
    onOutOfMoves() {
        setTimeout(() => this.showHint('ctx_no_moves'), 500);
    },

    /** Called when an achievement pops */
    onAchievementUnlock() {
        setTimeout(() => this.showHint('ctx_achievement'), 2000);
    },

    // ═══════════════════════════════════════
    // UI — Overlay + Spotlight + Tooltip
    // ═══════════════════════════════════════

    _createOverlay() {
        // Remove legacy overlay if present
        const legacy = document.getElementById('tutorial-overlay');
        if (legacy) legacy.remove();

        // Create fresh overlay container
        const overlay = document.createElement('div');
        overlay.id = 'tut-overlay';
        overlay.className = 'tut-overlay';
        overlay.style.display = 'none';
        overlay.innerHTML = `
            <div class="tut-spotlight-mask" id="tut-mask"></div>
            <div class="tut-tooltip" id="tut-tooltip">
                <div class="tut-tooltip-character">🥭</div>
                <div class="tut-tooltip-body" id="tut-tooltip-body"></div>
                <div class="tut-tooltip-footer">
                    <button class="tut-btn-skip" id="tut-btn-skip">跳过</button>
                    <button class="tut-btn-next" id="tut-btn-next">知道了 👆</button>
                </div>
                <div class="tut-tooltip-tail"></div>
            </div>
            <div class="tut-swipe-arrows" id="tut-swipe-arrows" style="display:none">
                <div class="tut-swipe-arrow tut-swipe-right">👉</div>
                <div class="tut-swipe-arrow tut-swipe-down">👇</div>
            </div>
        `;
        document.body.appendChild(overlay);
        this._overlay = overlay;
        this._tooltip = overlay.querySelector('#tut-tooltip');

        // Bind buttons
        overlay.querySelector('#tut-btn-next').addEventListener('click', (e) => {
            e.stopPropagation();
            this._onTap();
        });
        overlay.querySelector('#tut-btn-skip').addEventListener('click', (e) => {
            e.stopPropagation();
            this._completeFT();
        });

        // Tap anywhere on overlay also advances (except on spotlighted element)
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay || e.target.classList.contains('tut-spotlight-mask')) {
                this._onTap();
            }
        });
    },

    _showOverlay(step) {
        const overlay = this._overlay;
        if (!overlay) return;
        overlay.style.display = 'block';
        // Force reflow before animation
        void overlay.offsetWidth;
        overlay.classList.add('tut-visible');

        // Spotlight
        this._updateSpotlight(step.target);

        // Tooltip content
        const body = overlay.querySelector('#tut-tooltip-body');
        body.innerHTML = step.text;

        // Position tooltip relative to target
        this._positionTooltip(step.target, step.arrow);

        // Swipe arrows for welcome step
        const swipeEl = overlay.querySelector('#tut-swipe-arrows');
        if (step.arrow === 'swipe') {
            swipeEl.style.display = 'block';
            this._positionSwipeArrows(step.target);
        } else {
            swipeEl.style.display = 'none';
        }

        // Skip button visible only during first-time tutorial
        const skipBtn = overlay.querySelector('#tut-btn-skip');
        skipBtn.style.display = (this.currentStepIndex >= 0) ? '' : 'none';
    },

    _hideOverlay() {
        const overlay = this._overlay;
        if (!overlay) return;
        overlay.classList.remove('tut-visible');
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 300);
    },

    _onTap() {
        if (this.currentStepIndex >= 0) {
            // First-time tutorial flow
            this._completeFTStep();
        } else {
            // Contextual hint
            this._hideOverlay();
        }
    },

    // Spotlight via CSS mask on the mask element
    _updateSpotlight(selector) {
        const mask = this._overlay.querySelector('#tut-mask');
        if (!selector) {
            // No spotlight — full dim
            mask.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);';
            mask.style.webkitMaskImage = '';
            mask.style.maskImage = '';
            return;
        }
        const target = document.querySelector(selector);
        if (!target) {
            mask.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);';
            mask.style.webkitMaskImage = '';
            mask.style.maskImage = '';
            return;
        }
        const rect = target.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const r = Math.max(rect.width, rect.height) / 2 + 16;

        // Use radial-gradient mask to punch a circular hole
        // The mask: white = visible (dark overlay), transparent = hidden (spotlight hole)
        mask.style.cssText = `
            position: fixed; inset: 0;
            background: rgba(0,0,0,0.75);
            -webkit-mask-image: radial-gradient(circle ${r}px at ${cx}px ${cy}px, transparent 100%, black 100%);
            mask-image: radial-gradient(circle ${r}px at ${cx}px ${cy}px, transparent 100%, black 100%);
            pointer-events: none;
        `;

        // Add pulsing ring to highlight
        this._showPulseRing(cx, cy, r);
    },

    _showPulseRing(cx, cy, r) {
        // Remove old ring
        const old = this._overlay.querySelector('.tut-pulse-ring');
        if (old) old.remove();

        const ring = document.createElement('div');
        ring.className = 'tut-pulse-ring';
        ring.style.cssText = `
            position: fixed;
            left: ${cx - r}px;
            top: ${cy - r}px;
            width: ${r * 2}px;
            height: ${r * 2}px;
            border-radius: 50%;
            pointer-events: none;
        `;
        this._overlay.appendChild(ring);
    },

    _positionTooltip(selector, arrowDir) {
        const tooltip = this._tooltip;
        if (!tooltip) return;
        // Reset
        tooltip.style.cssText = '';
        tooltip.classList.remove('tut-tooltip-above', 'tut-tooltip-below', 'tut-tooltip-center');

        if (!selector) {
            // Center of screen
            tooltip.classList.add('tut-tooltip-center');
            return;
        }
        const target = document.querySelector(selector);
        if (!target) {
            tooltip.classList.add('tut-tooltip-center');
            return;
        }
        const rect = target.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        // Decide above or below
        const spaceBelow = vh - rect.bottom;
        const spaceAbove = rect.top;
        if (spaceBelow > 180 || spaceBelow > spaceAbove) {
            // Place below
            tooltip.classList.add('tut-tooltip-below');
            tooltip.style.top = `${rect.bottom + 18}px`;
        } else {
            // Place above
            tooltip.classList.add('tut-tooltip-above');
            tooltip.style.bottom = `${vh - rect.top + 18}px`;
        }
        // Horizontal center, clamped
        const left = Math.max(12, Math.min(vw - 340, rect.left + rect.width / 2 - 160));
        tooltip.style.left = `${left}px`;
    },

    _positionSwipeArrows(selector) {
        const el = this._overlay.querySelector('#tut-swipe-arrows');
        if (!el || !selector) return;
        const target = document.querySelector(selector);
        if (!target) return;
        const rect = target.getBoundingClientRect();
        el.style.cssText = `
            display: block;
            position: fixed;
            left: ${rect.left + rect.width * 0.25}px;
            top: ${rect.top + rect.height * 0.35}px;
            pointer-events: none;
        `;
    },

    // ─── Tooltip-only (for contextual hints, no full overlay dim) ───
    _showTooltipOnly(hint) {
        // Use the same overlay but lighter
        const overlay = this._overlay;
        if (!overlay) return;
        this.currentStepIndex = -1; // not first-time
        overlay.style.display = 'block';
        void overlay.offsetWidth;
        overlay.classList.add('tut-visible');

        // Spotlight
        this._updateSpotlight(hint.target);

        // Tooltip
        const body = overlay.querySelector('#tut-tooltip-body');
        body.innerHTML = hint.text;
        this._positionTooltip(hint.target, hint.arrow);

        // Hide skip, change button text
        overlay.querySelector('#tut-btn-skip').style.display = 'none';
        overlay.querySelector('#tut-btn-next').textContent = '知道了 👌';

        // Swipe arrows off
        overlay.querySelector('#tut-swipe-arrows').style.display = 'none';

        // Auto-dismiss after 6s
        this._hintTimer = setTimeout(() => {
            this._hideOverlay();
        }, 6000);
    },

    // ═══════════════════════════════════════
    // Persistence (localStorage)
    // ═══════════════════════════════════════

    _getState() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) {}
        return { ...this._defaultState };
    },

    _saveState(state) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
        } catch(e) {}
    },

    _ensureState() {
        const existing = this._getState();
        // Merge defaults for any new keys
        const merged = { ...this._defaultState, ...existing };
        this._saveState(merged);
    },

    _markDone(id) {
        const state = this._getState();
        state[id] = true;
        this._saveState(state);
    },

    /** Check if a step/hint was already shown */
    isDone(id) {
        return !!this._getState()[id];
    },

    /** Reset tutorial (for testing / settings reset) */
    reset() {
        localStorage.removeItem(this.STORAGE_KEY);
        this._ensureState();
    },

    // ═══════════════════════════════════════
    // Legacy API compatibility
    // ═══════════════════════════════════════
    /** Old code calls Tutorial.start() — redirect */
    start() { this.startFirstTime(); },
    /** Old code calls Tutorial.checkTrigger(name, data) */
    checkTrigger(trigger, data) {
        switch(trigger) {
            case 'first_special':
                this.onFirstMatch();
                break;
            case 'low_moves':
                if (data && data.moves <= 0) this.onOutOfMoves();
                break;
            case 'high_combo':
                // No hint needed for this
                break;
        }
    },

    // ═══════════════════════════════════════
    // CSS Injection
    // ═══════════════════════════════════════

    _injectCSS() {
        if (document.getElementById('tut-style-v10')) return;
        const style = document.createElement('style');
        style.id = 'tut-style-v10';
        style.textContent = `
/* ═══ Tutorial Overlay v10 ═══ */

/* Kill legacy overlay */
#tutorial-overlay { display: none !important; }

.tut-overlay {
    position: fixed;
    inset: 0;
    z-index: 9000;
    opacity: 0;
    transition: opacity 0.3s ease;
    /* Allow touch-through to spotlighted element */
    pointer-events: none;
}
.tut-overlay.tut-visible {
    opacity: 1;
}
/* The mask captures clicks outside spotlight */
.tut-spotlight-mask {
    position: fixed;
    inset: 0;
    pointer-events: auto;
}

/* ─── Pulse ring around spotlight ─── */
.tut-pulse-ring {
    border: 3px solid rgba(247, 147, 30, 0.7);
    animation: tut-pulse 1.5s ease-in-out infinite;
}
@keyframes tut-pulse {
    0%, 100% { transform: scale(1); opacity: 0.7; }
    50% { transform: scale(1.08); opacity: 0.3; }
}

/* ─── Tooltip ─── */
.tut-tooltip {
    position: fixed;
    width: 320px;
    max-width: 90vw;
    background: linear-gradient(135deg, #1a1040, #2a1860);
    border: 2px solid #f7931e;
    border-radius: 16px;
    padding: 16px 18px 14px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(247,147,30,0.15);
    z-index: 9010;
    pointer-events: auto;
    animation: tut-tooltip-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    text-align: center;
}
@keyframes tut-tooltip-in {
    0% { opacity: 0; transform: translateY(12px) scale(0.95); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
}
.tut-tooltip-center {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
.tut-tooltip-below {
    /* top set dynamically */
}
.tut-tooltip-above {
    /* bottom set dynamically */
}

/* Tail/arrow on tooltip */
.tut-tooltip-tail {
    position: absolute;
    width: 16px;
    height: 16px;
    background: #1a1040;
    border-top: 2px solid #f7931e;
    border-left: 2px solid #f7931e;
    left: 50%;
    margin-left: -8px;
}
.tut-tooltip-below .tut-tooltip-tail {
    top: -10px;
    transform: rotate(45deg);
}
.tut-tooltip-above .tut-tooltip-tail {
    bottom: -10px;
    transform: rotate(225deg);
}
.tut-tooltip-center .tut-tooltip-tail {
    display: none;
}

/* Character icon */
.tut-tooltip-character {
    font-size: 2.5rem;
    margin-bottom: 6px;
    animation: tut-float 3s ease-in-out infinite;
}
@keyframes tut-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
}

/* Body text */
.tut-tooltip-body {
    font-size: 1rem;
    line-height: 1.6;
    color: #e0d0ff;
    margin-bottom: 12px;
}
.tut-tooltip-body b {
    color: #f7931e;
}

/* Footer buttons */
.tut-tooltip-footer {
    display: flex;
    gap: 10px;
    justify-content: center;
}
.tut-btn-skip {
    padding: 8px 16px;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 8px;
    color: rgba(255,255,255,0.5);
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;
}
.tut-btn-skip:hover { color: #fff; border-color: rgba(255,255,255,0.5); }
.tut-btn-next {
    padding: 8px 22px;
    background: linear-gradient(135deg, #f7931e, #e67e00);
    border: none;
    border-radius: 8px;
    color: #fff;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 12px rgba(247,147,30,0.3);
}
.tut-btn-next:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(247,147,30,0.5); }
.tut-btn-next:active { transform: scale(0.97); }

/* ─── Swipe arrows (welcome step) ─── */
.tut-swipe-arrows {
    pointer-events: none;
    z-index: 9005;
}
.tut-swipe-arrow {
    position: absolute;
    font-size: 2rem;
    filter: drop-shadow(0 0 6px rgba(247,147,30,0.8));
}
.tut-swipe-right {
    animation: tut-swipe-lr 1.5s ease-in-out infinite;
}
.tut-swipe-down {
    top: 50px;
    left: 60px;
    animation: tut-swipe-ud 1.5s ease-in-out infinite 0.5s;
}
@keyframes tut-swipe-lr {
    0%, 100% { transform: translateX(0); opacity: 0.5; }
    50% { transform: translateX(40px); opacity: 1; }
}
@keyframes tut-swipe-ud {
    0%, 100% { transform: translateY(0); opacity: 0.5; }
    50% { transform: translateY(40px); opacity: 1; }
}
`;
        document.head.appendChild(style);
    }
};
