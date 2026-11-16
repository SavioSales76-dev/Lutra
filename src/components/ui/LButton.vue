<!--
  Botão em pílula da Lutra.
  - primary: fundo off-white, texto noite.
  - glass: off-white translúcido com blur; usar sobre imagem.
  Vira RouterLink com `to`, <a> com `href` e <button> sem nenhum dos dois.
-->
<script setup lang="ts">
import { computed, type Component } from 'vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'glass'
    size?: 'sm' | 'md'
    to?: RouteLocationRaw
    href?: string
    icon?: Component
    type?: 'button' | 'submit' | 'reset'
  }>(),
  { variant: 'primary', size: 'md', type: 'button' },
)

const tag = computed(() => (props.to ? RouterLink : props.href ? 'a' : 'button'))

const tagProps = computed(() => {
  if (props.to) return { to: props.to }
  if (props.href) return { href: props.href }
  return { type: props.type }
})

const iconSize = computed(() => (props.size === 'sm' ? 18 : 20))
</script>

<template>
  <component
    :is="tag"
    v-bind="tagProps"
    class="inline-flex shrink-0 items-center gap-2.5 rounded-full border whitespace-nowrap transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-off-white disabled:pointer-events-none disabled:opacity-50"
    :class="[
      size === 'sm'
        ? 'px-[18px] py-[9px] text-[13px]/[18px] font-semibold tracking-[-0.02em]'
        : 'px-6 py-[13px] text-base/5 font-medium tracking-[-0.03em]',
      variant === 'primary'
        ? 'border-transparent bg-off-white text-noite hover:bg-off-white/88'
        : 'border-off-white/30 bg-off-white/12 text-off-white shadow-[inset_0_1px_0_0_rgb(244_241_234/0.25)] backdrop-blur-[24px] hover:bg-off-white/18',
    ]"
  >
    <component :is="icon" v-if="icon" :size="iconSize" :stroke-width="2" aria-hidden="true" />
    <slot />
  </component>
</template>
