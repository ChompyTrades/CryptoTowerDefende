import test from 'node:test';
import assert from 'node:assert/strict';
import {detachedView,gameView} from '../server/coop-view.mjs';
import {createGame,spawn,tick} from '../src/game.js';
test('faster view clone matches previous JSON rounding and detaches every state',()=>{
 const old=v=>JSON.parse(JSON.stringify(v,(k,x)=>typeof x==='number'&&!Number.isInteger(x)?Math.round(x*1000)/1000:x));
 const g=createGame();g.phase='wave';
 for(let i=0;i<200;i++){if(i%10===0)spawn(g,'HYPE');tick(g,1/60);const view=gameView(g);assert.deepEqual(detachedView(view),old(view));}
 const sample={negativeZero:-0,tiny:-.00001,empty:undefined,values:[undefined,null,Infinity,NaN,-1.23456]};assert.deepEqual(detachedView(sample),old(sample));
 const copy=detachedView(g);copy.enemies[0].x=999;assert.notEqual(copy.enemies[0].x,g.enemies[0].x);
});
