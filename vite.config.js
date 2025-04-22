import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {  // 添加
    host: '0.0.0.0',
    port: 5173,
    hmr: {
      protocol: "ws"
    },
    // hmr: false,
    allowedHosts: [
      'timex.fun',
      'eng.timex.fun',
      'localhost',
      '127.0.0.1',
      'bolt_learn_english'
    ],
  }
})