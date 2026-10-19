import {createGame,action,validPlacement,pointAt,startWave,tick,price} from '../src/game.js';
import {TOWERS,ENEMIES,WAVES,bossForWave} from '../src/config.js';import {mapFor} from '../src/maps.js';import {writeFileSync} from 'node:fs';
const result=[];const legacy=process.argv.includes('--legacy');if(legacy){Object.assign(ENEMIES.ETH_WHALE,{hp:2000000,speed:24});Object.assign(ENEMIES.BTC_WHALE,{hp:4000000,speed:22});}
function oldPlan(w){const boss=bossForWave(w);if(boss)return[{type:boss,at:0,scale:boss==='BTC_WHALE'?(1+(w-120)/10*.8)**2:1}];const base=WAVES[30+(w-101)%9],count=Math.min(240,Math.ceil(base.length*(1.8+(w-101)*.06)));return Array.from({length:count},(_,i)=>({...base[i%base.length],at:(base[i%base.length].at+Math.floor(i/base.length)*60)*.65,scale:12+(w-101)*1.5})).sort((a,b)=>a.at-b.at);}

for(const [name,types] of [['Mixed',['SI','BONK','SI','SNEK','BONK','POPCAT']],['Laser',['SI','SI','SNEK']],['Hammer',['BONK','BONK','SNEK']],['LaserBase',['SI','SI','SI','SNEK']]])for(const budget of [140000,170000,200000]){
const g=createGame();g.wave=100;g.endless=true;g.credits=budget;
const points=[];for(let d=0;d<mapFor('grass').length;d+=35)points.push(pointAt(d));
let index=0;function buy(){const type=types[index%types.length],def=TOWERS[type],level=name==='LaserBase'&&type==='SI'?0:2,cost=price(g,type)+(level?def.levels[1].cost+def.levels[2].cost:0);if(cost>g.credits)return false;let best;for(let x=55;x<1060;x+=45)for(let y=80;y<620;y+=45){if(!validPlacement(g,x,y))continue;const score=points.filter(p=>Math.hypot(x-p.x,y-p.y)<def.levels[level].range).length/(1+g.towers.reduce((n,t)=>n+Math.max(0,1-Math.hypot(x-t.x,y-t.y)/100),0)*.3);if(!best||score>best.score)best={x,y,score};}if(!best)return false;const r=action(g,{type:'place',tower:type,...best});if(level){action(g,{type:'upgrade',id:r.id});action(g,{type:'upgrade',id:r.id});}action(g,{type:'target',id:r.id,mode:type==='BONK'?'strong':type==='SI'?'boss':'first'});index++;return true;}
while(buy()){}const startingTowers=g.towers.length,rounds=[];
for(let w=101;w<=130;w++){while(buy()){}startWave(g);if(legacy)g.queue=oldPlan(w);let steps=0,bossRemaining=null;while(g.phase==='wave'&&steps<24000){if(steps%600===0)buy();if(g.enemies[0]&&w%10===0)bossRemaining=g.enemies[0].hp;tick(g,1/60);g.events=[];steps++;}rounds.push({wave:w,lives:g.lives,phase:g.phase,seconds:Math.round(steps/60),bossRemaining});if(g.phase!=='prepare')break;}
result.push({name,budget,startingTowers,wave:g.wave,lives:g.lives,phase:g.phase,rounds});console.log(name,budget,g.wave,g.lives,g.phase);
}
writeFileSync(process.argv[2]||'docs/endgame-results.json',JSON.stringify(result,null,2));
