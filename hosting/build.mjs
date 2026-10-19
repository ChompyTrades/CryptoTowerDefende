import {mkdir,copyFile,readdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)),dest=path.join(root,'output/web');
const files=['index.html','style.css','coop.html','coop.css','assets/favicon-64.png','docs/text-review.html','docs/text-review-data.js',...((await readdir(path.join(root,'assets/emotes'))).filter(f=>f.endsWith('.png')).map(f=>'assets/emotes/'+f)),...((await readdir(path.join(root,'src'))).filter(f=>f.endsWith('.js')).map(f=>'src/'+f)),...((await readdir(path.join(root,'assets/cursors'))).filter(f=>f.endsWith('.svg')).map(f=>'assets/cursors/'+f))];
for(const name of ['enemy-review','visual-review','damage-review','coop-review'])for(const ext of ['html','css','js']){
 const f=`docs/${name}.${ext}`;try{await copy(path.join(root,f),path.join(dest,f));}catch(e){if(e.code!=='ENOENT')throw e;}
}
for(const f of files)await copy(path.join(root,f),path.join(dest,f));
if(process.argv.includes('--release')){const config=path.join(dest,'src/config.js');await writeFile(config,(await readFile(config,'utf8')).replace('SUPER_INU_TEST_PRICE=1','SUPER_INU_TEST_PRICE=null')); const f=path.join(dest,'src/unlocks.js');await writeFile(f,(await readFile(f,'utf8')).replace('DESERT_TEST_ACCESS=true','DESERT_TEST_ACCESS=false').replace('SPEED_TEST_ACCESS=true','SPEED_TEST_ACCESS=false'));}
async function copy(src,target){await mkdir(path.dirname(target),{recursive:true});await copyFile(src,target);}
console.log('Exported to output/web. Reference photographs, logs and save files are excluded.');
