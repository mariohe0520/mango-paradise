/* ==========================================
   芒果庄园 - 关卡设计
   Mango Paradise - Level Design
   50+ 精心设计的关卡
   ========================================== */

// 宝石类型定义 - 魔兽世界主题
const GEM_TYPES = {
    // 基础宝石 - 魔兽种族
    murloc: { id: 'murloc', emoji: '🐟', name: '鱼人', color: '#22c55e', rarity: 'common' },
    orc: { id: 'orc', emoji: '👹', name: '兽人', color: '#22c55e', rarity: 'common' },
    elf: { id: 'elf', emoji: '🧝', name: '精灵', color: '#8b5cf6', rarity: 'common' },
    mage: { id: 'mage', emoji: '🧙', name: '法师', color: '#3b82f6', rarity: 'common' },
    knight: { id: 'knight', emoji: '⚔️', name: '骑士', color: '#ef4444', rarity: 'common' },
    dwarf: { id: 'dwarf', emoji: '🪓', name: '矮人', color: '#f97316', rarity: 'common' },
    undead: { id: 'undead', emoji: '💀', name: '亡灵', color: '#6b7280', rarity: 'common' },
    
    // 特殊宝石
    mango: { id: 'mango', emoji: '🥭', name: '芒果', color: '#fbbf24', rarity: 'rare' },
    dragon: { id: 'dragon', emoji: '🐉', name: '巨龙', color: '#dc2626', rarity: 'epic' },
    phoenix: { id: 'phoenix', emoji: '🔥', name: '凤凰', color: '#f97316', rarity: 'legendary' }
};

// 章节定义
const CHAPTERS = [
    {
        id: 1,
        name: '艾尔文森林',
        description: '芒果树林中潜伏着神秘的力量...',
        icon: '🌲',
        levels: [1, 10],
        unlockLevel: 0,
        background: 'forest'
    },
    {
        id: 2,
        name: '西部荒野',
        description: '在荒野中寻找珍贵的芒果矿石...',
        icon: '🏜️',
        levels: [11, 20],
        unlockLevel: 10,
        background: 'desert'
    },
    {
        id: 3,
        name: '暴风城',
        description: '王国的中心，芒果贸易的枢纽...',
        icon: '🏰',
        levels: [21, 30],
        unlockLevel: 20,
        background: 'castle'
    },
    {
        id: 4,
        name: '诅咒之地',
        description: '被黑暗力量笼罩的神秘区域...',
        icon: '🌑',
        levels: [31, 40],
        unlockLevel: 30,
        background: 'dark'
    },
    {
        id: 5,
        name: '燃烧平原',
        description: '熔岩与火焰的试炼之地...',
        icon: '🌋',
        levels: [41, 50],
        unlockLevel: 40,
        background: 'fire'
    },
    {
        id: 6,
        name: '诺森德',
        description: '冰封王座的极寒挑战...',
        icon: '❄️',
        levels: [51, 60],
        unlockLevel: 50,
        background: 'ice'
    }
];

// 目标类型
const OBJECTIVE_TYPES = {
    SCORE: 'score',           // 达到分数
    COLLECT: 'collect',       // 收集特定宝石
    CLEAR: 'clear',           // 消除数量
    COMBO: 'combo',           // 达到连击
    SPECIAL: 'special',       // 创建特殊宝石
    MOVES: 'moves'            // 剩余步数
};

// 关卡生成器
const LevelGenerator = {
    // 基础关卡模板
    createLevel(id, config) {
        const defaults = {
            id,
            chapter: Math.ceil(id / 10),
            width: 8,
            height: 8,
            moves: 30,
            gems: ['murloc', 'orc', 'elf', 'mage', 'knight'],
            objectives: [{ type: OBJECTIVE_TYPES.SCORE, target: 1000 }],
            stars: [1000, 2000, 3500],
            special: {},
            blockers: [],
            tutorial: null
        };
        
        return { ...defaults, ...config };
    },

    // 获取章节宝石池
    getChapterGems(chapter) {
        const basePools = {
            1: ['murloc', 'orc', 'elf', 'mage', 'knight'],
            2: ['murloc', 'orc', 'elf', 'mage', 'knight', 'dwarf'],
            3: ['orc', 'elf', 'mage', 'knight', 'dwarf', 'undead'],
            4: ['elf', 'mage', 'knight', 'dwarf', 'undead', 'mango'],
            5: ['mage', 'knight', 'dwarf', 'undead', 'mango', 'dragon'],
            6: ['knight', 'dwarf', 'undead', 'mango', 'dragon', 'phoenix']
        };
        return basePools[chapter] || basePools[1];
    }
};

