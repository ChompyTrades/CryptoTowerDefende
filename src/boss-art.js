import {oval,line,poly,round,shape,INK} from './draw.js';
export const PORTRAIT_BOSSES=['CUPSEY','RASMR','ORANGIE','QUANT','KIMCHI'];
// Deliberately simple ink portraits; silhouettes follow the supplied references.
export function bossPortrait(c,type,r){
 c.save();c.scale(r/48,r/48);
 if(type==='CUPSEY'){
  round(c,-29,-30,58,62,6,'#f1d760');
  for(const [x,y] of [[-23,-8],[24,13],[-22,23],[18,-20]])oval(c,x,y,3,4,'#c1ab46',null);
  round(c,-30,23,60,11,2,'#f5efdc');poly(c,[[-3,25],[3,25],[5,38],[0,42],[-5,38]],'#bf5944');
  oval(c,-12,-8,11,13,'#fff9dd');oval(c,11,-8,11,13,'#fff9dd');
  oval(c,-9,-5,3,5,'#81abc0');oval(c,8,-5,3,5,'#81abc0');
  line(c,[[-23,-13],[-2,-12]],INK,2);line(c,[[1,-12],[22,-13]],INK,2);
  oval(c,0,4,4,10,'#ead064');shape(c,'M-20 13 Q0 27 22 10',null,INK,2);
  round(c,-8,18,7,9,1,'#fff8df');round(c,1,18,7,9,1,'#fff8df');
  shape(c,'M-32 -26 Q-31 -47 0 -45 Q29 -46 31 -25Z','#7c8854');
  for(const [x,y] of [[-20,-32],[-4,-38],[15,-33]])oval(c,x,y,8,4,'#acaa67',null);
  round(c,-34,-27,68,7,3,'#526343');
 }else if(type==='ORANGIE'){
  shape(c,'M-33 35 Q-37 12 -24 5 L24 5 Q38 18 33 38Z','#303337');
  oval(c,0,-7,25,29,'#faf5df');
  oval(c,-9,-10,3,5,INK,null);oval(c,10,-10,3,5,INK,null);
  oval(c,-8,-12,1,1,'#fff',null);oval(c,11,-12,1,1,'#fff',null);
  poly(c,[[-3,-1],[9,1],[0,6],[-5,3]],'#eba33d');
  shape(c,'M-28 -21 Q-26 -48 0 -47 Q27 -46 28 -21Z','#f8a434');
  round(c,-29,-25,58,12,3,'#ef9630');
  for(let x=-22;x<29;x+=9)line(c,[[x,-24],[x+1,-15]],'#b76b2f',1.3);
  oval(c,0,-47,8,6,'#5c9a59');
  line(c,[[-9,18],[-5,27]],'#ece9d8',2);line(c,[[9,18],[7,27]],'#70ae78',2);
 }else if(type==='QUANT'){
  shape(c,'M-30 36 L-23 13 L21 13 L30 36Z','#323538');
  oval(c,0,-7,22,28,'#dab5a0');
  poly(c,[[-25,-14],[-27,-30],[-18,-28],[-19,-41],[-6,-33],[2,-44],[8,-33],[23,-39],[20,-25],[29,-29],[23,-9],[14,-24],[3,-18],[-6,-24],[-18,-17]],'#857b6e');
  line(c,[[-16,-10],[-6,-12]],'#554d43',2.5);line(c,[[6,-12],[17,-9]],'#554d43',2.5);
  oval(c,-10,-6,2.4,2,INK,null);oval(c,11,-6,2.4,2,INK,null);
  shape(c,'M-12 6 Q0 14 13 5 Q10 23 -2 20 Q-10 17 -12 6Z','#6b4940');
  line(c,[[-8,9],[1,12],[8,9]],'#fff0d8',3);
  for(const sign of [-1,1]){c.save();c.scale(sign,1);round(c,25,-6,13,23,5,'#dab5a0');round(c,30,-24,5,25,2,'#dab5a0');line(c,[[27,1],[36,3]],'#ac8876',1.3);c.restore();}
  round(c,-24,27,48,13,3,'#ddc374');c.font='900 8px Segoe UI';c.fillStyle=INK;c.textAlign='center';c.fillText('20 BANDOS',0,34);
 }else{
  const kimchi=type==='KIMCHI';
  shape(c,'M-31 36 L-26 16 L-12 10 L14 10 L29 19 L33 38Z',kimchi?'#dce9eb':'#777469');
  oval(c,0,-8,23,29,kimchi?'#d7ac85':'#d4ab8e');
  oval(c,-24,-7,4,7,'#d4ab8e');oval(c,24,-7,4,7,'#d4ab8e');
  if(kimchi){
   shape(c,'M-25 -12 Q-32 -43 0 -40 Q32 -39 25 -10 L17 -24 L7 -17 L3 -28 L-8 -19 L-17 -25Z','#292d2c');
   poly(c,[[-16,16],[-3,29],[-12,36],[-22,21]],'#f6f3e6');poly(c,[[12,15],[4,29],[15,35],[23,22]],'#f6f3e6');
   line(c,[[2,25],[2,38]],'#8ca8ae',1.5);
   // Raised wrist and watch from the supplied pose, clear of the face.
   round(c,20,-1,12,30,5,'#dbb28e');round(c,18,14,17,10,2,'#6c7879');oval(c,26,19,5,5,'#d7d5b5');line(c,[[26,16],[26,19],[29,20]],INK,1);
   round(c,-20,32,35,12,3,'#ddc36b');c.font='900 9px Segoe UI';c.fillStyle=INK;c.textAlign='center';c.fillText('GOAT',-2,39);
  }else{
   for(let i=0;i<12;i++){const a=Math.PI+i*Math.PI/11;oval(c,Math.cos(a)*24,-22+Math.sin(a)*12,7,8,i%3?'#665442':'#7a614a');}
   line(c,[[-15,14],[-6,20],[8,20],[17,12]],'#927a63',3);
   poly(c,[[-18,16],[-4,25],[-14,29]],'#918b7d');poly(c,[[16,16],[4,25],[13,29]],'#918b7d');
  }
  line(c,[[-17,-13],[-6,-15]],'#4c4239',3);line(c,[[7,-15],[17,-12]],'#4c4239',3);
  oval(c,-11,-8,2.5,2,INK,null);oval(c,12,-8,2.5,2,INK,null);
  line(c,[[1,-7],[-2,2],[3,3]],'#a77962',1.5);line(c,[[-7,10],[2,12],[10,9]],'#8d6452',2);
 }
 c.restore();
}
