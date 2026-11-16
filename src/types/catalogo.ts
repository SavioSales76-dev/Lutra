export type PacoteId = 'inicial' | 'completo'

/** Cada LUT existe em duas versões; a área do cliente alterna entre elas. */
export type VersaoLut = 'log' | 'rec709'

export type ProgramaGuia = 'premiere' | 'davinci' | 'final-cut' | 'capcut'

export interface Lut {
  id: string
  /** Nome em inglês, como aparece na interface. */
  nome: string
}

export interface Pacote {
  id: PacoteId
  nome: string
  lutIds: string[]
  /** Preço em centavos. `null` enquanto não for definido. */
  precoCentavos: number | null
  destaque: boolean
}
