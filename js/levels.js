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
    phoenix: { id:'phoenix', emoji:'🔥', name:'凤凰',     color:'#f97316', rarity:'legendary' }
};

// 章节定义 - 10 chapters
const CHAPTERS = [
    { id:1,  name:'艾尔文森林', description:'芒果树林中潜伏着神秘的力量...',    icon:'🌲', levels:[1,10],   unlockLevel:0,  background:'forest' },
    { id:2,  name:'西部荒野',   description:'在荒野中寻找珍贵的芒果矿石...',    icon:'🏜️', levels:[11,20],  unlockLevel:10, background:'desert' },
    { id:3,  name:'暴风城',     description:'王国的中心，芒果贸易的枢纽...',     icon:'🏰', levels:[21,30],  unlockLevel:20, background:'castle' },
    { id:4,  name:'诅咒之地',   description:'被黑暗力量笼罩的神秘区域...',       icon:'🌑', levels:[31,40],  unlockLevel:30, background:'dark' },
    { id:5,  name:'燃烧平原',   description:'熔岩与火焰的试炼之地...',           icon:'🌋', levels:[41,50],  unlockLevel:40, background:'fire' },
    { id:6,  name:'诺森德',     description:'冰封王座的极寒挑战...',             icon:'❄️', levels:[51,60],  unlockLevel:50, background:'ice' },
    { id:7,  name:'翡翠梦境',   description:'世界之树守护的梦幻领域...',          icon:'🌿', levels:[61,70],  unlockLevel:60, background:'dream' },
    { id:8,  name:'虚空风暴',   description:'次元裂缝中的混沌之域...',            icon:'🌀', levels:[71,80],  unlockLevel:70, background:'void' },
    { id:9,  name:'时光之穴',   description:'时间在这里不再是线性的...',           icon:'⏳', levels:[81,90],  unlockLevel:80, background:'time' },
    { id:10, name:'永恒之战',   description:'与燃烧军团的最终决战！',             icon:'⚔️', levels:[91,100], unlockLevel:90, background:'final' }
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
L(1,  { moves:20, gems:['murloc','orc','elf','mage'], objectives:[{type:'score',target:500,icon:'⭐'}], stars:[500,1000,1500], tutorial:'basic' }),
L(2,  { moves:22, gems:['murloc','orc','elf','mage'], objectives:[{type:'clear',target:20,gem:'murloc',icon:'🐟'}], stars:[600,1200,1800], tutorial:'collect' }),
L(3,  { moves:25, gems:['murloc','orc','elf','mage','knight'], objectives:[{type:'clear',target:15,gem:'orc',icon:'👹'},{type:'clear',target:15,gem:'elf',icon:'🧝♀️'}], stars:[800,1500,2200] }),
L(4,  { moves:25, gems:['murloc','orc','elf','mage','knight'], objectives:[{type:'special',target:2,specialType:'line',icon:'⚡',label:'连4消生成'}], stars:[1000,1800,2500], tutorial:'special' }),
L(5,  { moves:28, gems:['murloc','orc','elf','mage','knight'], objectives:[{type:'score',target:2000,icon:'⭐'}], stars:[2000,3500,5000] }),
L(6,  { moves:25, gems:['murloc','orc','elf','mage','knight'], objectives:[{type:'score',target:1500,icon:'⭐'},{type:'combo',target:2,icon:'🔥'}], stars:[1500,2500,4000] }),
L(7,  { moves:30, gems:['murloc','orc','elf','mage','knight'], objectives:[{type:'clear',target:30,gem:'mage',icon:'🧙♂️'}], stars:[1800,3000,4500] }),
L(8,  { moves:28, gems:['murloc','orc','elf','mage','knight'], objectives:[{type:'clear',target:20,gem:'knight',icon:'⚔️'},{type:'clear',target:20,gem:'murloc',icon:'🐟'}], stars:[2000,3500,5000] }),
L(9,  { moves:30, gems:['murloc','orc','elf','mage','knight'], objectives:[{type:'special',target:2,specialType:'any',icon:'✨'}], stars:[2500,4000,6000] }),
L(10, { moves:35, gems:['murloc','orc','elf','mage','knight'], boss:true, objectives:[{type:'score',target:5000,icon:'⭐'}], stars:[5000,8000,12000] }),

// =========== Ch2: 西部荒野 (11-20) ===========
L(11, { moves:28, gems:['murloc','orc','elf','mage','knight','dwarf'], objectives:[{type:'clear',target:15,gem:'dwarf',icon:'🪓'}], stars:[2000,3500,5000] }),
L(12, { moves:30, gems:['murloc','orc','elf','mage','knight','dwarf'], objectives:[{type:'score',target:3000,icon:'⭐'},{type:'special',target:2,specialType:'line',icon:'⚡',label:'连4消生成'}], stars:[3000,5000,7500] }),
L(13, { moves:25, gems:['orc','elf','mage','knight','dwarf'], objectives:[{type:'clear',target:25,gem:'orc',icon:'👹'},{type:'clear',target:25,gem:'mage',icon:'🧙♂️'}], stars:[3500,5500,8000] }),
L(14, { moves:30, gems:['murloc','orc','elf','mage','knight','dwarf'], objectives:[{type:'combo',target:4,icon:'🔥'}], stars:[4000,6000,9000] }),
L(15, { width:7, height:9, moves:32, gems:['murloc','orc','elf','mage','knight','dwarf'], objectives:[{type:'score',target:4500,icon:'⭐'}], stars:[4500,7000,10000] }),
L(16, { moves:35, gems:['murloc','orc','elf','mage','knight','dwarf'], objectives:[{type:'special',target:1,specialType:'bomb',icon:'💣'}], stars:[3500,5500,8000] }),
L(17, { moves:30, gems:['orc','elf','mage','knight','dwarf'], timed:true, timeLimit:90, objectives:[{type:'score',target:4000,icon:'⭐'}], stars:[4000,6500,9500] }),
L(18, { moves:32, gems:['murloc','orc','elf','mage','knight','dwarf'], objectives:[{type:'score',target:5000,icon:'⭐'},{type:'clear',target:20,gem:'dwarf',icon:'🪓'}], stars:[5000,8000,11000] }),
L(19, { moves:32, gems:['murloc','orc','elf','mage','knight','dwarf'], objectives:[{type:'special',target:3,specialType:'any',icon:'✨'},{type:'combo',target:3,icon:'🔥'}], stars:[4500,7500,10500] }),
L(20, { moves:35, gems:['murloc','orc','elf','mage','knight','dwarf'], boss:true, objectives:[{type:'score',target:7000,icon:'⭐'}], stars:[7000,11000,15000] }),

// =========== Ch3: 暴风城 (21-30) ===========
L(21, { moves:30, gems:['orc','elf','mage','knight','dwarf','undead'], objectives:[{type:'clear',target:20,gem:'undead',icon:'💀'}], stars:[5000,8000,12000] }),
L(22, { width:9, height:7, moves:28, gems:['orc','elf','mage','knight','dwarf','undead'], objectives:[{type:'score',target:6000,icon:'⭐'}], stars:[6000,9500,13000] }),
L(23, { moves:35, gems:['elf','mage','knight','dwarf','undead'], objectives:[{type:'clear',target:30,gem:'elf',icon:'🧝♀️'},{type:'special',target:1,specialType:'bomb',icon:'💣'}], stars:[6500,10000,14000] }),
L(24, { moves:32, gems:['orc','elf','mage','knight','dwarf','undead'], timed:true, timeLimit:80, objectives:[{type:'score',target:6000,icon:'⭐'}], stars:[5500,9000,13000] }),
L(25, { moves:30, gems:['orc','elf','mage','knight','dwarf','undead'], objectives:[{type:'clear',target:25,gem:'mage',icon:'🧙♂️'},{type:'clear',target:25,gem:'undead',icon:'💀'},{type:'score',target:5000,icon:'⭐'}], stars:[7000,11000,15000] }),
L(26, { width:7, height:7, moves:30, gems:['orc','elf','mage','knight','dwarf','undead'], objectives:[{type:'special',target:3,specialType:'any',icon:'✨'}], stars:[6000,9500,13500] }),
L(27, { moves:32, gems:['orc','elf','mage','knight','dwarf','undead'], objectives:[{type:'score',target:8000,icon:'⭐'},{type:'combo',target:6,icon:'🔥'}], stars:[8000,12000,16000] }),
L(28, { moves:30, gems:['elf','mage','knight','dwarf','undead'], objectives:[{type:'clear',target:50,gem:'knight',icon:'⚔️'}], stars:[7500,11500,15500] }),
L(29, { moves:35, gems:['orc','elf','mage','knight','dwarf','undead'], objectives:[{type:'special',target:2,specialType:'line',icon:'⚡',label:'连4消生成'},{type:'special',target:1,specialType:'bomb',icon:'💣'}], stars:[7000,11000,15000] }),
L(30, { moves:38, gems:['orc','elf','mage','knight','dwarf','undead'], boss:true, objectives:[{type:'score',target:10000,icon:'⭐'}], stars:[10000,15000,20000] }),

// =========== Ch4: 诅咒之地 (31-40) ===========
L(31, { moves:30, gems:['elf','mage','knight','dwarf','undead','mango'], objectives:[{type:'clear',target:15,gem:'mango',icon:'🥭'}], stars:[8000,12000,17000] }),
L(32, { moves:32, gems:['elf','mage','knight','dwarf','undead','mango'], objectives:[{type:'score',target:9000,icon:'⭐'},{type:'clear',target:20,gem:'mango',icon:'🥭'}], stars:[9000,14000,19000] }),
L(33, { width:9, height:9, moves:35, gems:['elf','mage','knight','dwarf','undead','mango'], objectives:[{type:'score',target:12000,icon:'⭐'}], stars:[12000,18000,24000] }),
L(34, { moves:30, gems:['mage','knight','dwarf','undead','mango'], objectives:[{type:'clear',target:30,gem:'undead',icon:'💀'},{type:'clear',target:25,gem:'mango',icon:'🥭'}], stars:[10000,15000,20000] }),
L(35, { moves:28, gems:['elf','mage','knight','dwarf','undead','mango'], timed:true, timeLimit:75, objectives:[{type:'score',target:10000,icon:'⭐'}], stars:[9000,14000,19000] }),
L(36, { moves:32, gems:['elf','mage','knight','dwarf','undead','mango'], objectives:[{type:'special',target:8,specialType:'any',icon:'✨'},{type:'score',target:8000,icon:'⭐'}], stars:[11000,16000,22000] }),
L(37, { width:7, height:9, moves:30, gems:['mage','knight','dwarf','undead','mango'], objectives:[{type:'clear',target:40,gem:'mage',icon:'🧙♂️'},{type:'clear',target:30,gem:'mango',icon:'🥭'}], stars:[10500,16000,21500] }),
L(38, { moves:30, gems:['elf','mage','knight','dwarf','undead','mango'], objectives:[{type:'special',target:3,specialType:'rainbow',icon:'🌈'}], stars:[10000,15000,20000] }),
L(39, { moves:35, gems:['elf','mage','knight','dwarf','undead','mango'], objectives:[{type:'score',target:12000,icon:'⭐'},{type:'combo',target:8,icon:'🔥'}], stars:[12000,18000,24000] }),
L(40, { moves:40, gems:['elf','mage','knight','dwarf','undead','mango'], boss:true, objectives:[{type:'score',target:15000,icon:'⭐'}], stars:[15000,22000,30000] }),

// =========== Ch5: 燃烧平原 (41-50) ===========
L(41, { moves:32, gems:['mage','knight','dwarf','undead','mango','dragon'], objectives:[{type:'clear',target:10,gem:'dragon',icon:'🐉'}], stars:[12000,18000,25000] }),
L(42, { moves:35, gems:['mage','knight','dwarf','undead','mango','dragon'], objectives:[{type:'score',target:14000,icon:'⭐'},{type:'clear',target:15,gem:'dragon',icon:'🐉'}], stars:[14000,21000,28000] }),
L(43, { width:9, height:8, moves:33, gems:['knight','dwarf','undead','mango','dragon'], objectives:[{type:'clear',target:40,gem:'dwarf',icon:'🪓'},{type:'clear',target:20,gem:'dragon',icon:'🐉'}], stars:[13000,20000,27000] }),
L(44, { moves:30, gems:['mage','knight','dwarf','undead','mango','dragon'], objectives:[{type:'combo',target:15,icon:'🔥'},{type:'special',target:5,specialType:'bomb',icon:'💣'}], stars:[14000,21000,28000] }),
L(45, { moves:35, gems:['mage','knight','dwarf','undead','mango','dragon'], timed:true, timeLimit:70, objectives:[{type:'score',target:15000,icon:'⭐'}], stars:[16000,24000,32000] }),
L(46, { width:8, height:9, moves:35, gems:['knight','dwarf','undead','mango','dragon'], objectives:[{type:'clear',target:50,gem:'undead',icon:'💀'},{type:'clear',target:30,gem:'dragon',icon:'🐉'}], stars:[15000,22000,30000] }),
L(47, { moves:32, gems:['mage','knight','dwarf','undead','mango','dragon'], objectives:[{type:'special',target:4,specialType:'rainbow',icon:'🌈'},{type:'combo',target:10,icon:'🔥'}], stars:[14500,21500,29000] }),
L(48, { moves:35, gems:['mage','knight','dwarf','undead','mango','dragon'], objectives:[{type:'score',target:18000,icon:'⭐'},{type:'clear',target:40,gem:'mango',icon:'🥭'}], stars:[18000,27000,36000] }),
L(49, { moves:38, gems:['knight','dwarf','undead','mango','dragon'], objectives:[{type:'clear',target:60,gem:'knight',icon:'⚔️'},{type:'special',target:6,specialType:'line',icon:'⚡',label:'连4消生成'}], stars:[17000,25000,34000] }),
L(50, { moves:45, gems:['mage','knight','dwarf','undead','mango','dragon'], boss:true, objectives:[{type:'score',target:22000,icon:'⭐'}], stars:[25000,35000,50000] }),

// =========== Ch6: 诺森德 (51-60) ===========
L(51, { moves:35, gems:['knight','dwarf','undead','mango','dragon','phoenix'], objectives:[{type:'clear',target:10,gem:'phoenix',icon:'🔥'}], stars:[18000,27000,36000] }),
L(52, { width:9, height:9, moves:40, gems:['knight','dwarf','undead','mango','dragon','phoenix'], objectives:[{type:'score',target:22000,icon:'⭐'},{type:'clear',target:15,gem:'phoenix',icon:'🔥'}], stars:[22000,32000,42000] }),
L(53, { moves:35, gems:['dwarf','undead','mango','dragon','phoenix'], objectives:[{type:'clear',target:50,gem:'mango',icon:'🥭'},{type:'clear',target:30,gem:'phoenix',icon:'🔥'}], stars:[20000,30000,40000] }),
L(54, { moves:38, gems:['knight','dwarf','undead','mango','dragon','phoenix'], timed:true, timeLimit:65, objectives:[{type:'score',target:20000,icon:'⭐'}], stars:[21000,31000,42000] }),
L(55, { moves:40, gems:['knight','dwarf','undead','mango','dragon','phoenix'], objectives:[{type:'score',target:28000,icon:'⭐'},{type:'special',target:12,specialType:'any',icon:'✨'}], stars:[28000,40000,52000] }),
L(56, { width:8, height:10, moves:42, gems:['dwarf','undead','mango','dragon','phoenix'], objectives:[{type:'clear',target:60,gem:'dragon',icon:'🐉'},{type:'clear',target:40,gem:'phoenix',icon:'🔥'}], stars:[25000,37000,50000] }),
L(57, { moves:40, gems:['knight','dwarf','undead','mango','dragon','phoenix'], objectives:[{type:'special',target:6,specialType:'rainbow',icon:'🌈'},{type:'combo',target:15,icon:'🔥'}], stars:[24000,35000,48000] }),
L(58, { moves:42, gems:['knight','dwarf','undead','mango','dragon','phoenix'], objectives:[{type:'score',target:32000,icon:'⭐'},{type:'clear',target:50,gem:'undead',icon:'💀'}], stars:[32000,45000,60000] }),
L(59, { width:9, height:9, moves:45, gems:['dwarf','undead','mango','dragon','phoenix'], objectives:[{type:'clear',target:70,gem:'phoenix',icon:'🔥'},{type:'combo',target:20,icon:'🔥'}], stars:[30000,42000,56000] }),
L(60, { width:9, height:9, moves:50, gems:['knight','dwarf','undead','mango','dragon','phoenix'], boss:true, objectives:[{type:'score',target:30000,icon:'⭐'}], stars:[35000,50000,70000] }),

// =========== Ch7: 翡翠梦境 (61-70) ===========
L(61, { moves:32, gems:['elf','mage','mango','dragon','phoenix','murloc'], objectives:[{type:'clear',target:20,gem:'mango',icon:'🥭'},{type:'clear',target:15,gem:'phoenix',icon:'🔥'}], stars:[22000,33000,44000] }),
L(62, { moves:30, gems:['elf','mage','mango','dragon','phoenix','murloc'], objectives:[{type:'special',target:8,specialType:'any',icon:'✨'}], stars:[20000,30000,40000] }),
L(63, { moves:35, gems:['elf','mage','mango','dragon','phoenix','murloc'], timed:true, timeLimit:60, objectives:[{type:'score',target:25000,icon:'⭐'}], stars:[25000,37000,50000] }),
L(64, { width:9, height:8, moves:33, gems:['elf','mage','mango','dragon','phoenix'], objectives:[{type:'clear',target:40,gem:'elf',icon:'🧝♀️'},{type:'combo',target:12,icon:'🔥'}], stars:[24000,35000,47000] }),
L(65, { moves:35, gems:['elf','mage','mango','dragon','phoenix','murloc'], objectives:[{type:'score',target:28000,icon:'⭐'},{type:'special',target:4,specialType:'rainbow',icon:'🌈'}], stars:[28000,40000,55000] }),
L(66, { moves:30, gems:['mage','mango','dragon','phoenix','murloc'], objectives:[{type:'clear',target:50,gem:'dragon',icon:'🐉'},{type:'clear',target:35,gem:'murloc',icon:'🐟'}], stars:[26000,38000,52000] }),
L(67, { moves:38, gems:['elf','mage','mango','dragon','phoenix','murloc'], objectives:[{type:'combo',target:18,icon:'🔥'},{type:'special',target:10,specialType:'any',icon:'✨'}], stars:[30000,42000,58000] }),
L(68, { width:9, height:9, moves:40, gems:['elf','mage','mango','dragon','phoenix','murloc'], objectives:[{type:'score',target:35000,icon:'⭐'}], stars:[35000,50000,65000] }),
L(69, { moves:35, gems:['elf','mango','dragon','phoenix','murloc'], objectives:[{type:'clear',target:60,gem:'phoenix',icon:'🔥'},{type:'special',target:5,specialType:'bomb',icon:'💣'}], stars:[32000,45000,60000] }),
L(70, { moves:42, gems:['elf','mage','mango','dragon','phoenix','murloc'], boss:true, objectives:[{type:'score',target:35000,icon:'⭐'}], stars:[38000,55000,72000] }),

// =========== Ch8: 虚空风暴 (71-80) ===========
L(71, { moves:32, gems:['orc','knight','undead','mango','dragon','phoenix'], objectives:[{type:'clear',target:25,gem:'undead',icon:'💀'},{type:'clear',target:25,gem:'dragon',icon:'🐉'}], stars:[28000,40000,55000] }),
L(72, { moves:35, gems:['orc','knight','undead','mango','dragon','phoenix'], timed:true, timeLimit:55, objectives:[{type:'score',target:30000,icon:'⭐'}], stars:[30000,43000,58000] }),
L(73, { width:8, height:9, moves:38, gems:['orc','knight','undead','mango','dragon','phoenix'], objectives:[{type:'special',target:12,specialType:'any',icon:'✨'},{type:'combo',target:14,icon:'🔥'}], stars:[32000,46000,62000] }),
L(74, { moves:33, gems:['knight','undead','mango','dragon','phoenix'], objectives:[{type:'clear',target:55,gem:'mango',icon:'🥭'}], stars:[30000,42000,58000] }),
L(75, { moves:38, gems:['orc','knight','undead','mango','dragon','phoenix'], objectives:[{type:'score',target:38000,icon:'⭐'},{type:'special',target:5,specialType:'rainbow',icon:'🌈'}], stars:[38000,54000,72000] }),
L(76, { moves:35, gems:['orc','knight','undead','mango','dragon'], objectives:[{type:'clear',target:60,gem:'orc',icon:'👹'},{type:'clear',target:40,gem:'knight',icon:'⚔️'}], stars:[34000,48000,65000] }),
L(77, { width:9, height:9, moves:40, gems:['orc','knight','undead','mango','dragon','phoenix'], objectives:[{type:'combo',target:22,icon:'🔥'}], stars:[36000,50000,68000] }),
L(78, { moves:35, gems:['knight','undead','mango','dragon','phoenix'], timed:true, timeLimit:50, objectives:[{type:'score',target:35000,icon:'⭐'}], stars:[35000,50000,66000] }),
L(79, { moves:40, gems:['orc','knight','undead','mango','dragon','phoenix'], objectives:[{type:'special',target:8,specialType:'bomb',icon:'💣'},{type:'special',target:4,specialType:'rainbow',icon:'🌈'}], stars:[38000,52000,70000] }),
L(80, { width:9, height:9, moves:45, gems:['orc','knight','undead','mango','dragon','phoenix'], boss:true, objectives:[{type:'score',target:40000,icon:'⭐'}], stars:[42000,60000,80000] }),

// =========== Ch9: 时光之穴 (81-90) ===========
L(81, { moves:33, gems:['mage','dwarf','mango','dragon','phoenix','elf'], objectives:[{type:'clear',target:30,gem:'mage',icon:'🧙♂️'},{type:'clear',target:30,gem:'elf',icon:'🧝♀️'}], stars:[32000,46000,62000] }),
L(82, { moves:38, gems:['mage','dwarf','mango','dragon','phoenix','elf'], objectives:[{type:'score',target:40000,icon:'⭐'}], stars:[40000,56000,75000] }),
L(83, { moves:35, gems:['mage','dwarf','mango','dragon','phoenix'], timed:true, timeLimit:50, objectives:[{type:'score',target:38000,icon:'⭐'}], stars:[38000,54000,72000] }),
L(84, { width:9, height:9, moves:40, gems:['mage','dwarf','mango','dragon','phoenix','elf'], objectives:[{type:'special',target:15,specialType:'any',icon:'✨'}], stars:[42000,58000,78000] }),
L(85, { moves:35, gems:['dwarf','mango','dragon','phoenix','elf'], objectives:[{type:'combo',target:25,icon:'🔥'},{type:'clear',target:50,gem:'dragon',icon:'🐉'}], stars:[40000,56000,75000] }),
L(86, { moves:38, gems:['mage','dwarf','mango','dragon','phoenix','elf'], objectives:[{type:'clear',target:60,gem:'phoenix',icon:'🔥'},{type:'clear',target:60,gem:'mango',icon:'🥭'}], stars:[44000,62000,82000] }),
L(87, { width:8, height:10, moves:42, gems:['mage','dwarf','mango','dragon','phoenix','elf'], objectives:[{type:'score',target:48000,icon:'⭐'},{type:'special',target:6,specialType:'rainbow',icon:'🌈'}], stars:[48000,66000,88000] }),
L(88, { moves:38, gems:['dwarf','mango','dragon','phoenix','elf'], timed:true, timeLimit:45, objectives:[{type:'score',target:42000,icon:'⭐'}], stars:[42000,60000,80000] }),
L(89, { moves:42, gems:['mage','dwarf','mango','dragon','phoenix','elf'], objectives:[{type:'combo',target:28,icon:'🔥'},{type:'special',target:10,specialType:'line',icon:'⚡',label:'连4消生成'}], stars:[46000,64000,85000] }),
L(90, { width:9, height:9, moves:48, gems:['mage','dwarf','mango','dragon','phoenix','elf'], boss:true, objectives:[{type:'score',target:45000,icon:'⭐'}], stars:[50000,70000,95000] }),

// =========== Ch10: 永恒之战 (91-100) ===========
L(91,  { moves:35, gems:['knight','dwarf','undead','mango','dragon','phoenix'], objectives:[{type:'clear',target:35,gem:'phoenix',icon:'🔥'},{type:'clear',target:35,gem:'dragon',icon:'🐉'}], stars:[40000,56000,75000] }),
L(92,  { moves:38, gems:['knight','dwarf','undead','mango','dragon','phoenix'], timed:true, timeLimit:45, objectives:[{type:'score',target:42000,icon:'⭐'}], stars:[42000,60000,80000] }),
L(93,  { width:9, height:8, moves:38, gems:['knight','dwarf','undead','mango','dragon','phoenix'], objectives:[{type:'special',target:18,specialType:'any',icon:'✨'},{type:'combo',target:20,icon:'🔥'}], stars:[45000,63000,84000] }),
L(94,  { moves:35, gems:['dwarf','undead','mango','dragon','phoenix'], objectives:[{type:'clear',target:70,gem:'mango',icon:'🥭'}], stars:[42000,60000,80000] }),
L(95,  { moves:40, gems:['knight','dwarf','undead','mango','dragon','phoenix'], objectives:[{type:'score',target:50000,icon:'⭐'},{type:'special',target:6,specialType:'rainbow',icon:'🌈'}], stars:[50000,70000,95000] }),
L(96,  { width:9, height:9, moves:42, gems:['knight','undead','mango','dragon','phoenix'], objectives:[{type:'clear',target:80,gem:'dragon',icon:'🐉'},{type:'clear',target:60,gem:'phoenix',icon:'🔥'}], stars:[48000,66000,88000] }),
L(97,  { moves:40, gems:['knight','dwarf','undead','mango','dragon','phoenix'], timed:true, timeLimit:40, objectives:[{type:'score',target:48000,icon:'⭐'}], stars:[50000,70000,92000] }),
L(98,  { moves:45, gems:['knight','dwarf','undead','mango','dragon','phoenix'], objectives:[{type:'combo',target:30,icon:'🔥'},{type:'special',target:8,specialType:'bomb',icon:'💣'},{type:'special',target:6,specialType:'rainbow',icon:'🌈'}], stars:[52000,72000,96000] }),
L(99,  { width:9, height:9, moves:48, gems:['dwarf','undead','mango','dragon','phoenix'], objectives:[{type:'clear',target:80,gem:'phoenix',icon:'🔥'},{type:'score',target:55000,icon:'⭐'}], stars:[55000,76000,100000] }),
L(100, { width:9, height:9, moves:55, gems:['knight','dwarf','undead','mango','dragon','phoenix'], boss:true, objectives:[{type:'score',target:55000,icon:'⭐'}], stars:[60000,85000,120000] }),
];

