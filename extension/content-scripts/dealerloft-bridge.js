// Runs on the DealerLoft app itself. Its jobs:
//   1. Tell the page the extension is installed, and which version (so the
//      "Post to Facebook Marketplace" button can show up instead of install
//      instructions, and the Extension page can flag an outdated copy).
//   2. Relay the one message that button sends into the extension's
//      background service worker.
//   3. Pass back the two outcomes of a post in flight: published, or the
//      Facebook tab closed without publishing.
//
// It never reads anything else from the page.

(function () {
  document.documentElement.setAttribute("data-dealerloft-extension", "installed");
  // Lets the dashboard's Extension page say whether this copy is up to date.
  document.documentElement.setAttribute(
    "data-dealerloft-extension-version",
    chrome.runtime.getManifest().version,
  );
  window.dispatchEvent(new CustomEvent("dealerloft-extension-ready"));

  window.addEventListener("message", (event) => {
    // Only ever accept messages from this exact page, never from an embedded
    // iframe or another tab, and only the one message shape we expect.
    if (event.source !== window) return;
    if (event.origin !== window.location.origin) return;
    const data = event.data;
    if (!data || data.source !== "dealerloft-app" || data.type !== "POST_TO_MARKETPLACE") return;

    chrome.runtime.sendMessage(
      {
        type: "DEALERLOFT_POST_TO_MARKETPLACE",
        listing: data.listing,
        token: data.token,
        callbackUrl: data.callbackUrl,
      },
      (response) => {
        window.postMessage(
          {
            source: "dealerloft-extension",
            type: "POST_TO_MARKETPLACE_ACK",
            ok: Boolean(response?.ok),
          },
          window.location.origin,
        );
      },
    );
  });

  // The background worker saw the post go through, or the dealer close the
  // Facebook tab before publishing — pass that on so the page can update
  // straight away instead of waiting on its own polling.
  const RELAYED = {
    DEALERLOFT_FACEBOOK_POSTED: "FACEBOOK_POSTED",
    DEALERLOFT_FACEBOOK_TAB_CLOSED: "FACEBOOK_TAB_CLOSED",
  };
  chrome.runtime.onMessage.addListener((message) => {
    if (!Object.hasOwn(RELAYED, message?.type)) return;
    const type = RELAYED[message.type];
    window.postMessage({ source: "dealerloft-extension", type }, window.location.origin);
  });
})();
