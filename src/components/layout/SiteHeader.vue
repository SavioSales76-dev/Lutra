<!--
  Topo do site (Figma: "Hero — Desktop" › Navegação). Fica fixo no topo da tela em todas as
  páginas do site (SiteLayout), acima de todas as seções (z-40).
  No celular o menu de seções fica oculto (o mobile ainda não foi desenhado);
  ficam o logo e o botão Comprar.

  Duas camadas fixas com o mesmo layout, uma sobre a outra:
  - "base": degradê de contraste, pílula de vidro e botão Comprar (sem mistura, para o
    blur da pílula e as cores do botão não mudarem);
  - "mistura": logo e links com mix-blend-exclusion. Ela precisa ser um elemento fixo
    próprio: dentro de outro elemento fixo a mistura só enxergaria o próprio topo, não a página.
  Nas duas camadas, os itens da outra ficam como espaço reservado invisível (mesmas
  medidas), para tudo alinhar. O <header> em si não é posicionado, então não cria uma
  camada própria que isolaria a mistura.

  - Seção ativa: o link da seção no centro da tela (useSecaoAtiva) fica com a pílula atrás
    e o texto cheio (os outros a 70%).
  - Hover/foco: a pílula desliza até o link apontado e volta para o da seção ativa ao sair;
    o texto do link apontado rola letra por letra (LRollText).
  - Na seção Sobre o topo sobe e some (volta se algo dele receber foco do teclado).
  - Depois de rolar um pouco, o degradê de noite aparece atrás para manter o contraste.
-->
<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import TicketIcon from '@/components/icons/animated/TicketIcon.vue'
import LButton from '@/components/ui/LButton.vue'
import LRollText from '@/components/ui/LRollText.vue'
import { useSecaoAtiva } from '@/composables/useSecaoAtiva'

const itens = [
  { rotulo: 'Home', secao: 'inicio' },
  { rotulo: 'Sobre', secao: 'sobre' },
  { rotulo: 'Como usar', secao: 'como-usar' },
  { rotulo: 'Pacotes', secao: 'pacotes' },
]

/* Seções em que o topo some */
const SECOES_SEM_TOPO = ['sobre']

const { ativa } = useSecaoAtiva()
const secaoAtiva = computed(() => (itens.some((i) => i.secao === ativa.value) ? ativa.value : null))

/* Link apontado pelo mouse ou pelo teclado (tem prioridade sobre a seção ativa) */
const apontado = ref<string | null>(null)
const destaque = computed(() => apontado.value ?? secaoAtiva.value)

/* Foco do teclado dentro do topo: ele não pode sumir enquanto alguém navega por ele */
const focoDentro = ref(false)
const oculto = computed(() => !focoDentro.value && SECOES_SEM_TOPO.includes(ativa.value ?? ''))

const navEl = ref<HTMLElement>()
const pilula = reactive({ x: 0, largura: 0, visivel: false, semTransicao: true })

