"use client";

import { useEffect, useState } from "react";

// Whether this browser has the DealerLoft extension, and if so whether it's
// the latest version. The extension's bridge script marks the page with
// data-dealerloft-extension (and, from 0.1.8, its version) as soon as it
// loads; this just reads that.

type Status =
  | { kind: "checking" }
  | { kind: "missing" }
  | { kind: "installed"; version: string | null };

function compareVersions(a: string, b: string) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

function readStatus(): Status {
  const root = document.documentElement;
  if (root.dataset.dealerloftExtension !== "installed") return { kind: "missing" };
  return { kind: "installed", version: root.dataset.dealerloftExtensionVersion ?? null };
}

export function ExtensionStatus({ latestVersion }: { latestVersion: string }) {
  const [status, setStatus] = useState<Status>({ kind: "checking" });

  useEffect(() => {
    setStatus(readStatus());
    const onReady = () => setStatus(readStatus());
    window.addEventListener("dealerloft-extension-ready", onReady);
    // The bridge script can load a moment after the page; check once more.
    const timer = setTimeout(onReady, 800);
    return () => {
      window.removeEventListener("dealerloft-extension-ready", onReady);
      clearTimeout(timer);
    };
  }, []);

  if (status.kind === "checking") {
    return <p className="dl-small">Checking this browser…</p>;
  }

  if (status.kind === "missing") {
    return (
      <p className="flex items-center gap-2 dl-small">
        <span className="dl-pill dl-pill--draft">Not installed</span>
        Not found in this browser. Download it below.
      </p>
    );
  }

  // Versions before 0.1.8 don't report their version, so they're outdated.
  const outdated = !status.version || compareVersions(status.version, latestVersion) < 0;
  return (
    <p className="flex flex-wrap items-center gap-2 dl-small">
      {outdated ? (
        <>
          <span className="dl-pill dl-pill--publishing">Update available</span>
          You have {status.version ? <span className="dl-data">v{status.version}</span> : "an older version"}; the latest
          is <span className="dl-data">v{latestVersion}</span>. See &ldquo;Updating&rdquo; below.
        </>
      ) : (
        <>
          <span className="dl-pill dl-pill--live">Installed</span>
          Up to date (<span className="dl-data">v{status.version}</span>).
        </>
      )}
    </p>
  );
}
