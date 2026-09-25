import Link from "next/link";
import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Sign up — Dealer Post",
};

export default function SignUpPage() {
  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-zinc-50 px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 flex justify-center"
      >
        <div className="h-[28rem] w-[56rem] rounded-full bg-gradient-to-b from-indigo-100 via-indigo-50 to-transparent blur-3xl" />
      </div>

      <div className="relative flex w-full max-w-sm flex-col items-center">
        <Link
          href="/"
          className="mb-6 flex items-center gap-2 text-lg font-semibold"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-4.5 w-4.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 17h14M6 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm16 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
              <path d="M3 17V9.6a1 1 0 0 1 .4-.8l3.2-2.4a2 2 0 0 1 1.2-.4h7.4a2 2 0 0 1 1.7 1l2.4 4 2.1.7a1 1 0 0 1 .6.9V17" />
            </svg>
          </span>
          Dealer Post
        </Link>

        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "w-full rounded-2xl border border-zinc-200 shadow-xl shadow-zinc-200/60",
              formButtonPrimary:
                "bg-indigo-600 hover:bg-indigo-700 text-sm normal-case",
              footerActionLink: "text-indigo-600 hover:text-indigo-700",
            },
          }}
        />
      </div>
    </div>
  );
}
