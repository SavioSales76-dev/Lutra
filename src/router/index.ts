import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { usarLenis } from '@/lib/lenis'

/*
 * Rotas organizadas pelas seções da página "prototype" do Figma.
 * `meta.tela` aponta para o código da tela no Figma.
 * Os e-mails (seção 3) não são rotas: serão feitos junto com o servidor.
 */
const routes: RouteRecordRaw[] = [
  // 1. Site
  {
    path: '/',
    component: () => import('@/layouts/SiteLayout.vue'),
    children: [
      { path: '', name: 'landing', component: () => import('@/views/site/LandingView.vue'), meta: { tela: '1.1' } },
      { path: 'termos', name: 'termos', component: () => import('@/views/site/TermosView.vue'), meta: { tela: '1.2', title: 'Termos de uso' } },
      { path: 'privacidade', name: 'privacidade', component: () => import('@/views/site/PrivacidadeView.vue'), meta: { tela: '1.3', title: 'Política de privacidade' } },
      { path: 'reembolso', name: 'reembolso', component: () => import('@/views/site/ReembolsoView.vue'), meta: { tela: '1.4', title: 'Política de reembolso' } },
      { path: 'contato', name: 'contato', component: () => import('@/views/site/ContatoView.vue'), meta: { tela: '1.5', title: 'Contato' } },
    ],
  },

  // 2. Compra e 4. Acesso: telas focadas, sem o menu completo do site
  {
    path: '/',
    component: () => import('@/layouts/FocusLayout.vue'),
    children: [
      { path: 'checkout/:pacote(inicial|completo)', name: 'checkout', component: () => import('@/views/compra/CheckoutView.vue'), props: true, meta: { tela: '2.1 / 2.3', title: 'Checkout' } },
      { path: 'checkout/:pacote(inicial|completo)/pix', name: 'pix-aguardando', component: () => import('@/views/compra/PixAguardandoView.vue'), props: true, meta: { tela: '2.2', title: 'Pague com Pix' } },
      { path: 'compra/aprovada', name: 'compra-aprovada', component: () => import('@/views/compra/CompraAprovadaView.vue'), meta: { tela: '2.4', title: 'Compra aprovada' } },
      { path: 'compra/recusada', name: 'pagamento-recusado', component: () => import('@/views/compra/PagamentoRecusadoView.vue'), meta: { tela: '2.5', title: 'Pagamento recusado' } },
      { path: 'compra/pix-expirado', name: 'pix-expirado', component: () => import('@/views/compra/PixExpiradoView.vue'), meta: { tela: '2.6', title: 'Pix expirado' } },

      { path: 'entrar', name: 'login', component: () => import('@/views/acesso/LoginView.vue'), meta: { tela: '4.1', title: 'Entrar' } },
      { path: 'entrar/confira-seu-email', name: 'confira-email', component: () => import('@/views/acesso/ConfiraEmailView.vue'), meta: { tela: '4.2', title: 'Confira seu e-mail' } },
      { path: 'entrar/link-expirado', name: 'link-expirado', component: () => import('@/views/acesso/LinkExpiradoView.vue'), meta: { tela: '4.3', title: 'Link expirado' } },
    ],
  },

  // 5. Área do cliente
  {
    path: '/minhas-luts',
    component: () => import('@/layouts/ClienteLayout.vue'),
    children: [
      { path: '', name: 'minhas-luts', component: () => import('@/views/cliente/MinhasLutsView.vue'), meta: { tela: '5.1 / 5.2 / 5.3', title: 'Minhas LUTs' } },
      { path: 'guia/:programa(premiere|davinci|final-cut|capcut)', name: 'guia', component: () => import('@/views/cliente/GuiaInstalacaoView.vue'), props: true, meta: { tela: '5.4 a 5.7', title: 'Guia de instalação' } },
    ],
  },

  // 1.6 Página 404
  {
    path: '/:caminho(.*)*',
    component: () => import('@/layouts/SiteLayout.vue'),
    children: [
      { path: '', name: 'nao-encontrada', component: () => import('@/views/site/NotFoundView.vue'), meta: { tela: '1.6', title: 'Página não encontrada' } },
    ],
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    const lenis = usarLenis()
    // Com Lenis, a rolagem até âncoras é dele (suave e sincronizada com o ScrollTrigger)
    if (lenis && to.hash) {
      const mesmaPagina = to.path === from.path
      // Espera a página nova montar (e os pins do ScrollTrigger serem criados) antes de rolar
      requestAnimationFrame(() => lenis.scrollTo(to.hash, { immediate: !mesmaPagina }))
      return false
    }
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, top: 0 }
    lenis?.scrollTo(0, { immediate: true })
    return { top: 0 }
  },
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · Lutra` : 'Lutra · Film looks, made simple.'
})
