/* ==========================================
   芒果庄园 - 关卡设计 (升级版 100+ 关)
   含Boss关、限时关、收集关
   ========================================== */

// 宝石类型定义
const GEM_TYPES = {
    murloc:  { id:'murloc',  emoji:'🐸', name:'鱼人',     color:'#22c55e', rarity:'common' },
    orc:     { id:'orc',     emoji:'👹', name:'兽人',     color:'#dc2626', rarity:'common' },
    elf:     { id:'elf',     emoji:'🧝‍♀️', name:'精灵',  color:'#a855f7', rarity:'common' },
    mage:    { id:'mage',    emoji:'🧙‍♂️', name:'法师',  color:'#3b82f6', rarity:'common' },
    knight:  { id:'knight',  emoji:'🛡️', name:'骑士',     color:'#ef4444', rarity:'common' },
    dwarf:   { id:'dwarf',   emoji:'⛏️', name:'矮人',     color:'#f97316', rarity:'common' },
    undead:  { id:'undead',  emoji:'☠️', name:'亡灵',     color:'#6b7280', rarity:'common' },
    mango:   { id:'mango',   emoji:'🥭', name:'芒果',     color:'#fbbf24', rarity:'rare' },
    dragon:  { id:'dragon',  emoji:'🐉', name:'巨龙',     color:'#dc2626', rarity:'epic' },
    phoenix: { id:'phoenix', emoji:'🔥', name:'凤凰',     color:'#f97316', rarity:'legendary' },
    skull:   { id:'skull',   emoji:'💀', name:'骷髅',     color:'#6b7280', rarity:'special' }
};

// 章节定义 - 10 chapters
const CHAPTERS = [
    { id:1,  name:'艾尔文森林', description:'芒果树林中潜伏着神秘的力量...',    icon:'🌲', levels:[1,10],   unlockLevel:0,  background:'forest' },
    { id:2,  name:'西部荒野',   description:'在荒野中寻找珍贵的芒果矿石...',    icon:'🏜️', levels:[11,20],  unlockLevel:10, background:'desert' },
    { id:3,  name:'暴风城',     description:'王国的中心，芒果贸易的枢纽...',     icon:'🏰', levels:[21,30],  unlockLevel:20, background:'castle' },
    { id:4,  name:'诅咒之地',   description:'被黑暗力量笼罩的神秘区域...',       icon:'🌑', levels:[31,40],  unlockLevel:30, background:'dark' },
    { id:5,  name:'燃烧平原',   description:'熔岩与火焰的试炼之地...',           icon:'🌋', levels:[41,50],  unlockLevel:40, background:'fire' },
    { id:6,  name:'诺森德',     description:'冰封王座的极寒挑战...',             icon:'❄️', levels:[51,60],  unlockLevel:50, background:'ice' },
    { id:7,  name:'翡翠森林',   description:'连锁反应在翡翠丛林中回荡...',         icon:'🌿', levels:[61,70],  unlockLevel:60, background:'emerald' },
    { id:8,  name:'水晶洞穴',   description:'迷雾笼罩的水晶洞穴，视野受限...',    icon:'💎', levels:[71,80],  unlockLevel:70, background:'crystal' },
    { id:9,  name:'星空之境',   description:'重力在星光下不再恒定...',             icon:'🌌', levels:[81,90],  unlockLevel:80, background:'starlight' },
    { id:10, name:'芒果天堂',   description:'终极挑战——所有机制的融合！',          icon:'🥭', levels:[91,100], unlockLevel:90, background:'paradise' }
];

// 目标类型
const OBJECTIVE_TYPES = {
    SCORE:'score', COLLECT:'collect', CLEAR:'clear', COMBO:'combo', SPECIAL:'special', MOVES:'moves'
};

// 关卡生成器
const LevelGenerator = {
    createLevel(id, config) {
        const defaults = {
            id, chapter: Math.ceil(id/10), width:8, height:8, moves:30,
            gems:['murloc','orc','elf','mage','knight'],
            objectives:[{type:OBJECTIVE_TYPES.SCORE, target:1000}],
            stars:[1000,2000,3500], special:{}, blockers:[], tutorial:null,
            timed: false, timeLimit: 0,
            boss: false
        };
        return {...defaults, ...config};
    },
    getChapterGems(chapter) {
        const pools = {
            1: ['murloc','orc','elf','mage','knight'],
            2: ['murloc','orc','elf','mage','knight','dwarf'],
            3: ['orc','elf','mage','knight','dwarf','undead'],
            4: ['elf','mage','knight','dwarf','undead','mango'],
            5: ['mage','knight','dwarf','undead','mango','dragon'],
            6: ['knight','dwarf','undead','mango','dragon','phoenix'],
            7: ['elf','mage','mango','dragon','phoenix','murloc'],
            8: ['orc','knight','undead','mango','dragon','phoenix'],
            9: ['mage','dwarf','mango','dragon','phoenix','elf'],
            10:['knight','dwarf','undead','mango','dragon','phoenix']
        };
        return pools[chapter] || pools[1];
    }
};

const L = LevelGenerator.createLevel.bind(LevelGenerator);

