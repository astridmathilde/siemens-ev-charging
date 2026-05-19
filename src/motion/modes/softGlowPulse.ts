 import type { MotionParams } from '../params'
 import type { MotionMode, ModeContext } from '../types'
 import type { MotionDerivedState } from '../../state/types'
 import { clamp01, lerp } from '../../utils/lerp'
 import { mulberry32, randBetween } from '../../utils/rng'
 
 export function softGlowPulseMode(): MotionMode<MotionParams, MotionDerivedState> {
   let rand = mulberry32(1)
   const blobs = new Array(4).fill(0).map(() => ({
     x: 0.5,
     y: 0.5,
     r: 0.4,
     dx: 0,
     dy: 0,
   }))
 
   return {
     id: 'softGlowPulse',
     init: (_ctx, _dims, seed) => {
       rand = mulberry32(seed)
       for (const b of blobs) {
         b.x = randBetween(rand, 0.35, 0.78)
         b.y = randBetween(rand, 0.22, 0.8)
         b.r = randBetween(rand, 0.22, 0.55)
         b.dx = randBetween(rand, -0.08, 0.08)
         b.dy = randBetween(rand, -0.08, 0.08)
       }
     },
     update: (dt, params, derived) => {
       const sp = lerp(0.12, 0.75, derived.speed) * (0.4 + params.motionSpeed)
       const wob = lerp(0.04, 0.16, params.turbulence) * lerp(0.3, 1.0, derived.pulse)
       for (const b of blobs) {
         b.x += b.dx * dt * sp
         b.y += b.dy * dt * sp
         if (b.x < 0.2 || b.x > 0.92) b.dx *= -1
         if (b.y < 0.12 || b.y > 0.9) b.dy *= -1
         b.r = clamp01(b.r + (randBetween(rand, -1, 1) * wob * dt))
         b.r = Math.max(0.12, Math.min(0.75, b.r))
       }
     },
     render: (ctx, dims, params, derived, modeCtx: ModeContext) => {
       ctx.clearRect(0, 0, dims.w, dims.h)
 
       const brightness = clamp01(params.brightness) * lerp(0.15, 1.1, derived.brightness)
       const glow = clamp01(params.glow) * lerp(0.4, 1.0, derived.intensity)
 
       const freq = 0.7 + 4.5 * params.pulseFrequency
       const pulse = 0.55 + 0.45 * Math.sin((modeCtx.now / 1000) * freq)
       const pulseBoost = lerp(0.75, 1.25, pulse * derived.pulse)
 
       const cx = dims.w * 0.62
       const cy = dims.h * 0.52
       const baseR = lerp(40, 120, derived.intensity) * lerp(0.75, 1.05, clamp01(params.coreIntensity))
 
       ctx.save()
       ctx.globalCompositeOperation = 'lighter'
 
       // Base core
       const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR * (1 + glow))
       core.addColorStop(0, `rgba(220, 255, 255, ${0.12 * brightness * pulseBoost})`)
       core.addColorStop(0.5, `rgba(53, 209, 255, ${0.09 * brightness * pulseBoost})`)
       core.addColorStop(1, 'rgba(0,0,0,0)')
       ctx.fillStyle = core
       ctx.fillRect(0, 0, dims.w, dims.h)
 
       // Blobs
       for (const b of blobs) {
         const x = dims.w * b.x
         const y = dims.h * b.y
         const r = baseR * b.r * lerp(0.7, 1.25, params.spread) * lerp(0.9, 1.05, derived.density)
 
         const g = ctx.createRadialGradient(x, y, 0, x, y, r)
         g.addColorStop(0, `rgba(180, 250, 255, ${0.10 * brightness * pulseBoost})`)
         g.addColorStop(0.45, `rgba(53, 209, 255, ${0.08 * brightness * pulseBoost})`)
         g.addColorStop(1, 'rgba(0,0,0,0)')
         ctx.fillStyle = g
         ctx.beginPath()
         ctx.arc(x, y, r, 0, Math.PI * 2)
         ctx.fill()
       }
 
       ctx.restore()
 
       // Taper/constrained vignette
       const vign = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(dims.w, dims.h) * 0.9)
       vign.addColorStop(0, 'rgba(0,0,0,0)')
       vign.addColorStop(1, `rgba(0,0,0,${0.25 + 0.35 * derived.taper + 0.25 * derived.constrained})`)
       ctx.fillStyle = vign
       ctx.fillRect(0, 0, dims.w, dims.h)
     },
   }
 }
