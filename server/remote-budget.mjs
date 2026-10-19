import {randomUUID} from 'node:crypto';

// Atomic reservations: no gameplay packet waits for a database round trip.
// The permanent hash has NO expiry. Lost process leases are never refunded.
export const RESERVE_LUA=`
local cap=tonumber(redis.call('HGET',KEYS[1],'limit'))
local used=tonumber(redis.call('HGET',KEYS[1],'reserved'))
if not cap or not used or cap<1 or used<0 then return redis.error_reply('CTD_BUDGET_MISSING') end
local previous=redis.call('GET',KEYS[2])
if previous then return cjson.decode(previous) end
local ceiling=math.min(cap,tonumber(ARGV[2]))
local amount=math.max(0,math.min(tonumber(ARGV[1]),ceiling-used))
local next=used+amount
redis.call('HSET',KEYS[1],'reserved',next)
local result={amount,next,cap}
redis.call('SET',KEYS[2],cjson.encode(result),'EX',86400)
return result`;
export const INIT_LUA=`
if redis.call('EXISTS',KEYS[1])==1 then return redis.error_reply('CTD_BUDGET_ALREADY_EXISTS') end
redis.call('HSET',KEYS[1],'limit',ARGV[1],'reserved',ARGV[2])
return 'OK'`;

export function redisTransport({url,token,fetcher=fetch,timeoutMs=5000}){
 const endpoint=new URL(url);if(endpoint.protocol!=='https:'||endpoint.username||endpoint.password||endpoint.search||endpoint.hash)throw Error('Budget REST endpoint must use HTTPS without credentials in its URL');
 if(typeof token!=='string'||!token.trim())throw Error('Missing budget REST token');
 return async command=>{
  const response=await fetcher(endpoint,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(command),signal:AbortSignal.timeout(timeoutMs),redirect:'error'});
  if(!response.ok)throw Error('Budget store HTTP '+response.status);
  const data=await response.json();if(data.error)throw Error('Budget store rejected command');return data.result;
 };
}
export function remoteBudgetSettings(env=process.env){
 const namespace=env.CTD_BANDWIDTH_NAMESPACE||'ctd-beta';if(!/^[a-z0-9-]{1,48}$/.test(namespace))throw Error('Invalid budget namespace');
 return {namespace,key:`ctd:{${namespace}}:budget`,url:env.CTD_BUDGET_REST_URL,token:env.CTD_BUDGET_REST_TOKEN};
}
export function createRemoteBudget({command,key,limit=2_000_000_000,chunkBytes=4_000_000,overheadBytes=8192,now=Date.now}){
 if(!Number.isSafeInteger(limit)||limit<=0||!Number.isSafeInteger(chunkBytes)||chunkBytes<=overheadBytes||chunkBytes>16_000_000)throw Error('Invalid remote budget configuration');
 let available=0,spent=0,reservedTotal=null,inflight=null,leaseId=null,terminal=false,closed=false,retryAt=0,lastError=null,requests=0;
 const channels={http:0,ws:0};
 async function fill(){
  if(inflight)return inflight;if(closed||terminal||now()<retryAt)return false;
  leaseId??=randomUUID();const id=leaseId;requests++;
  inflight=(async()=>{
   try{
    const reply=await Promise.resolve().then(()=>command(['EVAL',RESERVE_LUA,2,key,key+':lease:'+id,chunkBytes,limit]));
    if(!Array.isArray(reply)||reply.length!==3||!reply.every(n=>Number.isSafeInteger(n)&&n>=0)||reply[0]>chunkBytes||reply[1]>Math.max(reply[2],limit))throw Error('Invalid budget reservation');
    if(closed)return false;
    available+=Math.max(0,reply[0]-overheadBytes);reservedTotal=reply[1];terminal=reply[0]<chunkBytes;leaseId=null;lastError=null;retryAt=0;return available>0;
   }catch{lastError='Budget store unavailable; no unreserved traffic allowed';retryAt=now()+30000;return false;}
   finally{inflight=null;}
  })();return inflight;
 }
 return {prime:fill,async ready(){if(available<chunkBytes/2)await fill();return available>0;},take(bytes,channel='http'){
  if(!Number.isSafeInteger(bytes)||bytes<0)throw Error('Invalid byte count');
  if(closed)return false;
  if(available<bytes){void fill();return false;}
  available-=bytes;spent+=bytes;channels[channel]=(channels[channel]||0)+bytes;if(available<chunkBytes/2)void fill();return true;
 },get exhausted(){if(available===0)void fill();return available===0;},status(){return {kind:'remote',limit,reservedTotal,available,spent,requests,lastError,terminal,channels:{...channels}};},close(){closed=true;available=0;}};
}
