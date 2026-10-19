import {mapFor} from '../src/maps.js';
import {createGame,action,startWave,tick,validPlacement,pathDistance,pointAt,pathLength,stats,price,continueEndless} from '../src/game.js';
import {TOWERS,RULES,FINAL_WAVE} from '../src/config.js';
import {writeFileSync} from 'node:fs';
function location(g,type){const range=TOWERS[type].levels[0].range;let best=null;for(let x=55;x<1050;x+=35)for(let y=85;y<625;y+=32){if(!validPlacement(g,x,y))continue;let score=0;for(let d=50;d<mapFor(g.mapId).length;d+=35){const p=pointAt(d,g.mapId);if(Math.hypot(p.x-x,p.y-y)<range)score++;}score-=g.towers.reduce((v,t)=>v+Math.max(0,1-Math.hypot(t.x-x,t.y-y)/180),0)*2;if(!best||score>best.score)best={x,y,score};}return best;}
function run(name,types,seed=91473,policy="upgrade"){const g=createGame(seed,process.argv.includes('--desert')?'desert':'grass');let duration=0,maxEnemies=0;const rounds=[];let spent=0,earned=0,planCursor=0;const begin=performance.now();for(let wave=1;wave<=(Number(process.argv.find(a=>a.startsWith("--until="))?.slice(8))||FINAL_WAVE);wave++){
 if(g.phase==='victory'){continueEndless(g);g.paused=false;}
 // Legal strategy: spend earned credits between waves; no state/currency cheats.
 const before=g.credits;for(let k=0;k<20;k++){let acted=false;if(wave>2&&(policy!=="wide"||g.towers.length>=Math.min(12,Math.ceil(wave/2))))for(const t of g.towers){const next=TOWERS[t.type].levels[t.level+1];if(next&&g.credits>=next.cost&&action(g,{type:'upgrade',id:t.id}).ok){acted=true;break;}}if(acted)continue;let type=types[planCursor%types.length],planned=true;if(g.credits<price(g,type)){if(((process.argv.includes('--boss-reserve')&&wave%10===0)||(policy==='adaptive'&&g.credits>=price(g,'PENGU')+1200))&&g.credits>=price(g,'PENGU')){type='PENGU';planned=false;}else break;}const p=location(g,type);if(!p)break;const built=action(g,{type:'place',tower:type,...p});if(!built.ok)break;if(planned)planCursor++;if(policy==='popstrong'&&type==='POPCAT')action(g,{type:'target',id:built.id,mode:'strong'});}
 if(policy==='adaptive')for(const t of g.towers){const mode=t.type==='POPCAT'&&wave>=11?'ETH':t.type==='SI'?'boss':t.type==='BONK'?'strong':'first';action(g,{type:'target',id:t.id,mode});}spent+=before-g.credits;const battleCash=g.credits;startWave(g);let steps=0;while(g.phase==='wave'&&steps<18000){tick(g,1/60);steps++;maxEnemies=Math.max(maxEnemies,g.enemies.length);g.events=[];}earned+=g.credits-battleCash;duration+=steps/60+RULES.delay;rounds.push({wave,lives:g.lives,credits:g.credits,towers:g.towers.length,seconds:Math.round(steps/60),phase:g.phase,earned:g.credits-battleCash,totalSpent:spent,damage:g.towers.reduce((n,t)=>n+(t.performance?.waveDamage||0),0)});if(g.phase==='defeat'||g.phase==='wave')break;
 }return{name,map:g.mapId,policy,timedOut:g.phase==='wave',bossReserve:process.argv.includes('--boss-reserve'),seed,spent,earned,phase:g.phase,lives:g.lives,seconds:Math.round(duration),maxEnemies,remaining:g.enemies.filter(e=>e.hp>0).map(e=>({type:e.type,hp:Math.round(e.hp)})),cpuMs:Math.round(performance.now()-begin),rounds,towers:g.towers.map(t=>({type:t.type,x:t.x,y:t.y,level:t.level,paid:t.paid,performance:t.performance}))};}
