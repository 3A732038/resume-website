import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // 生產 build 設定：後端把 /assets 留給圖片/PDF，
    // 這裡把前端 build 產物改放 /build-assets，避免 URL 路徑撞名
    assetsDir: 'build-assets',
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    watch: {
      // Windows + Docker volume 掛載收不到檔案變更事件，改用輪詢才能熱重載
      usePolling: true,
    },
    proxy: {
      '/api': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
      '/assets': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
    },
  },
})
