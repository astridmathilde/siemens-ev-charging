 export function mulberry32(seed: number) {
   let a = seed >>> 0
   return function rand() {
     a |= 0
     a = (a + 0x6d2b79f5) | 0
     let t = Math.imul(a ^ (a >>> 15), 1 | a)
     t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
     return ((t ^ (t >>> 14)) >>> 0) / 4294967296
   }
 }
 
 export function randBetween(r: () => number, a: number, b: number) {
   return a + (b - a) * r()
 }
 
 export function randN(r: () => number) {
   // approx normal-ish: sum of uniforms
   return (r() + r() + r() + r() - 2) * 0.5
 }
