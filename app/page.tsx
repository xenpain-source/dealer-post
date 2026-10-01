import Link from "next/link";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";

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
        <section className="dl-container" style={{ paddingBlock: "var(--dl-space-24)" }}>
          <div className="dl-golden">
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
                <div className="media" />
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
          className="dl-container"
          style={{
            paddingBlock: "var(--dl-space-24)",
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
        <section
          id="pricing"
          className="dl-container"
          style={{ paddingBlock: "var(--dl-space-24)" }}
        >
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
          <div
            className="dl-container text-center grid gap-6 justify-items-center"
            style={{ paddingBlock: "var(--dl-space-24)" }}
          >
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
