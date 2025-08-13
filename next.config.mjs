/** @type {import('next').NextConfig} */
const nextConfig = {
  // 移除静态导出配置，因为需要 API 路由
  images: { unoptimized: true, },
  
  // Cloudflare Pages 优化配置
  experimental: {
    // 启用 Cloudflare 优化
    runtime: 'edge',
  },
  
  // 确保 API 路由正常工作
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
