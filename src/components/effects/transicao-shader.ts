/*
 * Shader das transições entre as seções com imagem (Hero, Como usar) e a Sobre, que é
 * escura e fica numa camada acima delas. Um véu de noite, transparente, por cima de todo o
 * conteúdo da seção com imagem, colado na borda da Sobre e com uma frente orgânica (ruído
 * fbm que se move devagar). Dois modos (uModo):
 *
 * 0 = cobrir (Hero → Sobre). A Sobre sobe por cima; a borda de CIMA dela está na altura
 *     (1 - uProgresso) da tela. O véu fica ACIMA da borda.
 *     uProgresso: 0 = Hero inteira, 1 = coberta.
 * 1 = revelar (Sobre → Como usar). A Sobre sai por cima; a borda de BAIXO dela está na
 *     altura (1 - uProgresso) da tela. O véu fica ABAIXO da borda e some no fim.
 *     uProgresso: 0 = Como usar coberta, 1 = revelada.
 *
 * As alturas são em fração da tela (viewport). Quando a seção é mais alta que a tela,
 * uAlturaTela = altura da tela / altura do canvas e uTopoTela = onde o topo da tela está no
 * canvas (0 quando a seção está presa pelo topo; 1 - uAlturaTela quando está presa pela base)
 * convertem para as coordenadas do canvas.
 *
 * - Colado na borda o véu é noite opaco, então a emenda com a Sobre é invisível.
 * - Na frente do véu há um brilho âmbar bem discreto, como película queimando.
 * A saída é pré-multiplicada (cor já vezes alfa).
 * Coordenadas: (0,0) no canto superior esquerdo do canvas.
 */

export const vertex = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`

export const fragment = /* glsl */ `
  precision highp float;

  uniform vec2 uResolucao;
  uniform float uProgresso;
  uniform float uTempo;
  uniform float uModo;
  uniform float uAlturaTela;
  uniform float uTopoTela;
  varying vec2 vUv;

  const vec3 NOITE = vec3(14.0, 13.0, 11.0) / 255.0;
  const vec3 AMBAR = vec3(217.0, 138.0, 43.0) / 255.0;

  /* Altura da faixa do véu (em fração da tela) e quanto o ruído deforma a frente */
  const float ZONA = 0.3;
  const float RUIDO = 0.5;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float ruido(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * ruido(p);
      p *= 2.03;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    // y em fração da TELA (0 = topo do canvas), para as duas seções terem o mesmo véu
    vec2 canvas = vec2(vUv.x, 1.0 - vUv.y);
    float y = (canvas.y - uTopoTela) / uAlturaTela;
    float p = clamp(uProgresso, 0.0, 1.0);

    float aspecto = uResolucao.x / (uResolucao.y * uAlturaTela);
    float n = fbm(vec2(canvas.x * aspecto * 2.4, y * 2.4 - uTempo * 0.08) + p * 1.5);

    float borda = 1.0 - p;
    float zona;
    float distancia;
    float brilho;
    if (uModo < 0.5) {
      // Cobrir: véu acima da borda; a faixa cresce no começo, para não aparecer com a seção parada
      zona = mix(0.0001, ZONA, smoothstep(0.0, 0.15, p));
      distancia = max((borda - y) / zona, 0.0);
      brilho = smoothstep(0.0, 0.15, p);
    } else {
      // Revelar: véu abaixo da borda; a faixa some no fim, quando a seção fica toda à mostra
      zona = mix(0.0001, ZONA, 1.0 - smoothstep(0.7, 1.0, p));
      distancia = max((y - borda) / zona, 0.0);
      brilho = 1.0 - smoothstep(0.7, 1.0, p);
    }

    // O ruído cresce a partir da borda: colado nela o véu é sempre opaco (emenda invisível)
    float amplitude = RUIDO * smoothstep(0.0, 0.35, distancia);
    float visivel = smoothstep(0.0, 1.0, distancia + (n - 0.5) * amplitude);
    float veu = 1.0 - visivel;

    // Brilho âmbar discreto na frente do véu
    float frente = visivel * (1.0 - visivel) * 4.0;
    vec3 cor = mix(NOITE, AMBAR, frente * 0.12 * brilho);
    float alfa = clamp(veu + frente * 0.04 * brilho, 0.0, 1.0);

    gl_FragColor = vec4(cor * alfa, alfa);
  }
`
