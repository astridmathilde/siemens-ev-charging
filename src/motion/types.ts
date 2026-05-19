 export type MotionModeId = 'electronCloud' | 'particleStream' | 'softGlowPulse' | 'energyColumn'
 
 export const MOTION_MODES: Array<{ id: MotionModeId; label: string }> = [
   { id: 'electronCloud', label: 'Electron cloud' },
   { id: 'particleStream', label: 'Particle stream' },
   { id: 'softGlowPulse', label: 'Soft glow pulse' },
   { id: 'energyColumn', label: 'Energy column' },
 ]
 
 export type Dims = { w: number; h: number; dpr: number }
 
 export type ModeContext = {
   now: number
 }
 
 export type MotionMode<Params, Derived> = {
   id: MotionModeId
   init: (ctx: CanvasRenderingContext2D, dims: Dims, seed: number) => void
   update: (dt: number, params: Params, derived: Derived, modeCtx: ModeContext) => void
   render: (ctx: CanvasRenderingContext2D, dims: Dims, params: Params, derived: Derived, modeCtx: ModeContext) => void
   dispose?: () => void
 }