// ====================================
// ALL 100 LEVELS
// ====================================
const LEVELS = [
// =========== Ch1: 艾尔文森林 (1-10) ===========
// Design: tight moves, escalating objectives, teach mechanics through pressure
L(1,  { moves:20, gems:['murloc','orc','elf','mage'], objectives:[{type:'score',target:600,icon:'⭐'}], stars:[600,1200,2000], tutorial:'basic' }),
L(2,  { moves:20, gems:['murloc','orc','elf','mage'], objectives:[{type:'clear',target:12,gem:'murloc',icon:'🐟'}], stars:[600,1200,2000], tutorial:'collect' }),
L(3,  { moves:18, gems:['murloc','orc','elf','mage','knight'], objectives:[{type:'clear',target:12,gem:'orc',icon:'👹'},{type:'clear',target:12,gem:'elf',icon:'🧝♀️'}], stars:[1000,1800,2800] }),
L(4,  { moves:18, gems:['murloc','orc','elf','mage','knight'], objectives:[{type:'special',target:2,specialType:'line',icon:'⚡',label:'连4消生成'}], stars:[1200,2200,3200], tutorial:'special' }),
L(5,  { moves:20, gems:['murloc','orc','elf','mage','knight'], objectives:[{type:'score',target:2500,icon:'⭐'},{type:'combo',target:2,icon:'🔥'}], stars:[2500,4000,6000] }),
L(6,  { moves:18, gems:['murloc','orc','elf','mage','knight'], objectives:[{type:'clear',target:25,gem:'mage',icon:'🧙♂️'},{type:'score',target:2000,icon:'⭐'}], stars:[2000,3500,5000] }),
L(7,  { moves:20, gems:['murloc','orc','elf','mage','knight'], timed:true, timeLimit:60, objectives:[{type:'score',target:2000,icon:'⭐'}], stars:[2000,3500,5500] }),
L(8,  { moves:22, gems:['murloc','orc','elf','mage','knight'], objectives:[{type:'clear',target:18,gem:'knight',icon:'⚔️'},{type:'clear',target:18,gem:'murloc',icon:'🐟'},{type:'special',target:1,specialType:'any',icon:'✨'}], stars:[2500,4000,6000] }),
L(9,  { moves:22, gems:['murloc','orc','elf','mage','knight'], objectives:[{type:'special',target:3,specialType:'any',icon:'✨'},{type:'combo',target:3,icon:'🔥'}], stars:[3000,5000,7500] }),
L(10, { moves:30, gems:['murloc','orc','elf','mage','knight'], boss:true, objectives:[{type:'score',target:5000,icon:'⭐'}], stars:[5000,8000,12000] }),

// =========== Ch2: 西部荒野 (11-20) ===========
// Design: introduce 6th gem (harder to match), frozen cells, tighter multi-objectives
L(11, { moves:22, gems:['murloc','orc','elf','mage','knight','dwarf'], objectives:[{type:'clear',target:20,gem:'dwarf',icon:'🪓'},{type:'score',target:2000,icon:'⭐'}], stars:[2500,4000,6000] }),
L(12, { moves:24, gems:['murloc','orc','elf','mage','knight','dwarf'], objectives:[{type:'special',target:3,specialType:'line',icon:'⚡',label:'连4消生成'},{type:'score',target:3000,icon:'⭐'}], stars:[3500,5500,8000] }),
L(13, { moves:20, gems:['orc','elf','mage','knight','dwarf'], objectives:[{type:'clear',target:22,gem:'orc',icon:'👹'},{type:'clear',target:22,gem:'mage',icon:'🧙♂️'}], stars:[3500,5500,8000] }),
L(14, { moves:22, gems:['murloc','orc','elf','mage','knight','dwarf'], objectives:[{type:'combo',target:5,icon:'🔥'},{type:'special',target:2,specialType:'bomb',icon:'💣'}], stars:[4000,6500,9500] }),
L(15, { width:7, height:9, moves:25, gems:['murloc','orc','elf','mage','knight','dwarf'], objectives:[{type:'score',target:5000,icon:'⭐'},{type:'clear',target:25,gem:'dwarf',icon:'🪓'}], stars:[5000,7500,10500] }),
L(16, { moves:22, gems:['murloc','orc','elf','mage','knight','dwarf'], timed:true, timeLimit:75, objectives:[{type:'score',target:4000,icon:'⭐'},{type:'combo',target:3,icon:'🔥'}], stars:[4000,6500,9500] }),
L(17, { moves:24, gems:['orc','elf','mage','knight','dwarf'], objectives:[{type:'special',target:2,specialType:'bomb',icon:'💣'},{type:'clear',target:30,gem:'elf',icon:'🧝♀️'}], stars:[4500,7000,10000] }),
L(18, { moves:25, gems:['murloc','orc','elf','mage','knight','dwarf'], objectives:[{type:'score',target:6000,icon:'⭐'},{type:'clear',target:20,gem:'dwarf',icon:'🪓'},{type:'special',target:1,specialType:'any',icon:'✨'}], stars:[6000,9000,12000] }),
L(19, { moves:25, gems:['murloc','orc','elf','mage','knight','dwarf'], objectives:[{type:'special',target:4,specialType:'any',icon:'✨'},{type:'combo',target:4,icon:'🔥'}], stars:[5000,8000,11000] }),
L(20, { moves:32, gems:['murloc','orc','elf','mage','knight','dwarf'], boss:true, objectives:[{type:'score',target:7000,icon:'⭐'}], stars:[7000,11000,15000] }),

// =========== Ch3: 暴风城 (21-30) — combo theme ===========
L(21, { moves:24, gems:['orc','elf','mage','knight','dwarf','undead'], objectives:[{type:'clear',target:20,gem:'undead',icon:'💀'},{type:'combo',target:3,icon:'🔥'}], stars:[5000,8000,12000] }),
L(22, { width:9, height:7, moves:22, gems:['orc','elf','mage','knight','dwarf','undead'], objectives:[{type:'score',target:6000,icon:'⭐'},{type:'combo',target:4,icon:'🔥'}], stars:[6000,9500,13000] }),
L(23, { moves:28, gems:['elf','mage','knight','dwarf','undead'], objectives:[{type:'clear',target:30,gem:'elf',icon:'🧝♀️'},{type:'special',target:1,specialType:'bomb',icon:'💣'},{type:'combo',target:3,icon:'🔥'}], stars:[6500,10000,14000] }),
L(24, { moves:26, gems:['orc','elf','mage','knight','dwarf','undead'], timed:true, timeLimit:80, objectives:[{type:'score',target:6000,icon:'⭐'},{type:'combo',target:5,icon:'🔥'}], stars:[5500,9000,13000] }),
L(25, { moves:24, gems:['orc','elf','mage','knight','dwarf','undead'], objectives:[{type:'clear',target:25,gem:'mage',icon:'🧙♂️'},{type:'clear',target:25,gem:'undead',icon:'💀'},{type:'combo',target:4,icon:'🔥'}], stars:[7000,11000,15000] }),
L(26, { width:7, height:7, moves:24, gems:['orc','elf','mage','knight','dwarf','undead'], objectives:[{type:'special',target:3,specialType:'any',icon:'✨'},{type:'combo',target:5,icon:'🔥'}], stars:[6000,9500,13500] }),
L(27, { moves:25, gems:['orc','elf','mage','knight','dwarf','undead'], objectives:[{type:'score',target:8000,icon:'⭐'},{type:'combo',target:6,icon:'🔥'}], stars:[8000,12000,16000] }),
L(28, { moves:24, gems:['elf','mage','knight','dwarf','undead'], objectives:[{type:'clear',target:50,gem:'knight',icon:'⚔️'},{type:'combo',target:5,icon:'🔥'}], stars:[7500,11500,15500] }),
L(29, { moves:28, gems:['orc','elf','mage','knight','dwarf','undead'], objectives:[{type:'special',target:2,specialType:'line',icon:'⚡',label:'连4消生成'},{type:'special',target:1,specialType:'bomb',icon:'💣'},{type:'combo',target:6,icon:'🔥'}], stars:[7000,11000,15000] }),
L(30, { moves:32, gems:['orc','elf','mage','knight','dwarf','undead'], boss:true, objectives:[{type:'score',target:10000,icon:'⭐'},{type:'combo',target:8,icon:'🔥'},{type:'special',target:3,specialType:'any',icon:'✨'},{type:'clear',target:30,gem:'undead',icon:'💀'}], stars:[10000,15000,20000] }),

// =========== Ch4: 诅咒之地 (31-40) — special theme ===========
L(31, { moves:24, gems:['elf','mage','knight','dwarf','undead','mango'], objectives:[{type:'clear',target:15,gem:'mango',icon:'🥭'},{type:'special',target:3,specialType:'any',icon:'✨'}], stars:[8000,12000,17000] }),
L(32, { moves:26, gems:['elf','mage','knight','dwarf','undead','mango'], objectives:[{type:'score',target:9000,icon:'⭐'},{type:'clear',target:20,gem:'mango',icon:'🥭'},{type:'special',target:2,specialType:'line',icon:'⚡'}], stars:[9000,14000,19000] }),
L(33, { width:9, height:9, moves:28, gems:['elf','mage','knight','dwarf','undead','mango'], objectives:[{type:'score',target:12000,icon:'⭐'},{type:'special',target:4,specialType:'bomb',icon:'💣'}], stars:[12000,18000,24000] }),
L(34, { moves:24, gems:['mage','knight','dwarf','undead','mango'], objectives:[{type:'clear',target:30,gem:'undead',icon:'💀'},{type:'clear',target:25,gem:'mango',icon:'🥭'},{type:'special',target:2,specialType:'any',icon:'✨'}], stars:[10000,15000,20000] }),
L(35, { moves:22, gems:['elf','mage','knight','dwarf','undead','mango'], timed:true, timeLimit:75, objectives:[{type:'score',target:10000,icon:'⭐'},{type:'special',target:3,specialType:'line',icon:'⚡'}], stars:[9000,14000,19000] }),
L(36, { moves:25, gems:['elf','mage','knight','dwarf','undead','mango'], objectives:[{type:'special',target:8,specialType:'any',icon:'✨'},{type:'score',target:8000,icon:'⭐'}], stars:[11000,16000,22000] }),
L(37, { width:7, height:9, moves:24, gems:['mage','knight','dwarf','undead','mango'], objectives:[{type:'clear',target:40,gem:'mage',icon:'🧙♂️'},{type:'clear',target:30,gem:'mango',icon:'🥭'},{type:'special',target:2,specialType:'bomb',icon:'💣'}], stars:[10500,16000,21500] }),
L(38, { moves:28, gems:['elf','mage','knight','dwarf','undead','mango'], objectives:[{type:'special',target:2,specialType:'rainbow',icon:'🌈'},{type:'special',target:4,specialType:'line',icon:'⚡'}], stars:[10000,15000,20000] }),
L(39, { moves:28, gems:['elf','mage','knight','dwarf','undead','mango'], objectives:[{type:'score',target:12000,icon:'⭐'},{type:'combo',target:8,icon:'🔥'},{type:'special',target:3,specialType:'bomb',icon:'💣'}], stars:[12000,18000,24000] }),
L(40, { moves:34, gems:['elf','mage','knight','dwarf','undead','mango'], boss:true, objectives:[{type:'score',target:15000,icon:'⭐'},{type:'special',target:5,specialType:'any',icon:'✨'},{type:'special',target:2,specialType:'rainbow',icon:'🌈'},{type:'clear',target:35,gem:'mango',icon:'🥭'}], stars:[15000,22000,30000] }),

// =========== Ch5: 燃烧平原 (41-50) — timed theme ===========
L(41, { moves:26, gems:['mage','knight','dwarf','undead','mango','dragon'], timed:true, timeLimit:90, objectives:[{type:'clear',target:10,gem:'dragon',icon:'🐉'},{type:'score',target:10000,icon:'⭐'}], stars:[12000,18000,25000] }),
L(42, { moves:28, gems:['mage','knight','dwarf','undead','mango','dragon'], objectives:[{type:'score',target:14000,icon:'⭐'},{type:'clear',target:15,gem:'dragon',icon:'🐉'}], stars:[14000,21000,28000] }),
L(43, { width:9, height:8, moves:26, gems:['knight','dwarf','undead','mango','dragon'], timed:true, timeLimit:80, objectives:[{type:'clear',target:40,gem:'dwarf',icon:'🪓'},{type:'clear',target:20,gem:'dragon',icon:'🐉'}], stars:[13000,20000,27000] }),
L(44, { moves:24, gems:['mage','knight','dwarf','undead','mango','dragon'], objectives:[{type:'combo',target:15,icon:'🔥'},{type:'special',target:5,specialType:'bomb',icon:'💣'}], stars:[14000,21000,28000] }),
L(45, { moves:28, gems:['mage','knight','dwarf','undead','mango','dragon'], timed:true, timeLimit:70, objectives:[{type:'score',target:15000,icon:'⭐'},{type:'special',target:4,specialType:'any',icon:'✨'}], stars:[16000,24000,32000] }),
L(46, { width:8, height:9, moves:28, gems:['knight','dwarf','undead','mango','dragon'], timed:true, timeLimit:75, objectives:[{type:'clear',target:50,gem:'undead',icon:'💀'},{type:'clear',target:30,gem:'dragon',icon:'🐉'}], stars:[15000,22000,30000] }),
L(47, { moves:28, gems:['mage','knight','dwarf','undead','mango','dragon'], timed:true, timeLimit:65, objectives:[{type:'special',target:2,specialType:'rainbow',icon:'🌈'},{type:'combo',target:6,icon:'🔥'}], stars:[14500,21500,29000] }),
L(48, { moves:28, gems:['mage','knight','dwarf','undead','mango','dragon'], objectives:[{type:'score',target:18000,icon:'⭐'},{type:'clear',target:40,gem:'mango',icon:'🥭'}], stars:[18000,27000,36000] }),
L(49, { moves:30, gems:['knight','dwarf','undead','mango','dragon'], timed:true, timeLimit:60, objectives:[{type:'clear',target:60,gem:'knight',icon:'⚔️'},{type:'special',target:6,specialType:'line',icon:'⚡',label:'连4消生成'}], stars:[17000,25000,34000] }),
L(50, { moves:38, gems:['mage','knight','dwarf','undead','mango','dragon'], boss:true, timed:true, timeLimit:120, objectives:[{type:'score',target:22000,icon:'⭐'},{type:'special',target:4,specialType:'rainbow',icon:'🌈'},{type:'combo',target:10,icon:'🔥'},{type:'clear',target:30,gem:'dragon',icon:'🐉'}], stars:[25000,35000,50000] }),

// =========== Ch6: 诺森德 (51-60) — multi-objective + hard ===========
L(51, { moves:28, gems:['knight','dwarf','undead','mango','dragon','phoenix'], objectives:[{type:'clear',target:10,gem:'phoenix',icon:'🔥'},{type:'special',target:3,specialType:'any',icon:'✨'},{type:'score',target:15000,icon:'⭐'}], stars:[18000,27000,36000] }),
L(52, { width:9, height:9, moves:32, gems:['knight','dwarf','undead','mango','dragon','phoenix'], objectives:[{type:'score',target:22000,icon:'⭐'},{type:'clear',target:15,gem:'phoenix',icon:'🔥'},{type:'combo',target:8,icon:'🔥'}], stars:[22000,32000,42000] }),
L(53, { moves:28, gems:['dwarf','undead','mango','dragon','phoenix'], objectives:[{type:'clear',target:50,gem:'mango',icon:'🥭'},{type:'clear',target:30,gem:'phoenix',icon:'🔥'},{type:'special',target:2,specialType:'bomb',icon:'💣'}], stars:[20000,30000,40000] }),
L(54, { moves:30, gems:['knight','dwarf','undead','mango','dragon','phoenix'], timed:true, timeLimit:65, objectives:[{type:'score',target:20000,icon:'⭐'},{type:'combo',target:10,icon:'🔥'},{type:'special',target:3,specialType:'line',icon:'⚡'}], stars:[21000,31000,42000] }),
L(55, { moves:32, gems:['knight','dwarf','undead','mango','dragon','phoenix'], objectives:[{type:'score',target:28000,icon:'⭐'},{type:'special',target:12,specialType:'any',icon:'✨'},{type:'clear',target:30,gem:'dragon',icon:'🐉'}], stars:[28000,40000,52000] }),
L(56, { width:8, height:10, moves:34, gems:['dwarf','undead','mango','dragon','phoenix'], objectives:[{type:'clear',target:60,gem:'dragon',icon:'🐉'},{type:'clear',target:40,gem:'phoenix',icon:'🔥'},{type:'combo',target:12,icon:'🔥'}], stars:[25000,37000,50000] }),
L(57, { moves:34, gems:['knight','dwarf','undead','mango','dragon','phoenix'], objectives:[{type:'special',target:3,specialType:'rainbow',icon:'🌈'},{type:'combo',target:8,icon:'🔥'},{type:'clear',target:40,gem:'undead',icon:'💀'}], stars:[24000,35000,48000] }),
L(58, { moves:34, gems:['knight','dwarf','undead','mango','dragon','phoenix'], objectives:[{type:'score',target:32000,icon:'⭐'},{type:'clear',target:50,gem:'undead',icon:'💀'},{type:'special',target:5,specialType:'bomb',icon:'💣'}], stars:[32000,45000,60000] }),
L(59, { width:9, height:9, moves:36, gems:['dwarf','undead','mango','dragon','phoenix'], objectives:[{type:'clear',target:70,gem:'phoenix',icon:'🔥'},{type:'combo',target:20,icon:'🔥'},{type:'special',target:3,specialType:'rainbow',icon:'🌈'}], stars:[30000,42000,56000] }),
L(60, { width:9, height:9, moves:42, gems:['knight','dwarf','undead','mango','dragon','phoenix'], boss:true, objectives:[{type:'score',target:30000,icon:'⭐'},{type:'clear',target:40,gem:'phoenix',icon:'🔥'},{type:'special',target:4,specialType:'rainbow',icon:'🌈'},{type:'combo',target:15,icon:'🔥'}], stars:[35000,50000,70000] }),

// =========== Ch7: 翡翠森林 (61-70) — Chain reactions theme ===========
// Each level emphasizes cascading chain combos; 2-3 objectives per level
L(61, { moves:24, gems:['elf','mage','mango','dragon','phoenix','murloc'], special:{chainBonus:true}, objectives:[{type:'combo',target:4,icon:'🔥',label:'连锁×4'},{type:'clear',target:20,gem:'elf',icon:'🧝♀️'}], stars:[20000,30000,40000] }),
L(62, { moves:26, gems:['elf','mage','mango','dragon','phoenix','murloc'], special:{chainBonus:true}, objectives:[{type:'combo',target:5,icon:'🔥',label:'连锁×5'},{type:'score',target:18000,icon:'⭐'}], stars:[21000,31000,42000] }),
L(63, { moves:26, gems:['elf','mage','mango','dragon','phoenix','murloc'], special:{chainBonus:true}, objectives:[{type:'combo',target:6,icon:'🔥',label:'连锁×6'},{type:'clear',target:25,gem:'mango',icon:'🥭'},{type:'special',target:2,specialType:'line',icon:'⚡'}], stars:[22000,33000,44000] }),
L(64, { moves:28, gems:['elf','mage','mango','dragon','phoenix'], special:{chainBonus:true}, objectives:[{type:'combo',target:7,icon:'🔥',label:'连锁×7'},{type:'clear',target:30,gem:'dragon',icon:'🐉'}], stars:[24000,35000,47000] }),
L(65, { moves:28, gems:['elf','mage','mango','dragon','phoenix','murloc'], special:{chainBonus:true}, objectives:[{type:'combo',target:8,icon:'🔥',label:'连锁×8'},{type:'special',target:3,specialType:'bomb',icon:'💣'},{type:'score',target:22000,icon:'⭐'}], stars:[25000,37000,50000] }),
L(66, { moves:30, gems:['mage','mango','dragon','phoenix','murloc'], special:{chainBonus:true}, objectives:[{type:'combo',target:8,icon:'🔥',label:'连锁×8'},{type:'clear',target:35,gem:'phoenix',icon:'🔥'}], stars:[27000,39000,52000] }),
L(67, { moves:30, gems:['elf','mage','mango','dragon','phoenix','murloc'], special:{chainBonus:true}, objectives:[{type:'combo',target:9,icon:'🔥',label:'连锁×9'},{type:'special',target:2,specialType:'rainbow',icon:'🌈'},{type:'clear',target:30,gem:'murloc',icon:'🐟'}], stars:[28000,41000,55000] }),
L(68, { width:9, height:9, moves:32, gems:['elf','mage','mango','dragon','phoenix','murloc'], special:{chainBonus:true}, objectives:[{type:'combo',target:10,icon:'🔥',label:'连锁×10'},{type:'score',target:28000,icon:'⭐'}], stars:[30000,43000,58000] }),
L(69, { moves:34, gems:['elf','mango','dragon','phoenix','murloc'], special:{chainBonus:true}, objectives:[{type:'combo',target:11,icon:'🔥',label:'连锁×11'},{type:'special',target:4,specialType:'bomb',icon:'💣'},{type:'clear',target:40,gem:'mage',icon:'🧙♂️'}], stars:[32000,46000,62000] }),
L(70, { moves:36, gems:['elf','mage','mango','dragon','phoenix','murloc'], boss:true, special:{chainBonus:true}, objectives:[{type:'combo',target:12,icon:'🔥',label:'连锁×12'},{type:'special',target:3,specialType:'rainbow',icon:'🌈'},{type:'score',target:32000,icon:'⭐'},{type:'clear',target:35,gem:'elf',icon:'🧝♀️',label:'清除森林'}], stars:[35000,50000,68000] }),

// =========== Ch8: 水晶洞穴 (71-80) — Fog / limited visibility theme ===========
// Fog tiles hide gems; adjacent matches reveal them. fogCount = number of fog-covered cells.
L(71, { moves:22, gems:['orc','knight','undead','mango','dragon','phoenix'], special:{fog:true,fogCount:8}, objectives:[{type:'clear',target:20,gem:'undead',icon:'💀'},{type:'score',target:25000,icon:'⭐'}], stars:[28000,40000,54000] }),
L(72, { moves:24, gems:['orc','knight','undead','mango','dragon','phoenix'], special:{fog:true,fogCount:10}, objectives:[{type:'combo',target:6,icon:'🔥'},{type:'clear',target:25,gem:'mango',icon:'🥭'}], stars:[30000,42000,56000] }),
L(73, { moves:24, gems:['orc','knight','undead','mango','dragon','phoenix'], special:{fog:true,fogCount:12}, objectives:[{type:'special',target:3,specialType:'any',icon:'✨'},{type:'clear',target:30,gem:'orc',icon:'👹'},{type:'score',target:28000,icon:'⭐'}], stars:[32000,45000,60000] }),
L(74, { moves:26, gems:['knight','undead','mango','dragon','phoenix'], special:{fog:true,fogCount:14}, objectives:[{type:'combo',target:7,icon:'🔥'},{type:'clear',target:35,gem:'knight',icon:'⚔️'}], stars:[33000,47000,63000] }),
L(75, { moves:26, gems:['orc','knight','undead','mango','dragon','phoenix'], special:{fog:true,fogCount:16}, objectives:[{type:'special',target:4,specialType:'bomb',icon:'💣'},{type:'score',target:32000,icon:'⭐'},{type:'combo',target:5,icon:'🔥'}], stars:[35000,50000,66000] }),
L(76, { moves:28, gems:['orc','knight','undead','mango','dragon'], special:{fog:true,fogCount:18}, objectives:[{type:'clear',target:40,gem:'dragon',icon:'🐉'},{type:'combo',target:8,icon:'🔥'}], stars:[37000,52000,70000] }),
L(77, { moves:30, gems:['orc','knight','undead','mango','dragon','phoenix'], special:{fog:true,fogCount:20}, objectives:[{type:'special',target:3,specialType:'rainbow',icon:'🌈'},{type:'clear',target:35,gem:'phoenix',icon:'🔥'}], stars:[38000,54000,72000] }),
L(78, { width:9, height:8, moves:30, gems:['knight','undead','mango','dragon','phoenix'], special:{fog:true,fogCount:22}, objectives:[{type:'score',target:36000,icon:'⭐'},{type:'combo',target:9,icon:'🔥'},{type:'special',target:5,specialType:'any',icon:'✨'}], stars:[40000,56000,75000] }),
L(79, { moves:32, gems:['orc','knight','undead','mango','dragon','phoenix'], special:{fog:true,fogCount:24}, objectives:[{type:'clear',target:50,gem:'mango',icon:'🥭'},{type:'special',target:4,specialType:'line',icon:'⚡'},{type:'combo',target:8,icon:'🔥'}], stars:[42000,59000,78000] }),
L(80, { width:9, height:9, moves:34, gems:['orc','knight','undead','mango','dragon','phoenix'], boss:true, special:{fog:true,fogCount:30}, objectives:[{type:'clear',target:40,gem:'orc',icon:'👹'},{type:'special',target:6,specialType:'any',icon:'✨'},{type:'combo',target:6,icon:'🔥'},{type:'score',target:38000,icon:'⭐'}], stars:[45000,63000,85000] }),

// =========== Ch9: 星空之境 (81-90) — Gravity shift theme ===========
// Gems periodically fall sideways instead of downward. gravityShift = true enables the mechanic.
L(81, { moves:20, gems:['mage','dwarf','mango','dragon','phoenix','elf'], special:{gravityShift:true}, objectives:[{type:'combo',target:8,icon:'🔥'},{type:'clear',target:25,gem:'mage',icon:'🧙♂️'}], stars:[35000,50000,66000] }),
L(82, { moves:22, gems:['mage','dwarf','mango','dragon','phoenix','elf'], special:{gravityShift:true}, objectives:[{type:'score',target:35000,icon:'⭐'},{type:'special',target:4,specialType:'any',icon:'✨'}], stars:[37000,52000,70000] }),
L(83, { moves:22, gems:['mage','dwarf','mango','dragon','phoenix'], special:{gravityShift:true}, objectives:[{type:'clear',target:30,gem:'dwarf',icon:'⛏️'},{type:'combo',target:9,icon:'🔥'},{type:'special',target:2,specialType:'bomb',icon:'💣'}], stars:[38000,54000,72000] }),
L(84, { moves:24, gems:['mage','dwarf','mango','dragon','phoenix','elf'], special:{gravityShift:true}, objectives:[{type:'clear',target:35,gem:'mango',icon:'🥭'},{type:'score',target:38000,icon:'⭐'}], stars:[40000,56000,75000] }),
L(85, { moves:24, gems:['dwarf','mango','dragon','phoenix','elf'], special:{gravityShift:true}, objectives:[{type:'special',target:5,specialType:'line',icon:'⚡'},{type:'combo',target:10,icon:'🔥'},{type:'clear',target:30,gem:'elf',icon:'🧝♀️'}], stars:[42000,59000,78000] }),
L(86, { moves:26, gems:['mage','dwarf','mango','dragon','phoenix','elf'], special:{gravityShift:true}, objectives:[{type:'clear',target:40,gem:'dragon',icon:'🐉'},{type:'special',target:3,specialType:'rainbow',icon:'🌈'}], stars:[44000,62000,82000] }),
L(87, { width:9, height:9, moves:28, gems:['mage','dwarf','mango','dragon','phoenix','elf'], special:{gravityShift:true}, objectives:[{type:'score',target:42000,icon:'⭐'},{type:'combo',target:12,icon:'🔥'},{type:'clear',target:35,gem:'phoenix',icon:'🔥'}], stars:[46000,64000,85000] }),
L(88, { moves:28, gems:['dwarf','mango','dragon','phoenix','elf'], special:{gravityShift:true}, objectives:[{type:'special',target:6,specialType:'bomb',icon:'💣'},{type:'clear',target:45,gem:'mango',icon:'🥭'}], stars:[48000,67000,88000] }),
L(89, { moves:30, gems:['mage','dwarf','mango','dragon','phoenix','elf'], special:{gravityShift:true}, objectives:[{type:'combo',target:14,icon:'🔥'},{type:'special',target:4,specialType:'rainbow',icon:'🌈'},{type:'score',target:45000,icon:'⭐'}], stars:[50000,70000,92000] }),
L(90, { width:9, height:9, moves:32, gems:['mage','dwarf','mango','dragon','phoenix','elf'], boss:true, timed:true, timeLimit:90, special:{gravityShift:true}, objectives:[{type:'score',target:48000,icon:'⭐'},{type:'combo',target:15,icon:'🔥'},{type:'special',target:5,specialType:'rainbow',icon:'🌈'},{type:'clear',target:50,gem:'dragon',icon:'🐉'}], stars:[52000,73000,98000] }),

// =========== Ch10: 芒果天堂 (91-100) — Ultimate challenge, all mechanics combined ===========
// Fog + gravity shifts + chain reactions. The hardest chapter in the game.
L(91,  { moves:18, gems:['knight','dwarf','undead','mango','dragon','phoenix'], special:{fog:true,fogCount:6,gravityShift:true,chainBonus:true}, objectives:[{type:'combo',target:10,icon:'🔥'},{type:'clear',target:25,gem:'mango',icon:'🥭'}], stars:[42000,60000,80000] }),
L(92,  { moves:20, gems:['knight','dwarf','undead','mango','dragon','phoenix'], special:{fog:true,fogCount:8,gravityShift:true,chainBonus:true}, objectives:[{type:'score',target:42000,icon:'⭐'},{type:'special',target:5,specialType:'any',icon:'✨'}], stars:[44000,62000,82000] }),
L(93,  { moves:20, gems:['knight','dwarf','undead','mango','dragon','phoenix'], special:{fog:true,fogCount:10,chainBonus:true}, objectives:[{type:'combo',target:12,icon:'🔥'},{type:'clear',target:30,gem:'knight',icon:'🛡️'},{type:'special',target:3,specialType:'bomb',icon:'💣'}], stars:[46000,65000,86000] }),
L(94,  { moves:22, gems:['dwarf','undead','mango','dragon','phoenix'], special:{gravityShift:true,chainBonus:true}, objectives:[{type:'clear',target:40,gem:'undead',icon:'☠️'},{type:'special',target:4,specialType:'rainbow',icon:'🌈'}], stars:[48000,67000,90000] }),
L(95,  { moves:22, gems:['knight','dwarf','undead','mango','dragon','phoenix'], special:{fog:true,fogCount:12,gravityShift:true,chainBonus:true}, objectives:[{type:'score',target:48000,icon:'⭐'},{type:'combo',target:14,icon:'🔥'},{type:'clear',target:35,gem:'dwarf',icon:'⛏️'}], stars:[50000,70000,94000] }),
L(96,  { width:9, height:9, moves:24, gems:['knight','undead','mango','dragon','phoenix'], special:{fog:true,fogCount:14,gravityShift:true,chainBonus:true}, objectives:[{type:'special',target:6,specialType:'bomb',icon:'💣'},{type:'clear',target:45,gem:'dragon',icon:'🐉'}], stars:[52000,73000,97000] }),
L(97,  { moves:26, gems:['knight','dwarf','undead','mango','dragon','phoenix'], special:{fog:true,fogCount:16,gravityShift:true,chainBonus:true}, timed:true, timeLimit:60, objectives:[{type:'score',target:50000,icon:'⭐'},{type:'combo',target:15,icon:'🔥'}], stars:[55000,77000,100000] }),
L(98,  { moves:28, gems:['knight','dwarf','undead','mango','dragon','phoenix'], special:{fog:true,fogCount:18,gravityShift:true,chainBonus:true}, objectives:[{type:'special',target:5,specialType:'rainbow',icon:'🌈'},{type:'clear',target:50,gem:'phoenix',icon:'🔥'},{type:'combo',target:16,icon:'🔥'}], stars:[58000,80000,106000] }),
L(99,  { width:9, height:9, moves:28, gems:['dwarf','undead','mango','dragon','phoenix'], special:{fog:true,fogCount:20,gravityShift:true,chainBonus:true}, timed:true, timeLimit:75, objectives:[{type:'score',target:55000,icon:'⭐'},{type:'combo',target:18,icon:'🔥'},{type:'special',target:6,specialType:'any',icon:'✨'}], stars:[60000,84000,112000] }),
L(100, { width:9, height:9, moves:30, gems:['knight','dwarf','undead','mango','dragon','phoenix'], boss:true, timed:true, timeLimit:120, special:{fog:true,fogCount:25,gravityShift:true,chainBonus:true}, objectives:[{type:'score',target:60000,icon:'⭐'},{type:'combo',target:20,icon:'🔥',label:'终极连锁'},{type:'special',target:6,specialType:'rainbow',icon:'🌈'},{type:'clear',target:60,gem:'mango',icon:'🥭',label:'芒果天堂'}], stars:[65000,90000,125000] }),
];

