/** All tunable game balance lives here. No backend or runtime dependency. */
export const CONFIG={
  version:2, productionScale:0.55, dmGrowth:1.15, rmGrowth:1.20, maxBuildingCount:9e12,
  baseClick:1, comboWindow:1.5, comboMax:0.15, comboStep:0.01,
  prestige:{threshold:1e6,base:10,power:0.4,minRunSeconds:180,permanentFacilityPower:15,bonusPerRoot:0.1,maxMultiplier:3},
  infinity:{first:1e5,growth:6},
  // minimumSeconds controls the return dialog only; every positive absence produces Matter.
  offline:{hours:8,efficiency:1,minimumSeconds:60,backgroundThresholdSeconds:30},
  rift:{minInterval:90,maxInterval:180,visibleSeconds:13,effects:[
    {id:'surge',name:'Matter Surge',label:'DM生産 ×7',weight:22,seconds:30,production:7},
    {id:'cache',name:'Cosmic Cache',label:'180秒分のDark Matter',weight:43,cacheSeconds:180},
    {id:'frenzy',name:'Click Frenzy',label:'クリック ×77',weight:10,seconds:15,click:77},
    {id:'stable',name:'Stable Rift',label:'DM生産 ×2',weight:25,seconds:90,production:2}
  ]},
  autosaveSeconds:30, uiInterval:200, maxPopups:14,
  upgradeMilestones:[10,25,50,100,200],upgradeCostFactors:[8,60,400,4000,60000],
  repeatUpgrade:{requirement:200,costFactor:150000,growth:12,power:1.5},
};
const names=['Matter Collector','Quantum Extractor','Dark Reactor','Orbital Harvester','Stellar Forge','Void Generator','Singularity Core','Black Hole Engine','Galactic Foundry','Cosmic Fabricator','Reality Converter','Dimension Reactor','Eternity Engine'];
const prices=[15,100,1100,12000,130000,1400000,20000000,330000000,5100000000,75000000000,1200000000000,19000000000000,330000000000000];
const rates=[.2,1.5,12,100,900,8000,70000,650000,6000000,60000000,650000000,7500000000,95000000000];
const reds=[1,25,400,6000,90000,1400000,25000000,500000000,10000000000,250000000000,7000000000000,220000000000000,8000000000000000];
const descriptions=['宇宙の微かな揺らぎを、最初の一粒へ。','量子の海から、未知の物質を抽出。','暗黒エネルギーを安定した力に変える。','惑星軌道を巡る巨大な採取ネットワーク。','恒星の心臓を、物質の鍛造炉に。','何もない空間から、無尽蔵の可能性を。','無限の密度をひとつの核に閉じ込める。','事象の地平線を越え、力を取り出す。','銀河そのものを動かす生産施設。','宇宙の構造を編み直し、物質を紡ぐ。','現実の法則を、新しい資源へ変換。','並行次元から流れ込む終わりなき力。','時間の外側で、永遠を生産する。'];
export const BUILDINGS=names.map((name,i)=>({id:i,name,cost:prices[i],rate:rates[i],redCost:reds[i],description:descriptions[i],symbol:['collector','quantum','reactor','orbital','stellar','void','core','blackhole','galaxy','cosmic','reality','dimension','eternity'][i]}));
export const CLICK_UPGRADES=[
  {id:'click1',name:'Event Horizon',description:'クリックの力 ×2',cost:75,unlock:30,mult:2},
  {id:'click2',name:'Gravitational Pull',description:'クリックの力 ×2',cost:600,unlock:500,mult:2,requires:'click1'},
  {id:'click3',name:'Tidal Compression',description:'クリックの力 ×4',cost:8000,unlock:5000,mult:4,requires:'click2'},
  {id:'click4',name:'Matter Coupling',description:'恒常DM/secの1%をクリックに追加',cost:30000,unlock:20000,dps:.01,requires:'click3'},
  {id:'click5',name:'Singularity Touch',description:'恒常DM/secの4%をクリックに追加',cost:700000,unlock:400000,dps:.04,requires:'click4'},
  {id:'click6',name:'Rift Attunement',description:'Rift効果中のクリック ×3',cost:15000000,unlock:10000000,rift:3,requires:'click5'},
  {id:'click7',name:'Cosmic Feedback',description:'恒常DM/secの5%をクリックに追加',cost:500000000,unlock:100000000,dps:.05,requires:'click6'},
  {id:'combo1',name:'Orbital Rhythm',description:'コンボ上限 +15ポイント・1クリックごとの上昇量 +0.5ポイント',cost:2500,unlock:1000,requires:'click2',comboMax:.15,comboStep:.005},
  {id:'combo2',name:'Resonant Pulse',description:'コンボ上限 +15ポイント・1クリックごとの上昇量 +0.5ポイント',cost:100000,unlock:50000,requires:'combo1',comboMax:.15,comboStep:.005},
  {id:'combo3',name:'Singularity Cadence',description:'コンボ上限 +15ポイント・1クリックごとの上昇量 +1ポイント',cost:5000000,unlock:2000000,requires:'combo2',comboMax:.15,comboStep:.01},
];
const roman=['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII'];
export const SKILLS=[
  {id:'touch1',name:'Quantum Touch',category:'探索',description:'クリックの力 +25%',cost:1,earned:1,effect:'click',value:1.25},
  {id:'flow1',name:'Dark Flow',category:'探索',description:'全施設のDM生産 +10%',cost:1,earned:1,effect:'production',value:1.1},
  {id:'touch2',name:'Gravity Well',category:'探索',description:'クリックの力 +50%',cost:2,earned:3,requires:'touch1',effect:'click',value:1.5},
  {id:'flow2',name:'Cosmic Expansion',category:'探索',description:'全施設のDM生産 +25%',cost:2,earned:3,requires:'flow1',effect:'production',value:1.25},
  {id:'rift1',name:'Rift Sensing',category:'裂け目',description:'Cosmic Riftの出現間隔 −10%',cost:1,earned:2,effect:'riftFrequency',value:.9},
  {id:'rift2',name:'Temporal Anchor',category:'裂け目',description:'Riftの表示時間 +20%',cost:2,earned:4,requires:'rift1',effect:'riftDuration',value:1.2},
  {id:'rift3',name:'Event Echo',category:'裂け目',description:'Rift効果の持続時間 +25%',cost:3,earned:7,requires:'rift2',effect:'effectDuration',value:1.25},
  {id:'rift4',name:'Cosmic Fortune',category:'裂け目',description:'Cosmic Cacheの獲得量 ×2',cost:3,earned:10,requires:'rift3',effect:'cache',value:2},
  {id:'prestige1',name:'Crimson Memory',category:'永続',description:'PrestigeのRed Matter +10%',cost:2,earned:4,effect:'prestige',value:1.1},
  {id:'prestige2',name:'Scarlet Legacy',category:'永続',description:'PrestigeのRed Matter +25%',cost:3,earned:8,requires:'prestige1',effect:'prestige',value:1.25},
  {id:'offline1',name:'Silent Observer',category:'時間',description:'オフライン生産効率 +10ポイント',cost:1,earned:2,effect:'offline',value:.1},
  {id:'offline2',name:'Deep Sleep',category:'時間',description:'オフライン上限 +2時間',cost:2,earned:4,requires:'offline1',effect:'offlineHours',value:2},
  {id:'offline3',name:'Timeless Watch',category:'時間',description:'オフライン生産効率 +15ポイント',cost:3,earned:8,requires:'offline2',effect:'offline',value:.15},
  {id:'offline4',name:'Eternal Watch',category:'時間',description:'オフライン上限 +6時間',cost:4,earned:13,requires:'offline3',effect:'offlineHours',value:6},
  {id:'red1',name:'Permanent Imprint',category:'永続',description:'永続施設のDM・RM生産 +25%',cost:2,earned:5,effect:'red',value:1.25},
  {id:'red2',name:'Crimson Convergence',category:'永続',description:'永続施設のDM・RM生産 +50%',cost:4,earned:12,requires:'red1',effect:'red',value:1.5},
  {id:'flow3',name:'Universal Constant',category:'探索',description:'全施設のDM生産 +50%',cost:4,earned:12,requires:'flow2',effect:'production',value:1.5},
  {id:'touch3',name:'Infinite Touch',category:'探索',description:'恒常DM/secの2%をクリックに追加',cost:3,earned:9,requires:'touch2',effect:'clickDps',value:.02},
  {id:'rhythm1',name:'Enduring Rhythm',category:'探索',description:'コンボ上限 +10ポイント・1クリックごとの上昇量 +0.5ポイント（永続）',cost:1,earned:3,requires:'touch1',comboMax:.1,comboStep:.005},
  {id:'rhythm2',name:'Eternal Cadence',category:'探索',description:'コンボ上限 +15ポイント・1クリックごとの上昇量 +0.5ポイント（永続）',cost:3,earned:9,requires:'rhythm1',comboMax:.15,comboStep:.005},
  ...BUILDINGS.slice(0,9).map((b,i)=>({id:`special${i}`,name:`${b.name.split(' ')[0]} Mastery`,category:'施設',description:`${b.name}のDM・RM生産 +50%`,cost:2+Math.floor(i/3),earned:4+i*3,effect:`building${i}`,value:1.5})),
  ...BUILDINGS.map((b,i)=>({id:`resonance${i}`,name:`Red Resonance ${roman[i]}`,category:'共鳴',description:`永続${b.name}が転生倍率を除く恒久DM能力の50%をRM/secとして生成`,cost:4+i,earned:10+i*5,requires:i?`resonance${i-1}`:'red1',effect:`resonance${i}`,value:1}))
];
export const FACILITY_UPGRADES=BUILDINGS.flatMap((b,i)=>CONFIG.upgradeMilestones.map((amount,t)=>({id:`b${i}u${t}`,building:i,tier:t,amount,cost:b.cost*CONFIG.upgradeCostFactors[t],name:[`${b.name.split(' ')[0]} Calibration`,'Quantum Synchrony','Gravity Cascade','Stellar Network','Infinite Architecture'][t],description:t===2?'生産 ×2 ＋ 上位施設1個につき +1%':t===4?'生産 ×2 ＋ 全施設25個につき +1%':'施設生産 ×2'})));
export const UPGRADES=[...CLICK_UPGRADES,...FACILITY_UPGRADES];
// Historical combo records survive the loss of run upgrades at Prestige.
export const MAX_COMBO_PERCENT=Math.round((CONFIG.comboMax+[...CLICK_UPGRADES,...SKILLS].reduce((sum,item)=>sum+(item.comboMax||0),0))*100);
