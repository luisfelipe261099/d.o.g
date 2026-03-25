"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useAppStore, type UserRole } from "@/lib/app-store";

export function AuthGuard({ children, role }: { children: React.ReactNode; role?: UserRole | UserRole[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useAppStore((state) => state.hydrated);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const userRole = useAppStore((state) => state.userRole);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [hydrated, isAuthenticated, pathname, router]);

  if (!hydrated) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-[var(--border)] bg-white/85 p-8">
          <p className="text-sm text-[var(--muted)]">Carregando sessão...</p>
        </div>
      </div>
    );
  }

  const hasRoleAccess =
    !role || (Array.isArray(role) ? role.includes(userRole) : userRole === role);

  if (!isAuthenticated || !hasRoleAccess) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-[var(--border)] bg-white/85 p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            Acesso restrito
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold">
            {role ? "Perfil sem permissão para esta página." : "Acesso não autorizado."}
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
            {role
              ? "Faça login com a conta apropriada para acessar este módulo."
              : "Faça login para acessar os módulos do sistema."}
          </p>
          <Link
            href={`/login?next=${encodeURIComponent(pathname)}`}
            className="mt-6 inline-flex rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-semibold text-white"
          >
            Ir para login
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}