// ====================================
// API Functions
// ====================================
function getLevel(id) {
    // Built-in levels (1-100)
    const found = LEVELS.find(l => l.id === id);
    if (found) return found;
    // Procedural levels (101+) — uses LevelGen for infinite content!
    if (id > 100) {
        // Use the advanced LevelGen if available, fallback to basic
        if (typeof LevelGen !== 'undefined') {
            return LevelGen.generateLevel(id) || generateProceduralLevel(id);
        }
        return generateProceduralLevel(id);
    }
    return LEVELS[0];
}

// Legacy procedural level generator (fallback — LevelGen is preferred)
function generateProceduralLevel(id) {
    let seed = id * 2654435761;
    const rng = () => { seed = (seed * 16807 + 0) % 2147483647; return (seed - 1) / 2147483646; };
    const tier = Math.floor((id - 101) / 10);
    const commonGems = Object.keys(GEM_TYPES).filter(g => GEM_TYPES[g].rarity === 'common');
    const numGems = Math.min(5 + Math.floor(tier / 3), commonGems.length);
    const gems = []; const pool = [...commonGems];
    for (let i = 0; i < numGems; i++) { const idx = Math.floor(rng() * pool.length); gems.push(pool.splice(idx, 1)[0]); }
    if (rng() < 0.3 + tier * 0.02) gems.push('mango');
    if (tier >= 3 && rng() < 0.2 + tier * 0.01) gems.push('dragon');
    if (tier >= 6 && rng() < 0.15) gems.push('phoenix');
    const sizes = [[7,9],[8,10],[8,10],[9,11],[8,8],[9,9],[7,11]];
    const [w, h] = sizes[Math.floor(rng() * sizes.length)];
    const moves = Math.max(18, 35 - Math.floor(tier / 2)) + Math.floor(rng() * 8);
    const isTimed = rng() < 0.15 + tier * 0.01;
    const timeLimit = isTimed ? Math.max(40, 90 - tier * 2) + Math.floor(rng() * 20) : 0;
    const isBoss = id % 10 === 0;
    const objectives = [];
    const numObj = Math.min(1 + Math.floor(tier / 4), 3);
    for (let i = 0; i < numObj; i++) {
        const roll = rng();
        if (roll < 0.3) objectives.push({ type: 'score', target: 5000 + tier * 1000 + Math.floor(rng() * 3000), icon: '⭐' });
        else if (roll < 0.55) { const gem = gems[Math.floor(rng() * gems.length)]; objectives.push({ type: 'clear', target: 15 + tier * 2 + Math.floor(rng() * 10), gem, icon: GEM_TYPES[gem]?.emoji || '❓' }); }
        else if (roll < 0.8) objectives.push({ type: 'special', target: 3 + Math.floor(tier/2) + Math.floor(rng() * 3), specialType: 'any', icon: '✨' });
        else objectives.push({ type: 'combo', target: 3 + Math.floor(tier/3) + Math.floor(rng() * 3), icon: '🔥' });
    }
    const baseScore = 8000 + tier * 2000;
    const chapter = (Math.floor((id - 101) / 10) % CHAPTERS.length) + 1;
    return { id, procedural: true, chapter, width: w, height: h, moves, timed: isTimed, timeLimit, gems, objectives, boss: isBoss, stars: [baseScore, Math.floor(baseScore * 1.5), Math.floor(baseScore * 2.2)], special: {}, blockers: [] };
}
function getChapter(id) { return CHAPTERS.find(c => c.id === id) || CHAPTERS[0]; }
function getChapterLevels(chId) { const ch = getChapter(chId); return LEVELS.filter(l => l.id >= ch.levels[0] && l.id <= ch.levels[1]); }
function isChapterUnlocked(chId, maxLv) { return maxLv >= getChapter(chId).unlockLevel; }
function getTotalLevels() {
    // After beating all 100 levels, show procedural levels up to current progress
    const maxUnlocked = typeof Storage !== 'undefined' && Storage.getMaxUnlockedLevel ? Storage.getMaxUnlockedLevel() : 100;
    return Math.max(LEVELS.length, maxUnlocked);
}

