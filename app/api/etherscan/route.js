// 移除代理导入，因为不再使用代理

// 强制动态渲染
export const dynamic = 'force-dynamic';

// 配置为 Edge Runtime 以兼容 Cloudflare Pages
export const runtime = 'edge';

export async function GET(request) {
  console.log("API route called with URL:", request.url);
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const address = searchParams.get('address');
  const contractAddress = searchParams.get('contractAddress');

  console.log("Parameters:", { date, address, contractAddress });

  if (!date || !address || !contractAddress) {
    return Response.json({ error: "Missing required parameters" }, { status: 400 });
  }

  const apiKey = "VNCNHS77F5SJRDXV9GQSQ5ASQW751B9SPS";
  console.log(apiKey);

  console.log("API Key exists:", !!apiKey);
  console.log("API Key length:", apiKey ? apiKey.length : 0);

  // if (!apiKey) {
  //   return Response.json({
  //     error: "Etherscan API key not configured",
  //     message: "Please set ETHERSCAN_API_KEY in .env.local file",
  //     example: "ETHERSCAN_API_KEY=your_api_key_here"
  //   }, { status: 500 });
  // }
  console.log("1111111111111111111111");
  try {
    // 日期转时间戳
    const dateToTimestamp = (dateStr) => {
      return Math.floor(new Date(dateStr).getTime() / 1000);
    };
    const timestamp = dateToTimestamp(date);
    console.log("Timestamp:", timestamp);

    // 根据环境决定是否使用代理
    // const isDevelopment = process.env.NODE_ENV === 'development';
    // const proxyUrl = process.env.HTTP_PROXY || process.env.HTTPS_PROXY;

    // let fetchOptions = {
    //   method: 'GET',
    //   headers: {
    //     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    //     'Accept': 'application/json',
    //     'Accept-Language': 'en-US,en;q=0.9',
    //     'Cache-Control': 'no-cache',
    //     'Pragma': 'no-cache'
    //   },
    //   // 设置超时时间
    //   signal: AbortSignal.timeout(30000) // 30秒超时
    // };

    // 只在开发环境且配置了代理时才使用代理
    // if (isDevelopment && proxyUrl) {
    //   console.log("Development mode - Using proxy:", proxyUrl);
    //   const agent = new HttpsProxyAgent(proxyUrl);
    //   fetchOptions.agent = agent;
    // } else {
    //   console.log("Production mode or no proxy configured - Direct connection");
    // }

    // 获取区块号 - 使用Etherscan v2 API
    const getBlockResponse = await fetch(
      `https://api.etherscan.io/v2/api?chainid=56&module=block&action=getblocknobytime&timestamp=${timestamp}&closest=before&apikey=${apiKey}`
      // 移除代理配置以避免重定向错误
    );

    if (!getBlockResponse.ok) {
      throw new Error(`Failed to fetch block number: ${getBlockResponse.status}`);
    }

    const blockData = await getBlockResponse.json();

    // 检查API响应状态
    if (blockData.status === "0") {
      return Response.json({ error: "Etherscan API error", message: blockData.message, result: blockData.result }, { status: 400 });
    }

    const startBlock = blockData.result;

    if (!startBlock) {
      return Response.json({ error: "Failed to fetch block number" }, { status: 500 });
    }

    console.log("Start block:", startBlock);

    // 查询 USDT 交易 - 使用Etherscan v2 API
    const queryResponse = await fetch(
      `https://api.etherscan.io/v2/api?chainid=56&module=account&action=tokentx&contractaddress=${contractAddress}&address=${address}&page=1&offset=100&startblock=${startBlock}&endblock=latest&sort=asc&apikey=${apiKey}`
      // 移除代理配置以避免重定向错误
    );

    if (!queryResponse.ok) {
      throw new Error(`Failed to fetch token transactions: ${queryResponse.status}`);
    }

    const queryData = await queryResponse.json();

    // 检查API响应状态
    if (queryData.status === "0") {
      return Response.json({ error: "Etherscan API error", message: queryData.message, result: queryData.result }, { status: 400 });
    }

    // 返回结果
    return Response.json(queryData);
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ error: "Internal server error", details: error.message }, { status: 500 });
  }
}
