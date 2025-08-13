// 移除代理导入，因为不再使用代理

// 强制动态渲染
export const dynamic = 'force-dynamic';

// 配置为 Edge Runtime 以兼容 Cloudflare Pages
export const runtime = 'edge';

export async function GET(request) {
  console.log("API route called with URL:", request.url);
  const { searchParams } = new URL(request.url);
  const startTimestamp = searchParams.get('startTimestamp');
  const endTimestamp = searchParams.get('endTimestamp');

  console.log("Parameters:", { startTimestamp, endTimestamp });

  // if (!date ) {
  //   return Response.json({ error: "Missing required parameters" }, { status: 400 });
  // }
  const apiKey = "VNCNHS77F5SJRDXV9GQSQ5ASQW751B9SPS";
  console.log(apiKey);
  console.log("API Key exists:", !!apiKey);
  console.log("API Key length:", apiKey ? apiKey.length : 0);

  try {
    // 日期转时间戳
    // const dateToTimestamp = (dateStr) => {
    //   return Math.floor(new Date(dateStr).getTime() / 1000);
    // };
    // const timestamp = dateToTimestamp(date);
    // console.log("Timestamp:", timestamp);

    // 获取起始区块号 - 使用Etherscan v2 API
    const getStartBlockResponse = await fetch(
      `https://api.etherscan.io/v2/api?chainid=56&module=block&action=getblocknobytime&timestamp=${startTimestamp}&closest=before&apikey=${apiKey}`
      // 移除代理配置以避免重定向错误
    );

    if (!getStartBlockResponse.ok) {
      throw new Error(`Failed to fetch block number: ${getStartBlockResponse.status}`);
    }

    const blockData = await getStartBlockResponse.json();

    // 检查API响应状态
    if (blockData.status === "0") {
      return Response.json({ error: "Etherscan API error", message: blockData.message, result: blockData.result }, { status: 400 });
    }

    const startBlock = blockData.result;


    // let endTimestamp = timestamp + 86400;
    // 获取结束区块号 - 使用Etherscan v2 API
    const getEndBlockResponse = await fetch(
      `https://api.etherscan.io/v2/api?chainid=56&module=block&action=getblocknobytime&timestamp=${endTimestamp}&closest=before&apikey=${apiKey}`
      // 移除代理配置以避免重定向错误
    );

    if (!getEndBlockResponse.ok) {
      throw new Error(`Failed to fetch block number: ${getEndBlockResponse.status}`);
    }

    const endBlockData = await getEndBlockResponse.json();

    // 检查API响应状态
    if (endBlockData.status === "0") {
      return Response.json({ error: "Etherscan API error", message: endBlockData.message, result: endBlockData.result }, { status: 400 });
    }
    const endBlock = endBlockData.result;


    if (!startBlock || !endBlock) {
      return Response.json({ error: "Failed to fetch block number" }, { status: 500 });
    }

    console.log("Start block:", startBlock);
    console.log("End block:", endBlock);

    return Response.json({ startBlock, endBlock });

  } catch (error) {
    console.error("Error:", error);
    return Response.json({ error: "Internal server error", details: error.message }, { status: 500 });
  }
}