// Get levels for a chapter, including procedural ones
function getChapterLevelsExtended(chapterId) {
    const builtIn = getChapterLevels(chapterId);
    // For procedural levels 101+, assign to cycling chapters
    const maxLevel = typeof Storage !== 'undefined' && Storage.getMaxUnlockedLevel ? Storage.getMaxUnlockedLevel() : 100;
    if (maxLevel > 100) {
        for (let id = 101; id <= maxLevel; id++) {
            const pChapter = (Math.floor((id - 101) / 10) % CHAPTERS.length) + 1;
            if (pChapter === chapterId) {
                builtIn.push(generateProceduralLevel(id));
            }
        }
    }
    return builtIn;
}
function getTotalChapters() { return CHAPTERS.length; }

// ====================================
// BALANCE PATCH — Combo objectives were unrealistically high.
// Cascade depth 5 is uncommon, 6+ is rare even with chainBonus.
// Cap combo targets to achievable ranges.
// ====================================
(function balancePatch() {
    const COMBO_CAP_DEFAULT = 5;   // Ch1-6: max cascade target
    const COMBO_CAP_CHAIN = 7;     // Ch7+ with chainBonus: max cascade target
    const COMBO_CAP_BOSS = 8;      // Boss levels with chainBonus can be slightly harder

    LEVELS.forEach(level => {
        if (!level.objectives) return;
        const hasChainBonus = level.special && level.special.chainBonus;
        const isBoss = level.boss;

        level.objectives.forEach(obj => {
            if (obj.type !== OBJECTIVE_TYPES.COMBO) return;
            let cap;
            if (hasChainBonus) {
                cap = isBoss ? COMBO_CAP_BOSS : COMBO_CAP_CHAIN;
            } else {
                cap = isBoss ? COMBO_CAP_DEFAULT + 1 : COMBO_CAP_DEFAULT;
            }
            if (obj.target > cap) {
                obj.target = cap;
                // Update label if present
                if (obj.label && obj.label.includes('×')) {
                    obj.label = `连锁×${cap}`;
                }
            }
        });
    });
})();
