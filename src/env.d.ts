/// <reference types="vite/client" />

import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** Título da aba do navegador (sem o sufixo "· Lutra"). */
    title?: string
    /** Código da tela no Figma (página prototype), ex.: "2.1". */
    tela?: string
  }
}
