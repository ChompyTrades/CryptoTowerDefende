import {createGame,action,startWave,tick,validPlacement,pointAt,stats,price} from '../src/game.js';
import {mapFor} from '../src/maps.js';
import {TOWERS,ENEMIES,wavePlan} from '../src/config.js';
import {writeFileSync} from 'node:fs';
const map=process.argv.includes('--desert')?'desert':'grass';
const samples=new Map();
function coverage(g,x,y,r){const key=g.mapId;let points=samples.get(key);if(!points){points=[];for(let d=20;d<mapFor(key).length;d+=40)points.push({...pointAt(d,key),d});samples.set(key,points);}const front=g.enemies.filter(e=>!e.dead).reduce((n,e)=>Math.max(n,e.d),0);return points.reduce((n,p)=>n+(Math.hypot(x-p.x,y-p.y)<r?(g.phase==='wave'&&p.d<front?.4:1):0),0);}
function value(g,type,s,x,y){const boss=(g.phase==='wave'?g.wave:g.wave+1)%10===0,coverageValue=coverage(g,x,y,s.range);let power=s.damage/s.rate;
 if(type==='DOGE'&&!boss)power*=2.4;
 if(type==='SNEK')power=power+g.towers.filter(t=>t.type!=='SNEK').length*9*(1-s.slow);
 if(type==='POPCAT'&&!boss){const q=wavePlan(g.phase==='wave'?g.wave:g.wave+1),eligible=q.filter(e=>!ENEMIES[e.type].boss&&ENEMIES[e.type].hp*e.scale<=s.swallow);power=Math.max(power,eligible.reduce((n,e)=>n+ENEMIES[e.type].hp*e.scale,0)/Math.max(1,eligible.length)/s.digest);}
 return power*coverageValue;
}
function buy(g,types){let best=null;const reserveLaser=types.includes('SI')&&g.wave>=27&&!g.towers.some(t=>t.type==='SI')&&g.towers.filter(t=>t.level===2).length>=4; if(reserveLaser&&g.credits<price(g,'SI'))return 0;const prioritizeUpgrades=g.towers.length>=8&&g.towers.some(t=>t.level<2);const consider=(score,a,cost)=>{score/=cost**.82;if(score>0&&(!best||score>best.score))best={score,a,cost};};
 for(const t of g.towers){if(reserveLaser)break;const s=TOWERS[t.type].levels[t.level+1];if(s&&s.cost<=g.credits)consider((value(g,t.type,s,t.x,t.y)-value(g,t.type,stats(t),t.x,t.y))*1.7,{type:'upgrade',id:t.id},s.cost);}
 for(const type of types){if(reserveLaser&&type!=='SI')continue;if(!reserveLaser&&prioritizeUpgrades)continue;const cost=price(g,type);if(cost>g.credits)continue;const s=TOWERS[type].levels[0];let p=null;for(let x=55;x<1050;x+=50)for(let y=85;y<625;y+=45){if(!validPlacement(g,x,y))continue;const score=value(g,type,s,x,y)/(1+g.towers.reduce((n,t)=>n+Math.max(0,1-Math.hypot(x-t.x,y-t.y)/120),0)*.2);if(!p||score>p.score)p={x,y,score};}if(p)consider(p.score/(1+Math.max(0,g.towers.length-5)*.22),{type:'place',tower:type,x:p.x,y:p.y},cost);}
 if(!best)return 0;const result=action(g,best.a);return result.ok?best.cost:0;
}
const plans=[['Allround',['PENGU','PEPE','DOGE','SNEK','BONK','POPCAT','SI']],['Pengu',['PENGU']],['Pepe',['PEPE']],['Hammer',['PENGU','BONK','SNEK']],['Laser',['PENGU','DOGE','SI']],['Popcat',['PENGU','POPCAT','SNEK','SI']],['Kontrolle',['PENGU','PEPE','DOGE','SNEK']],['Doge',['PENGU','DOGE','BONK']]];
const results=[];
for(const seed of [91473,1603,42])for(const [name,types] of plans){const g=createGame(seed,map),rounds=[];let spent=0,inWaveBuys=0;for(let w=1;w<=40;w++){for(let n=0;n<20;n++){const paid=buy(g,types);if(!paid)break;spent+=paid;}startWave(g);const openingCash=g.credits,openingSpent=spent;let steps=0;while(g.phase==='wave'&&steps<18000){if(steps%300===0){const paid=buy(g,types);spent+=paid;if(paid)inWaveBuys++;for(const t of g.towers)action(g,{type:'target',id:t.id,mode:t.type==='POPCAT'?(w>=33?'HYPE':'ETH'):t.type==='SI'?'boss':t.type==='BONK'?'strong':'first'});}tick(g,1/60);g.events=[];steps++;}rounds.push({wave:w,lives:g.lives,credits:g.credits,earned:g.credits-openingCash+spent-openingSpent,seconds:steps/60,phase:g.phase});if(g.phase==='defeat'||g.phase==='wave')break;}results.push({name,seed,map,phase:g.phase,wave:g.wave,lives:g.lives,credits:g.credits,spent,inWaveBuys,rounds,towers:g.towers.map(t=>({type:t.type,level:t.level,damage:t.performance.damage,pops:t.performance.pops}))});}
const out=process.argv.find(a=>a.startsWith('--out='))?.slice(6)||'docs/adaptive-results.json';writeFileSync(out,JSON.stringify(results,null,2));console.table(results.map(({name,seed,wave,lives,phase,inWaveBuys})=>({name,seed,wave,lives,phase,inWaveBuys})));
