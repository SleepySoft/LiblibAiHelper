// background.js
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action == "download") {
      chrome.downloads.download({
        url: request.url,
        filename: request.filename
      });
    }
  }
);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "recordURL") {
        var blob = new Blob([request.url], {type: 'text/plain'});
        var reader = new FileReader();
        reader.onloadend = function() {
            var dataUrl = reader.result;
            chrome.downloads.download({url: dataUrl, filename: request.filename});
        };
        reader.readAsDataURL(blob);
    }
});
