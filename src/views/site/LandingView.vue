<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import HeroSection from '@/components/landing/HeroSection.vue'
import SobreSection from '@/components/landing/SobreSection.vue'
import { ScrollTrigger } from '@/lib/gsap'
import { usarLenis } from '@/lib/lenis'

const route = useRoute()

/*
 * As seções criam os pins do ScrollTrigger ao montar. Depois que todas montaram
 * (e de novo quando as fontes terminam de carregar e mudam a altura dos textos),
 * recalcula as posições de início e fim de cada trava.
 *
 * Sem âncora na URL, a landing sempre abre no topo, com a Hero inteira.
 */
function irParaOTopo() {
  window.scrollTo(0, 0)
  usarLenis()?.scrollTo(0, { immediate: true, force: true })
}

onMounted(() => {
  // O ScrollTrigger guarda a posição de rolagem e a devolve depois de recalcular; aqui não queremos isso
  ScrollTrigger.clearScrollMemory('manual')
  ScrollTrigger.refresh()
  if (!route.hash) irParaOTopo()

  document.fonts?.ready.then(() => ScrollTrigger.refresh())
})
</script>

<template>
  <main>
    <HeroSection />
    <SobreSection />
    <!-- Próximas seções: Como usar (#como-usar), Pacotes (#pacotes), FAQ (#faq) e Footer. -->
  </main>
</template>
