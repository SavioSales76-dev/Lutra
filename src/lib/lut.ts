/*
 * Leitura de LUTs .cube (formato do DaVinci Resolve / Adobe) para usar no WebGL.
 *
 * O .cube guarda uma tabela 3D de tamanho N×N×N (ex.: 33), com o vermelho variando mais
 * rápido, depois o verde, depois o azul. Para funcionar também em WebGL 1 (sem textura 3D),
 * a tabela vira uma textura 2D "faixa": N fatias lado a lado, uma por valor de azul,
 * com largura N×N e altura N. O shader faz a interpolação entre fatias.
 */

export interface Lut {
  tamanho: number
  /** RGBA 8 bits, largura tamanho², altura tamanho */
  dados: Uint8Array
  largura: number
  altura: number
}

export function lerCube(texto: string): Lut {
  let tamanho = 0
  let min = [0, 0, 0]
  let max = [1, 1, 1]
  const valores: number[] = []

  for (const linhaBruta of texto.split(/\r?\n/)) {
    const linha = linhaBruta.trim()
    if (!linha || linha.startsWith('#')) continue
    if (linha.startsWith('LUT_3D_SIZE')) {
      tamanho = parseInt(linha.split(/\s+/)[1] ?? '0', 10)
      continue
    }
    if (linha.startsWith('DOMAIN_MIN')) {
      min = linha.split(/\s+/).slice(1, 4).map(Number)
      continue
    }
    if (linha.startsWith('DOMAIN_MAX')) {
      max = linha.split(/\s+/).slice(1, 4).map(Number)
      continue
    }
    if (/^[A-Za-z]/.test(linha)) continue // TITLE, LUT_1D_SIZE etc.
    const partes = linha.split(/\s+/)
    if (partes.length >= 3) valores.push(Number(partes[0]), Number(partes[1]), Number(partes[2]))
  }

  if (!tamanho || valores.length < tamanho ** 3 * 3) throw new Error('Arquivo .cube inválido ou incompleto')

  const largura = tamanho * tamanho
  const altura = tamanho
  const dados = new Uint8Array(largura * altura * 4)
  const normalizar = (v: number, c: number) => Math.min(Math.max((v - min[c]!) / (max[c]! - min[c]!), 0), 1)

  for (let b = 0; b < tamanho; b++) {
    for (let g = 0; g < tamanho; g++) {
      for (let r = 0; r < tamanho; r++) {
        const origem = (r + g * tamanho + b * tamanho * tamanho) * 3
        // Na faixa: x = fatia (azul) * N + vermelho; y = verde
        const destino = ((b * tamanho + r) + g * largura) * 4
        dados[destino] = Math.round(normalizar(valores[origem]!, 0) * 255)
        dados[destino + 1] = Math.round(normalizar(valores[origem + 1]!, 1) * 255)
        dados[destino + 2] = Math.round(normalizar(valores[origem + 2]!, 2) * 255)
        dados[destino + 3] = 255
      }
    }
  }

  return { tamanho, dados, largura, altura }
}

export async function carregarCube(url: string) {
  const resposta = await fetch(url)
  if (!resposta.ok) throw new Error(`Não foi possível carregar a LUT (${resposta.status})`)
  return lerCube(await resposta.text())
}

/*
 * LUT aplicada nos vídeos da landing (Hero, Como usar e Footer).
 * PROVISÓRIA: é de outro pack (VY Clean Sg3, "Pack LUTs by. YNG") e só está aqui para os
 * vídeos funcionarem enquanto não existem as LUTs da Lutra. Não é para distribuir: trocar
 * pelo .cube próprio assim que existir. O arquivo é servido pelo site (o navegador precisa
 * dele para aplicar a LUT), então qualquer pessoa consegue baixá-lo.
 */
export const LUT_DOS_VIDEOS: string | null = '/luts/lut-provisoria.cube'

/** "Dose" máxima da LUT nos vídeos (como o controle de intensidade dos editores). */
export const DOSE_DA_LUT = 0.7
