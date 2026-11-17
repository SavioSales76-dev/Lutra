import { rmSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

/*
 * public/_teste/ guarda arquivos só para testes locais (ex.: LUTs de terceiros) e fica fora
 * do Git. O Vite copia tudo de public/ para o build; este plugin apaga a pasta do dist para
 * ela nunca ser publicada.
 */
function semArquivosDeTeste(): Plugin {
  return {
    name: 'lutra:sem-arquivos-de-teste',
    apply: 'build',
    closeBundle() {
      rmSync(fileURLToPath(new URL('./dist/_teste', import.meta.url)), { recursive: true, force: true })
    },
  }
}

export default defineConfig({
  plugins: [vue(), tailwindcss(), semArquivosDeTeste()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
