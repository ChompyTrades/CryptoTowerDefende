import {createLocalServer} from '../server.mjs';
import {WebSocket} from 'ws';
import {createGame,startWave,action,validPlacement,spawn} from '../src/game.js';
import {TOWERS} from '../src/config.js';
import {applyStatePatch} from '../src/coop-wire.js';
import {writeFileSync} from 'node:fs';
import {monitorEventLoopDelay} from 'node:perf_hooks';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const rows=[];
for(const compressed of [false,true])for(const count of [1,3])for(const speed of [1,8]){
 const {server,coop}=createLocalServer({compression:compressed});await new Promise(r=>server.listen(0,'127.0.0.1',r));const clients=[];
 const connect=async message=>{const ws=new WebSocket('ws://127.0.0.1:'+server.address().port+'/coop');const c={ws,state:null};clients.push(c);ws.on('message',d=>{const m=JSON.parse(d);if(m.type==='session')c.session=m;if(m.type==='state'||m.type==='patch')c.state=applyStatePatch(c.state,m);});await new Promise(r=>ws.once('open',r));ws.send(JSON.stringify(message));for(let i=0;!c.session&&i<200;i++)await sleep(5);if(!c.session)throw Error('Handshake timeout');return c;};
 for(let j=0;j<count;j++){
  const a=await connect({type:'create',name:'Load '+j});for(let i=1;i<4;i++)await connect({type:'join',name:'Player '+i,code:a.session.code});
  const r=coop.rooms.get(a.session.code),g=createGame();r.game=g;r.status='playing';g.credits=1e9;g.lives=1e9;g.endless=true;let n=0;const types=Object.keys(TOWERS);
  for(let y=100;y<620&&n<28;y+=60)for(let x=70;x<1040&&n<28;x+=60)if(validPlacement(g,x,y)){action(g,{type:'place',tower:types[n++%types.length],x,y});g.towers.at(-1).level=2;g.towers.at(-1).owner=r.players[n%4].id;}
  g.wave=114;startWave(g);g.speed=speed;
  // Deliberately crowded stress case, not a naturally occurring wave or balance test.
  for(let i=0;i<100;i++)spawn(g,['LINK','ZEC','HYPE','ETH'][i%4]);
 }
 await sleep(250);const initialBytes=clients.reduce((s,c)=>s+c.ws._socket.bytesRead,0),initialCpu=process.cpuUsage(),t=performance.now(),delay=monitorEventLoopDelay({resolution:10});delay.enable();coop.costs.length=0;
 await sleep(2000);const seconds=(performance.now()-t)/1000,cpu=process.cpuUsage(initialCpu),wire=clients.reduce((s,c)=>s+c.ws._socket.bytesRead,0)-initialBytes;delay.disable();const costs=coop.costs.toSorted((a,b)=>a-b);
 rows.push({compressed,rooms:count,players:clients.length,speed,KBpsPerPlayer:Math.round(wire/seconds/clients.length/1000*10)/10,cpuPercentOneLocalCore:Math.round((cpu.user+cpu.system)/seconds/10000),tickP95ms:+(costs[Math.floor(costs.length*.95)]||0).toFixed(2),loopP95ms:+(delay.percentile(95)/1e6).toFixed(2),rssMB:Math.round(process.memoryUsage().rss/1e6),verifiedClients:clients.filter(c=>c.state?.game?.towers.length===28).length});
 for(const c of clients)c.ws.terminate();coop.close();await new Promise(r=>server.close(r));
}
writeFileSync('output/coop-load.json',JSON.stringify({date:new Date().toISOString(),note:'Local process includes server AND 4/12 clients decoding. 28 towers + 100 injected coins per room, wave115, 2-second samples. NOT Render CPU capacity.',rows},null,2));console.table(rows);
