/*
 * Rolagem suave com Lenis, sincronizada com o GSAP ScrollTrigger.
 * - Um único relógio: o ticker do GSAP move o Lenis, e cada rolagem do Lenis atualiza o ScrollTrigger.
 * - Rolagem um pouco "pesada": lerp baixo (mais inércia) e roda do mouse levemente reduzida.
 * - Não liga com prefers-reduced-motion: fica a rolagem nativa do navegador.
 * - No toque (celular) a rolagem continua nativa (syncTouch desligado), que é o mais confiável.
 */
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { gsap, prefereMenosMovimento, ScrollTrigger } from '@/lib/gsap'

let lenis: Lenis | null = null

export function iniciarLenis() {
  if (lenis || prefereMenosMovimento()) return lenis

  lenis = new Lenis({
    lerp: 0.075,
    wheelMultiplier: 0.9,
    autoRaf: false,
  })

  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((tempo) => lenis?.raf(tempo * 1000))
  gsap.ticker.lagSmoothing(0)

  return lenis
}

/** Instância ativa (ou null, quando a rolagem é nativa). */
export function usarLenis() {
  return lenis
}
