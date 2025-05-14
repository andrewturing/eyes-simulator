import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Eyes Simulator - University Medical Education Tool",
  description: "A medical education tool for eye disease simulation and analysis",
  icons: {
    icon: [
      {
        url: "/university-logo.svg",
        type: "image/svg+xml",
        sizes: "any"
      }
    ],
    shortcut: "/university-logo.svg",
    apple: "/university-logo.svg",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
