// IPC-only fixture. Never imported by the application server.
import {createLocalServer} from '../server.mjs';
import {createGame,startWave,action,validPlacement,spawn,pointAt} from '../src/game.js';
import {TOWERS} from '../src/config.js';
import {monitorEventLoopDelay} from 'node:perf_hooks';
const {server,coop}=createLocalServer({compression:true});
const delay=monitorEventLoopDelay({resolution:10});delay.enable();
let started=performance.now(),cpu=process.cpuUsage(),maxRSS=0,maintenance;
process.on('message',m=>{
 if(m.type==='scene'){
  for(const r of coop.rooms.values()){
   const g=createGame();r.game=g;r.status='playing';g.credits=1e9;g.lives=1e9;g.endless=true;let n=0;const types=Object.keys(TOWERS);
   for(let y=85;y<625&&n<m.towers;y+=50)for(let x=45;x<1055&&n<m.towers;x+=50)if(validPlacement(g,x,y)){action(g,{type:'place',tower:types[n++%types.length],x,y});g.towers.at(-1).level=2;g.towers.at(-1).owner=r.players[n%r.players.length].id;}
   const begin=()=>{g.wave=m.wave-1;g.phase='prepare';g.paused=false;startWave(g);g.speed=m.speed||8;};begin();r.fixtureBegin=begin;
   if(m.crowd)for(let i=0;i<m.crowd;i++){const e=spawn(g,['LINK','ZEC','HYPE','ETH'][i%4],30);e.d=i*17;Object.assign(e,pointAt(e.d));}
  }
  maintenance=setInterval(()=>{maxRSS=Math.max(maxRSS,process.memoryUsage().rss);for(const r of coop.rooms.values()){if(r.game.phase!=='wave')r.fixtureBegin();if(m.crowd)while(r.game.enemies.length<m.crowd){const e=spawn(r.game,['LINK','ZEC','HYPE','ETH'][r.game.nextId%4],30);e.d=0;}}},200);
  started=performance.now();cpu=process.cpuUsage();coop.costs.length=0;delay.reset();process.send({type:'started'});
 }
 if(m.type==='metrics'){
  const seconds=(performance.now()-started)/1000,c=process.cpuUsage(cpu),costs=coop.costs.toSorted((a,b)=>a-b);
  process.send({type:'metrics',seconds,cpuPercent:100*(c.user+c.system)/(seconds*1e6),rssMB:process.memoryUsage().rss/1e6,maxRssMB:maxRSS/1e6,tickP95ms:costs[Math.floor(costs.length*.95)]||0,tickMaxMs:Math.max(0,...costs),loopP95ms:delay.percentile(95)/1e6,loopMaxMs:delay.max/1e6,rooms:[...coop.rooms.values()].map(r=>({wave:r.game.wave,towers:r.game.towers.length,enemies:r.game.enemies.length,phase:r.game.phase,elapsed:r.game.elapsed})),messages:coop.metrics.messages,packedFrames:coop.metrics.packedFrames});
 }
 if(m.type==='stop'){clearInterval(maintenance);delay.disable();coop.close();server.close(()=>process.exit(0));}
});
server.listen(0,'127.0.0.1',()=>process.send({type:'ready',port:server.address().port}));
