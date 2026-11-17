# Lutra: contexto do projeto

Site e área do cliente da **Lutra**, marca brasileira que vende pacotes de LUTs (arquivos `.cube` de correção de cor) para vídeo, com estética de filme analógico.

- **Domínio:** getlutra.com.br
- **Tagline:** "Film looks, made simple."
- **Público:** criadores de conteúdo e videomakers de 18 a 35 anos, iniciantes e intermediários, que editam no celular e no computador (CapCut, Premiere, DaVinci, Final Cut).
- **Idioma da interface:** português do Brasil. A tagline e os nomes das LUTs ficam em inglês.

## Design (fonte da verdade: Figma)

Arquivo: https://www.figma.com/design/YlOWcPl7VZO6YbChIdpWZt/Lutra

- Página **style**: paleta, proporção de uso e tipografia.
- Página **prototype**: todas as telas de desktop, organizadas em seções na ordem do fluxo.
- Página **refs**: referências visuais (sites com hero cinematográfica e fundo escuro).

Sempre que possível, consulte o Figma (via MCP) antes de implementar uma tela. Os números abaixo são o padrão, mas o arquivo pode ter ajustes manuais mais recentes.

### Telas (página prototype)

| Seção | Telas |
|---|---|
| 1. Site | 1.1 Landing (Hero, Sobre, Como usar, Pacotes, FAQ, Footer) · 1.2 Termos de uso · 1.3 Política de privacidade · 1.4 Política de reembolso · 1.5 Contato · 1.6 Página 404 |
| 2. Compra | 2.1 Checkout (Pix) · 2.2 Pix aguardando pagamento · 2.3 Checkout (cartão) · 2.4 Compra aprovada · 2.5 Pagamento recusado · 2.6 Pix expirado |
| 3. E-mails | 3.1 Compra aprovada · 3.2 Pix pendente · 3.3 Link de acesso |
| 4. Acesso | 4.1 Login (e-mail) · 4.2 Confira seu e-mail · 4.3 Link expirado |
| 5. Área do cliente | 5.1 Minhas LUTs (Pack Completo) · 5.2 Prévia da LUT (modal) · 5.3 Minhas LUTs (Pack Inicial + upgrade) · 5.4–5.7 Guia de instalação (Premiere, DaVinci, Final Cut, CapCut) |

Só existe a versão desktop (1440 px). **A versão mobile ainda não foi desenhada**, mas o site precisa ser responsivo: boa parte do público usa celular.

## Identidade visual

### Cores (paleta "Golden field")

| Token | Hex | Uso |
|---|---|---|
| `noite` | `#0E0D0B` | Fundo principal de todas as seções escuras |
| `off-white` | `#F4F1EA` | Textos, logo, botão primário |
| `ambar` | `#D98A2B` | Detalhes pequenos: selo "Mais escolhido", ícones de destaque, status |
| `teal` | `#3F7C86` | Detalhes pequenos de apoio |

**Proporção aproximada:** 70% noite, 25% off-white, 5% âmbar e teal.

**Regras:**
- A interface é neutra. Quem traz a cor são as **imagens e vídeos** (o produto é cor).
- Âmbar e teal só em detalhes, nunca em áreas grandes, e nunca os dois com o mesmo peso lado a lado.
- Não usar âmbar como fundo de botão sobre imagem. Sobre imagem, o botão é branco sólido ou glass.
- Evitar neon, cores muito saturadas e tons frios demais.
- Textos secundários são off-white com opacidade (0.5 a 0.8), não cinzas novos.

### Tipografia

Só duas famílias (Google Fonts):

- **Instrument Serif**: logo ("Lutra"), títulos e destaques. Os títulos costumam ter a segunda parte em *itálico* (ex.: "Film looks, *made simple.*", "Escolha o seu *look*").
- **Instrument Sans**: textos, botões, menus, labels (Regular e Medium).

**Regra: nenhum texto em caixa alta.** Nada de `text-transform: uppercase` nem de etiquetas em CAPS. Sentence case em tudo.

### Componentes e estilo

