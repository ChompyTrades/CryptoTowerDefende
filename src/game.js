import {availableDeals,dealCount,consumeDeal,awardDeal} from './deals.js';
import {MAPS,mapFor} from './maps.js';
import {hypeStats} from './hype.js';
import {ATTACK_TIME,muzzle} from './animation.js';
import {RULES,PATH,OBSTACLES,TOWERS,ENEMIES,ABILITIES,wavePlan,W,H,FINAL_WAVE,BOSSES,bossForWave,dealWeights} from './config.js';
export const segments=PATH.slice(1).map((p,i)=>({a:PATH[i],b:p,length:Math.hypot(p[0]-PATH[i][0],p[1]-PATH[i][1])}));
export const pathLength=segments.reduce((s,v)=>s+v.length,0);
export function pointAt(d,mapId='grass'){for(const s of mapFor(mapId).segments){if(d<=s.length)return{x:s.a[0]+(s.b[0]-s.a[0])*d/s.length,y:s.a[1]+(s.b[1]-s.a[1])*d/s.length};d-=s.length;}const end=mapFor(mapId).path.at(-1);return{x:end[0],y:end[1]};}
export function pathDistance(x,y,mapId='grass'){return Math.min(...mapFor(mapId).segments.map(s=>{const t=Math.max(0,Math.min(1,((x-s.a[0])*(s.b[0]-s.a[0])+(y-s.a[1])*(s.b[1]-s.a[1]))/s.length**2));return Math.hypot(x-s.a[0]-t*(s.b[0]-s.a[0]),y-s.a[1]-t*(s.b[1]-s.a[1]));}));}
export const emptyPerformance=()=>({damage:0,pops:0,waveDamage:0,wavePops:0,waveSeconds:0});
export const towerPerformance=t=>{const p=t.performance||emptyPerformance();return {...p,dps:p.waveSeconds>0?p.waveDamage/p.waveSeconds:0};};
export const stats=t=>TOWERS[t.type].levels[t.level];
export const saleValue=t=>Math.floor(t.paid*Math.round(RULES.sell*100)/100);
export function createGame(seed=91473,mapId='grass'){if(!Object.hasOwn(MAPS,mapId))throw Error('map');return{version:4,mapId,seed,nextId:1,credits:RULES.startCredits,lives:RULES.lives,wave:0,phase:'prepare',paused:false,speed:1,countdown:RULES.delay,towers:[],enemies:[],effects:[],pendingHits:[],puddles:[],queue:[],elapsed:0,spawned:0,endless:false,deals:[],deal:null,settlement:null,events:[],accumulator:0};}
export function random(g){g.seed=(Math.imul(g.seed,1664525)+1013904223)>>>0;return g.seed/4294967296;}
export function price(g,type){return Math.ceil(TOWERS[type].cost*(dealCount(g,type)?1-RULES.discount:1));}
export function validPlacement(g,x,y){return Number.isFinite(x)&&Number.isFinite(y)&&x>30&&x<W-30&&y>65&&y<H-75&&pathDistance(x,y,g.mapId)>48&&!mapFor(g.mapId).obstacles.some(o=>Math.hypot(x-o.x,y-o.y)<o.r+23)&&!g.towers.some(t=>Math.hypot(x-t.x,y-t.y)<48);}
export function action(g,a){
 if(['defeat','victory'].includes(g.phase))return{ok:false,error:'stopped'};
 if(a.type==='place'){if(!Object.hasOwn(TOWERS,a.tower)||!validPlacement(g,a.x,a.y))return{ok:false,error:'placement'};const cost=price(g,a.tower);if(g.credits<cost)return{ok:false,error:'funds'};g.credits-=cost;const t={id:g.nextId++,owner:1,type:a.tower,x:a.x,y:a.y,level:0,paid:cost,performance:emptyPerformance(),mode:'first',cooldown:0,angle:0,attack:0};if(g.wave===0&&g.towers.length===0)g.countdown=1;g.towers.push(t);consumeDeal(g,a.tower);return{ok:true,id:t.id};}
 const t=g.towers.find(t=>t.id===a.id);if(!t)return{ok:false,error:'missing'};
 if(a.type==='upgrade'){const s=TOWERS[t.type].levels[t.level+1];if(!s)return{ok:false,error:'max'};if(g.credits<s.cost)return{ok:false,error:'funds'};g.credits-=s.cost;t.paid+=s.cost;t.level++;}
 else if(a.type==='sell'){g.credits+=saleValue(t);g.towers=g.towers.filter(v=>v!==t);}
 else if(a.type==='target'&&TARGET_MODES.includes(a.mode))t.mode=a.mode;
 else return{ok:false,error:'action'};return{ok:true};
}
export function startWave(g){if(g.phase!=='prepare'||g.paused)return false;g.wave++;for(const t of g.towers){t.performance??=emptyPerformance();Object.assign(t.performance,{waveDamage:0,wavePops:0,waveSeconds:0});}g.phase='wave';g.queue=wavePlan(g.wave);g.elapsed=0;g.spawned=0;g.accumulator=0;return true;}
export function spawn(g,type,scale=1){g.events.push("seen:"+type);const c=ENEMIES[type];const e={id:g.nextId++,type,hp:c.hp*scale,maxHp:c.hp*scale,baseMaxHp:c.hp*scale,growth:null,r:c.r,currentSpeed:c.speed,pushes:0,lastPush:-99,d:0,...pointAt(0,g.mapId),hit:0,age:0,sinceHit:0,recovered:false,heal:0,dead:false};g.enemies.push(e);return e;}
export function damage(g,e,n,visual=true,sourceId=null){if(e.dead||!Number.isFinite(n)||n<=0)return;const owner=g.towers.find(t=>t.id===sourceId),actual=Math.min(e.hp,n);if(owner){owner.performance??=emptyPerformance();owner.performance.damage+=actual;owner.performance.waveDamage+=actual;}if(n>0&&e.type==='HYPE'&&e.growth===null)e.growth=0;e.hp-=n;e.hit=.12;e.sinceHit=0;if(e.hp<=0){e.hp=0;e.dead=true;if(owner){owner.performance.pops++;owner.performance.wavePops++;}g.credits+=ENEMIES[e.type].reward;if(visual){effect(g,{kind:'break',x:e.x,y:e.y,color:ENEMIES[e.type].color},.4);g.events.push('break');}}}
export const TARGET_MODES=['first','last','near','strong','boss',...Object.keys(ENEMIES).filter(k=>!ENEMIES[k].boss)];
// Spatial broad phase is rebuilt after movement/knockback, before tower attacks.
// Candidate order is irrelevant: the original distance/HP/progress/id ordering is retained.
export function enemyGrid(enemies){const cells=new Map();for(const e of enemies)if(!e.dead){const key=Math.floor(e.x/160)+','+Math.floor(e.y/160);let bucket=cells.get(key);if(!bucket)cells.set(key,bucket=[]);bucket.push(e);}return cells;}
export function target(g,t,grid=null){
 const range=stats(t).range,mode=t.mode,preferred=!!ENEMIES[mode];let best,bestDistance=0,bestPriority=0;
 const inspect=e=>{if(e.dead)return;const distance=Math.hypot(e.x-t.x,e.y-t.y);if(distance>range)return;
  const priority=mode==='boss'?Number(!!ENEMIES[e.type].boss):preferred?Number((ENEMIES[e.type].baseType||e.type)===mode):0;
  const order=best?(bestPriority-priority)||(mode==='last'?e.d-best.d:mode==='strong'?best.hp-e.hp:mode==='near'?distance-bestDistance:0)||best.d-e.d||e.id-best.id:-1;
  if(order<0){best=e;bestDistance=distance;bestPriority=priority;}
 };
 if(grid){for(let y=Math.floor((t.y-range)/160);y<=Math.floor((t.y+range)/160);y++)for(let x=Math.floor((t.x-range)/160);x<=Math.floor((t.x+range)/160);x++)for(const e of grid.get(x+','+y)||[])inspect(e);}
 else for(const e of g.enemies)inspect(e);
 return best;
}

