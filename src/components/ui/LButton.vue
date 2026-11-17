<!--
  Botão em pílula da Lutra.
  - primary: fundo off-white, texto noite.
  - glass: off-white translúcido com blur; usar sobre imagem.
  Vira RouterLink com `to`, <a> com `href` e <button> sem nenhum dos dois.

  Microinterações: sobe 2 px no hover com mola, um brilho atravessa o botão,
  afunda ao pressionar, o rótulo rola letra por letra (LRollText) e o ícone animado
  (src/components/icons/animated) toca enquanto o botão está em hover, foco de teclado ou toque.
  Tudo fica parado com prefers-reduced-motion (regra global em main.css + MotionConfig).
-->
<script setup lang="ts">
import { computed, ref, useSlots, type Component } from 'vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'
import LRollText from '@/components/ui/LRollText.vue'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'glass'
    size?: 'sm' | 'md'
    to?: RouteLocationRaw
    href?: string
    /** Ícone com as props `size` e `animating` (ver icons/animated). */
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

/*
 * Rótulo em texto puro (<LButton>Comprar</LButton>) rola letra por letra.
 * Se o slot tiver outro conteúdo (ex.: elementos), ele é exibido como veio, sem a rolagem.
 */
const slots = useSlots()
/* Função (não computed) para ser lida durante o render e acompanhar rótulos dinâmicos. */
function rotulo() {
  const nos = slots.default?.() ?? []
  if (!nos.length || !nos.every((n) => typeof n.children === 'string')) return ''
  return nos
    .map((n) => n.children as string)
    .join('')
    .trim()
}

/* Ativo = mouse em cima, foco de teclado ou dedo pressionando. */
const hover = ref(false)
const foco = ref(false)
const toque = ref(false)
const ativo = computed(() => hover.value || foco.value || toque.value)

function aoEntrar(e: PointerEvent) {
  if (e.pointerType === 'mouse') hover.value = true
}
function aoSair(e: PointerEvent) {
  if (e.pointerType === 'mouse') hover.value = false
  toque.value = false
}
function aoPressionar(e: PointerEvent) {
  if (e.pointerType !== 'mouse') toque.value = true
}
function aoSoltar() {
  toque.value = false
}
function aoFocar(e: FocusEvent) {
  foco.value = (e.target as HTMLElement).matches(':focus-visible')
}
</script>

<template>
  <component
    :is="tag"
    v-bind="tagProps"
    class="l-button group relative isolate inline-flex shrink-0 items-center gap-2.5 overflow-hidden rounded-full border whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-off-white disabled:pointer-events-none disabled:opacity-50"
    :class="[
      size === 'sm'
        ? 'px-[18px] py-[9px] text-[13px]/[18px] font-semibold tracking-[-0.02em]'
        : 'px-6 py-[13px] text-base/5 font-medium tracking-[-0.03em]',
      variant === 'primary'
        ? 'border-transparent bg-off-white text-noite hover:shadow-[0_8px_24px_-8px_rgb(244_241_234/0.45)]'
        : 'border-off-white/30 bg-off-white/12 text-off-white shadow-[inset_0_1px_0_0_rgb(244_241_234/0.25)] backdrop-blur-[24px] hover:border-off-white/45 hover:bg-off-white/18',
      { 'is-ativo': ativo },
    ]"
    @pointerenter="aoEntrar"
    @pointerleave="aoSair"
    @pointerdown="aoPressionar"
    @pointerup="aoSoltar"
    @pointercancel="aoSoltar"
    @focus="aoFocar"
    @blur="foco = false"
  >
    <!-- Brilho que atravessa o botão no hover -->
    <span aria-hidden="true" class="l-button__brilho pointer-events-none absolute inset-0 -z-10" />
    <component :is="icon" v-if="icon" :size="iconSize" :animating="ativo" />
    <LRollText v-if="rotulo()" :texto="rotulo()" :ativo="ativo" />
    <slot v-else />
  </component>
</template>

<style scoped>
/* Sobre o fundo off-white o brilho precisa ser branco puro para aparecer. */
.l-button {
  --brilho: color-mix(in srgb, var(--color-off-white) 30%, transparent);
}
.l-button.bg-off-white {
  --brilho: rgb(255 255 255 / 0.9);
}

.l-button {
  transition:
    transform 450ms cubic-bezier(0.34, 1.56, 0.64, 1),
    background-color 200ms ease-out,
    border-color 200ms ease-out,
    box-shadow 300ms ease-out;
}

.l-button.is-ativo {
  transform: translateY(-2px);
}

.l-button:active {
  transform: translateY(0) scale(0.96);
  transition-duration: 120ms;
}

.l-button__brilho {
  background: linear-gradient(
    105deg,
    transparent 30%,
    var(--brilho) 50%,
    transparent 70%
  );
  transform: translateX(-110%);
}

.l-button.is-ativo .l-button__brilho {
  transform: translateX(110%);
  transition: transform 800ms cubic-bezier(0.22, 1, 0.36, 1);
}
</style>
