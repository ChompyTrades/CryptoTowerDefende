import {mkdirSync,readFileSync,writeFileSync,renameSync,copyFileSync,existsSync,chmodSync} from 'node:fs';
import path from 'node:path';
import {createHash,randomBytes} from 'node:crypto';
export const secretHash=value=>createHash('sha256').update(String(value)).digest('hex');
export function persistentStore(directory){
 const file=directory?path.join(directory,'coop-state-v1.json'):null;
 function load(){if(!file||!existsSync(file))return {version:1,profiles:[],rooms:[]};let data;try{data=JSON.parse(readFileSync(file,'utf8'));}catch(error){if(!existsSync(file+'.bak'))throw Error('Coop save cannot be read; original retained.');data=JSON.parse(readFileSync(file+'.bak','utf8'));}if(data.version!==1||!Array.isArray(data.rooms)||!Array.isArray(data.profiles))throw Error('Unsupported coop save; original retained.');return data;}
 function save(value){if(!file)return;mkdirSync(directory,{recursive:true});const temporary=file+'.tmp';writeFileSync(temporary,JSON.stringify(value),{mode:0o600});if(existsSync(file))copyFileSync(file,file+'.bak');renameSync(temporary,file);try{chmodSync(file,0o600);if(existsSync(file+'.bak'))chmodSync(file+'.bak',0o600);}catch{}}
 return{load,save};
}
export function newProfile(){return{id:randomBytes(12).toString('hex'),unlocks:{five:false,eight:false,desert:false},known:{enemies:[],towers:[]},bestWave:0};}