- **Botão primário:** pílula (`border-radius: 999px`), fundo off-white, texto noite, ícone à esquerda.
- **Botão secundário (glass):** off-white ~10–14% de opacidade, borda off-white ~25–35%, `backdrop-filter: blur(24px)`, leve brilho interno no topo.
- **Cards:** fundo off-white 3–5%, borda off-white ~10%, raio 20–28 px. O card em destaque (Pack Completo) tem brilho âmbar suave vindo do topo e borda com degradê âmbar.
- **Inputs:** fundo off-white 4%, borda 14%, raio 14 px, altura 52 px.
- **Ícones:** [Lucide](https://lucide.dev), traço 2. Preferir ícones menos óbvios e ligados a cor e cinema: `ticket` (comprar), `swatch-book` (pacotes), `contrast` (antes e depois / como funciona), `package-open`, `import`, `blend`, `download`, `lock`.

### Imagens e transições

- As seções com imagem (Hero, Como usar, Footer) usam foto cinematográfica (golden hour, grão de 35 mm, teal e âmbar) com **overlay em degradê** de noite.
- **As transições entre seções devem ser invisíveis:** a imagem começa e termina em `#0E0D0B` sólido, com curva suave (vários pontos no degradê, não linear), emendando com as seções escuras (Sobre, Pacotes, FAQ).
- O topo da Hero e a base do Footer têm a mesma claridade (degradê espelhado).
- As imagens atuais foram geradas com IA no Figma e são provisórias. O ideal é trocar por frames reais de vídeo com cada LUT aplicada.

## Produto e fluxos

- **Pack Inicial:** 6 LUTs. **Pack Completo:** 12 LUTs (destaque, "Mais escolhido"). Preços provisórios do Figma: R$ 68,90 e R$ 98,90 (em `src/data/catalogo.ts`).
- Cada LUT tem versão **LOG** e **Rec.709**. A área do cliente tem um seletor entre as duas.
- Nomes provisórios das 12 LUTs: Golden Hour, Teal Coast, Dusk, Ember, Faded Memory, Blue Hour, Olive Road, Safelight, Seafoam, Velvet, Moss, Rosé.
- **Pagamento:** checkout próprio no site, com Pix (padrão) e cartão de crédito. O Pix gera QR Code + código copia e cola, com expiração de 30 minutos. O provedor de pagamento ainda não foi definido.
- **Acesso:** login sem senha, com **link mágico** por e-mail (válido por 15 minutos, uso único). O e-mail da compra é a conta.
- **Upgrade:** quem tem o Pack Inicial vê um card de upgrade para o Completo na biblioteca.

## Stack

Decidido em 16/11/2026:

| Camada | Escolha |
|---|---|
| Front-end | **Vue 3** + **Tailwind CSS** (tokens da paleta e das fontes no tema do Tailwind) |
| Pagamento | **Mercado Pago**, checkout transparente: Pix (QR + copia e cola, expiração de 30 min) e cartão. Confirmação do pagamento sempre pelo webhook, nunca só pelo retorno do front. |
| Banco de dados | **PostgreSQL** (pedidos, clientes, tokens do link mágico) |
| E-mail | Pendente |

Ainda em aberto:
- Como o servidor roda: Nuxt (server routes no mesmo projeto) ou Vue com Vite + API separada. O servidor precisa existir de qualquer forma para receber o webhook do Mercado Pago, emitir e validar o link mágico e gerar os links de download.
- Onde o Postgres fica hospedado.
- Onde ficam os arquivos `.cube` (armazenamento privado com URLs assinadas e de curta duração; nunca em pasta pública).
- Provedor de e-mail e hospedagem do site.

## Arquitetura do front

O front-end vem primeiro: Vue 3 + Vite + TypeScript + Tailwind CSS v4 (plugin `@tailwindcss/vite`), Vue Router e ícones `lucide-vue-next`. O servidor fica para depois.

Animação:
- **GSAP** para animações feitas em código (sequências, stagger, scroll). Importe sempre de `@/lib/gsap`, que já registra o ScrollTrigger e exporta `prefereMenosMovimento()` e `COM_MOVIMENTO` (use com `gsap.matchMedia()` para animações de scroll, revertendo no `onBeforeUnmount`).
- **Lenis** (`@/lib/lenis`) para a rolagem suave, ligado no `main.ts` e movido pelo ticker do GSAP. Não liga com `prefers-reduced-motion`. Âncoras (`/#secao`) rolam pelo Lenis no `scrollBehavior` do router. Não usar `scroll-behavior: smooth` no CSS.
- Seções com trava (pin) recalculam posições no `onMounted` da `LandingView` (`ScrollTrigger.refresh()`).
- Tela de carregamento (`components/layout/TelaCarregamento.vue`, montada no `App.vue`): aparece a cada carregamento do site e sai quando as tarefas registradas com `aguardar()` terminam (fontes, rota, página e foto da Hero), com tempo mínimo de 1,6 s e máximo de 8 s. Trava a rolagem enquanto aparece. Quando sai, `siteCarregado` vira `true` e a Hero faz a entrada. Algo novo que precise estar pronto antes de a página aparecer deve chamar `aguardar()`.
- **motion-v** só nos ícones animados de `src/components/icons/animated` (port do lucide-animated, que é React-only).
- Transições simples de hover e foco ficam em CSS.

Comandos: `npm run dev` (servidor local em http://localhost:5173), `npm run build` (checa tipos e gera `dist/`), `npm run typecheck`.

```
index.html               Fontes do Google, metas, lang pt-BR
public/                  Arquivos servidos como estão (favicon, video/ para os loops)
src/
  main.ts                Monta o app com o router e o CSS
  App.vue                RouterView + grão de filme global
  assets/styles/main.css Tokens da Lutra no @theme do Tailwind (cores, fontes, raios)
  assets/images/         Imagens processadas pelo Vite
  router/index.ts        Rotas agrupadas pelas seções do Figma (meta.tela = código da tela)
  layouts/               SiteLayout (site), FocusLayout (compra e acesso), ClienteLayout (área do cliente)
  views/                 Uma tela por arquivo, em pastas por seção: site/, compra/, acesso/, cliente/
  components/
    ui/                  Componentes base reutilizáveis (botões, card, input…)
    layout/              Header, footer e navegação
    landing/             Seções da landing (Hero, Sobre, Como usar, Pacotes, FAQ)
    effects/             Efeitos visuais (grão de filme, light leaks, vídeo em loop, WebGL)
    dev/ScreenStub.vue   Marcador das telas ainda não implementadas
  lib/gsap.ts            Entrada única do GSAP + ScrollTrigger (defaults e reduced motion)
  lib/lenis.ts           Rolagem suave (Lenis) sincronizada com o ScrollTrigger
  lib/carregamento.ts    Estado da tela de carregamento: aguardar(promessa), progressoReal, siteCarregado
  lib/lut.ts             Leitura de LUTs .cube para WebGL (tabela 3D em faixa 2D)
  composables/           Lógica reutilizável (ex.: reduced motion, lazy por visibilidade)
  services/              Chamadas à API (checkout, login, downloads) quando o servidor existir
  data/catalogo.ts       LUTs e pacotes (nomes, quais LUTs, preço para exibição)
  types/                 Tipos compartilhados
```

Rotas:

| Rota | Tela |
|---|---|
| `/` | 1.1 Landing (seções por âncora: `#pacotes`, `#faq`…) |
| `/termos`, `/privacidade`, `/reembolso`, `/contato` | 1.2 a 1.5 |
| `/checkout/:pacote` (`inicial` ou `completo`) | 2.1 e 2.3 (Pix e cartão na mesma tela) |
| `/checkout/:pacote/pix` | 2.2 |
| `/compra/aprovada`, `/compra/recusada`, `/compra/pix-expirado` | 2.4 a 2.6 |
| `/entrar`, `/entrar/confira-seu-email`, `/entrar/link-expirado` | 4.1 a 4.3 |
| `/minhas-luts` | 5.1, 5.3 e a prévia (5.2) como modal |
| `/minhas-luts/guia/:programa` (`premiere`, `davinci`, `final-cut`, `capcut`) | 5.4 a 5.7 |
| qualquer outra | 1.6 Página 404 |

Convenções:
- Nomes de pastas, rotas e arquivos de domínio em português; componentes base com prefixo `L` (ex.: `LButton`).
- As cores padrão do Tailwind estão desligadas (`--color-*: initial`). Só existem `noite`, `off-white`, `ambar` e `teal`; tons secundários são opacidade (`text-off-white/60`).
- Preço exibido no front é só exibição: o valor cobrado vem sempre do servidor.

## Fluxo de branches

- `main`: versão estável. Só recebe merge vindo da `dev`, depois dos testes.
- `dev`: integração. Todo trabalho novo sai dela e volta para ela.
- Branches de trabalho saem da `dev` (ex.: `feat/landing`, `fix/checkout-pix`) e o **PR é sempre aberto para a `dev`**, nunca direto para a `main`.
- Quando a `dev` estiver testada (`npm run build` passando e as telas conferidas no navegador), abre-se um PR da `dev` para a `main` e faz-se o merge.
- Branches de trabalho são apagadas (local e remoto) depois do merge.

## Direção técnica (sugestões, ainda não decididas)

Para dar vida às imagens, a ideia combinada é:
1. **Vídeo em loop** (MP4/WebM leve, `autoplay muted loop playsinline`, com poster) no lugar das fotos da Hero e de outras seções, de preferência com a LUT aplicada. Em uso na Hero e na Como usar (`public/video/`). Processo com ffmpeg: 2× mais lento com interpolação de movimento (`minterpolate`), emenda do loop cruzada (`xfade` de 1,5 s), WebM (VP9) + MP4 (H.264) sem áudio e pôster do primeiro quadro.
2. **Efeitos leves em CSS/JS:** grão de filme animado por cima de tudo, light leaks com `mix-blend-mode: screen`, parallax suave.
3. **WebGL só onde agrega:** principalmente uma **prévia de LUT ao vivo** (o `.cube` carregado como textura 3D no shader, aplicado em tempo real na imagem). A biblioteca escolhida é o **OGL** (leve). Em uso hoje: as transições entre seções com imagem e seções escuras (`components/effects/VeuTransicao.vue` + `transicao-shader.ts`), um véu de noite em WebGL por cima de todo o conteúdo da seção, com frente orgânica guiada pelo scroll. Camadas: as seções escuras (Sobre, Pacotes, FAQ) ficam acima (z-10); as com imagem (Hero, Como usar, Footer) ficam na mesma camada, abaixo delas. Padrão das transições: quando a escura **entra**, a seção com imagem fica parada e a escura sobe por cima (modo `cobrir`: Hero → Sobre, Como usar → Pacotes); quando a escura **sai**, a seção com imagem tem margem negativa de uma tela e fica travada embaixo sendo revelada (modo `revelar`: Sobre → Como usar, FAQ → Footer). O véu fica sempre colado na borda da seção escura; sem WebGL, as classes `.cortina-cima` / `.cortina-baixo` (main.css) fazem o fade. Seções escuras seguidas (Pacotes → FAQ) não têm transição. O parallax é feito com GSAP. Um fundo animado contínuo na Hero (vento, raios de sol, grão) foi testado e descartado. Em uso também: pólen e poeira na brisa por cima do vídeo da Hero (`HeroParticulas.vue`, movimento todo na GPU, qualidade adaptativa) e a **LUT aplicada ao vivo** no vídeo da Como usar (`VideoComLut.vue` + `lut-shader.ts`), com a intensidade subindo de 0 a 100% enquanto a seção é revelada.

**Arquivos de teste:** `public/_teste/` é para testes locais com arquivos de terceiros (ex.: a LUT de teste atual, de outro pack). Fica fora do Git (`.gitignore`) e o `vite.config.ts` apaga a pasta do build. A Como usar só usa a LUT de teste em desenvolvimento; no build fica o vídeo sem LUT até existirem as LUTs da Lutra.

O efeito glass dos cards é feito com `backdrop-filter`. A refração ("liquid glass", via filtro SVG com `feDisplacementMap`) só funciona em Chromium, então deve ser um aprimoramento progressivo, com fallback em blur simples (Safari/iPhone é muito usado pelo público).

**Sempre:**
- Respeitar `prefers-reduced-motion`.
- Carregar vídeo e WebGL só quando a seção entrar na tela (lazy).
- Ter fallback estático para celular fraco.
- Garantir contraste de texto sobre imagens (o overlay existe para isso).

## Pendências conhecidas

- Preços finais dos dois packs (os do Figma, R$ 68,90 e R$ 98,90, são provisórios) e valor por LUT.
- Versão mobile de todas as telas.
- Conteúdo final das páginas legais (os textos atuais são exemplo e precisam de revisão jurídica). Política de reembolso de 7 dias com base no CDC, a confirmar.
- Os caminhos dos menus nos guias de instalação e a resposta da FAQ sobre CapCut precisam ser conferidos nas versões atuais dos programas.
- Respostas da FAQ: só a primeira veio do Figma. As outras estão em `src/data/faq.ts` como texto provisório e precisam de revisão, principalmente licença de uso ("trabalhos para clientes") e reembolso.
- Provedor de envio de e-mails, hospedagem do Postgres e dos arquivos `.cube` (ver "Stack").
- E-mail de contato e redes sociais (`contato@getlutra.com.br`, `@getlutra` são provisórios).
