import {ENEMIES,TOWERS} from './config.js';
export const progressKey='ctd.coop.progress.v1';
export function cleanProgress(value){
 const bestWave=Number.isSafeInteger(value?.bestWave)?Math.max(0,Math.min(100000,value.bestWave)):0;
 return {bestWave,unlocks:{five:value?.unlocks?.five===true,eight:value?.unlocks?.eight===true,desert:value?.unlocks?.desert===true},known:{enemies:[...new Set((Array.isArray(value?.known?.enemies)?value.known.enemies:[]).filter(k=>Object.hasOwn(ENEMIES,k)))],towers:[...new Set((Array.isArray(value?.known?.towers)?value.known.towers:[]).filter(k=>Object.hasOwn(TOWERS,k)))]}};
}
export function readProgress(storage){try{return cleanProgress(JSON.parse(storage.getItem(progressKey)));}catch{return cleanProgress(null);}}
export function saveProgress(storage,value,reset=false){const next=cleanProgress(value),old=reset?cleanProgress(null):readProgress(storage);const merged={bestWave:Math.max(old.bestWave,next.bestWave),unlocks:Object.fromEntries(Object.keys(old.unlocks).map(k=>[k,old.unlocks[k]||next.unlocks[k]])),known:{enemies:[...new Set([...old.known.enemies,...next.known.enemies])],towers:[...new Set([...old.known.towers,...next.known.towers])]}};try{const raw=JSON.stringify(merged);if(storage.getItem(progressKey)!==raw)storage.setItem(progressKey,raw);}catch{}return merged;}
