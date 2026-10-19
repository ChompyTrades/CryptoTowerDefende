// Offline 30Hz wire trace of legal purchases, not a live multiplayer balance test.
import {mapFor} from '../src/maps.js';
import {createGame,action,startWave,tick,validPlacement,pointAt,price} from '../src/game.js';
import {TOWERS,RULES} from '../src/config.js';
import {gameView,detachedView} from '../server/coop-view.mjs';
import {statePatch,applyStatePatch,relativePatch} from '../src/coop-wire.js';
import {encodePacket,decodeNodePacket} from '../server/coop-packet.mjs';
import {deflateRawSync} from 'node:zlib';
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
function location(g,type){const range=TOWERS[type].levels[0].range;let best=null;for(let x=55;x<1050;x+=35)for(let y=85;y<625;y+=32){if(!validPlacement(g,x,y))continue;let score=0;for(let d=50;d<mapFor(g.mapId).length;d+=35){const p=pointAt(d,g.mapId);if(Math.hypot(p.x-x,p.y-y)<range)score++;}score-=g.towers.reduce((v,t)=>v+Math.max(0,1-Math.hypot(t.x-x,t.y-y)/180),0)*2;if(!best||score>best.score)best={x,y,score};}return best;}

const results=[];
for(const [name,types] of [['Bonk mix',['PENGU','DOGE','PENGU','PENGU','BONK','PENGU','SNEK','PENGU']],['Control mix',['PENGU','PEPE','PENGU','SNEK','BONK','DOGE','SI']]]){
 const g=createGame(91473),policy=name==='Control mix'?'adaptive':'upgrade';g.speed=3;let planCursor=0,previous=null,client=null,frames=0,bytes=0,oldBytes=0,eventId=0,events=[],simSeconds=0;const rounds=[];
 function sample(){
  events.push(...g.events.map(event=>({id:++eventId,kind:'game',event})));events=events.slice(-80);g.events=[];
  const players=Array.from({length:3},(_,id)=>({id:'p'+id,slot:id,name:'Player '+id,credits:Math.floor(g.credits/3),performance:{damage:g.towers.filter((_,i)=>i%3===id).reduce((n,t)=>n+t.performance.damage,0),pops:g.towers.filter((_,i)=>i%3===id).reduce((n,t)=>n+t.performance.pops,0)},connected:true}));
  for(let i=0;i<g.towers.length;i++)g.towers[i].owner='p'+i%3;
  const next=detachedView({type:'state',tick:frames,code:'CAMPAIGN',host:'p0',status:'playing',players,events,game:gameView(g)}),message=previous?statePatch(previous,next):next,packet=encodePacket(previous?relativePatch(previous,message):message);
  bytes+=packet.length+4;oldBytes+=deflateRawSync(JSON.stringify(message),{level:1}).length+4;
  client=applyStatePatch(client,decodeNodePacket(packet,true));assert.deepEqual(client,next);previous=next;frames++;
 }
 for(let wave=1;wave<=40;wave++){
 const before=g.credits;for(let k=0;k<20;k++){let acted=false;if(wave>2&&(policy!=="wide"||g.towers.length>=Math.min(12,Math.ceil(wave/2))))for(const t of g.towers){const next=TOWERS[t.type].levels[t.level+1];if(next&&g.credits>=next.cost&&action(g,{type:'upgrade',id:t.id}).ok){acted=true;break;}}if(acted)continue;let type=types[planCursor%types.length],planned=true;if(g.credits<price(g,type)){if(((process.argv.includes('--boss-reserve')&&wave%10===0)||(policy==='adaptive'&&g.credits>=price(g,'PENGU')+1200))&&g.credits>=price(g,'PENGU')){type='PENGU';planned=false;}else break;}const p=location(g,type);if(!p)break;const built=action(g,{type:'place',tower:type,...p});if(!built.ok)break;if(planned)planCursor++;if(policy==='popstrong'&&type==='POPCAT')action(g,{type:'target',id:built.id,mode:'strong'});}

  if(policy==='adaptive')for(const t of g.towers)action(g,{type:'target',id:t.id,mode:t.type==='SI'?'boss':t.type==='BONK'?'strong':'first'});
  startWave(g);let steps=0;const startBytes=bytes;
  while(g.phase==='wave'&&steps<18000){tick(g,1/60);steps++;if(steps%6===0||g.phase!=='wave')sample();}
  simSeconds+=steps/60;
  rounds.push({wave,phase:g.phase,lives:g.lives,towers:g.towers.length,MBPerClient:(bytes-startBytes)/1e6});
  if(g.phase==='defeat'||g.phase==='wave')break;
 }
 results.push({name,phase:g.phase,wave:g.wave,lives:g.lives,minutesAtX3:simSeconds/3/60+40*RULES.delay/60,MBPerClient:bytes/1e6,legacyMBPerClient:oldBytes/1e6,frames,rounds});console.log(name,g.phase,g.wave,(bytes/1e6).toFixed(2),'MB/client');
}
writeFileSync('output/network-campaign.json',JSON.stringify({note:'Legal pooled purchases and actual waves at x3, three-player metadata. Ignores individual wallet fragmentation, donations, menu time and initial HTTP assets. 30Hz trace, exact full-state reconstruction asserted on every frame. No life or money cheats.',results},null,2));
