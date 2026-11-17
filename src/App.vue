<script setup lang="ts">
import { MotionConfig } from 'motion-v'
import FilmGrain from '@/components/effects/FilmGrain.vue'
import TelaCarregamento from '@/components/layout/TelaCarregamento.vue'
</script>

<template>
  <!-- reduced-motion="user": animações do motion-v respeitam prefers-reduced-motion -->
  <MotionConfig reduced-motion="user">
    <RouterView />
    <TelaCarregamento />
    <FilmGrain />
  </MotionConfig>

  <!-- Filtro da refração do vidro (.vidro em main.css, só no Chrome/Edge) -->
  <svg aria-hidden="true" width="0" height="0" class="absolute">
    <filter id="lutra-refracao" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.008 0.014" numOctaves="2" seed="7" result="ruido" />
      <feGaussianBlur in="ruido" stdDeviation="2" result="ruidoSuave" />
      <feDisplacementMap in="SourceGraphic" in2="ruidoSuave" scale="36" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </svg>
</template>
