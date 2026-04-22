"use client";

import type { ReactNode } from "react";

import { AuthGuard } from "@/components/auth-guard";
import type { UserRole } from "@/lib/app-store";

type PageShellProps = {
  kicker: string;
  title: string;
  description: string;
  requireAuth?: boolean | UserRole | UserRole[];
  children: ReactNode;
};

export function PageShell({
  kicker,
  title,
  description,
  requireAuth = false,
  children,
}: PageShellProps) {
  const content = (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-3 pb-10 pt-3 sm:gap-4 sm:px-6 sm:pt-5 lg:px-8 lg:pb-20 lg:pt-6">
      <section className="relative overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[linear-gradient(135deg,_rgba(248,253,255,0.96),_rgba(236,248,255,0.95)_58%,_rgba(228,241,250,0.98))] shadow-[var(--shadow)]">
        <div className="pointer-events-none absolute -right-16 top-0 h-40 w-40 rounded-full bg-[rgba(34,137,190,0.12)] blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 rounded-full bg-[rgba(31,154,138,0.1)] blur-3xl" />
        <div className="px-4 py-4 sm:px-6 sm:py-5 lg:px-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[rgba(20,90,130,0.8)]">
            {kicker}
            </p>
            <h1 className="mt-2 max-w-4xl font-display text-2xl font-semibold leading-tight text-[var(--foreground)] sm:text-3xl lg:text-4xl">
            {title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-sm sm:leading-7 lg:text-base">
            {description}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-[var(--border)] bg-[rgba(255,250,245,0.62)] p-3 shadow-sm backdrop-blur-md sm:p-4">
        {children}
      </section>
    </main>
  );

  if (requireAuth) {
    const role = Array.isArray(requireAuth) || typeof requireAuth === "string" ? requireAuth : undefined;
    return <AuthGuard role={role}>{content}</AuthGuard>;
  }

  return content;
}