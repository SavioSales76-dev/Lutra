<!--
  Pacotes (Figma: 1.1 Landing › "Pacotes — Desktop", node 61:2).
  Seção escura numa camada acima (z-10), como a Sobre: sobe por cima da Como usar, que fica
  parada embaixo com o véu em WebGL no modo cobrir (ver ComoUsarSection). Sem WebGL, a
  borda de cima vira um degradê de noite (.cortina-cima, em main.css).

  - Card em destaque (Pack Completo): brilho âmbar vindo do topo e borda em degradê âmbar.
  - Microinterações: os cards sobem com mola no hover (o destaque também acende o brilho);
    os botões são o LButton (rolagem de letras, ícone animado, brilho).
  - Parallax de entrada: cabeçalho e cards sobem um pouco enquanto a seção chega.
  Preços vêm do catálogo (exibição; o valor cobrado é sempre do servidor).
-->
<script setup lang="ts">
import { onBeforeUnmount, onMounted, useTemplateRef } from 'vue'
import { Check, Lock, Plus } from 'lucide-vue-next'
import TicketIcon from '@/components/icons/animated/TicketIcon.vue'
import LButton from '@/components/ui/LButton.vue'
import { pacotes } from '@/data/catalogo'
import { COM_MOVIMENTO, gsap } from '@/lib/gsap'
import { formatarPreco } from '@/lib/formato'

const inicial = pacotes.find((p) => p.id === 'inicial')!
const completo = pacotes.find((p) => p.id === 'completo')!

const cards = [
  {
    pacote: inicial,
    descricao: 'Os looks essenciais para começar a dar cara de filme aos seus vídeos.',
    titulo: null as string | null,
    itens: ['6 LUTs com look de filme', 'Arquivos .cube para LOG e Rec.709', 'Guia de instalação em português'],
    icone: Check,
  },
  {
    pacote: completo,
    descricao: 'A coleção inteira da Lutra, do golden hour ao noturno, para qualquer tipo de cena.',
    titulo: 'Tudo do Pack Inicial, mais:',
    itens: ['6 LUTs exclusivas (12 no total)', 'Todas as atualizações futuras do pack'],
    icone: Plus,
  },
]

const secao = useTemplateRef<HTMLElement>('secao')
const mm = gsap.matchMedia()

onMounted(() => {
  mm.add(COM_MOVIMENTO, () => {
    const el = secao.value
    if (!el) return
    // Parallax de entrada enquanto a seção sobe por cima da Como usar
    gsap.fromTo(
      el.querySelectorAll('.entra'),
      { y: (i: number) => 60 + i * 40 },
      { y: 0, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'top top', scrub: true } },
    )
  })
})

onBeforeUnmount(() => mm.revert())
</script>

