<!--
  Hero da landing (Figma: 1.1 Landing › "Hero — Desktop", node 50:9).
  Fundo: vídeo em loop (public/video/hero.*, gerado a partir da foto, 2× mais lento e com a
  emenda do loop cruzada) por cima da foto, que fica como fallback e pôster. O vídeo só entra
  sem prefers-reduced-motion e sem economia de dados, aparece com fade quando começa a tocar
  e pausa quando a Hero fica coberta pela Sobre. A tela de carregamento espera por ele (até 4 s).
  Foto e vídeo são provisórios; o ideal é um vídeo real com a LUT aplicada.
  A LUT (de teste, só em desenvolvimento; ver lib/lut.ts) é aplicada ao vivo no vídeo
  (VideoComLut) e sobe de 0 até a dose (DOSE_DA_LUT) logo depois da tela de carregamento.
  Por cima do vídeo (e abaixo do texto), HeroParticulas desenha pólen e poeira na brisa em
  WebGL; entra depois da tela de carregamento e para quando a Hero é coberta.
  Camadas: imagem e degradê no fundo (-z-10, dentro do `isolate`), conteúdo sem z-index
  para que o mix-blend do título misture com a imagem. O topo (SiteHeader) fica no SiteLayout.

  Saída por rolagem: a Hero fica fixa (pin sem espaço extra) enquanto a seção Sobre sobe por cima.
  - Entrada: quando a tela de carregamento sai (siteCarregado), o fundo se assenta e o
    título, o texto e os botões sobem um depois do outro. Só no primeiro carregamento.
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
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, useTemplateRef, watch } from 'vue'
import VeuTransicao from '@/components/effects/VeuTransicao.vue'
import HeroParticulas from '@/components/effects/HeroParticulas.vue'
import VideoComLut from '@/components/effects/VideoComLut.vue'
import LoopVideo from '@/components/effects/LoopVideo.vue'
import { DOSE_DA_LUT, LUT_DE_TESTE } from '@/lib/lut'
import { aguardar, imagemPronta, siteCarregado } from '@/lib/carregamento'
import { COM_MOVIMENTO, gsap, prefereMenosMovimento } from '@/lib/gsap'

/* Degradê do Figma: escurece de leve o topo e termina em noite sólido, emendando com a seção seguinte. */
const degrade =
  'linear-gradient(180deg, rgb(14 13 11 / 0.55) 0%, rgb(14 13 11 / 0.3) 12%, rgb(14 13 11 / 0.05) 28%, rgb(14 13 11 / 0.12) 45%, rgb(14 13 11 / 0.25) 55%, rgb(14 13 11 / 0.38) 63%, rgb(14 13 11 / 0.58) 71%, rgb(14 13 11 / 0.78) 79%, rgb(14 13 11 / 0.92) 86%, rgb(14 13 11 / 0.99) 92%, rgb(14 13 11) 96%)'

const secao = useTemplateRef<HTMLElement>('secao')
const fundo = useTemplateRef<HTMLElement>('fundo')
const foto = useTemplateRef<HTMLImageElement>('foto')
const midia = useTemplateRef<HTMLElement>('midia')

/* Intensidade da LUT no vídeo: começa sem LUT e sobe até a dose depois do carregamento */
const intensidadeLut = ref(siteCarregado.value ? DOSE_DA_LUT : 0)
const pararIntensidade = watch(siteCarregado, (carregado) => {
  if (!carregado) return
  pararIntensidade()
  const estado = { v: 0 }
  gsap.to(estado, {
    v: DOSE_DA_LUT,
    duration: 2.4,
    delay: 0.6,
    ease: 'power2.inOut',
    onUpdate: () => (intensidadeLut.value = estado.v),
  })
})
const sombra = useTemplateRef<HTMLDivElement>('sombra')
const titulo = useTemplateRef<HTMLElement>('titulo')
const apoio = useTemplateRef<HTMLElement>('apoio')
const botoes = useTemplateRef<HTMLElement>('botoes')

/* Vídeo de fundo: só com movimento e sem economia de dados; aparece quando começa a tocar */
const usarVideo = ref(false)
const videoTocando = ref(false)

function podeUsarVideo() {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } }
  return !prefereMenosMovimento() && !nav.connection?.saveData
}

/*
 * Vídeo em loop sem travar (LoopVideo alterna dois elementos). A tela de carregamento espera
 * ele poder tocar, mas no máximo 4 s. Toca só enquanto a Hero não está coberta pela Sobre.
 */
const videoAtual = shallowRef<HTMLVideoElement | null>(null)
let avisarVideoPronto: () => void = () => undefined
const videoPronto = new Promise<void>((resolve) => {
  avisarVideoPronto = resolve
  window.setTimeout(resolve, 4000)
})

/* Progresso da transição (0 a 1), para o véu em WebGL */
const progresso = ref(0)
const comMovimento = ref(false)

/* Com o véu em WebGL ativo, quem cobre o texto é ele; sem WebGL, o texto some por opacidade */
const someSemWebgl = () => (document.documentElement.hasAttribute('data-transicao-webgl') ? 1 : 0)

/* Distância que cada camada sobe, em fração da altura da tela (velocidades diferentes = profundidade) */
const subir = (fracao: number) => () => -window.innerHeight * fracao

const mm = gsap.matchMedia()

