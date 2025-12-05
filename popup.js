document.addEventListener('DOMContentLoaded', () => {
    const linkContainer = document.getElementById('linkContainer');
    linkContainer.innerHTML = ''; // 清空加载中消息

    // 从 chrome.storage.local 获取数据
    chrome.storage.local.get(['historyData'], (data) => {
        const hostLinks = data.historyData || [];
        

        if (hostLinks.length === 0) {
            linkContainer.innerHTML = '<p class="empty-message">there have not history</p>';
            return;
        }

        hostLinks.forEach(item => {
            const doamin = item.domain;
            const links = item.visits;

            // 创建 Host 标题
            const hostHeader = document.createElement('h3');
            hostHeader.textContent = doamin;
            linkContainer.appendChild(hostHeader);

            // 创建链接列表
            const ul = document.createElement('ul');
            
            links.forEach(link => {
                const li = document.createElement('li');
                const a = document.createElement('a');

                // 使用链接的标题作为文本，URL 作为 href
                a.textContent = link.title || link.url;
                a.href = link.url;
                a.target = '_blank'; // 点击在新标签页打开
                
                // 添加 tooltip 显示完整 URL 和访问时间
                const visitDate = new Date(link.visitTime).toLocaleString();
                a.title = `URL: ${link.url}\nLast Visited: ${visitDate}`;

                li.appendChild(a);
                ul.appendChild(li);
            });

            linkContainer.appendChild(ul);
        });
    });
});