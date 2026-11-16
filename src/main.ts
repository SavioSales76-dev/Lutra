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

iniciarLenis()

createApp(App).use(router).mount('#app')
