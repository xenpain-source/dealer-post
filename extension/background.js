// Service worker: the message relay between the DealerLoft app tab and a
// freshly-opened Facebook "Create vehicle listing" tab. It never talks to
// Facebook's API — it just stashes the listing data for a few minutes and
// hands it to the Facebook-side content script once that page loads.

const PENDING_KEY = "dealerloft_pending_listing";
const PENDING_TTL_MS = 5 * 60 * 1000; // 5 minutes — stale data is dropped, not filled in

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "DEALERLOFT_POST_TO_MARKETPLACE") {
    const payload = {
      listing: message.listing,
      storedAt: Date.now(),
    };
    chrome.storage.local.set({ [PENDING_KEY]: payload }, () => {
      chrome.tabs.create({ url: "https://www.facebook.com/marketplace/create/vehicle" });
      sendResponse({ ok: true });
    });
    return true; // keep the message channel open for the async sendResponse
  }

  if (message?.type === "DEALERLOFT_TAKE_PENDING_LISTING") {
    chrome.storage.local.get(PENDING_KEY, (result) => {
      const stored = result[PENDING_KEY];
      if (!stored || Date.now() - stored.storedAt > PENDING_TTL_MS) {
        chrome.storage.local.remove(PENDING_KEY);
        sendResponse({ listing: null });
        return;
      }
      // Single-use: clear it so re-visiting the create page later doesn't
      // silently re-fill with old data.
      chrome.storage.local.remove(PENDING_KEY);
      sendResponse({ listing: stored.listing });
    });
    return true;
  }
});
