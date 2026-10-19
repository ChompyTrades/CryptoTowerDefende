import {mascot} from './mascots.js';
import {oval,line,poly} from './draw.js';
export const EMOTES={super:{type:'PEPE',text:'Süper'},money:{type:'PENGU',text:'Credits bitte!'},help:{type:'PEPE',text:'Hilfe!'},ready:{type:'BONK',text:'Bereit!'},thanks:{type:'DOGE',text:'Danke!'},boss:{type:'SI',text:'Bossfokus!'}};
// Dedicated transparent illustrations built from the game's original mascot art.
export function drawEmote(c,id,width=240,height=220){const e=EMOTES[id];c.save();c.scale(width/240,height/220);c.translate(120,125);c.scale(2.2,2.2);mascot(c,e.type,0,0,1,id==='ready'?.32:id==='help'?.28:0,0);
 if(id==='super'){
 // Side-on fist: broad thumb on the LEFT, four curled fingers on the RIGHT.
 c.save();c.translate(4,3);
 poly(c,[[14,17],[29,20],[37,14],[38,-2],[34,-7],[23,-7],[22,-20],[20,-25],[14,-25],[11,-21],[12,-10],[8,-2],[9,11]],'#7aa65c','#293d2c',2);
 for(const y of [-3,2,7,12]){oval(c,31,y,8,3.6,'#86ab62','#293d2c',1.2);}
 line(c,[[15,-13],[16,-5],[22,-1],[23,10]],'#456843',1.4);
 oval(c,16,-22,3.5,2,'#a6c77d',null);c.restore();
 line(c,[[12,-30],[10,-35]],'#eecb65',2);line(c,[[29,-25],[34,-29]],'#eecb65',2);
 }
 if(id==='money'){for(const [x,y] of [[3,-19],[17,-17]]){oval(c,x,y,5,6,'#ffd765','#846030',1);c.fillStyle='#906326';c.font='bold 8px sans-serif';c.textAlign='center';c.fillText('$',x,y+3);}oval(c,-18,13,10,10,'#f5cb58','#795d36',1.5);c.fillStyle='#936831';c.font='bold 14px sans-serif';poly(c,[[-18,6],[-24,13],[-18,20],[-12,13]],'#936831',null);poly(c,[[-18,9],[-21,13],[-18,17],[-15,13]],'#f5cb58',null);}
 if(id==='help'){for(const [x,y] of [[-32,-32],[32,-34]]){poly(c,[[x,y-8],[x-3,y],[x+3,y]],'#85d4eb','#41666e',1);}c.fillStyle='#9b513d';c.font='bold 22px sans-serif';c.fillText('!',-36,-5);}
 if(id==='thanks'){c.save();c.translate(-30,-29);c.fillStyle='#d56867';c.strokeStyle='#6d463b';c.lineWidth=1.3;c.beginPath();c.moveTo(0,5);c.bezierCurveTo(-15,-5,-4,-14,0,-6);c.bezierCurveTo(5,-15,16,-5,0,5);c.fill();c.stroke();c.restore();line(c,[[-12,-20],[-5,-22],[0,-20]],'#473d2e',2);}
 if(id==='ready'){line(c,[[25,-35],[30,-28],[42,-43]],'#f5e8b5',5);line(c,[[25,-35],[30,-28],[42,-43]],'#608f4b',3);}
 if(id==='boss'){c.strokeStyle='#b65742';c.lineWidth=2;c.beginPath();c.arc(33,-29,11,0,Math.PI*2);c.stroke();for(const d of [-1,1]){line(c,[[33+d*7,-29],[33+d*16,-29]],'#b65742',2);line(c,[[33,-29+d*7],[33,-29+d*16]],'#b65742',2);}line(c,[[17,12],[31,-4],[40,-8]],'#397ba9',8);}
 c.restore();}
