/*
 * Estado do carregamento inicial do site (usado pela TelaCarregamento e pela Hero).
 *
 * Qualquer parte do app registra o que precisa estar pronto antes de a página aparecer
 * (fontes, foto da Hero, a própria página) com `aguardar(promessa)`. O progresso real é a
 * fração de tarefas concluídas; a tela suaviza esse número e decide quando sair.
 * Tarefas que falham contam como concluídas: o site nunca fica preso no carregamento.
 */
import { computed, ref } from 'vue'

const total = ref(0)
const concluidas = ref(0)

/** 0 a 1: fração das tarefas registradas que já terminaram. */
export const progressoReal = computed(() => (total.value === 0 ? 0 : concluidas.value / total.value))

/** true depois que a tela de carregamento saiu (a página está à mostra). */
export const siteCarregado = ref(false)

export function aguardar(promessa: Promise<unknown>) {
  total.value++
  promessa
    .catch(() => undefined)
    .finally(() => {
      concluidas.value++
    })
}

/** Promessa de uma imagem já no DOM: resolve quando ela carrega (ou falha). */
export function imagemPronta(img: HTMLImageElement | null | undefined) {
  if (!img) return Promise.resolve()
  if (img.complete && img.naturalWidth) return img.decode?.().catch(() => undefined) ?? Promise.resolve()
  return new Promise<void>((resolve) => {
    img.addEventListener('load', () => resolve(), { once: true })
    img.addEventListener('error', () => resolve(), { once: true })
  })
}
