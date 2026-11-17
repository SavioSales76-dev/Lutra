<!--
  Footer (Figma: 1.1 Landing › "Footer — Desktop", node 68:3).
  Foto de fundo provisória (gerada no Figma) com o overlay do Figma: noite sólido no topo e a
  base um pouco mais clara, espelhando o topo da Hero.

  Camadas e transição (o mesmo da Sobre → Como usar): fica na mesma camada da Hero e da
  Como usar, abaixo da FAQ (z-10). Tem margem negativa de uma tela, então começa escondido
  atrás da última tela da FAQ; trava no topo por uma tela enquanto a FAQ sai por cima e vai
  sendo revelado pela borda de baixo dela. VeuTransicao (WebGL, modo revelar) faz o fade.
  A margem e a trava só existem com movimento.

  - Chamada final com mix-blend-overlay no título (a partir do tablet) e o botão Ver os pacotes.
  - Links do rodapé com a rolagem de letras (LTextLink).
  - Parallax: a foto anda mais devagar; a chamada sobe um pouco enquanto é revelada.
  Redes e e-mail de contato são provisórios (ver CLAUDE.md).

  Fundo: vídeo em loop (public/video/rodape.*, LoopVideo, sem travar no fim) por cima da foto
  (fallback). A LUT é aplicada ao vivo (VideoComLut), como na Como usar: o vídeo aparece cru e
  o look sobe até a dose do rodapé (DOSE_NO_RODAPE, menor que nas outras seções) enquanto a FAQ sai e revela o rodapé. LUT provisória (ver
  lib/lut.ts). O vídeo baixa e toca a partir de uma tela de distância.
-->
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, useTemplateRef } from 'vue'
import PaletteIcon from '@/components/icons/animated/PaletteIcon.vue'
import VeuTransicao from '@/components/effects/VeuTransicao.vue'
import LoopVideo from '@/components/effects/LoopVideo.vue'
import VideoComLut from '@/components/effects/VideoComLut.vue'
import { LUT_DOS_VIDEOS } from '@/lib/lut'
import LButton from '@/components/ui/LButton.vue'
import LTextLink from '@/components/ui/LTextLink.vue'
import { COM_MOVIMENTO, gsap, prefereMenosMovimento, ScrollTrigger } from '@/lib/gsap'
import fundo768 from '@/assets/images/rodape-768.jpg'
import fundo1536 from '@/assets/images/rodape-1536.jpg'

const EMAIL = 'contato@getlutra.com.br'

const colunas = [
  {
    titulo: 'Navegação',
    links: [
      { rotulo: 'Home', to: '/#inicio' },
      { rotulo: 'Sobre', to: '/#sobre' },
      { rotulo: 'Como usar', to: '/#como-usar' },
      { rotulo: 'Pacotes', to: '/#pacotes' },
    ],
  },
  {
    titulo: 'Ajuda',
    links: [
      { rotulo: 'FAQ', to: '/#faq' },
      { rotulo: 'Contato', to: '/contato' },
      { rotulo: 'Termos de uso', to: '/termos' },
    ],
  },
  {
    titulo: 'Redes',
    links: [
      { rotulo: 'Instagram', href: 'https://www.instagram.com/getlutra' },
      { rotulo: 'TikTok', href: 'https://www.tiktok.com/@getlutra' },
      { rotulo: 'YouTube', href: 'https://www.youtube.com/@getlutra' },
    ],
  },
]

/* Overlay do Figma: noite sólido no topo, aberto no meio e um pouco mais escuro na base */
const degrade =
  'linear-gradient(180deg, rgb(14 13 11) 0%, rgb(14 13 11) 6%, rgb(14 13 11 / 0.95) 12%, rgb(14 13 11 / 0.82) 20%, rgb(14 13 11 / 0.6) 28%, rgb(14 13 11 / 0.4) 36%, rgb(14 13 11 / 0.24) 45%, rgb(14 13 11 / 0.12) 55%, rgb(14 13 11 / 0.08) 62%, rgb(14 13 11 / 0.05) 72%, rgb(14 13 11 / 0.3) 88%, rgb(14 13 11 / 0.55) 100%)'

const secao = useTemplateRef<HTMLElement>('secao')
const midia = useTemplateRef<HTMLElement>('midia')
const chamada = useTemplateRef<HTMLElement>('chamada')

const progresso = ref(0)
const comMovimento = ref(false)

/* Vídeo com LUT: perto da tela (até uma tela de distância) baixa e toca */
const usarVideo = ref(false)
const perto = ref(false)
const videoAtual = shallowRef<HTMLVideoElement | null>(null)

/*
 * Intensidade da LUT: começa crua e chega à dose quando o rodapé termina de ser revelado.
 * No rodapé a dose é menor que nas outras seções: a foto da estrada já é bem saturada.
 */
const DOSE_NO_RODAPE = 0.45
const intensidade = computed(() => {
  if (!comMovimento.value) return DOSE_NO_RODAPE
  const t = Math.min(Math.max((progresso.value - 0.15) / 0.8, 0), 1)
  return t * t * (3 - 2 * t) * DOSE_NO_RODAPE
})

let observadorVisao: IntersectionObserver | undefined
const mm = gsap.matchMedia()

