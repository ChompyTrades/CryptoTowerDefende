import test from 'node:test';
import assert from 'node:assert/strict';
import {target,enemyGrid,stats,TARGET_MODES,createGame,spawn} from '../src/game.js';
import {ENEMIES} from '../src/config.js';
function original(g,t){const s=stats(t);return g.enemies.filter(e=>!e.dead&&Math.hypot(e.x-t.x,e.y-t.y)<=s.range).sort((a,b)=>((t.mode==='boss'?Number(!!ENEMIES[b.type].boss)-Number(!!ENEMIES[a.type].boss):ENEMIES[t.mode]?Number((ENEMIES[b.type].baseType||b.type)===t.mode)-Number((ENEMIES[a.type].baseType||a.type)===t.mode):0))||(t.mode==='last'?a.d-b.d:t.mode==='strong'?b.hp-a.hp:t.mode==='near'?Math.hypot(a.x-t.x,a.y-t.y)-Math.hypot(b.x-t.x,b.y-t.y):0)||b.d-a.d||a.id-b.id)[0];}
test('linear and spatial target selection match original sorting for every mode and ties',()=>{
 let seed=42;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32),types=Object.keys(ENEMIES);
 for(let scene=0;scene<20;scene++){
  const g=createGame();for(let i=0;i<180;i++){const e=spawn(g,types[i%types.length]);Object.assign(e,{x:Math.floor(random()*1100),y:Math.floor(random()*700),d:Math.floor(random()*20),hp:Math.floor(random()*5)*100,dead:random()<.1});}
  const grid=enemyGrid(g.enemies);
  for(const mode of TARGET_MODES)for(let level=0;level<3;level++){const t={type:'SI',level,mode,x:random()*1100,y:random()*700};const expected=original(g,t)?.id;assert.equal(target(g,t)?.id,expected);assert.equal(target(g,t,grid)?.id,expected);}
 }
});
test('spatial target excludes enemies killed earlier in the same step and includes exact boundary',()=>{
 const g=createGame(),a=spawn(g,'USDC'),b=spawn(g,'USDT'),t={type:'PENGU',level:0,mode:'first',x:200,y:200};Object.assign(a,{x:200+stats(t).range,y:200,d:100});Object.assign(b,{x:200,y:200,d:50});const grid=enemyGrid(g.enemies);assert.equal(target(g,t,grid),a);a.dead=true;assert.equal(target(g,t,grid),b);
});
