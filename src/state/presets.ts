 import type { ChargingInputs } from './types'
 import { THRESHOLDS } from './constants'
 
 export type Preset = {
   id: string
   label: string
   apply: Partial<ChargingInputs>
 }
 
 export const PRESETS: Record<string, Preset> = {
   veryLow: { id: 'veryLow', label: 'Very low', apply: { kw: THRESHOLDS.veryLowKw } },
   reduced: { id: 'reduced', label: 'Reduced', apply: { kw: THRESHOLDS.reducedKw } },
   moderate: { id: 'moderate', label: 'Moderate', apply: { kw: THRESHOLDS.moderateKw } },
   optimal: { id: 'optimal', label: 'Optimal', apply: { kw: THRESHOLDS.optimalKw } },
   peak: { id: 'peak', label: 'Peak', apply: { kw: THRESHOLDS.peakKw } },
 }
