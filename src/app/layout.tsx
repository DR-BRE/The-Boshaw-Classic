import type { Metadata, Viewport } from "next";
import SessionProvider from "@/lib/SessionProvider";
import LayoutShell from "@/components/LayoutShell";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://the-boshaw-classic.vercel.app"),
  title: "The Boshaw Classic",
  description: "Bachelor party golf tournament — Lake Chelan 2026",
  openGraph: {
    title: "The Boshaw Classic",
    description: "Bachelor party golf tournament — Lake Chelan 2026",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 635,
        type: "image/png",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Boshaw Classic",
    description: "Bachelor party golf tournament — Lake Chelan 2026",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#051612",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&family=Manrope:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-dvh flex flex-col bg-background text-on-surface font-body antialiased">
        <SessionProvider>
          <LayoutShell>{children}</LayoutShell>
        </SessionProvider>
      </body>
    </html>
  );
}
