import {spawnSync} from 'node:child_process';
import {readdirSync} from 'node:fs';
for(const file of readdirSync('src').filter(f=>f.endsWith('.js'))){const r=spawnSync(process.execPath,['--check','src/'+file],{stdio:'inherit'});if(r.status)process.exit(r.status);}
for(const file of ['server.mjs',...readdirSync('server').filter(f=>f.endsWith('.mjs')).map(f=>'server/'+f)]){const r=spawnSync(process.execPath,['--check',file],{stdio:'inherit'});if(r.status)process.exit(r.status);}
const test=spawnSync(process.execPath,['--test',...readdirSync('tests').filter(f=>f.endsWith('.test.mjs')).map(f=>'tests/'+f)],{stdio:'inherit'});process.exit(test.status??1);
