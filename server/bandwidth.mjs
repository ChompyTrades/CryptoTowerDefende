import {mkdirSync,readFileSync,writeFileSync,renameSync,existsSync} from 'node:fs';
import path from 'node:path';

// Conservative application budget, NOT Render's billing meter. No automatic reset.
export function createBandwidthBudget({limit=2_000_000_000,file=null,initialUsed=0}={}){
 if(!Number.isSafeInteger(limit)||limit<0||!Number.isSafeInteger(initialUsed)||initialUsed<0)throw Error('Invalid bandwidth budget');
 let used=initialUsed,reserved=initialUsed;
 if(file&&existsSync(file)){const saved=JSON.parse(readFileSync(file,'utf8'));if(saved.version!==1||!Number.isSafeInteger(saved.reserved)||saved.reserved<0)throw Error('Invalid bandwidth ledger; refusing to reset');used=reserved=Math.max(initialUsed,saved.reserved);}
 const channels={http:0,ws:0};
 function save(n){if(!file)return;mkdirSync(path.dirname(file),{recursive:true});writeFileSync(file+'.tmp',JSON.stringify({version:1,reserved:n}),{mode:0o600});renameSync(file+'.tmp',file);}
 return {take(bytes,channel='http'){
  if(!Number.isSafeInteger(bytes)||bytes<0)throw Error('Invalid byte count');
  // Reserve before transmission so a crash never restores spent allowance.
  if(limit&&used+bytes>limit)return false;
  if(used+bytes>reserved){const next=limit?Math.min(limit,Math.max(used+bytes,reserved+1_000_000)):Math.max(used+bytes,reserved+1_000_000);try{save(next);}catch{return false;}reserved=next;}
  used+=bytes;channels[channel]=(channels[channel]||0)+bytes;return true;
 },get exhausted(){return !!limit&&used>=limit;},status(){return {limit,used,reserved,remaining:limit?Math.max(0,limit-used):null,channels:{...channels}};}};
}
export function budgetFromEnv(directory,env=process.env){
 const file=path.join(directory,'bandwidth-v1.json'),limit=Number(env.CTD_BANDWIDTH_LIMIT_BYTES??2_000_000_000);
 // Render Free can erase this file. Never silently grant a fresh allowance there.
 const missingHostedLedger=env.RENDER==='true'&&limit>0&&!existsSync(file);
 if(missingHostedLedger)console.warn('CTD bandwidth ledger missing: gameplay locked. Restore a durable ledger before hosting, or explicitly disable the cap.');
 return createBandwidthBudget({limit,initialUsed:missingHostedLedger?limit:Number(env.CTD_BANDWIDTH_USED_BYTES??0),file});
}
export async function loadBandwidthBudget(directory,env=process.env){
 if(Number(env.CTD_BANDWIDTH_LIMIT_BYTES??2_000_000_000)===0)return createBandwidthBudget({limit:0});
 if(env.CTD_BUDGET_REST_URL||env.CTD_BUDGET_REST_TOKEN){
  const {redisTransport,remoteBudgetSettings,createRemoteBudget}=await import('./remote-budget.mjs');
  const settings=remoteBudgetSettings(env),budget=createRemoteBudget({command:redisTransport(settings),key:settings.key,limit:Number(env.CTD_BANDWIDTH_LIMIT_BYTES??2_000_000_000)});
  await budget.prime();if(budget.status().lastError)console.warn(budget.status().lastError);return budget;
 }
 return budgetFromEnv(directory,env);
}
