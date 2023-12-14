// background.js

// Chrome插件不支持特殊字符作为文件名，故如果文件名中包含类似"|"字符，需要将其转为下划线。

function sanitizeFilename(filename) {
    var invalidChars = [":", "\"", "?", "~", "<", ">", "*", "|"];
    var sanitizedFilename = filename;
    for (var i = 0; i < invalidChars.length; i++) {
        sanitizedFilename = sanitizedFilename.replace(new RegExp("\\" + invalidChars[i], "g"), "_");
    }
    return sanitizedFilename;
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "download" || request.action === "recordURL") {
        var sanitizedFilename = sanitizeFilename(request.filename);
        if (request.action === "download") {
            chrome.downloads.download({
                url: request.url,
                filename: sanitizedFilename
            }, function(downloadId) {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError.message);
                }
            });
        } else if (request.action === "recordURL") {
            var blob = new Blob([request.url], {type: 'text/plain'});
            var reader = new FileReader();
            reader.onloadend = function() {
                var dataUrl = reader.result;
                chrome.downloads.download({
                    url: dataUrl,
                    filename: sanitizedFilename
                }, function(downloadId) {
                    if (chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError.message);
                    }
                });
            };
            reader.readAsDataURL(blob);
        }
    }
});
