// Background script for Bitcoin Drive Chrome Extension

// When the extension icon is clicked, open Bitcoin Drive in a new tab
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({ url: 'https://bitcoin-drive.vercel.app' });
});

// Optional: Create a context menu item
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "upload-to-bitcoin-drive",
    title: "Upload to Bitcoin Drive",
    contexts: ["image", "video", "audio", "link"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "upload-to-bitcoin-drive") {
    // Open Bitcoin Drive with the selected item
    let url = 'https://bitcoin-drive.vercel.app';
    if (info.srcUrl) {
      // If it's a media file, we could pass it as a parameter
      url += '?upload=' + encodeURIComponent(info.srcUrl);
    } else if (info.linkUrl) {
      url += '?upload=' + encodeURIComponent(info.linkUrl);
    }
    chrome.tabs.create({ url: url });
  }
});

// Keep the service worker alive
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.keepAlive) {
    sendResponse({ status: 'alive' });
  }
});