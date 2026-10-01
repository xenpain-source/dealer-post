import Link from "next/link";
import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { BrandLogo } from "@/components/BrandLogo";

export const metadata: Metadata = {
  title: "Sign up — DealerLoft",
};

export default function SignUpPage() {
  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-zinc-50 px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 flex justify-center"
      >
        <div className="h-[28rem] w-[56rem] rounded-full bg-gradient-to-b from-cobalt-100 via-cobalt-50 to-transparent blur-3xl" />
      </div>

      <div className="relative flex w-full max-w-sm flex-col items-center">
        <Link href="/" aria-label="DealerLoft home" className="mb-6">
          <BrandLogo className="h-7 w-auto" />
        </Link>

        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "w-full rounded-2xl border border-zinc-200 shadow-xl shadow-zinc-200/60",
              formButtonPrimary:
                "bg-cobalt-600 hover:bg-cobalt-700 text-sm normal-case",
              footerActionLink: "text-cobalt-600 hover:text-cobalt-700",
            },
          }}
        />
      </div>
    </div>
  );
}
