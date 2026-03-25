"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useAppStore } from "@/lib/app-store";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/login";
  const [menuOpen, setMenuOpen] = useState(false);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const userRole = useAppStore((state) => state.userRole);
  const trainerName = useAppStore((state) => state.trainerName);
  const logout = useAppStore((state) => state.logout);

  function handleLogout() {
    setMenuOpen(false);
    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "auto";
    logout();
    router.replace("/login");
  }

  const adminNav = [
    { href: "/admin", label: "Dashboard", kicker: "Admin", description: "Visão geral da plataforma" },
    { href: "/admin/adestradores", label: "Adestradores", kicker: "Gestão", description: "Gerenciar adestradores" },
    { href: "/admin/planos", label: "Planos", kicker: "Preços", description: "Configurar planos" },
    { href: "/admin/faturamento", label: "Faturamento", kicker: "Financeiro", description: "Receitas e pagamentos" },
    { href: "/admin/relatorios", label: "Relatórios", kicker: "Analytics", description: "Análises da plataforma" },
  ];

  const trainerNav = [
    { href: "/dashboard", label: "Dashboard", kicker: "Home", description: "Visão geral da operação" },
    { href: "/clientes", label: "Clientes", kicker: "Carteira", description: "Gestão de clientes" },
    { href: "/treinos", label: "Treinos", kicker: "Técnica", description: "Registro de sessões" },
    { href: "/agenda", label: "Agenda", kicker: "Calendário", description: "Agendamentos" },
    { href: "/portal", label: "Portal do Cliente", kicker: "Externo", description: "Gerenciar acesso do cliente" },
    { href: "/financeiro", label: "Financeiro", kicker: "Financeiro", description: "Gestão financeira" },
  ];

  const clientNav = [
    { href: "/portal/cliente", label: "Meu Portal", kicker: "Cliente", description: "Visão do tutor" },
  ];

  const visibleNav = isAuthenticated
    ? userRole === "admin"
      ? adminNav
      : userRole === "trainer"
        ? trainerNav
        : clientNav
    : [];

  const roleLabel = userRole === "admin" ? "Administrador" : userRole === "client" ? "Cliente" : "Adestrador";

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    };
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[rgba(255,247,240,0.82)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/60 bg-[linear-gradient(145deg,_#5f3421,_#2f221d)] font-display text-base font-semibold text-white shadow-[0_10px_30px_rgba(95,52,33,0.24)] sm:h-12 sm:w-12 sm:text-lg">
              DOG
            </div>
            <div>
              <p className="font-display text-lg font-semibold sm:text-xl">D.O.G Platform</p>
              <p className="text-xs text-[var(--muted)] sm:text-sm">SaaS para adestradores</p>
            </div>
          </Link>

          <div className="hidden items-center gap-2 lg:flex">
            {isAuthenticated ? (
              <span className="rounded-full border border-[rgba(181,111,76,0.22)] bg-[rgba(181,111,76,0.12)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7c4e35]">
                {roleLabel}
              </span>
            ) : null}

            {visibleNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                  pathname === item.href
                    ? "border-[#5f3421] bg-[#5f3421] text-white shadow-[0_12px_24px_rgba(95,52,33,0.24)]"
                    : "border-[rgba(86,57,39,0.14)] bg-[rgba(255,250,245,0.92)] text-[var(--foreground)] hover:border-[rgba(95,52,33,0.32)] hover:bg-white"
                }`}
              >
                {item.label}
              </Link>
            ))}

            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="whitespace-nowrap rounded-xl border border-[rgba(160,76,58,0.22)] bg-[rgba(160,76,58,0.08)] px-4 py-2 text-sm font-semibold text-[#8b4637] transition hover:bg-[rgba(160,76,58,0.14)]"
              >
                Sair{trainerName ? ` (${trainerName})` : ""}
              </button>
            ) : (
              !isLoginPage ? (
                <Link
                  href="/login"
                  className="whitespace-nowrap rounded-xl border border-[#5f3421] bg-[#5f3421] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(95,52,33,0.22)]"
                >
                  Entrar
                </Link>
              ) : null
            )}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="rounded-xl border border-[#5f3421] bg-[#5f3421] px-5 py-3 text-base font-semibold text-white shadow-[0_12px_24px_rgba(95,52,33,0.22)] transition hover:bg-[#4f2b1c]"
              >
                ☰ Menu
              </button>
            ) : (
              !isLoginPage ? (
                <Link
                  href="/login"
                  className="rounded-full border border-[#5f3421] bg-[#5f3421] px-4 py-2 text-sm font-semibold text-white"
                >
                  Entrar
                </Link>
              ) : null
            )}
          </div>
        </div>
      </header>

      {isAuthenticated && menuOpen ? (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Fechar menu"
            className="absolute inset-0 bg-[rgba(35,24,20,0.58)]"
            onClick={() => setMenuOpen(false)}
          />

          <aside className="absolute right-0 top-0 flex h-full w-[92%] max-w-sm flex-col border-l border-[var(--border)] bg-[rgba(255,248,242,0.98)] p-6 shadow-2xl backdrop-blur-xl">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(120,76,52,0.78)]">Navegação</p>
                <p className="mt-1 truncate font-display text-xl font-semibold text-[var(--foreground)]">{trainerName || "Adestrador"}</p>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex-shrink-0 rounded-full border border-[var(--border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--foreground)]"
              >
                ✕
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-3">
              {visibleNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-2xl border px-5 py-4 text-base font-semibold transition break-words ${
                    pathname === item.href
                      ? "border-[#b56f4c] bg-[rgba(181,111,76,0.16)] text-[var(--foreground)]"
                      : "border-[var(--border)] bg-white text-[var(--foreground)]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-6 w-full rounded-2xl border border-[rgba(160,76,58,0.18)] bg-[rgba(160,76,58,0.08)] px-5 py-4 text-left text-base font-semibold text-[#8b4637]"
            >
              Sair
            </button>
          </aside>
        </div>
      ) : null}
    </>
  );
}