import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Flower - AI Workflow Platform",
  description: "Build, share, and deploy AI workflows with ease",
  keywords: ["AI", "workflows", "automation", "machine learning", "cerebras"],
  authors: [{ name: "Flower Team" }],
  openGraph: {
    title: "Flower - AI Workflow Platform",
    description: "Build, share, and deploy AI workflows with ease",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
