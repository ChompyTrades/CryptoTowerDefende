export const SETTINGS_KEY='ctd.settings.v1';
export const settingsDefaults={lang:'en',auto:true,music:.2,effects:.35,mute:false};
export function readSettings(storage){let s;try{s=JSON.parse(storage.getItem(SETTINGS_KEY));}catch{}return{lang:s?.lang==='de'?'de':'en',auto:typeof s?.auto==='boolean'?s.auto:true,mute:!!s?.mute,music:Number.isFinite(s?.music)?Math.max(0,Math.min(1,s.music)):.2,effects:Number.isFinite(s?.effects)?Math.max(0,Math.min(1,s.effects)):.35};}
export function writeSettings(storage,patch){const next={...readSettings(storage),...patch};storage.setItem(SETTINGS_KEY,JSON.stringify(next));return next;}
