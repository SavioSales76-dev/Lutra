/*
 * Ponto único de entrada do GSAP no projeto.
 * Importe daqui (não direto de 'gsap') para que plugins e padrões fiquem num lugar só.
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)
gsap.defaults({ ease: 'power3.out', duration: 0.5 })

/** true quando a pessoa pediu para reduzir movimento no sistema. */
export function prefereMenosMovimento() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Media query para usar com gsap.matchMedia(): só anima quando não há pedido de menos movimento. */
export const COM_MOVIMENTO = '(prefers-reduced-motion: no-preference)'

export { gsap, ScrollTrigger }
