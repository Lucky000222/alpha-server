"use client";
import { useEffect, useState, useRef } from "react";
import Link from 'next/link';
import { ethers } from "ethers"
import { format } from "date-fns";
// import HttpProxyAgent from 'https-proxy-agent'
// import { fetch } from 'node-fetch';

export default function othetTool() {
  const [showTable, setShowTable] = useState(false); // 显示表格
  const [inputValue, setInputValue] = useState(); // 输入框
  const [privateKeyValue, setPrivateKeyValue] = useState(); // 私钥集合 或者密码集合
  const [addresses, setAddresses] = useState([]); // 表格内存储地址的数组
  const [selectedItems, setSelectedItems] = useState(new Set()); // 使用多选框选中的地址集合
  const [notification, setNotification] = useState({ message: "", type: "" }); // 右上角提示消息
  const [column, setColumn] = useState(); // 选择栏目
  const [alphaButton, setAlphaButton] = useState(false);
  const [okxButton, setOkxButton] = useState(false);

  const [tradeVolumeButton, setTradeVolumeButton] = useState(false);
  const [alphaTokenMap, setAlphaTokenMap] = useState({});
  const [alphaTokenList, setAlphaTokenList] = useState([]);
  const [searchSymbol, setSearchSymbol] = useState("");
  const [filteredTokenList, setFilteredTokenList] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState("");

  const [date, setDate] = useState(null);
  const [goToTwitterIsOpen, setGoToTwitterIsOpen] = useState(false);
  const [printInfo, setPrintInfo] = useState(""); // 用于存储打印信息
  const [isMonitoring, setIsMonitoring] = useState(false); // 监控状态
  const printInfoRef = useRef(null); // 用于自动滚动
  useEffect(() => {
    const currentDate = format(new Date(), 'yyyy-MM-dd');
    console.log(currentDate);
    setDate(currentDate)
  }, []);

  //* 输入框的地址数据 or 地址----私钥数据 
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (e.target.value.toString().includes('----')) {
      const lines = e.target.value.trim().split('\n');
      const keyPairMap = {}; // 用于存储地址和私钥的键值对

      // 逐行处理 
      lines.forEach(line => {
        const [address, privateKey] = line.split('----'); // 分割地址和私钥
        if (address && privateKey) {
          keyPairMap[address.trim()] = privateKey.trim(); // 将地址作为键，私钥作为值存储
        }
      });
      setPrivateKeyValue(keyPairMap); // 存储整个键值对对象
    }

  };

  //* 清空所有地址
  const handleClearProducts = () => {
    if (selectedItems.size != 0) {
      handleDelete();
      if (addresses.length == selectedItems.size) {
        setShowTable(false); // 清空数据后重新显示输入框
      }
    } else {
      setInputValue('');
      setAddresses([]);
      setShowTable(false); // 清空数据后重新显示输入框
      setPrivateKeyValue();
    }
    setSelectedItems(new Set()); // 清空选择
  };

  //* 筛选出被选中的地址 存储id
  const handleCheckboxChange = (id) => {
    const newSelectedItems = new Set(selectedItems);
    if (newSelectedItems.has(id)) {
      newSelectedItems.delete(id);
    } else {
      newSelectedItems.add(id);
    }
    setSelectedItems(newSelectedItems);
  };

  //* 将选中的地址在列表中删除
  const handleDelete = () => {
    // const filteredAddresses = addresses.filter(item => !selectedItems.has(item.id));
    // 过滤掉选中的项
    const filteredAddresses = addresses
      .filter(item => {
        // 如果在 selectedItems 中，删除对应的键值对
        if (selectedItems.has(item.id)) {
          // 如果提交地址的时候提交了私钥，那么在privateKeyValue中也删除地址和私钥的键值对
          if (privateKeyValue != undefined) {
            delete privateKeyValue[item.address];
          }
          return false; // 过滤掉这一项
        }
        return true; // 保留这一项
      })
      .map((item, index) => ({ // 重新设置 ID
        ...item,
        id: index + 1 // 根据新顺序重新赋值 ID
      }));
    setAddresses(filteredAddresses); // 假设你有一个 setAddresses 函数来更新地址列表
    setSelectedItems(new Set()); // 清空选择

  };

  //* 将地址全部勾选
  const selectAll = () => {
    notAddresses();
    const allIds = new Set(addresses.map(item => item.id)); // 创建一个包含所有 ID 的 Set
    setSelectedItems(allIds); // 更新 selectedItems
  };

  //* 将地址反选 将选中和为被选中的互换选中状态
  const reverseSelection = () => {
    notAddresses();
    // 创建一个新的 Set，用于存储反选后的 ID
    const newSelectedItems = new Set();

    // 遍历 addresses，决定每个 ID 是否要添加到 newSelectedItems
    addresses.forEach(item => {
      if (selectedItems.has(item.id)) {
        // 如果已选中，则不添加（取消勾选）
        return; // 不做任何操作
      } else {
        // 如果未选中，则添加（勾选）
        newSelectedItems.add(item.id);
      }
    });
    // 更新 selectedItems 状态
    setSelectedItems(newSelectedItems);
  };

  //* 提交地址
  const handleSubmit = (e) => {
    if (column == undefined) {
      setNotification({ message: 'error: 请选择项目', type: "error" });
      hideNotification();
      new Promise(resolve => setTimeout(resolve, 2000));;
      return;
    }

    e.preventDefault();
    if (inputValue !== undefined) {
      let i = 0;
      // Dynamically map addresses based on the column value
      const newAddresses = inputValue.split('\n').map((line) => {
        // const trimmedLine = line.trim();
        // if (!trimmedLine) return null; // Skip empty lines early

        // Default object structure
        // let addressObj = { id: ++i };

        // Adjust mapping based on column
        switch (column) {
          case 'xpin':
            // Example: For project1, expect email----privateKey format
            return {
              // ...addressObj,
              id: ++i,
              // address: trimmedLine.split('----')[0], // 地址
              address: line.trim().split('----')[0], // 地址
              totalXp: null, // 总共的xp
              unClaimXp: null, // 未领取xp
            };
          case 'alpha':
            // Example: For project2, expect email::token format
            return {
              //  ...addressObj,
              id: ++i,
              address: line.trim().split('----')[0], // 地址
              mark: privateKeyValue[line.trim().split('----')[0]],
              totalValue: 0,
              score: 0,
              bnbToUsdt: 0,
              usdt: 0,
              totalUsdt: 0
            };
          // case 'project3':
          //   // Example: For project3, expect username|email|value format
          //   const [username, email, value] = trimmedLine.split('|');
          //   return {
          //     ...addressObj,
          //     username: username || '',
          //     email: email || '',
          //     value: value || '',
          //     mark: 0, // Default gas
          //   };
          // default:
          //   // Fallback to original logic if column is unrecognized
          //   return {
          //     ...addressObj,
          //     email: trimmedLine.split('----')[0],
          //     mark: 0,
          //   };
        }
        //* address代表账号 如果是钱包就是地址 如果是账号就是邮箱账号或者用户名  ********************
      }).filter(item => item && item.address); // Filter out nulls and items without email

      setAddresses((prevAddresses) => [...prevAddresses, ...newAddresses]);
      setInputValue('');
      setShowTable(true); // Show table and hide input
      // console.log(privateKeyValue);
    }
  }

  //* 将数据倒序
  const reverse = () => {
    // 反转数组并重新设置 ID
    setAddresses(prevAddresses => {
      const reversed = [...prevAddresses].reverse();
      return reversed.map((item, index) => ({ // 重新设置 ID
        ...item,
        id: index + 1 // 根据新顺序重新赋值 ID
      }));
    });
  }

  //* 提示信息----没有提交地址就操作按钮
  const notAddresses = () => {
    if (addresses.length == 0) {
      setNotification({ message: 'error: 请提交地址', type: "error" });
      hideNotification();
      return;
    }
  };

  //* 提示消息模板
  const hideNotification = () => {
    setTimeout(() => {
      setNotification({ message: "", type: "" });
    }, 2000);
  };



  //* 设置栏目为 alpha 项目
  const setColumnForAlpha = () => {
    // 选择栏目前先将所有的设置为false
    allIsFalse();
    // 选择栏目时 检验栏目
    checkColumn('alpha');
    setColumn('alpha');
    setAlphaButton(true);
    // setGoToTwitterIsOpen(true);
  }

  //* 设置栏目为 OKX TGE直通车活动 项目
  const setColumnForOkx = () => {
    // 选择栏目前先将所有的设置为false
    allIsFalse();
    // 选择栏目时 检验栏目
    checkColumn('OKX TGE直通车活动');
    setColumn('OKX TGE直通车活动');
    setOkxButton(true);
  }

  //* 设置栏目为 币安alpha限价交易量 项目
  const setColumnForTradeVolume = async () => {
    allIsFalse();
    checkColumn('币安alpha限价交易量');
    setColumn('币安alpha限价交易量');
    setTradeVolumeButton(true);

    try {
      // 使用 CORS 代理来解决跨域问题
      const res = await fetch("https://www.binance.com/bapi/defi/v1/public/wallet-direct/buw/wallet/cex/alpha/all/token/list")
      const data = await res.json();
      if (!data.data || !Array.isArray(data.data)) {
        setAlphaTokenMap({});
        setAlphaTokenList([]);
        setFilteredTokenList([]);
        return;
      }
      const map = {};
      data.data.forEach(ele => {
        map[ele.symbol] = ele.alphaId;
      });
      setAlphaTokenMap(map);
      setAlphaTokenList(data.data.map(ele => ({ symbol: ele.symbol, alphaId: ele.alphaId })));
      setFilteredTokenList(data.data.map(ele => ({ symbol: ele.symbol, alphaId: ele.alphaId })));
    } catch (e) {
      setAlphaTokenMap({});
      setAlphaTokenList([]);
      setFilteredTokenList([]);
    }
  };

  const handleSearchSymbol = (e) => {
    const value = e.target.value;
    setSearchSymbol(value);
    // 清空选择状态，避免缓存问题
    setSelectedSymbol("");

    if (!value) {
      setFilteredTokenList([]);
    } else {
      const filtered = alphaTokenList.filter(item =>
        item.symbol.toLowerCase().includes(value.toLowerCase())
      );
      // 去重，避免重复显示
      const uniqueFiltered = filtered.filter((item, index, self) =>
        index === self.findIndex(t => t.symbol === item.symbol)
      );
      setFilteredTokenList(uniqueFiltered);
    }
  };
  const handleSelectSymbol = (symbol) => {
    setSelectedSymbol(symbol);
    setSearchSymbol(symbol);
    // 选择后清空下拉列表，避免缓存
    setFilteredTokenList([]);
  };

  const selectTradeVolume = async () => {
    if (!searchSymbol) {
      setPrintInfo("错误: 请先选择币种\n");
      return;
    }

    setPrintInfo("开始查询币安alpha限价交易量...\n");

    // 自动滚动到底部
    setTimeout(() => {
      if (printInfoRef.current) {
        printInfoRef.current.scrollTop = printInfoRef.current.scrollHeight;
      }
    }, 100);
    let alphaId = alphaTokenMap[searchSymbol];
    if (!alphaId) {
      setPrintInfo("错误: 未找到该币种的alphaId\n");
      return;
    }

    let symbol = alphaId + "USDT";
    let time = getToday8AMTimestamp();

    let fromId = 0;

    try {
      console.log(time);

      const res = await fetch("https://www.binance.com/bapi/defi/v1/public/alpha-trade/agg-trades?symbol=" + symbol + "&startTime=" + Number(time) + "&endTime=" + Number(time + 10000));
      console.log(await res.url);

      const data = await res.json();
      console.log(`根据时间调用的 `, data);

      if (data.data && data.data.length > 0) {
        data.data.forEach(element => {
          if (fromId == 0) {
            fromId = element.f;
            const currentTime = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false });
            setPrintInfo(prev => {
              const newInfo = prev + `[${currentTime}] 第一笔成交id: ${fromId}\n`;
              // 自动滚动到底部
              setTimeout(() => {
                if (printInfoRef.current) {
                  printInfoRef.current.scrollTop = printInfoRef.current.scrollHeight;
                }
              }, 100);
              return newInfo;
            });
            setPrintInfo(prev => {
              const newInfo = prev + `[${currentTime}] 交易量: ${(element.p * element.q).toFixed(2)} USDT\n`;
              // 自动滚动到底部
              setTimeout(() => {
                if (printInfoRef.current) {
                  printInfoRef.current.scrollTop = printInfoRef.current.scrollHeight;
                }
              }, 100);
              return newInfo;
            });
          }
        });
      }
    } catch (error) {
      setPrintInfo(prev => prev + `错误: ${error.message}\n`);
      return;
    }

    let i = 0;
    let limit = 1000;
    let count = 0;

    while (true) {
      // try {
      const currentTime = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false });
      const res = await fetch("https://www.binance.com/bapi/defi/v1/public/alpha-trade/agg-trades?symbol=" + symbol + "&fromId=" + fromId + "&limit=" + limit)
      const data = await res.json();

      if ((data.data == null || data.data.length < 1000) && limit == 1000) {
        limit = 100;
      }

      if (data.data.length >= 100) {
        data.data.forEach(element => {
          // i++;
          const timestamp = new Date(element.T).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false });
          let volume = (element.p * element.q).toFixed(2);
          // setPrintInfo(prev => prev + `[${currentTime}] 第${i}笔订单\n`);
          setPrintInfo(prev => {
            const newInfo = prev + `[${currentTime}] 时间: ${timestamp}\n`;
            // 自动滚动到底部
            setTimeout(() => {
              if (printInfoRef.current) {
                printInfoRef.current.scrollTop = printInfoRef.current.scrollHeight;
              }
            }, 100);
            return newInfo;
          });
          setPrintInfo(prev => {
            const newInfo = prev + `[${currentTime}] 交易量: ${volume} USDT\n\n`;
            // 自动滚动到底部
            setTimeout(() => {
              if (printInfoRef.current) {
                printInfoRef.current.scrollTop = printInfoRef.current.scrollHeight;
              }
            }, 100);
            return newInfo;
          });
          count += Number(volume);
        });

        const lastElement = data.data[data.data.length - 1];
        setPrintInfo(prev => {
          const newInfo = prev + `[${currentTime}] 🤪🤪早上8点到现在累计交易量为: ${count.toFixed(2)}🤪🤪\n\n`;
          // 自动滚动到底部
          setTimeout(() => {
            if (printInfoRef.current) {
              printInfoRef.current.scrollTop = printInfoRef.current.scrollHeight;
            }
          }, 100);
          return newInfo;
        });

        // 更新id, 然后继续调用
        fromId = lastElement.f + 1;
      } else {
        setPrintInfo(prev => {
          const newInfo = prev + `[${currentTime}] 🤪🤪🤪最新数据不足100条, 暂不打印, 休眠1分钟后继续统计🤪🤪🤪\n`;
          // 自动滚动到底部
          setTimeout(() => {
            if (printInfoRef.current) {
              printInfoRef.current.scrollTop = printInfoRef.current.scrollHeight;
            }
          }, 100);
          return newInfo;
        });
        await new Promise(resolve => setTimeout(resolve, 60000));
      }
      // } catch (error) {
      //   setPrintInfo(prev => {
      //     console.log(error);
      //     const newInfo = prev + `[${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false })}] 🤪🤪🤪最新数据不足100条, 或者币安api访问限流, 请更换梯子或者稍后即将打印, 请不要关闭页面🤪🤪🤪\n`;
      //     // 自动滚动到底部
      //     setTimeout(() => {
      //       if (printInfoRef.current) {
      //         printInfoRef.current.scrollTop = printInfoRef.current.scrollHeight;
      //       }
      //     }, 100);
      //     return newInfo;
      //   });
      //   await new Promise(resolve => setTimeout(resolve, 60000));
      // }
    }
  }

  function getToday8AMTimestamp() {
    // 1. 获取当前时间（UTC）
    const now = new Date();

    // 2. 转换为北京时间（UTC+8）
    const beijingTime = new Date(now.getTime() + 8 * 3600 * 1000);

    // 3. 设置时间为8:00:00
    beijingTime.setHours(8, 0, 0, 0);

    // 4. 转换回UTC时间戳
    return beijingTime.getTime();
  }

  //* 选择栏目前先将所有的设置为false
  const allIsFalse = () => {
    setAlphaButton(false);
    setOkxButton(false);
    setTradeVolumeButton(false);
  }

  //* 选择栏目时 检验栏目
  const checkColumn = (newColumn) => {
    let oldColumn = column;
    console.log(`旧的是 ${oldColumn}`);
    console.log(`新的是 ${newColumn}`);
    if (addresses.length != 0) {
      if (oldColumn === newColumn) {
        return;
      } else {
        setInputValue('');
        setAddresses([]);
        setShowTable(false); // 清空数据后重新显示输入框
        setPrivateKeyValue();
        setSelectedItems(new Set()); // 清空选择
      }
    }
  }

  function sleepRandomTime() {
    const randomTime = Math.floor(Math.random() * (35000 - 30000 + 1)) + 30000; // 随机生成30到35秒的时间（单位为毫秒）
    console.log(`睡眠时间: ${randomTime / 1000}秒`);
    return new Promise(resolve => setTimeout(() => resolve(randomTime), randomTime));
  }


  // 开始监控函数
  const startMonitoring = async () => {
    setIsMonitoring(true);
    setPrintInfo("开始监控OKX TGE直通车活动...\n");

    // 自动滚动到底部
    setTimeout(() => {
      if (printInfoRef.current) {
        printInfoRef.current.scrollTop = printInfoRef.current.scrollHeight;
      }
    }, 100);

    let array = [
      'Aspecta DEX 交易老用户任务',
      'Aspecta 限时交易任务',
      'RCADE 社区福利 - TGE 优先参与活动',
      '$RCADE TGE 优先参与资格',
      'SOON TGE Early Access'
    ]
    while (true) {
      try {
        const currentTime = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false });

        // setPrintInfo(prev => prev + `[${currentTime}] 开始发送请求...\n`);

        // 尝试使用CORS代理
        let result = await fetch("https://api.allorigins.win/raw?url=https://web3.okx.com/zh-hans/cryptopedia/event/unlocktge", {
          "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          },
          "method": "GET",
          "mode": "cors",
          "credentials": "omit"
        });

        // setPrintInfo(prev => prev + `[${currentTime}] 请求状态: ${result.status}\n`);
        // console.log("请求状态:", result.status);

        if (!result.ok) {
          throw new Error(`HTTP error! status: ${result.status}`);
        }

        let text = await result.text();
        // console.log(text);

        // setPrintInfo(prev => prev + `[${currentTime}] 获取到响应，长度: ${text.length}\n`);

        // 使用浏览器原生的DOMParser解析HTML内容
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const elements = doc.querySelectorAll('.nft-ellipsis.index_ellipsis-native__AbHjd.index_dapp-title__vEaXe');
        const results = Array.from(elements).map(el => {
          const span = el.querySelector('span');
          return span?.textContent.trim();
        });

        const logMessage = `[${currentTime}] 正在监控OKX TGE直通车的网页\n[${currentTime}] 捕捉的活动为:\n<span style="color: #10b981;">${JSON.stringify(results, null, 2)}</span>\n`;

        setPrintInfo(prev => {
          const newInfo = prev + logMessage;
          // 自动滚动到底部
          setTimeout(() => {
            if (printInfoRef.current) {
              printInfoRef.current.scrollTop = printInfoRef.current.scrollHeight;
            }
          }, 100);
          return newInfo;
        });

        // console.log("正在监控OKX TGE直通车的网页");
        // console.log("捕捉的活动为: ", results);

        const sleepTime = Math.floor(Math.random() * (35000 - 30000 + 1)) + 30000; // 随机生成30到35秒的时间（单位为毫秒）
        const sleepMessage = `[${currentTime}] 睡眠时间: ${(sleepTime / 1000).toFixed(3)}秒\n`;
        setPrintInfo(prev => {
          const newInfo = prev + sleepMessage;
          // 自动滚动到底部
          setTimeout(() => {
            if (printInfoRef.current) {
              printInfoRef.current.scrollTop = printInfoRef.current.scrollHeight;
            }
          }, 100);
          return newInfo;
        });

        await new Promise(resolve => setTimeout(resolve, sleepTime));

        results.forEach(result => {
          if (array.includes(result)) {
            // console.log("包含: ", result);
          } else {
            const newActivityMessage = `[${currentTime}] 原有活动不包含: ${result}\n`;
            setPrintInfo(prev => {
              const newInfo = prev + newActivityMessage;
              // 自动滚动到底部
              setTimeout(() => {
                if (printInfoRef.current) {
                  printInfoRef.current.scrollTop = printInfoRef.current.scrollHeight;
                }
              }, 100);
              return newInfo;
            });
            console.log("原有活动不包含: ", result);
            console.log(`监控时间: ${currentTime}`);
          }
        });

      } catch (error) {
        const errorTime = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false });
        console.log(error);

        const errorMessage = `[${errorTime}] 错误: 🤪🤪🤪出错了, 欧意封IP了, 请更换节点或者稍后再试🤪🤪🤪\n`;
        setPrintInfo(prev => {
          const newInfo = prev + errorMessage;
          // 自动滚动到底部
          setTimeout(() => {
            if (printInfoRef.current) {
              printInfoRef.current.scrollTop = printInfoRef.current.scrollHeight;
            }
          }, 100);
          return newInfo;
        });
        console.log(error);
        console.log(`失败了`);
        await sleepRandomTime();
      }
    }
  };



  //* 生成随机ip
  function generateRandomIP() {
    return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
  }

  //* 效验时间是否正确
  function isValidDateFormat(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;

    // 进一步验证日期有效性
    const date = new Date(dateString);
    return !isNaN(date.getTime()) &&
      dateString === date.toISOString().split('T')[0];
  }

  const selectAlpha = async () => {

    // const date = "2025-08-11"; // 示例日期
    // const address = "0xf0956b90724Db297759dD87d836bE9B4B0B7675d";

    // const response = await fetch(
    //   `/api/etherscan?date=${date}&address=${address}`
    // );
    // const result = await response.json();
    // console.log(result);
    notAddresses();
    if (!date) {
      setNotification({ message: 'error: 请填写时间', type: "error" });
      hideNotification();
      return;
    }
    if (!isValidDateFormat(date)) {
      setNotification({ message: 'error: 请填写正确格式的时间', type: "error" });
      hideNotification();
      return;
    }


    // 日期转时间戳
    const dateToTimestamp = (dateStr) => {
      return Math.floor(new Date(dateStr).getTime() / 1000);
    };
    const startTimestamp = dateToTimestamp(date);
    console.log("Timestamp:", startTimestamp);
    // const endTimestamp = startTimestamp + 86400;
    // console.log("End Timestamp:", endTimestamp);

    const bnbResponse = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT');
    const data = await bnbResponse.json();
    console.log(data.price);

    const blockData = await fetch(
      `/api/getBlock?startTimestamp=${startTimestamp}`
      //  `/api/getBlock?startTimestamp=${startTimestamp}&endTimestamp=${endTimestamp}`
    );
    const blockDataResult = await blockData.json();
    console.log(blockDataResult);

    // 构造所有请求的 Promise
    const fetchPromises = addresses.map(async (address, index) => {
      const myAddress = address.address.toLowerCase();
      // usdt损耗
      let usdtValue = 0;
      // 交易量
      let totalValue = 0;
      // bnb损耗
      let totalBNB = 0;
      return fetch(`/api/etherscan?startBlock=${blockDataResult.startBlock}&endBlock=latest&address=${myAddress}`, {
      })
        .then(async resultText => {
          const response = await resultText.json();
          console.log("Full API Response:", response);
          const result = response.result;
          console.log("Result array:", result);
          console.log("Result length:", result ? result.length : 0);

          result.forEach(element => {
if (element.timeStamp < endTimestamp) {
            // 买入 
            if (element.from == myAddress && element.to == "0xb300000b72deaeb607a12d5f54773d1c19c7028d") {
              let value = element.value / 10 ** 18;;
              totalValue += value;
              usdtValue -= value;
              totalBNB += (element.gasPrice * element.gasUsed) / 10 ** 18;
            }
            // 卖出
            if (element.from == "0xb300000b72deaeb607a12d5f54773d1c19c7028d" && element.to == myAddress) {
              usdtValue += element.value / 10 ** 18;
              totalBNB += (element.gasPrice * element.gasUsed) / 10 ** 18;
            }
}
          });

          let bnbToUsdt = (totalBNB * parseFloat(data.price)).toFixed(2);
          let score = getScore(totalValue);
          let total = (parseFloat(usdtValue.toFixed(2)) + parseFloat(bnbToUsdt)).toFixed(2);
          console.log(total, score, bnbToUsdt, usdtValue);

          return {
            index,
            totalValue: totalValue.toFixed(2) != "NaN" ? totalValue.toFixed(2) : 0,
            score: score != 0 ? score + 1 : 0,
            bnbToUsdt: bnbToUsdt != "NaN" ? "-" + bnbToUsdt : 0,
            usdt: usdtValue.toFixed(2) != "NaN" ? usdtValue.toFixed(2) : 0,
            totalUsdt: total != "NaN" ? total : 0,
            message: resultText.status === 200 ? "查询成功" : "查询失败"
          };
        })
        .catch(() => ({
          index,
          message: "查询失败"
        }));
    });

    // 并发请求
    const results = await Promise.all(fetchPromises);

    // 批量更新 addresses
    setAddresses(prevAddresses => {
      const updated = [...prevAddresses];
      results.forEach(res => {
        if (updated[res.index]) {
          updated[res.index] = { ...updated[res.index], ...res };
        }
      });
      return updated;
    });
  }

  const goToTwitter = () => {
    // 在新标签页打开关注链接
    window.open(
      "https://x.com/intent/follow?screen_name=0x_lgs",
      "_blank"
    );

    // 检查窗口是否成功打开
    // if (twitterWindow) {
    //   // 无论如何，3秒后设置状态为false（备选方案）
    //   setTimeout(() => {
    //     setGoToTwitterIsOpen(false);
    //   }, 1000);
    // } else {
    //   // 如果弹窗被阻止，直接设置状态
    //   setGoToTwitterIsOpen(false);
    // }
  };


  function getScore(value) {
    if (value <= 0) return 0;

    // 处理小于2的情况
    if (value < 2) return 0;

    // 计算最接近的2的幂次方
    let power = Math.floor(Math.log2(value));

    // 确保不超过15分
    return Math.min(power, 100);
  }

  return (
    <div>
      <div className="mt-4 md:mt-10 w-[95%] md:w-[80%] mx-auto px-2 md:px-0">
        <div className="overflow-x-auto bg-white dark:bg-neutral-700">

          {/* 栏目显示*/}
          {column && <div className="flex items-center justify-center">
            <div className="text-xl md:text-3xl font-bold text-blue-600 text-center px-2">当前项目: {column}</div>
          </div>}

          <div className="relative m-[2px] mb-3 flex flex-col md:flex-row justify-between items-start md:items-center mt-3 gap-2 md:gap-0">
            <div className="flex flex-wrap gap-2 md:space-x-2">

              {alphaButton &&
                <div className="flex flex-wrap gap-2 md:space-x-2">
                  <button className="btn btn-outline btn-error" onClick={handleClearProducts}>清除数据</button>
                  <button className="btn btn-outline" onClick={selectAll}>选中所有</button>
                  <button className="btn btn-outline btn-accent" onClick={reverseSelection}>反选数据</button>
                  <button className="btn btn-outline btn-primary" onClick={reverse}>账号反转</button>
                </div>
              }
              <div class="dropdown">
                <button className="btn btn-outline btn-secondary">选择项目</button>
                <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-[1] w-56 p-2 shadow">
                  <button className="btn btn-outline btn-accent mt-1" onClick={setColumnForAlpha}>alpha查询损耗</button>
                  <button className="btn btn-outline btn-primary mt-1" onClick={setColumnForOkx}>监控OKX TGE直通车网页</button>
                  {/* <button className="btn btn-outline btn-secondary mt-1" onClick={setColumnForTradeVolume}>币安alpha限价交易量</button> */}
                </ul>

              </div>


              {alphaButton &&
                <div className="flex flex-col md:flex-row gap-2 md:space-x-2">
                  <button className="btn btn-outline btn-secondary" onClick={selectAlpha}>查询</button>
                  <input
                    type="date"
                    value={date || ""}
                    onChange={e => setDate(e.target.value)}
                    className="outline-none border-2 border-sky-200 h-[48px] w-full md:w-[200px] p-3 rounded-md text-base"
                  />
                </div>


              }

              {okxButton &&
                <div className="flex space-x-2">
                  <button className="btn btn-outline btn-secondary" onClick={startMonitoring}>开始监控</button>
                </div>
              }

              {tradeVolumeButton && column === '币安alpha限价交易量' && (
                <div className="flex flex-col md:flex-row gap-2 md:space-x-2">
                  <button className="btn btn-outline btn-secondary" onClick={selectTradeVolume}>查询交易量</button>
                  <div className="relative w-full md:w-[250px]">
                    <input
                      type="text"
                      className="input input-bordered w-full border-orange-400 focus:border-orange-500"
                      placeholder="搜索币种symbol"
                      value={searchSymbol}
                      onChange={handleSearchSymbol}
                      onFocus={() => {
                        // 聚焦时清空搜索框和下拉列表
                        setSearchSymbol("");
                        setSelectedSymbol("");
                        setFilteredTokenList([]);
                      }}
                    />
                    {searchSymbol && (
                      <ul className="absolute z-10 bg-white border w-full max-h-60 overflow-y-auto shadow-lg  rounded-xl">
                        {filteredTokenList.map(item => (
                          <li
                            key={item.symbol}
                            className={`p-2 cursor-pointer hover:bg-blue-100 ${item.symbol === selectedSymbol ? 'bg-blue-200' : ''}`}
                            onClick={() => handleSelectSymbol(item.symbol)}
                          >
                            {item.symbol}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}


            </div>
          </div>

          {!showTable && column !== 'OKX TGE直通车活动' && column !== '币安alpha限价交易量' && (
            <form onSubmit={handleSubmit} className="mb-4">
              <div className="relative m-[2px] mb-3">
                <label htmlFor="inputSearch" className="sr-only">Input Addresses</label>
                <textarea
                  id="inputSearch"
                  value={inputValue}
                  onChange={handleInputChange}
                  rows={4}
                  style={{ height: '40vh', minHeight: '200px' }} // 设置高度为窗口的40%，最小高度200px
                  // placeholder="请输入地址私钥 或者 账号密码, 中间都以 ---- 分隔"
                  placeholder="请输入 地址----备注, 可以将自己的地址存入记事本"
                  className="block w-full mt-5 rounded-lg border dark:border-none dark:bg-neutral-600 p-2 text-base md:text-2xl focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
              <button type="submit" className="btn btn-outline btn-accent w-full">提交</button>
            </form>
          )}

          {!showTable && column === 'OKX TGE直通车活动' && (
            <div className="mb-4">
              <div className="relative m-[2px] mb-3">
                <label htmlFor="inputSearch" className="sr-only">Print Information</label>
                <div
                  ref={printInfoRef}
                  style={{
                    height: 'calc(100vh - 250px)', // 从按钮下面到设备底部往上一点点
                    marginTop: '10px',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    backgroundColor: '#374151',
                    color: 'white',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word'
                  }}
                  dangerouslySetInnerHTML={{
                    __html: printInfo
                      .replace(/\[([^\]]+)\] 正在监控OKX TGE直通车的网页/g, '<span style="color: #60a5fa;">[$1] 正在监控OKX TGE直通车的网页</span>')
                      .replace(/\[([^\]]+)\] 捕捉的活动为:/g, '<span style="color: #f97316;">[$1] 捕捉的活动为:</span>')
                      .replace(/\[([^\]]+)\] 睡眠时间: ([0-9.]+)秒/g, '<span style="color: #60a5fa;">[$1] 睡眠时间: $2秒</span>')
                      .replace(/\[([^\]]+)\] 原有活动不包含: ([^\n]+)/g, '<span style="color: #ef4444;">[$1] 原有活动不包含: $2</span>')
                      .replace(/\[([^\]]+)\] 错误: ([^\n]+)/g, '<span style="color: #ef4444;">[$1] 错误: $2</span>')
                      .replace(/\[([^\]]+)\] 开始监控OKX TGE直通车活动\.\.\./g, '<span style="color: #10b981;">[$1] 开始监控OKX TGE直通车活动...</span>')
                      .replace(/\[([^\]]+)\] 监控已停止/g, '<span style="color: #f59e0b;">[$1] 监控已停止</span>')
                      .replace(/\[([^\]]+)\] 捕捉的活动为:/g, '<span style="color: #f97316;">[$1] 捕捉的活动为:</span>')
                  }}
                />
              </div>
            </div>
          )}

          {!showTable && column === '币安alpha限价交易量' && (
            <div className="mb-4">
              <div className="relative m-[2px] mb-3">
                <label htmlFor="inputSearch" className="sr-only">Display Information</label>
                <div
                  ref={printInfoRef}
                  style={{
                    height: 'calc(100vh - 250px)', // 从按钮下面到设备底部往上一点点
                    marginTop: '10px',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    backgroundColor: '#374151',
                    color: 'white',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word'
                  }}
                  dangerouslySetInnerHTML={{
                    __html: printInfo
                      .replace(/\[([^\]]+)\] 正在监控OKX TGE直通车的网页/g, '<span style="color: #60a5fa;">[$1] 正在监控OKX TGE直通车的网页</span>')
                      .replace(/\[([^\]]+)\] 捕捉的活动为:/g, '<span style="color: #f97316;">[$1] 捕捉的活动为:</span>')
                      .replace(/\[([^\]]+)\] 睡眠时间: ([0-9.]+)秒/g, '<span style="color: #60a5fa;">[$1] 睡眠时间: $2秒</span>')
                      .replace(/\[([^\]]+)\] 原有活动不包含: ([^\n]+)/g, '<span style="color: #ef4444;">[$1] 原有活动不包含: $2</span>')
                      .replace(/\[([^\]]+)\] 错误: ([^\n]+)/g, '<span style="color: #ef4444;">[$1] 错误: $2</span>')
                      .replace(/\[([^\]]+)\] 开始监控OKX TGE直通车活动\.\.\./g, '<span style="color: #10b981;">[$1] 开始监控OKX TGE直通车活动...</span>')
                      .replace(/\[([^\]]+)\] 监控已停止/g, '<span style="color: #f59e0b;">[$1] 监控已停止</span>')
                      .replace(/\[([^\]]+)\] 捕捉的活动为:/g, '<span style="color: #f97316;">[$1] 捕捉的活动为:</span>')
                  }}
                />
              </div>
            </div>
          )}

          {showTable && ('alpha' === column) && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs md:text-sm whitespace-nowrap">
                {/* Table head */}
                <thead className="uppercase tracking-wider border-b-2 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800">
                  <tr>
                    <th scope="col" className="pl-2 md:pl-4 py-2 md:py-4 text-center">选择</th>
                    <th scope="col" className="py-2 md:py-4 text-center">序号</th>
                    <th scope="col" className="py-2 md:py-4 text-center">钱包地址</th>
                    <th scope="col" className="py-2 md:py-4 text-center">备注</th>
                    <th scope="col" className="px-2 md:px-6 py-2 md:py-4 text-center">交易量</th>
                    <th scope="col" className="px-2 md:px-6 py-2 md:py-4 text-center">得分</th>
                    <th scope="col" className="px-2 md:px-6 py-2 md:py-4 text-center">bnb损耗(usdt)</th>
                    <th scope="col" className="px-2 md:px-6 py-2 md:py-4 text-center">usdt损耗</th>
                    <th scope="col" className="px-2 md:px-6 py-2 md:py-4 text-center">总共损耗(usdt)</th>
                    <th scope="col" className="px-2 md:px-6 py-2 md:py-4 text-center">提示信息</th>
                  </tr>
                </thead>

                {/* Table body */}
                <tbody>
                  {addresses.map((item, index) => (
                    <tr key={index} className={`border-b dark:border-neutral-600 ${index % 2 === 0 ? 'bg-neutral-50 dark:bg-neutral-800' : ''}`}>
                      <td className="pl-2 md:pl-5 py-2 md:py-4 text-center">
                        <input
                          type="checkbox"
                          name="addressSelect"
                          value={item.address}
                          checked={selectedItems.has(item.id)}
                          onChange={() => handleCheckboxChange(item.id)}
                          className="mx-auto" // 使复选框也居中（可选）
                        />
                      </td>
                      <td className="py-2 md:py-4 text-center">{item.id}</td>
                      <th scope="row" className="py-2 md:py-4 text-center text-xs md:text-sm">{item.address}</th>
                      <td className="px-2 md:px-6 py-2 md:py-4 text-center">{item.mark}</td>
                      <td className="px-2 md:px-6 py-2 md:py-4 text-center text-green-500">{item.totalValue}</td>
                      <td className="px-2 md:px-6 py-2 md:py-4 text-center">
                        <div
                          className="inline-flex items-center justify-center rounded-full bg-orange-100 text-orange-500 font-bold text-xs md:text-sm px-2 md:px-3 py-1"
                          style={{
                            minWidth: '20px',
                            width: `${Math.max(20, Math.min(50, 20 + (item.score || 0) * 1.2))}px`
                          }}
                        >
                          {item.score}
                        </div>
                      </td>
                      <td className="px-2 md:px-6 py-2 md:py-4 text-center">
                        <div
                          className="inline-flex items-center justify-center rounded-full bg-pink-100 text-pink-500 font-bold text-xs md:text-sm px-3 md:px-6 py-1"
                          style={{
                            minWidth: '20px',
                            width: `${Math.max(20, Math.min(60, 20 + Math.abs(parseFloat(item.bnbToUsdt) || 0) * 3))}px`
                          }}
                        >
                          {item.bnbToUsdt}
                        </div>
                      </td>
                      <td className="px-2 md:px-6 py-2 md:py-4 text-center">
                        <div
                          className="inline-flex items-center justify-center rounded-full bg-pink-100 text-pink-500 font-bold text-xs md:text-sm px-3 md:px-6 py-1"
                          style={{
                            minWidth: '20px',
                            width: `${Math.max(20, Math.min(60, 20 + Math.abs(parseFloat(item.usdt) || 0) * 3))}px`
                          }}
                        >
                          {item.usdt}
                        </div>
                      </td>
                      <td className="px-2 md:px-6 py-2 md:py-4 text-center">
                        <div
                          className="inline-flex items-center justify-center rounded-full bg-red-100 text-red-500 font-bold text-xs md:text-sm px-3 md:px-6 py-1"
                          style={{
                            minWidth: '20px',
                            width: `${Math.max(20, Math.min(60, 20 + Math.abs(parseFloat(item.totalUsdt) || 0) * 3))}px`
                          }}
                        >
                          {item.totalUsdt}
                        </div>
                      </td>
                      {/* <td className="px-6 py-4 text-center">{item.bnbToUsdt}</td>
                    <td className="px-6 py-4 text-center">{item.usdt}</td>
                    <td className="px-6 py-4 text-center">{item.totalUsdt}</td> */}
                      <td className={`px-2 md:px-6 py-2 md:py-4 text-center text-xs md:text-sm ${item.message && item.message.includes('成功') ? 'text-green-500' : item.message && item.message.includes('失败') ? 'text-red-500' : ''}`}>
                        {item.message}
                      </td>
                    </tr>
                  ))}

                  {/* 汇总行 */}
                  {addresses.length > 0 && (
                    <tr className="border-t-4 border-blue-100 bg-blue-50 dark:bg-blue-900 dark:border-blue-200">
                      <td className="pl-2 md:pl-5 py-2 md:py-4 text-center font-bold text-blue-600 dark:text-blue-300 text-xs md:text-sm">-</td>
                      <td className="py-2 md:py-4 text-center font-bold text-blue-600 dark:text-blue-300 text-xs md:text-sm">-</td>
                      <td className="py-2 md:py-4 text-center font-bold text-blue-600 dark:text-blue-300 text-xs md:text-sm">汇总结果</td>
                      <td className="px-2 md:px-6 py-2 md:py-4 text-center font-bold text-blue-600 dark:text-blue-300 text-xs md:text-sm">-</td>
                      <td className="px-2 md:px-6 py-2 md:py-4 text-center font-bold text-green-600 dark:text-green-300 text-xs md:text-sm">
                        {/* {addresses.reduce((sum, item) => sum + (parseFloat(item.totalValue) || 0), 0).toFixed(2)} */}-
                      </td>
                      <td className="px-2 md:px-6 py-2 md:py-4 text-center font-bold text-orange-600 dark:text-orange-300 text-xs md:text-sm">
                        {/* {addresses.reduce((sum, item) => sum + (parseInt(item.score) || 0), 0)} */}-
                      </td>
                      <td className="px-2 md:px-6 py-2 md:py-4 text-center font-bold text-pink-600 dark:text-pink-300 text-xs md:text-sm">
                        {addresses.reduce((sum, item) => sum + (parseFloat(item.bnbToUsdt) || 0), 0).toFixed(2)}
                      </td>
                      <td className="px-2 md:px-6 py-2 md:py-4 text-center font-bold text-pink-600 dark:text-pink-300 text-xs md:text-sm">
                        {addresses.reduce((sum, item) => sum + (parseFloat(item.usdt) || 0), 0).toFixed(2)}
                      </td>
                      <td className="px-2 md:px-6 py-2 md:py-4 text-center font-bold text-red-600 dark:text-red-300 text-xs md:text-sm">
                        {addresses.reduce((sum, item) => sum + (parseFloat(item.totalUsdt) || 0), 0).toFixed(2)}
                      </td>
                      <td className="px-2 md:px-6 py-2 md:py-4 text-center font-bold text-blue-600 dark:text-blue-300 text-xs md:text-sm">-</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}



          {goToTwitterIsOpen && (
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
              <div className="flex flex-col items-center border-2 border-sky-100 rounded-2xl w-[400px] shadow-[2px_2px_0px_1px_#E99F4C] p-10 bg-white">
                <p className="text-[#264143] font-bold text-2xl sm:mt-5">还请老板点个免费推特关注</p>
                {/* <p className="text-[#264143] font-bold text-xl sm:mt-5">https://x.com/intent/follow?screen_name=0x_daming</p> */}
                <button
                  className="bg-blue-200 rounded-lg font-bold text-base py-3 mt-5 w-[93px] sm:w-[140px] shadow-[2px_2px_0px_0px_#E99F4C] transition-transform transform focus:translate-y-[4px] focus:shadow-[1px_2px_0px_0px_#E99F4C] hover:opacity-90 ml-3"
                  onClick={goToTwitter}
                >
                  去关注
                </button>
              </div>


            </div>
          )}


          {/** 右上角按钮和提示消息 */}
          <div className="fixed top-2 md:top-4 right-2 md:right-4 flex flex-col space-y-2 z-50">
            <button
              onClick={() => goToTwitter()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-2 md:px-4 py-1 md:py-2 rounded-md font-bold transition-colors duration-300 shadow-lg text-xs md:text-sm"
            >
              关注作者，免费使用更多工具
            </button>

            {notification.message && (
              <div
                className={`px-2 md:px-4 py-1 md:py-2 rounded-md text-white font-bold transition-opacity duration-300 text-xs md:text-sm ${notification.type === "success" ? "bg-green-500" : "bg-red-500"}`}
              >
                {notification.message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
