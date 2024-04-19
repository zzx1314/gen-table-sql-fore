import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createStyleImportPlugin, VxeTableResolve } from 'vite-plugin-style-import'
import { prismjsPlugin } from 'vite-plugin-prismjs'



// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    createStyleImportPlugin({
      resolves: [
        VxeTableResolve()
      ]
    }),
    prismjsPlugin({
      languages: 'all', // 语言
      plugins: ['line-numbers','show-language','copy-to-clipboard','inline-color'],
      theme: 'okaidia',// 主题
      css: true,
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:7397',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/en': {
        target: 'http://api.fanyi.baidu.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/en/, '')
      }
    }
  }
})
