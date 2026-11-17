<!--
  Tela de carregamento inicial (não existe no Figma; segue a identidade da Lutra).
  Aparece uma vez por carregamento do site, por cima de tudo (z-60), e sai quando o que a
  página precisa está pronto (ver lib/carregamento.ts).

  - Entrada: as letras de "Lutra" sobem uma a uma, mascaradas.
  - Progresso: contador de 0 a 100 e uma linha fina. O número segue o progresso real
    (fontes, foto da Hero, página), mas leva no mínimo TEMPO_MINIMO para chegar a 100,
    para a tela não piscar. Depois de TEMPO_MAXIMO sai de qualquer jeito.
  - Saída: as letras sobem e somem, e a tela sobe como uma cortina, com a borda de baixo
    em degradê de noite (sem linha dura). No meio da subida, marca siteCarregado para a
    Hero começar a entrada.
  - Enquanto está na tela, a rolagem fica travada (Lenis parado e overflow escondido).
  - Com prefers-reduced-motion: sem animação de letras; a tela só some com um fade curto.
-->
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import { router } from '@/router'
import { aguardar, progressoReal, siteCarregado } from '@/lib/carregamento'
import { gsap, prefereMenosMovimento, ScrollTrigger } from '@/lib/gsap'
import { usarLenis } from '@/lib/lenis'

const TEMPO_MINIMO = 1600
const TEMPO_MAXIMO = 8000

const letras = [...'Lutra']
const visivel = ref(true)
const porcentagem = ref(0)

const painel = useTemplateRef<HTMLElement>('painel')
const linha = useTemplateRef<HTMLElement>('linha')

let saindo = false
let tique: (() => void) | undefined
let limite = 0

function carregamentoDaJanela() {
  if (document.readyState === 'complete') return Promise.resolve()
  return new Promise<void>((resolve) => window.addEventListener('load', () => resolve(), { once: true }))
}

function travarRolagem(travar: boolean) {
  document.documentElement.classList.toggle('carregando', travar)
  if (travar) usarLenis()?.stop()
  else usarLenis()?.start()
}

function sair() {
  if (saindo) return
  saindo = true
  if (tique) gsap.ticker.remove(tique)
  window.clearTimeout(limite)

  const terminar = () => {
    travarRolagem(false)
    visivel.value = false
    // A rolagem voltou: recalcula as travas com as medidas finais da página
    ScrollTrigger.refresh()
  }

  if (prefereMenosMovimento()) {
    siteCarregado.value = true
    gsap.to(painel.value, { opacity: 0, duration: 0.35, ease: 'none', onComplete: terminar })
    return
  }

  gsap
    .timeline({ onComplete: terminar })
    .to(painel.value?.querySelectorAll('.tela-letra') ?? [], {
      yPercent: -110,
      duration: 0.6,
      ease: 'power3.in',
      stagger: 0.04,
    })
    .to(painel.value?.querySelectorAll('.tela-rodape') ?? [], { opacity: 0, duration: 0.4, ease: 'power2.in' }, '<')
    .to(painel.value, { yPercent: -100, duration: 1.1, ease: 'expo.inOut' }, '-=0.15')
    // A Hero começa a entrada quando a cortina já está na metade da subida
    .call(() => (siteCarregado.value = true), [], '-=0.6')
}

onMounted(() => {
  travarRolagem(true)

  aguardar(document.fonts?.ready ?? Promise.resolve())
  aguardar(router.isReady())
  aguardar(carregamentoDaJanela())

  const menos = prefereMenosMovimento()
  if (!menos) {
    gsap.from(painel.value?.querySelectorAll('.tela-letra') ?? [], {
      yPercent: 110,
      duration: 1,
      ease: 'expo.out',
      stagger: 0.07,
      delay: 0.1,
    })
  }

  // Número exibido: segue o progresso real, mas nunca mais rápido que o tempo mínimo
  const inicio = performance.now()
  const minimo = menos ? 300 : TEMPO_MINIMO
  let exibido = 0
  tique = () => {
    const pelaHora = Math.min((performance.now() - inicio) / minimo, 1)
    const alvo = Math.min(progressoReal.value, pelaHora)
    exibido += (alvo - exibido) * 0.12
    if (alvo >= 1 && exibido > 0.995) exibido = 1
    porcentagem.value = Math.round(exibido * 100)
    if (linha.value) linha.value.style.transform = `scaleX(${exibido})`
    if (exibido >= 1) sair()
  }
  gsap.ticker.add(tique)

  // Nunca fica preso: depois do tempo máximo, sai com o que tiver
  limite = window.setTimeout(sair, TEMPO_MAXIMO)
})

onBeforeUnmount(() => {
  if (tique) gsap.ticker.remove(tique)
  window.clearTimeout(limite)
  if (visivel.value) travarRolagem(false)
})
</script>

<template>
  <div v-if="visivel" ref="painel" class="tela fixed inset-0 z-[60] bg-noite" role="status" aria-live="polite">
    <span class="sr-only">Carregando a Lutra</span>

    <div class="absolute inset-0 grid place-items-center px-4">
      <p aria-hidden="true" class="flex overflow-hidden pb-[0.08em] font-serif text-[clamp(4.5rem,16vw,11rem)] leading-none tracking-[-0.02em] text-off-white">
        <span v-for="(letra, i) in letras" :key="i" class="tela-letra inline-block">{{ letra }}</span>
      </p>
    </div>

    <div class="tela-rodape absolute inset-x-0 bottom-0 flex flex-col gap-4 px-4 pb-8 sm:px-8 lg:px-16" aria-hidden="true">
      <div class="flex items-end justify-between text-sm">
        <p class="text-off-white/50">Preparando o seu look</p>
        <p class="font-medium tabular-nums text-off-white/80">{{ porcentagem }}%</p>
      </div>
      <div class="h-px w-full overflow-hidden bg-off-white/10">
        <div ref="linha" class="h-full w-full origin-left scale-x-0 bg-off-white" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Borda de baixo da cortina: degradê de noite em vários pontos, para a subida não ter linha dura */
.tela::after {
  content: '';
  position: absolute;
  inset-inline: 0;
  top: 100%;
  height: 40vh;
  pointer-events: none;
  background: linear-gradient(
    to bottom,
    rgb(14 13 11) 0%,
    rgb(14 13 11 / 0.82) 12%,
    rgb(14 13 11 / 0.62) 25%,
    rgb(14 13 11 / 0.4) 40%,
    rgb(14 13 11 / 0.22) 55%,
    rgb(14 13 11 / 0.1) 70%,
    rgb(14 13 11 / 0.03) 85%,
    rgb(14 13 11 / 0) 100%
  );
}
</style>
