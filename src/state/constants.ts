 import type { ChargingInputs } from './types'
 
 export const DEFAULT_INPUTS: ChargingInputs = {
   kw: 224,
   batteryPct: 72,
   temperature: 'normal',
   powerSharing: 'none',
   explanationMode: 'auto',
   manualExplanation: '',
 }
 
 export const THRESHOLDS = {
   veryLowKw: 25,
   reducedKw: 80,
   moderateKw: 150,
   optimalKw: 240,
   peakKw: 320,
   taperStartPct: 80,
   taperEndPct: 95,
 }
 
 export const COST = {
   nokPerKwh: 6.89,
   sessionKwhEstimate: 20,
 }
