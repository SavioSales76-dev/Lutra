import type { Lut, Pacote } from '@/types/catalogo'

/** Nomes provisórios. A ordem é a da biblioteca. */
export const luts: Lut[] = [
  { id: 'golden-hour', nome: 'Golden Hour' },
  { id: 'teal-coast', nome: 'Teal Coast' },
  { id: 'dusk', nome: 'Dusk' },
  { id: 'ember', nome: 'Ember' },
  { id: 'faded-memory', nome: 'Faded Memory' },
  { id: 'blue-hour', nome: 'Blue Hour' },
  { id: 'olive-road', nome: 'Olive Road' },
  { id: 'safelight', nome: 'Safelight' },
  { id: 'seafoam', nome: 'Seafoam' },
  { id: 'velvet', nome: 'Velvet' },
  { id: 'moss', nome: 'Moss' },
  { id: 'rose', nome: 'Rosé' },
]

/*
 * Quais 6 LUTs entram no Pack Inicial ainda não foi definido;
 * por enquanto são as 6 primeiras.
 * Os preços são apenas para exibição: o valor cobrado é sempre definido no servidor.
 * Valores do Figma (R$ 68,90 e R$ 98,90), ainda provisórios.
 */
export const pacotes: Pacote[] = [
  {
    id: 'inicial',
    nome: 'Pack Inicial',
    lutIds: luts.slice(0, 6).map((l) => l.id),
    precoCentavos: 6890,
    destaque: false,
  },
  {
    id: 'completo',
    nome: 'Pack Completo',
    lutIds: luts.map((l) => l.id),
    precoCentavos: 9890,
    destaque: true,
  },
]
