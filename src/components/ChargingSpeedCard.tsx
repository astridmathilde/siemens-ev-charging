 import type { MotionParams } from '../motion/params'
 import type { MotionModeId } from '../motion/types'
 import type { DerivedChargingState } from '../state/types'
 import { MotionRenderer } from '../motion/MotionRenderer'
 
 export function ChargingSpeedCard(props: {
   label: string
   stateTitle: string
   kwText: string
   explanation?: string
   mode: MotionModeId
   motionEnabled: boolean
   motionParams: MotionParams
   seed: number
   derived: DerivedChargingState
 }) {
   const { label, stateTitle, kwText, explanation, mode, motionEnabled, motionParams, seed, derived } =
     props
 
   return (
     <div className="speedCard">
       <div className="speedCardLeft">
         <div className="speedCardLabelRow">
           <div className="speedCardLabel">{label}</div>
         </div>
         <div className="speedCardTitle">{stateTitle}</div>
         <div className="speedCardKw">{kwText}</div>
         {explanation ? <div className="speedCardBody">{explanation}</div> : null}
       </div>
 
       <div className="speedCardRight" aria-hidden="true">
         <MotionRenderer
           enabled={motionEnabled}
           mode={mode}
           params={motionParams}
           seed={seed}
           derived={derived.motionDerived}
         />
       </div>
     </div>
   )
 }
