import {PLAYER_STYLES} from './coop-art.js';
import {tumbleweed} from './desert.js';
import {W,H,TOWERS} from './config.js';
import {stats,validPlacement,price} from './game.js';
import {terrain} from './terrain.js';
import {mascot} from './mascots.js';
import {coin} from './coins.js';
import {oval,line,poly,star,clamp} from './draw.js';
export {mascot};
export function range(c,x,y,r,ok){c.save();const color=ok==='funds'?'#9b7410':ok?'#fff9d5c9':'#b6413c';c.fillStyle=ok==='funds'?'#a77c153d':ok?'#fffce21c':'#d6444433';c.strokeStyle=color;c.lineWidth=2;c.setLineDash([7,6]);c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();c.stroke();c.setLineDash([]);oval(c,x,y+23,29,10,'#fff4b024',color,2.5);c.restore();}
function effect(c,f){const v=clamp(1-f.ttl/f.max),level=f.level||0;c.save();
 if(['snow','bubble','spit'].includes(f.kind)){
  const p=Math.min(1,v/.82),x=f.x+(f.tx-f.x)*p,y=f.y+(f.ty-f.y)*p-(f.kind==='spit'?Math.sin(p*Math.PI)*23:f.kind==='snow'?Math.sin(p*Math.PI)*12:0),r=(f.kind==='bubble'?9:6)+level*2;
  if(v>.82){c.globalAlpha=(1-v)/.18;c.strokeStyle=f.kind==='spit'?'#c097db':f.kind==='snow'?'#f6ffff':'#aff5f6';c.lineWidth=2;c.beginPath();c.arc(f.tx,f.ty,r+(v-.82)*60,0,Math.PI*2);c.stroke();for(let i=0;i<5;i++){const a=i*1.257,d=r+v*5;oval(c,f.tx+Math.cos(a)*d,f.ty+Math.sin(a)*d,2,2,c.strokeStyle,null);}}
  else{for(let i=3;i>0;i--){const q=Math.max(0,p-i*.08);c.globalAlpha=.4-i*.08;oval(c,f.x+(f.tx-f.x)*q,f.y+(f.ty-f.y)*q-(f.kind==='spit'?Math.sin(q*Math.PI)*23:0),Math.max(1,r-i*2),Math.max(1,r-i*2),f.kind==='spit'?'#b486cb':'#e0f6f7',null);}c.globalAlpha=1;
   if(f.kind==='spit'){c.translate(x,y);c.rotate(Math.atan2(f.ty-f.y,f.tx-f.x));oval(c,0,0,r+4,r*.65,'#ad7bc8','#70588c',1.5);oval(c,-2,-2,3,1.5,'#e1bddf',null);}
   else if(f.kind==='snow'){oval(c,x,y,r,r,'#edfafa','#a1c9d4',1.6);oval(c,x-2,y-2,r*.45,r*.32,'#ffffff',null);}
   else{oval(c,x,y,r,r,'#82d2dc88','#edffff',2);c.strokeStyle='#bef5ec';c.lineWidth=2;c.beginPath();c.arc(x,y,r-3,3.7,5.1);c.stroke();oval(c,x-3,y-3,2.7,1.7,'#fff8e7',null);}
  }
 }else if(f.kind==='swallow'){const p=Math.min(1,v/.82)**1.5;c.globalAlpha=1;for(let i=0;i<3;i++){const q=(v*1.6+i/3)%1;const x=f.x+(f.tx-f.x)*q,y=f.y+(f.ty-f.y)*q;oval(c,x,y,5*(1-q)+1,2,'#fff5cc88',null);}const x=f.x+(f.tx-f.x)*p,y=f.y+(f.ty-f.y)*p-Math.sin(v*Math.PI)*10,s=v<.5?1:Math.max(.02,1-(v-.5)*2);c.translate(x,y);c.rotate(Math.sin(v*Math.PI)*.3);c.scale(s,s);coin(c,{...f.enemy,x:0,y:0},0);}
 else if(f.kind==='laser'){const colors=['#f57d5c','#f5c263','#8cdeee'];c.strokeStyle=colors[level];c.shadowColor=colors[level];c.shadowBlur=6+level*3;line(c,[[f.x,f.y],[f.tx,f.ty]],colors[level],3+level*2);c.shadowBlur=0;line(c,[[f.x,f.y],[f.tx,f.ty]],'#fff8d1',1+level*.5);star(c,f.tx,f.ty,5+level*2,'#fff4c0');}
 else if(f.kind==='cone'){c.strokeStyle=f.color;c.lineWidth=3+level;for(let i=0;i<3;i++){const progress=clamp(v*1.3-i*.16);if(!progress)continue;c.globalAlpha=(1-progress)*.95;c.beginPath();c.arc(f.x,f.y,12+progress*(f.range-10),f.angle-.65,f.angle+.65);c.stroke();}if(v<.3){c.globalAlpha=.5;star(c,f.x,f.y,8,'#fff9d9');}}
 else if(f.kind==='hammer'){c.globalAlpha=1-v;c.strokeStyle='#fff0b8';c.lineWidth=3;c.beginPath();c.ellipse(f.x,f.y,10+v*35,5+v*16,0,0,Math.PI*2);c.stroke();for(let i=0;i<7;i++){const a=i*.897,d=10+v*30;line(c,[[f.x+Math.cos(a)*d,f.y+Math.sin(a)*d*.6],[f.x+Math.cos(a)*(d+9),f.y+Math.sin(a)*(d+9)*.6]],'#f9e4a2',3);}star(c,f.x,f.y,16*(1-v),'#fff4d3');}
 else if(f.kind==='bite'){c.globalAlpha=1-v;for(const dir of [-1,1]){poly(c,[[f.x-8,f.y+dir*(12-v*8)],[f.x,f.y+dir*(4-v*4)],[f.x+8,f.y+dir*(12-v*8)]],'#fff5da','#807459',1);}}
 else{c.globalAlpha=1-v;for(let i=0;i<7;i++){const a=i*.897,d=v*28;const x=f.x+Math.cos(a)*d,y=f.y+Math.sin(a)*d+v*v*12;poly(c,[[x,y],[x+5,y+2],[x+2,y+7]],f.color||'#ebc780','#fff4cb',.7);}}
 c.restore();}
