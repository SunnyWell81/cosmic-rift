import {CONFIG} from './config.mjs';

// A single wall-clock cursor owns production, saves and lifecycle transitions.
// Keep the cursor when a device clock moves backwards: that interval earns nothing.
export const MIN_TIMESTAMP=1577836800000;
export const MAX_TIMESTAMP=253402300799999;
export const validTimestamp=time=>Number.isSafeInteger(time)&&time>=MIN_TIMESTAMP&&time<=MAX_TIMESTAMP;

export class ProductionClock {
 constructor(game,now=Date.now()) {
  if(!validTimestamp(now))throw new Error('保存日時が不正です。');
  this.game=game;this.updatedAt=now;this.suspended=false;this.absence=null;
 }
 advance(now=Date.now(),offline=false) {
  if(!validTimestamp(now)||now<=this.updatedAt)return null;
  const seconds=(now-this.updatedAt)/1000;this.updatedAt=now;
  if(!offline&&!this.suspended&&seconds<=CONFIG.offline.backgroundThresholdSeconds){this.game.tick(seconds);return null;}
  const remaining=this.suspended?Math.max(0,this.game.offlineHours*3600-(this.absence?.credited??0)):this.game.offlineHours*3600;
  const result=this.game.applyOffline(seconds,remaining);
  if(this.suspended&&result) {
   if(!this.absence)this.absence=result;
   else this.absence={...result,seconds:this.absence.seconds+result.seconds,credited:this.absence.credited+result.credited,dm:this.absence.dm.add(result.dm),rm:this.absence.rm.add(result.rm)};
   return null;
  }
  return result;
 }
 pause(now=Date.now()) {
  const result=this.advance(now);
  if(!this.suspended){this.suspended=true;this.absence=result;}
 }
 resume(now=Date.now()) {
  if(!this.suspended)return this.advance(now);
  this.advance(now);
  const result=this.absence;this.suspended=false;this.absence=null;
  return result;
 }
}
