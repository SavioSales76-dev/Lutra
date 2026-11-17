<!--
  Vídeo em loop sem a "travada" do fim.

  O atributo `loop` do <video> reinicia o decodificador no fim e o navegador congela por
  um instante antes de voltar ao começo. Aqui são dois <video> iguais, alternando:
  um pouco antes do fim do atual (FOLGA), o outro, já parado no quadro 0, começa a tocar;
  quando ele desenha o primeiro quadro, assume o lugar (troca instantânea, sem fade, porque
  o loop foi exportado com a emenda cruzada e o fim já se parece com o começo).
  O vídeo que saiu volta para o quadro 0 e fica pronto para a próxima volta.
  O navegador reaproveita o arquivo baixado, então não há download em dobro.

  Emite `atual` com o elemento que está à mostra (para a LUT ler dele), `pronto` quando o
  primeiro vídeo já pode tocar e `tocando` quando o vídeo começa de fato.
-->
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    webm: string
    mp4: string
    poster: string
    /** Toca (true) ou pausa (false) */
    tocar: boolean
    preload?: 'auto' | 'metadata' | 'none'
  }>(),
  { preload: 'auto' },
)

const emit = defineEmits<{
  atual: [HTMLVideoElement]
  pronto: []
  tocando: []
}>()

/* Quanto antes do fim a troca acontece (em segundos) */
const FOLGA = 0.15

type Video = HTMLVideoElement & {
  requestVideoFrameCallback?: (cb: () => void) => number
  cancelVideoFrameCallback?: (id: number) => void
}

const a = useTemplateRef<Video>('a')
const b = useTemplateRef<Video>('b')
const ativo = ref<0 | 1>(0)
const elementos = () => [a.value, b.value] as const

let trocando = false
let idQuadro = 0
let vigiado: Video | null = null

function atual() {
  return elementos()[ativo.value]
}

function proximoDoFim(v: Video) {
  return v.duration > 0 && v.currentTime >= v.duration - FOLGA
}

/*
 * Quando o próximo vídeo já está tocando com dados suficientes, executa `cb` no quadro
 * seguinte da tela. (Não dá para usar requestVideoFrameCallback aqui: o vídeo ainda está
 * invisível, com opacidade 0, e o navegador não "apresenta" quadros dele.)
 */
function aoPrimeiroQuadro(v: Video, cb: () => void) {
  const noProximoQuadro = () => requestAnimationFrame(() => cb())
  if (v.readyState >= 3 && !v.paused) noProximoQuadro()
  else v.addEventListener('playing', noProximoQuadro, { once: true })
}

function trocar() {
  const anterior = atual()
  const proximo = elementos()[ativo.value === 0 ? 1 : 0]
  if (trocando || !anterior || !proximo) return
  trocando = true
  proximo.currentTime = 0
  proximo
    .play()
    .then(() =>
      aoPrimeiroQuadro(proximo, () => {
        ativo.value = ativo.value === 0 ? 1 : 0
        emit('atual', proximo)
        anterior.pause()
        anterior.currentTime = 0
        trocando = false
        vigiar()
      }),
    )
    .catch(() => {
      // Sem autoplay no segundo: volta ao jeito simples (reinicia o mesmo vídeo)
      anterior.currentTime = 0
      trocando = false
    })
}

/* Acompanha o vídeo atual quadro a quadro (rVFC) ou pelo timeupdate */
function vigiar() {
  const v = atual()
  if (!v) return
  if (vigiado && vigiado !== v) {
    if (idQuadro) vigiado.cancelVideoFrameCallback?.(idQuadro)
    vigiado.removeEventListener('timeupdate', aoTempo)
    idQuadro = 0
  }
  vigiado = v
  if (v.requestVideoFrameCallback) {
    const passo = () => {
      idQuadro = 0
      if (vigiado !== v) return
      if (proximoDoFim(v)) trocar()
      else if (!v.paused) idQuadro = v.requestVideoFrameCallback!(passo)
    }
    if (!idQuadro) idQuadro = v.requestVideoFrameCallback(passo)
  } else {
    v.addEventListener('timeupdate', aoTempo)
  }
}

function aoTempo() {
  const v = atual()
  if (v && proximoDoFim(v)) trocar()
}

function aplicarTocar() {
  const v = atual()
  if (!v) return
  if (props.tocar) {
    v.play()
      .then(() => vigiar())
      .catch(() => undefined)
  } else {
    v.pause()
  }
}

watch(() => props.tocar, aplicarTocar)

onMounted(() => {
  const primeiro = a.value
  if (!primeiro) return
  emit('atual', primeiro)
  if (primeiro.readyState >= 3) emit('pronto')
  else primeiro.addEventListener('canplay', () => emit('pronto'), { once: true })
  primeiro.addEventListener('playing', () => emit('tocando'), { once: true })
  // Garantia: se o vídeo chegar ao fim sem ter trocado antes, troca agora
  for (const v of elementos()) {
    v?.addEventListener('ended', () => {
      if (v === atual()) trocar()
    })
  }
  aplicarTocar()
})

onBeforeUnmount(() => {
  if (vigiado && idQuadro) vigiado.cancelVideoFrameCallback?.(idQuadro)
  vigiado?.removeEventListener('timeupdate', aoTempo)
})
</script>

<template>
  <!-- Contêiner único: as classes passadas pelo pai (ex.: fade) valem para os dois vídeos -->
  <div class="absolute inset-0">
    <!-- Dois elementos escritos à mão (refs dentro de v-for viram listas) -->
    <video
      ref="a"
      class="absolute inset-0 size-full object-cover"
      :class="ativo === 0 ? 'opacity-100' : 'opacity-0'"
      :poster="poster"
      :muted="true"
      playsinline
      :preload="preload"
      disablepictureinpicture
      aria-hidden="true"
    >
      <source :src="webm" type="video/webm" />
      <source :src="mp4" type="video/mp4" />
    </video>
    <video
      ref="b"
      class="absolute inset-0 size-full object-cover"
      :class="ativo === 1 ? 'opacity-100' : 'opacity-0'"
      :muted="true"
      playsinline
      :preload="preload"
      disablepictureinpicture
      aria-hidden="true"
    >
      <source :src="webm" type="video/webm" />
      <source :src="mp4" type="video/mp4" />
    </video>
  </div>
</template>
