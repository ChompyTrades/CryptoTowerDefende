import {encodePacket} from './coop-packet.mjs';
import {cleanProgress} from '../src/coop-progress.js';
import {gameView,detachedView} from './coop-view.mjs';
import {availableDeals} from '../src/deals.js';
import {errorCode} from '../src/coop-messages.js';
import {persistentStore,secretHash,newProfile} from './coop-store.mjs';
import {statePatch,relativePatch} from '../src/coop-wire.js';
import {randomBytes} from 'node:crypto';
import {WebSocketServer} from 'ws';
import {createGame,action,advance,continueEndless,startWave} from '../src/game.js';
import {RULES} from '../src/config.js';

import {validatePlayerName} from '../src/coop-protocol.js';
export const safeName=validatePlayerName;
const fail=text=>{throw Object.assign(Error(text),{code:errorCode(text)});};
export function attachCoop(server,{testAccess=true,graceMs=90000,maxRooms=20,dataDir=null,bandwidth=null,compression=false,browserProgress=false}={}){
 let closed=false;
 const store=persistentStore(dataDir),saved=store.load(),profiles=new Map(saved.profiles),rooms=new Map(),wss=new WebSocketServer({noServer:true,maxPayload:4096,perMessageDeflate:compression?{threshold:512,serverNoContextTakeover:true,clientNoContextTakeover:true,zlibDeflateOptions:{level:1},concurrencyLimit:2}:false});
 for(const raw of saved.rooms){const r={...raw,damage:new Map(raw.damage),wire:null,resumeAt:0,events:[]};r.players=raw.players.map(p=>({...p,ws:null,token:null,replies:new Map(p.replies),expiry:Date.now()+7*86400000,ready:false}));if(r.game){r.game.paused=true;r.game.events=[];r.game.accumulator=0;}rooms.set(r.code,r);}
 function persist(){if(!dataDir)return;store.save({version:1,profiles:[...profiles],rooms:[...rooms.values()].map(r=>{const {wire,damage,...rest}=r;return {...rest,damage:[...damage],players:r.players.map(p=>{const {ws,token,replies,...safe}=p;return {...safe,tokenHash:p.tokenHash||secretHash(token),replies:[...replies]};})};})});}
 function profileFor(p){return p.profileHash?profiles.get(p.profileHash):null;}
 function remember(p,category,value){const profile=profileFor(p);if(profile&&!profile.known[category].includes(value))profile.known[category].push(value);}
 function updateProfile(p,cleared,map){const profile=profileFor(p);if(!profile||cleared<=(p.resetFloor??-1))return;profile.bestWave=Math.max(profile.bestWave,cleared);if(cleared>=40){profile.unlocks.five=true;if(map==='grass')profile.unlocks.desert=true;}if(cleared>=100)profile.unlocks.eight=true;p.unlocks={...profile.unlocks};}
 const metrics={messages:0,bytes:0,broadcasts:0,packedFrames:0};
 const send=(ws,data)=>{if(ws?.readyState===1){if(ws.bufferedAmount>2_000_000){ws.close(1013,'Slow connection');return;}const body=Buffer.isBuffer(data)||typeof data==='string'?data:JSON.stringify(data);if(bandwidth&&!bandwidth.take(Buffer.byteLength(body)+16,'ws')){ws.close(4009,'CTD test bandwidth limit reached');return;}ws.send(body,{compress:!Buffer.isBuffer(body)});metrics.messages++;metrics.bytes+=Buffer.byteLength(body);}};
 function note(r,kind,data={}){r.events.push({id:++r.eventId,kind,...data});if(r.events.length>80)r.events.shift();}
 function publicPlayer(p){return {id:p.id,name:p.name,slot:p.slot,credits:p.credits,ready:p.ready,connected:!!p.ws,performance:p.performance,unlocks:p.unlocks};}
 function snapshot(r){return {type:'state',code:r.code,host:r.host,status:r.status,tick:r.tick,map:r.map,testAccess,public:r.public!==false,auto:r.auto!==false,resumeIn:r.resumeAt?Math.max(0,(r.resumeAt-Date.now())/1000):0,players:r.players.map(publicPlayer),events:r.events,game:gameView(r.game)};}
 function broadcast(r){
  const recipients=r.players.filter(p=>p.ws);if(!recipients.length)return;
  const s=detachedView(snapshot(r));let patch,full,packedPatch,packedFull;
  for(const p of recipients){if(p.ws.hasSnapshot&&r.wire){if(p.ws.protocol==='ctd.v2'){if(!packedPatch){packedPatch=encodePacket(relativePatch(r.wire,statePatch(r.wire,s)));metrics.packedFrames++;}send(p.ws,packedPatch);}else{patch??=JSON.stringify(statePatch(r.wire,s));send(p.ws,patch);}}else{if(p.ws.protocol==='ctd.v2'){if(!packedFull){packedFull=encodePacket(s);metrics.packedFrames++;}send(p.ws,packedFull);}else{full??=JSON.stringify(s);send(p.ws,full);}}p.ws.hasSnapshot=true;}
  r.wire=s;metrics.broadcasts++;
 }

 function split(r,amount){if(!amount)return;const n=r.players.length,base=Math.floor(amount/n);for(const p of r.players)p.credits+=base;for(let i=0;i<amount%n;i++)r.players[(r.remainder++)%n].credits++;}
 function collect(r){const g=r.game;if(!g)return;split(r,g.credits);g.credits=0;for(const t of g.towers){const old=r.damage.get(t.id)||{damage:0,pops:0};const p=r.players.find(p=>p.id===t.owner);if(p){p.performance.damage+=t.performance.damage-old.damage;p.performance.pops+=t.performance.pops-old.pops;}r.damage.set(t.id,{damage:t.performance.damage,pops:t.performance.pops});}for(const e of g.events){note(r,'game',{event:e});if(e.startsWith('seen:'))for(const p of r.players)remember(p,'enemies',e.slice(5));}g.events=[];
 const cleared=g.phase==='prepare'||g.phase==='victory'?g.wave:g.wave-1;
 for(const p of r.players){updateProfile(p,cleared,r.map);if(profileFor(p))continue;if(cleared>=40){p.unlocks.five=true;if(r.map==='grass')p.unlocks.desert=true;}if(cleared>=100)p.unlocks.eight=true;}
 }
 function pauseIfAlone(r){if(r.game&&r.players.filter(p=>p.ws).length<2){r.game.paused=true;r.resumeAt=0;}}
 function remove(r,p,reason){if(!r.players.includes(p))return;if(p.ws){p.ws.player=null;p.ws.room=null;send(p.ws,{type:'left',reason});}r.players=r.players.filter(x=>x!==p);p.ws=null;pauseIfAlone(r);
 const heir=r.players.find(x=>x.ws)||r.players[0];if(!heir){rooms.delete(r.code);return;}if(r.host===p.id)r.host=heir.id;heir.credits+=p.credits;if(r.game)for(const t of r.game.towers)if(t.owner===p.id)t.owner=heir.id;note(r,'notice',{code:'left',args:{name:p.name,heir:heir.name}});broadcast(r);
 }
 function newPlayer(r,ws,name){if(r.status!=='lobby')fail('Partie läuft bereits.');if(r.players.length>=4)fail('Raum ist voll.');const slot=[0,1,2,3].find(i=>!r.players.some(p=>p.slot===i));const p={id:randomBytes(8).toString('hex'),token:randomBytes(32).toString('hex'),name:safeName(name),slot,credits:0,ready:false,ws,lastSeq:0,replies:new Map(),unlockImport:false,unlocks:{...(profiles.get(ws.profileHash)?.unlocks||{five:false,eight:false,desert:false})},profileHash:ws.profileHash,performance:{damage:0,pops:0},lastEmote:0};r.players.push(p);if(!r.host)r.host=p.id;return p;}
 function bind(ws,r,p){p.profileHash??=ws.profileHash;if(!p.token)p.token=randomBytes(32).toString('hex');p.tokenHash=secretHash(p.token);ws.room=r;ws.player=p;p.ws=ws;p.expiry=0;send(ws,{type:'session',code:r.code,player:p.id,token:p.token,nextSeq:p.lastSeq+1,profile:profileFor(p)});broadcast(r);}
 function requireHost(r,p){if(r.host!==p.id)fail('Nur der Gastgeber kann das.');}
 function execute(r,p,m){const g=r.game;
 if(m.type==='resetProfile'){const profile=profileFor(p);if(profile){profile.unlocks={five:false,eight:false,desert:false};profile.known={enemies:[],towers:[]};profile.bestWave=0;for(const room of rooms.values())for(const player of room.players)if(player.profileHash===p.profileHash){player.unlocks={...profile.unlocks};player.resetFloor=room.game?.wave??0;send(player.ws,{type:'profile',profile});}}return;}
 if(m.type==='leave'){remove(r,p);return;}
 if(m.type==='visibility'){requireHost(r,p);if(r.status!=='lobby')fail('Partie läuft.');r.public=m.value===true;return;}
 if(m.type==='kick'){requireHost(r,p);const target=r.players.find(x=>x.id===m.player);if(!target||target===p)fail('Ungültiger Spieler.');remove(r,target,'kicked');return;}
 if(m.type==='ready'){if(r.status!=='lobby')fail('Partie läuft.');p.ready=m.value===true;return;}
 if(m.type==='map'){requireHost(r,p);if(r.status!=='lobby'||!['grass','desert'].includes(m.map))fail('Karte ungültig.');if(m.map==='desert'&&!testAccess&&!p.unlocks.desert)fail('Schaffe Gras W40.');r.map=m.map;for(const x of r.players)x.ready=false;return;}
 if(m.type==='start'){requireHost(r,p);if(r.status!=='lobby'||!r.players.every(x=>x.ws&&x.ready))fail('Alle müssen verbunden und bereit sein.');if(r.players.length===1){const map=r.map;rooms.delete(r.code);p.ws.room=null;p.ws.player=null;r.players=[];return {mode:'solo',map};}r.game=createGame(91473,r.map);r.game.credits=0;r.game.coop=true;r.status='playing';r.damage.clear();r.events=[];for(const x of r.players){x.credits=0;x.performance={damage:0,pops:0};}split(r,RULES.startCredits);note(r,'notice',{code:'firstTower',args:{}});return;}
 if(m.type==='emote'){if(!['money','help','ready','thanks','boss','super'].includes(m.emote)||Date.now()-p.lastEmote<2000)fail('Emote bitte kurz warten.');p.lastEmote=Date.now();note(r,'emote',{player:p.id,emote:m.emote});return;}
 if(!g||r.status!=='playing')fail('Starte zuerst die Partie.');
 if(m.type==='auto'){requireHost(r,p);r.auto=m.value===true;return;}
 if(m.type==='wave'){requireHost(r,p);if(g.wave===0&&(!g.towers.length||g.countdown>0))fail('Ersten Turm platzieren.');if(!startWave(g))fail('Welle nicht bereit.');return;}
 if(m.type==='pause'){g.paused=true;r.resumeAt=0;note(r,'pause',{player:p.id});return;}
 if(m.type==='resume'){requireHost(r,p);if(r.players.filter(p=>p.ws).length<2)fail('Koop benötigt mindestens zwei verbundene Spieler.');if(g.paused&&!r.resumeAt)r.resumeAt=Date.now()+1500;return;}
 if(m.type==='speed'){if(![1,2,3,5,8].includes(m.value))fail('Tempo ungültig.');if(!testAccess&&((m.value===5&&!p.unlocks.five)||(m.value===8&&!p.unlocks.eight)))fail(m.value===8?'Schaffe W100 für ×8.':'Schaffe W40 für ×5.');g.speed=m.value;return;}
 if(m.type==='restart'){if(!['victory','defeat'].includes(g.phase))fail('Partie noch nicht beendet.');p.restart=true;if(r.players.every(x=>x.ws&&x.restart)){r.game=null;r.status='lobby';r.resumeAt=0;for(const x of r.players){x.restart=false;x.ready=false;}note(r,'notice',{code:'restartLobby',args:{}});}return;}
 if(m.type==='endless'){requireHost(r,p);if(!continueEndless(g))fail('Kein Sieg zum Fortsetzen.');r.resumeAt=Date.now()+1500;return;}
 if(['victory','defeat'].includes(g.phase))fail('Partie beendet.');
 if(m.type==='donate'){const to=r.players.find(x=>x.id===m.to);if(m.percent!==undefined&&![10,50,100].includes(m.percent))fail('Spende nicht möglich.');const n=m.percent!==undefined?Math.floor(p.credits*m.percent/100):m.amount==='all'?p.credits:m.amount;if(!to||to===p||!Number.isSafeInteger(n)||n<=0||n>p.credits)fail('Spende nicht möglich.');p.credits-=n;to.credits+=n;note(r,'donation',{from:p.id,to:to.id,amount:n,slot:p.slot,name:p.name});return;}
 if(!['place','upgrade','sell','target'].includes(m.type))fail('Unbekannter Befehl.');
 if(m.type!=='place'&&g.towers.find(t=>t.id===m.towerId)?.owner!==p.id)fail('Dieser Turm gehört einem Mitspieler.');
 if(m.type==='place'&&g.towers.length>=250)fail('Turmlimit erreicht.');
 g.credits=p.credits;const deal=availableDeals(g).length;let result;try{result=action(g,{type:m.type,id:m.towerId,tower:m.tower,x:m.x,y:m.y,mode:m.mode});p.credits=g.credits;}finally{g.credits=0;}
 if(!result.ok)fail(({funds:'Nicht genug Credits.',placement:'Hier kann kein Turm stehen.'})[result.error]||result.error);
 if(m.type==='place'){g.towers.find(t=>t.id===result.id).owner=p.id;note(r,'built',{tower:m.tower});for(const player of r.players)remember(player,'towers',m.tower);}
 if(availableDeals(g).length<deal)note(r,'notice',{code:'usedDeal',args:{name:p.name}});return result;
 }
 server.on('upgrade',(req,socket,head)=>{let ok=false;try{const host=req.headers.host;const origin=req.headers.origin;ok=(!bandwidth||!bandwidth.exhausted)&&req.url==='/coop'&&(!origin||new URL(origin).host===host)&&wss.clients.size<64;}catch{}if(!ok){socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');socket.destroy();return;}wss.handleUpgrade(req,socket,head,ws=>wss.emit('connection',ws,req));});
 wss.on('connection',ws=>{ws.alive=true;ws.on('pong',()=>ws.alive=true);ws.on('error',()=>{});let windowStart=Date.now(),count=0;const handshake=setTimeout(()=>{if(!ws.player)ws.close(1008,'Join timeout');},10000);
 ws.on('message',(data,binary)=>{let m;try{if(binary)fail('Nur JSON.');if(Date.now()-windowStart>1000){windowStart=Date.now();count=0;}if(++count>60){ws.close(1008,'Rate limit');return;}m=JSON.parse(data);if(!m||typeof m!=='object'||Array.isArray(m))fail('Ungültige Nachricht.');
 if(!ws.player){if(m.type==='profile'){handshake.refresh();let token=m.token;const valid=typeof token==='string'&&/^[a-f0-9]{64}$/.test(token);if(!valid||!profiles.has(secretHash(token))){token=randomBytes(32).toString('hex');profiles.set(secretHash(token),{...newProfile(),...(browserProgress?cleanProgress(m.progress):{})});}ws.profileHash=secretHash(token);send(ws,{type:'profile',token,profile:profiles.get(ws.profileHash)});return;}if(m.type==='list'){handshake.refresh();send(ws,{type:'rooms',rooms:[...rooms.values()].filter(r=>r.public!==false&&r.status==='lobby'&&r.players.length<4&&r.players.some(p=>p.ws)).map(r=>({code:r.code,map:r.map,host:r.players.find(p=>p.id===r.host)?.name||'Crew',count:r.players.length}))});return;}if(m.type==='create'){if(rooms.size>=maxRooms)fail('Alle Räume belegt.');safeName(m.name);const code=randomBytes(4).toString('hex').toUpperCase();const r={code,host:null,map:'grass',status:'lobby',game:null,players:[],tick:0,eventId:0,events:[],remainder:0,damage:new Map(),resumeAt:0};rooms.set(code,r);const p=newPlayer(r,ws,m.name);if(testAccess&&m.map==='desert')r.map='desert';bind(ws,r,p);}
 else if(m.type==='join'){const r=rooms.get(String(m.code).toUpperCase());if(!r)fail('Raum nicht gefunden.');bind(ws,r,newPlayer(r,ws,m.name));}
 else if(m.type==='reconnect'){const r=rooms.get(m.code),p=r?.players.find(x=>typeof m.token==='string'&&(x.tokenHash||secretHash(x.token))===secretHash(m.token));if(!p||p.ws||p.expiry<Date.now())fail('Wiederbeitritt nicht möglich. Öffne einen neuen Raum.');bind(ws,r,p);}
 else fail('Zuerst Raum beitreten.');clearTimeout(handshake);return;}
 const r=ws.room,p=ws.player;if(!Number.isSafeInteger(m.seq)||m.seq<1)fail('Befehlsnummer fehlt.');if(m.seq<=p.lastSeq){send(ws,p.replies.get(m.seq)||{type:'ack',seq:m.seq,ok:false,error:'Alter Befehl.',code:errorCode('Alter Befehl.')});return;}if(m.seq!==p.lastSeq+1)fail('Befehlsfolge unterbrochen. Bitte neu verbinden.');p.lastSeq=m.seq;
 let reply;try{reply={type:'ack',seq:m.seq,ok:true,result:execute(r,p,m)};}catch(e){reply={type:'ack',seq:m.seq,ok:false,error:e.message,code:e.code||errorCode(e.message)};}p.replies.set(m.seq,reply);if(p.replies.size>256)p.replies.delete(p.replies.keys().next().value);send(ws,reply);if(rooms.has(r.code))broadcast(r);
 }catch(e){send(ws,{type:'error',error:e.message,code:e.code||errorCode(e.message)});}});
 ws.on('close',()=>{clearTimeout(handshake);if(closed)return;const r=ws.room,p=ws.player;if(!p||p.ws!==ws)return;p.ws=null;p.expiry=Date.now()+graceMs;pauseIfAlone(r);if(r.game&&!r.players.some(x=>x.ws)){r.game.paused=true;r.resumeAt=0;for(const player of r.players)player.expiry=Date.now()+7*86400000;}if(r.host===p.id)r.host=r.players.find(x=>x.ws)?.id||p.id;note(r,'notice',{code:'disconnected',args:{name:p.name,seconds:Math.round(graceMs/1000)}});broadcast(r);});
 });
 let previous=performance.now(),broadcastTime=0;const costs=[];
 const timer=setInterval(()=>{const now=performance.now(),dt=Math.min(.1,(now-previous)/1000);previous=now;const began=performance.now();for(const r of rooms.values()){
 for(const p of [...r.players])if(!p.ws&&p.expiry<=Date.now())remove(r,p);
 if(!rooms.has(r.code))continue;const active=r.game&&r.players.filter(p=>p.ws).length>=2&&(r.resumeAt||(!r.game.paused&&(r.game.phase==='wave'||(r.game.phase==='prepare'&&r.game.towers.length))));if(!active)continue;r.tick++;
 if(r.game&&r.players.some(p=>p.ws)){if(r.resumeAt&&Date.now()>=r.resumeAt){r.game.paused=false;r.resumeAt=0;}advance(r.game,dt,r.auto!==false);collect(r);}
 if(now-broadcastTime>=1000/30)broadcast(r);
 }if(now-broadcastTime>=1000/30)broadcastTime=now;costs.push(performance.now()-began);if(costs.length>600)costs.shift();},1000/60);
 const saver=setInterval(()=>{try{persist();}catch{for(const r of rooms.values())note(r,'notice',{code:'saveFailed',args:{}});}},10000);
 const heartbeat=setInterval(()=>{for(const ws of wss.clients){if(!ws.alive){ws.terminate();continue;}ws.alive=false;ws.ping();}},15000);
 return {rooms,wss,costs,metrics,broadcast,snapshot,collect,profiles,persist,close(){if(closed)return;persist();closed=true;clearInterval(saver);clearInterval(timer);clearInterval(heartbeat);for(const ws of wss.clients)ws.terminate();wss.close();}};
}
