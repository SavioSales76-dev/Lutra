<!--
  Grão de filme por cima de toda a página. Fica parado com prefers-reduced-motion.
  Comportamento final (intensidade, animação) a ajustar com o Figma.
-->
<template>
  <div aria-hidden="true" class="film-grain pointer-events-none fixed inset-0 z-50" />
</template>

<style scoped>
.film-grain {
  opacity: 0.06;
  mix-blend-mode: overlay;
}
</style>
