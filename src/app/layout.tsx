import type { Metadata, Viewport } from "next";
import SessionProvider from "@/lib/SessionProvider";
import TopBar from "@/components/TopBar";
import BottomTabs from "@/components/BottomTabs";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Boshaw Classic",
  description: "Bachelor party golf tournament — Lake Chelan 2026",
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
    <html lang="en" className="dark h-full">
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
      <body className="min-h-full flex flex-col bg-background text-on-surface font-body antialiased">
        <SessionProvider>
          <TopBar />
          <main className="flex-grow pt-20 pb-32">
            {children}
          </main>
          <BottomTabs />
        </SessionProvider>
      </body>
    </html>
  );
}
