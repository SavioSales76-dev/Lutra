/*
 * Pólen e poeira na brisa, por cima do vídeo da Hero.
 *
 * Todo o movimento é calculado na GPU a partir de uma "semente" fixa por partícula; o
 * processador só atualiza alguns uniforms por quadro (tempo, deriva acumulada, rajada,
 * mouse). Um único draw call de pontos, sem texturas, com mistura aditiva.
 *
 * semente = (x inicial, y inicial, fase, camada). camada 0 = longe (pequena, nítida, lenta),
 * camada 1 = perto (grande, desfocada como bokeh, rápida).
 * Coordenadas de tela: (0,0) no canto superior esquerdo, (1,1) no inferior direito.
 */

export const vertex = /* glsl */ `
  attribute vec4 semente;

  uniform float uTempo;
  uniform float uDeriva;     // deslocamento acumulado pelo vento (integra a velocidade)
  uniform float uRajada;     // 0..1, força da rajada no momento
  uniform float uOpacidade;  // 0..1, fade de entrada
  uniform float uDpr;
  uniform vec2 uResolucao;   // em px CSS
  uniform vec2 uMouse;       // 0..1
  uniform vec2 uSol;         // posição do sol na tela

  varying float vAlfa;
  varying float vSuave;
  varying vec3 vCor;

  const vec3 OFF_WHITE = vec3(244.0, 241.0, 234.0) / 255.0;
  const vec3 AMBAR = vec3(217.0, 138.0, 43.0) / 255.0;

  void main() {
    float camada = semente.w;
    float fase = semente.z * 6.2831;
    float velocidade = mix(0.3, 1.0, camada);

    // Vento da direita para a esquerda (o mesmo sentido do trigo no vídeo), subida leve e
    // balanço próprio de cada partícula
    float x = semente.x - uDeriva * 0.035 * velocidade + sin(uTempo * 0.35 + fase) * 0.012;
    float y = semente.y - uDeriva * 0.006 * velocidade + sin(uTempo * 0.6 + fase * 2.0) * (0.01 + uRajada * 0.012);

    // Volta pelo outro lado com uma folga fora da tela (sem aparecer "do nada")
    vec2 pos = vec2(fract(x), fract(y)) * 1.12 - 0.06;

    // O mouse abre caminho: empurra as partículas próximas (mais as de perto)
    float aspecto = uResolucao.x / max(uResolucao.y, 1.0);
    vec2 d = (pos - uMouse) * vec2(aspecto, 1.0);
    float forca = exp(-dot(d, d) / 0.018);
    pos += (length(d) > 0.0001 ? normalize(d) : vec2(0.0)) / vec2(aspecto, 1.0) * forca * 0.045 * mix(0.4, 1.0, camada);

    gl_Position = vec4(pos.x * 2.0 - 1.0, 1.0 - pos.y * 2.0, 0.0, 1.0);

    float tamanho = mix(2.2, 12.0, camada * camada) * (1.0 + uRajada * 0.12);
    gl_PointSize = tamanho * uDpr;

    // Brilho: pisca devagar, acende perto do sol, some no pé da tela (que é noite)
    float pisca = 0.65 + 0.35 * sin(uTempo * (0.6 + semente.z * 1.4) + fase * 7.0);
    vec2 aoSol = (pos - uSol) * vec2(aspecto, 1.0);
    float luz = exp(-length(aoSol) * 2.6);
    float bordas = smoothstep(0.0, 0.08, pos.y) * (1.0 - smoothstep(0.86, 1.0, pos.y));

    // As de perto (bokeh) são maiores e mais transparentes; as de longe, pontos firmes
    vAlfa = mix(0.75, 0.42, camada) * pisca * (0.7 + luz * 1.2) * bordas * uOpacidade;
    vCor = mix(OFF_WHITE, AMBAR, clamp(luz * 0.85, 0.0, 1.0));
    vSuave = mix(0.45, 0.95, camada);
  }
`

export const fragment = /* glsl */ `
  precision mediump float;

  varying float vAlfa;
  varying float vSuave;
  varying vec3 vCor;

  void main() {
    // Disco suave: as partículas de perto são mais desfocadas (bokeh)
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float a = (1.0 - smoothstep(1.0 - vSuave, 1.0, d)) * vAlfa;
    if (a < 0.003) discard;
    gl_FragColor = vec4(vCor * a, a);
  }
`
