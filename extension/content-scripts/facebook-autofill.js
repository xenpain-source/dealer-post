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
    vehicleType: ["vehicle type"],
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

  // Anything a value can actually go into, OR a pure dropdown trigger with
  // no text control of its own (Facebook renders Year/Body style/Vehicle
  // type/Vehicle condition/Fuel type this way: a <label role="combobox">
  // you click to open a listbox and pick an option — there's nothing to
  // type into). contenteditable is kept here defensively — Facebook uses
  // that pattern elsewhere on the site — even though as of this writing
  // none of this form's fields actually render that way.
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
  // exact URL shape isn't documented and can change).
  //
  // A listing that Facebook holds for review never lands on /item/ — it goes
  // to the dealer's selling page or elsewhere instead. So also count it as
  // published once the dealer has clicked Facebook's own Publish button and
  // the page has then left /marketplace/create/ (externalUrl is unknown then).
  function watchForPublish(onPublished, timeoutMs = 20 * 60 * 1000) {
    const start = Date.now();
    let publishClicked = false;
    document.addEventListener(
      "click",
      (event) => {
        const button = event.target instanceof Element ? event.target.closest('button, [role="button"]') : null;
        if (!button || button.closest("#dealerloft-banner")) return;
        const label = normalize(button.getAttribute("aria-label") || button.textContent);
        if (label === "publish" || label === "post") publishClicked = true;
      },
      true,
    );
    const check = () => {
      if (/\/marketplace\/item\//.test(location.pathname)) {
        onPublished(location.href);
        return;
      }
      if (publishClicked && !location.pathname.startsWith("/marketplace/create")) {
        onPublished(null);
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

  // The label's own visible text, with any nested control's content/value
  // stripped out first — otherwise a filled-in field's typed value would
  // get mixed into the text we're matching against.
  function directLabelText(label) {
    const clone = label.cloneNode(true);
    clone.querySelectorAll(CONTROL_SELECTOR).forEach((n) => n.remove());
    return normalize(clone.textContent);
  }

  // Finds the actual input/textarea/combobox for a field by its label text.
  //
  // Pass 1 (the one that matters): every field on this form is wrapped in a
  // real <label> element together with its control — <label>Price<input/>
  // </label> — so matching <label> text directly and reading the control
  // straight out of it is exact, no guessing required. This specifically
  // avoids a bug the previous version of this file had: Facebook also shows
  // "Price" and "Description" as bold section headings (plain <div>s, not
  // <label>s) above the real field, and matching those by accident sent the
  // fill into whatever random control happened to be nearby.
  //
  // Pass 2: a looser div/span/p + short ancestor-climb fallback, kept only
  // in case a future Facebook redesign stops using <label> for some field.
  function findFieldControl(keywords) {
    const labels = Array.from(document.querySelectorAll("label"));
    for (const loose of [false, true]) {
      for (const label of labels) {
        const text = directLabelText(label);
        if (!text || text.length > 40) continue;
        if (!labelMatchesKeyword(text, keywords, { loose })) continue;
        const control = label.matches(CONTROL_SELECTOR) ? label : label.querySelector(CONTROL_SELECTOR);
        if (control) return control;
      }
    }

    const candidates = Array.from(document.querySelectorAll("span, div, p")).filter((el) => {
      if (el.childElementCount > 2) return false; // skip big wrapper elements
      const text = normalize(el.textContent);
      return Boolean(text) && text.length <= 40;
    });
    for (const loose of [false, true]) {
      for (const el of candidates) {
        const text = normalize(el.textContent);
        if (!labelMatchesKeyword(text, keywords, { loose })) continue;
        let container = el;
        for (let i = 0; i < 3 && container; i++) {
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

  // `control` is whatever findFieldControl matched — an input/textarea, a
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

  // True for a control like Year/Body style/Vehicle type/Vehicle condition/
  // Fuel type: a <label role="combobox"> that IS the clickable trigger for
  // a listbox, with no input/textarea/contenteditable of its own to type
  // into — the only way to set a value is click it open, then click the
  // matching [role="option"]. False for Make/Model/Price/Mileage, which are
  // plain <input> elements despite some of them also carrying a
  // role="combobox" ancestor in other Facebook form variants.
  function isPureListboxTrigger(control) {
    if (!control.matches('[role="combobox"]')) return false;
    if (control.matches("input, textarea, [contenteditable=\"true\"]")) return false;
    return !control.querySelector('input, textarea, [contenteditable="true"]');
  }

  async function pollForOption(value, timeoutMs) {
    const target = normalize(String(value));
    const deadline = Date.now() + timeoutMs;
    let option = null;
    while (Date.now() < deadline && !option) {
      option = Array.from(document.querySelectorAll('[role="option"]')).find((o) =>
        normalize(o.textContent).includes(target),
      );
      if (!option) await wait(120);
    }
    return option;
  }

  // Single entry point for every field. Finds the control by its label,
  // then either drives it as a listbox (click trigger → wait for options →
  // click the match) or fills it directly as text — whichever the control
  // actually turns out to be, rather than assuming one or the other per
  // field name. Make/Model have no dropdown on the current form at all
  // (confirmed live — typing never produces any [role="option"]), so a
  // plain fill is simply correct for them now; this also means the fill
  // automatically adapts if Facebook adds or removes a dropdown later.
  async function fillField(fieldName, keywords, value) {
    if (value === null || value === undefined || value === "") {
      return { field: fieldName, ok: false, note: "no value to fill" };
    }
    const control = findFieldControl(keywords);
    if (!control) return { field: fieldName, ok: false, note: "field not found on page" };

    if (isPureListboxTrigger(control)) {
      control.click();
      const option = await pollForOption(value, 1500);
      if (option) {
        option.click();
        await wait(150);
        return { field: fieldName, ok: true, note: "selected from dropdown" };
      }
      control.click(); // close the dropdown again so it doesn't block the next field
      return { field: fieldName, ok: false, note: `no matching dropdown option for "${value}"` };
    }

    const filled = setControlValue(control, String(value));
    if (!filled) return { field: fieldName, ok: false, note: "found label but no editable field inside it" };
    return { field: fieldName, ok: true, note: "filled" };
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

  // A plain fetch() from here is blocked by CORS (this script runs with
  // facebook.com's origin), so the background service worker downloads the
  // photo and sends the bytes back as base64.
  function fetchPhotoViaBackground(url) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type: "DEALERLOFT_FETCH_PHOTO", url }, (response) => {
        if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
        if (!response?.ok) return reject(new Error(response?.error || "photo fetch failed"));
        const binary = atob(response.base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        resolve(new Blob([bytes], { type: response.type }));
      });
    });
  }

  async function tryAttachPhotos(urls) {
    const fileInput = document.querySelector('input[type="file"]');
    if (!fileInput) return { field: "photos", ok: false, note: "no photo upload field found on page" };

    let attached = 0;
    let firstError = null;
    for (const url of urls.slice(0, 10)) {
      try {
        const blob = await fetchPhotoViaBackground(url);
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
        if (!firstError) {
          let host = url;
          try {
            host = new URL(url).host;
          } catch {}
          firstError = `${host}: ${err?.message || err}`;
        }
      }
    }
    if (attached === 0) {
      return {
        field: "photos",
        ok: false,
        note: `couldn't download any photos to attach (${firstError}) — add them manually`,
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

  function showSummary(results, watchingForPublish) {
    const ok = results.filter((r) => r.ok).length;
    const banner = showBanner(`DealerLoft filled ${ok} of ${results.length} fields.`);
    // Per-field results fold away to keep the banner short — but open on
    // their own when something needs the dealer's attention.
    const failed = results.length - ok;
    const details = document.createElement("details");
    details.open = failed > 0;
    details.style.cssText = "margin-top:8px;font-weight:400;font-size:13px";
    const summary = document.createElement("summary");
    summary.textContent = failed > 0 ? `${failed} need${failed === 1 ? "s" : ""} attention — details` : "Details";
    summary.style.cssText = "cursor:pointer;opacity:.85";
    details.appendChild(summary);
    const list = document.createElement("div");
    list.style.cssText = "margin-top:6px;opacity:.85;white-space:pre-line";
    // textContent, not innerHTML: notes can include listing values.
    list.textContent = results.map((r) => `${r.ok ? "✓" : "⚠"} ${r.field}: ${r.note}`).join("\n");
    details.appendChild(list);
    banner.appendChild(details);

    const status = document.createElement("div");
    status.style.cssText = "margin-top:10px;font-weight:400;font-size:13px;opacity:.85";
    status.textContent = watchingForPublish
      ? "Review the listing, then click Facebook's own Publish button — DealerLoft will notice on its own."
      : "Review the listing, then click Facebook's own Publish button.";
    banner.appendChild(status);

    const row = document.createElement("div");
    row.style.cssText = "margin-top:10px;display:flex;gap:8px;flex-wrap:wrap";

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

    // Facebook doesn't render vehicle-specific fields (Mileage, Body style,
    // Vehicle condition, Fuel type...) until a Vehicle type is chosen — they
    // simply aren't in the page yet. This has to run, and succeed, before
    // anything else below, or those fields will always come back "not
    // found on page" no matter how good the matching is. DealerLoft only
    // lists cars/trucks today; listing.vehicleType can override the default
    // if that ever changes.
    const vehicleTypeResult = await fillField("Vehicle type", KEYWORDS.vehicleType, listing.vehicleType || "Car/Truck");
    results.push(vehicleTypeResult);
    if (vehicleTypeResult.ok) await wait(500); // let Facebook render the fields that depend on it

    results.push(await fillField("Year", KEYWORDS.year, listing.year));
    results.push(await fillField("Make", KEYWORDS.make, listing.make));
    results.push(await fillField("Model", KEYWORDS.model, listing.model));
    results.push(await fillField("Price", KEYWORDS.price, listing.price));
    results.push(await fillField("Mileage", KEYWORDS.mileage, listing.mileage));
    if (listing.bodyType) results.push(await fillField("Body style", KEYWORDS.bodyStyle, listing.bodyType));
    // Facebook's own vehicle listing form has no VIN field at all, as of
    // this writing — this is kept so it reports that clearly (rather than
    // silently vanishing) and starts working on its own if Facebook adds one.
    if (listing.vin) results.push(await fillField("VIN", KEYWORDS.vin, listing.vin));
    results.push(await fillField("Description", KEYWORDS.description, buildDescription(listing)));
    if (listing.photoUrls?.length) results.push(await tryAttachPhotos(listing.photoUrls));

    const canReport = Boolean(token && callbackUrl);
    const status = showSummary(results, canReport);

    // Report the publish exactly once — the token is single-use, so a second
    // report would be rejected and look like a failure.
    if (canReport) {
      let reported = false;
      watchForPublish(async (href) => {
        if (reported) return;
        reported = true;
        const ok = await reportPosted(token, callbackUrl, href);
        if (status) {
          status.textContent = ok
            ? "Looks like this went live — DealerLoft marked it as posted."
            : "Looks like this went live, but DealerLoft couldn't be reached to record it.";
        }
        // Nothing left to do once it's recorded, so the banner gets out of the
        // way on its own. A failure stays up so the dealer actually sees it.
        if (ok) setTimeout(() => document.getElementById("dealerloft-banner")?.remove(), 4000);
      });
    }
  }

  run().catch((err) => {
    console.error("[DealerLoft] autofill failed:", err);
    showBanner("DealerLoft hit an error filling this listing — check the console, or just fill it in by hand.");
  });
})();
