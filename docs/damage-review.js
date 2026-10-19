import {ENEMIES,enemyOrder} from '../src/config.js';
import {coin} from '../src/coins.js';
import {hypeStats} from '../src/hype.js';
const types=Object.keys(ENEMIES).filter(k=>!ENEMIES[k].boss).sort(enemyOrder),fractions=[1,.9,.78,.66,.54,.42,.30,.18,.05];
const row=k=>`<tr><td><b>${k}</b></td>${fractions.map(f=>`<td><canvas width="160" height="155" data-coin="${k}" data-health="${f}"></canvas></td>`).join('')}</tr>`;
document.querySelector('#rows').innerHTML='<tr><th colspan="10">Coins</th></tr>'+[...types,'HYPE III'].map(row).join('')+'<tr><th colspan="10">Bosse</th></tr>'+Object.keys(ENEMIES).filter(k=>ENEMIES[k].boss).sort(enemyOrder).map(row).join('');
function draw(cv,k,f){const mature=k==='HYPE III';if(mature)k='HYPE';const cfg=ENEMIES[k],h=mature?hypeStats(118):{hp:cfg.hp,r:cfg.r,phase:1};const c=cv.getContext('2d');c.clearRect(0,0,cv.width,cv.height);c.save();c.translate(cv.width/2,cv.height/2-8);const zoom=Math.min(1.8,43/h.r);c.scale(zoom,zoom);coin(c,{type:k,x:0,y:0,d:0,hp:h.hp*f,maxHp:h.hp,r:h.r,hypePhase:h.phase},0);c.restore();}
for(const cv of document.querySelectorAll('[data-coin]'))draw(cv,cv.dataset.coin,+cv.dataset.health);
const input=document.querySelector('#health');input.oninput=()=>{document.querySelector('#percent').textContent=input.value+' %';draw(document.querySelector('#live'),document.querySelector('#type').value,+input.value/100);};input.oninput();

document.querySelector('#type').onchange=input.oninput;
