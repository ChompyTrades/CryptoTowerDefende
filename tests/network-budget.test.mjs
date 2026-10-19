import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {createBandwidthBudget,budgetFromEnv} from '../server/bandwidth.mjs';
import {createLocalServer} from '../server.mjs';
import {gameView} from '../server/coop-view.mjs';
import {createGame,spawn} from '../src/game.js';
import {readProgress,saveProgress,cleanProgress} from '../src/coop-progress.js';
import {applyStatePatch,statePatch} from '../src/coop-wire.js';

test('lifetime budget refuses crossing the ceiling, reserves before restart, 0 disables ceiling',()=>{
 const file=path.join(mkdtempSync(path.join(tmpdir(),'ctd-budget-')),'budget.json');
 const b=createBandwidthBudget({limit:1200,file});assert.ok(b.take(600,'ws'));assert.equal(b.take(601),false);assert.equal(b.status().used,600);
 const resumed=createBandwidthBudget({limit:1200,file});assert.equal(resumed.take(1),false);
 assert.ok(createBandwidthBudget({limit:0,file}).take(2000));
 assert.throws(()=>createBandwidthBudget({limit:NaN}));
});
test('event delta only sends new events, trims history and resets on new game',()=>{
 const base={type:'state',events:[{id:1},{id:2}],game:{enemies:[],towers:[]}},next={...base,events:[...base.events,{id:3}]};
 const patch=statePatch(base,next);assert.deepEqual(patch.top.events,[{id:3}]);assert.deepEqual(applyStatePatch(base,patch),next);
 const reset={...next,events:[]};assert.deepEqual(applyStatePatch(next,statePatch(next,reset)),reset);
});
test('a missing Render ledger fails closed instead of resetting a lifetime allowance',()=>{
 const directory=mkdtempSync(path.join(tmpdir(),'ctd-host-budget-'));
 assert.equal(budgetFromEnv(directory,{RENDER:'true'}).take(1),false);
 assert.equal(budgetFromEnv(directory,{RENDER:'true',CTD_BANDWIDTH_LIMIT_BYTES:'0'}).take(10),true);
});
test('view retains every coin rendering field and excludes internal queues',()=>{
 const g=createGame(),e=spawn(g,'HYPE');e.hypePhase=3;e.linked=7;e.sprinting=true;e.resisting=true;
 const v=gameView(g);for(const k of ['id','type','x','y','d','hp','maxHp','r','hit','heal','linked','sprinting','resisting','hypePhase'])assert.equal(v.enemies[0][k],e[k]);
 assert.equal(v.pendingHits,undefined);assert.equal(v.queue,undefined);assert.equal(v.players,undefined);assert.deepEqual(v.effects,g.effects);
});
test('effect and puddle deltas preserve full rendering data, ordering and disappearance',()=>{
 const g=createGame();g.effects=[{kind:'snow',x:2,y:3,tx:5,ty:6,ttl:.3,max:.3,level:2},{kind:'laser',x:9,y:4,tx:5,ty:7,ttl:.16,max:.16}];g.puddles=[{x:10,y:20,ttl:3,level:2}];
 const a={type:'state',game:structuredClone(gameView(g))};g.effects[0].ttl=.2;g.effects.splice(1,1);g.effects.push({kind:'bubble',ttl:.23,max:.23,x:8,y:9});g.puddles[0].ttl=2.9;
 const b={type:'state',game:structuredClone(gameView(g))},patch=statePatch(a,b);assert.deepEqual(applyStatePatch(a,patch),b);assert.equal(patch.game.fields.effects,undefined);assert.equal(patch.game.effects.upsert[0].x,undefined);assert.equal(patch.game.effects.upsert[0].ttl,.2);
 for(const [i,f] of b.game.effects.entries()){const {id,...visual}=f;assert.deepEqual(visual,g.effects[i]);}
});
test('browser progress merges unlocks across lost server profiles and explicitly resets',()=>{
 const m=new Map(),storage={getItem:k=>m.get(k),setItem:(k,v)=>m.set(k,v)};
 saveProgress(storage,{unlocks:{eight:true},known:{enemies:['ETH','bad']}});saveProgress(storage,{unlocks:{five:true}});
 assert.equal(readProgress(storage).unlocks.eight,true);assert.equal(readProgress(storage).unlocks.five,true);assert.deepEqual(readProgress(storage).known.enemies,['ETH']);
 saveProgress(storage,null,true);assert.equal(readProgress(storage).unlocks.eight,false);assert.equal(cleanProgress({unlocks:{eight:'true'}}).unlocks.eight,false);
});
test('HTTP cache validation, gzip, HEAD and budget refusal',async t=>{
 const budget=createBandwidthBudget({limit:1000000});const {server,coop}=createLocalServer({bandwidth:budget});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 t.after(async()=>{coop.close();await new Promise(r=>server.close(r));});const url='http://127.0.0.1:'+server.address().port+'/src/config.js';
 const a=await fetch(url,{headers:{'accept-encoding':'gzip'}});assert.equal(a.status,200);assert.equal(a.headers.get('content-encoding'),'gzip');const text=await a.text();assert.ok(text.includes('TOWERS'));
 const b=await fetch(url,{headers:{'accept-encoding':'gzip','if-none-match':a.headers.get('etag')}});assert.equal(b.status,304);
 const c=await fetch(url,{method:'HEAD'});assert.equal(c.status,200);assert.equal(await c.text(),'');
 const d=await fetch(url,{headers:{'accept-encoding':'gzip;q=0'}});assert.equal(d.headers.get('content-encoding'),null);assert.equal(await d.text(),text);
 budget.take(budget.status().remaining);assert.equal((await fetch(url)).status,503);
});
