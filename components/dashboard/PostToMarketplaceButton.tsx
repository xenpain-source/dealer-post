"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DlLoader } from "./DlLoader";

const EXTENSION_SOURCE_URL =
  "https://github.com/xenpain-source/dealer-post/tree/main/extension";

// How long to keep auto-checking after the dealer clicks the button, before
// settling into "still pending — check again" rather than polling forever.
const POLL_INTERVAL_MS = 5000;
const POLL_MAX_ATTEMPTS = 24; // ~2 minutes

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

type ConnectionStatus = "idle" | "pending" | "posted" | "failed";

export function PostToMarketplaceButton({
  listingId,
  listing,
  photoUrls,
  onPosted,
}: {
  listingId: string;
  listing: MarketplaceListing;
  photoUrls: string[];
  // Fired when a post in flight is confirmed live, so the parent form can
  // show the listing as Live (the server already flipped it from Draft).
  onPosted?: () => void;
}) {
  // null = still checking, true/false = known. The bridge content script
  // sets a data attribute (and fires an event) the instant it loads, so
  // most of the time we know within a tick — the timeout just keeps the
  // UI from guessing "not installed" before the script had a chance to run.
  const [installed, setInstalled] = useState<boolean | null>(null);
  const [connection, setConnection] = useState<{
    status: ConnectionStatus;
    externalUrl: string | null;
  }>({ status: "idle", externalUrl: null });
  const [starting, setStarting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  // Polling gave up while the post was still pending — stop showing a
  // spinner and ask the dealer instead.
  const [waitTimedOut, setWaitTimedOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusRef = useRef<ConnectionStatus>("idle");
  const onPostedRef = useRef(onPosted);

  useEffect(() => {
    statusRef.current = connection.status;
  }, [connection.status]);

  useEffect(() => {
    onPostedRef.current = onPosted;
  }, [onPosted]);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/listings/${listingId}/platforms`);
      if (!res.ok) return null;
      const data = await res.json();
      const facebook = (data.connections ?? []).find(
        (c: { platform: string }) => c.platform === "facebook",
      );
      if (facebook) {
        if (statusRef.current === "pending" && facebook.status === "posted") onPostedRef.current?.();
        setConnection({ status: facebook.status, externalUrl: facebook.externalUrl });
      }
      return facebook ?? null;
    } catch {
      return null;
    }
  }, [listingId]);

  // Check once on load so a "Live on Facebook" pill survives a page refresh,
  // and so re-opening a listing whose post is still in flight resumes
  // polling instead of pretending nothing happened.
  useEffect(() => {
    fetchStatus().then((facebook) => {
      if (facebook?.status === "pending") startPolling();
    });
    return () => {
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchStatus]);

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

  // The extension tells us the moment the post goes through, or when the
  // dealer closes the Facebook tab without publishing — so the card doesn't
  // depend on polling, which Chrome throttles while this tab is in the
  // background.
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.source !== window || event.origin !== window.location.origin) return;
      const data = event.data;
      if (data?.source !== "dealerloft-extension") return;
      if (statusRef.current !== "pending") return;
      if (data.type === "FACEBOOK_POSTED") void fetchStatus();
      else if (data.type === "FACEBOOK_TAB_CLOSED") void cancelPost();
    }
    // Coming back to this tab after publishing: re-check straight away.
    function onVisible() {
      if (document.visibilityState === "visible" && statusRef.current === "pending") void fetchStatus();
    }
    window.addEventListener("message", onMessage);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("message", onMessage);
      document.removeEventListener("visibilitychange", onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startPolling() {
    let attempts = 0;
    setWaitTimedOut(false);
    const tick = async () => {
      attempts += 1;
      const facebook = await fetchStatus();
      // Settled (posted, cancelled, expired) — stop. A failed request returns
      // null; keep polling through it rather than freezing on a network blip.
      if (facebook && facebook.status !== "pending") return;
      if (statusRef.current !== "pending") return;
      if (attempts < POLL_MAX_ATTEMPTS) {
        pollTimer.current = setTimeout(tick, POLL_INTERVAL_MS);
      } else {
        setWaitTimedOut(true);
      }
    };
    if (pollTimer.current) clearTimeout(pollTimer.current);
    pollTimer.current = setTimeout(tick, POLL_INTERVAL_MS);
  }

  async function cancelPost() {
    if (pollTimer.current) clearTimeout(pollTimer.current);
    setCancelling(true);
    try {
      await fetch(`/api/listings/${listingId}/platforms/facebook/cancel`, { method: "POST" });
    } catch {
      // Best-effort: the server also gives up on its own once the token expires.
    } finally {
      setCancelling(false);
      setWaitTimedOut(false);
      setConnection({ status: "idle", externalUrl: null });
    }
  }

  async function handleClick() {
    setError(null);
    setStarting(true);
    try {
      const res = await fetch(`/api/listings/${listingId}/platforms/facebook/start`, {
        method: "POST",
      });
      if (!res.ok) {
        setError("Couldn't start the post — try again.");
        return;
      }
      const { token } = await res.json();

      window.postMessage(
        {
          source: "dealerloft-app",
          type: "POST_TO_MARKETPLACE",
          listing: { ...listing, photoUrls },
          token,
          callbackUrl: `${window.location.origin}/api/platforms/facebook/callback`,
        },
        window.location.origin,
      );

      setConnection({ status: "pending", externalUrl: null });
      startPolling();
    } catch {
      setError("Couldn't reach the server — check your connection and try again.");
    } finally {
      setStarting(false);
    }
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

      {installed === true && connection.status === "idle" && (
        <>
          <p className="dl-small mt-1">
            Opens a new tab on Facebook Marketplace with this listing&apos;s
            details filled in. You review everything — especially the
            photos — and click Facebook&apos;s own Publish button yourself.
          </p>
          <button
            type="button"
            onClick={handleClick}
            disabled={starting}
            className="dl-btn dl-btn--primary w-fit mt-3"
          >
            {starting && <DlLoader />}
            {starting ? "Starting…" : "Post to Facebook Marketplace"}
          </button>
        </>
      )}

      {installed === true && connection.status === "pending" && (
        <>
          {waitTimedOut ? (
            <p className="dl-small mt-1" aria-live="polite">
              Haven&apos;t heard back from Facebook yet. If you published it,
              click Check now — otherwise cancel and start over.
            </p>
          ) : (
            <p className="dl-small mt-1 flex items-center gap-1" aria-live="polite">
              <DlLoader />
              Waiting for you to finish on Facebook — review the listing in
              that tab and click Facebook&apos;s own Publish button. This will
              update on its own once it&apos;s live.
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fetchStatus()}
              className="dl-btn dl-btn--ghost w-fit"
            >
              Check now
            </button>
            <button
              type="button"
              onClick={cancelPost}
              disabled={cancelling}
              className="dl-btn dl-btn--ghost w-fit"
            >
              {cancelling && <DlLoader />}
              {cancelling ? "Cancelling…" : "Cancel"}
            </button>
          </div>
        </>
      )}

      {installed === true && connection.status === "posted" && (
        <>
          <p className="dl-small mt-1">✓ Live on Facebook Marketplace.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {connection.externalUrl && (
              <a
                href={connection.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="dl-btn dl-btn--ghost w-fit"
              >
                View on Facebook
              </a>
            )}
            <button
              type="button"
              onClick={handleClick}
              disabled={starting}
              className="dl-btn dl-btn--ghost w-fit"
            >
              Post again
            </button>
          </div>
        </>
      )}

      {error && <div className="dl-alert dl-alert--danger mt-3">{error}</div>}
    </div>
  );
}
