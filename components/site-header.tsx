"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAppStore } from "@/lib/app-store";

export function SiteHeader() {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const [menuOpen, setMenuOpen] = useState(false);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const userRole = useAppStore((state) => state.userRole);
  const trainerName = useAppStore((state) => state.trainerName);
  const logout = useAppStore((state) => state.logout);

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
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,_#0f172a,_#1f2937)] font-display text-base font-semibold text-white sm:h-12 sm:w-12 sm:text-lg">
              DOG
            </div>
            <div>
              <p className="font-display text-lg font-semibold sm:text-xl">D.O.G Platform</p>
              <p className="text-xs text-slate-700 sm:text-sm">SaaS para adestradores</p>
            </div>
          </Link>

          <div className="hidden items-center gap-2 lg:flex">
            {isAuthenticated ? (
              <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-800">
                {roleLabel}
              </span>
            ) : null}

            {visibleNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                  pathname === item.href
                    ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                    : "border-slate-300 bg-white text-slate-800 hover:border-slate-500 hover:bg-slate-50"
                }`}
              >
                {item.label}
              </Link>
            ))}

            {isAuthenticated ? (
              <button
                type="button"
                onClick={logout}
                className="whitespace-nowrap rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
              >
                Sair{trainerName ? ` (${trainerName})` : ""}
              </button>
            ) : (
              !isLoginPage ? (
                <Link
                  href="/login"
                  className="whitespace-nowrap rounded-xl border border-[var(--foreground)] bg-[var(--foreground)] px-4 py-2 text-sm font-semibold text-white"
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
                className="rounded-xl border-2 border-slate-900 bg-slate-900 px-5 py-3 text-base font-semibold text-white transition hover:bg-slate-800"
              >
                ☰ Menu
              </button>
            ) : (
              !isLoginPage ? (
                <Link
                  href="/login"
                  className="rounded-full border border-[var(--foreground)] bg-[var(--foreground)] px-4 py-2 text-sm font-semibold text-white"
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
            className="absolute inset-0 bg-slate-950/60"
            onClick={() => setMenuOpen(false)}
          />

          <aside className="absolute right-0 top-0 flex h-full w-[92%] max-w-sm flex-col border-l border-slate-300 bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">Navegação</p>
                <p className="mt-1 font-display text-xl font-semibold text-slate-900 truncate">{trainerName || "Adestrador"}</p>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex-shrink-0 rounded-full border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800"
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
                      ? "border-amber-500 bg-amber-300 text-slate-950"
                      : "border-slate-400 bg-white text-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <button
              type="button"
              onClick={logout}
              className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-base font-semibold text-rose-700 w-full text-left"
            >
              Sair
            </button>
          </aside>
        </div>
      ) : null}
    </>
  );
}