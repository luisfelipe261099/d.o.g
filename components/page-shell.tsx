"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";

import { AuthGuard } from "@/components/auth-guard";
import { useAppStore } from "@/lib/app-store";
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
  const userRole = useAppStore((state) => state.userRole);
  const trainerName = useAppStore((state) => state.trainerName);

  const roleLabel = useMemo(() => {
    if (userRole === "admin") return "Administrador";
    if (userRole === "client") return "Cliente";
    return "Adestrador";
  }, [userRole]);

  const content = (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pb-24 lg:pt-8">
      <section className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] shadow-[var(--shadow)]">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] bg-white/80 px-5 py-3 backdrop-blur sm:px-7">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <span className="rounded-full border border-[var(--border)] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              {kicker}
            </span>
            <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-800">
              {roleLabel}
            </span>
            {trainerName ? (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-800">
                {trainerName}
              </span>
            ) : null}
          </div>
        </div>

        <div className="bg-[linear-gradient(145deg,_rgba(15,23,42,0.96),_rgba(17,32,51,0.95)_50%,_rgba(30,41,59,0.93))] px-6 py-7 text-white sm:px-8">
          <h1 className="max-w-4xl font-display text-4xl font-semibold leading-tight sm:text-5xl">
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