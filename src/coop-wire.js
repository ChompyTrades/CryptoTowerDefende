const entityFields=['enemies','towers','effects','puddles'];
// Exact millesimal differences: positions/timers change little between 30Hz frames.
// Large/non-millesimal numbers use an explicit absolute escape; no precision loss.
function relativeValues(previous,value,decode=false){
 if(typeof previous==='number'){
  if(decode&&Array.isArray(value)&&value[0]==='$absolute')return value[1];
  if(typeof value==='number'){
   if(decode)return (Math.round(previous*1000)+value)/1000;
   const a=Math.round(previous*1000),b=Math.round(value*1000);
   if(Number.isSafeInteger(a)&&Number.isSafeInteger(b)&&Number.isSafeInteger(b-a)&&a/1000===previous&&b/1000===value)return b-a;
   return ['$absolute',value];
  }
 }
 if(previous===undefined)return value;
 if(value&&typeof value==='object'&&!Array.isArray(value)){const result={};for(const k of Object.keys(value))result[k]=k==='id'?value[k]:relativeValues(previous?.[k],value[k],decode);return result;}
 return value;
}
export function relativePatch(before,message,decode=false){
 if(message.type!=='patch')return message;
 const game={...message.game,fields:relativeValues(before.game,message.game.fields,decode)};
 for(const k of entityFields)if(message.game[k]){const old=new Map((before.game[k]||[]).map(v=>[v.id,v]));game[k]={...message.game[k],upsert:message.game[k].upsert.map(v=>relativeValues(old.get(v.id),v,decode))};}
 const result={...message,game};if(decode)delete result.relative;else result.relative=true;return result;
}
const same=(a,b)=>a===b||(a!==null&&b!==null&&typeof a==='object'&&typeof b==='object'&&JSON.stringify(a)===JSON.stringify(b));
function entities(before,after){const old=new Map(before.map(v=>[v.id,v])),ids=new Set(after.map(v=>v.id));return {remove:before.filter(v=>!ids.has(v.id)).map(v=>v.id),upsert:after.flatMap(v=>{const p=old.get(v.id);if(!p)return[v];const delta={id:v.id};for(const k of Object.keys(v))if(!same(v[k],p[k]))delta[k]=v[k];const unset=Object.keys(p).filter(k=>!Object.hasOwn(v,k));if(unset.length)delta.$unset=unset;return Object.keys(delta).length>1?[delta]:[];})};}
export function statePatch(before,after){if(!before||!before.game||!after.game)return after;const top={};for(const k of Object.keys(after))if(k!=='game'&&k!=='type'&&k!=='events'&&!same(before[k],after[k]))top[k]=after[k];if(!same(before.events,after.events)){const last=before.events?.at(-1)?.id??0;top.events=(after.events||[]).filter(e=>e.id>last);if(after.events?.length)top.eventDelta=true;}const fields={};for(const k of Object.keys(after.game))if(!entityFields.includes(k)&&!same(before.game[k],after.game[k]))fields[k]=after.game[k];const game={fields};for(const k of entityFields)if(Array.isArray(after.game[k])){const previous=before.game[k]||[],current=after.game[k],ids=new Set(previous.map(v=>v.id));if(['effects','puddles'].includes(k)&&current.filter(v=>!ids.has(v.id)).length>current.length/2)fields[k]=current;else game[k]=entities(previous,current);}return {type:'patch',top,game};}
export function applyStatePatch(before,message){if(message.relative)message=relativePatch(before,message,true);if(message.type==='state')return message;if(!before?.game)throw Error('Snapshot fehlt');const game={...before.game,...message.game.fields};for(const k of entityFields){const change=message.game[k];if(!change)continue;const gone=new Set(change.remove),items=new Map((game[k]||[]).filter(v=>!gone.has(v.id)).map(v=>[v.id,v]));for(const p of change.upsert){const merged={...items.get(p.id),...p};for(const k of p.$unset||[])delete merged[k];delete merged.$unset;items.set(p.id,merged);}game[k]=[...items.values()];}const top={...message.top};if(top.eventDelta){top.events=[...(before.events||[]),...top.events].slice(-80);delete top.eventDelta;}return {...before,...top,type:'state',game};}
