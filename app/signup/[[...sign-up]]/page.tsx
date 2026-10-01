import Link from "next/link";
import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { BrandLogoSmall } from "@/components/BrandLogo";

export const metadata: Metadata = {
  title: "Sign up — DealerLoft",
};

export default function SignUpPage() {
  return (
    <div
      className="flex-1 grid"
      style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1.618fr)" }}
    >
      {/* Brand panel */}
      <div
        className="dl-dark relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12"
        style={{ background: "var(--bg)" }}
      >
        <div className="absolute inset-0" style={{ zIndex: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/dealerloft-hero-field.svg"
            alt=""
            className="h-full w-full object-cover"
            style={{ objectPosition: "left center" }}
          />
        </div>
        <Link href="/" aria-label="DealerLoft home" className="relative">
          <BrandLogoSmall tone="white" className="h-6 w-auto" />
        </Link>
        <h2 className="dl-display relative">
          Listings that
          <br />
          <em>attract.</em>
        </h2>
      </div>

      {/* Form */}
      <div className="dl-light flex items-center justify-center px-6 py-16">
        <div className="grid w-full max-w-sm gap-6">
          <Link href="/" aria-label="DealerLoft home" className="lg:hidden">
            <BrandLogoSmall tone="cobalt" className="h-6 w-auto" />
          </Link>

          <div>
            <h1 className="dl-h2">Join the beta</h1>
            <p className="dl-small mt-1">
              Free while we&apos;re in beta. Connect your channels after you
              sign up, inside the app.
            </p>
          </div>

          <SignUp
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "w-full shadow-none border-0 p-0 bg-transparent",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                formButtonPrimary: "dl-btn dl-btn--primary dl-btn--block normal-case",
                formFieldInput: "dl-input",
                formFieldLabel: "dl-label",
                footerActionLink: "dl-link",
                dividerText: "dl-small",
                socialButtonsBlockButton: "dl-btn dl-btn--secondary dl-btn--block normal-case",
                identityPreviewText: "dl-small",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
