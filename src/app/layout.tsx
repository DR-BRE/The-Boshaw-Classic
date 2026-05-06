import type { Metadata, Viewport } from "next";
import SessionProvider from "@/lib/SessionProvider";
import LayoutShell from "@/components/LayoutShell";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://the-boshaw-classic.vercel.app"),
  title: "The Boshaw Classic",
  description: "Bachelor party golf tournament — Lake Chelan 2026",
  appleWebApp: {
    capable: true,
    title: "Boshaw",
    statusBarStyle: "black-translucent",
  },
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
  themeColor: "#0D1117",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark overflow-hidden h-dvh" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var s=JSON.parse(localStorage.getItem("boshaw-settings")||"{}");if(s.theme==="light")document.documentElement.classList.add("light")}catch(e){}`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-dvh overflow-y-auto bg-background text-on-surface font-body antialiased">
        <SessionProvider>
          <LayoutShell>{children}</LayoutShell>
        </SessionProvider>
      </body>
    </html>
  );
}
