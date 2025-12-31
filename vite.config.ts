import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Vercel에서는 프록시가 필요 없음 (서버리스 함수가 자동으로 /api 경로 처리)
  // 로컬 개발 시 Vercel CLI 사용: vercel dev
})

