import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ToastProvider } from "@/components/Toast";
import Navbar from "@/components/Navbar";
import LoadingScreen from "@/components/LoadingScreen";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "stephud - Visual Tutorial Platform",
    template: "%s | stephud",
  },
  description: "Create and follow step-by-step visual guides for DIY, cooking, tech, crafts, and more.",
  openGraph: {
    type: "website",
    siteName: "stephud",
    title: "stephud - Visual Tutorial Platform",
    description: "Create and follow step-by-step visual guides for DIY, cooking, tech, crafts, and more.",
  },
  twitter: {
    card: "summary_large_image",
    site: "@stephud",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
        <Script id="theme-init" strategy="beforeInteractive">
          {`try{
            var t=localStorage.getItem('theme')||'dark';
            document.documentElement.setAttribute('data-theme',t);
          }catch(e){}`}
        </Script>
      </head>
      <body className={`${inter.className} min-h-full flex flex-col`} style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <Suspense fallback={null}><LoadingScreen /></Suspense>
              <Navbar />
              <main className="flex-1">{children}</main>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
