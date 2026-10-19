import {staticResponse} from './server/static-response.mjs';
import {loadBandwidthBudget} from './server/bandwidth.mjs';
import http from 'node:http';
import {realpath} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {attachCoop} from './server/coop.mjs';
const root=fileURLToPath(new URL('./',import.meta.url));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png'};
export function createLocalServer(options={}){
 const server=http.createServer(async(req,res)=>{try{if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
 const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/$/,'/index.html');
 if(!(/^\/(index\.html|coop\.html|style\.css|coop\.css)$/.test(name)||/^\/src\/[\w-]+\.js$/.test(name)||/^\/assets\/(favicon(?:-64)?\.png|emotes\/[\w-]+\.png|cursors\/[\w-]+\.svg)$/.test(name)||/^\/docs\/[\w-]+\.(html|js|css|png)$/.test(name)))throw Error('not found');
 const file=await realpath(path.resolve(root,'.'+name));if(!file.startsWith(root))throw Error('not found');await staticResponse(req,res,file,mime[path.extname(file)],options.bandwidth);
 }catch{res.writeHead(404);res.end('Not found');}});
 const coop=attachCoop(server,options);return {server,coop};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const {server,coop}=createLocalServer({browserProgress:true,compression:process.env.CTD_WS_COMPRESSION!=='0',bandwidth:await loadBandwidthBudget(process.env.CTD_DATA_DIR||path.join(root,'data')),testAccess:process.env.CTD_TEST_ACCESS!=='0',dataDir:process.env.CTD_DATA_DIR||path.join(root,'data')});server.on('error',e=>{console.error(e.code==='EADDRINUSE'?'CTD Port bereits belegt.':e.message);process.exitCode=1;});for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{coop.close();server.close(()=>process.exit(0));});server.listen(Number(process.env.PORT||4173),'127.0.0.1',()=>{console.log('CTD Solo + Koop: http://127.0.0.1:'+server.address().port);if(process.argv.includes('--open'))spawn('cmd.exe',['/c','start','','http://127.0.0.1:'+server.address().port],{windowsHide:true,stdio:'ignore'});});
}
