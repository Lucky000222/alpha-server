// 移除代理导入，因为不再使用代理

// 强制动态渲染
export const dynamic = 'force-dynamic';

// 配置为 Edge Runtime 以兼容 Cloudflare Pages
export const runtime = 'edge';

export async function GET(request) {
  console.log("API route called with URL:", request.url);
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const startBlock = searchParams.get('startBlock');
  // const endBlock = searchParams.get('endBlock');
  const contractAddress = "0x55d398326f99059ff775485246999027b3197955";

  console.log("Parameters:", { address, startBlock });

  if (!address || !startBlock) {
    return Response.json({ error: "Missing required parameters" }, { status: 400 });
  }
  const apiKey = "VNCNHS77F5SJRDXV9GQSQ5ASQW751B9SPS";
  console.log(apiKey);

  console.log("API Key exists:", !!apiKey);
  console.log("API Key length:", apiKey ? apiKey.length : 0);

  try {
    // // 日期转时间戳
    // const dateToTimestamp = (dateStr) => {
    //   return Math.floor(new Date(dateStr).getTime() / 1000);
    // };
    // const timestamp = dateToTimestamp(date);
    // console.log("Timestamp:", timestamp);

    // // 获取起始区块号 - 使用Etherscan v2 API
    // const getStartBlockResponse = await fetch(
    //   `https://api.etherscan.io/v2/api?chainid=56&module=block&action=getblocknobytime&timestamp=${timestamp}&closest=before&apikey=${apiKey}`
    //   // 移除代理配置以避免重定向错误
    // );

    // if (!getStartBlockResponse.ok) {
    //   throw new Error(`Failed to fetch block number: ${getBlockResponse.status}`);
    // }

    // const blockData = await getBlockResponse.json();

    // // 检查API响应状态
    // if (blockData.status === "0") {
    //   return Response.json({ error: "Etherscan API error", message: blockData.message, result: blockData.result }, { status: 400 });
    // }

    // const startBlock = blockData.result;


    // let endTimestamp = timestamp + 86400;
    // // 获取结束区块号 - 使用Etherscan v2 API
    // const getEndBlockResponse = await fetch(
    //   `https://api.etherscan.io/v2/api?chainid=56&module=block&action=getblocknobytime&timestamp=${endTimestamp}&closest=before&apikey=${apiKey}`
    //   // 移除代理配置以避免重定向错误
    // );

    // if (!getEndBlockResponse.ok) {
    //   throw new Error(`Failed to fetch block number: ${getBlockResponse.status}`);
    // }

    // const endBlockData = await getEndBlockResponse.json();

    // // 检查API响应状态
    // if (endBlockData.status === "0") {
    //   return Response.json({ error: "Etherscan API error", message: endBlockData.message, result: endBlockData.result }, { status: 400 });
    // }
    // const endBlock = endBlockData.result;


    // if (!startBlock || !endBlock) {
    //   return Response.json({ error: "Failed to fetch block number" }, { status: 500 });
    // }

    // console.log("Start block:", startBlock);

    // 查询 USDT 交易 - 使用Etherscan v2 API
    const queryResponse = await fetch(
      `https://api.etherscan.io/v2/api?chainid=56&module=account&action=tokentx&contractaddress=${contractAddress}&address=${address}&page=1&offset=100&startblock=${startBlock}&endblock=latest&sort=asc&apikey=${apiKey}`
    );

    if (!queryResponse.ok) {
      throw new Error(`Failed to fetch token transactions: ${queryResponse.status}`);
    }

    const queryData = await queryResponse.json();

    // 检查API响应状态
    if (queryData.status === "0") {
      return Response.json({ error: "Etherscan API error", message: queryData.message, result: queryData.result }, { status: 400 });
    }

    // 返回结果 - 确保返回格式与前端期望一致
    console.log("API Response:", queryData);
    return Response.json(queryData);
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ error: "Internal server error", details: error.message }, { status: 500 });
  }
}
