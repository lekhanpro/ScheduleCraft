import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono, Syne } from "next/font/google";

import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["700", "800"]
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "700"]
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "700"]
});

export const metadata: Metadata = {
  metadataBase: new URL("https://schedulecraft.vercel.app"),
  title: "ScheduleCraft",
  description: "A visual timetable builder with conflict detection, heatmaps, and intelligent study window recommendations.",
  openGraph: {
    title: "ScheduleCraft",
    description: "Mission-control scheduling for students and teams.",
    url: "https://schedulecraft.vercel.app",
    siteName: "ScheduleCraft",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ScheduleCraft dashboard preview"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "ScheduleCraft",
    description: "Your week, analyzed.",
    images: ["/og-image.png"]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={[
          syne.variable,
          dmSans.variable,
          jetBrainsMono.variable,
          "min-h-screen bg-background font-sans text-foreground antialiased"
        ].join(" ")}
      >
        {children}
      </body>
    </html>
  );
}
