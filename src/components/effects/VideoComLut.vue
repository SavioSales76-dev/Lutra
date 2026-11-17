<!--
  Desenha um <video> com uma LUT .cube aplicada em tempo real (WebGL com OGL), por cima do
  próprio vídeo. Ver lib/lut.ts e lut-shader.ts.

  O `video` pode mudar com o componente montado (o LoopVideo alterna entre dois elementos
  para o loop não travar); a LUT passa a ler do novo na hora.

  Otimização:
  - Só envia um quadro novo do vídeo para a GPU quando o vídeo tem um quadro novo
    (requestVideoFrameCallback, ~24 vezes por segundo); sem esse recurso, no máximo 30 fps.
  - Também redesenha quando a intensidade muda (rolagem), mesmo com o vídeo parado.
  - Não desenha nada com `ativo` falso (seção fora da tela) ou com o vídeo pausado.
  - Resolução limitada a 1,5× (1× no celular). A LUT é uma textura pequena (33² × 33).
  - O canvas só aparece depois do primeiro quadro desenhado (nunca mostra preto).
  Se o WebGL ou a LUT falharem, o canvas não aparece e fica o vídeo sem LUT.
-->
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Mesh, Program, Renderer, Texture, Triangle } from 'ogl'
import { carregarCube } from '@/lib/lut'
import { fragment, vertex } from './lut-shader'

const props = defineProps<{
  video: HTMLVideoElement | null
  /** URL do arquivo .cube */
  lut: string
  /** 0 = sem LUT, 1 = LUT inteira */
  intensidade: number
  /** Seção na tela (fora dela não desenha) */
  ativo: boolean
}>()

const emit = defineEmits<{ pronto: [boolean] }>()

type Video = HTMLVideoElement & {
  requestVideoFrameCallback?: (cb: () => void) => number
  cancelVideoFrameCallback?: (id: number) => void
}

const host = ref<HTMLDivElement>()
const visivel = ref(false)

let acompanhar: (() => void) | undefined
let pedirQuadro: (() => void) | undefined
let parar: (() => void) | undefined

async function iniciar() {
  const el = host.value
  if (!el) return emit('pronto', false)

  const toque = window.matchMedia('(pointer: coarse)').matches
  let renderer: Renderer
  try {
    renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, toque ? 1 : 1.5), alpha: false, antialias: false, depth: false })
  } catch {
    return emit('pronto', false)
  }
  const gl = renderer.gl
  if (!gl) return emit('pronto', false)

  let lut
  try {
    lut = await carregarCube(props.lut)
  } catch {
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return emit('pronto', false)
  }
  if (!host.value) return

  gl.canvas.setAttribute('aria-hidden', 'true')
  gl.canvas.classList.add('absolute', 'inset-0', 'size-full')
  el.appendChild(gl.canvas)

  const texturaVideo = new Texture(gl, { generateMipmaps: false, minFilter: gl.LINEAR, flipY: false })
  const texturaLut = new Texture(gl, {
    image: lut.dados,
    width: lut.largura,
    height: lut.altura,
    generateMipmaps: false,
    minFilter: gl.LINEAR,
    magFilter: gl.LINEAR,
    flipY: false,
  })

  const program = new Program(gl, {
    vertex,
    fragment,
    uniforms: {
      tVideo: { value: texturaVideo },
      tLut: { value: texturaLut },
      uTamanho: { value: lut.tamanho },
      uIntensidade: { value: props.intensidade },
      uResolucao: { value: [1, 1] },
      uMidia: { value: [16, 9] },
    },
  })
  const mesh = new Mesh(gl, { geometry: new Triangle(gl), program })

  function desenhar() {
    const v = props.video
    if (!v || v.readyState < 2 || !v.videoWidth) return
    texturaVideo.image = v
    texturaVideo.needsUpdate = true
    program.uniforms.uIntensidade.value = props.intensidade
    program.uniforms.uMidia.value = [v.videoWidth, v.videoHeight]
    renderer.render({ scene: mesh })
    if (!visivel.value) {
      visivel.value = true
      emit('pronto', true)
    }
  }

  // Quadros do vídeo atual: com requestVideoFrameCallback desenha só quando há quadro novo
  let inscrito: Video | null = null
  let idQuadro = 0
  let idRaf = 0
  let ultimo = 0

  function aoQuadroDoVideo(v: Video) {
    idQuadro = 0
    if (!props.ativo || v !== props.video) return
    desenhar()
    idQuadro = v.requestVideoFrameCallback!(() => aoQuadroDoVideo(v))
  }
  function aoRaf(agora: number) {
    idRaf = 0
    const v = props.video
    if (!props.ativo || !v || v.paused) return
    if (agora - ultimo >= 1000 / 30) {
      ultimo = agora
      desenhar()
    }
    idRaf = requestAnimationFrame(aoRaf)
  }

  acompanhar = () => {
    const v = props.video as Video | null
    if (inscrito && inscrito !== v) {
      if (idQuadro) inscrito.cancelVideoFrameCallback?.(idQuadro)
      idQuadro = 0
      inscrito.removeEventListener('play', acompanhar!)
      inscrito.removeEventListener('loadeddata', pedirQuadro!)
    }
    if (!v) return
    if (inscrito !== v) {
      v.addEventListener('play', acompanhar!)
      v.addEventListener('loadeddata', pedirQuadro!)
      inscrito = v
    }
    if (!props.ativo) return
    if (v.requestVideoFrameCallback) {
      if (!idQuadro) idQuadro = v.requestVideoFrameCallback(() => aoQuadroDoVideo(v))
    } else if (!idRaf) {
      idRaf = requestAnimationFrame(aoRaf)
    }
  }

  // Redesenho avulso (ex.: a intensidade mudou com o vídeo parado)
  let idAvulso = 0
  pedirQuadro = () => {
    if (!idAvulso) idAvulso = requestAnimationFrame(() => ((idAvulso = 0), desenhar()))
    acompanhar?.()
  }

  function redimensionar() {
    const { width, height } = el!.getBoundingClientRect()
    renderer.setSize(width, height)
    program.uniforms.uResolucao.value = [gl.canvas.width, gl.canvas.height]
    pedirQuadro?.()
  }
  const observador = new ResizeObserver(redimensionar)
  observador.observe(el)
  redimensionar()

  parar = () => {
    if (inscrito && idQuadro) inscrito.cancelVideoFrameCallback?.(idQuadro)
    inscrito?.removeEventListener('play', acompanhar!)
    inscrito?.removeEventListener('loadeddata', pedirQuadro!)
    cancelAnimationFrame(idRaf)
    cancelAnimationFrame(idAvulso)
    observador.disconnect()
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    gl.canvas.remove()
  }
}

watch(
  () => [props.intensidade, props.ativo, props.video],
  () => pedirQuadro?.(),
)

onMounted(() => {
  const agendar = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200))
  agendar(() => void iniciar())
})

onBeforeUnmount(() => parar?.())
</script>

<template>
  <div
    ref="host"
    aria-hidden="true"
    class="pointer-events-none absolute inset-0 transition-opacity duration-500"
    :class="visivel ? 'opacity-100' : 'opacity-0'"
  />
</template>
