import {oval,round,INK} from './draw.js';
import {mascot} from './mascots.js';
export const PLAYER_STYLES=[{name:'Grün',color:'#73bb69',code:'P1'},{name:'Blau',color:'#65aee5',code:'P2'},{name:'Rot',color:'#e77865',code:'P3'},{name:'Gelb',color:'#e9c851',code:'P4'}];
// Visual proposal only. Ownership, networking and permission checks are separate work.
export function coopTower(c,type,x,y,scale=1,level=0,player=0){const owner=PLAYER_STYLES[player];c.save();c.translate(x,y);c.scale(scale,scale);
 oval(c,0,26,39,13,'#30443430',INK,3);oval(c,0,25,36,10,null,owner.color,5);oval(c,0,24,32,7,null,'#fff5d488',1);
 mascot(c,type,0,0,1,0,level,0);
 round(c,-13,37,26,15,4,owner.color,INK,1.7);c.fillStyle='#24372d';c.textAlign='center';c.textBaseline='middle';c.font='900 10px Segoe UI';c.fillText(owner.code,0,45);c.restore();
}
