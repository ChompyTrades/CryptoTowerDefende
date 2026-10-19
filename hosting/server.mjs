import {loadBandwidthBudget} from '../server/bandwidth.mjs';
import {staticResponse} from '../server/static-response.mjs';
import {attachCoop} from '../server/coop.mjs';
// Public preview only serves the generated export, never the development workspace.
import http from 'node:http';
import {realpath} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=await realpath(fileURLToPath(new URL('../output/web/',import.meta.url)));
const budget=await loadBandwidthBudget(process.env.CTD_DATA_DIR||fileURLToPath(new URL('../data/',import.meta.url)));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png'};
export const server=http.createServer(async(req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});return res.end();}
 try{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/health'){res.writeHead(200,{'Content-Type':'text/plain'});return res.end('ok');}
  const name=decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname);
  const file=await realpath(path.resolve(root,'.'+name));
  if(!file.startsWith(root+path.sep)||!mime[path.extname(file)])throw Error('not found');
  await staticResponse(req,res,file,mime[path.extname(file)],budget);
 }catch{res.writeHead(404);res.end('Not found');}
});
export const coop=attachCoop(server,{testAccess:process.env.CTD_TEST_ACCESS==='1',dataDir:process.env.CTD_PERSIST_ROOMS==='1'?(process.env.CTD_DATA_DIR||null):null,browserProgress:true,bandwidth:budget,compression:process.env.CTD_WS_COMPRESSION!=='0',maxRooms:Number(process.env.CTD_MAX_ROOMS||2)});server.on('close',()=>{coop.close();budget.close?.();});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{coop.close();server.close(()=>process.exit(0));});
const port=Number(process.env.PORT||4174),host=process.env.HOST||'127.0.0.1';
server.listen(port,host,()=>console.log(`CTD preview listening on ${host}:${server.address().port}`));
