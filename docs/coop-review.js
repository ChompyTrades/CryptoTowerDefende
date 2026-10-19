import {PLAYER_STYLES,coopTower} from '../src/coop-art.js';
import {TOWERS,towerName,ENEMIES} from '../src/config.js';
import {terrain} from '../src/terrain.js';
import {coin} from '../src/coins.js';
let level=0;
const grid=document.querySelector('.coop-grid'),dialog=document.querySelector('#detail');
document.querySelector('.players').innerHTML=PLAYER_STYLES.map(p=>`<div class="player" style="--color:${p.color}">${p.code} · ${p.name}</div>`).join('');
function draw(){grid.innerHTML=Object.keys(TOWERS).flatMap(type=>PLAYER_STYLES.map((p,i)=>`<button class="coop-card" data-type="${type}" data-player="${i}"><canvas width="175" height="190"></canvas><strong>${towerName(type)}</strong><small>${p.code} · Stufe ${level+1}</small></button>`)).join('');for(const b of grid.children){coopTower(b.querySelector('canvas').getContext('2d'),b.dataset.type,87,83,1.45,level,+b.dataset.player);b.onclick=()=>{document.querySelector('#detailBody').innerHTML=`<h2>${towerName(b.dataset.type)} · ${PLAYER_STYLES[b.dataset.player].code}</h2><canvas width="340" height="320"></canvas><p>Nur der Besitzer kann verbessern, verkaufen oder den Zielmodus ändern. Mitspieler sehen Werte und Besitzername.</p>`;coopTower(dialog.querySelector('canvas').getContext('2d'),b.dataset.type,170,140,2.4,level,+b.dataset.player);dialog.showModal();};}
const cv=document.querySelector('#mapPreview'),c=cv.getContext('2d');c.drawImage(terrain(),0,0);for(const [type,x,y,p] of [['PENGU',330,278,0],['PEPE',600,220,1],['BONK',725,245,2],['SI',990,440,3],['POPCAT',530,490,0],['SNEK',260,510,1],['DOGE',65,420,2]])coopTower(c,type,x,y,1,level,p);
}
document.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>{level=+b.dataset.level;document.querySelectorAll('[data-level]').forEach(v=>v.classList.toggle('active',v===b));draw();});document.querySelector('#close').onclick=()=>dialog.close();dialog.onclick=e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();};draw();
const c=document.querySelector('#quantPortrait').getContext('2d');c.save();c.translate(180,175);c.scale(2.2,2.2);coin(c,{type:'QUANT',x:0,y:0,d:0,hp:ENEMIES.QUANT.hp,maxHp:ENEMIES.QUANT.hp},0);c.restore();
