import test from 'node:test';
import assert from 'node:assert/strict';
import {ENEMIES,TOWERS,wavePlan,bossForWave} from '../src/config.js';
import {MAPS} from '../src/maps.js';
import {createGame,serialize,deserialize} from '../src/game.js';

test('Ethereum stays between Popcat I and II thresholds and Quant owns wave 90',()=>{
 assert.equal(ENEMIES.ETH.hp,3800);assert.equal(ENEMIES.ETH_BOSS.hp,3800);
 assert.ok(ENEMIES.ETH.hp>TOWERS.POPCAT.levels[0].swallow);assert.ok(ENEMIES.ETH.hp<=TOWERS.POPCAT.levels[1].swallow);
 assert.equal(bossForWave(90),'QUANT');assert.deepEqual(wavePlan(90).map(e=>e.type),['QUANT']);
 assert.equal(wavePlan(35)[0].scale,1);assert.equal(wavePlan(41)[0].scale,1.05);assert.equal(wavePlan(101)[0].scale,4.3);
});
test('shorter desert preserves previous revision saves',()=>{
 assert.ok(MAPS.desert.length<MAPS['desert-v16'].length);assert.ok(MAPS.desert.length>MAPS['desert-v16'].length*.94);
 const old=JSON.parse(serialize(createGame(7,'desert'),{}));old.mapRevision=1;
 assert.equal(deserialize(JSON.stringify(old)).game.mapId,'desert-v16');
 assert.equal(deserialize(serialize(createGame(7,'desert'),{})).game.mapId,'desert');
});
