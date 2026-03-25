"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAppStore, type UserRole } from "@/lib/app-store";

export function LoginClient() {
  const params = useSearchParams();
  const router = useRouter();
  const login = useAppStore((state) => state.login);
  const hydrated = useAppStore((state) => state.hydrated);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  const [email, setEmail] = useState("treinador@dogplatform.com");
  const [password, setPassword] = useState("123456");
  const [userRole, setUserRole] = useState<UserRole>("trainer");

  function getDefaultPath(role: UserRole) {
    if (role === "admin") return "/admin";
    if (role === "client") return "/portal/cliente";
    return "/dashboard";
  }

  function isAllowedPath(role: UserRole, path: string) {
    if (role === "admin") {
      return path === "/admin" || path.startsWith("/admin/");
    }

    if (role === "client") {
      return path === "/portal/cliente";
    }

    if (path === "/portal/cliente" || path.startsWith("/portal/cliente/")) {
      return false;
    }

    return ["/dashboard", "/clientes", "/treinos", "/agenda", "/portal", "/financeiro"].some(
      (allowedPath) => path === allowedPath || path.startsWith(`${allowedPath}/`),
    );
  }

  const nextPath = useMemo(() => {
    const target = params.get("next");

    if (!target || !target.startsWith("/")) {
      return getDefaultPath(userRole);
    }

    return isAllowedPath(userRole, target) ? target : getDefaultPath(userRole);
  }, [params, userRole]);

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      router.replace(nextPath);
    }
  }, [hydrated, isAuthenticated, nextPath, router]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;

    login(email.trim().toLowerCase(), userRole);
    router.replace(nextPath);
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-96px)] w-full max-w-7xl items-center justify-center px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <section className="relative w-full max-w-2xl overflow-hidden rounded-[2.25rem] border border-[var(--border)] bg-[linear-gradient(180deg,_rgba(255,250,245,0.95),_rgba(247,239,231,0.98))] p-8 shadow-[var(--shadow)] sm:p-10">
        <div className="pointer-events-none absolute -right-10 top-0 h-36 w-36 rounded-full bg-[rgba(181,111,76,0.14)] blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 rounded-full bg-[rgba(64,93,78,0.12)] blur-3xl" />
        <p className="relative text-xs font-semibold uppercase tracking-[0.24em] text-[rgba(120,76,52,0.78)]">Login</p>
        <h2 className="relative mt-3 font-display text-3xl font-semibold text-[var(--foreground)] sm:text-4xl">Entrar na plataforma</h2>

        <form onSubmit={handleSubmit} className="relative mt-8 space-y-6">
          <div className="rounded-[1.5rem] border border-white/70 bg-white/68 p-4 backdrop-blur-sm">
            <label className="text-sm font-medium text-[var(--muted)]">Tipo de acesso</label>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { value: "trainer", label: "Adestrador", description: "Painel operacional" },
                { value: "client", label: "Cliente", description: "Portal do tutor" },
                { value: "admin", label: "Administrador", description: "Painel administrativo" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setUserRole(option.value as UserRole)}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    userRole === option.value
                      ? "border-[#5f3421] bg-[#5f3421] text-white shadow-[0_12px_24px_rgba(95,52,33,0.2)]"
                      : "border-[var(--border)] bg-[rgba(255,249,243,0.86)] text-[var(--foreground)] hover:border-[rgba(95,52,33,0.34)]"
                  }`}
                >
                  <div className="font-semibold">{option.label}</div>
                  <div className={`text-xs ${
                    userRole === option.value ? "text-[rgba(255,241,231,0.82)]" : "text-[var(--muted)]"
                  }`}>{option.description}</div>
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-[var(--muted)]">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[rgba(255,252,248,0.92)] px-4 py-3 text-sm outline-none transition focus:border-[#b56f4c]"
              placeholder="voce@adestrador.com"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[var(--muted)]">Senha</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[rgba(255,252,248,0.92)] px-4 py-3 text-sm outline-none transition focus:border-[#b56f4c]"
              placeholder="••••••"
              required
            />
          </label>

          <button
            type="submit"
            className="mt-2 w-full rounded-xl bg-[#5f3421] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_28px_rgba(95,52,33,0.22)] transition hover:-translate-y-0.5 hover:bg-[#4f2b1c]"
          >
            Entrar como {userRole === "admin" ? "Administrador" : userRole === "client" ? "Cliente" : "Adestrador"}
          </button>
        </form>

      </section>
    </main>
  );
}