import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  // 🚀 打包優化配置
  build: {
    // 啟用 CSS 代碼分割
    cssCodeSplit: true,
    // 啟用 source map（生產除錯用）
    sourcemap: false,
    // 最小化配置
    minify: 'esbuild',
    // Rollup 選項
    rollupOptions: {
      output: {
        // 手動代碼分割
        manualChunks: {
          // Vue 核心庫
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          // 工具庫
          'utils-vendor': ['axios'],
          // Excel 處理（較大，單獨分割）
          'xlsx-vendor': ['xlsx'],
        },
        // 資源檔案命名
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // 分塊大小警告閾值
    chunkSizeWarningLimit: 1000,
    // 目標瀏覽器
    target: 'es2020',
  },
  // 優化依賴預構建
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'axios'],
  },
})