/*
 * Entrada depois da tela de carregamento. Anima elementos que o scroll não toca (o contêiner
 * do fundo, as linhas do título, o texto interno e cada botão) e limpa os estilos no fim,
 * para não brigar com o parallax nem com o hover dos botões.
 */
function prepararEntrada() {
  if (siteCarregado.value || prefereMenosMovimento()) return
  const linhas = secao.value?.querySelectorAll('.hero-entra') ?? []
  const botoesFilhos = botoes.value?.children ?? []
  gsap.set(fundo.value, { scale: 1.1 })
  gsap.set([...linhas, ...botoesFilhos], { yPercent: 60, opacity: 0 })

  const parar = watch(siteCarregado, (carregado) => {
    if (!carregado) return
    parar()
    gsap
      .timeline({ defaults: { ease: 'expo.out' } })
      .to(fundo.value, { scale: 1, duration: 2.2, clearProps: 'transform' }, 0)
      .to(linhas, { yPercent: 0, opacity: 1, duration: 1.4, stagger: 0.12, clearProps: 'transform,opacity' }, 0.15)
      .to(botoesFilhos, { yPercent: 0, opacity: 1, duration: 1.2, stagger: 0.1, clearProps: 'transform,opacity' }, 0.55)
  })
}

onMounted(async () => {
  // A tela de carregamento espera a foto da Hero (e o vídeo, se for usado)
  aguardar(imagemPronta(foto.value))
  prepararEntrada()

  usarVideo.value = podeUsarVideo()
  if (usarVideo.value) aguardar(videoPronto)

  mm.add(COM_MOVIMENTO, () => {
    comMovimento.value = true
    gsap
      .timeline({
        scrollTrigger: {
          trigger: secao.value,
          start: 'top top',
          end: 'bottom top',
          pin: true,
          anticipatePin: 1,
          pinSpacing: false,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => (progresso.value = self.progress),
        },
        defaults: { ease: 'none' },
      })
      .to(sombra.value, { opacity: 0.85 }, 0)
      .to(midia.value, { yPercent: -12, scale: 1.06 }, 0)
      .to(titulo.value, { y: subir(0.28), opacity: someSemWebgl, ease: 'power1.in' }, 0)
      .to(apoio.value, { y: subir(0.42), opacity: someSemWebgl, ease: 'power1.in' }, 0)
      .to(botoes.value, { y: subir(0.56), opacity: someSemWebgl, ease: 'power1.in' }, 0)

    return () => {
      comMovimento.value = false
      progresso.value = 0
    }
  })
})

/* Pausa o vídeo quando a Hero está toda coberta pela Sobre (economiza bateria) */
const tocarVideo = computed(() => progresso.value < 1)

onBeforeUnmount(() => mm.revert())
</script>

<template>
  <section id="inicio" ref="secao" class="relative isolate flex min-h-dvh flex-col overflow-hidden bg-noite">
    <div ref="fundo" aria-hidden="true" class="absolute inset-0 -z-10">
      <!-- Mídia (foto, vídeo e LUT): é ela que faz o parallax da saída -->
      <div ref="midia" class="absolute inset-0">
        <img
          ref="foto"
          :src="hero1536"
          :srcset="`${hero768} 768w, ${hero1536} 1536w`"
          sizes="100vw"
          alt=""
          fetchpriority="high"
          decoding="async"
          class="absolute inset-0 size-full object-cover"
        />
        <LoopVideo
          v-if="usarVideo"
          webm="/video/hero.webm"
          mp4="/video/hero.mp4"
          poster="/video/hero-poster.jpg"
          :tocar="tocarVideo"
          class="transition-opacity duration-700 ease-out"
          :class="videoTocando ? 'opacity-100' : 'opacity-0'"
          @atual="videoAtual = $event"
          @pronto="avisarVideoPronto()"
          @tocando="videoTocando = true"
        />
        <VideoComLut
          v-if="usarVideo && videoAtual && LUT_DE_TESTE"
          :video="videoAtual"
          :lut="LUT_DE_TESTE"
          :intensidade="intensidadeLut"
          :ativo="progresso < 1"
        />
      </div>
      <div class="absolute inset-0" :style="{ backgroundImage: degrade }" />
      <!-- Pólen e poeira na brisa (acima do vídeo e do degradê, abaixo do texto) -->
      <HeroParticulas v-if="comMovimento" :ativo="siteCarregado" :progresso="progresso" />
      <!-- Escurece a foto enquanto a Sobre cobre a Hero (opacidade animada pelo scroll) -->
      <div ref="sombra" class="hero-sombra absolute inset-0 bg-noite opacity-0" />
    </div>

    <div class="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <h1
        ref="titulo"
        class="font-serif text-[clamp(3.5rem,11vw,6.5rem)] leading-[0.95] tracking-[-0.02em] text-off-white mix-blend-overlay"
      >
        <span class="hero-entra inline-block">Film looks,</span><br />
        <em class="hero-entra inline-block tracking-[-0.003em]">made simple.</em>
      </h1>

      <p ref="apoio" class="mt-5 max-w-[560px] text-[17px] leading-[1.3] tracking-[-0.03em] text-off-white/80 sm:text-lg">
        <span class="hero-entra inline-block">
          LUTs com alma de filme para criadores que querem que cada vídeo pareça cinema. Aplique em poucos
          cliques no Premiere, DaVinci, Final Cut ou CapCut.
        </span>
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