const strategies=[
 ['Flexibler Popcat-Mix',['PENGU','PENGU','PEPE','BONK','POPCAT','SNEK','SI'],'adaptive'],
 ['Flexibler Kontroll-Mix',['PENGU','PEPE','PENGU','SNEK','BONK','DOGE','SI'],'adaptive'],
 ['Rollenmix Popcat und SI',['PENGU','DOGE','PENGU','PENGU','POPCAT','BONK','SI','SNEK'],'popstrong'],
 ['Rollenmix Snek und SI',['PENGU','PENGU','PENGU','SNEK','BONK','SI','SNEK']],
 ['Doge-lastig',['PENGU','DOGE','DOGE','DOGE','BONK']],
 ['Snek-lastig',['PENGU','PEPE','SNEK','SNEK','BONK']],
 ['Popcat-lastig / Erster',['PENGU','PENGU','DOGE','POPCAT','POPCAT','BONK']],
 ['Popcat-lastig / Staerkster',['PENGU','PENGU','DOGE','POPCAT','POPCAT','BONK'],'popstrong'],
 ['Bonk-lastig',['PENGU','PENGU','BONK','BONK','SNEK']],
 ['SI-lastig',['PENGU','DOGE','PENGU','BONK','SI','SI']],
 ['Kernteam + Bonk',['PENGU','DOGE','PENGU','PENGU','BONK','PENGU','SNEK','PENGU']],
 ['Kernteam + Popcat',['PENGU','DOGE','PENGU','PENGU','POPCAT','PENGU','SNEK']],
 ['Pepe-Kern + Bonk',['PEPE','DOGE','PEPE','BONK','PEPE','SNEK']],
 ['Spaeter Super Inu',['PENGU','DOGE','PENGU','PENGU','BONK','PENGU','PENGU','SNEK','PENGU','PENGU','SI']],
 ['Pengu + Doge',['PENGU','DOGE']],
 ['Pepe / Snek / Bonk',['PEPE','SNEK','BONK']],
 ['Alle Rollen',['PENGU','DOGE','PEPE','SNEK','BONK','POPCAT','SI']],
 ['Schwer gemischt',['PENGU','DOGE','PENGU','BONK','SNEK','BONK','SI','POPCAT']],
 ['Schnee und Hammer',['PENGU','PENGU','BONK','SNEK','PENGU','BONK','SI']],
 ['Blasen und Bellen',['PEPE','DOGE','PEPE','DOGE','SNEK','BONK']],
 ['Pengu allein',['PENGU']],
 ['Pepe allein',['PEPE']],
 ['Popcat-Mix',['PENGU','DOGE','POPCAT','SNEK','BONK','PENGU']],
 ['Flaeche und Kontrolle',['PENGU','DOGE','SNEK','DOGE','BONK']],
 ['Breit gemischt',['PENGU','DOGE','PEPE','SNEK','BONK'],'wide'],
 ['Breite Schneefront',['PENGU','DOGE','PENGU','BONK'],'wide']
];
const seeds=process.argv.includes('--seeds')?[91473,1603,42]:[91473];
const filter=process.argv.find(a=>a.startsWith('--filter='))?.slice(9);const results=seeds.flatMap(seed=>strategies.filter(x=>!filter||x[0].includes(filter)).map(([name,types,policy])=>run(name,types,seed,policy)));
const out=process.argv.find(a=>a.startsWith('--out='))?.slice(6)||'docs/balance-results.json';writeFileSync(out,JSON.stringify(results,null,2));
console.table(results.map(r=>({name:r.name,seed:r.seed,wave:r.rounds.at(-1).wave,lives:r.lives,result:r.phase,spent:r.spent,earned:r.earned,time:r.seconds,lastHP:r.remaining.reduce((n,e)=>n+e.hp,0)})));
