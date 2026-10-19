import test from 'node:test';
import assert from 'node:assert/strict';
import {hasSpeedEight,speedEightUnlockKey,canUseBonusSpeed} from '../src/unlocks.js';
import {resetProgress} from '../src/reset-progress.js';
import {createGame,startWave,advance,spawn} from '../src/game.js';

test('x8 unlock requires completed wave 100, persists and resets with test progress',()=>{
 const values=new Map(),storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
 const g=createGame();g.wave=100;g.endless=true;
 for(const phase of ['wave','defeat','prepare']){g.phase=phase;assert.equal(hasSpeedEight(storage,'test',g),false);}
 g.phase='prepare';g.settlement={wave:100};assert.equal(hasSpeedEight(storage,'test',g),true);
 storage.setItem(speedEightUnlockKey('test'),'1');assert.equal(hasSpeedEight(storage,'test',createGame()),true);
 resetProgress(storage,'test');assert.equal(hasSpeedEight(storage,'test',createGame()),false);
 g.wave=101;g.phase='wave';assert.equal(hasSpeedEight(storage,'test',g),true);
 assert.equal(hasSpeedEight({getItem(){throw Error('disabled');}},'test',createGame()),false);
});
test('x8 preserves simulation steps and pause freezes the shared game state',()=>{
 const a=createGame(42),b=createGame(42);
 for(const g of [a,b]){startWave(g);g.queue=[{type:'USDC',at:999,scale:1}];spawn(g,'ETH');}
 b.speed=8;
 for(let i=0;i<80;i++)advance(a,.1,false);
 for(let i=0;i<10;i++)advance(b,.1,false);
 assert.ok(Math.abs(a.enemies[0].d-b.enemies[0].d)<1e-8);
 b.paused=true;const before=JSON.stringify(b);advance(b,.1,false);assert.equal(JSON.stringify(b),before);
});

test("preview bypass is independent of earned speed unlocks",()=>{assert.equal(canUseBonusSpeed(false,true),true);assert.equal(canUseBonusSpeed(false,false),false);assert.equal(canUseBonusSpeed(true,false),true);assert.equal(hasSpeedEight({getItem:()=>null},"test",createGame()),false);});
