import {ENEMIES,enemyOrder} from './config.js';
import {coin} from './coins.js';
export function mountTargetPicker(host,{tower,book,tr,choose}){
 const generic=['first','last','near','strong','boss'],modes=[...generic,...Object.keys(ENEMIES).filter(k=>!ENEMIES[k].boss).sort(enemyOrder)];
 const known=k=>generic.includes(k)||book.known(k),label=k=>known(k)?(generic.includes(k)?tr(k):k):'???';
 host.innerHTML='<button type="button" id="target" aria-haspopup="listbox" aria-expanded="false"><canvas width="38" height="38"></canvas><span></span><b>⌄</b></button><div class="target-options" role="listbox" aria-label="'+tr('target')+'" hidden></div>';
 const trigger=host.querySelector('#target'),list=host.querySelector('.target-options');trigger.setAttribute('aria-label',tr('target'));trigger.querySelector('span').textContent=label(tower.mode);
 function portrait(cv,k){const c=cv.getContext('2d');if(ENEMIES[k]&&known(k)){c.save();c.translate(19,18);c.scale(.42,.42);coin(c,{type:k,x:0,y:0,d:0,hp:ENEMIES[k].hp,maxHp:ENEMIES[k].hp},0);c.restore();}else{c.fillStyle=known(k)?'#dbc28b':'#aaa99e';c.strokeStyle='#535c50';c.lineWidth=2;c.beginPath();c.arc(19,18,13,0,Math.PI*2);c.fill();c.stroke();c.fillStyle='#394534';c.font='bold 18px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(known(k)?({first:'↑',last:'↓',near:'◎',strong:'◆',boss:'♛'})[k]:'?',19,18);}}
 portrait(trigger.querySelector('canvas'),tower.mode);
 for(const k of modes){const b=document.createElement('button');b.type='button';b.setAttribute('role','option');b.setAttribute('aria-selected',String(tower.mode===k));b.disabled=!known(k);b.innerHTML='<canvas width="38" height="38"></canvas><span></span>';b.querySelector('span').textContent=label(k);portrait(b.querySelector('canvas'),k);b.onclick=()=>{list.hidden=true;choose(k);};list.append(b);}
 const close=()=>{list.hidden=true;trigger.setAttribute('aria-expanded','false');};
 trigger.onclick=()=>{list.hidden=!list.hidden;trigger.setAttribute('aria-expanded',String(!list.hidden));if(!list.hidden){const r=trigger.getBoundingClientRect(),height=Math.min(list.scrollHeight+4,innerHeight-20),width=Math.min(280,innerWidth-20);list.style.width=width+'px';list.style.maxHeight=height+'px';list.style.left=Math.max(10,Math.min(innerWidth-width-10,r.right-width))+'px';list.style.top=Math.max(10,Math.min(innerHeight-height-10,r.top>=height+10?r.top-height-5:r.bottom+5))+'px';list.querySelector('[aria-selected="true"]:not(:disabled)')?.focus({preventScroll:true});}};
 host.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();close();trigger.focus();}if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();const buttons=[...list.querySelectorAll('button:not(:disabled)')];let i=buttons.indexOf(document.activeElement);i=e.key==='Home'?0:e.key==='End'?buttons.length-1:(i+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length;buttons[i].focus();}});
 host.closest('#selection').onscroll=close;return close;
}
