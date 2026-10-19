import test from 'node:test';
import assert from 'node:assert/strict';
import {encodeCompact,decodeCompact,decodePacket} from '../src/coop-binary.js';
import {encodePacket,decodeNodePacket} from '../server/coop-packet.mjs';
import {createGame,spawn,advance,action} from '../src/game.js';
import {gameView,detachedView} from '../server/coop-view.mjs';
import {statePatch,applyStatePatch,relativePatch} from '../src/coop-wire.js';
test('relative columns preserve null, missing fields, nested arrays and very large HP',()=>{
 const base={type:'state',events:[],game:{elapsed:1.234,enemies:[{id:1,hp:1e20,x:12.345,extra:null},{id:2,hp:Math.PI,x:14,extra:[null,[1,2]]}],towers:[],effects:[],puddles:[]}};
 const next=structuredClone(base);next.game.elapsed=1.267;next.game.enemies[0].hp=1e20-100000;delete next.game.enemies[0].extra;next.game.enemies[1].hp=Math.E;next.game.enemies[1].extra=[];next.game.enemies.push({id:3,hp:99,x:2,extra:null});
 const decoded=decodeNodePacket(encodePacket(relativePatch(base,statePatch(base,next))),true);
 assert.deepEqual(applyStatePatch(base,decoded),next);
});
test('binary packets preserve numbers, Unicode, arrays and missing fields without rounding',async()=>{
 const values=[null,false,true,0,-1,1.001,-123.456,Math.PI,Number.MAX_SAFE_INTEGER,1e30,'Süper 🐸',[],{},JSON.parse('{"__proto__":{"polluted":true}}')];
 for(const v of values){assert.deepEqual(decodeCompact(encodeCompact(v)),v);assert.deepEqual(await decodePacket(encodePacket(v)),v);}
 assert.equal({}.polluted,undefined);
 for(const b of [new Uint8Array(),new Uint8Array([67,84,68,9]),encodeCompact('hello').slice(0,-1),new Uint8Array([67,84,68,2,6,255,255])])assert.throws(()=>decodeCompact(b));
});
test('all render fields reconstruct exactly across 600 x8 frames including attacks and effects',async()=>{
 const g=createGame();g.credits=1e8;action(g,{type:'place',tower:'PENGU',x:370,y:277});action(g,{type:'place',tower:'PEPE',x:650,y:469});g.phase='wave';g.speed=8;
 let previous=null,client=null;
 for(let i=0;i<600;i++){
  if(i%15===0)spawn(g,['HYPE','ETH','LINK','ZEC'][i/15%4],10);
  advance(g,1/30,false);const next=detachedView({type:'state',game:gameView(g),events:[]});
  const packet=encodePacket(previous?relativePatch(previous,statePatch(previous,next)):next),decoded=decodeNodePacket(packet,true);
  client=applyStatePatch(client,decoded);assert.deepEqual(client,next);previous=next;
 }
});
