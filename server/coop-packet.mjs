import {gzipSync,gunzipSync} from 'node:zlib';
import {encodeCompact,decodeCompact} from '../src/coop-binary.js';
export const encodePacket=value=>gzipSync(encodeCompact(value),{level:3});
export const decodeNodePacket=(data,binary)=>binary?decodeCompact(gunzipSync(data,{maxOutputLength:8_000_000})):JSON.parse(data);
