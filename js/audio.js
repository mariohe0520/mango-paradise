/* ==========================================
   芒果庄园 - 音效系统
   Mango Paradise - Audio System
   使用 Web Audio API 生成高质量音效
   ========================================== */

class AudioSystem {
    constructor() {
        this.context = null;
        this.masterGain = null;
        this.sfxEnabled = true;
        this.musicEnabled = true;
        this.volume = 0.8;
        this.initialized = false;
        this.bgmNode = null;
        this.bgmGain = null;
        
        // 音效缓存
        this.soundBuffers = {};
        
        // 音效定义 - 使用合成器生成
        this.soundDefinitions = {
            click: { type: 'click', frequency: 800, duration: 0.1 },
            swap: { type: 'swap', frequency: 400, duration: 0.15 },
            match: { type: 'match', frequency: 600, duration: 0.2 },
            match3: { type: 'match', frequency: 700, duration: 0.25 },
            match4: { type: 'match', frequency: 800, duration: 0.3 },
            match5: { type: 'match', frequency: 900, duration: 0.35 },
            combo: { type: 'combo', frequency: 1000, duration: 0.4 },
            special: { type: 'special', frequency: 1200, duration: 0.5 },
            explosion: { type: 'explosion', duration: 0.4 },
            cascade: { type: 'cascade', frequency: 500, duration: 0.15 },
            star: { type: 'star', frequency: 1400, duration: 0.6 },
            victory: { type: 'victory', duration: 1.5 },
            defeat: { type: 'defeat', duration: 1.0 },
            powerup: { type: 'powerup', frequency: 600, duration: 0.3 },
            levelUp: { type: 'levelUp', duration: 0.8 },
            coin: { type: 'coin', frequency: 1200, duration: 0.15 },
            achievement: { type: 'achievement', duration: 0.8 },
            invalid: { type: 'invalid', frequency: 200, duration: 0.2 },
            hint: { type: 'hint', frequency: 900, duration: 0.3 }
        };
    }

