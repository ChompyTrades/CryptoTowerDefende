import {readFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
const cache=new Map();
export async function staticResponse(req,res,file,mime,budget){
 const info=await stat(file);let entry=cache.get(file);
 if(!entry||entry.mtime!==info.mtimeMs||entry.size!==info.size){
  const raw=await readFile(file),compress=/^(text\/|image\/svg)/.test(mime)&&raw.length>512;
  entry={mtime:info.mtimeMs,size:info.size,raw,gzip:compress?gzipSync(raw,{level:6}):null,hash:createHash('sha256').update(raw).digest('hex').slice(0,24)};
  cache.set(file,entry);if(cache.size>200)cache.delete(cache.keys().next().value);
 }
 const zipped=!!entry.gzip&&/(?:^|,)\s*gzip\s*(?:,|$|;\s*q=(?!0(?:\.0*)?(?:\s*,|\s*$)))/i.test(req.headers['accept-encoding']||'');
 const tag='"'+entry.hash+(zipped?'-gzip':'')+'"',data=zipped?entry.gzip:entry.raw;
 const unchanged=(req.headers['if-none-match']||'').split(',').some(x=>x.trim()===tag||x.trim()==='*');
 const bytes=700+(unchanged||req.method==='HEAD'?0:data.length);
 if(budget&&!budget.take(bytes,'http')){res.writeHead(503,{'Content-Type':'text/plain','Cache-Control':'no-store','Retry-After':'3600'});res.end('CTD test bandwidth budget reached.');return;}
 const headers={'Content-Type':mime,'Cache-Control':'public, max-age=0, must-revalidate','ETag':tag,'Vary':'Accept-Encoding','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','X-Frame-Options':'DENY'};
 if(unchanged){res.writeHead(304,headers);res.end();return;}
 if(zipped)headers['Content-Encoding']='gzip';headers['Content-Length']=data.length;
 res.writeHead(200,headers);res.end(req.method==='HEAD'?undefined:data);
}
