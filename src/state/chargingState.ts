 import { COST, THRESHOLDS } from './constants'
 import type { ChargingInputs, ChargingStateTitle, DerivedChargingState, MotionDerivedState } from './types'
 
 function clamp01(n: number) {
   return Math.max(0, Math.min(1, n))
 }
 
 function lerp(a: number, b: number, t: number) {
   return a + (b - a) * t
 }
 
 function smoothstep(edge0: number, edge1: number, x: number) {
   const t = clamp01((x - edge0) / (edge1 - edge0))
   return t * t * (3 - 2 * t)
 }
 
 function kwToIntensity(kw: number) {
   // Non-scientific, “readable” mapping.
   const x = clamp01(kw / 320)
   return Math.pow(x, 0.85)
 }
 
 function stateTitleFor(inputs: ChargingInputs, baseIntensity: number, taper: number): ChargingStateTitle {
   const constrained = inputs.temperature === 'cold' || inputs.powerSharing === 'shared'
 
   if (taper > 0.65 && baseIntensity > 0.35) return 'Limited'
   if (constrained && baseIntensity > 0.25) return 'Reduced'
   if (baseIntensity < 0.18) return 'Slow'
   if (baseIntensity > 0.78) return 'Fast'
   return 'Optimal'
 }
 
 function explanationFor(inputs: ChargingInputs, title: ChargingStateTitle, taper: number) {
   if (inputs.explanationMode === 'manual') return inputs.manualExplanation?.trim() || undefined
 
   if (inputs.temperature === 'cold') return 'Charging is slower because the battery is cold.'
   if (inputs.powerSharing === 'shared') return 'Speed is reduced because power is shared with other cars.'
   if (taper > 0.4) return 'Charging slows down near and after 80%.'
 
   if (title === 'Fast') return 'Charging is currently at a high rate.'
   if (title === 'Slow') return 'Charging is currently at a low rate.'
   return undefined
 }
 
 function derivedMotion(inputs: ChargingInputs, baseIntensity: number, taper: number): MotionDerivedState {
   const cold = inputs.temperature === 'cold' ? 1 : 0
   const shared = inputs.powerSharing === 'shared' ? 1 : 0
   const constrained = clamp01(0.55 * cold + 0.45 * shared)
 
   const taperFactor = 1 - 0.65 * taper
   const conditionFactor = 1 - 0.45 * constrained
 
   const intensity = clamp01(baseIntensity * taperFactor * conditionFactor)
   const density = clamp01(lerp(0.15, 1.0, intensity) * (1 - 0.2 * constrained))
   const brightness = clamp01(lerp(0.18, 1.0, intensity))
   const speed = clamp01(lerp(0.12, 1.0, intensity) * (1 - 0.25 * constrained))
 
   return {
     intensity,
     taper,
     constrained,
     fragmented: shared ? 0.55 : 0.0,
     brightness,
     density,
     speed,
     upward: clamp01(lerp(0.08, 1.0, intensity)),
     pulse: clamp01(lerp(0.12, 0.9, intensity) * (1 - 0.35 * constrained)),
   }
 }
 
 export function deriveChargingState(inputs: ChargingInputs): DerivedChargingState {
   const baseIntensity = kwToIntensity(inputs.kw)
   const taper = smoothstep(THRESHOLDS.taperStartPct, THRESHOLDS.taperEndPct, inputs.batteryPct)
 
   const title = stateTitleFor(inputs, baseIntensity, taper)
   const explanation = explanationFor(inputs, title, taper)
   const motionDerived = derivedMotion(inputs, baseIntensity, taper)
 
   // Lightweight “fake” secondary cards; keep stable for motion exploration.
   const minutes = Math.round(lerp(55, 14, clamp01(inputs.kw / 320)) + lerp(0, 18, taper))
   const estimatedTime = `${minutes} minutes`
   const estimatedTimeHelp = inputs.batteryPct >= 100 ? 'Fully charged' : 'Until full'
 
   const cost = COST.nokPerKwh * COST.sessionKwhEstimate * clamp01(lerp(0.65, 1.15, motionDerived.intensity))
   const estimatedCost = `${cost.toFixed(2).replace('.', ',')} NOK`
   const estimatedCostHelp = `${COST.nokPerKwh.toFixed(2).replace('.', ',')} per kWh`
 
   const summary = `${title} / ${inputs.temperature} / ${inputs.powerSharing} / ${Math.round(inputs.kw)} kW`
 
   return {
     stateTitle: title,
     explanation,
     intensity: motionDerived.intensity,
     taperFactor: 1 - taper,
     summary,
     estimatedTime,
     estimatedTimeHelp,
     estimatedCost,
     estimatedCostHelp,
     motionDerived,
   }
 }
