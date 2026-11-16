<!-- Marcador temporário para telas ainda não implementadas. Apagar quando todas estiverem prontas. -->
<script setup lang="ts">
defineProps<{ tela: string; titulo: string }>()
</script>

<template>
  <main class="grid min-h-dvh place-items-center px-4 text-center">
    <div>
      <p class="text-sm text-off-white/50">Tela {{ tela }}</p>
      <h1 class="mt-2 font-serif text-5xl">{{ titulo }}</h1>
      <p class="mt-4 text-off-white/60">Ainda não implementada.</p>
    </div>
  </main>
</template>
