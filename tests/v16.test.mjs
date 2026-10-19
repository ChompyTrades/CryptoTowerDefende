import test from 'node:test';
import assert from 'node:assert/strict';
import {wavePlan,bossForWave,ENEMIES} from '../src/config.js';
import {createGame,serialize,deserialize} from '../src/game.js';
import {hasDesert,canPlayDesert,desertUnlockKey} from '../src/unlocks.js';
import {resetProgress} from '../src/reset-progress.js';
import {teamNames,scoreText} from '../src/score-share.js';
test('only whales occupy decade bosses after 100, with rapidly rising Bitcoin HP',()=>{
 assert.equal(bossForWave(50),'CUPSEY');assert.equal(bossForWave(60),'ANSEM');assert.equal(bossForWave(110),'ETH_WHALE');
 let last=0;for(const wave of [110,120,130,140,200,100000]){const q=wavePlan(wave);assert.equal(q.length,1);assert.equal(q[0].type,wave===110?'ETH_WHALE':'BTC_WHALE');const hp=ENEMIES[q[0].type].hp*q[0].scale;assert.ok(Number.isFinite(hp)&&hp>last);last=hp;}
 for(const wave of [101,109,111,121,99999]){const q=wavePlan(wave);assert.ok(q.length<=240&&q.length>0);assert.ok(q.every(e=>!ENEMIES[e.type].boss&&e.scale>=4.3));assert.ok(q.every((e,i)=>i===0||e.at>=q[i-1].at));}
});
test('desert needs a grass victory; test bypass and persistent unlock are independent',()=>{
 const memory=new Map(),storage={getItem:k=>memory.get(k),removeItem:k=>memory.delete(k)};
 const g=createGame();g.wave=40;g.phase='defeat';assert.equal(hasDesert(storage,'test',g),false);
 g.phase='victory';g.mapId='desert';assert.equal(hasDesert(storage,'test',g),false);
 g.mapId='grass';assert.equal(hasDesert(storage,'test',g),true);
 assert.equal(canPlayDesert(false,false),false);assert.equal(canPlayDesert(false,true),true);assert.equal(canPlayDesert(true,false),true);
 memory.set(desertUnlockKey('test'),'1');assert.equal(hasDesert(storage,'test',createGame()),true);resetProgress(storage,'test');assert.equal(hasDesert(storage,'test',createGame()),false);
});
test('old desert saves keep their original route while new saves use revised route',()=>{
 const old=JSON.parse(serialize(createGame(5,'desert'),{}));delete old.mapRevision;assert.equal(deserialize(JSON.stringify(old)).game.mapId,'desert-v15');assert.equal(deserialize(serialize(createGame(5,'desert'),{})).game.mapId,'desert');
});
test('future lobby names are bounded and share wording distinguishes solo and team',()=>{
 const g=createGame();g.wave=42;g.phase='defeat';assert.ok(scoreText(g).includes('Meine'));g.players=[{name:' Alice\n'},{name:'Bob'},{name:'X'.repeat(100)},{name:'D'},{name:'not shown'}];assert.deepEqual(teamNames(g),['Alice','Bob','X'.repeat(20),'D']);assert.ok(scoreText(g).includes('Unsere'));assert.ok(scoreText(g,'en').length<280);
});
