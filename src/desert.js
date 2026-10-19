import {MAPS} from './maps.js';
import {oval,line,poly,shape,round} from './draw.js';
const cache={};
function cactus(c,x,y,s){c.save();c.translate(x,y);c.scale(s,s);oval(c,5,4,17,5,'#62473130',null);line(c,[[-14,-24],[-14,-11],[0,-11],[0,0],[0,-44]],'#456953',13);line(c,[[0,-20],[13,-20],[13,-36]],'#456953',10);line(c,[[0,-39],[0,-3]],'#9baa6c',2);line(c,[[-14,-22],[-14,-14]],'#9baa6c',2);c.restore();}
export function desertTerrain(mapId='desert'){
 if(cache[mapId])return cache[mapId];const cached=document.createElement('canvas');cache[mapId]=cached;cached.width=1100;cached.height=700;const c=cached.getContext('2d'),m=MAPS[mapId];
 let seed=929;const rand=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
 const sky=c.createLinearGradient(0,0,0,700);sky.addColorStop(0,'#d8a26e');sky.addColorStop(.5,'#d29a65');sky.addColorStop(1,'#c58858');c.fillStyle=sky;c.fillRect(0,0,1100,700);
 for(let i=0;i<180;i++){const x=rand()*1100,y=rand()*700;line(c,[[x,y],[x+12+rand()*32,y-3]],i%2?'#f4c99240':'#99684626',1.2);}
 for(const [w,color] of [[65,'#a3704d'],[60,'#e6b17c'],[53,'#c48d5c'],[49,'#f0c795'],[37,'#f4d1a3']]){line(c,m.path,color,w);}
 for(let i=0;i<330;i++)oval(c,rand()*1100,rand()*700,1+rand()*2,1,'#865f4130',null);
 for(const [i,o] of m.obstacles.entries()){
  const {x,y,r}=o;oval(c,x+7,y+12,r+10,r*.5,'#63492f30',null);
  if(i===1){oval(c,x,y,r,r*.65,'#83a486','#866a44',3);oval(c,x,y-3,r-9,r*.43,'#74b7ba','#4a888d');line(c,[[x-20,y-8],[x,y-10],[x+12,y-8]],'#cef0d8',2);cactus(c,x+37,y+12,.8);continue;}
  if(i===2){c.save();c.translate(x,y);c.rotate(-.35);round(c,-29,-15,56,31,3,'#a17750','#5a4938',3);for(let q=-22;q<30;q+=11)line(c,[[q,-12],[q,12]],'#d6a470',2);oval(c,-22,18,12,12,'#765b40','#493e31',3);oval(c,24,17,12,12,'#765b40','#493e31',3);line(c,[[-23,7],[-23,28]],'#c89d69',2);line(c,[[-34,18],[-11,18]],'#c89d69',2);line(c,[[29,-7],[47,-10]],'#6d5137',5);c.restore();continue;}
  poly(c,[[x-r,y+12],[x-r*.75,y-r*.6],[x-r*.2,y-r],[x+r*.65,y-r*.65],[x+r,y+10],[x,y+18]],'#b97955','#80563e',2.5);
  poly(c,[[x-r*.75,y-r*.6],[x-r*.2,y-r],[x+r*.65,y-r*.65],[x,y-4]],'#d49a6e',null);line(c,[[x-r*.7,y+1],[x+r*.7,y-3]],'#efb582',2);
 }
 for(const [x,y,s] of [[33,88,1],[1068,150,1.1],[420,46,.7],[750,683,.9],[200,665,.8],[1040,680,1],[20,600,.75]])cactus(c,x,y,s);
 for(const [x,y,label] of [[52,91,'IN →'],[1000,605,'OUT →']]){line(c,[[x,y],[x-2,y+30]],'#69533b',6);c.save();c.translate(x,y);c.rotate(-.09);round(c,-28,-13,70,26,3,'#e9c38b','#6b513c',2);c.font='900 14px Segoe UI';c.fillStyle='#533f30';c.fillText(label,-22,6);c.restore();}
 return cached;
}
// Real wall time, never simulation time: one eight-second roll every 45 seconds.
export function tumbleweedPosition(seconds){const t=((seconds%45)+45)%45;return t<8?{x:100+t*92,y:658-Math.sin(t*Math.PI)*3,angle:t*2}:null;}
export function tumbleweed(c,seconds){const p=tumbleweedPosition(seconds);if(!p)return;c.save();c.translate(p.x,p.y);oval(c,4,13,19,4,'#70493225',null);c.rotate(p.angle);for(let i=0;i<5;i++){c.rotate(.65);oval(c,0,0,16,8,null,'#8c683f',1.4);line(c,[[-17,3],[-4,-4],[16,2]],'#ad8750',1.3);}c.restore();}
