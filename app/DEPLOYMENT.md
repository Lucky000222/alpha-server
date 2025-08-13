# Cloudflare Pages 部署说明

## 环境变量配置

在 Cloudflare Pages Dashboard 中，您需要设置以下环境变量：

1. 进入您的项目设置
2. 找到 "Environment variables" 部分
3. 添加以下变量：

```
ETHERSCAN_API_KEY=您的实际Etherscan API密钥
```

## 构建配置

- **Framework preset**: Next.js
- **Build command**: `npm run build`
- **Build output directory**: `.next`
- **Root directory**: `/`

## 注意事项

1. 所有 API 路由都已配置为使用 Edge Runtime
2. 确保您的 Etherscan API key 是有效的
3. 如果遇到构建错误，请检查控制台输出

## 本地测试

在部署前，您可以在本地测试构建：

```bash
npm run build
```

如果构建成功，就可以部署到 Cloudflare Pages 了。
