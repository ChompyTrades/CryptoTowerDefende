import test from 'node:test';
import assert from 'node:assert/strict';
import {WebSocket} from 'ws';
import {spawnSync} from 'node:child_process';
test('hosting export serves the game and reviews but no source references or workspace files',async()=>{
 const build=spawnSync(process.execPath,['hosting/build.mjs','--release'],{encoding:'utf8'});assert.equal(build.status,0,build.stderr);
 process.env.PORT='0';process.env.HOST='127.0.0.1';
 const {server,coop}=await import('../hosting/server.mjs');
 if(!server.listening)await new Promise(resolve=>server.once('listening',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 try{
  const exported=await (await fetch(base+'/src/unlocks.js')).text();assert.ok(exported.includes('SPEED_TEST_ACCESS=false'));assert.ok(exported.includes('DESERT_TEST_ACCESS=false'));
  const ws=new WebSocket(base.replace('http:','ws:')+'/coop');const received=[];ws.on('message',d=>received.push(JSON.parse(d)));await new Promise((r,j)=>{ws.once('open',r);ws.once('error',j);});ws.send(JSON.stringify({type:'create',name:'Hosting check'}));for(let i=0;i<100&&!received.some(m=>m.type==='session');i++)await new Promise(r=>setTimeout(r,10));assert.ok(received.some(m=>m.type==='session'));ws.terminate();
  for(const url of ['/','/src/app.js','/src/maps.js','/assets/cursors/arrow.svg','/docs/enemy-review.html','/docs/damage-review.js','/health'])assert.equal((await fetch(base+url)).status,200,url);
  for(const url of ['/CTD_PROGRAMMIERPROMPT.md','/package.json','/server.mjs','/docs/references/boss-cupsey.png','/src/../../package.json','/server-local.log'])assert.equal((await fetch(base+url)).status,404,url);
  assert.equal((await fetch(base+'/',{method:'POST'})).status,405);
  const head=await fetch(base+'/',{method:'HEAD'});assert.equal(head.status,200);assert.equal(await head.text(),'');
 }finally{coop.close();await new Promise(resolve=>server.close(resolve));}
});