<template>
  <section
    id="pacotes"
    ref="secao"
    aria-labelledby="pacotes-titulo"
    class="cortina-cima relative z-10 bg-noite px-4 py-24 sm:px-8 lg:py-20"
  >
    <div class="mx-auto flex max-w-[824px] flex-col items-center gap-14 lg:gap-16">
      <header class="entra flex flex-col items-center gap-5 text-center">
        <p class="text-base font-medium tracking-[-0.02em] text-off-white/60">Pacotes</p>
        <h2 id="pacotes-titulo" class="font-serif text-[clamp(3rem,8vw,5.5rem)] leading-none text-off-white">
          Escolha o seu <em>look</em>
        </h2>
        <p class="text-[17px] text-off-white/70 sm:text-lg">Pagamento único, download imediato e acesso para sempre.</p>
      </header>

      <div class="grid w-full gap-6 md:grid-cols-2">
        <!-- O parallax (transform) fica no invólucro, para não brigar com o hover do card -->
        <div v-for="card in cards" :key="card.pacote.id" class="entra">
          <article
            class="pacote flex h-full flex-col gap-6 rounded-[24px] p-8 md:min-h-[622px]"
            :class="card.pacote.destaque ? 'pacote--destaque' : 'pacote--comum'"
            :aria-labelledby="`pacote-${card.pacote.id}`"
          >
            <div class="flex h-7 items-center justify-between">
              <p class="text-sm font-medium text-off-white/60">{{ card.pacote.lutIds.length }} LUTs</p>
              <span
                v-if="card.pacote.destaque"
                class="rounded-full bg-ambar/16 px-3 py-[5px] text-xs font-semibold text-ambar"
              >
                Mais escolhido
              </span>
            </div>

            <div class="flex flex-col gap-2">
              <h3 :id="`pacote-${card.pacote.id}`" class="font-serif text-4xl text-off-white">{{ card.pacote.nome }}</h3>
              <p class="text-[15px] leading-normal text-off-white/70">{{ card.descricao }}</p>
            </div>

            <div class="flex flex-col gap-3">
              <p v-if="card.titulo" class="text-[15px] font-medium text-off-white/95">{{ card.titulo }}</p>
              <ul class="flex flex-col gap-3">
                <li v-for="item in card.itens" :key="item" class="flex items-center gap-2.5 text-[15px] text-off-white/90">
                  <component
                    :is="card.icone"
                    :size="16"
                    :stroke-width="2"
                    aria-hidden="true"
                    :class="card.pacote.destaque ? 'text-ambar' : 'text-off-white'"
                  />
                  {{ item }}
                </li>
              </ul>
            </div>

            <div class="flex-1" />

            <p class="font-serif text-[56px] leading-none text-off-white">
              <span class="sr-only">Preço: </span>{{ formatarPreco(card.pacote.precoCentavos) }}
            </p>

            <LButton
              :to="`/checkout/${card.pacote.id}`"
              :variant="card.pacote.destaque ? 'primary' : 'glass'"
              :icon="TicketIcon"
              class="w-full justify-center"
            >
              Comprar {{ card.pacote.nome }}
            </LButton>
          </article>
        </div>
      </div>

      <p class="entra flex items-center gap-2 text-sm text-off-white/55">
        <Lock :size="14" :stroke-width="2" aria-hidden="true" />
        Pagamento seguro · Pix e cartão · Download imediato
      </p>
    </div>
  </section>
</template>

<style scoped>
.pacote {
  border: 1px solid transparent;
  transition:
    transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 400ms ease-out;
}

.pacote:hover {
  transform: translateY(-6px);
}

.pacote--comum {
  background:
    linear-gradient(color-mix(in srgb, var(--color-off-white) 3%, transparent)) padding-box,
    linear-gradient(var(--color-noite)) padding-box,
    linear-gradient(color-mix(in srgb, var(--color-off-white) 10%, transparent)) border-box;
}

.pacote--comum:hover {
  background:
    linear-gradient(color-mix(in srgb, var(--color-off-white) 5%, transparent)) padding-box,
    linear-gradient(var(--color-noite)) padding-box,
    linear-gradient(color-mix(in srgb, var(--color-off-white) 20%, transparent)) border-box;
}

/* Destaque: brilho âmbar do topo e borda em degradê âmbar (fundo opaco no padding-box) */
.pacote--destaque {
  background:
    linear-gradient(180deg, rgb(217 138 43 / 0.16) 0%, rgb(217 138 43 / 0) 45%) padding-box,
    linear-gradient(color-mix(in srgb, var(--color-off-white) 5%, transparent)) padding-box,
    linear-gradient(var(--color-noite)) padding-box,
    linear-gradient(180deg, rgb(217 138 43 / 0.75) 0%, rgb(217 138 43 / 0.25) 55%, rgb(244 241 234 / 0.1) 100%) border-box;
}

.pacote--destaque:hover {
  box-shadow: 0 -12px 60px -24px rgb(217 138 43 / 0.45);
}
</style>
