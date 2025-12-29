import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { NavigationProgress } from "@/components/ui/navigation-progress";
import { WebVitals, PageViewTracker } from "@/components/analytics";
import { Suspense } from "react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const aeonik = localFont({
  src: [
    {
      path: "../../public/fonts/aeonik-medium.ttf",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-aeonik",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Indigo - E-Commerce Platform for Nepal",
    template: "%s | Indigo",
  },
  description: "The e-commerce platform that grows with your business. Built for Nepal. Loved by merchants.",
  keywords: ["e-commerce", "Nepal", "online store", "multi-tenant", "marketplace"],
  authors: [{ name: "Indigo" }],
  creator: "Indigo",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Indigo",
    title: "Indigo - E-Commerce Platform for Nepal",
    description: "The e-commerce platform that grows with your business. Built for Nepal. Loved by merchants.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Indigo - E-Commerce Platform for Nepal",
    description: "The e-commerce platform that grows with your business. Built for Nepal. Loved by merchants.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${aeonik.variable} font-sans antialiased`}
        style={
          {
            "--font-brand": "sans-serif",
          } as React.CSSProperties
        }
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* Web Vitals tracking */}
          <WebVitals />
          {/* Page view tracking (in Suspense to handle searchParams) */}
          <Suspense fallback={null}>
            <PageViewTracker />
          </Suspense>
          {/* Global navigation progress bar */}
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

