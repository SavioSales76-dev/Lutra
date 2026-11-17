<!--
  Como usar (Figma: 1.1 Landing › "Como usar — Desktop", node 57:2).
  Foto de fundo provisória (gerada no Figma) com o overlay em degradê do Figma, que já
  começa e termina em noite sólido.

  Camadas: a Como usar fica na mesma camada da Hero, abaixo da Sobre (z-10).

  Transição com a Sobre (o espelho da Hero → Sobre):
  - A seção tem margem negativa de uma tela, então começa escondida atrás da última tela
    da Sobre. Ela trava (pin) no topo por uma tela enquanto a Sobre sai por cima, e vai
    sendo revelada pela borda de baixo da Sobre. A margem só existe com movimento; sem
    ele, as seções ficam uma depois da outra.
  - VeuTransicao (WebGL, modo revelar) é um véu de noite por cima de todo o conteúdo,
    colado abaixo da borda da Sobre, com frente orgânica; some quando a seção fica à mostra.
  - Parallax: a foto anda mais devagar que a página; o cabeçalho e os cards sobem um pouco
    enquanto são revelados, cada card um pouco mais que o anterior.

  Transição com a Pacotes (o mesmo da Hero → Sobre): quando a base da seção encosta no pé
  da tela, o "palco" (todo o conteúdo visual) passa a descer na mesma velocidade da rolagem,
  então parece parado, enquanto a Pacotes (z-10) sobe por cima. O mesmo véu troca para o
  modo cobrir, alinhado à base. Não dá para usar um segundo pin no mesmo elemento. As animações vão em cada elemento
    (.entra), não no contêiner: transform no contêiner isolaria o mix-blend-overlay do título.
-->
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import { Blend, Import, PackageOpen } from 'lucide-vue-next'
import VeuTransicao from '@/components/effects/VeuTransicao.vue'
import { COM_MOVIMENTO, gsap, ScrollTrigger } from '@/lib/gsap'
import fundo768 from '@/assets/images/como-usar-768.jpg'
import fundo1536 from '@/assets/images/como-usar-1536.jpg'

const passos = [
  { numero: '01', icone: PackageOpen, titulo: 'Baixe o pack', texto: 'Receba os arquivos .cube no e-mail logo após a compra.' },
  { numero: '02', icone: Import, titulo: 'Importe no editor', texto: 'Premiere, DaVinci, Final Cut ou CapCut: arraste a LUT para o projeto.' },
  { numero: '03', icone: Blend, titulo: 'Aplique e dose', texto: 'Coloque sobre o clipe e ajuste a intensidade até achar o seu look.' },
]

/* Overlay do Figma: noite sólido no topo e na base, mais aberto no meio. */
const degrade =
  'linear-gradient(180deg, rgb(14 13 11) 0%, rgb(14 13 11) 5%, rgb(14 13 11 / 0.96) 10%, rgb(14 13 11 / 0.86) 16%, rgb(14 13 11 / 0.68) 22%, rgb(14 13 11 / 0.5) 28%, rgb(14 13 11 / 0.38) 34%, rgb(14 13 11 / 0.32) 40%, rgb(14 13 11 / 0.35) 60%, rgb(14 13 11 / 0.45) 68%, rgb(14 13 11 / 0.62) 76%, rgb(14 13 11 / 0.8) 84%, rgb(14 13 11 / 0.93) 90%, rgb(14 13 11) 95%)'

const secao = useTemplateRef<HTMLElement>('secao')
const palco = useTemplateRef<HTMLElement>('palco')
const foto = useTemplateRef<HTMLImageElement>('foto')

/* Progresso da revelação (Sobre saindo) e da cobertura (Pacotes chegando) */
const progressoRevelar = ref(0)
const progressoCobrir = ref(0)
const comMovimento = ref(false)

/* Um único véu: revela pelo topo e, depois, cobre pela base */
const cobrindo = computed(() => progressoCobrir.value > 0)
const veu = computed(() =>
  cobrindo.value
    ? { modo: 'cobrir' as const, ancora: 'base' as const, progresso: progressoCobrir.value }
    : { modo: 'revelar' as const, ancora: 'topo' as const, progresso: progressoRevelar.value },
)

const mm = gsap.matchMedia()

