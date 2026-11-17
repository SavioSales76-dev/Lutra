<!--
  Link de texto com a mesma microinteração do menu e dos botões: o rótulo rola letra por
  letra (LRollText) no hover ou foco de teclado. Ícone opcional à esquerda.
  RouterLink com `to`, <a> com `href` (externos abrem em nova aba).
  O rótulo vem do slot como texto puro: <LTextLink to="/termos">Termos de uso</LTextLink>.
-->
<script setup lang="ts">
import { computed, ref, useSlots, type Component } from 'vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'
import LRollText from '@/components/ui/LRollText.vue'

const props = defineProps<{
  to?: RouteLocationRaw
  href?: string
  icon?: Component
}>()

const externo = computed(() => !!props.href && /^https?:/.test(props.href))

const tag = computed(() => (props.to ? RouterLink : 'a'))
const tagProps = computed(() => {
  if (props.to) return { to: props.to }
  return externo.value ? { href: props.href, target: '_blank', rel: 'noopener noreferrer' } : { href: props.href }
})

const slots = useSlots()
/* Função (não computed) para ser lida durante o render e acompanhar rótulos dinâmicos. */
function rotulo() {
  const nos = slots.default?.() ?? []
  return nos
    .map((n) => (typeof n.children === 'string' ? n.children : ''))
    .join('')
    .trim()
}

const ativo = ref(false)

function aoFocar(e: FocusEvent) {
  ativo.value = (e.target as HTMLElement).matches(':focus-visible')
}
</script>

<template>
  <component
    :is="tag"
    v-bind="tagProps"
    class="inline-flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-off-white"
    @pointerenter="ativo = true"
    @pointerleave="ativo = false"
    @focus="aoFocar"
    @blur="ativo = false"
  >
    <component :is="icon" v-if="icon" :size="16" :stroke-width="2" aria-hidden="true" />
    <LRollText :texto="rotulo()" :ativo="ativo" />
  </component>
</template>
