<!--
  FAQ (Figma: 1.1 Landing › "FAQ — Desktop", node 79:484).
  Seção escura numa camada acima (z-10). Ao terminar, sai por cima e revela o rodapé, que
  fica parado embaixo com o véu em WebGL no modo revelar (ver RodapeSection). Sem WebGL, a
  borda de baixo vira um degradê de noite (.cortina-baixo, em main.css).

  Acordeão: uma pergunta aberta por vez (a primeira começa aberta, como no Figma).
  - Botão com aria-expanded/aria-controls; a resposta é uma região ligada ao botão.
  - A altura anima com grid-template-rows (0fr → 1fr), sem medir em JS.
  - Ícone: o "+" vira "−" (a barra vertical gira e some) e o círculo clareia.
  Parallax de saída: o conteúdo vai mais devagar que o fundo enquanto a seção sai.
-->
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import { Mail } from 'lucide-vue-next'
import LTextLink from '@/components/ui/LTextLink.vue'
import { perguntas } from '@/data/faq'
import { COM_MOVIMENTO, gsap, ScrollTrigger } from '@/lib/gsap'

const EMAIL = 'contato@getlutra.com.br'

const aberta = ref<string | null>(perguntas[0]?.id ?? null)

function alternar(id: string) {
  aberta.value = aberta.value === id ? null : id
  // A altura da página muda com o acordeão: recalcula as posições das travas seguintes
  window.setTimeout(() => ScrollTrigger.refresh(), 450)
}

const secao = useTemplateRef<HTMLElement>('secao')
const conteudo = useTemplateRef<HTMLElement>('conteudo')
const mm = gsap.matchMedia()

onMounted(() => {
  mm.add(COM_MOVIMENTO, () => {
    const el = secao.value
    if (!el) return
    gsap.to(conteudo.value, {
      yPercent: 12,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'bottom bottom', end: 'bottom top', scrub: true },
    })
  })
})

onBeforeUnmount(() => mm.revert())
</script>

<template>
  <section
    id="faq"
    ref="secao"
    aria-labelledby="faq-titulo"
    class="cortina-baixo relative z-10 bg-noite px-4 pt-24 pb-36 sm:px-8 lg:px-32 lg:pt-30 lg:pb-50"
  >
    <div ref="conteudo" class="mx-auto grid max-w-[1184px] gap-14 lg:grid-cols-[380px_1fr] lg:gap-24">
      <div class="flex flex-col items-start gap-6">
        <p class="text-base font-medium tracking-[-0.02em] text-off-white/60">Dúvidas</p>
        <h2 id="faq-titulo" class="font-serif text-[clamp(3rem,6vw,4.5rem)] leading-none text-off-white">
          Perguntas<br />
          <em>frequentes</em>
        </h2>
        <p class="text-base leading-normal text-off-white/70">
          Não achou o que procurava? Escreva pra gente e respondemos rapidinho.
        </p>
        <LTextLink :href="`mailto:${EMAIL}`" :icon="Mail" class="text-[15px] font-medium text-off-white">
          {{ EMAIL }}
        </LTextLink>
      </div>

      <div class="flex flex-col">
        <div v-for="item in perguntas" :key="item.id" class="faq-item border-b border-off-white/12">
          <h3>
            <button
              :id="`faq-botao-${item.id}`"
              type="button"
              class="faq-botao group flex w-full items-center justify-between gap-6 py-7 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-off-white"
              :aria-expanded="aberta === item.id"
              :aria-controls="`faq-resposta-${item.id}`"
              @click="alternar(item.id)"
            >
              <span class="faq-pergunta font-serif text-2xl text-off-white sm:text-[28px]">{{ item.pergunta }}</span>
              <span
                aria-hidden="true"
                class="faq-icone relative grid size-9 shrink-0 place-items-center rounded-full transition-colors duration-300"
                :class="aberta === item.id ? 'bg-off-white/14' : 'bg-off-white/6 group-hover:bg-off-white/12'"
              >
                <span class="absolute h-[1.5px] w-3.5 rounded-full bg-off-white" />
                <span class="faq-icone__vertical absolute h-3.5 w-[1.5px] rounded-full bg-off-white" />
              </span>
            </button>
          </h3>
          <div
            :id="`faq-resposta-${item.id}`"
            role="region"
            :aria-labelledby="`faq-botao-${item.id}`"
            class="faq-resposta grid"
            :class="{ 'is-aberta': aberta === item.id }"
          >
            <div class="overflow-hidden">
              <p class="max-w-[620px] pb-7 text-base leading-relaxed text-off-white/70">{{ item.resposta }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.faq-resposta {
  grid-template-rows: 0fr;
  transition: grid-template-rows 450ms cubic-bezier(0.22, 1, 0.36, 1);
}

.faq-resposta.is-aberta {
  grid-template-rows: 1fr;
}

.faq-resposta > div > p {
  opacity: 0;
  transform: translateY(-6px);
  transition:
    opacity 300ms ease-out,
    transform 450ms cubic-bezier(0.22, 1, 0.36, 1);
}

.faq-resposta.is-aberta > div > p {
  opacity: 1;
  transform: none;
  transition-delay: 80ms;
}

/* Pergunta desliza um pouco no hover */
.faq-pergunta {
  transition: transform 450ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.faq-botao:hover .faq-pergunta {
  transform: translateX(6px);
}

/* "+" → "−": a barra vertical gira e some */
.faq-icone__vertical {
  transition:
    transform 450ms cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 250ms ease-out;
}

.faq-botao[aria-expanded='true'] .faq-icone__vertical {
  transform: rotate(90deg);
  opacity: 0;
}

.faq-icone {
  transition:
    background-color 300ms ease-out,
    transform 450ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.faq-botao:hover .faq-icone {
  transform: rotate(90deg) scale(1.06);
}
</style>
