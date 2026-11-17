/*
 * Aplica uma LUT 3D (em faixa 2D, ver lib/lut.ts) a um vídeo, em tempo real.
 * - Recorte como object-fit: cover.
 * - Interpolação trilinear: bilinear dentro da fatia (pelo filtro LINEAR da textura) e
 *   linear entre as duas fatias de azul mais próximas.
 * - uIntensidade mistura o original com o resultado da LUT (0 = sem LUT, 1 = LUT inteira),
 *   como o controle de intensidade dos editores.
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

  uniform sampler2D tVideo;
  uniform sampler2D tLut;
  uniform float uTamanho;     // N (ex.: 33)
  uniform float uIntensidade; // 0..1
  uniform vec2 uResolucao;    // canvas
  uniform vec2 uMidia;        // vídeo
  varying vec2 vUv;

  vec2 cobrir(vec2 uv) {
    float rTela = uResolucao.x / uResolucao.y;
    float rMidia = uMidia.x / uMidia.y;
    vec2 escala = rTela > rMidia ? vec2(1.0, rMidia / rTela) : vec2(rTela / rMidia, 1.0);
    return (uv - 0.5) * escala + 0.5;
  }

  vec3 aplicarLut(vec3 cor) {
    float n = uTamanho;
    float azul = cor.b * (n - 1.0);
    float fatia0 = floor(azul);
    float fatia1 = min(fatia0 + 1.0, n - 1.0);
    float t = azul - fatia0;

    // Centro dos texels: evita misturar com a fatia vizinha
    float x = cor.r * (n - 1.0) + 0.5;
    float y = cor.g * (n - 1.0) + 0.5;
    vec2 uv0 = vec2((fatia0 * n + x) / (n * n), y / n);
    vec2 uv1 = vec2((fatia1 * n + x) / (n * n), y / n);

    return mix(texture2D(tLut, uv0).rgb, texture2D(tLut, uv1).rgb, t);
  }

  void main() {
    vec2 uv = cobrir(vec2(vUv.x, 1.0 - vUv.y));
    vec3 original = texture2D(tVideo, uv).rgb;
    vec3 comLut = aplicarLut(clamp(original, 0.0, 1.0));
    gl_FragColor = vec4(mix(original, comLut, uIntensidade), 1.0);
  }
`
