// Coalesce simultaneous same-type attacks; bounded and fair across tower types.
export const CUES={
 donation:{freq:1050,slide:900,duration:.065,gain:.11,wave:'triangle',gap:.7,priority:true,second:1580},
 PENGU:{freq:460,slide:260,duration:.09,gain:.16,wave:'sine',gap:.28},
 PEPE:{freq:390,slide:310,duration:.075,gain:.08,wave:'sine',gap:.4},
 DOGE:{freq:170,slide:110,duration:.12,gain:.18,wave:'triangle',gap:.38},
 SNEK:{freq:290,slide:160,duration:.16,gain:.10,wave:'sine',gap:.5},
 BONK:{freq:120,slide:50,duration:.17,gain:.23,wave:'triangle',gap:.3},
 POPCAT:{freq:270,slide:95,duration:.12,gain:.17,wave:'sine',gap:.38},
 SI:{freq:650,slide:420,duration:.085,gain:.09,wave:'sine',gap:.34},
 break:{freq:780,slide:520,duration:.07,gain:.09,wave:'sine',gap:.3},
 deal:{freq:550,slide:830,duration:.3,gain:.20,wave:'sine',gap:.5,priority:true},
 victory:{freq:660,slide:880,duration:.55,gain:.22,wave:'sine',gap:.5,priority:true}
};
export class SoundMixer{
 constructor(){this.pending=new Map();this.last=new Map();this.next=0;}
 request(type,now){if(!CUES[type])return;if(!this.pending.has(type))this.pending.set(type,now);}
 clear(){this.pending.clear();}
 take(now){for(const [type,at] of this.pending)if(now-at>1)this.pending.delete(type);if(now<this.next)return null;
 const eligible=[...this.pending].filter(([type])=>now-(this.last.get(type)??-Infinity)>=CUES[type].gap).sort(([a],[b])=>Number(!!CUES[b].priority)-Number(!!CUES[a].priority));
 if(!eligible.length)return null;const type=eligible[0][0];this.pending.delete(type);this.last.set(type,now);this.next=now+.125;return type;
 }
}
