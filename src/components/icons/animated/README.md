# Ícones animados

Port para Vue de ícones do [lucide-animated](https://lucide-animated.com) (MIT), que só existe para React.
As animações são as originais, reescritas com [motion-v](https://motion.dev/docs/vue).

Contrato de cada ícone:

- `size` (número, padrão 20): largura e altura em px.
- `animating` (booleano): `true` toca a animação, `false` volta ao estado normal.
  Quem decide é o pai (ex.: `LButton` liga no hover ou foco do botão inteiro).

Para portar um ícone novo: baixe `https://lucide-animated.com/r/<nome>.json`, copie as `variants`
e o SVG, e troque `animate={controls}` por `:animate="animating ? 'animate' : 'normal'"`.
Variantes que dependem de `staggerChildren` viram `custom` + `delay` explícito.