onMounted(() => {
  mm.add(COM_MOVIMENTO, () => {
    const el = secao.value
    if (!el) return
    comMovimento.value = true

    // Começa escondido atrás da última tela da FAQ
    const ajustarMargem = () => {
      el.style.marginTop = `${-window.innerHeight}px`
    }
    ajustarMargem()
    ScrollTrigger.addEventListener('refreshInit', ajustarMargem)

    // Trava por uma tela enquanto a FAQ sai por cima
    const revelacao = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: '+=100%',
        pin: true,
        anticipatePin: 1,
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => (progresso.value = self.progress),
        onRefresh: (self) => (progresso.value = self.progress),
      },
    })
    revelacao
      .fromTo(chamada.value?.children ?? [], { y: (i: number) => 50 + i * 30 }, { y: 0 }, 0)
      .fromTo(midia.value, { yPercent: -6 }, { yPercent: 0 }, 0)

    return () => {
      ScrollTrigger.removeEventListener('refreshInit', ajustarMargem)
      el.style.marginTop = ''
      comMovimento.value = false
      progresso.value = 0
    }
  })
})

onMounted(() => {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } }
  usarVideo.value = !prefereMenosMovimento() && !nav.connection?.saveData
  if (!secao.value) return
  observadorVisao = new IntersectionObserver(([entrada]) => (perto.value = !!entrada?.isIntersecting), {
    rootMargin: '100% 0px',
  })
  observadorVisao.observe(secao.value)
})

onBeforeUnmount(() => {
  mm.revert()
  observadorVisao?.disconnect()
})
</script>

<template>
  <footer id="rodape" ref="secao" class="relative isolate overflow-hidden bg-noite">
    <div aria-hidden="true" class="absolute inset-0 -z-10">
      <!-- Mídia (foto, vídeo e LUT): 112% de altura e -6% no topo, folga para o parallax -->
      <div ref="midia" class="absolute inset-x-0 -top-[6%] h-[112%] w-full">
        <img
          :src="fundo1536"
          :srcset="`${fundo768} 768w, ${fundo1536} 1536w`"
          sizes="100vw"
          alt=""
          decoding="async"
          fetchpriority="low"
          class="absolute inset-0 size-full object-cover"
        />
        <LoopVideo
          v-if="usarVideo"
          webm="/video/rodape.webm"
          mp4="/video/rodape.mp4"
          poster="/video/rodape-poster.jpg"
          :tocar="perto"
          :preload="perto ? 'auto' : 'metadata'"
          @atual="videoAtual = $event"
        />
        <VideoComLut
          v-if="usarVideo && videoAtual && LUT_DOS_VIDEOS"
          :video="videoAtual"
          :lut="LUT_DOS_VIDEOS"
          :intensidade="intensidade"
          :ativo="perto"
        />
      </div>
      <div class="absolute inset-0" :style="{ backgroundImage: degrade }" />
    </div>

    <div class="flex min-h-dvh flex-col lg:min-h-[960px]">
      <!-- Chamada final -->
      <div ref="chamada" class="flex flex-1 flex-col items-center justify-center gap-4 px-4 pt-40 pb-20 text-center lg:pt-72">
        <h2
          class="font-serif text-[clamp(2.75rem,7vw,5rem)] leading-none text-off-white md:mix-blend-overlay"
        >
          Seu próximo vídeo<br />
          <em>merece cara de filme</em>.
        </h2>
        <div class="pt-2">
          <LButton to="/#pacotes" :icon="PaletteIcon">Ver os pacotes</LButton>
        </div>
      </div>

      <!-- Rodapé -->
      <div class="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-4 pb-10 sm:px-8 lg:px-16">
        <div class="flex flex-col justify-between gap-12 md:flex-row">
          <div class="flex flex-col gap-3">
            <RouterLink to="/#inicio" class="font-serif text-[40px] leading-none text-off-white" aria-label="Lutra, voltar ao início">
              Lutra
            </RouterLink>
            <p class="text-[15px] text-off-white/60">Film looks, made simple.</p>
          </div>

          <nav aria-label="Rodapé" class="grid grid-cols-2 gap-x-[72px] gap-y-10 sm:flex">
            <div v-for="coluna in colunas" :key="coluna.titulo" class="flex flex-col gap-3">
              <p class="text-sm font-medium text-off-white/50">{{ coluna.titulo }}</p>
              <ul class="flex flex-col gap-3">
                <li v-for="link in coluna.links" :key="link.rotulo">
                  <LTextLink
                    :to="'to' in link ? link.to : undefined"
                    :href="'href' in link ? link.href : undefined"
                    class="text-[15px] text-off-white/90 transition-colors hover:text-off-white"
                  >
                    {{ link.rotulo }}
                  </LTextLink>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <div class="h-px w-full bg-off-white/12" />

        <div class="flex flex-col justify-between gap-3 text-[13px] text-off-white/50 sm:flex-row">
          <p>© {{ new Date().getFullYear() }} Lutra. Todos os direitos reservados.</p>
          <LTextLink :href="`mailto:${EMAIL}`" class="transition-colors hover:text-off-white">{{ EMAIL }}</LTextLink>
        </div>
      </div>
    </div>

    <!-- Véu da transição: último filho e sem z-index, para ficar por cima de todo o conteúdo -->
    <VeuTransicao v-if="comMovimento" modo="revelar" :progresso="progresso" />
  </footer>
</template>
