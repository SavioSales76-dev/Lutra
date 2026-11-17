const reais = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

/** 6890 → "R$ 68,90". `null` (preço ainda não definido) → "R$ XX". */
export function formatarPreco(centavos: number | null) {
  if (centavos === null) return 'R$ XX'
  // Intl usa espaço não separável entre "R$" e o número; mantém assim para não quebrar a linha
  return reais.format(centavos / 100)
}