    // 初始化音频上下文（需要用户交互后调用）
    async init() {
        if (this.initialized) return;

        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.context.createGain();
            this.masterGain.gain.value = this.volume;
            this.masterGain.connect(this.context.destination);
            
            // 创建 BGM 增益节点
            this.bgmGain = this.context.createGain();
            this.bgmGain.gain.value = this.musicEnabled ? 0.3 : 0;
            this.bgmGain.connect(this.masterGain);
            
            this.initialized = true;
            Utils.log.success('Audio system initialized');
            
            // 预生成常用音效
            await this.preloadSounds();
        } catch (error) {
            Utils.log.error('Failed to initialize audio:', error);
        }
    }

    // 预加载音效
    async preloadSounds() {
        // 音效是动态生成的，无需预加载
        return Promise.resolve();
    }

    // 恢复音频上下文（用户交互后）
    async resume() {
        if (this.context && this.context.state === 'suspended') {
            await this.context.resume();
        }
    }

    // 生成音效
    generateSound(name) {
        const def = this.soundDefinitions[name];
        if (!def) return null;

        switch (def.type) {
            case 'click':
                return this.createClickSound(def);
            case 'swap':
                return this.createSwapSound(def);
            case 'match':
                return this.createMatchSound(def);
            case 'combo':
                return this.createComboSound(def);
            case 'special':
                return this.createSpecialSound(def);
            case 'explosion':
                return this.createExplosionSound(def);
            case 'cascade':
                return this.createCascadeSound(def);
            case 'star':
                return this.createStarSound(def);
            case 'victory':
                return this.createVictorySound(def);
            case 'defeat':
                return this.createDefeatSound(def);
            case 'powerup':
                return this.createPowerupSound(def);
            case 'levelUp':
                return this.createLevelUpSound(def);
            case 'coin':
                return this.createCoinSound(def);
            case 'achievement':
                return this.createAchievementSound(def);
            case 'invalid':
                return this.createInvalidSound(def);
            case 'hint':
                return this.createHintSound(def);
            default:
                return this.createToneSound(def);
        }
    }

    // Play combo note with progressive pitch (do-re-mi-fa-sol-la-si-do)
    playComboNote(comboLevel) {
        if (!this.sfxEnabled || !this.initialized) return;
        try {
            this.resume();
            // C major scale: do-re-mi-fa-sol-la-si-do
            const scale = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50];
            const idx = Math.min(comboLevel - 1, scale.length - 1);
            const freq = scale[idx];

            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.context.currentTime);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.2, this.context.currentTime + 0.15);
            gain.gain.setValueAtTime(0.3, this.context.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.35);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(this.context.currentTime);
            osc.stop(this.context.currentTime + 0.35);

            // Add harmony for high combos
            if (comboLevel >= 4) {
                const osc2 = this.context.createOscillator();
                const gain2 = this.context.createGain();
                osc2.type = 'triangle';
                osc2.frequency.value = freq * 1.5; // Perfect fifth
                gain2.gain.setValueAtTime(0.15, this.context.currentTime);
                gain2.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.3);
                osc2.connect(gain2);
                gain2.connect(this.masterGain);
                osc2.start(this.context.currentTime);
                osc2.stop(this.context.currentTime + 0.3);
            }
        } catch(e) {}
    }

    // 播放音效
    play(name, options = {}) {
        if (!this.sfxEnabled || !this.initialized) return;

        try {
            this.resume();
            const sound = this.generateSound(name);
            if (sound) {
                const { gain, source } = sound;
                
                // 应用音量调整
                if (options.volume !== undefined) {
                    gain.gain.value *= options.volume;
                }
                
                // 应用音高调整
                if (options.pitch && source.detune) {
                    source.detune.value = (options.pitch - 1) * 1200;
                }
                
                source.start(this.context.currentTime + (options.delay || 0));
            }
        } catch (error) {
            // 静默失败
        }
    }

    // 创建点击音效
    createClickSound(def) {
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(def.frequency, this.context.currentTime);
        osc.frequency.exponentialRampToValueAtTime(def.frequency * 0.5, this.context.currentTime + def.duration);
        
        gain.gain.setValueAtTime(0.3, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + def.duration);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.stop(this.context.currentTime + def.duration);
        
        return { source: osc, gain };
    }

    // 创建交换音效
    createSwapSound(def) {
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(def.frequency, this.context.currentTime);
        osc.frequency.linearRampToValueAtTime(def.frequency * 1.5, this.context.currentTime + def.duration / 2);
        osc.frequency.linearRampToValueAtTime(def.frequency, this.context.currentTime + def.duration);
        
        gain.gain.setValueAtTime(0.2, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + def.duration);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.stop(this.context.currentTime + def.duration);
        
        return { source: osc, gain };
    }

    // 创建消除音效
    createMatchSound(def) {
        const osc1 = this.context.createOscillator();
        const osc2 = this.context.createOscillator();
        const gain = this.context.createGain();
        
        osc1.type = 'sine';
        osc2.type = 'triangle';
        
        osc1.frequency.setValueAtTime(def.frequency, this.context.currentTime);
        osc2.frequency.setValueAtTime(def.frequency * 1.5, this.context.currentTime);
        
        osc1.frequency.exponentialRampToValueAtTime(def.frequency * 2, this.context.currentTime + def.duration);
        osc2.frequency.exponentialRampToValueAtTime(def.frequency * 3, this.context.currentTime + def.duration);
        
        gain.gain.setValueAtTime(0.25, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + def.duration);
        
        const mixer = this.context.createGain();
        mixer.gain.value = 0.5;
        
        osc1.connect(mixer);
        osc2.connect(mixer);
        mixer.connect(gain);
        gain.connect(this.masterGain);
        
        osc1.stop(this.context.currentTime + def.duration);
        osc2.stop(this.context.currentTime + def.duration);
        
        return { source: osc1, gain };
    }

    // 创建连击音效
    createComboSound(def) {
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        const duration = def.duration / notes.length;
        
        notes.forEach((freq, i) => {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            const startTime = this.context.currentTime + i * duration * 0.5;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.start(startTime);
            osc.stop(startTime + duration);
        });
        
        return { source: { start: () => {} }, gain: { gain: { value: 1 } } };
    }

    // 创建特殊消除音效
    createSpecialSound(def) {
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        const filter = this.context.createBiquadFilter();
        
        osc.type = 'sawtooth';
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(def.frequency * 2, this.context.currentTime);
        filter.frequency.exponentialRampToValueAtTime(def.frequency * 8, this.context.currentTime + def.duration);
        
        osc.frequency.setValueAtTime(def.frequency, this.context.currentTime);
        osc.frequency.exponentialRampToValueAtTime(def.frequency * 4, this.context.currentTime + def.duration);
        
        gain.gain.setValueAtTime(0.3, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + def.duration);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        osc.stop(this.context.currentTime + def.duration);
        
        return { source: osc, gain };
    }

    // 创建爆炸音效
    createExplosionSound(def) {
        const bufferSize = this.context.sampleRate * def.duration;
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            const t = i / bufferSize;
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2);
        }
        
        const source = this.context.createBufferSource();
        const gain = this.context.createGain();
        const filter = this.context.createBiquadFilter();
        
        source.buffer = buffer;
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, this.context.currentTime);
        filter.frequency.exponentialRampToValueAtTime(200, this.context.currentTime + def.duration);
        
        gain.gain.setValueAtTime(0.4, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + def.duration);
        
        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        
        return { source, gain };
    }

    // 创建连锁音效
    createCascadeSound(def) {
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(def.frequency, this.context.currentTime);
        osc.frequency.exponentialRampToValueAtTime(def.frequency * 1.5, this.context.currentTime + def.duration);
        
        gain.gain.setValueAtTime(0.15, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + def.duration);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.stop(this.context.currentTime + def.duration);
        
        return { source: osc, gain };
    }

    // 创建星星音效
    createStarSound(def) {
        const notes = [783.99, 987.77, 1174.66, 1318.51, 1567.98]; // G5-G6 琶音
        const duration = def.duration / notes.length;
        
        notes.forEach((freq, i) => {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            const startTime = this.context.currentTime + i * duration * 0.7;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
            gain.gain.setValueAtTime(0.2, startTime + duration * 0.5);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 1.5);
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.start(startTime);
            osc.stop(startTime + duration * 1.5);
        });
        
        return { source: { start: () => {} }, gain: { gain: { value: 1 } } };
    }

    // 创建胜利音效
    createVictorySound(def) {
        // 胜利号角
        const notes = [
            { freq: 523.25, time: 0, dur: 0.2 },
            { freq: 659.25, time: 0.15, dur: 0.2 },
            { freq: 783.99, time: 0.3, dur: 0.2 },
            { freq: 1046.50, time: 0.45, dur: 0.6 },
            { freq: 783.99, time: 0.75, dur: 0.15 },
            { freq: 1046.50, time: 0.9, dur: 0.6 }
        ];
        
        notes.forEach(note => {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            
            osc.type = 'triangle';
            osc.frequency.value = note.freq;
            
            const startTime = this.context.currentTime + note.time;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
            gain.gain.setValueAtTime(0.25, startTime + note.dur * 0.8);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + note.dur);
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.start(startTime);
            osc.stop(startTime + note.dur);
        });
        
        return { source: { start: () => {} }, gain: { gain: { value: 1 } } };
    }

    // 创建失败音效
    createDefeatSound(def) {
        const notes = [
            { freq: 392, time: 0, dur: 0.3 },
            { freq: 349.23, time: 0.25, dur: 0.3 },
            { freq: 293.66, time: 0.5, dur: 0.5 }
        ];
        
        notes.forEach(note => {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(note.freq, this.context.currentTime + note.time);
            osc.frequency.exponentialRampToValueAtTime(note.freq * 0.9, this.context.currentTime + note.time + note.dur);
            
            const startTime = this.context.currentTime + note.time;
            gain.gain.setValueAtTime(0.2, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + note.dur);
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.start(startTime);
            osc.stop(startTime + note.dur);
        });
        
        return { source: { start: () => {} }, gain: { gain: { value: 1 } } };
    }

    // 创建道具音效
    createPowerupSound(def) {
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(def.frequency, this.context.currentTime);
        osc.frequency.exponentialRampToValueAtTime(def.frequency * 2, this.context.currentTime + def.duration * 0.5);
        osc.frequency.exponentialRampToValueAtTime(def.frequency * 1.5, this.context.currentTime + def.duration);
        
        gain.gain.setValueAtTime(0.15, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + def.duration);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.stop(this.context.currentTime + def.duration);
        
        return { source: osc, gain };
    }

    // 创建升级音效
    createLevelUpSound(def) {
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        const duration = def.duration / notes.length;
        
        notes.forEach((freq, i) => {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            
            osc.type = 'triangle';
            osc.frequency.value = freq;
            
            const startTime = this.context.currentTime + i * duration * 0.6;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.start(startTime);
            osc.stop(startTime + duration);
        });
        
        return { source: { start: () => {} }, gain: { gain: { value: 1 } } };
    }

    // 创建金币音效
    createCoinSound(def) {
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(def.frequency, this.context.currentTime);
        osc.frequency.setValueAtTime(def.frequency * 1.5, this.context.currentTime + 0.05);
        
        gain.gain.setValueAtTime(0.2, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + def.duration);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.stop(this.context.currentTime + def.duration);
        
        return { source: osc, gain };
    }

    // 创建成就音效
    createAchievementSound(def) {
        const notes = [659.25, 783.99, 987.77, 1318.51];
        const duration = def.duration / notes.length;
        
        notes.forEach((freq, i) => {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            const startTime = this.context.currentTime + i * duration * 0.5;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.start(startTime);
            osc.stop(startTime + duration);
        });
        
        return { source: { start: () => {} }, gain: { gain: { value: 1 } } };
    }

    // 创建无效操作音效
    createInvalidSound(def) {
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(def.frequency, this.context.currentTime);
        osc.frequency.setValueAtTime(def.frequency * 0.8, this.context.currentTime + def.duration / 2);
        
        gain.gain.setValueAtTime(0.15, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + def.duration);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.stop(this.context.currentTime + def.duration);
        
        return { source: osc, gain };
    }

    // 创建提示音效
    createHintSound(def) {
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(def.frequency, this.context.currentTime);
        osc.frequency.exponentialRampToValueAtTime(def.frequency * 1.2, this.context.currentTime + def.duration / 2);
        osc.frequency.exponentialRampToValueAtTime(def.frequency, this.context.currentTime + def.duration);
        
        gain.gain.setValueAtTime(0.15, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + def.duration);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.stop(this.context.currentTime + def.duration);
        
        return { source: osc, gain };
    }

    // 创建基础音调
    createToneSound(def) {
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = def.frequency || 440;
        
        gain.gain.setValueAtTime(0.2, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + (def.duration || 0.2));
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.stop(this.context.currentTime + (def.duration || 0.2));
        
        return { source: osc, gain };
    }

    // 播放背景音乐（简单的环境音）
    startBGM() {
        if (!this.musicEnabled || !this.initialized || this.bgmNode) return;

        try {
            // 🎵 Ambient chiptune melody — warm, relaxing, looping
            const ctx = this.context;
            // Melody notes (C major pentatonic, dreamy feel)
            const melody = [
                // [note, duration, rest]
                [523, 0.4, 0.1],  // C5
                [659, 0.4, 0.1],  // E5
                [784, 0.6, 0.2],  // G5
                [659, 0.3, 0.1],  // E5
                [587, 0.4, 0.1],  // D5
                [523, 0.6, 0.3],  // C5
                [440, 0.4, 0.1],  // A4
                [523, 0.4, 0.1],  // C5
                [587, 0.6, 0.2],  // D5
                [523, 0.3, 0.1],  // C5
                [440, 0.4, 0.1],  // A4
                [392, 0.6, 0.3],  // G4
                [440, 0.4, 0.1],  // A4
                [523, 0.4, 0.1],  // C5
                [659, 0.6, 0.2],  // E5
                [587, 0.3, 0.1],  // D5
                [523, 0.8, 0.5],  // C5 (long)
            ];

            // Bass pattern (simple root notes)
            const bass = [
                [131, 1.6], // C3
                [110, 1.6], // A2
                [147, 1.6], // D3
                [131, 1.6], // C3
            ];

            const loopLength = melody.reduce((s, n) => s + n[1] + n[2], 0);

            // Create melody loop
            const playLoop = () => {
                if (!this.musicEnabled) return;
                let time = ctx.currentTime + 0.1;

                // Melody voice
                for (const [freq, dur, rest] of melody) {
                    const osc = ctx.createOscillator();
                    const env = ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.value = freq;
                    env.gain.setValueAtTime(0, time);
                    env.gain.linearRampToValueAtTime(0.12, time + 0.05);
                    env.gain.linearRampToValueAtTime(0.08, time + dur * 0.7);
                    env.gain.linearRampToValueAtTime(0, time + dur);
                    osc.connect(env);
                    env.connect(this.bgmGain);
                    osc.start(time);
                    osc.stop(time + dur + 0.01);
                    time += dur + rest;
                }

                // Bass voice
                let bTime = ctx.currentTime + 0.1;
                for (const [freq, dur] of bass) {
                    const osc = ctx.createOscillator();
                    const env = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.value = freq;
                    env.gain.setValueAtTime(0.06, bTime);
                    env.gain.linearRampToValueAtTime(0.03, bTime + dur);
                    osc.connect(env);
                    env.connect(this.bgmGain);
                    osc.start(bTime);
                    osc.stop(bTime + dur + 0.01);
                    bTime += dur;
                }

                // Schedule next loop
                this._bgmTimer = setTimeout(playLoop, loopLength * 1000);
            };

            this.bgmNode = true; // flag to indicate BGM active
            playLoop();
        } catch (error) {
            // 静默失败
        }
    }

    // 停止背景音乐
    stopBGM() {
        if (this._bgmTimer) { clearTimeout(this._bgmTimer); this._bgmTimer = null; }
        this.bgmNode = null;
    }

    // 设置音效开关
    setSfxEnabled(enabled) {
        this.sfxEnabled = enabled;
    }

    // 设置音乐开关
    setMusicEnabled(enabled) {
        this.musicEnabled = enabled;
        if (this.bgmGain) {
            this.bgmGain.gain.value = enabled ? 0.3 : 0;
        }
        if (!enabled) {
            this.stopBGM();
        }
    }

    // 设置音量
    setVolume(volume) {
        this.volume = volume;
        if (this.masterGain) {
            this.masterGain.gain.value = volume;
        }
    }
}

// 全局音频实例
const Audio = new AudioSystem();