export function render(c,g,selected,placing,pointer){c.clearRect(0,0,W,H);c.drawImage(terrain(g.mapId),0,0);if(g.mapId?.startsWith('desert'))tumbleweed(c,performance.now()/1000);const selectedTower=g.towers.find(t=>t.id===selected);if(selectedTower)range(c,selectedTower.x,selectedTower.y,stats(selectedTower).range,true);
 for(const p of g.puddles){c.save();c.globalAlpha=Math.min(.75,p.ttl);c.beginPath();for(let i=0;i<=20;i++){const a=i*Math.PI/10,r=1+Math.sin(i*3+1)*.1;const x=p.x+Math.cos(a)*37*r,y=p.y+Math.sin(a)*23*r;i?c.lineTo(x,y):c.moveTo(x,y);}c.fillStyle=['#9278b9','#956bc2','#a368bf'][p.level||0];c.fill();c.strokeStyle='#68587c';c.lineWidth=1.5;c.stroke();for(let i=0;i<3;i++){const phase=(g.elapsed*.9+i*.37)%1;oval(c,p.x-18+i*17,p.y-3+Math.sin(i*4)*5,2+phase*3,1+phase*2,'#c6a6da77','#d7bae480',1);}c.restore();}
 for(const e of g.enemies)if(e.linked&&e.id<e.linked){const mate=g.enemies.find(v=>v.id===e.linked);if(mate){c.save();c.setLineDash([3,5]);line(c,[[e.x,e.y+17],[mate.x,mate.y+17]],'#c2def8',2);c.restore();}}
 const actors=[...g.enemies.map(e=>({y:e.y,enemy:e})),...g.towers.map(t=>({y:t.y,tower:t}))].sort((a,b)=>a.y-b.y);for(const a of actors)if(a.enemy)coin(c,a.enemy,g.elapsed);else{const t=a.tower;if(g.coop){const p=g.players.find(p=>p.id===t.owner),style=PLAYER_STYLES[p?.slot??0];oval(c,t.x,t.y+25,36,11,null,style.color,5);c.font='bold 11px Segoe UI';c.textAlign='center';c.fillStyle='#20372b';c.fillText(style.code,t.x,t.y+45);}mascot(c,t.type,t.x,t.y,.95,t.attack,t.level,t.angle,{cooldown:t.cooldown,digest:stats(t).digest});}
 for(const fx of g.effects)effect(c,fx);
 if(placing&&pointer){const state=!validPlacement(g,pointer.x,pointer.y)?false:g.credits<price(g,placing)?'funds':true,ok=state===true;range(c,pointer.x,pointer.y,TOWERS[placing].levels[0].range,state);c.save();c.globalAlpha=.7;mascot(c,placing,pointer.x,pointer.y,.95);c.restore();if(!ok){const x=pointer.x+23,y=pointer.y-25;oval(c,x,y,10,10,'#fff0d9','#a94237',2);line(c,[[x-4,y-4],[x+4,y+4]],'#a94237',3);line(c,[[x+4,y-4],[x-4,y+4]],'#a94237',3);}}
}
