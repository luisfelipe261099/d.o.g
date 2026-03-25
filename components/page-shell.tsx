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
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pb-24 lg:pt-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[linear-gradient(135deg,_rgba(255,248,241,0.96),_rgba(247,236,224,0.95)_58%,_rgba(231,218,202,0.98))] shadow-[var(--shadow)]">
        <div className="pointer-events-none absolute -right-16 top-0 h-48 w-48 rounded-full bg-[rgba(181,111,76,0.16)] blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 rounded-full bg-[rgba(64,93,78,0.14)] blur-3xl" />
        <div className="px-6 py-7 sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[rgba(120,76,52,0.82)]">
            {kicker}
            </p>
            <h1 className="mt-3 max-w-4xl font-display text-4xl font-semibold leading-tight text-[var(--foreground)] sm:text-5xl">
            {title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--muted)] sm:text-lg">
            {description}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-[var(--border)] bg-[rgba(255,250,245,0.68)] p-3 shadow-sm backdrop-blur-md sm:p-4">
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