import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const aeonik = localFont({
  src: [
    {
      path: "../../public/fonts/Aeonik-Medium.ttf",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-aeonik",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Indigo - E-Commerce Platform for Nepal",
  description: "The e-commerce platform that grows with your business. Built for Nepal. Loved by merchants.",
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
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

