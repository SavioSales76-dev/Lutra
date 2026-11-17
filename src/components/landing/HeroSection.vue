<!--
  Hero da landing (Figma: 1.1 Landing › "Hero — Desktop", node 50:9).
  A imagem é provisória (gerada no Figma); a ideia é trocar por vídeo em loop com a LUT aplicada.
  Camadas: imagem e degradê no fundo (-z-10, dentro do `isolate`), conteúdo sem z-index
  para que o mix-blend do título misture com a imagem. O topo (SiteHeader) fica no SiteLayout.

  Saída por rolagem: a Hero fica fixa (pin sem espaço extra) enquanto a seção Sobre sobe por cima.
  - Parallax: a foto sobe e se aproxima devagar; título, texto e botões sobem em velocidades
    diferentes (profundidade).
  - VeuTransicao (WebGL, modo cobrir) é um véu de noite que fica na camada mais alta da Hero, por cima do
    título, do texto e dos botões, e sobe junto com a borda da Sobre com uma frente
    orgânica. Sem WebGL, o texto some por opacidade e a camada "sombra" escurece a foto.
  As animações vão em cada elemento (h1, p, botões), não no contêiner: opacidade ou transform
  no contêiner isolaria o mix-blend-overlay do título.
-->
<script setup lang="ts">
import ContrastIcon from '@/components/icons/animated/ContrastIcon.vue'
import PaletteIcon from '@/components/icons/animated/PaletteIcon.vue'
import LButton from '@/components/ui/LButton.vue'
import hero768 from '@/assets/images/hero-768.jpg'
import hero1536 from '@/assets/images/hero-1536.jpg'
import { onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import VeuTransicao from '@/components/effects/VeuTransicao.vue'
import { COM_MOVIMENTO, gsap } from '@/lib/gsap'

/* Degradê do Figma: escurece de leve o topo e termina em noite sólido, emendando com a seção seguinte. */
const degrade =
  'linear-gradient(180deg, rgb(14 13 11 / 0.55) 0%, rgb(14 13 11 / 0.3) 12%, rgb(14 13 11 / 0.05) 28%, rgb(14 13 11 / 0.12) 45%, rgb(14 13 11 / 0.25) 55%, rgb(14 13 11 / 0.38) 63%, rgb(14 13 11 / 0.58) 71%, rgb(14 13 11 / 0.78) 79%, rgb(14 13 11 / 0.92) 86%, rgb(14 13 11 / 0.99) 92%, rgb(14 13 11) 96%)'

const secao = useTemplateRef<HTMLElement>('secao')
const foto = useTemplateRef<HTMLImageElement>('foto')
const sombra = useTemplateRef<HTMLDivElement>('sombra')
const titulo = useTemplateRef<HTMLElement>('titulo')
const apoio = useTemplateRef<HTMLElement>('apoio')
const botoes = useTemplateRef<HTMLElement>('botoes')

/* Progresso da transição (0 a 1), para o véu em WebGL */
const progresso = ref(0)
const comMovimento = ref(false)

/* Com o véu em WebGL ativo, quem cobre o texto é ele; sem WebGL, o texto some por opacidade */
const someSemWebgl = () => (document.documentElement.hasAttribute('data-transicao-webgl') ? 1 : 0)

/* Distância que cada camada sobe, em fração da altura da tela (velocidades diferentes = profundidade) */
const subir = (fracao: number) => () => -window.innerHeight * fracao

const mm = gsap.matchMedia()

onMounted(() => {
  mm.add(COM_MOVIMENTO, () => {
    comMovimento.value = true
    gsap
      .timeline({
        scrollTrigger: {
          trigger: secao.value,
          start: 'top top',
          end: 'bottom top',
          pin: true,
          pinSpacing: false,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => (progresso.value = self.progress),
        },
        defaults: { ease: 'none' },
      })
      .to(sombra.value, { opacity: 0.85 }, 0)
      .to(foto.value, { yPercent: -12, scale: 1.06 }, 0)
      .to(titulo.value, { y: subir(0.28), opacity: someSemWebgl, ease: 'power1.in' }, 0)
      .to(apoio.value, { y: subir(0.42), opacity: someSemWebgl, ease: 'power1.in' }, 0)
      .to(botoes.value, { y: subir(0.56), opacity: someSemWebgl, ease: 'power1.in' }, 0)

    return () => {
      comMovimento.value = false
      progresso.value = 0
    }
  })
})

onBeforeUnmount(() => mm.revert())
</script>

<template>
  <section id="inicio" ref="secao" class="relative isolate flex min-h-dvh flex-col overflow-hidden bg-noite">
    <div aria-hidden="true" class="absolute inset-0 -z-10">
      <img
        ref="foto"
        :src="hero1536"
        :srcset="`${hero768} 768w, ${hero1536} 1536w`"
        sizes="100vw"
        alt=""
        fetchpriority="high"
        decoding="async"
        class="size-full object-cover"
      />
      <div class="absolute inset-0" :style="{ backgroundImage: degrade }" />
      <!-- Escurece a foto enquanto a Sobre cobre a Hero (opacidade animada pelo scroll) -->
      <div ref="sombra" class="hero-sombra absolute inset-0 bg-noite opacity-0" />
    </div>

    <div class="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <h1
        ref="titulo"
        class="font-serif text-[clamp(3.5rem,11vw,6.5rem)] leading-[0.95] tracking-[-0.02em] text-off-white mix-blend-overlay"
      >
        Film looks,<br />
        <em class="tracking-[-0.003em]">made simple.</em>
      </h1>

      <p ref="apoio" class="mt-5 max-w-[560px] text-[17px] leading-[1.3] tracking-[-0.03em] text-off-white/80 sm:text-lg">
        LUTs com alma de filme para criadores que querem que cada vídeo pareça cinema. Aplique em poucos
        cliques no Premiere, DaVinci, Final Cut ou CapCut.
      </p>

      <div ref="botoes" class="mt-8 flex flex-wrap justify-center gap-3">
        <LButton to="/#pacotes" :icon="PaletteIcon">Ver os pacotes</LButton>
        <LButton to="/#como-usar" variant="glass" :icon="ContrastIcon">Como funciona</LButton>
      </div>
    </div>

    <!-- Véu da transição: último filho e sem z-index, para ficar por cima de todo o conteúdo -->
    <VeuTransicao v-if="comMovimento" modo="cobrir" :progresso="progresso" />
  </section>
</template>

<!--
  Sem "scoped" de propósito: a regra depende de um atributo no <html>, fora do componente.
  (Num bloco scoped, :global(...) transforma a regra inteira em "html { display: none }".)
-->
<style>
/* Com o WebGL ativo, o próprio shader faz o fade até noite */
:root[data-transicao-webgl] .hero-sombra {
  display: none;
}
</style>
