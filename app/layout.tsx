import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";

import { SiteHeader } from "@/components/site-header";

import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "D.O.G Platform",
  description:
    "Plataforma para gestão completa de adestradores profissionais de cães.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${dmSans.variable} ${spaceGrotesk.variable} min-h-screen bg-[var(--background)] font-sans text-[var(--foreground)] antialiased`}
      >
        <div className="relative isolate min-h-screen overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_top,_rgba(234,179,8,0.22),_transparent_40%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.2),_transparent_28%)]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-96 bg-[radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.14),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.14),_transparent_35%)]" />
          <SiteHeader />
          {children}
        </div>
      </body>
    </html>
  );
}
