// Runs on facebook.com/marketplace/create/*. Fills in Facebook's own
// "Create vehicle listing" form from the listing DealerLoft handed off
// through the background service worker — then stops and lets the dealer
// review everything and click Facebook's own Publish button themselves.
//
// IMPORTANT, READ ME: Facebook doesn't publish the structure of this form,
// and it changes without notice. This script finds fields by matching the
// short label text next to them (e.g. "Price", "Mileage") rather than by
// CSS class names, because Facebook's class names are auto-generated and
// meaningless/unstable, but it's still a best-effort match, not a
// guaranteed one. It always reports what it did and did not fill in — if
// something stops matching after a Facebook redesign, the fix is almost
// always just adding a wording to the KEYWORDS map below.

(function () {
  const KEYWORDS = {
    year: ["year"],
    make: ["make"],
    model: ["model"],
    price: ["price"],
    mileage: ["mileage", "odometer"],
    bodyStyle: ["body style", "body type"],
    vin: ["vin", "vehicle identification number"],
    description: ["description"],
  };

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function normalize(text) {
    return (text || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function log(...args) {
    console.log("[DealerLoft]", ...args);
  }

  async function getPendingListing() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: "DEALERLOFT_TAKE_PENDING_LISTING" }, (response) => {
        resolve(response?.listing ?? null);
      });
    });
  }

  async function waitForForm(timeoutMs = 10000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const count = document.querySelectorAll('input, textarea, [role="combobox"]').length;
      if (count > 3) return true;
      await wait(250);
    }
    return false;
  }

  // Looks for a small bit of label text matching one of `keywords`, then
  // walks up a few parent levels to find the nearest input/textarea/combobox
  // that lives in the same field "block" as that label — this is how
  // Facebook (and most React design systems) group a label with its control.
  function findFieldContainer(keywords) {
    const candidates = document.querySelectorAll("label, span, div");
    for (const el of candidates) {
      if (el.childElementCount > 2) continue; // skip big wrapper elements
      const text = normalize(el.textContent);
      if (!text || text.length > 40) continue;
      const isMatch = keywords.some((k) => text === k || text.startsWith(`${k} `) || text === `${k}:`);
      if (!isMatch) continue;

      let container = el;
      for (let i = 0; i < 5 && container; i++) {
        const control = container.querySelector('input, textarea, [role="combobox"]');
        if (control) return control;
        container = container.parentElement;
      }
    }
    return null;
  }

  function setNativeValue(input, value) {
    const proto = input.tagName === "TEXTAREA" ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
    if (setter) setter.call(input, value);
    else input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  async function tryFillText(fieldName, keywords, value) {
    if (value === null || value === undefined || value === "") {
      return { field: fieldName, ok: false, note: "no value to fill" };
    }
    const control = findFieldContainer(keywords);
    if (!control) return { field: fieldName, ok: false, note: "field not found on page" };
    const input = control.matches("input, textarea") ? control : control.querySelector("input, textarea");
    if (!input) return { field: fieldName, ok: false, note: "found label but no input inside it" };
    setNativeValue(input, String(value));
    return { field: fieldName, ok: true, note: "filled" };
  }

  // Facebook's Year/Make/Model/Body style fields are almost certainly
  // autocomplete comboboxes backed by their own vehicle database, not free
  // text — so after typing, we also try to click a matching dropdown option.
  async function tryFillCombo(fieldName, keywords, value) {
    if (!value) return { field: fieldName, ok: false, note: "no value to fill" };
    const control = findFieldContainer(keywords);
    if (!control) return { field: fieldName, ok: false, note: "field not found on page" };

    control.click();
    await wait(150);
    const input = control.matches("input") ? control : control.querySelector("input");
    if (input) setNativeValue(input, String(value));
    await wait(450);

    const target = normalize(String(value));
    const option = Array.from(document.querySelectorAll('[role="option"]')).find((o) =>
      normalize(o.textContent).includes(target),
    );
    if (option) {
      option.click();
      await wait(150);
      return { field: fieldName, ok: true, note: "filled and selected from dropdown" };
    }
    if (input) {
      return { field: fieldName, ok: true, note: "typed, but no matching dropdown option found — check it" };
    }
    return { field: fieldName, ok: false, note: "couldn't type into this field" };
  }

  function buildDescription(listing) {
    const extras = [];
    if (listing.cleanTitle) extras.push("Clean title.");
    if (listing.oneOwner) extras.push("One owner.");
    if (listing.stockNumber) extras.push(`Stock #: ${listing.stockNumber}`);
    if (listing.vin) extras.push(`VIN: ${listing.vin}`);
    const base = (listing.description || "").trim();
    return [base, ...extras].filter(Boolean).join("\n");
  }

  async function tryAttachPhotos(urls) {
    const fileInput = document.querySelector('input[type="file"]');
    if (!fileInput) return { field: "photos", ok: false, note: "no photo upload field found on page" };

    let attached = 0;
    for (const url of urls.slice(0, 10)) {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`fetch failed (${res.status})`);
        const blob = await res.blob();
        const filename = url.split("/").pop()?.split("?")[0] || "photo.jpg";
        const file = new File([blob], filename, { type: blob.type || "image/jpeg" });
        const dt = new DataTransfer();
        dt.items.add(file);
        fileInput.files = dt.files;
        fileInput.dispatchEvent(new Event("change", { bubbles: true }));
        attached++;
        await wait(1200); // give Facebook's own uploader time before adding the next one
      } catch (err) {
        log("couldn't attach photo", url, err);
      }
    }
    if (attached === 0) {
      return {
        field: "photos",
        ok: false,
        note: "couldn't download any photos to attach (likely blocked by the photo host) — add them manually",
      };
    }
    return { field: "photos", ok: attached === urls.length, note: `${attached} of ${urls.length} attached` };
  }

  function showBanner(text) {
    let banner = document.getElementById("dealerloft-banner");
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "dealerloft-banner";
      banner.style.cssText = [
        "position:fixed",
        "top:16px",
        "right:16px",
        "z-index:999999",
        "max-width:360px",
        "background:#0E0F12",
        "color:#F4F5F7",
        "padding:14px 16px",
        "border-radius:12px",
        "font:500 14px/1.4 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif",
        "box-shadow:0 8px 24px rgba(0,0,0,.35)",
      ].join(";");
      document.body.appendChild(banner);
    }
    banner.textContent = text;
    return banner;
  }

  function showSummary(results) {
    const ok = results.filter((r) => r.ok).length;
    const banner = showBanner(`DealerLoft filled ${ok} of ${results.length} fields.`);
    const list = document.createElement("div");
    list.style.cssText = "margin-top:8px;font-weight:400;font-size:13px;opacity:.85";
    list.innerHTML = results
      .map((r) => `${r.ok ? "✓" : "⚠"} ${r.field}: ${r.note}`)
      .join("<br>");
    banner.appendChild(list);

    const dismiss = document.createElement("button");
    dismiss.textContent = "Dismiss";
    dismiss.style.cssText =
      "margin-top:10px;background:none;border:1px solid rgba(255,255,255,.3);color:inherit;border-radius:6px;padding:4px 10px;cursor:pointer;font:inherit";
    dismiss.onclick = () => banner.remove();
    banner.appendChild(dismiss);

    log("fill summary:", results);
  }

  async function run() {
    const listing = await getPendingListing();
    if (!listing) return; // dealer just browsed here directly — nothing to do

    showBanner("DealerLoft is filling in this listing…");
    const formReady = await waitForForm();
    if (!formReady) {
      showBanner("DealerLoft couldn't find the listing form on this page — fill it in manually this time.");
      return;
    }

    const results = [];
    results.push(await tryFillText("Year", KEYWORDS.year, listing.year));
    results.push(await tryFillCombo("Make", KEYWORDS.make, listing.make));
    results.push(await tryFillCombo("Model", KEYWORDS.model, listing.model));
    results.push(await tryFillText("Price", KEYWORDS.price, listing.price));
    results.push(await tryFillText("Mileage", KEYWORDS.mileage, listing.mileage));
    if (listing.bodyType) results.push(await tryFillCombo("Body style", KEYWORDS.bodyStyle, listing.bodyType));
    if (listing.vin) results.push(await tryFillText("VIN", KEYWORDS.vin, listing.vin));
    results.push(await tryFillText("Description", KEYWORDS.description, buildDescription(listing)));
    if (listing.photoUrls?.length) results.push(await tryAttachPhotos(listing.photoUrls));

    showSummary(results);
  }

  run().catch((err) => {
    console.error("[DealerLoft] autofill failed:", err);
    showBanner("DealerLoft hit an error filling this listing — check the console, or just fill it in by hand.");
  });
})();
