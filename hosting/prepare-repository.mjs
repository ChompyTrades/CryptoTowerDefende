import {readFile,writeFile,mkdir,lstat,copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const files=JSON.parse(await readFile(new URL('./repository-files.json',import.meta.url),'utf8'));
const dest=path.join(root,'output','github-candidate-'+Date.now());
const art=new Set(['src/mascots.js','src/boss-art.js','src/coins.js','src/menu-art.js','src/coop-art.js']);
const inventory=[];
if(new Set(files).size!==files.length)throw Error('Duplicate selected path');
// Inspect every selected file before creating the candidate. Never log secret contents.
for(const file of files){
 if(typeof file!=='string'||file.includes('..')||path.isAbsolute(file)||file.includes('\\')||/^(?:data|output|node_modules|X|\.git)\//.test(file)||/references\/|(?:^|\/)\.env(?:$|\.)/.test(file))throw Error('Unsafe selected path: '+file);
 const source=path.join(root,file);const st=await lstat(source);if(!st.isFile()||st.isSymbolicLink())throw Error('Not an ordinary file: '+file);
 const data=await readFile(source);
 if(!/\.(?:png|svg)$/.test(file)){
  const text=data.toString('utf8');
  if(/gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9]{20,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(text))throw Error('Possible credential in: '+file);
  if(/[A-Z]:[\\/](?:Users|KI)[\\/]/.test(text))throw Error('Local machine path in: '+file);
 }
 inventory.push({file,bytes:data.length,sha256:createHash('sha256').update(data).digest('hex'),rightsReviewPending:file.startsWith('assets/')||art.has(file)});
}
await mkdir(dest,{recursive:true});
for(const {file} of inventory){const target=path.join(dest,file);await mkdir(path.dirname(target),{recursive:true});await copyFile(path.join(root,file),target);}
await writeFile(dest+'.manifest.json',JSON.stringify({status:'LOCAL ONLY — asset review pending',files:inventory},null,2)+'\n');
console.log(JSON.stringify({directory:dest,files:files.length,rightsReviewPending:inventory.filter(f=>f.rightsReviewPending).length,manifest:dest+'.manifest.json'},null,2));
