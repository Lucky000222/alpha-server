/** @type {import('next').NextConfig} */
const nextConfig = {
  // 移除静态导出配置，因为需要 API 路由
  images: { unoptimized: true, },

  // Cloudflare Pages 优化配置
  experimental: {
    // 启用 Cloudflare 优化
    runtime: 'edge',
  },
};

export default nextConfig;
