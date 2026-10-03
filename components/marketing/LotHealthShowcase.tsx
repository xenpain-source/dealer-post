"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// Landing-page section: a mock of the dealer Overview that starts on the
// Showroom view and, the first time it scrolls into view, flips once to Lot
// health (the cards drop away as the stats, age bar and to-dos come in).
// Visitors can flip it back and forth with the toggle afterwards.
//
// One-time animation, ~1 s, per the Web UI guide; with reduced motion on
// the flip still happens, just without movement (CSS in globals.css).
// Sample data only; nothing here reads a real dealer's lot.

type View = "showroom" | "health";

const CARS = [
  { name: "2019 Honda Accord EX-L", price: "$21,900", miles: "48,210 mi", status: "live", label: "Live", photo: null },
  { name: "2018 Toyota RAV4 LE", price: "$19,850", miles: "58,420 mi", status: "publishing", label: "Publishing", photo: "/marketing/showroom-rav4.jpg" },
  { name: "2017 Ford F-150 XLT", price: "$29,700", miles: "71,305 mi", status: "live", label: "Live", photo: "/marketing/showroom-f150.jpg" },
  { name: "2021 Hyundai Elantra SEL", price: "$18,900", miles: "39,120 mi", status: "draft", label: "Draft", photo: "/marketing/showroom-elantra.jpg" },
] as const;

const AGING = [
  { count: 9, label: "Fresh", color: "var(--success-dot)" },
  { count: 7, label: "Normal", color: "var(--accent)" },
  { count: 4, label: "Watch", color: "var(--warning-dot)" },
  { count: 2, label: "Aging", color: "var(--danger-fg)" },
];

const VIEWS: { key: View; label: string }[] = [
  { key: "showroom", label: "Showroom" },
  { key: "health", label: "Lot health" },
];

export function LotHealthShowcase({ accordPhoto }: { accordPhoto: string }) {
  const [view, setView] = useState<View>("showroom");
  const appRef = useRef<HTMLDivElement>(null);

  // Flip to Lot health once, shortly after the mock first comes into view.
  useEffect(() => {
    const el = appRef.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        timer = setTimeout(() => setView((v) => (v === "showroom" ? "health" : v)), 900);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <section className="dl-container dl-section" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="dl-showcase">
        <div className="grid gap-3 justify-items-start">
          <span className="dl-eyebrow">Your dashboard</span>
          <h2 className="dl-h2">
            Your lot, two ways: <em>showroom and health.</em>
          </h2>
          <p className="dl-lead mt-2">
            Browse your cars like a buyer would, then flip to see what they&apos;re
            worth, how long they&apos;ve sat, and what to fix.
          </p>
          <Link href="/signup" className="dl-btn dl-btn--secondary mt-4">
            See the dashboard
          </Link>
        </div>

        <div ref={appRef} className={`dl-showcase__app ${view === "health" ? "is-health" : ""}`}>
          <div className="dl-showcase__toggle" role="tablist" aria-label="Dashboard view">
            {VIEWS.map((v) => (
              <button
                key={v.key}
                type="button"
                role="tab"
                aria-selected={view === v.key}
                onClick={() => setView(v.key)}
              >
                {v.label}
              </button>
            ))}
          </div>

          <div className="dl-showcase__stage">
            <ul className="dl-showcase__cards" aria-hidden={view !== "showroom"} inert={view !== "showroom"}>
              {CARS.map((car) => (
                <li key={car.name} className="dl-showcase__card">
                  {/* Photo stays clean; the status pill sits with the title,
                      as in the identity guide's listing card. */}
                  <div className="dl-showcase__photo">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={car.photo ?? accordPhoto} alt={car.name} loading="lazy" />
                  </div>
                  {/* Title takes the free space, so the pill, price and
                      mileage line up across cards whatever the title length. */}
                  <div className="dl-showcase__body">
                    <b className="dl-showcase__title">{car.name}</b>
                    <span className={`dl-pill dl-pill--${car.status}`}>{car.label}</span>
                    <span className="dl-data dl-showcase__price">{car.price}</span>
                    <small className="dl-data">{car.miles}</small>
                  </div>
                </li>
              ))}
            </ul>

            <div className="dl-showcase__health" aria-hidden={view !== "health"} inert={view !== "health"}>
              <div className="dl-showcase__stats">
                <div>
                  <span>Lot value</span>
                  <b className="dl-data">$486,350</b>
                </div>
                <div>
                  <span>On Facebook</span>
                  <b className="dl-data">18 / 22</b>
                </div>
                <div>
                  <span>Avg days</span>
                  <b className="dl-data">23</b>
                </div>
              </div>
              <div
                className="dl-showcase__bar"
                role="img"
                aria-label={AGING.map((a) => `${a.count} ${a.label.toLowerCase()}`).join(", ")}
              >
                {AGING.map((a) => (
                  <i key={a.label} style={{ flex: a.count, background: a.color }} />
                ))}
              </div>
              <div className="dl-showcase__legend">
                {AGING.map((a) => (
                  <div key={a.label}>
                    <b className="dl-data">{a.count}</b>
                    {a.label}
                  </div>
                ))}
              </div>
              <div className="dl-showcase__todo">
                <span className="dl-pill dl-pill--failed">72 days · Altima</span>
                <span className="dl-pill dl-showcase__pill-warn">No photos · Mazda3</span>
                <span className="dl-pill dl-pill--draft">Not on Facebook · Sorento</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
