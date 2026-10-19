import test from 'node:test';
import assert from 'node:assert/strict';
import {createRemoteBudget,redisTransport,remoteBudgetSettings,RESERVE_LUA} from '../server/remote-budget.mjs';
// Contract double for atomic EVAL; no external account or database is contacted.
function ledger(limit=1000){const leases=new Map();let reserved=0,missing=false,fail=false,drop=false,calls=0;return {
 async command(args){calls++;assert.equal(args[0],'EVAL');assert.equal(args[1],RESERVE_LUA);if(fail||missing)throw Error('Unavailable');const [, , ,key,id,chunk,ceiling]=args;assert.equal(key,'budget');let result=leases.get(id);if(!result){const amount=Math.max(0,Math.min(chunk,Math.min(ceiling,limit)-reserved));reserved+=amount;result=[amount,reserved,limit];leases.set(id,result);}if(drop){drop=false;throw Error('Lost response after commit');}return result;},
 get reserved(){return reserved;},get calls(){return calls;},set fail(v){fail=v;},set missing(v){missing=v;},set drop(v){drop=v;}
};}
const make=(store,options={})=>createRemoteBudget({command:store.command,key:'budget',limit:1000,chunkBytes:100,overheadBytes:0,...options});
test('concurrent processes cannot reserve beyond one permanent cap',async()=>{
 const store=ledger(),budgets=Array.from({length:20},()=>make(store));await Promise.all(budgets.map(b=>b.prime()));assert.equal(store.reserved,1000);
 let spent=0;for(const b of budgets){if(b.take(100))spent+=100;b.close();}assert.equal(spent,1000);
 assert.equal(await make(store).prime(),false);
});
test('process restart never reuses lost reservations, empty store never silently initializes',async()=>{
 const store=ledger();const a=make(store);await a.prime();assert.ok(a.take(10));a.close();const b=make(store);await b.prime();assert.equal(store.reserved,200);assert.equal(b.status().available,100);
 store.missing=true;const c=make(store);assert.equal(await c.prime(),false);assert.equal(c.take(1),false);assert.ok(c.status().lastError);b.close();c.close();
});
test('lost reservation reply is retried idempotently after backoff, never credited twice',async()=>{
 const store=ledger();let now=0;store.drop=true;const b=make(store,{now:()=>now});assert.equal(await b.prime(),false);assert.equal(store.reserved,100);assert.equal(b.take(1),false);assert.equal(store.calls,1);
 now=30001;assert.equal(await b.prime(),true);assert.equal(store.reserved,100);assert.equal(b.status().available,100);assert.equal(await b.prime(),true);assert.equal(store.reserved,200);b.close();
});
test('outage permits only prepaid allowance, overhead is reserved and refunds are impossible',async()=>{
 const store=ledger();const b=make(store,{overheadBytes:10});await b.prime();store.fail=true;assert.ok(b.take(90,'ws'));assert.equal(b.take(1),false);await b.ready();assert.equal(b.status().spent,90);assert.equal(store.reserved,100);b.close();assert.equal(b.take(0),false);
});
test('parallel refill calls share one request and malformed replies fail closed',async()=>{
 const store=ledger();const b=make(store);await Promise.all(Array.from({length:20},()=>b.prime()));assert.equal(store.calls,1);b.close();
 for(const reply of [[101,101,1000],[-1,1,1000],[100,1001,1000],null]){const bad=createRemoteBudget({command:async()=>reply,key:'budget',limit:1000,chunkBytes:100,overheadBytes:0});assert.equal(await bad.prime(),false);assert.equal(bad.take(1),false);bad.close();}
});
test('REST adapter uses authenticated HTTPS POST, rejects redirects and hides provider error details',async()=>{
 let request;const command=redisTransport({url:'https://example.invalid',token:'test-secret',fetcher:async(url,options)=>{request=options;return {ok:true,json:async()=>({result:123})};}});assert.equal(await command(['GET','key']),123);assert.equal(request.headers.Authorization,'Bearer test-secret');assert.equal(request.redirect,'error');assert.deepEqual(JSON.parse(request.body),['GET','key']);
 assert.throws(()=>redisTransport({url:'http://example.invalid',token:'x'}));assert.throws(()=>remoteBudgetSettings({CTD_BANDWIDTH_NAMESPACE:'bad:key'}));
 const bad=redisTransport({url:'https://example.invalid',token:'x',fetcher:async()=>({ok:true,json:async()=>({error:'secret provider detail'})})});await assert.rejects(bad(['GET','key']),e=>!e.message.includes('secret'));
});
