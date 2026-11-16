<!--
  Véu WebGL (OGL) da transição Hero → Sobre. Canvas transparente que fica por cima de
  todo o conteúdo da Hero (foto, título, texto, botões e menu) e escurece por uma frente
  orgânica guiada por `progresso` (0 a 1, vindo do ScrollTrigger da Hero).
  Não recebe cliques (pointer-events: none).

  Só desenha quando precisa: em loop apenas durante a transição (0 < progresso < 1);
  com a Hero parada o canvas fica vazio (transparente).

  Não liga com prefers-reduced-motion, economia de dados, pouca memória ou sem WebGL;
  nesses casos fica o degradê em CSS da Sobre. Enquanto está ativa, marca
  <html data-transicao-webgl> para a Sobre esconder esse degradê.
-->
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Mesh, Program, Renderer, Triangle } from 'ogl'
import { prefereMenosMovimento, ScrollTrigger } from '@/lib/gsap'
import { fragment, vertex } from './transicao-shader'

const props = defineProps<{
  /** 0 = Hero inteira, 1 = Sobre cobrindo tudo. */
  progresso: number
}>()

const host = ref<HTMLDivElement>()

let pedirQuadro: (() => void) | undefined
let parar: (() => void) | undefined

function podeAnimar() {
  if (prefereMenosMovimento()) return false
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number }
  if (nav.connection?.saveData) return false
  if ((nav.deviceMemory ?? 8) < 4) return false
  return true
}

function iniciar() {
  const el = host.value
  if (!el || !podeAnimar()) return

  let renderer: Renderer
  try {
    renderer = new Renderer({
      dpr: Math.min(window.devicePixelRatio, 1.5),
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
    })
  } catch {
    return
  }
  const gl = renderer.gl
  if (!gl) return
  gl.clearColor(0, 0, 0, 0)

  gl.canvas.setAttribute('aria-hidden', 'true')
  gl.canvas.classList.add('absolute', 'inset-0', 'size-full')
  el.appendChild(gl.canvas)

  const program = new Program(gl, {
    vertex,
    fragment,
    transparent: true,
    uniforms: {
      uResolucao: { value: [1, 1] },
      uProgresso: { value: props.progresso },
      uTempo: { value: 0 },
    },
  })
  const mesh = new Mesh(gl, { geometry: new Triangle(gl), program })
  document.documentElement.setAttribute('data-transicao-webgl', '')
  // A Hero decide se o texto some por opacidade conforme esse atributo; recalcula a timeline
  ScrollTrigger.refresh()

  const inicio = performance.now()
  // No celular, 30 quadros por segundo bastam durante a transição
  const intervaloMin = window.matchMedia('(pointer: coarse)').matches ? 1000 / 30 : 0
  let quadro = 0
  let ultimo = 0

  function desenhar(agora: number) {
    quadro = 0
    if (agora - ultimo >= intervaloMin) {
      ultimo = agora
      program.uniforms.uProgresso.value = props.progresso
      program.uniforms.uTempo.value = (agora - inicio) / 1000
      renderer.render({ scene: mesh })
    }
    // Continua em loop só durante a transição (o ruído da frente se move com o tempo)
    if (props.progresso > 0 && props.progresso < 1) quadro = requestAnimationFrame(desenhar)
  }

  pedirQuadro = () => {
    if (!quadro) quadro = requestAnimationFrame(desenhar)
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
    cancelAnimationFrame(quadro)
    observador.disconnect()
    document.documentElement.removeAttribute('data-transicao-webgl')
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    gl.canvas.remove()
  }
}

watch(
  () => props.progresso,
  () => pedirQuadro?.(),
)

onMounted(() => {
  const agendar = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200))
  agendar(iniciar)
})

onBeforeUnmount(() => parar?.())
</script>

<template>
  <div ref="host" aria-hidden="true" class="pointer-events-none absolute inset-0" />
</template>
