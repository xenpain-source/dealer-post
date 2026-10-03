import Link from "next/link";
import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { BrandLogoSmall } from "@/components/BrandLogo";
import { AttractPanel } from "@/components/brand/AttractPanel";

export const metadata: Metadata = {
  title: "Sign up — DealerLoft",
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string | string[] }>;
}) {
  // Pre-fill the email typed into the landing page's closing "Join the
  // beta" form (it submits here as ?email=...).
  const { email } = await searchParams;
  const emailAddress = typeof email === "string" && email.length <= 254 ? email.trim() : undefined;

  return (
    <div
      className="flex-1 grid"
      style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1.618fr)" }}
    >
      <AttractPanel />

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
            initialValues={emailAddress ? { emailAddress } : undefined}
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
