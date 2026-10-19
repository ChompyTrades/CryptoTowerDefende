import {mkdir,readFile,writeFile,readdir,rename} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const dest=path.join(root,'output/solo');
// Preserve earlier exports rather than merging stale files into a release.
try{await rename(dest,dest+'-previous-'+Date.now());}catch(e){if(e.code!=='ENOENT')throw e;}
const written=new Set();
async function put(name,contents){await mkdir(path.dirname(path.join(dest,name)),{recursive:true});await writeFile(path.join(dest,name),contents);written.add(name);}
async function module(name){
 if(written.has(name))return;
 let text=await readFile(path.join(root,name),'utf8');
 if(name==='src/app.js'){
  text=text.split(/\r?\n/).filter(line=>!line.startsWith("if(new URLSearchParams(location.search).has('qa'))")).join('\n');
  text=text.replace("KEY=new URLSearchParams(location.search).has('qa')?'ctd.qa.save.v4':'ctd.save.v4'","KEY='ctd.save.v4'");
 }
 if(name==='src/release-profile.js')text='export const SOLO_RELEASE=true;\n';
 if(name==='src/unlocks.js')text=text.replace('DESERT_TEST_ACCESS=true','DESERT_TEST_ACCESS=false').replace('SPEED_TEST_ACCESS=true','SPEED_TEST_ACCESS=false');
 await put(name,text);
 for(const match of text.matchAll(/(?:from\s*|import\s*)['"](\.\.?\/[^'"]+)['"]/g))await module(path.posix.normalize(path.posix.join(path.posix.dirname(name),match[1])));
}
for(const name of ['index.html','style.css','assets/favicon-64.png'])await put(name,await readFile(path.join(root,name)));
for(const file of await readdir(path.join(root,'assets/cursors')))if(file.endsWith('.svg'))await put('assets/cursors/'+file,await readFile(path.join(root,'assets/cursors',file)));
await module('src/app.js');
await put('.nojekyll','');
const manifest=[];
for(const name of [...written].sort()){const data=await readFile(path.join(dest,name));manifest.push({file:name,bytes:data.length,sha256:createHash('sha256').update(data).digest('hex')});}
await writeFile(path.join(root,'output/solo-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(`Solo export: ${dest} (${written.size} files). No upload or deployment.`);
