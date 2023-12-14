// content.js
'use strict';

function convertHtmlToMarkdown(html) {
    // This is a very basic implementation and might not work for all HTML.
    // Consider using a library like Turndown for a more robust solution.
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.innerText;
}

function getSelectedTabName() {
	// 获取所有的tab
	var tabs = document.querySelectorAll('.ant-tabs-tab');

	// 遍历所有的tab
	for (var i = 0; i < tabs.length; i++) {
		// 获取aria-selected属性
		var isSelected = tabs[i].querySelector('.ant-tabs-tab-btn').getAttribute('aria-selected');

		// 检查tab是否被选中
		if (isSelected === 'true') {
			// 获取tab的标题
			var title = tabs[i].textContent;
			return title;  // 返回标题
		}
	}
}

function getModelName() {
    var version = getSelectedTabName();
    var modelName = document.querySelector('.ModelInfoHead_title__p5txd').innerText;
    modelName += "_" + version;
    return modelName;
}

// Create a MutationObserver to monitor DOM changes
var observer = new MutationObserver(function(mutations) {
	mutations.forEach(function(mutation) {
		if (mutation.type === 'childList') {
			var generateButton = document.querySelector('.ModelActionCard_runPic__0I9wi');
			if (generateButton && !document.querySelector('.one-click-download')) {
			
				var downloadButton = document.createElement('button');
				downloadButton.innerHTML = '一键下载';
				downloadButton.className = 'one-click-download';
				downloadButton.onclick = autoDownload;
				
				// 创建"仅下载图片"按钮
				var downloadImageButton = document.createElement('button');
				downloadImageButton.innerHTML = '仅下载图片';
				downloadImageButton.className = 'download-images-only';
				downloadImageButton.style = 'margin-left: 10px; display: inline-block;';
				downloadImageButton.onclick = function() {
					var modelName = getModelName();
					var imageCount = document.querySelector('.image-count-selector').value;
					downloadImages(modelName, imageCount);
				};

				// 创建"仅下载文档"按钮
				var downloadDocButton = document.createElement('button');
				downloadDocButton.innerHTML = '仅下载文档';
				downloadDocButton.className = 'download-doc-only';
				downloadDocButton.style = 'margin-left: 10px; display: inline-block;';
				downloadDocButton.onclick = function() {
					var modelName = getModelName();
					recordURL(modelName);
					saveAsHTML(modelName);
					// saveAsMarkdown(modelName);
					saveAsPlainText(modelName);
				};

				// 创建图片数量选择器
				var imageCountSelector = document.createElement('input');
				imageCountSelector.type = 'number';
				imageCountSelector.min = '1';
				imageCountSelector.value = '10';  // 默认值为10
				imageCountSelector.className = 'image-count-selector';
				imageCountSelector.style = 'margin-left: 10px; display: inline-block;';

				// 将新的按钮和选择器添加到页面上
				generateButton.parentNode.insertBefore(downloadButton, generateButton.nextSibling);
				generateButton.parentNode.insertBefore(downloadImageButton, downloadButton.nextSibling);
				generateButton.parentNode.insertBefore(downloadDocButton, downloadImageButton.nextSibling);
				generateButton.parentNode.insertBefore(imageCountSelector, downloadImageButton.nextSibling);
				
				observer.disconnect();
			}
		}
	});
});

observer.observe(document.body, { childList: true, subtree: true });

function autoDownload() {
    var modelName = getModelName();

    downloadModel();
    
    recordURL(modelName);
    saveAsHTML(modelName);
    // saveAsMarkdown(modelName);
    saveAsPlainText(modelName);
    
    var imageCount = document.querySelector('.image-count-selector').value;
    downloadImages(modelName, imageCount);
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

function recordURL(modelName) {
    var url = window.location.href;
    chrome.runtime.sendMessage({action: "recordURL", url: url, filename: modelName + '_URL.txt'});
}

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

async function downloadImages(modelName, maxImages) {
    var images = document.querySelectorAll('img');
    var count = 0;
    if (images.length > 0) {
        for (var i = 0; i < images.length && count < maxImages; i++) {
            if (images[i].src.startsWith('https://liblibai-online.vibrou.com/img/')) {
                var url = new URL(images[i].src);
                var cleanUrl = url.protocol + "//" + url.hostname + url.pathname;
                chrome.runtime.sendMessage({action: "download", url: cleanUrl, filename: modelName + (count === 0 ? '' : '_preview_' + count) + '.png'});
                count++;
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }
}

