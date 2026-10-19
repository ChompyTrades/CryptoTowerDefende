export const ATTACK_TIME={PENGU:.42,PEPE:.28,DOGE:.5,SNEK:.5,BONK:.58,POPCAT:1.1,SI:.18};
// Local coordinates stay shared between character poses and projectile origins.
export function muzzle(t){const flip=Math.cos(t.angle)<0?-1:1;const p={PENGU:[24,-7],PEPE:[14,1],DOGE:[24,-7],SNEK:[25,-19],BONK:[22,5],POPCAT:[4,-4],SI:[14,-20]}[t.type];return{x:t.x+p[0]*.95*flip,y:t.y+p[1]*.95};}
