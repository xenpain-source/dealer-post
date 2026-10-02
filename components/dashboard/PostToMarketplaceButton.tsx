"use client";

import { useEffect, useState } from "react";

const EXTENSION_SOURCE_URL =
  "https://github.com/xenpain-source/dealer-post/tree/main/extension";

type MarketplaceListing = {
  year: number;
  make: string;
  model: string;
  mileage: number;
  price: number;
  vin: string | null;
  bodyType: string | null;
  stockNumber: string | null;
  cleanTitle: boolean;
  oneOwner: boolean;
  description: string | null;
};

export function PostToMarketplaceButton({
  listing,
  photoUrls,
}: {
  listing: MarketplaceListing;
  photoUrls: string[];
}) {
  // null = still checking, true/false = known. The bridge content script
  // sets a data attribute (and fires an event) the instant it loads, so
  // most of the time we know within a tick — the timeout just keeps the
  // UI from guessing "not installed" before the script had a chance to run.
  const [installed, setInstalled] = useState<boolean | null>(null);

  useEffect(() => {
    if (document.documentElement.dataset.dealerloftExtension === "installed") {
      setInstalled(true);
      return;
    }
    function onReady() {
      setInstalled(true);
    }
    window.addEventListener("dealerloft-extension-ready", onReady);
    const timer = setTimeout(() => setInstalled((current) => current ?? false), 600);
    return () => {
      window.removeEventListener("dealerloft-extension-ready", onReady);
      clearTimeout(timer);
    };
  }, []);

  function handleClick() {
    window.postMessage(
      {
        source: "dealerloft-app",
        type: "POST_TO_MARKETPLACE",
        listing: { ...listing, photoUrls },
      },
      window.location.origin,
    );
  }

  return (
    <div className="dl-card">
      <h2 className="dl-h4">Post to Facebook Marketplace</h2>

      {installed === null && (
        <p className="dl-small mt-1">Checking for the DealerLoft browser extension…</p>
      )}

      {installed === false && (
        <>
          <p className="dl-small mt-1">
            This fills in Facebook&apos;s own listing form for you — you
            still review everything and click Facebook&apos;s own Publish
            button. It needs the free DealerLoft Marketplace Assistant
            browser extension installed first (it&apos;s not on the Chrome
            Web Store yet, so it&apos;s a quick manual install).
          </p>
          <a
            href={EXTENSION_SOURCE_URL}
            target="_blank"
            rel="noreferrer"
            className="dl-btn dl-btn--ghost w-fit mt-3"
          >
            Get the extension
          </a>
        </>
      )}

      {installed === true && (
        <>
          <p className="dl-small mt-1">
            Opens a new tab on Facebook Marketplace with this listing&apos;s
            details filled in. You review everything — especially the
            photos — and click Facebook&apos;s own Publish button yourself.
          </p>
          <button
            type="button"
            onClick={handleClick}
            className="dl-btn dl-btn--primary w-fit mt-3"
          >
            Post to Facebook Marketplace
          </button>
        </>
      )}
    </div>
  );
}
