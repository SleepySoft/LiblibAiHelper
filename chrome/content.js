// content.js
'use strict';

// Create a MutationObserver to monitor DOM changes
var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
            var generateButton = document.querySelector('.ModelActionCard_runPic__0I9wi');
            if (generateButton && !document.querySelector('.one-click-download')) {
                var downloadButton = document.createElement('div');
                downloadButton.innerHTML = '一键下载';
                downloadButton.className = 'one-click-download';
                downloadButton.onclick = autoDownload;
                generateButton.parentNode.insertBefore(downloadButton, generateButton.nextSibling);
                observer.disconnect();
            }
        }
    });
});

observer.observe(document.body, { childList: true, subtree: true });

function autoDownload() {
    var version = getSelectedTabName();
    var modelName = document.querySelector('.ModelInfoHead_title__p5txd').innerText;

    modelName += "_" + version

    downloadModel();
    saveAsHTML(modelName);
    // saveAsMarkdown(modelName);
    saveAsPlainText(modelName);
    downloadImages(modelName)
}

function getSelectedTabName() {
    // 获取所有的tab
    var tabs = document.querySelectorAll('.ant-tabs-tab');

    // 遍历所有的tab
    for (var i = 0; i < tabs.length; i++) {
        // 检查tab是否被选中
        if (tabs[i].classList.contains('ant-tabs-tab-active')) {
            // 获取tab的标题
            var title = tabs[i].textContent;
            return title;  // 返回标题
        }
    }
}

function downloadModel() {
    var downloadButton = document.querySelector('.ModelActionCard_inner__XBdzk');
    if (downloadButton) {
        downloadButton.click();
    }
}

function selectReadme() {
    var mainElement = document.querySelector('.mantine-AppShell-main');
    return mainElement.querySelector('[class^="ModelDescription_desc"]');
}

// content.js
function saveAsHTML(modelName) {
    var descriptionElement = selectReadme();
    if (descriptionElement) {
        var htmlText = descriptionElement.innerHTML;
        var blob = new Blob([htmlText], {type: 'text/html'});
        var url = window.URL.createObjectURL(blob);
        chrome.runtime.sendMessage({action: "download", url: url, filename: modelName + '.html'});
    } else {
        console.log('Description element not found.');
    }
}

// content.js
'use strict';

function saveAsMarkdown(modelName) {
    var descriptionElement = selectReadme();
    if (descriptionElement) {
        var markdownText = convertHtmlToMarkdown(descriptionElement.innerHTML);
        var blob = new Blob([markdownText], {type: 'text/markdown'});
        var url = window.URL.createObjectURL(blob);
        chrome.runtime.sendMessage({action: "download", url: url, filename: modelName + '.md'});
    } else {
        console.log('Description element not found.');
    }
}

function saveAsPlainText(modelName) {
    var descriptionElement = selectReadme();
    if (descriptionElement) {
        var plainText = descriptionElement.innerText;
        var blob = new Blob([plainText], {type: 'text/plain'});
        var url = window.URL.createObjectURL(blob);
        chrome.runtime.sendMessage({action: "download", url: url, filename: modelName + '.txt'});
    } else {
        console.log('Description element not found.');
    }
}

async function downloadImages(modelName) {
    var images = document.querySelectorAll('img');
    var count = 0;  // 添加一个新的变量来计数需要下载的图片
    if (images.length > 0) {
        for (var i = 0; i < images.length; i++) {
            // 只处理src属性是URL的img元素
            if (images[i].src.startsWith('http')) {
                var response = await fetch(images[i].src);
                var blob = await response.blob();
                var url = window.URL.createObjectURL(blob);
                chrome.runtime.sendMessage({action: "download", url: url, filename: modelName + (count === 0 ? '' : '_preview_' + count) + '.png'});
                count++;  // 每下载一张图片，就增加count的值
            }
        }
    }
}

function convertHtmlToMarkdown(html) {
    // This is a very basic implementation and might not work for all HTML.
    // Consider using a library like Turndown for a more robust solution.
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.innerText;
}


