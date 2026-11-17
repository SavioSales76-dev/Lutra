import { onBeforeUnmount, onMounted, ref } from 'vue'
import { ScrollTrigger } from '@/lib/gsap'

/**
 * Id da seção (<section id="...">) que está no centro da tela.
 *
 * Usa document.elementFromPoint em vez de medir posições: como algumas seções se sobrepõem
 * durante as transições (a Sobre passa por cima da Hero e da Como usar), o que vale é a
 * seção que está de fato visível no ponto, respeitando as camadas. Elementos com
 * pointer-events: none (grão de filme, véus em WebGL) são ignorados pelo navegador.
 *
 * Atualiza a cada rolagem (o Lenis move a rolagem nativa, então o evento dispara),
 * no máximo uma vez por quadro.
 */
export function useSecaoAtiva() {
  const ativa = ref<string | null>(null)
  let quadro = 0

  function medir() {
    quadro = 0
    const alvo = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2)
    const secao = alvo?.closest<HTMLElement>('section[id]')
    ativa.value = secao?.id ?? null
  }

  /*
   * Mede um quadro depois da rolagem: no mesmo quadro o ScrollTrigger ainda não reposicionou
   * as seções travadas (pin) e o ponto central acertaria a seção errada.
   */
  function agendar() {
    if (!quadro) quadro = requestAnimationFrame(() => (quadro = requestAnimationFrame(medir)))
  }

  onMounted(() => {
    window.addEventListener('scroll', agendar, { passive: true })
    window.addEventListener('resize', agendar)
    // Garantia extra: mede de novo quando a rolagem termina e depois de cada recálculo dos pins
    ScrollTrigger.addEventListener('scrollEnd', agendar)
    ScrollTrigger.addEventListener('refresh', agendar)
    agendar()
  })

  onBeforeUnmount(() => {
    cancelAnimationFrame(quadro)
    window.removeEventListener('scroll', agendar)
    window.removeEventListener('resize', agendar)
    ScrollTrigger.removeEventListener('scrollEnd', agendar)
    ScrollTrigger.removeEventListener('refresh', agendar)
  })

  return { ativa, medir: agendar }
}
