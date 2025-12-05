// 背景脚本 - 处理历史记录跟踪逻辑
const maxUrlsPerHost = 10;

// 存储结构: { [host]: [{url, title, lastVisitTime}] }
// 存储结构: [{"domain", visits: [{url, title, lastVisitTime}], lastVisitTIme}]
let historyData = {};

// 从storage加载历史数据
async function loadHistoryData() {
  const result = await chrome.storage.local.get(['historyData']);
  historyData = result.historyData || {};
}

// 保存历史数据到storage
async function saveHistoryData() {
  await chrome.storage.local.set({ historyData });
}

// 初始化
loadHistoryData();

// 监听历史记录变化
chrome.history.onVisited.addListener(async (historyItem) => {
  console.log("执行历史记录变化监听事件", historyData);
  const url = new URL(historyItem.url);
  const host = url.host;
  
  if (!historyData[host]) {
    historyData[host] = [];
  }
  
  // 检查是否已存在相同URL
  const existingIndex = historyData[host].findIndex(item => item.url === historyItem.url);
  
  if (existingIndex !== -1) {
    // 更新已存在的URL
    historyData[host][existingIndex] = {
      url: historyItem.url,
      title: historyItem.title || 'No title',
      lastVisitTime: historyItem.lastVisitTime
    };
  } else {
    // 添加新URL
    historyData[host].unshift({
      url: historyItem.url,
      title: historyItem.title || 'No title',
      lastVisitTime: historyItem.lastVisitTime
    });
    
    // 限制每个host最多存储10个URL
    if (historyData[host].length > maxUrlsPerHost) {
      historyData[host] = historyData[host].slice(0, maxUrlsPerHost);
    }
  }
  
  // 按访问时间排序
  historyData[host].sort((a, b) => b.lastVisitTime - a.lastVisitTime);
  
  await saveHistoryData();
});

// 监听历史记录删除事件
chrome.history.onVisitRemoved.addListener(async (removedItem) => {
  // 重新加载历史数据来同步
  await loadHistoryData();
});

// 提供API给popup页面获取数据
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getHistoryData') {
    sendResponse({ historyData });
  }
  return true; // 保持消息通道开放
});


chrome.runtime.onInstalled.addListener(() => {
  console.log('扩展插件已安装');
});