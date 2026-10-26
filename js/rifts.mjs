import {CONFIG,BUILDINGS} from './config.mjs';

// Keep temporary targets separate from permanent production and research.
export const activeRift=(state,id)=>state.effects.find(e=>e.id===id&&e.remaining>0);
export function riftProductionFactor(state,facility){
 const fever=activeRift(state,'surge'),target=activeRift(state,'facility');
 return (fever?CONFIG.rift.effects.find(e=>e.id==='surge').production:1)*(target?.target===facility?CONFIG.rift.effects.find(e=>e.id==='facility').facilityProduction:1);
}
export const riftPriceFactor=state=>activeRift(state,'market')?CONFIG.rift.effects.find(e=>e.id==='market').price:1;
export function chooseRiftFacility(state,random,contributions){
 const owned=BUILDINGS.filter(b=>state.buildings[b.id]+state.redBuildings[b.id]>0);
 const pool=owned.length?owned:BUILDINGS;
 if(!owned.length)return pool[Math.min(pool.length-1,Math.floor(random()*pool.length))].id;
 // Square-root weighting retains variety without repeatedly favoring negligible output.
 const rates=pool.map(b=>state.buildings[b.id]+state.redBuildings[b.id]),peak=Math.max(...rates);
 // The engine supplies constant DM contribution; plain counts are a fallback for callers.
 const powers=pool.map((b,i)=>contributions?.[b.id]??rates[i]/peak);
 const weights=powers.map(p=>Math.sqrt(Math.max(0,p))+.02/pool.length),total=weights.reduce((a,b)=>a+b,0);let roll=random()*total;
 return pool[weights.findIndex((w)=>(roll-=w)<0)]?.id??pool.at(-1).id;
}
export const FEVER_PRIORITY=['surge','frenzy','facility','market'];
export const feverColor=state=>FEVER_PRIORITY.find(id=>activeRift(state,id))||'';
export function riftEffectText(effect){
 const spec=CONFIG.rift.effects.find(e=>e.id===effect.id);
 return `${spec.name} · ${spec.label}${effect.id==='facility'?` · ${BUILDINGS[effect.target].name}`:''}`;
}
