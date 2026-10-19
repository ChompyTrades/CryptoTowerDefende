import {ENEMIES,ABILITIES} from './config.js';
// Health and radius grow continuously; movement changes at visible phase boundaries.
export function hypeStats(seconds=null,scale=1){const a=ABILITIES.grow,t=Math.max(0,Math.min(a.duration+a.secondDuration,seconds??0));let phase,hp,r,speed;
 if(t<a.firstDuration){const p=t/a.firstDuration;phase=1;hp=ENEMIES.HYPE.hp+(a.firstHp-ENEMIES.HYPE.hp)*p;r=ENEMIES.HYPE.r+(a.firstR-ENEMIES.HYPE.r)*p;speed=ENEMIES.HYPE.speed;}
 else if(t<a.duration){const p=(t-a.firstDuration)/(a.duration-a.firstDuration);phase=2;hp=a.firstHp+(a.hp-a.firstHp)*p;r=a.firstR+(a.r-a.firstR)*p;speed=a.middleSpeed;}
 else{const p=(t-a.duration)/a.secondDuration;phase=3;hp=a.hp+(a.finalHp-a.hp)*p;r=a.r+(a.finalR-a.r)*p;speed=a.finalSpeed;}
 return {phase,hp:hp*scale,r,speed};}
