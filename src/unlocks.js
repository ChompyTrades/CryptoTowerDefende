export const speedUnlockKey=saveKey=>saveKey+'.speed5';
export const completedForty=g=>g.wave>=40&&(g.phase==='victory'||g.endless);
export function hasSpeedFive(storage,key,g){if(completedForty(g))return true;try{return storage.getItem(speedUnlockKey(key))==='1';}catch{return false;}}
// Release checklist: switch off the explicit preview-only desert bypass.
export const DESERT_TEST_ACCESS=false;
export const desertUnlockKey=saveKey=>saveKey+'.desert';
export function hasDesert(storage,key,g){if(g&&(!g.mapId||g.mapId==='grass')&&completedForty(g))return true;try{return storage.getItem(desertUnlockKey(key))==='1';}catch{return false;}}
export const canPlayDesert=(unlocked,testAccess=DESERT_TEST_ACCESS)=>unlocked||testAccess;

export const speedEightUnlockKey=saveKey=>saveKey+'.speed8';
export const completedHundred=g=>!!g&&(g.wave>100||(g.wave===100&&g.phase==='prepare'&&g.settlement?.wave===100));
export function hasSpeedEight(storage,key,g){if(completedHundred(g))return true;try{return storage.getItem(speedEightUnlockKey(key))==='1';}catch{return false;}}

// Preview only: disable before public release. Does not grant persistent unlocks.
export const SPEED_TEST_ACCESS=false;
export const canUseBonusSpeed=(unlocked,testAccess=SPEED_TEST_ACCESS)=>unlocked||testAccess;
