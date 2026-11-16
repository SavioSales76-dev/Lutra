<!--
  Hero da landing (Figma: 1.1 Landing › "Hero — Desktop", node 50:9).
  A imagem é provisória (gerada no Figma); a ideia é trocar por vídeo em loop com a LUT aplicada.
  Camadas: imagem e degradê no fundo (-z-10, dentro do `isolate`), conteúdo sem z-index
  para que os mix-blend do título e do menu misturem com a imagem.
-->
<script setup lang="ts">
import { Contrast, SwatchBook } from 'lucide-vue-next'
import SiteHeader from '@/components/layout/SiteHeader.vue'
import LButton from '@/components/ui/LButton.vue'
import hero768 from '@/assets/images/hero-768.jpg'
import hero1536 from '@/assets/images/hero-1536.jpg'

/* Degradê do Figma: escurece de leve o topo e termina em noite sólido, emendando com a seção seguinte. */
const degrade =
  'linear-gradient(180deg, rgb(14 13 11 / 0.55) 0%, rgb(14 13 11 / 0.3) 12%, rgb(14 13 11 / 0.05) 28%, rgb(14 13 11 / 0.12) 45%, rgb(14 13 11 / 0.25) 55%, rgb(14 13 11 / 0.38) 63%, rgb(14 13 11 / 0.58) 71%, rgb(14 13 11 / 0.78) 79%, rgb(14 13 11 / 0.92) 86%, rgb(14 13 11 / 0.99) 92%, rgb(14 13 11) 96%)'
</script>

<template>
  <section id="inicio" class="relative isolate flex min-h-dvh flex-col overflow-hidden bg-noite">
    <div aria-hidden="true" class="absolute inset-0 -z-10">
      <img
        :src="hero1536"
        :srcset="`${hero768} 768w, ${hero1536} 1536w`"
        sizes="100vw"
        alt=""
        fetchpriority="high"
        decoding="async"
        class="size-full object-cover"
      />
      <div class="absolute inset-0" :style="{ backgroundImage: degrade }" />
    </div>

    <SiteHeader />

    <div class="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <h1
        class="font-serif text-[clamp(3.5rem,11vw,6.5rem)] leading-[0.95] tracking-[-0.02em] text-off-white mix-blend-overlay"
      >
        Film looks,<br />
        <em class="tracking-[-0.003em]">made simple.</em>
      </h1>

      <p class="mt-5 max-w-[560px] text-[17px] leading-[1.3] tracking-[-0.03em] text-off-white/80 sm:text-lg">
        LUTs com alma de filme para criadores que querem que cada vídeo pareça cinema. Aplique em poucos
        cliques no Premiere, DaVinci, Final Cut ou CapCut.
      </p>

      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <LButton to="/#pacotes" :icon="SwatchBook">Ver os pacotes</LButton>
        <LButton to="/#como-usar" variant="glass" :icon="Contrast">Como funciona</LButton>
      </div>
    </div>
  </section>
</template>
