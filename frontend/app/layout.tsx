

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AutoBook Generator",
  description: "AI-powered book generation with human review",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}