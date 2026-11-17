<!--
  Sobre (Figma: 1.1 Landing › "Sobre — Desktop", node 56:2).

  Camadas: a Sobre (z-10) fica acima da Hero e da Como usar, que estão na mesma camada.

  Coreografia com o scroll (GSAP ScrollTrigger + Lenis):
  1. A seção sobe por cima da Hero, que fica fixa atrás (ver HeroSection). O fade é o véu
     em WebGL da Hero (VeuTransicao, modo cobrir); sem WebGL, um degradê de noite acima da
     borda de cima (.cortina-cima, em main.css). O conteúdo entra com parallax, mais devagar que o fundo.
  2. Ao encostar no topo, a seção trava (pin) e o manifesto acende palavra por palavra
     conforme a pessoa rola: começa a 16% de opacidade e vai a 100%.
  3. Com o texto todo aceso, a trava solta e a Sobre sai por cima, revelando a Como usar,
     que fica fixa embaixo (ver ComoUsarSection). O fade é o véu em WebGL da Como usar
     (modo revelar); sem WebGL, um degradê de noite abaixo da borda de baixo (.cortina-baixo).
     O conteúdo sai com parallax, mais devagar que o fundo.

  Com prefers-reduced-motion não há trava nem revelação: o texto aparece inteiro e legível.
  As palavras são divididas no template (não com SplitText) para o Vue continuar dono do DOM.
-->
<script setup lang="ts">
import { onBeforeUnmount, onMounted, useTemplateRef } from 'vue'
import { COM_MOVIMENTO, gsap } from '@/lib/gsap'

const manifesto = [
  'Todo criador quer que o seu vídeo pareça cinema.',
  'Mas color grading exige tempo, técnica e paciência.',
  'Presets genéricos deixam tudo com a mesma cara.',
  'A Lutra muda isso.',
]
const frases = manifesto.map((frase) => frase.split(' '))

/* Distância de rolagem (em % da altura da tela) que a seção fica travada revelando o texto. */
const DURACAO_TRAVA = 220

const secao = useTemplateRef<HTMLElement>('secao')
const conteudo = useTemplateRef<HTMLElement>('conteudo')
const mm = gsap.matchMedia()

onMounted(() => {
  mm.add(COM_MOVIMENTO, () => {
    const palavras = secao.value?.querySelectorAll('.sobre-palavra')
    if (!palavras?.length) return

    gsap.set(palavras, { opacity: 0.16 })

    // Parallax de entrada: enquanto a seção sobe, o conteúdo vem mais devagar que o fundo
    // (criado antes do pin, porque termina exatamente onde o pin começa)
    gsap.fromTo(
      conteudo.value,
      { y: () => window.innerHeight * 0.22 },
      {
        y: 0,
        ease: 'none',
        scrollTrigger: { trigger: secao.value, start: 'top bottom', end: 'top top', scrub: true, invalidateOnRefresh: true },
      },
    )

    const trava = gsap
      .timeline({
        scrollTrigger: {
          trigger: secao.value,
          start: 'top top',
          end: `+=${DURACAO_TRAVA}%`,
          pin: true,
          anticipatePin: 1,
          scrub: true,
        },
      })
      .to(palavras, { opacity: 1, ease: 'none', stagger: 0.1, duration: 0.3 })
      // Pequena pausa no fim, com o texto todo aceso, antes de soltar a trava
      .to({}, { duration: 0.6 })

    // Parallax de saída: enquanto a seção sai por cima (uma tela depois da trava),
    // o conteúdo vai mais devagar que o fundo
    gsap.to(conteudo.value, {
      yPercent: 22,
      ease: 'none',
      scrollTrigger: {
        trigger: secao.value,
        start: () => trava.scrollTrigger?.end ?? 0,
        end: () => (trava.scrollTrigger?.end ?? 0) + window.innerHeight,
        scrub: true,
        invalidateOnRefresh: true,
      },
    })
  })
})

onBeforeUnmount(() => mm.revert())
</script>

<template>
  <section
    id="sobre"
    ref="secao"
    aria-labelledby="sobre-titulo"
    class="cortina-cima cortina-baixo relative z-10 flex min-h-dvh items-center bg-noite px-4 py-24 sm:px-8"
  >
    <div ref="conteudo" class="mx-auto flex w-full max-w-[880px] flex-col gap-8 lg:gap-10">
      <h2 id="sobre-titulo" class="text-base font-medium tracking-[-0.02em] text-off-white/50">Sobre a Lutra</h2>

      <div class="flex flex-col gap-5 font-serif text-[clamp(2rem,5vw,3.5rem)] leading-[1.1] text-off-white lg:gap-7">
        <p v-for="(palavrasDaFrase, f) in frases" :key="f">
          <template v-for="(palavra, i) in palavrasDaFrase" :key="i">
            <span class="sobre-palavra">{{ palavra }}</span>{{ i < palavrasDaFrase.length - 1 ? ' ' : '' }}
          </template>
        </p>
      </div>
    </div>
  </section>
</template>
