import {speedUnlockKey,speedEightUnlockKey,desertUnlockKey} from './unlocks.js';
// Temporary testing utility. Keep preferences and unrelated site data intact.
export const handbookKey=saveKey=>saveKey.replace('.v4','.v2')+'.book';
export function resetProgress(storage,saveKey){
 storage.removeItem(saveKey);
 storage.removeItem(handbookKey(saveKey));
 storage.removeItem(speedUnlockKey(saveKey));
 storage.removeItem(speedEightUnlockKey(saveKey));
 storage.removeItem(desertUnlockKey(saveKey));
}
