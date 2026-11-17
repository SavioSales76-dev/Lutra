<!-- lucide-animated "ticket": a metade direita se solta e inclina, como um ingresso sendo destacado. -->
<script setup lang="ts">
import { computed } from 'vue'
import { motion } from 'motion-v'
import type { Transicao, Variantes } from './tipos'

const props = withDefaults(defineProps<{ size?: number; animating?: boolean }>(), { size: 20, animating: false })
const estado = computed(() => (props.animating ? 'animate' : 'normal'))

const transition: Transicao = { type: 'spring', stiffness: 300, damping: 20 }
const esquerda: Variantes = { normal: { x: 0 }, animate: { x: -3 } }
const direita: Variantes = { normal: { x: 0, rotate: 0 }, animate: { x: 3, rotate: 4 } }
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
    class="overflow-visible"
    aria-hidden="true"
  >
    <motion.g :variants="esquerda" initial="normal" :animate="estado" :transition="transition">
      <path d="M13 5H4a2 2 0 0 0-2 2v2a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h9" />
      <path d="M13 5v2" />
      <path d="M13 11v2" />
      <path d="M13 17v2" />
    </motion.g>
    <motion.path
      d="M13 5h7a2 2 0 0 1 2 2v2a3 3 0 0 0 0 6v2a2 2 0 0 1-2 2h-7"
      :variants="direita"
      initial="normal"
      :animate="estado"
      :transition="transition"
      :style="{ transformOrigin: '13px 12px' }"
    />
  </svg>
</template>
