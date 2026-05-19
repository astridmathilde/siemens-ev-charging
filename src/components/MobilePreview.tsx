 import type { MotionParams } from '../motion/params'
 import type { MotionModeId } from '../motion/types'
 import type { ChargingInputs, DerivedChargingState } from '../state/types'
 import { ChargingSpeedCard } from './ChargingSpeedCard'
 
 export function MobilePreview(props: {
   label?: string
   viewport: 'mobile' | 'medium' | 'large'
   inputs: ChargingInputs
   derived: DerivedChargingState
   mode: MotionModeId
   motionEnabled: boolean
   motionParams: MotionParams
   seed: number
 }) {
   const { viewport, inputs, derived, mode, motionEnabled, motionParams, seed, label } = props
 
   const frame =
     viewport === 'mobile'
       ? { w: 390, h: 760, scale: 0.98 }
       : viewport === 'large'
         ? { w: 820, h: 1024, scale: 1.0 }
         : { w: 540, h: 920, scale: 1.0 }
 
   return (
     <section className="previewWrap">
       <div className="previewMeta">
         <div className="previewMetaLeft">
           <div className="previewBadge">{label ?? 'Preview'}</div>
           <div className="previewMetaLabel">{derived.summary}</div>
         </div>
         <div className="previewMetaRight">{frame.w}×{frame.h}</div>
       </div>
 
       <div
         className="previewFrame"
         style={
           {
             width: `${frame.w}px`,
             height: `${frame.h}px`,
             ['--uiScale' as never]: frame.scale,
           } as React.CSSProperties
         }
       >
         <div className="chargingScreen">
           <div className="chargingHeader">
             <div className="chargingHeaderTop">CHARGING (mobile)</div>
             <div className="chargingPct">{Math.round(inputs.batteryPct)}%</div>
           </div>
 
           <div className="chargingCards">
             <ChargingSpeedCard
               label="Charging speed"
               stateTitle={derived.stateTitle}
               kwText={`Current ${Math.round(inputs.kw)} kW`}
               explanation={derived.explanation}
               mode={mode}
               motionEnabled={motionEnabled}
               motionParams={motionParams}
               seed={seed}
               derived={derived}
             />
 
             <div className="smallCards">
               <div className="smallCard">
                 <div className="smallCardLabel">Estimated time</div>
                 <div className="smallCardValue">{derived.estimatedTime}</div>
                 <div className="smallCardHelp">{derived.estimatedTimeHelp}</div>
               </div>
               <div className="smallCard">
                 <div className="smallCardLabel">Estimated cost</div>
                 <div className="smallCardValue">{derived.estimatedCost}</div>
                 <div className="smallCardHelp">{derived.estimatedCostHelp}</div>
               </div>
             </div>
 
             <div className="chargingFooter">
               <button type="button" className="footerLink">
                 View details
               </button>
               <button type="button" className="footerPrimary">
                 Stop charging
               </button>
             </div>
           </div>
         </div>
       </div>
     </section>
   )
 }
