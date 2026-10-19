export const W=1100,H=700,FINAL_WAVE=40;
export const RULES={startCredits:650,lives:30,bonusBase:75,bonusStep:5,sell:.7,discount:.4,delay:2,step:1/60};
export const PATH=[[-35,150],[180,150],[270,225],[440,225],[520,135],[770,135],[880,235],[880,330],[760,400],[555,400],[460,330],[260,330],[155,415],[155,515],[310,585],[560,585],[700,510],[915,510],[1030,585],[1140,585]];
export const OBSTACLES=[{x:70,y:285,r:30},{x:650,y:270,r:34},{x:1010,y:310,r:37},{x:370,y:470,r:28},{x:780,y:625,r:27}];

const tower=(cost,color,levels)=>({cost,color,levels});
// Temporary user-requested test price. Restore SUPER_INU_TEST_PRICE to null after testing.
export const SUPER_INU_REGULAR_PRICE=5600;
export const SUPER_INU_TEST_PRICE=null;
export const TOWERS={
 PENGU:tower(150,'#7dace4',[{damage:18,rate:1.14,range:150},{cost:150,damage:31,rate:1.14,range:150},{cost:400,damage:51,rate:.88,range:165}]),
 PEPE:tower(260,'#73974c',[{damage:13,rate:.55,range:145},{cost:220,damage:25,rate:.55,range:160},{cost:450,damage:41,rate:.55,range:160}]),
 DOGE:tower(380,'#dfb166',[{damage:36,rate:1.4,range:100},{cost:420,damage:72,rate:1.4,range:100},{cost:950,damage:156,rate:1.4,range:100}]),
 SNEK:tower(575,'#8b79c6',[{damage:4,rate:3.6,range:125,slow:.7,duration:5},{cost:350,damage:6,rate:3.6,range:125,slow:.65,duration:5},{cost:675,damage:12,rate:3.6,range:125,slow:.6,duration:6}]),
 BONK:tower(1100,'#de9c4c',[{damage:450,rate:3.2,range:90,push:14},{cost:900,damage:850,rate:3.2,range:90,push:18},{cost:3200,damage:2400,rate:3.2,range:90,push:22}]),
 POPCAT:tower(1600,'#b7a18a',[{damage:150,rate:1.8,range:110,swallow:3500,digest:16},{cost:500,damage:200,rate:1.8,range:110,swallow:4500,digest:12},{cost:2400,damage:420,rate:1.8,range:120,swallow:6000,digest:8}]),
 SI:tower(SUPER_INU_TEST_PRICE??SUPER_INU_REGULAR_PRICE,'#498dc8',[{damage:220,rate:.35,range:205},{cost:5200,damage:330,rate:.35,range:205},{cost:9800,damage:480,rate:.32,range:225}])};
