<!-- Layout do site (landing e páginas institucionais): topo fixo + página. Footer a implementar. -->
<script setup lang="ts">
import SiteHeader from '@/components/layout/SiteHeader.vue'
</script>

<template>
  <div class="min-h-dvh">
    <SiteHeader />
    <RouterView />
  </div>
</template>
