// Legacy saves retain their single deal; each token buys one new tower at -40%.
export const availableDeals=g=>g.deals?.length?[...g.deals]:g.deal?[g.deal]:[];
export const dealCount=(g,type)=>availableDeals(g).filter(k=>k===type).length;
export function consumeDeal(g,type){const list=availableDeals(g),i=list.indexOf(type);if(i<0)return false;list.splice(i,1);g.deals=list;g.deal=list.at(-1)||null;return true;}
export function awardDeal(g,weights,roll){const list=availableDeals(g),unused=weights.filter(w=>!list.includes(w.type)),pool=unused.length?unused:weights;let value=roll*pool.reduce((n,w)=>n+w.weight,0),chosen=pool.at(-1).type;for(const w of pool){value-=w.weight;if(value<0){chosen=w.type;break;}}g.deals=[...list,chosen];g.deal=chosen;return chosen;}
