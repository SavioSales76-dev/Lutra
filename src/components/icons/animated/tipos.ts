import type { MotionProps } from 'motion-v'

/* Tipos aceitos pelas props do motion-v (o `Variants` reexportado do framer-motion não é compatível). */
export type Variantes = NonNullable<MotionProps['variants']>
export type Transicao = NonNullable<MotionProps['transition']>
