import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";

import { AppSessionProvider } from "@/components/app-session-provider";
import { SiteHeader } from "@/components/site-header";
import { DataLoader } from "@/components/data-loader";

import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  preload: false,
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  preload: false,
});

export const metadata: Metadata = {
  title: "PegadaCerta",
  description:
    "Plataforma para adestradores gerenciarem rotina, treinos, relatorios e agenda com apoio de IA.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <body
        className={`${dmSans.variable} ${spaceGrotesk.variable} min-h-dvh bg-[var(--background)] font-sans text-[var(--foreground)] antialiased`}
      >
        <AppSessionProvider>
          <DataLoader />
          <div className="relative isolate min-h-dvh overflow-x-hidden">
            <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_top,_rgba(36,140,196,0.2),_transparent_40%),radial-gradient(circle_at_top_right,_rgba(31,154,138,0.16),_transparent_28%)]" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-96 bg-[radial-gradient(circle_at_bottom_left,_rgba(33,152,129,0.14),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(245,186,86,0.12),_transparent_35%)]" />
            <SiteHeader />
            {children}
          </div>
        </AppSessionProvider>
      </body>
    </html>
  );
}
