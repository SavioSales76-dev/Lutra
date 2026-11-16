<script setup lang="ts">
import { MotionConfig } from 'motion-v'
import FilmGrain from '@/components/effects/FilmGrain.vue'
</script>

<template>
  <!-- reduced-motion="user": animações do motion-v respeitam prefers-reduced-motion -->
  <MotionConfig reduced-motion="user">
    <RouterView />
    <FilmGrain />
  </MotionConfig>
</template>
