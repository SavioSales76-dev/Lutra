<!--
  Topo do site sobre a imagem da Hero (Figma: "Hero — Desktop" › Navegação).
  No celular o menu de seções fica oculto (o mobile ainda não foi desenhado);
  ficam o logo e o botão Comprar.
  Sem z-index de propósito: o mix-blend-exclusion precisa misturar com a imagem.

  Microinterações do menu:
  - uma pílula de vidro desliza com mola até o link em hover ou foco de teclado;
  - o texto do link rola para cima letra por letra (LRollText, o mesmo dos botões).
-->
<script setup lang="ts">
import { nextTick, reactive, ref } from 'vue'
import TicketIcon from '@/components/icons/animated/TicketIcon.vue'
import LButton from '@/components/ui/LButton.vue'
import LRollText from '@/components/ui/LRollText.vue'

const itens = [
  { rotulo: 'Home', to: '/#inicio' },
  { rotulo: 'Sobre', to: '/#sobre' },
  { rotulo: 'Como usar', to: '/#como-usar' },
  { rotulo: 'Pacotes', to: '/#pacotes' },
]

const pilula = reactive({ x: 0, largura: 0, visivel: false, semTransicao: true })
const navEl = ref<HTMLElement>()

async function mostrarEm(e: Event) {
  const link = e.currentTarget as HTMLElement
  const vindoDoNada = !pilula.visivel
  // Ao aparecer, a pílula surge já no lugar; só desliza entre um link e outro
  pilula.semTransicao = vindoDoNada
  pilula.x = link.offsetLeft
  pilula.largura = link.offsetWidth
  if (vindoDoNada) {
    await nextTick()
    navEl.value?.getBoundingClientRect() // aplica a posição antes de reativar a transição
    pilula.semTransicao = false
  }
  pilula.visivel = true
}

function esconder() {
  pilula.visivel = false
}

function aoSairDoFoco(e: FocusEvent) {
  if (!navEl.value?.contains(e.relatedTarget as Node | null)) esconder()
}

/* Link cujo texto está rolado (hover ou foco de teclado). */
const linkAtivo = ref<string | null>(null)

function aoEntrar(e: PointerEvent, to: string) {
  void mostrarEm(e)
  linkAtivo.value = to
}

function aoFocar(e: FocusEvent, to: string) {
  if (!(e.currentTarget as HTMLElement).matches(':focus-visible')) return
  void mostrarEm(e)
  linkAtivo.value = to
}

function aoDesativar(to: string) {
  if (linkAtivo.value === to) linkAtivo.value = null
}
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

      <nav ref="navEl" aria-label="Seções" class="relative hidden gap-1.5 md:flex" @pointerleave="esconder">
        <span
          aria-hidden="true"
          class="nav-pilula pointer-events-none absolute inset-y-0 left-0 rounded-full border border-off-white/20 bg-off-white/10 shadow-[inset_0_1px_0_0_rgb(244_241_234/0.2)] backdrop-blur-md"
          :class="{ 'sem-transicao': pilula.semTransicao }"
          :style="{
            width: `${pilula.largura}px`,
            transform: `translateX(${pilula.x}px) scale(${pilula.visivel ? 1 : 0.85})`,
            opacity: pilula.visivel ? 1 : 0,
          }"
        />
        <RouterLink
          v-for="item in itens"
          :key="item.to"
          :to="item.to"
          class="nav-link group relative rounded-full px-3.5 py-2 text-sm/5 font-medium tracking-[-0.02em] text-off-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-off-white"
          @pointerenter="aoEntrar($event, item.to)"
          @pointerleave="aoDesativar(item.to)"
          @focus="aoFocar($event, item.to)"
          @blur="aoDesativar(item.to), aoSairDoFoco($event)"
        >
          <LRollText :texto="item.rotulo" :ativo="linkAtivo === item.to" class="mix-blend-exclusion" />
        </RouterLink>
      </nav>

      <LButton to="/#pacotes" size="sm" :icon="TicketIcon">Comprar</LButton>
    </div>
  </header>
</template>

<style scoped>
.nav-pilula {
  transform-origin: center;
  transition:
    transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1),
    width 500ms cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 200ms ease-out;
}

.nav-pilula.sem-transicao {
  transition: opacity 200ms ease-out;
}
</style>
