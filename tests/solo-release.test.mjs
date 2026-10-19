import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFile,readdir} from 'node:fs/promises';

test('static solo export has complete relative dependencies and no server or QA files',async()=>{
 const build=spawnSync(process.execPath,['hosting/build-solo.mjs'],{encoding:'utf8'});assert.equal(build.status,0,build.stderr);
 process.env.PORT='0';const {server}=await import('../hosting/preview-solo.mjs');
 if(!server.listening)await new Promise(r=>server.once('listening',r));
 const base=`http://127.0.0.1:${server.address().port}/CryptoTowerDefende/`;
 try{
  const modules=await readdir('output/solo/src');
  assert.ok(!modules.some(x=>/^(qa|coop-client|coop-wire|perf-meter)\./.test(x)));
  for(const f of modules){
   const response=await fetch(base+'src/'+f);assert.equal(response.status,200,f);
   const code=await response.text();
   for(const m of code.matchAll(/(?:from\s*|import\s*)['"](\.\.?\/[^'"]+)['"]/g))assert.equal((await fetch(new URL(m[1],base+'src/'+f))).status,200,`${f}: ${m[1]}`);
   assert.doesNotMatch(code,/new WebSocket\(|fetch\(/,f);
  }
  for(const f of ['index.html','style.css','assets/favicon-64.png','assets/cursors/arrow.svg'])assert.equal((await fetch(base+f)).status,200);
  for(const f of ['coop.html','src/qa.js','package.json','.env','docs/references','../index.html'])assert.equal((await fetch(base+f)).status,404,f);
  const app=await readFile('output/solo/src/app.js','utf8');assert.doesNotMatch(app,/import\('\.\/qa.js'\)/);
  assert.equal(await readFile('output/solo/src/release-profile.js','utf8'),'export const SOLO_RELEASE=true;\n');
  const unlocks=await readFile('output/solo/src/unlocks.js','utf8');assert.match(unlocks,/DESERT_TEST_ACCESS=false/);assert.match(unlocks,/SPEED_TEST_ACCESS=false/);
 }finally{await new Promise(r=>server.close(r));}
});
