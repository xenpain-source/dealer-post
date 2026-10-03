// Service worker: the message relay between the DealerLoft app tab and a
// freshly-opened Facebook "Create vehicle listing" tab. It never talks to
// Facebook's API — it just stashes the listing data for a few minutes and
// hands it to the Facebook-side content script once that page loads. It also
// reports the post back to DealerLoft once the dealer publishes, since that
// fetch has to come from here (the Facebook tab has no DealerLoft login to
// send it with, but this service worker's host_permissions cover DealerLoft's
// own domains).

const PENDING_KEY = "dealerloft_pending_listing";
const PENDING_TTL_MS = 5 * 60 * 1000; // 5 minutes — stale data is dropped, not filled in

// The post in flight: which Facebook tab belongs to it, which DealerLoft tab
// started it, the one-time token/callback for reporting it, and whether the
// dealer has clicked Facebook's Publish button yet. Kept in storage rather
// than a variable because Chrome can stop this service worker at any time
// between events. Removed as soon as the post is reported or abandoned.
const TRACKED_KEY = "dealerloft_tracked_tabs";

function getTracked() {
  return new Promise((resolve) => {
    chrome.storage.local.get(TRACKED_KEY, (result) => resolve(result[TRACKED_KEY] ?? null));
  });
}

function notifyTab(tabId, message) {
  chrome.tabs.sendMessage(tabId, message, () => {
    void chrome.runtime.lastError; // tab already gone — nothing to tell
  });
}

// Reports the publish to DealerLoft exactly once. TRACKED_KEY is cleared
// before the fetch, so a second trigger (another URL change, a tab close)
// finds nothing to act on — the token is single-use anyway.
async function reportPosted(tracked, externalUrl) {
  await chrome.storage.local.remove(TRACKED_KEY);
  let ok = false;
  try {
    const res = await fetch(tracked.callbackUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: tracked.token, externalUrl }),
    });
    ok = res.ok;
  } catch (err) {
    console.warn("[DealerLoft] couldn't report the post:", err);
  }
  console.log("[DealerLoft] reported post:", { ok, externalUrl });
  // The DealerLoft tab updates straight away instead of waiting on its own
  // polling (which Chrome throttles while that tab is in the background);
  // the Facebook tab's banner shows the outcome, if it's still on screen.
  if (ok) notifyTab(tracked.dealerloftTabId, { type: "DEALERLOFT_FACEBOOK_POSTED" });
  notifyTab(tracked.facebookTabId, { type: "DEALERLOFT_POST_RECORDED", ok });
}

// Watching the tab's URL from here, rather than from the content script,
// survives Facebook doing a full page load after Publish — which destroys
// the content script along with the page.
//
// A post counts as published when the tab lands on a listing page
// (/marketplace/item/<id>), or — for listings Facebook holds for review,
// which go elsewhere — when it leaves /marketplace/create/ after the dealer
// clicked Facebook's own Publish button.
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (!changeInfo.url) return;
  const tracked = await getTracked();
  if (!tracked || tracked.facebookTabId !== tabId || !tracked.token) return;

  let path;
  try {
    path = new URL(changeInfo.url).pathname;
  } catch {
    return;
  }
  console.log("[DealerLoft] Facebook tab moved to", path, { publishClicked: tracked.publishClicked });

  if (path.startsWith("/marketplace/item/")) {
    reportPosted(tracked, changeInfo.url);
  } else if (tracked.publishClicked && !path.startsWith("/marketplace/create")) {
    reportPosted(tracked, null);
  }
});

// If the dealer closes the Facebook tab before the post is reported, tell
// the DealerLoft tab so it stops waiting and offers a retry.
chrome.tabs.onRemoved.addListener(async (tabId) => {
  const tracked = await getTracked();
  if (!tracked || tracked.facebookTabId !== tabId) return;
  await chrome.storage.local.remove(TRACKED_KEY);
  notifyTab(tracked.dealerloftTabId, { type: "DEALERLOFT_FACEBOOK_TAB_CLOSED" });
});

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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "DEALERLOFT_POST_TO_MARKETPLACE") {
    const payload = {
      listing: message.listing,
      token: message.token ?? null,
      callbackUrl: message.callbackUrl ?? null,
      storedAt: Date.now(),
    };
    chrome.storage.local.set({ [PENDING_KEY]: payload }, () => {
      chrome.tabs.create({ url: "https://www.facebook.com/marketplace/create/vehicle" }, (tab) => {
        if (tab?.id != null && sender.tab?.id != null) {
          chrome.storage.local.set({
            [TRACKED_KEY]: {
              facebookTabId: tab.id,
              dealerloftTabId: sender.tab.id,
              token: payload.token,
              callbackUrl: payload.callbackUrl,
              publishClicked: false,
            },
          });
        }
      });
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

  // The Facebook content script saw the dealer click Facebook's own Publish
  // button. Remembered here so it survives a full page load; the tab's next
  // URL change (see tabs.onUpdated above) decides whether it went through.
  if (message?.type === "DEALERLOFT_PUBLISH_CLICKED") {
    getTracked().then((tracked) => {
      if (!tracked || tracked.facebookTabId !== sender.tab?.id) return;
      console.log("[DealerLoft] Publish clicked");
      chrome.storage.local.set({ [TRACKED_KEY]: { ...tracked, publishClicked: true } });
    });
    return;
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