function effect(g,fx,duration){if(g.effects.length<200)g.effects.push({...fx,ttl:duration,max:duration});}
export function settle(g){
 if(g.phase!=='wave'||g.spawned!==g.queue.length||g.enemies.some(e=>!e.dead))return false;
 g.settlement={wave:g.wave,bonus:RULES.bonusBase+RULES.bonusStep*g.wave};g.credits+=g.settlement.bonus;
 if(bossForWave(g.wave)){awardDeal(g,dealWeights(g.wave),random(g));g.events.push('deal');}
 g.phase=g.wave===FINAL_WAVE&&!g.endless?'victory':'prepare';g.countdown=RULES.delay;g.puddles=[];g.effects=[];g.pendingHits=[];g.enemies=[];g.events.push('save');if(g.phase==='victory')g.events.push('victory');return true;
}
export function continueEndless(g){if(g.phase!=='victory')return false;g.endless=true;g.phase='prepare';g.paused=true;g.countdown=RULES.delay;g.events.push('save');return true;}
export function tick(g,dt){
 if(g.paused||g.phase!=='wave')return;g.elapsed+=dt;for(const t of g.towers){t.performance??=emptyPerformance();t.performance.waveSeconds+=dt;}
 while(g.spawned<g.queue.length&&g.queue[g.spawned].at<=g.elapsed){const q=g.queue[g.spawned++];spawn(g,q.type,q.scale??1);}
 for(const p of g.puddles)p.ttl-=dt;g.puddles=g.puddles.filter(p=>p.ttl>0);
 const links=g.enemies.filter(e=>!e.dead&&e.type==='LINK');
 for(const e of g.enemies){if(e.dead)continue;e.age=(e.age||0)+dt;e.sinceHit=(e.sinceHit||0)+dt;e.heal=Math.max(0,(e.heal||0)-dt);
  if(e.type==='HYPE'&&e.growth!==null){e.growth=Math.min(ABILITIES.grow.duration+ABILITIES.grow.secondDuration,e.growth+dt);const h=hypeStats(e.growth,e.baseMaxHp/ENEMIES.HYPE.hp);e.hp+=h.hp-e.maxHp;e.maxHp=h.hp;e.r=h.r;e.currentSpeed=h.speed;e.hypePhase=h.phase;}
  let slow=1,dot=0,dotOwner=null;
  for(const p of g.puddles)if(Math.hypot(e.x-p.x,e.y-p.y)<38){slow=Math.min(slow,p.slow);if(p.damage>dot){dot=p.damage;dotOwner=p.sourceId;}}
  if(dot)damage(g,e,dot*dt,true,dotOwner);if(e.dead)continue;
  if(e.type==='ADA'&&!e.recovered&&e.hp<e.maxHp&&e.sinceHit>=ABILITIES.recover.wait){e.hp=Math.min(e.maxHp,e.hp+e.maxHp*ABILITIES.recover.fraction);e.recovered=true;e.heal=.8;}
  e.sprinting=e.type==='AVAX'&&e.age%ABILITIES.sprint.period>=ABILITIES.sprint.period-ABILITIES.sprint.duration;
  e.linked=undefined;e.linkCount=0;if(e.type==='LINK')for(const v of links)if(v.id!==e.id&&!v.dead&&Math.hypot(v.x-e.x,v.y-e.y)<=ABILITIES.link.radius){e.linked??=v.id;e.linkCount++;}
  e.resisting=e.type==='ZEC'&&slow<1;if(e.resisting)slow=1-(1-slow)*ABILITIES.resist.fraction;
  const baseSpeed=e.type==='LINK'?Math.min(ABILITIES.link.cap,ENEMIES.LINK.speed+e.linkCount*ABILITIES.link.perNeighbor):e.currentSpeed;const speed=baseSpeed*slow*(e.sprinting?ABILITIES.sprint.multiplier:1);
  e.d+=speed*dt;Object.assign(e,pointAt(e.d,g.mapId));e.hit=Math.max(0,e.hit-dt);
  if(e.d>=mapFor(g.mapId).length){e.dead=true;g.lives=Math.max(0,g.lives-ENEMIES[e.type].leak);g.events.push('leak');if(!g.lives){g.phase='defeat';g.events.push('defeat');return;}}
 }
 for(const hit of g.pendingHits){hit.delay-=dt;if(hit.delay>0)continue;
  if(hit.kind==='puddle')g.puddles.push({...hit.puddle});
  else{const enemy=g.enemies.find(e=>e.id===hit.id&&!e.dead);if(enemy){const impact={x:enemy.x,y:enemy.y};damage(g,enemy,hit.damage,true,hit.sourceId);for(const v of g.enemies){const k=ABILITIES.knockback;if(!v.dead&&!ENEMIES[v.type].boss&&v.maxHp<=k.maxHp&&v.pushes<k.maxHits&&g.elapsed-v.lastPush>=k.cooldown&&Math.hypot(v.x-impact.x,v.y-impact.y)<=k.radius){v.d=Math.max(0,v.d-hit.push);Object.assign(v,pointAt(v.d,g.mapId));v.pushes++;v.lastPush=g.elapsed;}}effect(g,{kind:'hammer',x:enemy.x,y:enemy.y,color:'#f7d591',level:hit.level},.35);}g.events.push('BONK');}
 }g.pendingHits=g.pendingHits.filter(h=>h.delay>0);
 const grid=g.enemies.length>32&&g.towers.length>8&&g.towers.some(t=>t.cooldown<=dt)?enemyGrid(g.enemies):null;
 for(const t of g.towers){t.attack=Math.max(0,t.attack-dt);t.cooldown=Math.max(0,t.cooldown-dt);if(t.cooldown>0)continue;const e=target(g,t,grid);if(!e)continue;const s=stats(t);t.angle=Math.atan2(e.y-t.y,e.x-t.x);t.cooldown=s.rate;t.attack=ATTACK_TIME[t.type];if(t.type!=='BONK')g.events.push(t.type);const mouth=muzzle(t);
  if(t.type==='DOGE'){for(const v of g.enemies)if(!v.dead&&Math.hypot(v.x-t.x,v.y-t.y)<=s.range&&Math.cos(Math.atan2(v.y-t.y,v.x-t.x)-t.angle)>.65)damage(g,v,s.damage,true,t.id);effect(g,{kind:'cone',...mouth,angle:t.angle,range:s.range,level:t.level,color:'#fff0b0'},.5);}
  else if(t.type==='SNEK'){g.pendingHits.push({kind:'puddle',delay:.32,puddle:{sourceId:t.id,x:e.x,y:e.y,ttl:s.duration,slow:s.slow,damage:s.damage,level:t.level}});effect(g,{kind:'spit',...mouth,tx:e.x,ty:e.y,level:t.level,color:'#ad7bd0'},.32);}
  else if(t.type==='POPCAT'){const eligible=!ENEMIES[e.type].boss&&e.maxHp<=s.swallow;damage(g,e,eligible?e.hp:s.damage,!eligible,t.id);if(eligible){t.cooldown=s.digest;t.attack=1.1;effect(g,{kind:'swallow',x:e.x,y:e.y,tx:mouth.x,ty:mouth.y,enemy:{...e,hp:e.maxHp,dead:false,hit:0},level:t.level},1.1);}else effect(g,{kind:'bite',x:e.x,y:e.y,color:'#fff1bd'},.25);}
  else if(t.type==='BONK'){g.pendingHits.push({kind:'hammer',sourceId:t.id,id:e.id,damage:s.damage,push:s.push,level:t.level,delay:.29});}
  else{damage(g,e,s.damage,true,t.id);if(t.type==='SI'){const flip=Math.cos(t.angle)<0?-1:1;for(const eye of [-3,18])effect(g,{kind:'laser',x:t.x+eye*.95*flip,y:t.y-20*.95,tx:e.x,ty:e.y,level:t.level},.16);}
   else effect(g,{kind:t.type==='PENGU'?'snow':'bubble',...mouth,tx:e.x,ty:e.y,level:t.level},t.type==='PENGU'?.3:.23);
  }
 }
 g.enemies=g.enemies.filter(e=>!e.dead);for(const fx of g.effects)fx.ttl-=dt;g.effects=g.effects.filter(f=>f.ttl>0);if(g.spawned===g.queue.length&&!g.enemies.length&&!g.pendingHits.length&&!g.effects.length)settle(g);
 // UI drains events each frame; headless callers may run for an entire match.
 if(g.events.length>300)g.events=g.events.slice(-300);
}
export function advance(g,realDt,autostart=true){if(g.paused)return;const dt=Math.min(Math.max(realDt,0),.1);if(g.phase==='prepare'){if(g.wave===0&&!g.towers.length)return;g.countdown=Math.max(0,g.countdown-dt);if(g.countdown<=1e-8&&(autostart||g.wave===0))startWave(g);return;}g.accumulator+=dt*g.speed;while(g.accumulator+1e-10>=RULES.step){tick(g,RULES.step);g.accumulator-=RULES.step;}}
export function serialize(g,settings){if(!['prepare','victory'].includes(g.phase))throw Error('saveBetweenWaves');return JSON.stringify({version:4,mapRevision:2,mapId:g.mapId,seed:g.seed,nextId:g.nextId,credits:g.credits,lives:g.lives,wave:g.wave,phase:g.phase,endless:g.endless,deal:g.deal,deals:availableDeals(g),settlement:g.settlement,towers:g.towers.map(t=>({...t,attack:0})),settings});}
export function deserialize(raw){let s;try{s=JSON.parse(raw);}catch{throw Error('badSave');}const finite=n=>Number.isFinite(n)&&n>=0,integer=n=>Number.isSafeInteger(n)&&n>=0;
 if(!s||s.version!==4||!integer(s.seed)||s.seed>4294967295||!integer(s.nextId)||!integer(s.credits)||!integer(s.lives)||s.lives<1||s.lives>RULES.lives||!integer(s.wave)||s.wave>100000||!['prepare','victory'].includes(s.phase)||typeof s.endless!=='boolean'||(!s.endless&&s.wave>FINAL_WAVE)||(s.phase==='victory'&&(s.wave!==FINAL_WAVE||s.endless))||(s.phase==='prepare'&&s.wave===FINAL_WAVE&&!s.endless)||!(s.deal===null||Object.hasOwn(TOWERS,s.deal))||!Array.isArray(s.towers)||s.towers.length>250)throw Error('badSave');
 if(s.deals!==undefined&&(!Array.isArray(s.deals)||s.deals.length>10000||s.deals.some(k=>!Object.hasOwn(TOWERS,k))))throw Error('badSave');
 if(s.mapId!==undefined&&!Object.hasOwn(MAPS,s.mapId))throw Error('badSave');const g=createGame(s.seed,s.mapId==='desert'?(s.mapRevision===2?'desert':s.mapRevision===1?'desert-v16':'desert-v15'):s.mapId||'grass');Object.assign(g,{credits:s.credits,lives:s.lives,wave:s.wave,phase:s.phase,endless:s.endless,deal:s.deal,deals:s.deals||[],nextId:s.nextId,paused:true});const ids=new Set();
 for(const t of s.towers){if(!t||!Object.hasOwn(TOWERS,t.type)||![0,1,2].includes(t.level)||!integer(t.id)||t.id<1||t.id>=s.nextId||ids.has(t.id)||!integer(t.paid)||!finite(t.cooldown)||t.cooldown>30||!Number.isFinite(t.angle)||!TARGET_MODES.includes(t.mode)||!validPlacement(g,t.x,t.y))throw Error('badSave');if(t.performance&&(!Object.keys(emptyPerformance()).every(k=>finite(t.performance[k]))||!integer(t.performance.pops)||!integer(t.performance.wavePops)||t.performance.waveDamage>t.performance.damage||t.performance.wavePops>t.performance.pops))throw Error('badSave');ids.add(t.id);g.towers.push({id:t.id,owner:1,type:t.type,level:t.level,x:t.x,y:t.y,paid:t.paid,cooldown:t.cooldown,angle:t.angle,mode:t.mode,performance:{...emptyPerformance(),...t.performance},attack:0});}
 if(s.settlement){if(!integer(s.settlement.wave)||s.settlement.wave!==s.wave||!integer(s.settlement.bonus))throw Error('badSave');g.settlement={wave:s.settlement.wave,bonus:s.settlement.bonus};}if(g.wave===0)g.countdown=1;return{game:g,settings:s.settings};
}
