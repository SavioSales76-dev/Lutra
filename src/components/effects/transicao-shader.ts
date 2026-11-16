/*
 * Shader da transição Hero → Sobre: um véu de noite, transparente, que fica por cima de
 * tudo da Hero (foto, título, texto, botões e menu) e sobe junto com a borda da Sobre.
 *
 * uProgresso vai de 0 (Hero inteira) a 1 (Sobre cobrindo tudo); a borda da Sobre está na
 * altura (1 - uProgresso) da tela.
 * - Acima da borda, o véu escurece a Hero por uma frente orgânica (ruído fbm que se move
 *   devagar), numa faixa baixa (até ~30% da tela acima da borda).
 * - Colado na borda o véu é noite opaco, então a emenda com a Sobre é invisível.
 * - Na frente do véu há um brilho âmbar bem discreto, como película queimando.
 * A saída é pré-multiplicada (cor já vezes alfa).
 * Coordenadas: (0,0) no canto superior esquerdo.
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
  varying vec2 vUv;

  const vec3 NOITE = vec3(14.0, 13.0, 11.0) / 255.0;
  const vec3 AMBAR = vec3(217.0, 138.0, 43.0) / 255.0;

  /* Altura da faixa do véu acima da borda e quanto o ruído deforma a frente */
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
    vec2 tela = vec2(vUv.x, 1.0 - vUv.y);
    float p = clamp(uProgresso, 0.0, 1.0);

    float borda = 1.0 - p;
    // A faixa cresce no começo da transição, para o véu não aparecer com a Hero parada
    float zona = mix(0.0001, ZONA, smoothstep(0.0, 0.15, p));
    float aspecto = uResolucao.x / uResolucao.y;
    float n = fbm(vec2(tela.x * aspecto * 2.4, tela.y * 2.4 - uTempo * 0.08) + p * 1.5);

    float distancia = max((borda - tela.y) / zona, 0.0);
    // O ruído cresce a partir da borda: colado nela o véu é sempre opaco (emenda invisível)
    float amplitude = RUIDO * smoothstep(0.0, 0.35, distancia);
    float visivel = smoothstep(0.0, 1.0, distancia + (n - 0.5) * amplitude);
    float veu = 1.0 - visivel;

    // Brilho âmbar discreto na frente do véu
    float frente = visivel * (1.0 - visivel) * 4.0;
    vec3 cor = mix(NOITE, AMBAR, frente * 0.12 * smoothstep(0.0, 0.15, p));
    float alfa = clamp(veu + frente * 0.04, 0.0, 1.0);

    gl_FragColor = vec4(cor * alfa, alfa);
  }
`
