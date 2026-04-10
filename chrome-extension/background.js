// Background service worker — coordinates messaging and opens importer tab on icon click

// When the extension icon is clicked, open the importer in a new tab
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("importer.html") });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "openAmazonSearch") {
    const { query } = message;
    const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;

    chrome.tabs.create({ url: searchUrl, active: true }, (tab) => {
      // Wait for the tab to finish loading before sending scrape request
      chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
        if (tabId === tab.id && info.status === "complete") {
          chrome.tabs.onUpdated.removeListener(listener);
          // Give Amazon a moment to render dynamic content
          setTimeout(() => {
            sendResponse({ tabId: tab.id });
          }, 1500);
        }
      });
    });

    return true; // keep channel open for async
  }

  if (message.action === "scrapeTab") {
    const { tabId, limit } = message;

    // First ensure content script is injected (in case manifest didn't catch it)
    chrome.scripting.executeScript(
      {
        target: { tabId },
        files: ["content.js"],
      },
      () => {
        // Now send the scrape message
        chrome.tabs.sendMessage(
          tabId,
          { action: "scrapeProducts", limit },
          (response) => {
            if (chrome.runtime.lastError) {
              sendResponse({ error: chrome.runtime.lastError.message });
            } else {
              sendResponse(response);
            }
          }
        );
      }
    );

    return true; // keep channel open for async
  }
});
