 import type { MotionParams } from './params'
 import type { MotionMode, MotionModeId } from './types'
 import type { MotionDerivedState } from '../state/types'
 import { electronCloudMode } from './modes/electronCloud'
 import { particleStreamMode } from './modes/particleStream'
 import { softGlowPulseMode } from './modes/softGlowPulse'
 import { energyColumnMode } from './modes/energyColumn'
 
 export function createMode(id: MotionModeId): MotionMode<MotionParams, MotionDerivedState> {
   switch (id) {
     case 'electronCloud':
       return electronCloudMode()
     case 'particleStream':
       return particleStreamMode()
     case 'softGlowPulse':
       return softGlowPulseMode()
     case 'energyColumn':
       return energyColumnMode()
   }
 }
