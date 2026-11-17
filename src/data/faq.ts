export interface Pergunta {
  id: string
  pergunta: string
  resposta: string
}

/*
 * Perguntas da FAQ (Figma: "FAQ — Desktop").
 * Só a primeira resposta veio do Figma. As outras são PROVISÓRIAS, escritas a partir do que
 * está decidido no CLAUDE.md, e precisam ser revisadas antes de publicar — principalmente
 * "trabalhos para clientes" (licença de uso) e "se eu não gostar" (reembolso, revisão jurídica).
 */
export const perguntas: Pergunta[] = [
  {
    id: 'editores',
    pergunta: 'Funciona no CapCut e nos outros editores?',
    resposta:
      'Sim. As LUTs vêm em arquivos .cube, o formato aceito pelo CapCut, Premiere Pro, DaVinci Resolve, Final Cut Pro e pela maioria dos editores de vídeo. Na área do cliente tem um guia passo a passo para cada um.',
  },
  {
    id: 'log',
    pergunta: 'Preciso gravar em LOG?',
    resposta:
      'Não. Cada LUT vem em duas versões: uma para vídeos gravados em LOG e outra para vídeos comuns (Rec.709), que é como a maioria dos celulares grava. É só escolher a versão certa para o seu material.',
  },
  {
    id: 'entrega',
    pergunta: 'Como eu recebo as LUTs depois de comprar?',
    resposta:
      'Assim que o pagamento é aprovado, você recebe um e-mail com o acesso. Na área do cliente é só entrar com o mesmo e-mail da compra, sem senha: mandamos um link de acesso na hora.',
  },
  {
    id: 'cameras',
    pergunta: 'Funciona com qualquer câmera ou celular?',
    resposta:
      'Sim. A LUT é aplicada no editor, então funciona com vídeos de qualquer câmera ou celular. O resultado pode variar com a luz e o perfil de cor da gravação; por isso dá para ajustar a intensidade até achar o seu look.',
  },
  {
    id: 'clientes',
    pergunta: 'Posso usar em trabalhos para clientes?',
    resposta:
      'Sim, você pode usar as LUTs nos vídeos que produzir, inclusive para clientes. Só não é permitido revender ou distribuir os arquivos .cube.',
  },
  {
    id: 'reembolso',
    pergunta: 'E se eu não gostar?',
    resposta:
      'Você tem 7 dias a partir da compra para pedir o reembolso, sem precisar explicar o motivo. É só escrever para o nosso e-mail de contato.',
  },
  {
    id: 'upgrade',
    pergunta: 'Posso trocar do Pack Inicial para o Completo depois?',
    resposta:
      'Pode. Quem tem o Pack Inicial vê a opção de upgrade para o Pack Completo direto na área do cliente.',
  },
]
