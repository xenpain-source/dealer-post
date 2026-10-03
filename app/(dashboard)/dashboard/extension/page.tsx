import type { Metadata } from "next";
import manifest from "@/extension/manifest.json";
import { ExtensionStatus } from "@/components/dashboard/ExtensionStatus";

export const metadata: Metadata = {
  title: "Browser extension",
};

// Built from extension/ before every build (scripts/build-extension-zip.mjs).
const DOWNLOAD_URL = "/downloads/dealerloft-extension.zip";

const INSTALL_STEPS = [
  <>
    Download the extension below and unzip it: on Windows, right-click the file and choose{" "}
    <b>Extract All</b>; on a Mac, double-click it. Move the{" "}
    <span className="dl-data">dealerloft-extension</span> folder somewhere it can stay, like
    Documents. Chrome loads it from there every time.
  </>,
  <>
    Open Chrome and go to <span className="dl-data">chrome://extensions</span> (type it in the
    address bar and press Enter). Edge and Brave work too.
  </>,
  <>
    Turn on <b>Developer mode</b> in the top-right corner.
  </>,
  <>
    Click <b>Load unpacked</b> and select the <span className="dl-data">dealerloft-extension</span>{" "}
    folder.
  </>,
  <>Come back to this page. The status above should change to Installed.</>,
];

export default function ExtensionPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="dl-h1">Browser extension</h1>
      <p className="dl-small mt-1">
        The DealerLoft Marketplace Assistant fills in Facebook&apos;s vehicle listing form from
        your DealerLoft listing. You check it over and click Facebook&apos;s own Publish button.
      </p>

      <div className="dl-card mt-6 grid gap-4">
        <ExtensionStatus latestVersion={manifest.version} />
        <div className="flex flex-wrap items-center gap-3">
          <a href={DOWNLOAD_URL} download className="dl-btn dl-btn--primary w-fit">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
            </svg>
            Download extension
          </a>
          <span className="dl-small">
            <span className="dl-data">v{manifest.version}</span> · ZIP · Chrome, Edge or Brave
          </span>
        </div>
      </div>

      <div className="dl-card mt-6">
        <h2 className="dl-h4">Install it (one time, about 2 minutes)</h2>
        <p className="dl-small mt-1">
          It isn&apos;t on the Chrome Web Store yet, so it takes a few extra clicks the first time.
        </p>
        <ol className="mt-4 grid gap-3" style={{ paddingLeft: "1.25rem", listStyle: "decimal" }}>
          {INSTALL_STEPS.map((step, i) => (
            <li key={i} className="dl-body">
              {step}
            </li>
          ))}
        </ol>
      </div>

      <div className="dl-card mt-6">
        <h2 className="dl-h4">Updating</h2>
        <p className="dl-body mt-2">
          Download the new version, unzip it, and replace the files in your existing{" "}
          <span className="dl-data">dealerloft-extension</span> folder. Then click the reload
          arrow on the extension&apos;s card in <span className="dl-data">chrome://extensions</span>.
          Keep using the same folder, so Chrome treats it as the same extension.
        </p>
      </div>
    </div>
  );
}
