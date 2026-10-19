// Manual browser load fixture, local only. Never part of the hosted export.
import {createLocalServer} from '../server.mjs';
import {action,validPlacement,startWave} from '../src/game.js';
import {TOWERS} from '../src/config.js';
const {server,coop}=createLocalServer({compression:true});
const timer=setInterval(()=>{for(const r of coop.rooms.values())if(r.game&&!r.browserFixture){r.browserFixture=true;const g=r.game;g.credits=1e9;g.lives=1e9;g.endless=true;let n=0;const types=Object.keys(TOWERS);for(let y=85;y<625&&n<56;y+=50)for(let x=45;x<1055&&n<56;x+=50)if(validPlacement(g,x,y)){action(g,{type:'place',tower:types[n++%7],x,y});g.towers.at(-1).level=2;g.towers.at(-1).owner=r.players[n%r.players.length].id;}g.credits=0;g.wave=198;startWave(g);g.speed=8;}},50);
process.on('SIGINT',()=>{clearInterval(timer);coop.close();server.close(()=>process.exit(0));});
server.listen(4176,'127.0.0.1',()=>console.log('LOCAL LOAD FIXTURE ONLY: http://127.0.0.1:4176/coop.html?perf=1'));
