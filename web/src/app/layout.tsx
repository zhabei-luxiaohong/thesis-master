import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Thesis Master - AI Academic Writing Suite",
  description:
    "AI-powered academic writing assistant. Plan, write, review, and collaborate on your thesis with cutting-edge AI technology.",
  keywords: [
    "thesis",
    "academic writing",
    "AI writing assistant",
    "research",
    "dissertation",
    "paper writing",
    "academic AI",
  ],
  authors: [{ name: "Thesis Master" }],
  openGraph: {
    title: "Thesis Master - AI Academic Writing Suite",
    description:
      "AI-powered academic writing assistant. Plan, write, review, and collaborate on your thesis with cutting-edge AI technology.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[#0a0e27]">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