onMounted(() => {
  mm.add(COM_MOVIMENTO, () => {
    const el = secao.value
    if (!el) return
    comMovimento.value = true

    // Começa escondida atrás da última tela da Sobre (altura da tela medida a cada recálculo)
    const ajustarMargem = () => {
      el.style.marginTop = `${-window.innerHeight}px`
    }
    ajustarMargem()
    ScrollTrigger.addEventListener('refreshInit', ajustarMargem)

    // Trava por uma tela enquanto a Sobre sai por cima; o progresso guia o véu e a entrada
    const revelacao = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: '+=100%',
        pin: true,
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => (progressoRevelar.value = self.progress),
        onRefresh: (self) => (progressoRevelar.value = self.progress),
      },
    })
    revelacao
      .fromTo(el.querySelectorAll('.entra'), { y: () => window.innerHeight * 0.12 }, { y: 0 }, 0)
      .fromTo(el.querySelectorAll('.passo'), { y: (i: number) => 50 + i * 30 }, { y: 0 }, 0)

    // Parallax da foto: da revelação até a seção sair da tela
    gsap.fromTo(
      foto.value,
      { yPercent: -6 },
      {
        yPercent: 6,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: () => revelacao.scrollTrigger?.start ?? 0,
          end: () => (revelacao.scrollTrigger?.end ?? 0) + el.offsetHeight,
          scrub: true,
          invalidateOnRefresh: true,
        },
      },
    )

    // Cobertura pela Pacotes: começa quando a base da seção encosta no pé da tela e dura uma tela
    const inicioCobertura = () => (revelacao.scrollTrigger?.end ?? 0) + Math.max(0, el.offsetHeight - window.innerHeight)
    gsap.fromTo(
      palco.value,
      { y: 0 },
      {
        y: () => window.innerHeight,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: inicioCobertura,
          end: () => inicioCobertura() + window.innerHeight,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => (progressoCobrir.value = self.progress),
          onRefresh: (self) => (progressoCobrir.value = self.progress),
        },
      },
    )

    return () => {
      ScrollTrigger.removeEventListener('refreshInit', ajustarMargem)
      el.style.marginTop = ''
      comMovimento.value = false
      progressoRevelar.value = 0
      progressoCobrir.value = 0
    }
  })
})

onBeforeUnmount(() => mm.revert())
</script>

<template>
  <section
    id="como-usar"
    data-ancora-deslocamento="tela"
    ref="secao"
    aria-labelledby="como-usar-titulo"
    class="relative"
  >
    <!-- Palco: todo o conteúdo visual (desce junto com a rolagem durante a cobertura) -->
    <div
      ref="palco"
      class="relative isolate flex min-h-dvh items-center overflow-hidden bg-noite px-4 py-28 sm:px-8 lg:min-h-[1000px]"
    >
      <div aria-hidden="true" class="absolute inset-0 -z-10">
        <!-- 112% de altura e -6% no topo: folga para o parallax não mostrar a borda -->
        <img
          ref="foto"
          :src="fundo1536"
          :srcset="`${fundo768} 768w, ${fundo1536} 1536w`"
          sizes="100vw"
          alt=""
          loading="lazy"
          decoding="async"
          class="absolute inset-x-0 -top-[6%] h-[112%] w-full object-cover"
        />
        <div class="absolute inset-0" :style="{ backgroundImage: degrade }" />
      </div>

      <div class="mx-auto flex w-full max-w-[992px] flex-col items-center gap-12 lg:gap-14">
        <header class="flex flex-col items-center gap-5 text-center">
          <p class="entra text-[13px] font-medium tracking-[-0.02em] text-off-white/70">Como usar</p>
          <h2
            id="como-usar-titulo"
            class="entra font-serif text-[clamp(3rem,8vw,5.5rem)] leading-none tracking-[-0.004em] text-off-white md:mix-blend-overlay"
          >
            Três passos,<br />
            <em>um filme.</em>
          </h2>
          <p class="entra max-w-[480px] text-[17px] leading-[1.4] tracking-[-0.02em] text-off-white/80 sm:text-lg">
            Sem curso de colorização, sem horas de ajuste. Funciona no celular ou no computador, com o editor que
            você já usa.
          </p>
        </header>

        <ol class="grid w-full gap-4 md:grid-cols-3">
          <li v-for="passo in passos" :key="passo.numero" class="passo">
            <article class="vidro passo__card flex h-full flex-col gap-4 rounded-[20px] p-7">
              <div class="flex items-center justify-between">
                <component :is="passo.icone" :size="24" :stroke-width="2" aria-hidden="true" class="text-off-white" />
                <span class="text-[13px] font-medium tracking-[-0.02em] text-off-white/50">{{ passo.numero }}</span>
              </div>
              <h3 class="mt-6 font-serif text-[32px] leading-tight text-off-white">{{ passo.titulo }}</h3>
              <p class="text-[15px] leading-normal text-off-white/75">{{ passo.texto }}</p>
            </article>
          </li>
        </ol>
      </div>

      <!-- Véu das transições: último filho e sem z-index, para ficar por cima de todo o conteúdo -->
      <VeuTransicao v-if="comMovimento" :modo="veu.modo" :ancora="veu.ancora" :progresso="veu.progresso" />
    </div>
  </section>
</template>

<style scoped>
/* Microinteração dos cards: sobem com mola e a borda clareia no hover */
.passo__card {
  transition:
    transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1),
    border-color 250ms ease-out,
    background-color 250ms ease-out;
}

.passo__card:hover {
  transform: translateY(-4px);
  border-color: color-mix(in srgb, var(--color-off-white) 32%, transparent);
  background-color: color-mix(in srgb, var(--color-off-white) 7%, transparent);
}
</style>
