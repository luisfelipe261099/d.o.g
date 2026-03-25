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

  const nextPath = useMemo(() => {
    const target = params.get("next");

    const isAdminRoute = target?.startsWith("/admin");
    const isTrainerRoute =
      target &&
      ["/dashboard", "/clientes", "/treinos", "/agenda", "/portal", "/financeiro"].some((path) =>
        target.startsWith(path),
      );
    const isClientRoute = target?.startsWith("/portal/cliente");

    if (isAdminRoute && userRole !== "admin") {
      return userRole === "client" ? "/portal/cliente" : "/dashboard";
    }

    if (isTrainerRoute && userRole === "client" && !isClientRoute) {
      return "/portal/cliente";
    }

    if (isClientRoute && userRole === "admin") {
      return "/admin";
    }

    if (target && target.startsWith("/")) {
      return target;
    }

    if (userRole === "admin") return "/admin";
    if (userRole === "client") return "/portal/cliente";
    return "/dashboard";
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
    router.push(nextPath);
  }

  return (
    <main className="mx-auto grid min-h-[calc(100vh-96px)] w-full max-w-7xl gap-6 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
      <section className="rounded-[2rem] border border-[var(--border)] bg-[linear-gradient(150deg,_#0f172a,_#112033_50%,_#1e293b)] p-8 text-white shadow-[var(--shadow)] sm:p-10">
        <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-200">
          Plataforma em modo preview
        </div>
        <h1 className="mt-5 font-display text-4xl font-semibold leading-tight sm:text-5xl">
          Acesse seu ambiente de trabalho.
        </h1>
        <p className="mt-5 text-sm leading-7 text-slate-300 sm:text-base">
          Um unico sistema para operacao do adestrador, administracao da plataforma e acompanhamento do tutor em tempo real.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {[
            { icon: "OPERACAO", text: "Painel completo para adestradores" },
            { icon: "CLIENTE", text: "Portal com fotos, videos e agenda" },
            { icon: "ADMIN", text: "Controle de planos e faturamento" },
            { icon: "DADOS", text: "Mocks prontos para validacao comercial" },
          ].map((item) => (
            <div key={item.text} className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">{item.icon}</p>
              <p className="mt-2 text-sm text-slate-100">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--panel)] p-8 shadow-[var(--shadow)] sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">Login</p>
        <h2 className="mt-3 font-display text-3xl font-semibold">Entrar na plataforma</h2>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
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
                  className={`rounded-2xl border-2 px-4 py-3 text-left transition ${
                    userRole === option.value
                      ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                      : "border-slate-300 bg-slate-50 text-slate-900 hover:border-slate-500"
                  }`}
                >
                  <div className="font-semibold">{option.label}</div>
                  <div className={`text-xs ${
                    userRole === option.value ? "text-slate-200" : "text-slate-600"
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
              className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-400"
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
              className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-400"
              placeholder="••••••"
              required
            />
          </label>

          <button
            type="submit"
            className="mt-2 w-full rounded-xl bg-[var(--foreground)] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
          >
            Entrar como {userRole === "admin" ? "Administrador" : userRole === "client" ? "Cliente" : "Adestrador"}
          </button>
        </form>

        <p className="mt-6 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-xs leading-6 text-[var(--muted)]">
          Use as credenciais de demonstração para acessar.
        </p>
      </section>
    </main>
  );
}