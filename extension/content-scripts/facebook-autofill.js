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

  function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // Anything a value can actually go into. Facebook renders some of these
  // fields (Description for sure, apparently Year/Price too) as
  // contenteditable divs rather than real <input>/<textarea> elements — the
  // same rich-text-editor pattern Facebook uses elsewhere on the site — so
  // that has to count as a fillable control too, not just input/textarea.
  const CONTROL_SELECTOR = 'input, textarea, [role="combobox"], [contenteditable="true"]';

  // Strict: the label text IS (near enough) just the keyword — "Price",
  // "Price:", "Price (USD)". Loose: the keyword shows up as a whole word
  // inside a longer label — "Vehicle mileage", "Odometer reading" — and is
  // only tried if nothing on the page matched strictly, so a loose match
  // for one field can never steal a control a different field's strict
  // match wanted.
  function labelMatchesKeyword(text, keywords, { loose } = {}) {
    return keywords.some((k) => {
      if (text === k || text === `${k}:` || text.startsWith(`${k} `)) return true;
      if (!loose) return false;
      return new RegExp(`\\b${escapeRegExp(k)}\\b`).test(text);
    });
  }

  function log(...args) {
    console.log("[DealerLoft]", ...args);
  }

  async function getPendingPost() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: "DEALERLOFT_TAKE_PENDING_LISTING" }, (response) => {
        resolve({
          listing: response?.listing ?? null,
          token: response?.token ?? null,
          callbackUrl: response?.callbackUrl ?? null,
        });
      });
    });
  }

  // Tells DealerLoft the listing went live, so the dashboard can flip its
  // "Posting…" pill to "Live on Facebook" without the dealer doing anything
  // else. Best-effort: if this never fires (DealerLoft's token expires, the
  // dealer closes the tab, whatever), the dealer can still see it went out
  // on the Facebook side — DealerLoft just won't know automatically.
  async function reportPosted(token, callbackUrl, externalUrl) {
    if (!token || !callbackUrl) return false;
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { type: "DEALERLOFT_REPORT_POSTED", token, callbackUrl, externalUrl },
        (response) => resolve(Boolean(response?.ok)),
      );
    });
  }

  // After a successful publish, Facebook moves off /marketplace/create/vehicle
  // to the new listing's own page (something like /marketplace/item/<id>).
  // Since this is a single-page app, our already-injected content script
  // keeps running through that navigation — so watching location.href here
  // catches it without needing a fresh page load. This is a heuristic (the
  // exact URL shape isn't documented and can change), so it's paired with a
  // manual "I published it" button in the banner as a fallback.
  function watchForPublish(onPublished, timeoutMs = 5 * 60 * 1000) {
    const start = Date.now();
    const check = () => {
      if (/\/marketplace\/item\//.test(location.pathname)) {
        onPublished(location.href);
        return;
      }
      if (Date.now() - start > timeoutMs) return; // give up quietly
      setTimeout(check, 1000);
    };
    check();
  }

  async function waitForForm(timeoutMs = 10000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const count = document.querySelectorAll(CONTROL_SELECTOR).length;
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
    const candidates = Array.from(document.querySelectorAll("label, span, div, p")).filter((el) => {
      if (el.childElementCount > 2) return false; // skip big wrapper elements
      const text = normalize(el.textContent);
      return Boolean(text) && text.length <= 40;
    });

    for (const loose of [false, true]) {
      for (const el of candidates) {
        const text = normalize(el.textContent);
        if (!labelMatchesKeyword(text, keywords, { loose })) continue;

        let container = el;
        for (let i = 0; i < 5 && container; i++) {
          const control = container.querySelector(CONTROL_SELECTOR);
          if (control) return control;
          container = container.parentElement;
        }
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

  // React-based rich text editors (this is apparently what Facebook's
  // Description field is, and maybe Year/Price too) don't pick up a plain
  // `el.textContent = value` assignment — their internal state just
  // overwrites it back out on the next render. execCommand("insertText") is
  // deprecated but still the most reliable way to make them see a real
  // edit, the same as if the dealer had typed or pasted it in by hand.
  function setContentEditableValue(el, value) {
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    const inserted = document.execCommand && document.execCommand("insertText", false, value);
    if (!inserted) {
      el.textContent = value;
      el.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: value }));
    }
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  // `control` is whatever findFieldContainer matched — an input/textarea, a
  // role="combobox" wrapper, or a contenteditable div. Resolves it down to
  // the actual thing text can go into and fills it, or returns null if
  // there's genuinely nothing typable inside.
  function setControlValue(control, value) {
    if (control.matches('[contenteditable="true"]')) {
      setContentEditableValue(control, value);
      return control;
    }
    const input = control.matches("input, textarea")
      ? control
      : control.querySelector('input, textarea, [contenteditable="true"]');
    if (!input) return null;
    if (input.matches('[contenteditable="true"]')) setContentEditableValue(input, value);
    else setNativeValue(input, value);
    return input;
  }

  async function tryFillText(fieldName, keywords, value) {
    if (value === null || value === undefined || value === "") {
      return { field: fieldName, ok: false, note: "no value to fill" };
    }
    const control = findFieldContainer(keywords);
    if (!control) return { field: fieldName, ok: false, note: "field not found on page" };
    const filled = setControlValue(control, String(value));
    if (!filled) return { field: fieldName, ok: false, note: "found label but no editable field inside it" };
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
    const target = normalize(String(value));
    if (input) {
      setNativeValue(input, String(value));
      // Facebook's suggestion list is keystroke-driven, not just
      // value-driven — a plain "input" event doesn't always trigger it.
      // Nudge it with a trailing keyup so a listener that only watches
      // keyboard events still fires. Harmless if it didn't need this.
      input.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true, key: String(value).slice(-1) || "a" }));
    }

    // Poll instead of one fixed 450ms wait — the suggestion list can take
    // longer than that to show up, especially right after the page loads.
    let option = null;
    const deadline = Date.now() + 1500;
    while (Date.now() < deadline && !option) {
      option = Array.from(document.querySelectorAll('[role="option"]')).find((o) =>
        normalize(o.textContent).includes(target),
      );
      if (!option) await wait(150);
    }
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

  // listing.price/mileage normally arrive as numbers straight from the
  // DealerLoft DB, but tolerate a string too ("$14,500", "52,000") in case
  // a caller passes through raw form input.
  function toNumber(value) {
    if (typeof value === "number") return value;
    const cleaned = String(value ?? "").replace(/[^0-9.]/g, "");
    return cleaned ? Number(cleaned) : 0;
  }

  // DealerLoft's own content rules (claude/dealerloft-web-ui.md): price with
  // no cents, mileage with a "mi" suffix, VIN uppercase.
  function formatCurrency(value) {
    return `$${Math.round(toNumber(value)).toLocaleString("en-US")}`;
  }

  function formatMileage(value) {
    return `${Math.round(toNumber(value)).toLocaleString("en-US")} mi`;
  }

  function capitalize(text) {
    return text.length ? text[0].toUpperCase() + text.slice(1) : text;
  }

  // DealerLoft's own "Generate description" button (AI or template) writes
  // a COMPLETE description — price and mileage already formatted exactly
  // the way formatCurrency()/formatMileage() produce them — straight into
  // listing.description before the dealer ever gets here. Detect that and
  // use it as-is, instead of wrapping another copy of the same
  // headline/facts/closing around it. A short free-text note typed by hand
  // (no formatted price/mileage in it) still gets enriched with the
  // auto-generated facts below, same as before this feature existed.
  function buildDescription(listing) {
    const existing = (listing.description || "").trim();
    const alreadyComposed =
      existing && existing.includes(formatCurrency(listing.price)) && existing.includes(formatMileage(listing.mileage));
    if (alreadyComposed) return existing;

    const title = [listing.year, listing.make, listing.model].filter(Boolean).join(" ");
    const headline = title ? `${title} — ${formatCurrency(listing.price)}` : formatCurrency(listing.price);

    const facts = [formatMileage(listing.mileage)];
    if (listing.bodyType) facts.push(listing.bodyType);
    if (listing.cleanTitle) facts.push("clean title");
    if (listing.oneOwner) facts.push("one owner");
    const factsLine = `${capitalize(facts.join(", "))}.`;

    const idParts = [];
    if (listing.stockNumber) idParts.push(`Stock #${listing.stockNumber}`);
    if (listing.vin) idParts.push(`VIN ${String(listing.vin).toUpperCase()}`);
    const idLine = idParts.join(" · ");

    const closing = "Message us to schedule a test drive or ask any questions — this one won't last long.";

    return [headline, existing, factsLine, closing, idLine].filter(Boolean).join("\n\n");
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

  function showSummary(results, onConfirmPublished) {
    const ok = results.filter((r) => r.ok).length;
    const banner = showBanner(`DealerLoft filled ${ok} of ${results.length} fields.`);
    const list = document.createElement("div");
    list.style.cssText = "margin-top:8px;font-weight:400;font-size:13px;opacity:.85";
    list.innerHTML = results
      .map((r) => `${r.ok ? "✓" : "⚠"} ${r.field}: ${r.note}`)
      .join("<br>");
    banner.appendChild(list);

    const status = document.createElement("div");
    status.style.cssText = "margin-top:10px;font-weight:400;font-size:13px;opacity:.85";
    status.textContent = "Review everything above, then click Facebook's own Publish button.";
    banner.appendChild(status);

    const row = document.createElement("div");
    row.style.cssText = "margin-top:10px;display:flex;gap:8px;flex-wrap:wrap";

    if (onConfirmPublished) {
      const confirm = document.createElement("button");
      confirm.textContent = "I clicked Publish";
      confirm.style.cssText =
        "background:#F4F5F7;border:none;color:#0E0F12;border-radius:6px;padding:4px 10px;cursor:pointer;font:600 13px inherit";
      confirm.onclick = async () => {
        confirm.disabled = true;
        confirm.textContent = "Letting DealerLoft know…";
        const ok = await onConfirmPublished(location.href);
        status.textContent = ok
          ? "DealerLoft marked this as posted."
          : "Couldn't reach DealerLoft — it's still posted on Facebook, DealerLoft just won't show it automatically.";
        confirm.remove();
      };
      row.appendChild(confirm);
    }

    const dismiss = document.createElement("button");
    dismiss.textContent = "Dismiss";
    dismiss.style.cssText =
      "background:none;border:1px solid rgba(255,255,255,.3);color:inherit;border-radius:6px;padding:4px 10px;cursor:pointer;font:inherit";
    dismiss.onclick = () => banner.remove();
    row.appendChild(dismiss);

    banner.appendChild(row);

    log("fill summary:", results);
    return status;
  }

  async function run() {
    const { listing, token, callbackUrl } = await getPendingPost();
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

    let reported = false;
    const confirmPublished = token && callbackUrl
      ? async (externalUrl) => {
          reported = true;
          return reportPosted(token, callbackUrl, externalUrl);
        }
      : null;

    const status = showSummary(results, confirmPublished);

    // Best-effort auto-detect in parallel with the manual "I clicked
    // Publish" button above — whichever happens first wins, and if the
    // dealer already confirmed manually we don't double-report.
    if (token && callbackUrl) {
      watchForPublish(async (href) => {
        if (reported) return;
        reported = true;
        const ok = await reportPosted(token, callbackUrl, href);
        if (status) {
          status.textContent = ok
            ? "Looks like this went live — DealerLoft marked it as posted."
            : "Looks like this went live, but DealerLoft couldn't be reached to record it.";
        }
      });
    }
  }

  run().catch((err) => {
    console.error("[DealerLoft] autofill failed:", err);
    showBanner("DealerLoft hit an error filling this listing — check the console, or just fill it in by hand.");
  });
})();
