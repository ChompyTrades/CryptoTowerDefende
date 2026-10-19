import {desertTerrain} from './desert.js';
import {W,H,PATH,OBSTACLES} from './config.js';
import {pathDistance} from './game.js';
import {oval,line,poly,shape,round} from './draw.js';
let cached;
function bush(c,x,y,r){oval(c,x+4,y+9,r+7,r*.4,'#304a3a30',null);for(const [dx,dy,s] of [[-14,0,.62],[12,1,.65],[-4,-8,.85],[0,7,.7]])oval(c,x+dx*r/22,y+dy*r/22,r*s,r*s*.78,'#426c4b','#36583f',1.8);for(let i=0;i<5;i++)oval(c,x-10+i*4,y-7+(i%2)*4,3,1.5,'#719052',null);}
function pine(c,x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);oval(c,8,3,25,8,'#24433330',null);round(c,-4,-35,8,38,2,'#947650','#4a5237');for(const [v,w] of [[-12,28],[-27,22],[-43,15]]){shape(c,`M0 ${v-35} Q-6 ${v-10} ${-w} ${v} L-10 ${v-1} L-13 ${v+6} L2 ${v+3} L18 ${v+6} L13 ${v} L${w} ${v} Q9 ${v-14} 0 ${v-35}Z`,'#426b50','#304b3d',1.6);line(c,[[0,v-25],[-6,v-7],[-w+7,v-1]],'#618257',1.5);}c.restore();}
function rock(c,o){const {x,y,r}=o;oval(c,x+7,y+17,r+10,r*.45,'#34493030',null);poly(c,[[x-r,y+14],[x-r*.7,y-r*.6],[x-3,y-r],[x+r*.7,y-r*.45],[x+r,y+15],[x+7,y+20]],'#8f9b90','#53634f',2.5);poly(c,[[x-r*.7,y-r*.6],[x-3,y-r],[x+7,y-4],[x-r*.3,y+12]],'#bbc1a9',null);poly(c,[[x+7,y-4],[x+r*.7,y-r*.45],[x+r,y+15],[x+7,y+20]],'#788979',null);line(c,[[x-3,y-r],[x+7,y-4],[x+4,y+8]],'#657562',1.4);bush(c,x-r*.7,y+16,r*.45);oval(c,x+r-1,y+19,7,4,'#9aa889','#667b60',1.3);}
function sign(c,x,y,text){line(c,[[x-17,y],[x-17,y+24]],'#605540',7);line(c,[[x+21,y],[x+21,y+20]],'#605540',6);c.save();c.translate(x,y);c.rotate(-.07);round(c,-30,-15,69,29,3,'#ebd7a5','#4c4d35',2.5);line(c,[[-24,-10],[31,-10]],'#fff0c6',2);c.fillStyle='#494633';c.font='900 15px Segoe UI';c.fillText(text,-21,6);oval(c,-24,-7,1.3,1.3,'#796843',null);c.restore();}
export function terrain(mapId='grass'){if(mapId.startsWith('desert'))return desertTerrain(mapId);if(cached)return cached;cached=document.createElement('canvas');cached.width=W;cached.height=H;const c=cached.getContext('2d');let seed=1934;const rand=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
 const grass=c.createLinearGradient(0,0,0,H);grass.addColorStop(0,'#a8be75');grass.addColorStop(.6,'#9cb56b');grass.addColorStop(1,'#8eaa65');c.fillStyle=grass;c.fillRect(0,0,W,H);
 for(let i=0;i<85;i++){const x=rand()*W,y=rand()*H;oval(c,x,y,20+rand()*65,12+rand()*30,i%2?'#d0d98e17':'#557f4b10',null);}
 for(const [width,color] of [[66,'#668650'],[61,'#bdd38b'],[55,'#b39e6c'],[52,'#e4cc98'],[42,'#e9d3a2']]){c.beginPath();PATH.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.lineWidth=width;c.lineJoin='round';c.lineCap='round';c.strokeStyle=color;c.stroke();}
 for(let i=0;i<1500;i++){const x=rand()*W,y=rand()*H,d=pathDistance(x,y);if(d<20){if(i%4===0)oval(c,x,y,1+rand()*2.7,.6+rand()*1.1,'#bea16a55',null);}else if(d>34){const s=2+rand()*3;line(c,[[x-s,y],[x-1,y-4-s],[x,y],[x+3,y-3]],i%3?'#587e424a':'#dbe69c65',1);}}
 for(let i=0;i<25;i++){const x=rand()*W,y=70+rand()*555;if(pathDistance(x,y)<65||OBSTACLES.some(o=>Math.hypot(x-o.x,y-o.y)<o.r+35))continue;for(let j=0;j<3;j++){const dx=x+j*5,dy=y+j%2*5;line(c,[[dx,dy],[dx,dy+5]],'#5e8248',1);for(let k=0;k<5;k++)oval(c,dx+Math.cos(k*1.257)*2,dy+Math.sin(k*1.257)*2,1.7,1.7,'#f7efd3',null);oval(c,dx,dy,1,1,'#e8b55f',null);}}
 // Water and trees only occupy the already non-buildable perimeter.
 shape(c,'M0 675 Q80 648 165 674 T350 683 Q420 666 510 688 L600 700 L0 700Z','#72acb1','#547f7d',2);line(c,[[0,687],[42,679],[79,681]],'#c6e5d3',2);line(c,[[164,688],[212,693],[259,693]],'#c6e5d3',2);
 for(const o of OBSTACLES)rock(c,o);
 for(const [x,y,s] of [[25,64,.8],[100,25,.65],[285,30,.8],[470,39,.7],[835,28,.8],[1045,60,1.1],[1090,50,.9],[49,691,.8],[960,697,.9],[1085,700,1.1]])pine(c,x,y,s);
 for(const [x,y,r] of [[17,39,24],[178,20,27],[576,23,21],[976,20,30],[450,682,20],[700,681,27],[1005,688,28]])bush(c,x,y,r);
 sign(c,57,97,'IN →');sign(c,1020,655,'OUT →');line(c,[[1080,609],[1080,667]],'#56604a',4);shape(c,'M1082 609 Q1101 604 1100 615 L1100 638 Q1090 628 1082 635Z','#62acbe','#435f56');return cached;
}
