 import type { MotionParams } from '../params'
 import type { MotionMode, ModeContext } from '../types'
 import type { MotionDerivedState } from '../../state/types'
 import { clamp01, lerp } from '../../utils/lerp'
 import { mulberry32, randBetween, randN } from '../../utils/rng'
 
 type Speck = { y: number; xOff: number; a: number; s: number }
 
 export function energyColumnMode(): MotionMode<MotionParams, MotionDerivedState> {
   let rand = mulberry32(1)
   let specks: Speck[] = []
 
   const ensure = (count: number) => {
     const target = Math.max(1, Math.floor(count))
     if (specks.length === target) return
     specks = new Array(target).fill(0).map(() => ({
       y: randBetween(rand, 0, 1),
       xOff: randN(rand),
       a: randBetween(rand, 0.2, 1.0),
       s: randBetween(rand, 0.6, 2.2),
     }))
   }
 
   return {
     id: 'energyColumn',
     init: (_ctx, _dims, seed) => {
       rand = mulberry32(seed)
       specks = []
     },
     update: (dt, params, derived) => {
       const up = lerp(0.05, 1.35, derived.upward) * (0.4 + params.upwardDrift)
       for (const sp of specks) {
         sp.y -= dt * up * 0.22
         if (sp.y < -0.2) {
           sp.y = 1.2
           sp.xOff = randN(rand)
           sp.a = randBetween(rand, 0.2, 1.0)
           sp.s = randBetween(rand, 0.6, 2.2)
         }
         sp.a = clamp01(sp.a + randN(rand) * 0.18 * dt)
       }
       void derived
     },
     render: (ctx, dims, params, derived, modeCtx: ModeContext) => {
       ensure(Math.round(params.particleCount * lerp(0.2, 1.1, derived.density)))
 
       ctx.clearRect(0, 0, dims.w, dims.h)
 
       const cx = dims.w * 0.62
       const top = dims.h * 0.06
       const bottom = dims.h * 0.96
 
       const intensity = derived.intensity * clamp01(params.brightness)
       const columnW = lerp(dims.w * 0.18, dims.w * 0.46, clamp01(params.spread)) * lerp(0.75, 1.0, 1 - derived.constrained)
       const coreW = columnW * lerp(0.22, 0.55, clamp01(params.coreIntensity))
 
       const freq = 0.9 + 5.5 * params.pulseFrequency
       const pulse = 0.6 + 0.4 * Math.sin((modeCtx.now / 1000) * freq)
       const pulseBoost = lerp(0.85, 1.25, pulse * derived.pulse)
 
       ctx.save()
       ctx.globalCompositeOperation = 'lighter'
 
       // Column base gradient
       const g = ctx.createLinearGradient(cx, top, cx, bottom)
       g.addColorStop(0, 'rgba(0,0,0,0)')
       g.addColorStop(0.18, `rgba(53, 209, 255, ${0.08 * intensity * pulseBoost})`)
       g.addColorStop(0.5, `rgba(180, 250, 255, ${0.10 * intensity * pulseBoost})`)
       g.addColorStop(0.82, `rgba(53, 209, 255, ${0.06 * intensity * pulseBoost})`)
       g.addColorStop(1, 'rgba(0,0,0,0)')
 
       ctx.fillStyle = g
       ctx.fillRect(cx - columnW / 2, top, columnW, bottom - top)
 
       // Core
       const core = ctx.createLinearGradient(cx, top, cx, bottom)
       core.addColorStop(0, 'rgba(0,0,0,0)')
       core.addColorStop(0.3, `rgba(220, 255, 255, ${0.18 * intensity * pulseBoost})`)
       core.addColorStop(0.5, `rgba(220, 255, 255, ${0.22 * intensity * pulseBoost})`)
       core.addColorStop(0.75, `rgba(53, 209, 255, ${0.12 * intensity * pulseBoost})`)
       core.addColorStop(1, 'rgba(0,0,0,0)')
       ctx.fillStyle = core
       ctx.fillRect(cx - coreW / 2, top, coreW, bottom - top)
 
       // Specks (fragmentation shows as multiple lanes)
       const lanes = derived.fragmented > 0.15 ? 3 : 1
       for (const sp of specks) {
         const lane = lanes === 1 ? 0 : Math.floor(randBetween(rand, 0, lanes))
         const laneOff = lanes === 1 ? 0 : (lane - (lanes - 1) / 2) * (columnW * 0.18)
 
         const y = lerp(top, bottom, sp.y)
         const x = cx + laneOff + sp.xOff * (columnW * 0.14) * lerp(0.25, 1.0, params.jitter)
 
         const a = clamp01(sp.a * intensity) * lerp(1, 0.75, derived.taper) * lerp(1, 0.75, derived.constrained)
         const r = sp.s * lerp(0.6, 2.2, params.particleSize)
 
         const rg = ctx.createRadialGradient(x, y, 0, x, y, r * 7 * (0.4 + params.glow))
         rg.addColorStop(0, `rgba(220, 255, 255, ${0.22 * a})`)
         rg.addColorStop(0.4, `rgba(53, 209, 255, ${0.12 * a})`)
         rg.addColorStop(1, 'rgba(0,0,0,0)')
         ctx.fillStyle = rg
         ctx.beginPath()
         ctx.arc(x, y, r * 3, 0, Math.PI * 2)
         ctx.fill()
       }
 
       ctx.restore()
     },
   }
 }
