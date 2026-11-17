<!-- lucide-animated "contrast": a metade preenchida gira 180°, trocando o lado claro e o escuro. -->
<script setup lang="ts">
import { computed } from 'vue'
import { motion } from 'motion-v'
import type { Variantes } from './tipos'

const props = withDefaults(defineProps<{ size?: number; animating?: boolean }>(), { size: 20, animating: false })
const estado = computed(() => (props.animating ? 'animate' : 'normal'))

const metade: Variantes = {
  normal: { rotate: 0 },
  animate: {
    rotate: 180,
    transformOrigin: 'left center',
    transition: { type: 'spring', stiffness: 80, damping: 12 },
  },
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
    <circle cx="12" cy="12" r="10" />
    <motion.path d="M12 18a6 6 0 0 0 0-12v12z" :variants="metade" initial="normal" :animate="estado" />
  </svg>
</template>
