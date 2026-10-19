import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../output/solo/',import.meta.url));
const prefix='/CryptoTowerDefende/';
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml'};
export const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  if(process.env.CTD_SOLO_QA==='1'&&url.pathname==='/__fixtures'){
   res.writeHead(200,{'Content-Type':'text/html','Cache-Control':'no-store'});return res.end(await readFile(new URL('../output/solo-fixtures.html',import.meta.url)));
  }
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end();}
  if(!url.pathname.startsWith(prefix))throw Error('Not found');
  const name=decodeURIComponent(url.pathname.slice(prefix.length))||'index.html';
  const file=path.resolve(root,name);
  if(!file.startsWith(path.resolve(root)+path.sep)||!types[path.extname(file)])throw Error('Not found');
  const data=await readFile(file);
  res.writeHead(200,{'Content-Type':types[path.extname(file)],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:data);
 }catch{res.writeHead(404);res.end('Not found');}
});
server.listen(Number(process.env.PORT??4181),'127.0.0.1',()=>console.log(`Solo preview: http://127.0.0.1:${server.address().port}${prefix}`));
