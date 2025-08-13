
const url_ip = "http://list.sky-ip.net/user_get_ip_list?token=0Ydk5rcgAFhVTeHG1680066339318&qty=1&country=sg&time=5&format=json&protocol=http"
async function getIP(url = url_ip) {
    let fetchResult = await
        ///////////////////////////////////////////////////////////////
        fetch(url, {
            "headers": {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "accept-language": "zh-CN,zh;q=0.9",
                "cache-control": "no-cache",
                "pragma": "no-cache",
                "proxy-connection": "keep-alive",
                "upgrade-insecure-requests": "1"
            },
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "omit"
        })
            /////////////////////////////////////////////////////////////////
            .then(result => result.text());
    console.log(fetchResult);
    fetchResult = JSON.parse(fetchResult)
    if (fetchResult.msg === '成功') {
        return fetchResult.data[0]
    } else {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return getIP()
    }
}
async function main(params) {
    let ip = await getIP()
    console.log(ip);
}

main()
module.exports = {
    getIP
}
