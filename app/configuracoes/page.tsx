"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { AuthGuard } from "@/components/auth-guard";
import { useAppStore } from "@/lib/app-store";

export default function ConfiguracoesPage() {
  const trainerName = useAppStore((state) => state.trainerName);
  const [displayName, setDisplayName] = useState(trainerName ?? "");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyWhats, setNotifyWhats] = useState(true);
  const [language, setLanguage] = useState("pt-BR");
  const [theme, setTheme] = useState("claro");
  const [savedMessage, setSavedMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavedMessage("Preferências salvas neste dispositivo.");
    window.setTimeout(() => setSavedMessage(""), 3000);
  }

  return (
    <AuthGuard role="trainer">
      <main className="mx-auto w-full max-w-md px-3 pb-10 pt-3 sm:max-w-xl">
        <section className="rounded-[2rem] border border-[var(--border)] bg-[#f7fbff] p-4 shadow-[var(--shadow)]">
          <header>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#2d6f99]">Conta</p>
            <h1 className="font-display text-2xl font-semibold text-[var(--foreground)]">Configurações</h1>
            <p className="mt-1 text-xs text-[var(--muted)]">Ajuste preferências de conta, notificações e operação.</p>
          </header>

          <form onSubmit={handleSubmit} className="mt-4 grid gap-3">
            <fieldset className="rounded-2xl border border-[var(--border)] bg-white p-3">
              <legend className="px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2d6f99]">Dados pessoais</legend>
              <div className="mt-2 grid gap-2">
                <label className="text-xs text-[var(--muted)]">
                  Nome
                  <input
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-sky-400"
                  />
                </label>
                <label className="text-xs text-[var(--muted)]">
                  E-mail
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-sky-400"
                  />
                </label>
                <label className="text-xs text-[var(--muted)]">
                  Telefone
                  <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-sky-400"
                  />
                </label>
              </div>
            </fieldset>

            <fieldset className="rounded-2xl border border-[var(--border)] bg-white p-3">
              <legend className="px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2d6f99]">Notificações</legend>
              <div className="mt-2 grid gap-2 text-sm text-[var(--foreground)]">
                <label className="flex items-center justify-between rounded-xl border border-[var(--border)] px-3 py-2">
                  <span>Receber por e-mail</span>
                  <input type="checkbox" checked={notifyEmail} onChange={(event) => setNotifyEmail(event.target.checked)} />
                </label>
                <label className="flex items-center justify-between rounded-xl border border-[var(--border)] px-3 py-2">
                  <span>Receber por WhatsApp</span>
                  <input type="checkbox" checked={notifyWhats} onChange={(event) => setNotifyWhats(event.target.checked)} />
                </label>
              </div>
            </fieldset>

            <fieldset className="rounded-2xl border border-[var(--border)] bg-white p-3">
              <legend className="px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2d6f99]">Aparência</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <label className="text-xs text-[var(--muted)]">
                  Idioma
                  <select
                    value={language}
                    onChange={(event) => setLanguage(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-sky-400"
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (US)</option>
                  </select>
                </label>
                <label className="text-xs text-[var(--muted)]">
                  Tema
                  <select
                    value={theme}
                    onChange={(event) => setTheme(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-sky-400"
                  >
                    <option value="claro">Claro</option>
                    <option value="escuro">Escuro</option>
                  </select>
                </label>
              </div>
            </fieldset>

            {savedMessage ? (
              <p className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-800">{savedMessage}</p>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                className="pc-primary-action rounded-full px-4 py-2 text-sm font-semibold"
              >
                Salvar preferências
              </button>
              <Link href="/dashboard" className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[#145a82]">
                Voltar
              </Link>
            </div>
          </form>
        </section>
      </main>
    </AuthGuard>
  );
}
