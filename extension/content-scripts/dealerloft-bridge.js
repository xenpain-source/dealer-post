// Runs on the DealerLoft app itself. Its only two jobs:
//   1. Tell the page the extension is installed (so the "Post to Facebook
//      Marketplace" button can show up instead of install instructions).
//   2. Relay the one message that button sends into the extension's
//      background service worker.
//
// It never reads anything else from the page, and the page never gets
// anything back except the "I'm here" signal below.

(function () {
  document.documentElement.setAttribute("data-dealerloft-extension", "installed");
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
})();
