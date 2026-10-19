import {terrain} from './terrain.js';
import {mascot} from './mascots.js';
import {coin} from './coins.js';
import {ENEMIES} from './config.js';
export function menuLandscape(canvas,mapId='grass'){
 const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);
 c.save();c.scale(canvas.width/1100,canvas.height/420);c.drawImage(terrain(mapId),0,90,1100,420,0,0,1100,420);
 for(const [k,x,y,level] of [['PENGU',175,220,1],['BONK',570,245,2],['POPCAT',980,235,1]])mascot(c,k,x,y,1.7,0,level,0);
 for(const [k,x,y] of [['USDC',75,62],['ETH',355,135],['SOL',705,62]])coin(c,{type:k,x,y,d:24,hp:ENEMIES[k].hp,maxHp:ENEMIES[k].hp,hit:0},0);
 c.restore();
}
export function mapThumbnail(canvas,mapId){const c=canvas.getContext('2d');c.drawImage(terrain(mapId),0,0,canvas.width,canvas.height);}
