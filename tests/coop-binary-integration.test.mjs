import test from 'node:test';
import assert from 'node:assert/strict';
import {WebSocket} from 'ws';
import {createLocalServer} from '../server.mjs';
import {createGame} from '../src/game.js';
import {applyStatePatch} from '../src/coop-wire.js';
import {decodeNodePacket} from '../server/coop-packet.mjs';
import {detachedView} from '../server/coop-view.mjs';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
test('one packed update per room serves three v2 clients plus legacy; reconnect gets full state',async t=>{
 const {server,coop}=createLocalServer({compression:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));const clients=[];
 t.after(async()=>{for(const c of clients)c.ws.terminate();coop.close();await new Promise(r=>server.close(r));});
 async function connect(protocol,message){
  const ws=new WebSocket('ws://127.0.0.1:'+server.address().port+'/coop',protocol?['ctd.v2']:[]),c={ws,errors:[]};clients.push(c);
  c.until=async predicate=>{for(let i=0;i<200;i++){if(predicate())return;await wait(5);}throw Error('Client timeout');};
  ws.on('message',(data,binary)=>{try{const m=decodeNodePacket(data,binary);if(m.type==='session')c.session=m;if(m.type==='state'||m.type==='patch')c.state=applyStatePatch(c.state,m);}catch(e){c.errors.push(e);}});
  await new Promise(r=>ws.once('open',r));ws.send(JSON.stringify(message));await c.until(()=>c.session&&c.state);return c;
 }
 const a=await connect(true,{type:'create',name:'A'}),r=coop.rooms.get(a.session.code);
 for(let i=0;i<3;i++)await connect(i<2,{type:'join',code:r.code,name:'Guest '+i});
 r.game=createGame();r.game.paused=true;r.status='playing';coop.broadcast(r);await clients[0].until(()=>clients.every(c=>c.state.game));
 for(let i=0;i<20;i++){
  const count=coop.metrics.packedFrames;r.tick++;r.game.elapsed+=.125;coop.broadcast(r);await a.until(()=>clients.every(c=>c.state.tick===r.tick));
  assert.equal(coop.metrics.packedFrames-count,1);
  for(const c of clients){assert.deepEqual(c.state,detachedView(coop.snapshot(r)));assert.deepEqual(c.errors,[]);}
 }
 const old=a.session;await new Promise(resolve=>{a.ws.once('close',resolve);a.ws.close();});await wait(10);
 const rejoined=await connect(true,{type:'reconnect',code:r.code,token:old.token});assert.equal(rejoined.session.player,old.player);assert.deepEqual(rejoined.state,detachedView(coop.snapshot(r)));
});
