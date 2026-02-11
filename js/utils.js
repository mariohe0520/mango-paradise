/* ==========================================
   芒果庄园 - 工具函数
   Mango Paradise - Utilities
   ========================================== */

const Utils = {
    // 生成唯一ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // 随机整数
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // 随机选择数组元素
    randomChoice(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    },

    // 打乱数组
    shuffle(arr) {
        const result = [...arr];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    },

    // 深拷贝
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    // 防抖
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // 节流
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // 格式化数字（千分位）
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    },

    // 格式化时间差
    formatTimeDiff(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}天${hours % 24}小时`;
        if (hours > 0) return `${hours}小时${minutes % 60}分钟`;
        if (minutes > 0) return `${minutes}分钟`;
        return `${seconds}秒`;
    },

    // 获取今天的日期字符串
    getTodayString() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    },

    // 获取两个日期之间的天数差
    getDaysDiff(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diff = Math.abs(d2 - d1);
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    },

    // 线性插值
    lerp(start, end, t) {
        return start + (end - start) * t;
    },

    // 缓动函数
    easing: {
        linear: t => t,
        easeInQuad: t => t * t,
        easeOutQuad: t => t * (2 - t),
        easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        easeInCubic: t => t * t * t,
        easeOutCubic: t => (--t) * t * t + 1,
        easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
        easeOutBack: t => 1 + (--t) * t * (2.70158 * t + 1.70158),
        easeOutBounce: t => {
            if (t < 1 / 2.75) {
                return 7.5625 * t * t;
            } else if (t < 2 / 2.75) {
                return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
            } else if (t < 2.5 / 2.75) {
                return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
            } else {
                return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
            }
        }
    },

    // 动画帧循环
    animate(duration, callback, easing = 'linear') {
        const start = performance.now();
        const easingFn = typeof easing === 'function' ? easing : this.easing[easing];

        const frame = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easingFn(progress);

            callback(easedProgress, progress === 1);

            if (progress < 1) {
                requestAnimationFrame(frame);
            }
        };

        requestAnimationFrame(frame);
    },

    // 等待一段时间
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // 等待动画帧
    nextFrame() {
        return new Promise(resolve => requestAnimationFrame(resolve));
    },

    // 检测设备类型
    device: {
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        isIOS: /iPhone|iPad|iPod/i.test(navigator.userAgent),
        isAndroid: /Android/i.test(navigator.userAgent),
        isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        hasVibration: 'vibrate' in navigator
    },

    // 震动反馈
    vibrate(pattern = 50) {
        if (this.device.hasVibration) {
            navigator.vibrate(pattern);
        }
    },

    // 获取元素位置
    getElementPosition(element) {
        const rect = element.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            width: rect.width,
            height: rect.height,
            left: rect.left,
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom
        };
    },

    // 检测两个矩形是否重叠
    rectsOverlap(rect1, rect2) {
        return !(rect1.right < rect2.left ||
                rect1.left > rect2.right ||
                rect1.bottom < rect2.top ||
                rect1.top > rect2.bottom);
    },

    // 计算两点距离
    distance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    },

    // 角度转弧度
    degToRad(deg) {
        return deg * Math.PI / 180;
    },

    // 弧度转角度
    radToDeg(rad) {
        return rad * 180 / Math.PI;
    },

    // 随机颜色
    randomColor() {
        return `hsl(${Math.random() * 360}, 70%, 60%)`;
    },

    // HSL 转 RGB
    hslToRgb(h, s, l) {
        let r, g, b;
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    },

    // 复制到剪贴板
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            // 降级方案
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            return true;
        }
    },

    // 下载文件
    downloadFile(content, filename, type = 'application/json') {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    // 读取文件
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    },

    // 加载图片
    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    },

    // 预加载字体
    async preloadFonts() {
        if ('fonts' in document) {
            await Promise.all([
                document.fonts.load('400 1rem "Cinzel"'),
                document.fonts.load('700 1rem "Cinzel"'),
                document.fonts.load('400 1rem "Noto Sans SC"'),
                document.fonts.load('700 1rem "Noto Sans SC"')
            ]).catch(() => {});
        }
    },

    // 日志工具
    log: {
        info: (...args) => console.log('%c[INFO]', 'color: #3b82f6', ...args),
        success: (...args) => console.log('%c[SUCCESS]', 'color: #22c55e', ...args),
        warn: (...args) => console.warn('%c[WARN]', 'color: #eab308', ...args),
        error: (...args) => console.error('%c[ERROR]', 'color: #ef4444', ...args),
        debug: (...args) => console.log('%c[DEBUG]', 'color: #a855f7', ...args)
    }
};

// 冻结对象防止修改
Object.freeze(Utils.easing);
Object.freeze(Utils.device);
Object.freeze(Utils.log);
