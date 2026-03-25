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
      <section className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[linear-gradient(145deg,_rgba(15,23,42,0.96),_rgba(17,32,51,0.95)_50%,_rgba(30,41,59,0.93))] shadow-[var(--shadow)]">
        <div className="px-6 py-7 text-white sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
            {kicker}
          </p>
          <h1 className="mt-3 max-w-4xl font-display text-4xl font-semibold leading-tight sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-200 sm:text-lg">
            {description}
          </p>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-[var(--border)] bg-white/55 p-3 shadow-sm backdrop-blur-sm sm:p-4">
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