async function posicionarPilula() {
  const link = destaque.value ? navEl.value?.querySelector<HTMLElement>(`[data-secao="${destaque.value}"]`) : null
  if (!link) {
    pilula.visivel = false
    return
  }
  // Ao aparecer, a pílula surge já no lugar; só desliza entre um link e outro
  const vindoDoNada = !pilula.visivel
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

watch(destaque, posicionarPilula, { flush: 'post' })

function aoFocar(e: FocusEvent, secao: string) {
  if ((e.currentTarget as HTMLElement).matches(':focus-visible')) apontado.value = secao
}

function aoSoltar(secao: string) {
  if (apontado.value === secao) apontado.value = null
}

/* Degradê atrás do topo depois de rolar um pouco */
const rolou = ref(false)
function aoRolar() {
  rolou.value = window.scrollY > 24
}

function aoRedimensionar() {
  pilula.visivel = false
  void posicionarPilula()
}

onMounted(() => {
  aoRolar()
  window.addEventListener('scroll', aoRolar, { passive: true })
  window.addEventListener('resize', aoRedimensionar)
  // A largura dos links muda quando a fonte termina de carregar
  document.fonts?.ready.then(aoRedimensionar)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', aoRolar)
  window.removeEventListener('resize', aoRedimensionar)
})

const CONTEINER = 'relative mx-auto mt-8 flex h-[42px] max-w-[1440px] items-center justify-between px-4 sm:px-8 lg:px-16'
const LOGO = 'font-serif text-[32px] leading-none tracking-[-0.02em]'
const LINK = 'relative rounded-full px-3.5 py-2 text-sm/5 font-medium tracking-[-0.02em]'
</script>

<template>
  <header @focusin="focoDentro = true" @focusout="focoDentro = false">
    <!-- Camada base: degradê, pílula e botão -->
    <div class="topo-camada fixed inset-x-0 top-0 z-40" :class="{ 'is-oculto': oculto }">
      <div
        aria-hidden="true"
        class="topo-degrade pointer-events-none absolute inset-x-0 top-0 h-36 transition-opacity duration-500"
        :class="rolou ? 'opacity-100' : 'opacity-0'"
      />
      <div :class="CONTEINER">
        <span aria-hidden="true" class="invisible" :class="LOGO">Lutra</span>

        <div aria-hidden="true" class="relative hidden gap-1.5 md:flex">
          <span
            class="nav-pilula pointer-events-none absolute inset-y-0 left-0 rounded-full border border-off-white/20 bg-off-white/10 shadow-[inset_0_1px_0_0_rgb(244_241_234/0.2)] backdrop-blur-md"
            :class="{ 'sem-transicao': pilula.semTransicao }"
            :style="{
              width: `${pilula.largura}px`,
              transform: `translateX(${pilula.x}px) scale(${pilula.visivel ? 1 : 0.85})`,
              opacity: pilula.visivel ? 1 : 0,
            }"
          />
          <span v-for="item in itens" :key="item.secao" class="invisible" :class="LINK">
            <LRollText :texto="item.rotulo" />
          </span>
        </div>

        <LButton to="/#pacotes" size="sm" :icon="TicketIcon">Comprar</LButton>
      </div>
    </div>

    <!-- Camada com mistura: logo e links (só eles recebem clique; o resto deixa passar) -->
    <div
      class="topo-camada pointer-events-none fixed inset-x-0 top-0 z-40 mix-blend-exclusion"
      :class="{ 'is-oculto': oculto }"
    >
      <div :class="CONTEINER">
        <RouterLink
          to="/#inicio"
          class="pointer-events-auto text-off-white"
          :class="LOGO"
          aria-label="Lutra, voltar ao início"
        >
          Lutra
        </RouterLink>

        <nav ref="navEl" aria-label="Seções" class="relative hidden gap-1.5 md:flex">
          <RouterLink
            v-for="item in itens"
            :key="item.secao"
            :to="`/#${item.secao}`"
            :data-secao="item.secao"
            :aria-current="secaoAtiva === item.secao ? 'location' : undefined"
            class="pointer-events-auto transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-off-white"
            :class="[LINK, destaque === item.secao ? 'text-off-white' : 'text-off-white/70']"
            @pointerenter="apontado = item.secao"
            @pointerleave="aoSoltar(item.secao)"
            @focus="aoFocar($event, item.secao)"
            @blur="aoSoltar(item.secao)"
          >
            <LRollText :texto="item.rotulo" :ativo="apontado === item.secao" />
          </RouterLink>
        </nav>

        <!-- Espaço do botão Comprar (o botão de verdade está na camada base) -->
        <LButton to="/#pacotes" size="sm" :icon="TicketIcon" class="invisible" aria-hidden="true" inert>Comprar</LButton>
      </div>
    </div>
  </header>
</template>

<style scoped>
.topo-camada {
  transition:
    transform 600ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 400ms ease-out;
}

/* Na seção Sobre o topo sobe e some */
.topo-camada.is-oculto {
  transform: translateY(-120%);
  opacity: 0;
  pointer-events: none;
}

.topo-camada.is-oculto :deep(*) {
  pointer-events: none;
}

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

.topo-degrade {
  background: linear-gradient(
    to bottom,
    rgb(14 13 11 / 0.75) 0%,
    rgb(14 13 11 / 0.55) 35%,
    rgb(14 13 11 / 0.25) 65%,
    rgb(14 13 11 / 0.08) 85%,
    rgb(14 13 11 / 0) 100%
  );
}
</style>
