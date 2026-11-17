import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import { iniciarLenis } from './lib/lenis'
import './assets/styles/main.css'

/*
 * O navegador não restaura a posição de rolagem ao recarregar: com seções travadas (pin),
 * voltar no meio da página deixaria a Hero coberta. Quem decide a posição é o router.
 */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

/*
 * Refração do vidro (filtro SVG em backdrop-filter) só funciona em navegadores Chromium.
 * Nos outros (Safari, Firefox) o .vidro fica só com blur. Ver main.css.
 */
const navegador = navigator as Navigator & { userAgentData?: { brands?: { brand: string }[] } }
if (navegador.userAgentData?.brands?.some((b) => b.brand === 'Chromium')) {
  document.documentElement.setAttribute('data-refracao', '')
}

iniciarLenis()

createApp(App).use(router).mount('#app')
