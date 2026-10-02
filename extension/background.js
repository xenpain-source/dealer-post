// Service worker: the message relay between the DealerLoft app tab and a
// freshly-opened Facebook "Create vehicle listing" tab. It never talks to
// Facebook's API — it just stashes the listing data for a few minutes and
// hands it to the Facebook-side content script once that page loads. It also
// relays the one callback that tells DealerLoft the post went through, since
// that fetch has to come from here (the Facebook tab has no DealerLoft login
// to send it with, but this service worker's host_permissions cover
// DealerLoft's own domains).

const PENDING_KEY = "dealerloft_pending_listing";
const PENDING_TTL_MS = 5 * 60 * 1000; // 5 minutes — stale data is dropped, not filled in

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "DEALERLOFT_POST_TO_MARKETPLACE") {
    const payload = {
      listing: message.listing,
      token: message.token ?? null,
      callbackUrl: message.callbackUrl ?? null,
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
        sendResponse({ listing: null, token: null, callbackUrl: null });
        return;
      }
      // Single-use: clear it so re-visiting the create page later doesn't
      // silently re-fill with old data.
      chrome.storage.local.remove(PENDING_KEY);
      sendResponse({
        listing: stored.listing,
        token: stored.token,
        callbackUrl: stored.callbackUrl,
      });
    });
    return true;
  }

  if (message?.type === "DEALERLOFT_REPORT_POSTED") {
    const { callbackUrl, token, externalUrl } = message;
    if (!callbackUrl || !token) {
      sendResponse({ ok: false, error: "missing callbackUrl or token" });
      return;
    }
    fetch(callbackUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, externalUrl: externalUrl ?? null }),
    })
      .then((res) => sendResponse({ ok: res.ok }))
      .catch((err) => sendResponse({ ok: false, error: String(err) }));
    return true;
  }
});
