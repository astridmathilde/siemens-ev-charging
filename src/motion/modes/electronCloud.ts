 import type { MotionParams } from '../params'
 import type { Dims, ModeContext, MotionMode } from '../types'
 import type { MotionDerivedState } from '../../state/types'
 import { clamp01, lerp } from '../../utils/lerp'
 import { mulberry32, randBetween, randN } from '../../utils/rng'
 
 type Particle = {
   x: number
   y: number
   vx: number
   vy: number
   r: number
   a: number
   phase: number
 }
 
 export function electronCloudMode(): MotionMode<MotionParams, MotionDerivedState> {
   let particles: Particle[] = []
   let rand = mulberry32(1)
   let t = 0
 
   const ensure = (count: number, dims: Dims) => {
     const target = Math.max(1, Math.floor(count))
     if (particles.length === target) return
 
     const cx = dims.w * 0.55
     const cy = dims.h * 0.5
 
     const next: Particle[] = []
     for (let i = 0; i < target; i++) {
       const ang = randBetween(rand, 0, Math.PI * 2)
       const rad = Math.pow(rand(), 0.65) // center-weighted
       const spread = Math.min(dims.w, dims.h) * 0.42
       const x = cx + Math.cos(ang) * rad * spread
       const y = cy + Math.sin(ang) * rad * spread * 0.9
       next.push({
         x,
         y,
         vx: randN(rand) * 10,
         vy: randN(rand) * 10,
         r: randBetween(rand, 0.6, 2.0),
         a: randBetween(rand, 0.25, 1.0),
         phase: randBetween(rand, 0, Math.PI * 2),
       })
     }
     particles = next
   }
 
   const paintBackground = (ctx: CanvasRenderingContext2D, dims: Dims) => {
     ctx.clearRect(0, 0, dims.w, dims.h)
     const g = ctx.createRadialGradient(dims.w * 0.65, dims.h * 0.5, 0, dims.w * 0.65, dims.h * 0.5, dims.w)
     g.addColorStop(0, 'rgba(53, 209, 255, 0.08)')
     g.addColorStop(0.5, 'rgba(73, 166, 255, 0.02)')
     g.addColorStop(1, 'rgba(0, 0, 0, 0)')
     ctx.fillStyle = g
     ctx.fillRect(0, 0, dims.w, dims.h)
   }
 
   return {
     id: 'electronCloud',
     init: (_ctx, _dims, seed) => {
       rand = mulberry32(seed)
       particles = []
       t = 0
     },
     update: (dt, params, derived, _modeCtx) => {
       t += dt
       // Keep a stable particle count but modulate effective density with derived + params
       const targetCount = Math.round(params.particleCount * lerp(0.35, 1.05, derived.density))
       // dims comes from render; update uses last known dims by closure not available. count adjust in render.
       // We'll do minor physics here only.
       const energy = derived.intensity
       const baseSpeed = params.motionSpeed * lerp(10, 85, derived.speed) * lerp(0.7, 1.05, energy)
       const up = params.upwardDrift * lerp(6, 55, derived.upward)
       const jitter = params.jitter * lerp(2, 28, derived.pulse) * (1 + 0.6 * params.turbulence)
 
       for (let i = 0; i < particles.length; i++) {
         const p = particles[i]
         const nx = Math.sin(p.phase + t * (0.9 + 0.6 * rand()))
         const ny = Math.cos(p.phase * 0.7 + t * (1.2 + 0.5 * rand()))
 
         p.vx += nx * jitter * dt
         p.vy += ny * jitter * dt
 
         const damp = lerp(0.9, 0.78, clamp01(baseSpeed / 90))
         p.vx *= Math.pow(damp, dt * 60)
         p.vy *= Math.pow(damp, dt * 60)
 
         p.x += p.vx * dt * lerp(0.6, 1.3, clamp01(baseSpeed / 90))
         p.y += (p.vy - up) * dt
 
         // subtle flicker
         const flick = 0.15 + 0.45 * params.jitter
         p.a = clamp01(p.a + randN(rand) * flick * dt)
 
         // Let some particles “fall back” to keep a cloud
         if (rand() < 0.015 * dt * (1 + derived.fragmented)) {
           p.phase = randBetween(rand, 0, Math.PI * 2)
         }
 
         // Keep them within rough bounds; final wrap handled in render when we know dims.
       }
 
       // If particle array is empty (first tick), populate in render.
       void targetCount
     },
     render: (ctx, dims, params, derived, modeCtx: ModeContext) => {
       const targetCount = Math.round(params.particleCount * lerp(0.35, 1.05, derived.density))
       ensure(targetCount, dims)
 
       paintBackground(ctx, dims)
 
       const cx = dims.w * 0.62
       const cy = dims.h * 0.52
       const baseSpread = lerp(0.22, 0.55, clamp01(params.spread))
       const spread = Math.min(dims.w, dims.h) * baseSpread * lerp(0.55, 1.05, 1 - derived.constrained)
       const vyCon = lerp(1.3, 0.55, clamp01(params.verticalConcentration))
 
       const glow = clamp01(params.glow) * lerp(0.2, 1.0, derived.brightness)
       const core = clamp01(params.coreIntensity) * lerp(0.2, 1.15, derived.intensity)
       const brightness = clamp01(params.brightness) * lerp(0.15, 1.25, derived.brightness)
 
       // Compositing for “embedded glow”
       ctx.save()
       ctx.globalCompositeOperation = 'lighter'
 
       const pulse = 0.5 + 0.5 * Math.sin((modeCtx.now / 1000) * (0.8 + 3.8 * params.pulseFrequency) + derived.pulse * 1.7)
       const pulseBoost = lerp(0.92, 1.18, pulse * derived.pulse)
 
       for (let i = 0; i < particles.length; i++) {
         const p = particles[i]
 
         // gentle attraction to center to keep a cloud
         const dx = p.x - cx
         const dy = (p.y - cy) * vyCon
         const dist = Math.sqrt(dx * dx + dy * dy) + 0.001
 
         // wrap and respawn for stability
         if (dist > spread * 1.25 || p.y < -40 || p.y > dims.h + 40) {
           const ang = randBetween(rand, 0, Math.PI * 2)
           const rad = Math.pow(rand(), 0.7)
           p.x = cx + Math.cos(ang) * rad * spread
           p.y = cy + Math.sin(ang) * rad * spread * 0.9
           p.vx = randN(rand) * 15
           p.vy = randN(rand) * 15
           p.r = randBetween(rand, 0.6, 2.1)
           p.a = randBetween(rand, 0.25, 1.0)
         } else {
           // slight pull
           const pull = lerp(0.02, 0.16, core) * (1 - derived.fragmented * 0.45)
           p.vx += (-dx / dist) * pull
           p.vy += (-(dy / dist) * pull) / vyCon
         }
 
         const local = clamp01(1 - dist / spread)
         const alpha = clamp01(p.a * local * brightness * pulseBoost) * lerp(1, 0.72, derived.constrained) * lerp(1, 0.82, derived.taper)
 
         const size = p.r * lerp(0.7, 2.2, params.particleSize) * lerp(0.75, 1.25, derived.intensity)
         const blur = lerp(0, 16, glow) * lerp(0.6, 1.25, local)
 
         const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 4 + blur)
         grad.addColorStop(0, `rgba(180, 250, 255, ${0.82 * alpha})`)
         grad.addColorStop(0.35, `rgba(53, 209, 255, ${0.42 * alpha})`)
         grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
         ctx.fillStyle = grad
         ctx.beginPath()
         ctx.arc(p.x, p.y, size * 3 + blur * 0.15, 0, Math.PI * 2)
         ctx.fill()
       }
 
       // core glow
       const coreR = lerp(10, 70, core) * lerp(0.7, 1.0, 1 - derived.taper) * lerp(0.75, 1.0, 1 - derived.constrained)
       const coreG = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR)
       coreG.addColorStop(0, `rgba(220, 255, 255, ${0.22 * core * pulseBoost})`)
       coreG.addColorStop(0.5, `rgba(53, 209, 255, ${0.12 * core * pulseBoost})`)
       coreG.addColorStop(1, 'rgba(0, 0, 0, 0)')
       ctx.fillStyle = coreG
       ctx.fillRect(0, 0, dims.w, dims.h)
 
       ctx.restore()
     },
     dispose: () => {
       particles = []
     },
   }
 }
