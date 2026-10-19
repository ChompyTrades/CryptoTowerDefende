// Rendering contract: keep every visual field; omit authoritative simulation internals.
const effectIds=new WeakMap();let nextEffectId=1;
function visualEntity(value){let id=effectIds.get(value);if(!id){id=nextEffectId++;effectIds.set(value,id);}return {...value,id};}
export function gameView(g){
 if(!g)return null;
 const {seed,nextId,pendingHits,queue,accumulator,spawned,events,players,...view}=g;
 return {...view,coop:true,
  effects:g.effects.map(visualEntity),puddles:g.puddles.map(visualEntity),
  towers:g.towers.map(t=>({...t,performance:{damage:t.performance.damage,pops:t.performance.pops}})),
  enemies:g.enemies.map(e=>{const {age,sinceHit,recovered,baseMaxHp,growth,pushes,lastPush,currentSpeed,dead,...visual}=e;return visual;})};
}
// Same JSON-compatible values as the old stringify/replacer/parse round trip.
export function detachedView(value){
 if(typeof value==='number')return value===0?0:Number.isFinite(value)?(Number.isInteger(value)?value:(Math.round(value*1000)/1000||0)):null;
 if(Array.isArray(value))return value.map(v=>v===undefined?null:detachedView(v));
 if(value&&typeof value==='object'){const result={};for(const k of Object.keys(value))if(value[k]!==undefined)result[k]=detachedView(value[k]);return result;}
 return value;
}
