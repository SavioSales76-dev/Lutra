<!--
  Topo do site sobre a imagem da Hero (Figma: "Hero — Desktop" › Navegação).
  No celular o menu de seções fica oculto (o mobile ainda não foi desenhado);
  ficam o logo e o botão Comprar.
  Sem z-index de propósito: o mix-blend-exclusion precisa misturar com a imagem.
-->
<script setup lang="ts">
import { Ticket } from 'lucide-vue-next'
import LButton from '@/components/ui/LButton.vue'

const itens = [
  { rotulo: 'Home', to: '/#inicio' },
  { rotulo: 'Sobre', to: '/#sobre' },
  { rotulo: 'Como usar', to: '/#como-usar' },
  { rotulo: 'Pacotes', to: '/#pacotes' },
]
</script>

<template>
  <header class="absolute inset-x-0 top-0">
    <div class="mx-auto mt-8 flex h-[42px] max-w-[1440px] items-center justify-between px-4 sm:px-8 lg:px-16">
      <RouterLink
        to="/#inicio"
        class="font-serif text-[32px] leading-none tracking-[-0.02em] text-off-white mix-blend-exclusion"
        aria-label="Lutra, voltar ao início"
      >
        Lutra
      </RouterLink>

      <nav aria-label="Seções" class="hidden gap-1.5 md:flex">
        <RouterLink
          v-for="item in itens"
          :key="item.to"
          :to="item.to"
          class="rounded-lg px-3.5 py-2 text-xs font-medium tracking-[-0.02em] text-off-white mix-blend-exclusion transition-colors hover:bg-off-white/10"
        >
          {{ item.rotulo }}
        </RouterLink>
      </nav>

      <LButton to="/#pacotes" size="sm" :icon="Ticket">Comprar</LButton>
    </div>
  </header>
</template>