// ====================================
// API Functions
// ====================================
function getLevel(id) {
    // Built-in levels (1-100)
    const found = LEVELS.find(l => l.id === id);
    if (found) return found;
    // Procedural levels (101+) — infinite content!
    if (id > 100) return generateProceduralLevel(id);
    return LEVELS[0];
}

// Infinite procedural level generator — this is how we play for a year
function generateProceduralLevel(id) {
    // Seeded RNG for deterministic levels
    let seed = id * 2654435761;
    const rng = () => { seed = (seed * 16807 + 0) % 2147483647; return (seed - 1) / 2147483646; };

    const tier = Math.floor((id - 101) / 10); // 0, 1, 2, 3...
    const allGems = Object.keys(GEM_TYPES);
    const commonGems = allGems.filter(g => GEM_TYPES[g].rarity === 'common');

    // Gem count: 5-7, increases with tier
    const numGems = Math.min(5 + Math.floor(tier / 3), commonGems.length);
    const gems = [];
    const pool = [...commonGems];
    for (let i = 0; i < numGems; i++) {
        const idx = Math.floor(rng() * pool.length);
        gems.push(pool.splice(idx, 1)[0]);
    }
    // Rare gems appear more at higher tiers
    if (rng() < 0.3 + tier * 0.02) gems.push('mango');
    if (tier >= 3 && rng() < 0.2 + tier * 0.01) gems.push('dragon');
    if (tier >= 6 && rng() < 0.15) gems.push('phoenix');

    // Board size varies
    const sizes = [[7,9],[8,10],[8,10],[9,11],[8,8],[9,9],[7,11]];
    const [w, h] = sizes[Math.floor(rng() * sizes.length)];

    // Moves: fewer at higher tiers
    const baseMoves = Math.max(18, 35 - Math.floor(tier / 2));
    const moves = baseMoves + Math.floor(rng() * 8);

    // Timed: 15% chance, more at higher tiers
    const isTimed = rng() < 0.15 + tier * 0.01;
    const timeLimit = isTimed ? Math.max(40, 90 - tier * 2) + Math.floor(rng() * 20) : 0;

    // Boss: every 10th procedural level
    const isBoss = id % 10 === 0;

    // Objectives (1-3 based on tier)
    const objectives = [];
    const numObj = Math.min(1 + Math.floor(tier / 4), 3);
    for (let i = 0; i < numObj; i++) {
        const roll = rng();
        if (roll < 0.3) {
            objectives.push({ type: 'score', target: 5000 + tier * 1000 + Math.floor(rng() * 3000), icon: '⭐' });
        } else if (roll < 0.55) {
            const gem = gems[Math.floor(rng() * gems.length)];
            objectives.push({ type: 'clear', target: 15 + tier * 2 + Math.floor(rng() * 10), gem, icon: GEM_TYPES[gem]?.emoji || '❓' });
        } else if (roll < 0.8) {
            objectives.push({ type: 'special', target: 3 + Math.floor(tier/2) + Math.floor(rng() * 3), specialType: 'any', icon: '✨' });
        } else {
            objectives.push({ type: 'combo', target: 3 + Math.floor(tier/3) + Math.floor(rng() * 3), icon: '🔥' });
        }
    }

    // Star thresholds scale with tier
    const baseScore = 8000 + tier * 2000;
    const stars = [baseScore, Math.floor(baseScore * 1.5), Math.floor(baseScore * 2.2)];

    // Chapter assignment (cycle through chapters)
    const chapter = (Math.floor((id - 101) / 10) % CHAPTERS.length) + 1;

    return {
        id,
        procedural: true,
        chapter,
        width: w, height: h,
        moves,
        timed: isTimed, timeLimit,
        gems,
        objectives,
        boss: isBoss,
        stars,
        special: {},
        blockers: []
    };
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
