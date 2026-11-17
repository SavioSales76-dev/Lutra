<!-- lucide-animated "palette": o contorno é redesenhado e depois as tintas surgem uma a uma. -->
<script setup lang="ts">
import { computed } from 'vue'
import { motion } from 'motion-v'
import type { Variantes } from './tipos'

const props = withDefaults(defineProps<{ size?: number; animating?: boolean }>(), { size: 20, animating: false })
const estado = computed(() => (props.animating ? 'animate' : 'normal'))

const DASH = 70
const DESENHO = 0.45
const INTERVALO = 0.08

const tintas = [
  { cx: 6.5, cy: 12.5 },
  { cx: 8.5, cy: 7.5 },
  { cx: 13.5, cy: 6.5 },
  { cx: 17.5, cy: 10.5 },
]

const contorno: Variantes = {
  normal: { strokeDashoffset: 0 },
  animate: { strokeDashoffset: [DASH, 0], transition: { duration: DESENHO, ease: [0.65, 0, 0.35, 1] } },
}

/* No original o atraso vem de staggerChildren; aqui é explícito por índice (custom). */
const tinta: Variantes = {
  normal: { scale: 1, transition: { duration: 0.2 } },
  animate: (i: number) => ({
    scale: [0, 1],
    transition: { type: 'spring', damping: 10, stiffness: 300, delay: DESENHO + i * INTERVALO },
  }),
}
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <motion.path
      d="M12 2a1 1 0 0 0 0 20l.25 0a1.75 1.75 0 0 0 1.4-2.8l-.3-.4a1.75 1.75 0 0 1 1.4-2.8h2.25a5 5 0 0 0 5-5 10 9 0 0 0-10-9z"
      :stroke-dasharray="DASH"
      :variants="contorno"
      initial="normal"
      :animate="estado"
    />
    <motion.circle
      v-for="(ponto, i) in tintas"
      :key="i"
      :cx="ponto.cx"
      :cy="ponto.cy"
      r=".5"
      fill="currentColor"
      :custom="i"
      :variants="tinta"
      initial="normal"
      :animate="estado"
      :style="{ transformBox: 'fill-box', transformOrigin: 'center' }"
    />
  </svg>
</template>
