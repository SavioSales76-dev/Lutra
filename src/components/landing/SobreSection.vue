<!--
  Sobre (Figma: 1.1 Landing › "Sobre — Desktop", node 56:2).

  Coreografia com o scroll (GSAP ScrollTrigger + Lenis):
  1. A seção sobe por cima da Hero, que fica fixa atrás (ver HeroSection). O fade da foto é
     feito em WebGL (HeroTransicao); sem WebGL, a borda de cima vira um degradê de noite em
     vários pontos. O conteúdo entra com parallax, mais devagar que o fundo.
  2. Ao encostar no topo, a seção trava (pin) e o manifesto acende palavra por palavra
     conforme a pessoa rola: começa a 16% de opacidade e vai a 100%.
  3. Quando a última palavra acende, a trava solta e a rolagem segue normal.

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

    gsap
      .timeline({
        scrollTrigger: {
          trigger: secao.value,
          start: 'top top',
          end: `+=${DURACAO_TRAVA}%`,
          pin: true,
          scrub: true,
        },
      })
      .to(palavras, { opacity: 1, ease: 'none', stagger: 0.1, duration: 0.3 })
      // Pequena pausa no fim, com o texto todo aceso, antes de soltar a trava
      .to({}, { duration: 0.6 })
  })
})

onBeforeUnmount(() => mm.revert())
</script>

<template>
  <section
    id="sobre"
    ref="secao"
    aria-labelledby="sobre-titulo"
    class="sobre relative z-10 flex min-h-dvh items-center bg-noite px-4 py-24 sm:px-8"
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

<style scoped>
/*
 * "Cortina" acima da seção: degradê de noite com vários pontos (curva suave, não linear),
 * para a borda que sobe por cima da Hero não aparecer como uma linha.
 */
.sobre::before {
  content: '';
  position: absolute;
  inset-inline: 0;
  bottom: 100%;
  height: 40vh;
  pointer-events: none;
  background: linear-gradient(
    to bottom,
    rgb(14 13 11 / 0) 0%,
    rgb(14 13 11 / 0.03) 15%,
    rgb(14 13 11 / 0.1) 30%,
    rgb(14 13 11 / 0.22) 45%,
    rgb(14 13 11 / 0.4) 60%,
    rgb(14 13 11 / 0.62) 75%,
    rgb(14 13 11 / 0.82) 88%,
    rgb(14 13 11) 100%
  );
}
</style>

<!--
  Sem "scoped" de propósito: a regra depende de um atributo no <html>, fora do componente.
  (Num bloco scoped, :global(...) transforma a regra inteira em "html { display: none }".)
-->
<style>
/* Com o WebGL da Hero ativo, o shader faz o fade (dissolve orgânico) e este degradê sai */
:root[data-transicao-webgl] .sobre::before {
  display: none;
}
</style>
