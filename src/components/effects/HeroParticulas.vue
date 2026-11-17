<!--
  Pólen e poeira na brisa por cima do vídeo da Hero (WebGL com OGL). Ver particulas-shader.ts.

  Otimização (o objetivo é nunca travar a página):
  - Movimento todo na GPU; por quadro o processador só atualiza alguns uniforms.
  - Um draw call, sem texturas; resolução limitada (1,5× no desktop, 1× no celular).
  - ~240 partículas no desktop, ~110 no toque. Se a média cair abaixo de ~40 quadros por
    segundo, a quantidade desenhada cai pela metade (até um mínimo).
  - Só desenha com a Hero à mostra (`ativo` e progresso < 1) e com a aba visível;
    fora disso o loop para de vez (nenhum requestAnimationFrame pendente).
  - Não liga com prefers-reduced-motion, economia de dados, pouca memória ou poucos núcleos.

  Rajadas: de tempos em tempos o vento acelera e as partículas balançam mais; o mouse
  empurra as partículas próximas. Entra com fade quando a Hero termina de carregar.
-->
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Geometry, Mesh, Program, Renderer } from 'ogl'
import { prefereMenosMovimento } from '@/lib/gsap'
import { fragment, vertex } from './particulas-shader'

const props = defineProps<{
  /** A Hero está pronta para mostrar efeitos (depois da tela de carregamento). */
  ativo: boolean
  /** Progresso da cobertura da Hero pela Sobre (0 a 1); em 1 o efeito para. */
  progresso: number
}>()

const host = ref<HTMLDivElement>()
let atualizarEstado: (() => void) | undefined
let parar: (() => void) | undefined

function podeAnimar() {
  if (prefereMenosMovimento()) return false
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number }
  if (nav.connection?.saveData) return false
  if ((nav.deviceMemory ?? 8) < 4) return false
  if ((nav.hardwareConcurrency ?? 8) < 4) return false
  return true
}

function iniciar() {
  const el = host.value
  if (!el || !podeAnimar()) return

  const toque = window.matchMedia('(pointer: coarse)').matches
  const dpr = Math.min(window.devicePixelRatio, toque ? 1 : 1.5)

  let renderer: Renderer
  try {
    renderer = new Renderer({ dpr, alpha: true, premultipliedAlpha: true, antialias: false, depth: false })
  } catch {
    return
  }
  const gl = renderer.gl
  if (!gl) return
  gl.clearColor(0, 0, 0, 0)
  gl.canvas.setAttribute('aria-hidden', 'true')
  gl.canvas.classList.add('absolute', 'inset-0', 'size-full')
  el.appendChild(gl.canvas)

  // Sementes fixas: x, y, fase, camada (mais partículas longe que perto)
  const total = toque ? 110 : 240
  const sementes = new Float32Array(total * 4)
  for (let i = 0; i < total; i++) {
    sementes[i * 4] = Math.random()
    sementes[i * 4 + 1] = Math.random()
    sementes[i * 4 + 2] = Math.random()
    sementes[i * 4 + 3] = Math.pow(Math.random(), 1.8)
  }
  const geometria = new Geometry(gl, { semente: { size: 4, data: sementes } })

  const program = new Program(gl, {
    vertex,
    fragment,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uTempo: { value: 0 },
      uDeriva: { value: 0 },
      uRajada: { value: 0 },
      uOpacidade: { value: 0 },
      uDpr: { value: dpr },
      uResolucao: { value: [1, 1] },
      uMouse: { value: [-10, -10] },
      uSol: { value: [0.93, 0.5] },
    },
  })
  // Mistura aditiva: as partículas só clareiam o que está atrás
  program.setBlendFunc(gl.ONE, gl.ONE)
  const pontos = new Mesh(gl, { mode: gl.POINTS, geometry: geometria, program })

  function redimensionar() {
    const { width, height } = el!.getBoundingClientRect()
    renderer.setSize(width, height)
    program.uniforms.uResolucao.value = [width, height]
  }
  const observador = new ResizeObserver(redimensionar)
  observador.observe(el)
  redimensionar()

  // Mouse suavizado (só mouse; no toque não há "abrir caminho")
  const alvo = [-10, -10]
  const mouse = [-10, -10]
  function aoMover(e: PointerEvent) {
    if (e.pointerType !== 'mouse') return
    const r = el!.getBoundingClientRect()
    alvo[0] = (e.clientX - r.left) / r.width
    alvo[1] = (e.clientY - r.top) / r.height
  }
  function aoSair() {
    alvo[0] = -10
    alvo[1] = -10
  }
  window.addEventListener('pointermove', aoMover, { passive: true })
  document.addEventListener('pointerleave', aoSair)

  let quadro = 0
  let anterior = 0
  let tempo = 0
  let deriva = 0
  let rajada = 0
  let opacidade = 0
  let desenhadas = total
  let somaDt = 0
  let amostras = 0

  function desenhar(agora: number) {
    quadro = requestAnimationFrame(desenhar)
    // dt limitado: ao voltar de uma pausa o movimento não dá um salto
    const dt = anterior ? Math.min((agora - anterior) / 1000, 1 / 20) : 1 / 60
    anterior = agora
    tempo += dt

    // Rajadas esporádicas: picos suaves e irregulares
    const pico = Math.pow(Math.max(0, Math.sin(tempo * 0.55 + Math.sin(tempo * 0.21) * 2.2)), 8)
    rajada += (pico - rajada) * Math.min(dt * 2.5, 1)
    deriva += dt * (1 + rajada * 3.2)
    opacidade = Math.min(opacidade + dt / 2, 1)

    mouse[0] += (alvo[0] - mouse[0]) * Math.min(dt * 6, 1)
    mouse[1] += (alvo[1] - mouse[1]) * Math.min(dt * 6, 1)

    const u = program.uniforms
    u.uTempo.value = tempo
    u.uDeriva.value = deriva
    u.uRajada.value = rajada
    u.uOpacidade.value = opacidade
    u.uMouse.value = mouse

    renderer.render({ scene: pontos })

    // Qualidade adaptativa: média de 90 quadros; abaixo de ~40 fps, metade das partículas
    somaDt += dt
    if (++amostras === 90) {
      if (somaDt / amostras > 1 / 40 && desenhadas > 60) {
        desenhadas = Math.max(60, Math.floor(desenhadas / 2))
        geometria.setDrawRange(0, desenhadas)
      }
      somaDt = 0
      amostras = 0
    }
  }

  function rodar(rodando: boolean) {
    if (rodando && !quadro) {
      anterior = 0
      quadro = requestAnimationFrame(desenhar)
    } else if (!rodando && quadro) {
      cancelAnimationFrame(quadro)
      quadro = 0
    }
  }

  atualizarEstado = () => rodar(props.ativo && props.progresso < 1 && !document.hidden)
  document.addEventListener('visibilitychange', atualizarEstado)
  atualizarEstado()

  parar = () => {
    rodar(false)
    observador.disconnect()
    window.removeEventListener('pointermove', aoMover)
    document.removeEventListener('pointerleave', aoSair)
    if (atualizarEstado) document.removeEventListener('visibilitychange', atualizarEstado)
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    gl.canvas.remove()
  }
}

watch(
  () => [props.ativo, props.progresso >= 1],
  () => atualizarEstado?.(),
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
