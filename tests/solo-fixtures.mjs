// Explicit synthetic browser QA states. Never part of output/solo.
import {writeFile} from 'node:fs/promises';
import {createGame,action,serialize,startWave,settle} from '../src/game.js';
import {TOWERS} from '../src/config.js';
const cases={};
const victory=createGame();victory.wave=39;startWave(victory);victory.queue=[];settle(victory);cases.Victory=serialize(victory,{});
const defeat=createGame();defeat.wave=9;defeat.lives=1;cases.Defeat=serialize(defeat,{});
const desert=createGame(91473,'desert');cases.Desert=serialize(desert,{});
const towers=createGame();towers.credits=100000;
for(const tower of Object.keys(TOWERS)){
 outer:for(let y=80;y<650;y+=50)for(let x=80;x<1000;x+=50)if(action(towers,{type:'place',tower,x,y}).ok)break outer;
}
cases.Towers=serialize(towers,{});cases.Invalid='{bad json';
await writeFile('output/solo-fixtures.html',`<!doctype html><title>LOCAL QA fixtures</title><h1>Synthetic browser tests — not a balance run</h1><p>Only writes to this isolated preview origin. Not included in the release.</p>${Object.keys(cases).map(k=>`<button data-case="${k}">${k}</button>`).join('')}<script>const cases=${JSON.stringify(cases)};document.querySelectorAll('button').forEach(b=>b.onclick=()=>{localStorage.clear();localStorage.setItem('ctd.save.v4',cases[b.dataset.case]);localStorage.setItem('ctd.settings.v1',JSON.stringify({lang:'en',auto:false}));location.href='/CryptoTowerDefende/';});</script>`);
