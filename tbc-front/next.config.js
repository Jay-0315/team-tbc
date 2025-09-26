// Next.js 설정 - SSR 유지
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Docker용 standalone 빌드
  experimental: {
    serverComponentsExternalPackages: [],
  },
  // Vite 프록시 사용으로 Next.js 프록시 제거
  // 환경 변수 설정
  env: {
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080',
  },
}
module.exports = nextConfig
