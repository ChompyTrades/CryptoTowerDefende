const entities=['enemies','towers','effects','puddles'];
// Null denotes a missing property; [] escapes an actual null. Other arrays are
// wrapped, preserving all values without field-name repetition in each row.
function table(rows){const keys=[...new Set(rows.flatMap(Object.keys))];return [keys,...rows.map(row=>keys.map(k=>!Object.hasOwn(row,k)?null:row[k]===null?[]:Array.isArray(row[k])?[row[k]]:row[k]))];}
function rows(table){const [keys,...values]=table;return values.map(row=>Object.fromEntries(keys.flatMap((key,i)=>row[i]===null?[]:[[key,Array.isArray(row[i])?(row[i].length?row[i][0]:null):row[i]]])));}
export function packColumns(message){
 const result={...message};if(!message.game)return result;const game={...message.game};result.game=game;
 for(const k of entities){if(Array.isArray(game[k]))game[k]=table(game[k]);else if(game[k]?.upsert)game[k]={...game[k],upsert:table(game[k].upsert)};}
 if(game.fields){game.fields={...game.fields};for(const k of entities)if(Array.isArray(game.fields[k]))game.fields[k]=table(game.fields[k]);}
 return result;
}
export function unpackColumns(message){
 if(!message.game)return message;const game=message.game;
 for(const k of entities){if(Array.isArray(game[k]))game[k]=rows(game[k]);else if(game[k]?.upsert)game[k].upsert=rows(game[k].upsert);}
 if(game.fields)for(const k of entities)if(Array.isArray(game.fields[k]))game.fields[k]=rows(game.fields[k]);return message;
}
