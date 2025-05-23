import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Eyes Simulator",
  description: "A medical education tool for eye disease simulation and analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script src="/debug.js" async></script>
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
