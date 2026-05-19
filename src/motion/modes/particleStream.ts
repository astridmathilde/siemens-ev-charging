 import type { MotionParams } from '../params'
 import type { MotionMode, Dims, ModeContext } from '../types'
 import type { MotionDerivedState } from '../../state/types'
 import { clamp01, lerp } from '../../utils/lerp'
 import { mulberry32, randBetween, randN } from '../../utils/rng'
 
 type Particle = { x: number; y: number; vy: number; vx: number; a: number; r: number }
 
 export function particleStreamMode(): MotionMode<MotionParams, MotionDerivedState> {
   let rand = mulberry32(1)
   let ps: Particle[] = []
   let lastDt = 1 / 60
 
   const ensure = (count: number, dims: Dims) => {
     const target = Math.max(1, Math.floor(count))
     if (ps.length === target) return
     ps = new Array(target).fill(0).map(() => ({
       x: randBetween(rand, dims.w * 0.15, dims.w * 0.9),
       y: randBetween(rand, -dims.h, dims.h),
       vy: randBetween(rand, 40, 220),
       vx: randN(rand) * 20,
       a: randBetween(rand, 0.25, 1.0),
       r: randBetween(rand, 0.6, 2.2),
     }))
   }
 
   return {
     id: 'particleStream',
     init: (_ctx, _dims, seed) => {
       rand = mulberry32(seed)
       ps = []
     },
     update: (dt, params, derived) => {
       lastDt = dt || lastDt
       void params
       void derived
       for (const p of ps) {
         p.y -= p.vy * dt
         p.x += p.vx * dt
         p.a = clamp01(p.a + randN(rand) * 0.25 * dt)
       }
     },
     render: (ctx, dims, params, derived, modeCtx: ModeContext) => {
       const dt = lastDt
       ensure(Math.round(params.particleCount * lerp(0.25, 1.0, derived.density)), dims)
 
       ctx.clearRect(0, 0, dims.w, dims.h)
       const base = lerp(0.15, 1.0, derived.intensity) * clamp01(params.brightness)
 
       const speed = lerp(0.35, 2.3, derived.speed) * (0.4 + params.motionSpeed)
       const jitter = lerp(0, 30, params.jitter) * lerp(0.2, 1.0, derived.pulse)
 
       ctx.save()
       ctx.globalCompositeOperation = 'lighter'
 
       const pulse = 0.7 + 0.3 * Math.sin((modeCtx.now / 1000) * (1 + 3 * params.pulseFrequency))
 
       for (const p of ps) {
         p.vy = lerp(70, 520, speed) * (0.7 + 0.3 * rand())
         p.vx += randN(rand) * jitter * dt
         p.vx *= Math.pow(0.85, dt * 60)
 
         if (p.y < -30) {
           p.y = dims.h + randBetween(rand, 0, dims.h * 0.2)
           p.x = randBetween(rand, dims.w * 0.15, dims.w * 0.9)
           p.a = randBetween(rand, 0.25, 1.0)
         }
 
         const a = clamp01(p.a * base * pulse) * lerp(1, 0.75, derived.constrained) * lerp(1, 0.78, derived.taper)
         const len = lerp(12, 80, derived.speed) * (0.6 + params.motionSpeed)
         const w = p.r * lerp(0.6, 2.0, params.particleSize)
 
         const g = ctx.createLinearGradient(p.x, p.y + len, p.x, p.y - len)
         g.addColorStop(0, 'rgba(0,0,0,0)')
         g.addColorStop(0.35, `rgba(53, 209, 255, ${0.25 * a})`)
         g.addColorStop(0.6, `rgba(180, 250, 255, ${0.55 * a})`)
         g.addColorStop(1, 'rgba(0,0,0,0)')
 
         ctx.strokeStyle = g
         ctx.lineWidth = w
         ctx.lineCap = 'round'
         ctx.beginPath()
         ctx.moveTo(p.x, p.y + len)
         ctx.lineTo(p.x, p.y - len)
         ctx.stroke()
       }
 
       ctx.restore()
     },
   }
 }
