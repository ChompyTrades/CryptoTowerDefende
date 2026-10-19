// Shared client/server validation; never interpret display names as markup.
export function validatePlayerName(value){
 if(typeof value!=='string'||[...value].length>20||new TextEncoder().encode(value).length>128||/[\p{Cc}\p{Cf}]/u.test(value)||!/[\p{L}\p{N}\p{S}\p{P}]/u.test(value))throw Error('Name: 1–20 sichtbare Zeichen, keine Steuerzeichen.');
 return value.trim();
}
