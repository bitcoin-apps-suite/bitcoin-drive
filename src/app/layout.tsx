import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import PocBar from "@/components/PocBar";
import DevLayout from "@/components/DevLayout";
import Footer from "@/components/Footer";
import BitcoinOSWrapper from "@/components/BitcoinOSWrapper";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bitcoin Drive",
  description: "Store your files on the Bitcoin SV blockchain with Google integration",
  icons: {
    icon: [
      { url: "/favicon.jpg", type: "image/jpeg" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/bitcoin-drive-icon.ico", type: "image/x-icon" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Bitcoin Drive",
    description: "Store your files on the Bitcoin SV blockchain with Google integration",
    url: "https://bitcoin-drive.vercel.app",
    siteName: "Bitcoin Drive",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Bitcoin Drive - Decentralized File Storage",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bitcoin Drive",
    description: "Store your files on the Bitcoin SV blockchain with Google integration",
    images: ["/og-image.jpg"],
  },
  metadataBase: new URL("https://bitcoin-drive.vercel.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ServiceWorkerRegistration />
        <Providers>
          <BitcoinOSWrapper>
            <DevLayout>
              <div style={{ minHeight: 'calc(100vh - 32px)', display: 'flex', flexDirection: 'column' }}>
                {children}
                <Footer />
              </div>
            </DevLayout>
          </BitcoinOSWrapper>
        </Providers>
      </body>
    </html>
  );
}
