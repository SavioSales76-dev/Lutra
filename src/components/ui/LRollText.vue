<!--
  Texto que rola para cima letra por letra quando `ativo` liga, e volta quando desliga.
  Quem decide quando é ativo é o pai (hover, foco, toque).

  Cada letra é uma janela de uma linha (1lh) com duas cópias empilhadas;
  a coluna sobe 50% e a cópia de baixo ocupa o lugar.
  A divisão é feita no template (não com SplitText) para o Vue continuar dono do DOM.
  Leitores de tela leem só o texto inteiro, no span sr-only.

  Animação: uma única timeline GSAP por componente, criada uma vez e só tocada para
  frente (play) ou para trás (reverse). Assim, ao entrar e sair rápido, as letras
  invertem o caminho de onde estão, sem nunca ficarem paradas no meio esperando
  o atraso do stagger. A volta é mais rápida que a ida.
-->
<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { gsap, prefereMenosMovimento } from '@/lib/gsap'

const props = defineProps<{ texto: string; ativo?: boolean }>()

const DURACAO = 0.32
const INTERVALO = 0.012
const VELOCIDADE_VOLTA = 1.6

/* Espaço vira espaço não separável para a janela da letra não colapsar. */
const letras = computed(() => [...props.texto].map((c) => (c === ' ' ? ' ' : c)))

const raiz = ref<HTMLElement>()
let timeline: gsap.core.Timeline | undefined

function criarTimeline() {
  timeline?.kill()
  const colunas = raiz.value?.querySelectorAll('.l-roll__coluna')
  if (!colunas?.length) return
  timeline = gsap
    .timeline({ paused: true })
    .to(colunas, { yPercent: -50, duration: DURACAO, ease: 'power2.out', stagger: INTERVALO })
  // Se o texto mudar com o componente ativo, já nasce no estado final
  if (props.ativo) timeline.progress(1)
}

function aplicar(subir: boolean) {
  if (!timeline) return
  if (prefereMenosMovimento()) {
    timeline.pause().progress(subir ? 1 : 0)
    return
  }
  if (subir) timeline.timeScale(1).play()
  else timeline.timeScale(VELOCIDADE_VOLTA).reverse()
}

onMounted(criarTimeline)

watch(letras, async () => {
  await nextTick()
  criarTimeline()
})

watch(
  () => props.ativo,
  (subir) => aplicar(!!subir),
)

onBeforeUnmount(() => timeline?.kill())
</script>

<template>
  <span ref="raiz" class="inline-block">
    <span class="sr-only">{{ texto }}</span>
    <span aria-hidden="true" class="flex">
      <span v-for="(letra, i) in letras" :key="i" class="block h-[1lh] overflow-hidden">
        <span class="l-roll__coluna flex flex-col">
          <span>{{ letra }}</span>
          <span>{{ letra }}</span>
        </span>
      </span>
    </span>
  </span>
</template>
