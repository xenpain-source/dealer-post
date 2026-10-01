import type { Metadata } from "next";
import { Outfit, Manrope, IBM_Plex_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-outfit",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DealerLoft",
  description:
    "Post your used car inventory to Facebook Marketplace, Craigslist, Instagram and more from one place.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html
        lang="en"
        className={`h-full antialiased ${outfit.variable} ${manrope.variable} ${plexMono.variable}`}
      >
        <body className="dl-root dl-light min-h-full flex flex-col">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
