import type { ReactNode } from "react";

import { AuthGuard } from "@/components/auth-guard";
import type { UserRole } from "@/lib/app-store";

type PageShellProps = {
  kicker: string;
  title: string;
  description: string;
  requireAuth?: boolean | UserRole;
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
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pb-24 lg:pt-10">
      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-[var(--shadow)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
          {kicker}
        </p>
        <h1 className="mt-4 max-w-4xl font-display text-4xl font-semibold leading-tight sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--muted)] sm:text-lg">
          {description}
        </p>
      </section>

      {children}
    </main>
  );

  if (requireAuth) {
    return <AuthGuard role={typeof requireAuth === "string" ? requireAuth : undefined}>{content}</AuthGuard>;
  }

  return content;
}