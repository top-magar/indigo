import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { NavigationProgress } from "@/components/ui/navigation-progress";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";

// Using system font stack for optimal performance and native feel
// No custom fonts to load - instant rendering

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
        className="font-sans antialiased"
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* Vercel Analytics */}
          <Analytics />
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