// 关卡数据库 - 60个精心设计的关卡
const LEVELS = [
    // ==========================================
    // 第一章：艾尔文森林 (1-10) - 新手教程
    // ==========================================
    
    // 关卡 1: 最基础的入门
    LevelGenerator.createLevel(1, {
        moves: 20,
        gems: ['murloc', 'orc', 'elf', 'mage'],
        objectives: [
            { type: OBJECTIVE_TYPES.SCORE, target: 500, icon: '⭐' }
        ],
        stars: [500, 1000, 1500],
        tutorial: 'basic'
    }),

    // 关卡 2: 学习连接
    LevelGenerator.createLevel(2, {
        moves: 22,
        gems: ['murloc', 'orc', 'elf', 'mage'],
        objectives: [
            { type: OBJECTIVE_TYPES.CLEAR, target: 20, gem: 'murloc', icon: '🐟' }
        ],
        stars: [600, 1200, 1800],
        tutorial: 'collect'
    }),

    // 关卡 3: 多目标
    LevelGenerator.createLevel(3, {
        moves: 25,
        gems: ['murloc', 'orc', 'elf', 'mage', 'knight'],
        objectives: [
            { type: OBJECTIVE_TYPES.CLEAR, target: 15, gem: 'orc', icon: '👹' },
            { type: OBJECTIVE_TYPES.CLEAR, target: 15, gem: 'elf', icon: '🧝' }
        ],
        stars: [800, 1500, 2200]
    }),

    // 关卡 4: 认识特殊宝石
    LevelGenerator.createLevel(4, {
        moves: 25,
        gems: ['murloc', 'orc', 'elf', 'mage', 'knight'],
        objectives: [
            { type: OBJECTIVE_TYPES.SPECIAL, target: 2, specialType: 'line', icon: '➡️' }
        ],
        stars: [1000, 1800, 2500],
        tutorial: 'special'
    }),

    // 关卡 5: 分数挑战
    LevelGenerator.createLevel(5, {
        moves: 28,
        gems: ['murloc', 'orc', 'elf', 'mage', 'knight'],
        objectives: [
            { type: OBJECTIVE_TYPES.SCORE, target: 2000, icon: '⭐' }
        ],
        stars: [2000, 3500, 5000]
    }),

    // 关卡 6: 连击入门
    LevelGenerator.createLevel(6, {
        moves: 25,
        gems: ['murloc', 'orc', 'elf', 'mage', 'knight'],
        objectives: [
            { type: OBJECTIVE_TYPES.SCORE, target: 1500, icon: '⭐' },
            { type: OBJECTIVE_TYPES.COMBO, target: 3, icon: '🔥' }
        ],
        stars: [1500, 2500, 4000]
    }),

    // 关卡 7: 大量收集
    LevelGenerator.createLevel(7, {
        moves: 30,
        gems: ['murloc', 'orc', 'elf', 'mage', 'knight'],
        objectives: [
            { type: OBJECTIVE_TYPES.CLEAR, target: 30, gem: 'mage', icon: '🧙' }
        ],
        stars: [1800, 3000, 4500]
    }),

    // 关卡 8: 双重收集
    LevelGenerator.createLevel(8, {
        moves: 28,
        gems: ['murloc', 'orc', 'elf', 'mage', 'knight'],
        objectives: [
            { type: OBJECTIVE_TYPES.CLEAR, target: 20, gem: 'knight', icon: '⚔️' },
            { type: OBJECTIVE_TYPES.CLEAR, target: 20, gem: 'murloc', icon: '🐟' }
        ],
        stars: [2000, 3500, 5000]
    }),

    // 关卡 9: 特殊宝石精通
    LevelGenerator.createLevel(9, {
        moves: 30,
        gems: ['murloc', 'orc', 'elf', 'mage', 'knight'],
        objectives: [
            { type: OBJECTIVE_TYPES.SPECIAL, target: 4, specialType: 'any', icon: '✨' }
        ],
        stars: [2500, 4000, 6000]
    }),

    // 关卡 10: 章节 Boss
    LevelGenerator.createLevel(10, {
        moves: 35,
        gems: ['murloc', 'orc', 'elf', 'mage', 'knight'],
        objectives: [
            { type: OBJECTIVE_TYPES.SCORE, target: 5000, icon: '⭐' },
            { type: OBJECTIVE_TYPES.CLEAR, target: 25, gem: 'elf', icon: '🧝' },
            { type: OBJECTIVE_TYPES.COMBO, target: 5, icon: '🔥' }
        ],
        stars: [5000, 8000, 12000]
    }),

    // ==========================================
    // 第二章：西部荒野 (11-20) - 引入新宝石
    // ==========================================

    LevelGenerator.createLevel(11, {
        moves: 28,
        gems: ['murloc', 'orc', 'elf', 'mage', 'knight', 'dwarf'],
        objectives: [
            { type: OBJECTIVE_TYPES.CLEAR, target: 15, gem: 'dwarf', icon: '🪓' }
        ],
        stars: [2000, 3500, 5000]
    }),

    LevelGenerator.createLevel(12, {
        moves: 30,
        gems: ['murloc', 'orc', 'elf', 'mage', 'knight', 'dwarf'],
        objectives: [
            { type: OBJECTIVE_TYPES.SCORE, target: 3000, icon: '⭐' },
            { type: OBJECTIVE_TYPES.SPECIAL, target: 3, specialType: 'line', icon: '➡️' }
        ],
        stars: [3000, 5000, 7500]
    }),

    LevelGenerator.createLevel(13, {
        moves: 25,
        gems: ['orc', 'elf', 'mage', 'knight', 'dwarf'],
        objectives: [
            { type: OBJECTIVE_TYPES.CLEAR, target: 25, gem: 'orc', icon: '👹' },
            { type: OBJECTIVE_TYPES.CLEAR, target: 25, gem: 'mage', icon: '🧙' }
        ],
        stars: [3500, 5500, 8000]
    }),

    LevelGenerator.createLevel(14, {
        moves: 30,
        gems: ['murloc', 'orc', 'elf', 'mage', 'knight', 'dwarf'],
        objectives: [
            { type: OBJECTIVE_TYPES.COMBO, target: 6, icon: '🔥' }
        ],
        stars: [4000, 6000, 9000]
    }),

    LevelGenerator.createLevel(15, {
        width: 7,
        height: 9,
        moves: 32,
        gems: ['murloc', 'orc', 'elf', 'mage', 'knight', 'dwarf'],
        objectives: [
            { type: OBJECTIVE_TYPES.SCORE, target: 4500, icon: '⭐' }
        ],
        stars: [4500, 7000, 10000]
    }),

    LevelGenerator.createLevel(16, {
        moves: 28,
        gems: ['murloc', 'orc', 'elf', 'mage', 'knight', 'dwarf'],
        objectives: [
            { type: OBJECTIVE_TYPES.SPECIAL, target: 2, specialType: 'bomb', icon: '💣' }
        ],
        stars: [3500, 5500, 8000]
    }),

    LevelGenerator.createLevel(17, {
        moves: 30,
        gems: ['orc', 'elf', 'mage', 'knight', 'dwarf'],
        objectives: [
            { type: OBJECTIVE_TYPES.CLEAR, target: 35, gem: 'knight', icon: '⚔️' }
        ],
        stars: [4000, 6500, 9500]
    }),

    LevelGenerator.createLevel(18, {
        moves: 32,
        gems: ['murloc', 'orc', 'elf', 'mage', 'knight', 'dwarf'],
        objectives: [
            { type: OBJECTIVE_TYPES.SCORE, target: 5000, icon: '⭐' },
            { type: OBJECTIVE_TYPES.CLEAR, target: 20, gem: 'dwarf', icon: '🪓' }
        ],
        stars: [5000, 8000, 11000]
    }),

    LevelGenerator.createLevel(19, {
        moves: 28,
        gems: ['murloc', 'orc', 'elf', 'mage', 'knight', 'dwarf'],
        objectives: [
            { type: OBJECTIVE_TYPES.SPECIAL, target: 5, specialType: 'any', icon: '✨' },
            { type: OBJECTIVE_TYPES.COMBO, target: 4, icon: '🔥' }
        ],
        stars: [4500, 7500, 10500]
    }),

    LevelGenerator.createLevel(20, {
        moves: 35,
        gems: ['murloc', 'orc', 'elf', 'mage', 'knight', 'dwarf'],
        objectives: [
            { type: OBJECTIVE_TYPES.SCORE, target: 7000, icon: '⭐' },
            { type: OBJECTIVE_TYPES.CLEAR, target: 30, gem: 'murloc', icon: '🐟' },
            { type: OBJECTIVE_TYPES.CLEAR, target: 30, gem: 'dwarf', icon: '🪓' }
        ],
        stars: [7000, 11000, 15000]
    }),

    // ==========================================
    // 第三章：暴风城 (21-30) - 更复杂的挑战
    // ==========================================

    LevelGenerator.createLevel(21, {
        moves: 30,
        gems: ['orc', 'elf', 'mage', 'knight', 'dwarf', 'undead'],
        objectives: [
            { type: OBJECTIVE_TYPES.CLEAR, target: 20, gem: 'undead', icon: '💀' }
        ],
        stars: [5000, 8000, 12000]
    }),

    LevelGenerator.createLevel(22, {
        width: 9,
        height: 7,
        moves: 28,
        gems: ['orc', 'elf', 'mage', 'knight', 'dwarf', 'undead'],
        objectives: [
            { type: OBJECTIVE_TYPES.SCORE, target: 6000, icon: '⭐' }
        ],
        stars: [6000, 9500, 13000]
    }),

    LevelGenerator.createLevel(23, {
        moves: 30,
        gems: ['elf', 'mage', 'knight', 'dwarf', 'undead'],
        objectives: [
            { type: OBJECTIVE_TYPES.CLEAR, target: 40, gem: 'elf', icon: '🧝' },
            { type: OBJECTIVE_TYPES.SPECIAL, target: 3, specialType: 'bomb', icon: '💣' }
        ],
        stars: [6500, 10000, 14000]
    }),

    LevelGenerator.createLevel(24, {
        moves: 32,
        gems: ['orc', 'elf', 'mage', 'knight', 'dwarf', 'undead'],
        objectives: [
            { type: OBJECTIVE_TYPES.COMBO, target: 8, icon: '🔥' }
        ],
        stars: [5500, 9000, 13000]
    }),

    LevelGenerator.createLevel(25, {
        moves: 30,
        gems: ['orc', 'elf', 'mage', 'knight', 'dwarf', 'undead'],
        objectives: [
            { type: OBJECTIVE_TYPES.CLEAR, target: 25, gem: 'mage', icon: '🧙' },
            { type: OBJECTIVE_TYPES.CLEAR, target: 25, gem: 'undead', icon: '💀' },
            { type: OBJECTIVE_TYPES.SCORE, target: 5000, icon: '⭐' }
        ],
        stars: [7000, 11000, 15000]
    }),

    LevelGenerator.createLevel(26, {
        width: 7,
        height: 7,
        moves: 25,
        gems: ['orc', 'elf', 'mage', 'knight', 'dwarf', 'undead'],
        objectives: [
            { type: OBJECTIVE_TYPES.SPECIAL, target: 6, specialType: 'any', icon: '✨' }
        ],
        stars: [6000, 9500, 13500]
    }),

    LevelGenerator.createLevel(27, {
        moves: 32,
        gems: ['orc', 'elf', 'mage', 'knight', 'dwarf', 'undead'],
        objectives: [
            { type: OBJECTIVE_TYPES.SCORE, target: 8000, icon: '⭐' },
            { type: OBJECTIVE_TYPES.COMBO, target: 6, icon: '🔥' }
        ],
        stars: [8000, 12000, 16000]
    }),

    LevelGenerator.createLevel(28, {
        moves: 30,
        gems: ['elf', 'mage', 'knight', 'dwarf', 'undead'],
        objectives: [
            { type: OBJECTIVE_TYPES.CLEAR, target: 50, gem: 'knight', icon: '⚔️' }
        ],
        stars: [7500, 11500, 15500]
    }),

    LevelGenerator.createLevel(29, {
        moves: 28,
        gems: ['orc', 'elf', 'mage', 'knight', 'dwarf', 'undead'],
        objectives: [
            { type: OBJECTIVE_TYPES.SPECIAL, target: 4, specialType: 'line', icon: '➡️' },
            { type: OBJECTIVE_TYPES.SPECIAL, target: 2, specialType: 'bomb', icon: '💣' }
        ],
        stars: [7000, 11000, 15000]
    }),

    LevelGenerator.createLevel(30, {
        moves: 38,
        gems: ['orc', 'elf', 'mage', 'knight', 'dwarf', 'undead'],
        objectives: [
            { type: OBJECTIVE_TYPES.SCORE, target: 10000, icon: '⭐' },
            { type: OBJECTIVE_TYPES.CLEAR, target: 35, gem: 'orc', icon: '👹' },
            { type: OBJECTIVE_TYPES.COMBO, target: 10, icon: '🔥' }
        ],
        stars: [10000, 15000, 20000]
    }),

    // ==========================================
    // 第四章：诅咒之地 (31-40) - 引入芒果
    // ==========================================

    LevelGenerator.createLevel(31, {
        moves: 30,
        gems: ['elf', 'mage', 'knight', 'dwarf', 'undead', 'mango'],
        objectives: [
            { type: OBJECTIVE_TYPES.CLEAR, target: 15, gem: 'mango', icon: '🥭' }
        ],
        stars: [8000, 12000, 17000]
    }),

    LevelGenerator.createLevel(32, {
        moves: 32,
        gems: ['elf', 'mage', 'knight', 'dwarf', 'undead', 'mango'],
        objectives: [
            { type: OBJECTIVE_TYPES.SCORE, target: 9000, icon: '⭐' },
            { type: OBJECTIVE_TYPES.CLEAR, target: 20, gem: 'mango', icon: '🥭' }
        ],
        stars: [9000, 14000, 19000]
    }),

    LevelGenerator.createLevel(33, {
        width: 9,
        height: 9,
        moves: 35,
        gems: ['elf', 'mage', 'knight', 'dwarf', 'undead', 'mango'],
        objectives: [
            { type: OBJECTIVE_TYPES.SCORE, target: 12000, icon: '⭐' }
        ],
        stars: [12000, 18000, 24000]
    }),

    LevelGenerator.createLevel(34, {
        moves: 30,
        gems: ['mage', 'knight', 'dwarf', 'undead', 'mango'],
        objectives: [
            { type: OBJECTIVE_TYPES.CLEAR, target: 30, gem: 'undead', icon: '💀' },
            { type: OBJECTIVE_TYPES.CLEAR, target: 25, gem: 'mango', icon: '🥭' }
        ],
        stars: [10000, 15000, 20000]
    }),

    LevelGenerator.createLevel(35, {
        moves: 28,
        gems: ['elf', 'mage', 'knight', 'dwarf', 'undead', 'mango'],
        objectives: [
            { type: OBJECTIVE_TYPES.COMBO, target: 12, icon: '🔥' }
        ],
        stars: [9000, 14000, 19000]
    }),

    LevelGenerator.createLevel(36, {
        moves: 32,
        gems: ['elf', 'mage', 'knight', 'dwarf', 'undead', 'mango'],
        objectives: [
            { type: OBJECTIVE_TYPES.SPECIAL, target: 8, specialType: 'any', icon: '✨' },
            { type: OBJECTIVE_TYPES.SCORE, target: 8000, icon: '⭐' }
        ],
        stars: [11000, 16000, 22000]
    }),

    LevelGenerator.createLevel(37, {
        width: 7,
        height: 9,
        moves: 30,
        gems: ['mage', 'knight', 'dwarf', 'undead', 'mango'],
        objectives: [
            { type: OBJECTIVE_TYPES.CLEAR, target: 40, gem: 'mage', icon: '🧙' },
            { type: OBJECTIVE_TYPES.CLEAR, target: 30, gem: 'mango', icon: '🥭' }
        ],
        stars: [10500, 16000, 21500]
    }),

    LevelGenerator.createLevel(38, {
        moves: 30,
        gems: ['elf', 'mage', 'knight', 'dwarf', 'undead', 'mango'],
        objectives: [
            { type: OBJECTIVE_TYPES.SPECIAL, target: 3, specialType: 'rainbow', icon: '🌈' }
        ],
        stars: [10000, 15000, 20000]
    }),

    LevelGenerator.createLevel(39, {
        moves: 35,
        gems: ['elf', 'mage', 'knight', 'dwarf', 'undead', 'mango'],
        objectives: [
            { type: OBJECTIVE_TYPES.SCORE, target: 12000, icon: '⭐' },
            { type: OBJECTIVE_TYPES.COMBO, target: 8, icon: '🔥' },
            { type: OBJECTIVE_TYPES.SPECIAL, target: 5, specialType: 'line', icon: '➡️' }
        ],
        stars: [12000, 18000, 24000]
    }),

    LevelGenerator.createLevel(40, {
        moves: 40,
        gems: ['elf', 'mage', 'knight', 'dwarf', 'undead', 'mango'],
        objectives: [
            { type: OBJECTIVE_TYPES.SCORE, target: 15000, icon: '⭐' },
            { type: OBJECTIVE_TYPES.CLEAR, target: 50, gem: 'mango', icon: '🥭' },
            { type: OBJECTIVE_TYPES.COMBO, target: 15, icon: '🔥' }
        ],
        stars: [15000, 22000, 30000]
    }),

    // ==========================================
    // 第五章：燃烧平原 (41-50) - 引入龙
    // ==========================================

    LevelGenerator.createLevel(41, {
        moves: 32,
        gems: ['mage', 'knight', 'dwarf', 'undead', 'mango', 'dragon'],
        objectives: [
            { type: OBJECTIVE_TYPES.CLEAR, target: 10, gem: 'dragon', icon: '🐉' }
        ],
        stars: [12000, 18000, 25000]
    }),

    LevelGenerator.createLevel(42, {
        moves: 35,
        gems: ['mage', 'knight', 'dwarf', 'undead', 'mango', 'dragon'],
        objectives: [
            { type: OBJECTIVE_TYPES.SCORE, target: 14000, icon: '⭐' },
            { type: OBJECTIVE_TYPES.CLEAR, target: 15, gem: 'dragon', icon: '🐉' }
        ],
        stars: [14000, 21000, 28000]
    }),

    LevelGenerator.createLevel(43, {
        width: 9,
        height: 8,
        moves: 33,
        gems: ['knight', 'dwarf', 'undead', 'mango', 'dragon'],
        objectives: [
            { type: OBJECTIVE_TYPES.CLEAR, target: 40, gem: 'dwarf', icon: '🪓' },
            { type: OBJECTIVE_TYPES.CLEAR, target: 20, gem: 'dragon', icon: '🐉' }
        ],
        stars: [13000, 20000, 27000]
    }),

    LevelGenerator.createLevel(44, {
        moves: 30,
        gems: ['mage', 'knight', 'dwarf', 'undead', 'mango', 'dragon'],
        objectives: [
            { type: OBJECTIVE_TYPES.COMBO, target: 15, icon: '🔥' },
            { type: OBJECTIVE_TYPES.SPECIAL, target: 5, specialType: 'bomb', icon: '💣' }
        ],
        stars: [14000, 21000, 28000]
    }),

    LevelGenerator.createLevel(45, {
        moves: 35,
        gems: ['mage', 'knight', 'dwarf', 'undead', 'mango', 'dragon'],
        objectives: [
            { type: OBJECTIVE_TYPES.SCORE, target: 16000, icon: '⭐' },
            { type: OBJECTIVE_TYPES.SPECIAL, target: 10, specialType: 'any', icon: '✨' }
        ],
        stars: [16000, 24000, 32000]
    }),

    LevelGenerator.createLevel(46, {
        width: 8,
        height: 9,
        moves: 35,
        gems: ['knight', 'dwarf', 'undead', 'mango', 'dragon'],
        objectives: [
            { type: OBJECTIVE_TYPES.CLEAR, target: 50, gem: 'undead', icon: '💀' },
            { type: OBJECTIVE_TYPES.CLEAR, target: 30, gem: 'dragon', icon: '🐉' }
        ],
        stars: [15000, 22000, 30000]
    }),

    LevelGenerator.createLevel(47, {
        moves: 32,
        gems: ['mage', 'knight', 'dwarf', 'undead', 'mango', 'dragon'],
        objectives: [
            { type: OBJECTIVE_TYPES.SPECIAL, target: 4, specialType: 'rainbow', icon: '🌈' },
            { type: OBJECTIVE_TYPES.COMBO, target: 10, icon: '🔥' }
        ],
        stars: [14500, 21500, 29000]
    }),

    LevelGenerator.createLevel(48, {
        moves: 35,
        gems: ['mage', 'knight', 'dwarf', 'undead', 'mango', 'dragon'],
        objectives: [
            { type: OBJECTIVE_TYPES.SCORE, target: 18000, icon: '⭐' },
            { type: OBJECTIVE_TYPES.CLEAR, target: 40, gem: 'mango', icon: '🥭' }
        ],
        stars: [18000, 27000, 36000]
    }),

    LevelGenerator.createLevel(49, {
        moves: 38,
        gems: ['knight', 'dwarf', 'undead', 'mango', 'dragon'],
        objectives: [
            { type: OBJECTIVE_TYPES.CLEAR, target: 60, gem: 'knight', icon: '⚔️' },
            { type: OBJECTIVE_TYPES.CLEAR, target: 40, gem: 'dragon', icon: '🐉' },
            { type: OBJECTIVE_TYPES.SPECIAL, target: 6, specialType: 'line', icon: '➡️' }
        ],
        stars: [17000, 25000, 34000]
    }),

    LevelGenerator.createLevel(50, {
        moves: 45,
        gems: ['mage', 'knight', 'dwarf', 'undead', 'mango', 'dragon'],
        objectives: [
            { type: OBJECTIVE_TYPES.SCORE, target: 25000, icon: '⭐' },
            { type: OBJECTIVE_TYPES.CLEAR, target: 50, gem: 'dragon', icon: '🐉' },
            { type: OBJECTIVE_TYPES.COMBO, target: 20, icon: '🔥' },
            { type: OBJECTIVE_TYPES.SPECIAL, target: 5, specialType: 'rainbow', icon: '🌈' }
        ],
        stars: [25000, 35000, 50000]
    }),

    // ==========================================
    // 第六章：诺森德 (51-60) - 最终挑战
    // ==========================================

    LevelGenerator.createLevel(51, {
        moves: 35,
        gems: ['knight', 'dwarf', 'undead', 'mango', 'dragon', 'phoenix'],
        objectives: [
            { type: OBJECTIVE_TYPES.CLEAR, target: 10, gem: 'phoenix', icon: '🔥' }
        ],
        stars: [18000, 27000, 36000]
    }),

    LevelGenerator.createLevel(52, {
        width: 9,
        height: 9,
        moves: 40,
        gems: ['knight', 'dwarf', 'undead', 'mango', 'dragon', 'phoenix'],
        objectives: [
            { type: OBJECTIVE_TYPES.SCORE, target: 22000, icon: '⭐' },
            { type: OBJECTIVE_TYPES.CLEAR, target: 15, gem: 'phoenix', icon: '🔥' }
        ],
        stars: [22000, 32000, 42000]
    }),

    LevelGenerator.createLevel(53, {
        moves: 35,
        gems: ['dwarf', 'undead', 'mango', 'dragon', 'phoenix'],
        objectives: [
            { type: OBJECTIVE_TYPES.CLEAR, target: 50, gem: 'mango', icon: '🥭' },
            { type: OBJECTIVE_TYPES.CLEAR, target: 30, gem: 'phoenix', icon: '🔥' }
        ],
        stars: [20000, 30000, 40000]
    }),

    LevelGenerator.createLevel(54, {
        moves: 38,
        gems: ['knight', 'dwarf', 'undead', 'mango', 'dragon', 'phoenix'],
        objectives: [
            { type: OBJECTIVE_TYPES.COMBO, target: 20, icon: '🔥' },
            { type: OBJECTIVE_TYPES.SPECIAL, target: 8, specialType: 'bomb', icon: '💣' }
        ],
        stars: [21000, 31000, 42000]
    }),

    LevelGenerator.createLevel(55, {
        moves: 40,
        gems: ['knight', 'dwarf', 'undead', 'mango', 'dragon', 'phoenix'],
        objectives: [
            { type: OBJECTIVE_TYPES.SCORE, target: 28000, icon: '⭐' },
            { type: OBJECTIVE_TYPES.SPECIAL, target: 12, specialType: 'any', icon: '✨' }
        ],
        stars: [28000, 40000, 52000]
    }),

    LevelGenerator.createLevel(56, {
        width: 8,
        height: 10,
        moves: 42,
        gems: ['dwarf', 'undead', 'mango', 'dragon', 'phoenix'],
        objectives: [
            { type: OBJECTIVE_TYPES.CLEAR, target: 60, gem: 'dragon', icon: '🐉' },
            { type: OBJECTIVE_TYPES.CLEAR, target: 40, gem: 'phoenix', icon: '🔥' }
        ],
        stars: [25000, 37000, 50000]
    }),

    LevelGenerator.createLevel(57, {
        moves: 40,
        gems: ['knight', 'dwarf', 'undead', 'mango', 'dragon', 'phoenix'],
        objectives: [
            { type: OBJECTIVE_TYPES.SPECIAL, target: 6, specialType: 'rainbow', icon: '🌈' },
            { type: OBJECTIVE_TYPES.COMBO, target: 15, icon: '🔥' }
        ],
        stars: [24000, 35000, 48000]
    }),

    LevelGenerator.createLevel(58, {
        moves: 42,
        gems: ['knight', 'dwarf', 'undead', 'mango', 'dragon', 'phoenix'],
        objectives: [
            { type: OBJECTIVE_TYPES.SCORE, target: 32000, icon: '⭐' },
            { type: OBJECTIVE_TYPES.CLEAR, target: 50, gem: 'undead', icon: '💀' },
            { type: OBJECTIVE_TYPES.CLEAR, target: 50, gem: 'mango', icon: '🥭' }
        ],
        stars: [32000, 45000, 60000]
    }),

    LevelGenerator.createLevel(59, {
        width: 9,
        height: 9,
        moves: 45,
        gems: ['dwarf', 'undead', 'mango', 'dragon', 'phoenix'],
        objectives: [
            { type: OBJECTIVE_TYPES.CLEAR, target: 70, gem: 'phoenix', icon: '🔥' },
            { type: OBJECTIVE_TYPES.SPECIAL, target: 10, specialType: 'line', icon: '➡️' },
            { type: OBJECTIVE_TYPES.COMBO, target: 25, icon: '🔥' }
        ],
        stars: [30000, 42000, 56000]
    }),

    // 最终关卡
    LevelGenerator.createLevel(60, {
        width: 9,
        height: 9,
        moves: 50,
        gems: ['knight', 'dwarf', 'undead', 'mango', 'dragon', 'phoenix'],
        objectives: [
            { type: OBJECTIVE_TYPES.SCORE, target: 50000, icon: '⭐' },
            { type: OBJECTIVE_TYPES.CLEAR, target: 80, gem: 'mango', icon: '🥭' },
            { type: OBJECTIVE_TYPES.CLEAR, target: 60, gem: 'phoenix', icon: '🔥' },
            { type: OBJECTIVE_TYPES.COMBO, target: 30, icon: '🔥' },
            { type: OBJECTIVE_TYPES.SPECIAL, target: 8, specialType: 'rainbow', icon: '🌈' }
        ],
        stars: [50000, 75000, 100000]
    })
];

// 获取关卡数据
function getLevel(levelId) {
    return LEVELS.find(l => l.id === levelId) || LEVELS[0];
}

// 获取章节数据
function getChapter(chapterId) {
    return CHAPTERS.find(c => c.id === chapterId) || CHAPTERS[0];
}

// 获取章节关卡列表
function getChapterLevels(chapterId) {
    const chapter = getChapter(chapterId);
    return LEVELS.filter(l => l.id >= chapter.levels[0] && l.id <= chapter.levels[1]);
}

// 检查章节是否解锁
function isChapterUnlocked(chapterId, maxUnlockedLevel) {
    const chapter = getChapter(chapterId);
    return maxUnlockedLevel >= chapter.unlockLevel;
}

// 获取总关卡数
function getTotalLevels() {
    return LEVELS.length;
}

// 获取总章节数
function getTotalChapters() {
    return CHAPTERS.length;
}
