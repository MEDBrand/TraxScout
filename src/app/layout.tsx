import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Viewport configuration for mobile
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#7C3AED',
  colorScheme: 'dark',
};

export const metadata: Metadata = {
  title: "TRAXSCOUT - AI Track Discovery for DJs",
  description: "Stop digging through hundreds of releases. Get a curated list of tracks that actually fit your sound.",
  keywords: ["DJ", "music discovery", "Beatport", "Traxsource", "tech house", "AI curation"],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TRAXSCOUT',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "TRAXSCOUT - AI Track Discovery for DJs",
    description: "Stop digging through hundreds of releases. Get a curated list of tracks that actually fit your sound.",
    url: "https://traxscout.app",
    siteName: "TRAXSCOUT",
    type: "website",
    images: [
      {
        url: "https://traxscout.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "TRAXSCOUT - Find 20 fire tracks in 20 minutes, not 5 hours",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TRAXSCOUT - AI Track Discovery for DJs",
    description: "Stop digging through hundreds of releases. Get a curated list of tracks that actually fit your sound.",
    images: ["https://traxscout.app/og-image.png"],
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

// Service Worker Registration Script
const swScript = `
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('[SW] Registered:', reg.scope))
        .catch(err => console.warn('[SW] Registration failed:', err));
    });
  }
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* PWA Apple Touch Icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-96.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-72.png" />
        
        {/* Service Worker Registration */}
        <script dangerouslySetInnerHTML={{ __html: swScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
