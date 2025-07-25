import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { ThemeProvider } from "../components/provider";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
export const metadata: Metadata = {
  title: "BidBase - Discover & Manage RFQs and RFPs",
  description:
    "Navigate procurement opportunities with confidence. BidBase helps business owners and organizations discover, track, and manage RFQs and RFPs efficiently.",
  openGraph: {
    title: "BidBase - Procurement Opportunity Management",
    description:
      "Navigate procurement opportunities with confidence. BidBase helps business owners and organizations discover, track, and manage RFQs and RFPs efficiently.",
    url: "bidbase.com",
    siteName: "BidBase",
    images: [
      {
        url: "https://jdj14ctwppwprnqu.public.blob.vercel-storage.com/nsk-w9fFwBBmLDLxrB896I4xqngTUEEovS.png",
        width: 1200,
        height: 630,
        alt: "BidBase - Procurement Opportunity Management",
      },
    ],
    locale: "en-US",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-[-apple-system,BlinkMacSystemFont]antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          forcedTheme="light"
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
