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

// Message payloads have to be JSON-serializable, so photo bytes travel to
// the content script as base64. Chunked so String.fromCharCode doesn't blow
// the argument limit on multi-megabyte photos.
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

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

  // The Facebook-side content script can't fetch dealer photos itself: its
  // requests carry facebook.com's origin, and the photo host (R2) sends no
  // CORS headers allowing that. The service worker's own fetch isn't
  // CORS-restricted for hosts listed in host_permissions, so it downloads
  // the photo here and hands the bytes back.
  if (message?.type === "DEALERLOFT_FETCH_PHOTO") {
    const { url } = message;
    if (typeof url !== "string" || !/^https?:\/\//.test(url)) {
      sendResponse({ ok: false, error: "invalid photo url" });
      return;
    }
    fetch(url)
      .then(async (res) => {
        if (!res.ok) throw new Error(`fetch failed (${res.status})`);
        const type = res.headers.get("content-type") || "image/jpeg";
        sendResponse({ ok: true, type, base64: arrayBufferToBase64(await res.arrayBuffer()) });
      })
      .catch((err) => sendResponse({ ok: false, error: String(err) }));
    return true;
  }
});
