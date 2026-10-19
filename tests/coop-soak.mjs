import {decodeNodePacket} from '../server/coop-packet.mjs';
import {fork} from 'node:child_process';
import {WebSocket} from 'ws';
import {applyStatePatch} from '../src/coop-wire.js';
import {writeFileSync} from 'node:fs';
const args=Object.fromEntries(process.argv.slice(2).map(v=>v.split('='))),duration=Number(args.seconds||180),count=Number(args.rooms||3),crowd=Number(args.crowd||100),wave=Number(args.wave||150),towerCount=Number(args.towers||56),speed=Number(args.speed||8),playerCount=Number(args.players||4);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const child=fork(new URL('./coop-soak-server.mjs',import.meta.url),{stdio:['ignore','inherit','inherit','ipc']}),messages=[];child.on('message',m=>messages.push(m));
const wait=async type=>{for(let i=0;i<1000;i++){const at=messages.findIndex(m=>m.type===type);if(at>=0)return messages.splice(at,1)[0];if(child.exitCode!==null)throw Error('Server exited');await sleep(10);}throw Error('IPC timeout '+type);};
const clients=[],samples=[];let parseErrors=0;
try{
 const {port}=await wait('ready');
 const connect=async message=>{const ws=new WebSocket('ws://127.0.0.1:'+port+'/coop',args.legacy==='1'?[]:['ctd.v2']);const c={ws,states:0};clients.push(c);ws.on('message',(d,binary)=>{try{const m=decodeNodePacket(d,binary);if(m.type==='session')c.session=m;if(m.type==='state'||m.type==='patch'){c.state=applyStatePatch(c.state,m);c.states++;}}catch{parseErrors++;}});await new Promise((r,j)=>{ws.once('open',r);ws.once('error',j);});ws.send(JSON.stringify(message));for(let i=0;!c.session&&i<500;i++)await sleep(10);if(!c.session)throw Error('session timeout');return c;};
 for(let r=0;r<count;r++){const a=await connect({type:'create',name:'Soak '+r});for(let i=1;i<playerCount;i++)await connect({type:'join',code:a.session.code,name:'Guest '+i});}
 child.send({type:'scene',speed,wave,crowd,towers:towerCount});await wait('started');const base=clients.reduce((s,c)=>s+c.ws._socket.bytesRead,0),start=performance.now();
 while(performance.now()-start<duration*1000){await sleep(Math.min(10000,duration*1000-(performance.now()-start)));child.send({type:'metrics'});const m=await wait('metrics');samples.push(m);console.log(JSON.stringify({seconds:Math.round(m.seconds),serverCPU:+m.cpuPercent.toFixed(1),rssMB:+m.rssMB.toFixed(1),tickP95ms:+m.tickP95ms.toFixed(2),rooms:m.rooms}));}
 const seconds=(performance.now()-start)/1000,bytes=clients.reduce((s,c)=>s+c.ws._socket.bytesRead,0)-base;
 const result={date:new Date().toISOString(),note:'Server isolated in child process. Configured-speed repeated designated wave; crowd is maintained artificially with 30x HP, not normal balancing. Real compressed WebSocket clients. No browser rendering in this measurement.',seconds,speed,rooms:count,players:clients.length,wave,crowd,towers:towerCount,parseErrors,connected:clients.filter(c=>c.ws.readyState===1).length,states:clients.map(c=>c.states),KBpsPerPlayer:bytes/seconds/clients.length/1000,samples};
 writeFileSync('output/'+(args.name||'coop-soak')+'.json',JSON.stringify(result,null,2));console.log('Saved '+(args.name||'coop-soak')+'; '+result.KBpsPerPlayer.toFixed(1)+' KB/s/player; errors '+parseErrors);
 if(parseErrors||result.connected!==count*playerCount)process.exitCode=1;
}finally{for(const c of clients)c.ws.terminate();child.send({type:'stop'});}
