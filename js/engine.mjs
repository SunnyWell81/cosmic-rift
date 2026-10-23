import {Huge,H,geometricCost,maxAffordable} from './number.mjs';
import {CONFIG,BUILDINGS,SKILLS,UPGRADES,CLICK_UPGRADES} from './config.mjs';
export const NUMBER_FIELDS=['dm','runDM','lifetimeDM','rm','lifetimeRM'];
export const HUGE_STATS=['highestDps','clickDM','buildingDM','riftDM','prestigeRM','buildingRM','offlineDM','offlineRM'];
export function freshState(now=Date.now()) {
  return {version:CONFIG.version,createdAt:now,savedAt:now,runStartedAt:now,dm:H(0),runDM:H(0),lifetimeDM:H(0),rm:H(0),lifetimeRM:H(0),buildings:Array(13).fill(0),redBuildings:Array(13).fill(0),endless:Array(13).fill(0),upgrades:[],skills:[],achievements:[],infinityEarned:0,infinitySpent:0,prestiges:0,runTime:0,playTime:0,stats:{...Object.fromEntries(HUGE_STATS.map(k=>[k,H(0)])),clicks:0,buildingsBought:0,redBought:0,upgradesBought:0,riftsAppeared:0,riftsClicked:0,offlineSeconds:0,highestBuildings:Array(13).fill(0),highestRedBuildings:Array(13).fill(0),maxCombo:0},settings:{notation:'standard',motion:true,particles:true},effects:[]};
}
const a=(id,name,description,category,test,hidden=false)=>({id,name,description,category,test,hidden});
export const ACHIEVEMENTS=[
 ...[1,100,1000,10000,100000].map((v,i)=>a(`click${i}`,['First Contact','Gravitational Grip','Event Horizon','Patient Observer','Unstoppable'][i],`${v.toLocaleString('en-US')} 回クリック`,'クリック',s=>s.stats.clicks>=v)),
 ...[100,1e3,1e4,1e5,1e6,1e8,1e10,1e12,1e15,1e20,1e30,1e50,1e100,1e300].map((v,i)=>a(`dm${i}`,['A Speck of Darkness','Dark Beginnings','Growing Gravity','Quantum Leap','One in a Million','Beyond the Orbit','Stellar Scale','A Trillion Stars','Galactic Reach','Cosmic Architect','Reality Bender','Unfathomable','Infinite Horizon','Beyond Numbers'][i],`Lifetime DM ≥ ${v.toExponential()}`,'生産',s=>s.lifetimeDM.gte(v))),
 ...[1,10,100,1000,1e4,1e6,1e9,1e12,1e20].map((v,i)=>a(`dps${i}`,`Dark Flow ${i+1}`,`最高DM/sec ≥ ${v.toExponential()}`,'生産',s=>s.stats.highestDps.gte(v))),
 ...BUILDINGS.flatMap((b,i)=>[1,25,100].map((v,j)=>a(`facility${i}_${j}`,`${b.name.split(' ')[0]} ${['Pioneer','Expert','Architect'][j]}`,`${b.name} ${v}個を所有`,'施設',s=>s.stats.highestBuildings[i]>=v))),
 ...[10,100,500,1000,5000].map((v,i)=>a(`total${i}`,`Megastructure ${i+1}`,`累計施設購入 ${v}個`,'施設',s=>s.stats.buildingsBought>=v)),
 ...[1,5,25,100].map((v,i)=>a(`prestige${i}`,['A New Universe','Cosmic Rebirth','Endless Cycle','Eternal Return'][i],`Prestige ${v}回`,'永続',s=>s.prestiges>=v)),
 ...[1,100,1e4,1e8,1e15].map((v,i)=>a(`rm${i}`,`Crimson Legacy ${i+1}`,`Lifetime RM ≥ ${v.toExponential()}`,'永続',s=>s.lifetimeRM.gte(v))),
 ...[1,10,100].map((v,i)=>a(`red${i}`,`Permanent Footprint ${i+1}`,`累計永続施設購入 ${v}個`,'永続',s=>s.stats.redBought>=v)),
 ...[1,5,12,25,50].map((v,i)=>a(`im${i}`,`Infinity Awaits ${i+1}`,`Infinity Matter累計 ${v}`,'Infinity',s=>s.infinityEarned>=v)),
 ...[1,5,15,30].map((v,i)=>a(`skill${i}`,`Awakened Mind ${i+1}`,`Skill ${v}個`,'Infinity',s=>s.skills.length>=v)),
 ...[1,10,50,200].map((v,i)=>a(`rift${i}`,`Rift Walker ${i+1}`,`Cosmic Riftを${v}回捕捉`,'裂け目',s=>s.stats.riftsClicked>=v)),
 ...[60,3600,28800].map((v,i)=>a(`offline${i}`,`While You Were Away ${i+1}`,`オフライン生産 ${v/60}分`,'時間',s=>s.stats.offlineSeconds>=v)),
 a('resonant','Red Awakening','最初のRed Resonanceを取得','永続',s=>s.skills.includes('resonance0')),
 a('secret77','Lucky Singularity','77回ブラックホールを観測','隠し',s=>s.stats.clicks>=77,true),
 a('secretcombo','A Steady Hand','連続クリックボーナス +15%を達成','隠し',s=>s.stats.maxCombo>=15,true),
 a('secretred','Second Heartbeat','永続施設からRed Matterを生産','隠し',s=>s.stats.buildingRM.gt(0),true),
 a('secretall','Thirteen Horizons','全13種類の施設を所有','隠し',s=>s.stats.highestBuildings.every(n=>n>0),true)
];
export class Game {
 constructor(state=freshState(),random=Math.random) {this.state=state;this.random=random;this.listeners=[];this.rift=null;this.nextRift=this.riftInterval();this.combo=0;this.lastClick=-Infinity;this.clock=0;this.refresh();}
 onEvent(fn) {this.listeners.push(fn);return()=>this.listeners=this.listeners.filter(f=>f!==fn);}
 emit(type,data={}) {this.listeners.forEach(fn=>fn({type,...data}));}
 skillFactor(effect) {return SKILLS.filter(k=>k.effect===effect&&this.state.skills.includes(k.id)).reduce((n,k)=>n*k.value,1);}
 skillSum(effect) {return SKILLS.filter(k=>k.effect===effect&&this.state.skills.includes(k.id)).reduce((n,k)=>n+k.value,0);}
 refresh() {
  const s=this.state,total=s.buildings.reduce((a,b)=>a+b,0)+s.redBuildings.reduce((a,b)=>a+b,0);
  const global=this.skillFactor('production'),rebirth=this.prestigeMultiplier(); let dm=H(0),rm=H(0);
  const comboBonuses=[...CLICK_UPGRADES.filter(u=>s.upgrades.includes(u.id)),...SKILLS.filter(k=>s.skills.includes(k.id))];
  this.comboMax=CONFIG.comboMax+comboBonuses.reduce((sum,item)=>sum+(item.comboMax||0),0);
  this.comboStep=CONFIG.comboStep+comboBonuses.reduce((sum,item)=>sum+(item.comboStep||0),0);
  this.combo=Math.min(this.combo,this.comboMax);
  this.facilityRates=BUILDINGS.map((b,i)=>{
   let permanent=H(b.rate).mul(CONFIG.productionScale).mul(global).mul(this.skillFactor(`building${i}`));
   let normal=permanent;
   for(let t=0;t<5;t++) if(s.upgrades.includes(`b${i}u${t}`)) {
    normal=normal.mul(2);
    if(t===2) normal=normal.mul(1+(s.buildings[i+1]||0)*.01);
    if(t===4) normal=normal.mul(1+total*.0004);
   }
   normal=normal.mul(H(CONFIG.repeatUpgrade.power).pow(s.endless[i]));
   normal=normal.mul(rebirth);
   const dark=normal.mul(s.buildings[i]);
   // RM capacity uses only permanent factors: never run upgrades, combo or Rift buffs.
   const redCapacity=permanent.mul(CONFIG.prestige.permanentFacilityPower).mul(this.skillFactor('red'));
   const redUnit=redCapacity.mul(rebirth);
   const red=redUnit.mul(s.redBuildings[i]);
   const redRate=s.skills.includes(`resonance${i}`)?redCapacity.mul(s.redBuildings[i]).mul(.5):H(0);
   dm=dm.add(dark).add(red);rm=rm.add(redRate);
   return {unit:normal,dark,red,redUnit,rm:redRate,total:dark.add(red)};
  });
  this.baseDps=dm;this.rmps=rm;
  this.productionMultiplier=s.effects.reduce((n,e)=>n*(CONFIG.rift.effects.find(x=>x.id===e.id)?.production||1),1);
  this.dps=dm.mul(this.productionMultiplier);
  let click=H(CONFIG.baseClick).mul(this.skillFactor('click')).mul(rebirth),fraction=this.skillSum('clickDps');
  for(const u of CLICK_UPGRADES) if(s.upgrades.includes(u.id)) {if(u.mult) click=click.mul(u.mult);fraction+=u.dps||0;}
  click=click.add(dm.mul(fraction));
  for(const u of CLICK_UPGRADES) if(u.rift&&s.upgrades.includes(u.id)&&s.effects.length) click=click.mul(u.rift);
  this.baseClick=click;
  this.clickPower=click.mul(s.effects.reduce((n,e)=>n*(CONFIG.rift.effects.find(x=>x.id===e.id)?.click||1),1));
  s.stats.highestDps=Huge.max(s.stats.highestDps,this.dps);
 }
 get infinity() {return this.state.infinityEarned-this.state.infinitySpent;}
 get infinityGoal() {return H(CONFIG.infinity.first).mul(H(CONFIG.infinity.growth).pow(this.state.infinityEarned));}
 get infinityProgress() {return Math.max(0,Math.min(1,this.state.lifetimeDM.div(this.infinityGoal).toNumber()));}
 get offlineEfficiency() {return CONFIG.offline.efficiency+this.skillSum('offline');}
 get offlineHours() {return CONFIG.offline.hours+this.skillSum('offlineHours');}
 riftInterval() {return (CONFIG.rift.minInterval+this.random()*(CONFIG.rift.maxInterval-CONFIG.rift.minInterval))*this.skillFactor('riftFrequency');}
 awardDM(amount,source='building') {const s=this.state;amount=H(amount);s.dm=s.dm.add(amount);s.runDM=s.runDM.add(amount);s.lifetimeDM=s.lifetimeDM.add(amount);const key={click:'clickDM',building:'buildingDM',rift:'riftDM',offline:'offlineDM'}[source];if(key)s.stats[key]=s.stats[key].add(amount);}
 awardRM(amount,source='building') {const s=this.state;amount=H(amount);s.rm=s.rm.add(amount);s.lifetimeRM=s.lifetimeRM.add(amount);const key={building:'buildingRM',prestige:'prestigeRM',offline:'offlineRM'}[source];if(key)s.stats[key]=s.stats[key].add(amount);}
 checkProgress() {
  const s=this.state;
  if(s.lifetimeDM.gte(CONFIG.infinity.first)) {
   const earned=Math.max(s.infinityEarned,Math.floor((s.lifetimeDM.log10()-Math.log10(CONFIG.infinity.first))/Math.log10(CONFIG.infinity.growth)+1e-10)+1);
   if(earned>s.infinityEarned) {const count=earned-s.infinityEarned;s.infinityEarned=earned;this.emit('infinity',{count});}
  }
  for(const achievement of ACHIEVEMENTS) if(!s.achievements.includes(achievement.id)&&achievement.test(s)) {s.achievements.push(achievement.id);this.emit('achievement',{achievement});}
 }
 click() {
  const s=this.state;this.combo=this.clock-this.lastClick<CONFIG.comboWindow?Math.min(this.comboMax,this.combo+this.comboStep):0;
  this.lastClick=this.clock;const amount=this.clickPower.mul(1+this.combo);this.awardDM(amount,'click');s.stats.clicks++;s.stats.maxCombo=Math.max(s.stats.maxCombo,Math.floor(this.combo*100+1e-8));this.checkProgress();this.emit('click',{amount});return amount;
 }
 cost(i,currency='dm',n=1) {const b=BUILDINGS[i],red=currency==='rm';return geometricCost(red?b.redCost:b.cost,red?CONFIG.rmGrowth:CONFIG.dmGrowth,(red?this.state.redBuildings:this.state.buildings)[i],n);}
 affordable(i,currency='dm') {const b=BUILDINGS[i],red=currency==='rm';return maxAffordable(this.state[currency],red?b.redCost:b.cost,red?CONFIG.rmGrowth:CONFIG.dmGrowth,(red?this.state.redBuildings:this.state.buildings)[i],CONFIG.maxBuildingCount);}
 buy(i,currency='dm',count=1) {
  if(!BUILDINGS[i]||!['dm','rm'].includes(currency)) return false;
  const s=this.state,owned=currency==='rm'?s.redBuildings:s.buildings;
  const n=count==='max'?this.affordable(i,currency):count;
  if(!Number.isSafeInteger(n)||n<1||n+owned[i]>CONFIG.maxBuildingCount) return false;
  const cost=this.cost(i,currency,n);if(!s[currency].gte(cost)) return false;
  s[currency]=s[currency].sub(cost);owned[i]+=n;s.stats.buildingsBought+=n;
  if(currency==='rm') {s.stats.redBought+=n;s.stats.highestRedBuildings[i]=Math.max(s.stats.highestRedBuildings[i],owned[i]);}
  else s.stats.highestBuildings[i]=Math.max(s.stats.highestBuildings[i],owned[i]);
  this.refresh();this.checkProgress();this.emit('purchase',{building:i,count:n,currency});return n;
 }
 upgradeAvailable(u) {const s=this.state;return !s.upgrades.includes(u.id)&&(!u.requires||s.upgrades.includes(u.requires))&&(u.building!==undefined?s.buildings[u.building]+s.redBuildings[u.building]>=u.amount:s.runDM.gte(u.unlock));}
 buyUpgrade(id) {
  const u=UPGRADES.find(u=>u.id===id);if(!u||!this.upgradeAvailable(u)||!this.state.dm.gte(u.cost)) return false;
  this.state.dm=this.state.dm.sub(u.cost);this.state.upgrades.push(id);this.state.stats.upgradesBought++;this.refresh();this.checkProgress();this.emit('upgrade',{upgrade:u});return true;
 }
 repeatCost(i) {return H(BUILDINGS[i].cost).mul(CONFIG.repeatUpgrade.costFactor).mul(H(CONFIG.repeatUpgrade.growth).pow(this.state.endless[i]));}
 buyRepeat(i) {const s=this.state;if(!BUILDINGS[i]||s.buildings[i]+s.redBuildings[i]<CONFIG.repeatUpgrade.requirement||!s.dm.gte(this.repeatCost(i))||s.endless[i]>=1e9)return false;s.dm=s.dm.sub(this.repeatCost(i));s.endless[i]++;s.stats.upgradesBought++;this.refresh();return true;}
 skillAvailable(k) {return !this.state.skills.includes(k.id)&&this.state.infinityEarned>=k.earned&&(!k.requires||this.state.skills.includes(k.requires));}
 buySkill(id) {const k=SKILLS.find(k=>k.id===id);if(!k||!this.skillAvailable(k)||this.infinity<k.cost)return false;this.state.infinitySpent+=k.cost;this.state.skills.push(id);this.refresh();this.checkProgress();this.emit('skill',{skill:k});return true;}
 // Square-root growth rewards rebirth without compounding every run; RM capacity is excluded.
 prestigeMultiplier(count=this.state.prestiges) {return Math.min(CONFIG.prestige.maxMultiplier,1+CONFIG.prestige.bonusPerRoot*Math.sqrt(count));}
 prestigeRewardAt(produced) {produced=H(produced);if(produced.lt(CONFIG.prestige.threshold))return H(0);return produced.div(CONFIG.prestige.threshold).pow(CONFIG.prestige.power).mul(CONFIG.prestige.base).mul(this.skillFactor('prestige')).floor();}
 prestigeReward() {return this.prestigeRewardAt(this.state.runDM);}
 nextPrestigeReward() {
  const produced=this.state.runDM,current=this.prestigeReward();
  let reward=current.add(1);
  // Huge numbers cannot represent a single unit at large exponents. Use a representable increase.
  if(reward.eq(current))reward=current.mul(1+1e-12).floor();
  let target=Huge.max(H(CONFIG.prestige.threshold),reward.div(CONFIG.prestige.base).div(this.skillFactor('prestige')).pow(1/CONFIG.prestige.power).mul(CONFIG.prestige.threshold));
  if(this.prestigeRewardAt(target).lt(reward))target=target.mul(1+1e-12);
  if(target.lte(produced))target=produced.mul(1+1e-12);
  return {reward:this.prestigeRewardAt(target),target,remaining:target.sub(produced)};
 }
 canPrestige() {return this.state.runTime>=CONFIG.prestige.minRunSeconds&&this.prestigeReward().gte(1);}
 prestige(now=Date.now()) {
  if(!this.canPrestige())return false;
  const reward=this.prestigeReward(),s=this.state;this.awardRM(reward,'prestige');s.prestiges++;s.dm=H(0);s.runDM=H(0);s.buildings=Array(13).fill(0);s.endless=Array(13).fill(0);s.upgrades=[];s.effects=[];s.runTime=0;s.runStartedAt=now;this.combo=0;this.rift=null;this.nextRift=this.riftInterval();this.refresh();this.checkProgress();this.emit('prestige',{reward});return reward;
 }
 spawnRift() {this.rift={remaining:CONFIG.rift.visibleSeconds*this.skillFactor('riftDuration'),x:.12+this.random()*.72,y:.18+this.random()*.58};this.state.stats.riftsAppeared++;this.emit('rift');}
 catchRift() {
  if(!this.rift)return false;
  this.rift=null;const s=this.state;s.stats.riftsClicked++;
  const total=CONFIG.rift.effects.reduce((n,e)=>n+e.weight,0);let r=this.random()*total;
  const effect=CONFIG.rift.effects.find(e=>(r-=e.weight)<0)||CONFIG.rift.effects[0];
  if(effect.cacheSeconds) {const gain=Huge.max(this.baseDps,H(1)).mul(effect.cacheSeconds).mul(this.skillFactor('cache'));this.awardDM(gain,'rift');this.emit('riftReward',{effect,gain});}
  else {const existing=s.effects.find(e=>e.id===effect.id),seconds=effect.seconds*this.skillFactor('effectDuration');if(existing)existing.remaining=Math.max(existing.remaining,seconds);else s.effects.push({id:effect.id,remaining:seconds});this.emit('riftReward',{effect});}
  this.refresh();this.checkProgress();return effect;
 }
 tick(seconds) {
  if(!Number.isFinite(seconds)||seconds<=0)return;
  const s=this.state;this.clock+=seconds;s.runTime+=seconds;s.playTime+=seconds;
  if(this.clock-this.lastClick>=CONFIG.comboWindow)this.combo=0;
  // At most four effect boundaries, independent of elapsed time.
  const boundaries=[...new Set(s.effects.map(e=>e.remaining).filter(t=>t>0&&t<seconds))].sort((a,b)=>a-b);boundaries.push(seconds);
  let previous=0;
  for(const end of boundaries) {
   const dt=end-previous;this.refresh();this.awardDM(this.dps.mul(dt),'building');this.awardRM(this.rmps.mul(dt),'building');
   s.effects=s.effects.map(e=>({...e,remaining:e.remaining-dt})).filter(e=>e.remaining>1e-8);previous=end;
  }
  if(this.rift){this.rift.remaining-=seconds;if(this.rift.remaining<=0){this.rift=null;this.emit('riftExpired');}}
  this.nextRift-=seconds;if(this.nextRift<=0){if(!this.rift)this.spawnRift();this.nextRift=this.riftInterval();}
  this.refresh();this.checkProgress();
 }
 applyOffline(seconds,remainingCap=this.offlineHours*3600) {
  if(!Number.isFinite(seconds)||seconds<=0||!Number.isFinite(remainingCap)||remainingCap<0)return null;
  this.state.effects=[];this.combo=0;this.lastClick=-Infinity;this.refresh();
  const credited=Math.min(seconds,this.offlineHours*3600,remainingCap),dm=this.baseDps.mul(credited*this.offlineEfficiency),rm=this.rmps.mul(credited*this.offlineEfficiency);
  this.awardDM(dm,'offline');this.awardRM(rm,'offline');this.state.stats.offlineSeconds+=credited;this.state.runTime+=seconds;this.state.playTime+=credited;this.rift=null;this.nextRift=this.riftInterval();this.refresh();this.checkProgress();return {seconds,credited,dm,rm,efficiency:this.offlineEfficiency};
 }
 hydrateEffects() {this.refresh();}
}
