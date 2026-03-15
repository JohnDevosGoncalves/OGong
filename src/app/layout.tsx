import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";
import { InstallPrompt } from "@/components/ui";
import SplashScreen from "@/components/SplashScreen";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "OGong — Générateur de rencontres",
    template: "%s | OGong",
  },
  description:
    "Organisez vos événements de networking : speed meetings, team building et job datings. Gestion automatisée des tours, tables et temps de parole.",
  manifest: "/manifest.json",
};

const themeScript = `
(function() {
  var t = localStorage.getItem('ogong-theme');
  if (t === 'dark' || (!t || t === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <meta name="theme-color" content="#5b4cff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ServiceWorkerRegistrar />
        <LocaleProvider>
          <ThemeProvider>
            <SplashScreen />
            {children}
          </ThemeProvider>
        </LocaleProvider>
        <InstallPrompt />
      </body>
    </html>
  );
}
