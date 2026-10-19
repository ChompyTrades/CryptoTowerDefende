import {packColumns,unpackColumns} from './coop-columns.js';
const utf8=new TextEncoder(),text=new TextDecoder('utf-8',{fatal:true});
// Compressed binary transport, column-oriented JSON payload. Values remain exact.
export function encodeCompact(value){const packed=value?.type==='state'||value?.type==='patch';return utf8.encode(JSON.stringify([2,packed,packed?packColumns(value):value]));}
export function decodeCompact(bytes){const a=new Uint8Array(bytes.buffer??bytes,bytes.byteOffset??0,bytes.byteLength);if(a.length>8_000_000)throw Error('CTD packet too large');const v=JSON.parse(text.decode(a));if(!Array.isArray(v)||v.length!==3||v[0]!==2||typeof v[1]!=='boolean')throw Error('Unsupported CTD packet');return v[1]?unpackColumns(v[2]):v[2];}
export async function decodePacket(data){
 if(typeof data==='string')return JSON.parse(data);
 const stream=new Blob([data]).stream().pipeThrough(new DecompressionStream('gzip'));
 return decodeCompact(await new Response(stream).arrayBuffer());
}
