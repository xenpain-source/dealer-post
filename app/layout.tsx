import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dealer Post",
  description:
    "Post your used car inventory to Facebook Marketplace, Craigslist, Instagram and more from one place.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en" className="h-full antialiased">
        <body className="min-h-full flex flex-col bg-white text-zinc-900">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