export const ENEMIES={
 USDC:{hp:52,speed:63,reward:8,leak:2,r:18,color:'#669ed5'},
 USDT:{hp:72,speed:60,reward:8,leak:2,r:18,color:'#52a48e'},
 SOL:{hp:38,speed:195,reward:8,leak:2,r:16,color:'#383c56',ability:'fast'},
 XRP:{hp:34,speed:78,reward:5,leak:1,r:16,color:'#e3e9df'},
 ETH:{hp:3800,speed:30,reward:100,leak:5,r:25,color:'#a48acb'},
 BTC:{hp:12000,speed:26,reward:220,leak:12,r:31,color:'#e5b14b'},
 ADA:{hp:400,speed:60,reward:12,leak:2,r:19,color:'#4a81ba',ability:'recover'},
 AVAX:{hp:300,speed:70,reward:10,leak:2,r:17,color:'#d76354',ability:'sprint'},
 LINK:{hp:650,speed:50,reward:16,leak:3,r:21,color:'#537abd',ability:'link'},
 ZEC:{hp:1200,speed:65,reward:22,leak:3,r:20,color:'#ddba62',ability:'resist'},
 HYPE:{hp:900,speed:78,reward:60,leak:6,r:18,color:'#263e3b',ability:'grow'},
 ETH_BOSS:{hp:3800,speed:30,reward:150,leak:100,boss:true,baseType:'ETH',r:25,color:'#a48acb'},
 BTC_BOSS:{hp:12000,speed:26,reward:350,leak:100,boss:true,baseType:'BTC',r:31,color:'#e5b14b'},
 TJR:{hp:22500,speed:25,reward:500,leak:100,boss:true,r:48,color:'#dfb35c'},
 ANSEM:{hp:160000,speed:24,reward:1200,leak:100,boss:true,r:48,color:'#384b43'},
 PUMP:{hp:52000,speed:23,reward:750,leak:100,boss:true,r:48,color:'#50cf99'},
 CUPSEY:{hp:90000,speed:23,reward:1000,leak:100,boss:true,r:48,color:'#e6cb64'},
 RASMR:{hp:264000,speed:23,reward:1400,leak:100,boss:true,r:48,color:'#aaa394'},
 ORANGIE:{hp:368000,speed:23,reward:1600,leak:100,boss:true,r:48,color:'#f49a4f'},
 QUANT:{hp:472000,speed:23,reward:1800,leak:100,boss:true,r:48,color:'#91a9b4'},
 KIMCHI:{hp:576000,speed:23,reward:2000,leak:100,boss:true,r:50,color:'#cfbb78'},
 ETH_WHALE:{hp:650000,speed:16,reward:2400,leak:100,boss:true,baseType:'ETH',r:62,color:'#a48acb'},
 BTC_WHALE:{hp:900000,speed:14,reward:3000,leak:100,boss:true,baseType:'BTC',r:70,color:'#e5b14b'}
};
export const BOSSES={10:'ETH_BOSS',20:'BTC_BOSS',30:'TJR',40:'PUMP',50:'CUPSEY',60:'ANSEM',70:'RASMR',80:'ORANGIE',90:'QUANT',100:'KIMCHI'};
export const ABILITIES={recover:{wait:2,fraction:.5},sprint:{period:6,duration:1.3,multiplier:2.5},link:{radius:115,perNeighbor:17,cap:140},resist:{fraction:0},grow:{firstDuration:6,firstHp:1800,firstR:26,middleSpeed:48,duration:18,hp:5000,r:39,speed:24,secondDuration:100,finalHp:24000,finalR:54,finalSpeed:24},knockback:{radius:45,maxHp:180,cooldown:4,maxHits:2}};
// Count, spacing, and first appearance are deliberately authored for each regular wave.
const pack=(type,count,gap=1,start=0)=>Array.from({length:count},(_,i)=>({type,at:start+i*gap}));
const mix=(...groups)=>groups.flat().sort((a,b)=>a.at-b.at);
// Teaching rounds: one scout, a pause, then small clusters of the same species.
const lesson=(type,groups,gap=8)=>mix(...groups.map((count,i)=>pack(type,count,1.4,i*gap)));
export const WAVES=[
 pack('USDC',14,2.2),
 lesson('USDT',[1,2,3,3,3],7),
 mix(pack('USDC',16,1.8),pack('USDT',12,2.4,8)),
 lesson('XRP',[1,3,3,3,3,3,3,3],6),
 mix(pack('USDC',30,1.2),pack('XRP',40,.75,10)),
 mix(pack('USDT',36,1),pack('XRP',36,.6)),
 lesson('SOL',[1,2,3,3,3,2],6),
 mix(pack('SOL',22,1.3),pack('XRP',42,.6)),
 mix(pack('USDT',45,.9),pack('SOL',28,1)),
 pack('ETH_BOSS',1),
 pack('USDT',16,1.5,5),
 mix(pack('XRP',40,.6),pack('SOL',18,1.5)),
 lesson('AVAX',[1,2,3,3,3]),
 mix(pack('ETH',2,40,8),pack('AVAX',14,2.2,3),pack('SOL',20,1.6)),
 mix(pack('ETH',3,20),pack('AVAX',24,1.3),pack('USDT',22,1.5)),
 lesson('ADA',[1,2,3,3,3]),
 mix(pack('ETH',3,22),pack('ADA',16,2),pack('AVAX',24,1.3)),
 mix(pack('ETH',3,22),pack('ADA',20,1.6),pack('SOL',40,.7)),
 mix(pack('ETH',3,22),pack('AVAX',28,1.1),pack('ADA',20,1.6)),
 pack('BTC_BOSS',1),
 mix(pack('ETH',2,24),pack('ADA',20,1.5),pack('AVAX',20,1.5)),
 mix(pack('ETH',2,24),pack('SOL',30,1)),
 lesson('LINK',[1,2,3,3,3,3],7),
 mix(pack('BTC',1),pack('ETH',3,22),pack('LINK',10,1.7),pack('ADA',15,2)),
 mix(pack('BTC',1),pack('ETH',2,24),pack('LINK',12,2.2)),
 mix(pack('ETH',4,17),pack('AVAX',26,1.2),pack('ADA',30,1.1)),
 lesson('ZEC',[1,2,3,3,3],9),
 mix(pack('ZEC',16,1.7),pack('ETH',4,18),pack('AVAX',28,1.2)),
 mix(pack('BTC',2,34),pack('LINK',18,1.4),pack('ZEC',16,1.7)),
 pack('TJR',1),
 mix(pack('BTC',2,30),pack('ETH',6,8),pack('ADA',40,.85)),
 mix(pack('LINK',24,1.1),pack('ZEC',24,1.2),pack('AVAX',38,.85)),
 mix(pack('HYPE',1),pack('HYPE',1,1,12),pack('XRP',30,.45,13),pack('HYPE',1,1,36),pack('XRP',24,.5,37),pack('HYPE',1,1,60)),
 mix(pack('HYPE',3,24),pack('ZEC',24,1.2),pack('LINK',30,.8)),
 mix(pack('BTC',3,24),pack('ETH',6,12),pack('ADA',36,.9)),
 mix(pack('HYPE',4,22),pack('AVAX',40,.8),pack('ZEC',26,1.2)),
 mix(pack('BTC',3,24),pack('ETH',7,12),pack('LINK',36,.7)),
 mix(pack('HYPE',5,20),pack('ADA',42,.8),pack('ZEC',30,1.1)),
 mix(pack('BTC',3,24),pack('HYPE',5,20),pack('ETH',7,12),pack('LINK',38,.7)),
 pack('PUMP',1)
];
export const bossForWave=wave=>BOSSES[wave]||(wave===110?'ETH_WHALE':wave>=120&&wave%10===0?'BTC_WHALE':null);
export const firstWave=type=>type==='ETH_WHALE'?110:type==='BTC_WHALE'?120:Object.values(BOSSES).includes(type)?Number(Object.entries(BOSSES).find(([,k])=>k===type)[0]):type==='ETH'?10:type==='BTC'?20:WAVES.findIndex(w=>w.some(e=>e.type===type))+1;
export const enemyOrder=(a,b)=>firstWave(a)-firstWave(b);
export function dealWeights(wave){const tier=Math.min(7,Math.max(1,Math.floor(wave/10)));return Object.keys(TOWERS).map((type,i)=>({type,weight:1+(tier-1)*i/3}));}
export function wavePlan(wave){if(wave<=FINAL_WAVE)return WAVES[wave-1].map(e=>({...e,at:e.at*([17,19,24,26,28,29,31,32,34,35,36,37,38,39].includes(wave)?1.08:1),scale:1}));const boss=bossForWave(wave);if(boss)return [{type:boss,at:0,scale:boss==='BTC_WHALE'?(1+(wave-120)/10*.35)**2:1}];if(wave>100){const base=WAVES[30+(wave-101)%9],count=Math.min(240,Math.ceil(base.length*(1.72+Math.min(19,wave-101)*.012+Math.max(0,wave-120)*.035))),scale=4.3+Math.min(19,wave-101)*.12+Math.max(0,wave-120)*.24+Math.max(0,wave-120)**2*.008;return Array.from({length:count},(_,i)=>({...base[i%base.length],at:(base[i%base.length].at+Math.floor(i/base.length)*60)*Math.max(.6,1-Math.max(0,wave-120)*.008),scale})).sort((a,b)=>a.at-b.at);}
const n=wave-FINAL_WAVE,base=WAVES[30+(n-1)%9],count=Math.min(240,Math.ceil(base.length*(1+Math.floor(n/10)*.12))),scale=1+n*.05;return Array.from({length:count},(_,i)=>({...base[i%base.length],at:base[i%base.length].at+Math.floor(i/base.length)*60,scale})).sort((a,b)=>a.at-b.at);}

export const towerName=k=>k==='SI'?'Super Inu':k;
