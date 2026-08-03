import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { NavigationProgress } from "@/components/ui/navigation-progress";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import { ServiceWorkerRegister } from "@/components/sw-register";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "Indigo - E-Commerce Platform for Nepal",
    template: "%s | Indigo",
  },
  description: "A visual storefront editor and connected commerce workspace built for Nepal.",
  keywords: ["e-commerce", "Nepal", "online store", "multi-tenant", "marketplace"],
  authors: [{ name: "Indigo" }],
  creator: "Indigo",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL 
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Indigo",
    title: "Indigo - E-Commerce Platform for Nepal",
    description: "A visual storefront editor and connected commerce workspace built for Nepal.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Indigo - E-Commerce Platform for Nepal",
    description: "A visual storefront editor and connected commerce workspace built for Nepal.",
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
        className={`${inter.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* Skip to content link for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:rounded-md focus:border focus:border-border focus:outline-none focus:ring-2 focus:ring-primary"
          >
            Skip to content
          </a>
          {/* The local self-hosted server does not expose Vercel's insights route. */}
          {process.env.VERCEL ? <Analytics /> : null}
          {/* Global navigation progress bar */}
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          {children}
        </ThemeProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
