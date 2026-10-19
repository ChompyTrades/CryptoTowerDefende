// Deterministic offline trace comparison, not a Render capacity claim.
import {createGame,action,startWave,advance,validPlacement} from '../src/game.js';
import {TOWERS} from '../src/config.js';
import {statePatch,applyStatePatch} from '../src/coop-wire.js';
import {gameView,detachedView} from '../server/coop-view.mjs';
import {deflateRawSync} from 'node:zlib';
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function oldEntities(before,after){const old=new Map(before.map(v=>[v.id,v])),ids=new Set(after.map(v=>v.id));return {remove:before.filter(v=>!ids.has(v.id)).map(v=>v.id),upsert:after.flatMap(v=>{const p=old.get(v.id);if(!p)return[v];const d={id:v.id};for(const k of Object.keys(v))if(!same(v[k],p[k]))d[k]=v[k];const unset=Object.keys(p).filter(k=>!Object.hasOwn(v,k));if(unset.length)d.$unset=unset;return Object.keys(d).length>1?[d]:[];})};}
function oldPatch(b,a){if(!b)return a;const top={},fields={};for(const k of Object.keys(a))if(k!=='game'&&k!=='type'&&!same(b[k],a[k]))top[k]=a[k];for(const k of Object.keys(a.game))if(!['enemies','towers'].includes(k)&&!same(b.game[k],a.game[k]))fields[k]=a.game[k];return {type:'patch',top,game:{fields,enemies:oldEntities(b.game.enemies,a.game.enemies),towers:oldEntities(b.game.towers,a.game.towers)}};}
const rows=[];
for(const wave of [10,35,40,100,120])for(const speed of [1,3,8]){
 const g=createGame();g.credits=1e9;g.lives=1e9;g.endless=true;const types=Object.keys(TOWERS);let count=0;
 for(let y=100;y<620&&count<28;y+=60)for(let x=70;x<1040&&count<28;x+=60)if(validPlacement(g,x,y)){action(g,{type:'place',tower:types[count%types.length],x,y});g.towers.at(-1).level=2;count++;}
 g.wave=wave-1;startWave(g);g.speed=speed;const players=Array.from({length:4},(_,id)=>({id,name:'Player '+id,slot:id,credits:1000,performance:{damage:0,pops:0}}));
 let old=null,next=null,client=null,events=[],id=0,legacyBytes=0,bytes=0,gzipBytes=0,simulationMs=0,oldMs=0,newMs=0,zipMs=0,maxEnemies=0,frames=0;
 for(let frame=0;frame<30*30;frame++){
  let t=performance.now();advance(g,1/30,false);simulationMs+=performance.now()-t;events.push(...g.events.map(event=>({id:++id,kind:'game',event})));events=events.slice(-80);g.events=[];
  const top={type:'state',tick:frame,players,events};t=performance.now();const legacy=detachedView({...top,game:{...g,events:[],players,coop:true}});const oldData=JSON.stringify(oldPatch(old,legacy));JSON.stringify(legacy);oldMs+=performance.now()-t;legacyBytes+=Buffer.byteLength(oldData);old=legacy;
  t=performance.now();next=detachedView({...top,game:gameView(g)});const patch=client?statePatch(client,next):next,data=JSON.stringify(patch);newMs+=performance.now()-t;bytes+=Buffer.byteLength(data);
  const z=performance.now();gzipBytes+=deflateRawSync(data,{level:1}).length;zipMs+=performance.now()-z;
  client=applyStatePatch(client,JSON.parse(data));assert.deepEqual(client,next);maxEnemies=Math.max(maxEnemies,g.enemies.length);frames++;
  if(g.phase!=='wave')break;
 }
 rows.push({wave,speed,frames,seconds:frames/30,maxEnemies,legacyKBps:Math.round(legacyBytes/frames*30/1000),optimizedKBps:Math.round(bytes/frames*30/1000),compressedKBps:Math.round(gzipBytes/frames*30/1000),savedPercent:Math.round((1-bytes/legacyBytes)*100),simulationMs:Math.round(simulationMs),legacySerializeMs:Math.round(oldMs),optimizedSerializeMs:Math.round(newMs),compressionMs:Math.round(zipMs)});
}
const report={date:new Date().toISOString(),note:'30Hz exact reconstruction; 28 level-3 mixed towers, 4 players, up to 30 seconds per wave. Synthetic defense, not balance or Render CPU test. KB decimal; compression estimate independent frames.',rows};writeFileSync('output/network-benchmark.json',JSON.stringify(report,null,2));console.table(rows);
