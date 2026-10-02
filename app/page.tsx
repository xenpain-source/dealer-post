import Link from "next/link";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";

// Sample vehicle photo for the hero mock listing card.
const HERO_LISTING_PHOTO =
  "data:image/jpeg;base64,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";

const steps = [
  {
    n: "01",
    title: "Snap",
    body: "Take photos on your phone, right on the lot.",
  },
  {
    n: "02",
    title: "Fill once",
    body: "Year, make, model, mileage, price. That's it.",
  },
  {
    n: "03",
    title: "Publish everywhere",
    body: "Pick your channels. Watch each one go Live.",
  },
];

const inboxMessages = [
  { channel: "Facebook Marketplace", time: "now", text: "Is the Accord still available?" },
  { channel: "Instagram", time: "1 min", text: "Can I see it Saturday morning?" },
  { channel: "Craigslist", time: "3 min", text: "Does it have a clean title?" },
];

export default function Home() {
  return (
    <div className="dl-dark dl-root flex flex-1 flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="dl-container dl-section">
          <div className="dl-golden">
            <div className="flex flex-col justify-between self-stretch">
              <div className="grid gap-6 justify-items-start">
                <span className="dl-eyebrow">Free during beta</span>
                <h1 className="dl-display">
                  Post once.
                  <br />
                  <em>Sell everywhere.</em>
                </h1>
                <p className="dl-lead">
                  Snap photos, enter the details once, and DealerLoft publishes
                  your listing to Facebook Marketplace, Instagram and Craigslist
                  at the same time.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/signup" className="dl-btn dl-btn--primary dl-btn--lg">
                  Get early access
                </Link>
                <Link href="#how-it-works" className="dl-btn dl-btn--secondary dl-btn--lg">
                  See how it works
                </Link>
              </div>
            </div>

            {/* Mock listing going out to three channels */}
            <div className="dl-card" style={{ background: "var(--surface)" }}>
              <div className="dl-listing" style={{ boxShadow: "none", border: "none" }}>
                <div
                  className="media"
                  style={{
                    backgroundImage: `url(${HERO_LISTING_PHOTO})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <div className="body">
                  <p className="title">2019 Honda Accord EX-L</p>
                  <p className="price dl-data">$21,900</p>
                  <p className="specs">48,210 mi</p>
                </div>
              </div>
              <div className="mt-5 grid gap-2.5">
                {["Facebook Marketplace", "Instagram", "Craigslist"].map((channel) => (
                  <div key={channel} className="flex items-center justify-between gap-3">
                    <span className="dl-small" style={{ color: "var(--text)" }}>
                      {channel}
                    </span>
                    <span className="dl-pill dl-pill--live">Live</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="dl-container dl-section"
          style={{
            borderTop: "1px solid var(--border)",
          }}
        >
          <div className="grid gap-3 max-w-xl">
            <span className="dl-eyebrow">How it works</span>
            <h2 className="dl-h2">
              Three steps, <em>one listing.</em>
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {steps.map((step) => (
              <div key={step.n} className="dl-card">
                <span className="dl-data dl-small" style={{ color: "var(--accent-text)" }}>
                  {step.n}
                </span>
                <h3 className="dl-h4 mt-3">{step.title}</h3>
                <p className="dl-small mt-2">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Field band: the payoff */}
        <section className="dl-field-band">
          <div className="dl-field-band__art">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/dealerloft-hero-field.svg" alt="" />
          </div>
          <div className="dl-container dl-field-band__inner">
            <div className="dl-field-band__copy">
              <span className="dl-eyebrow">What happens next</span>
              <h2 className="dl-h2">
                Listings that <em>attract.</em>
              </h2>
              <p className="dl-lead">
                Your listing goes out to three channels at once. Buyers&apos;
                messages come back to one inbox, so you answer faster and
                sell sooner.
              </p>
              <Link href="/signup" className="dl-btn dl-btn--secondary">
                See the inbox
              </Link>
            </div>
            <ul className="dl-attract">
              {inboxMessages.map((msg) => (
                <li key={msg.channel}>
                  <div className="dl-msg">
                    <small>
                      {msg.channel} · {msg.time}
                    </small>
                    {msg.text}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="dl-container dl-section">
          <div className="grid gap-3 max-w-xl">
            <span className="dl-eyebrow">Pricing</span>
            <h2 className="dl-h2">Free while we&apos;re in beta.</h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            <div className="dl-card grid gap-5">
              <div className="flex items-center justify-between">
                <span className="dl-pill dl-pill--live">Open now</span>
                <span className="dl-small">Beta</span>
              </div>
              <p className="dl-h3">$0 / month</p>
              <ul className="dl-body grid gap-2" style={{ color: "var(--text-muted)" }}>
                <li>Unlimited listings</li>
                <li>All three channels</li>
                <li>Direct line to the founders</li>
              </ul>
              <Link href="/signup" className="dl-btn dl-btn--primary dl-btn--block">
                Join the beta
              </Link>
            </div>
            <div className="dl-card grid gap-5">
              <div className="flex items-center justify-between">
                <span className="dl-pill dl-pill--draft">After beta</span>
                <span className="dl-small">Dealer</span>
              </div>
              <p className="dl-h3">TBA</p>
              <ul className="dl-body grid gap-2" style={{ color: "var(--text-muted)" }}>
                <li>Beta dealers get launch pricing</li>
                <li>We&apos;ll email you before anything changes</li>
              </ul>
              <Link href="/signup" className="dl-btn dl-btn--secondary dl-btn--block">
                Get notified
              </Link>
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section style={{ borderTop: "1px solid var(--border)", background: "var(--surface)" }}>
          <div className="dl-container dl-section text-center grid gap-6 justify-items-center">
            <span className="dl-eyebrow">Free during beta</span>
            <h2 className="dl-h2 max-w-2xl">
              Get your lot on every channel this week.
            </h2>
            <form className="flex w-full max-w-sm flex-col gap-2 sm:flex-row">
              <input
                type="email"
                placeholder="Work email"
                className="dl-input"
                disabled
              />
              <button type="submit" className="dl-btn dl-btn--primary" disabled>
                Join the beta
              </button>
            </form>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
