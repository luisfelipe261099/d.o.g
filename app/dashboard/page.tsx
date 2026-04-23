"use client";

import Link from "next/link";
import Image from "next/image";

import { AuthGuard } from "@/components/auth-guard";
import { useAppStore } from "@/lib/app-store";

function getFirstName(name: string): string {
  const first = name.trim().split(" ")[0];
  return first || "Adestrador";
}

function statusBadge(status: string): string {
  if (status === "Confirmado") return "bg-emerald-100 text-emerald-800";
  if (status === "Cancelado") return "bg-rose-100 text-rose-800";
  return "bg-amber-100 text-amber-900";
}

export default function DashboardPage() {
  const clients = useAppStore((state) => state.clients);
  const events = useAppStore((state) => state.calendarEvents);
  const sessions = useAppStore((state) => state.trainingSessions);
  const payments = useAppStore((state) => state.payments);
  const trainerName = useAppStore((state) => state.trainerName);
  const upcomingEvents = events.slice(0, 3);

  const totalDogs = clients.reduce((total, client) => total + client.dogs.length, 0);
  const pendingEvents = events.filter((event) => event.status === "Pendente" || event.status === "Aguardando").length;
  const todayEvent = upcomingEvents[0];

  const heroClient = clients.find((client) => client.name === todayEvent?.client) ?? clients[0];
  const heroDog = heroClient?.dogs.find((dog) => dog.name === todayEvent?.dog) ?? heroClient?.dogs[0];

  const todaysLabel = todayEvent?.time ?? "10:00";
  const dogName = todayEvent?.dog ?? heroDog?.name ?? "Sem atendimento";
  const heroPlan = todayEvent?.plan || "Operação";

  const quickStats = [
    { value: String(events.length), label: "Atendimentos", link: "/agenda" },
    { value: String(sessions.length), label: "Treinos", link: "/treinos" },
    { value: String(totalDogs), label: "Cães ativos", link: "/clientes" },
    { value: String(pendingEvents), label: "Pendências", link: "/agenda" },
  ];

  const pendingPayments = payments
    .filter((payment) => payment.status === "Pendente")
    .reduce((total, payment) => total + payment.amount, 0);

  return (
    <AuthGuard role="trainer">
      <main className="mx-auto w-full max-w-md px-3 pb-28 pt-4 sm:max-w-xl">
        <section className="rounded-[2rem] border border-[var(--border)] bg-[#f7fbf8]/95 p-4 shadow-[var(--shadow)]">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-200 text-lg font-semibold text-emerald-900">
                {getFirstName(trainerName || "Adestrador").slice(0, 1)}
              </div>
              <div>
                <p className="text-xl font-semibold text-[var(--foreground)]">Bom dia, {getFirstName(trainerName || "adestrador")}!</p>
                <p className="text-xs text-[var(--muted)]">Aqui está o resumo da sua operação.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[var(--muted)]">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-white">🔔</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-white">💬</span>
            </div>
          </header>

          <article className="mt-4 overflow-hidden rounded-2xl bg-[linear-gradient(140deg,#153b2e_0%,#0e5a3a_56%,#2a7f4f_100%)] p-4 text-white">
            <p className="text-xs uppercase tracking-[0.15em] text-emerald-100">Próximo atendimento</p>
            <div className="mt-2 flex items-end justify-between gap-3">
              <div>
                <p className="text-4xl font-semibold leading-none">{todaysLabel}</p>
                <p className="mt-2 text-lg font-semibold">{dogName}</p>
                <p className="text-xs text-emerald-100">Treino de obediência • {heroPlan}</p>
              </div>
              <div className="relative h-24 w-24 overflow-hidden rounded-2xl bg-white/20">
                {heroDog?.photoUrl ? (
                  <Image
                    src={heroDog.photoUrl}
                    alt={`Foto de ${heroDog.name}`}
                    fill
                    sizes="96px"
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl">🐶</div>
                )}
              </div>
            </div>
            <Link
              href="/agenda"
              className="mt-3 inline-flex rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Ver agenda completa
            </Link>
          </article>

          <section className="mt-4 grid grid-cols-2 gap-3">
            {quickStats.map((item) => (
              <Link key={item.label} href={item.link} className="rounded-2xl border border-[var(--border)] bg-white p-3">
                <p className="text-2xl font-semibold text-[var(--foreground)]">{item.value}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">{item.label}</p>
              </Link>
            ))}
          </section>

          <section className="mt-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[var(--foreground)]">Atendimentos de hoje</p>
              <Link href="/agenda" className="text-xs font-semibold text-[#145a82]">Ver agenda</Link>
            </div>
            <div className="mt-3 space-y-2">
              {upcomingEvents.length === 0 ? (
                <div className="rounded-2xl border border-[var(--border)] bg-white p-3 text-sm text-[var(--muted)]">
                  Sem atendimentos para hoje.
                </div>
              ) : null}
              {upcomingEvents.map((event) => (
                <article key={event.id} className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-white p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm">🐾</div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--foreground)]">{event.dog}</p>
                      <p className="text-xs text-[var(--muted)]">{event.time} • {event.client}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${statusBadge(event.status)}`}>
                    {event.status}
                  </span>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[var(--foreground)]">Novos leads</p>
              <Link href="/clientes" className="text-xs font-semibold text-[#145a82]">Ver todos</Link>
            </div>
            <article className="mt-3 rounded-2xl border border-[var(--border)] bg-white p-3">
              <p className="text-sm font-semibold text-[var(--foreground)]">{clients[0]?.name || "Sem lead novo"}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {clients[0] ? `${clients[0].dogs.length} pet(s) • cadastro recente` : "Cadastre clientes para começar"}
              </p>
            </article>
          </section>

          <section className="mt-5">
            <p className="text-sm font-semibold text-[var(--foreground)]">Acesso rápido</p>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {[
                { label: "Novo cliente", href: "/clientes", icon: "👤" },
                { label: "Registrar treino", href: "/treinos", icon: "🏋️" },
                { label: "Financeiro", href: "/financeiro", icon: "💵" },
                { label: "Portal", href: "/portal", icon: "📣" },
              ].map((item) => (
                <Link key={item.label} href={item.href} className="rounded-xl border border-[var(--border)] bg-white p-2 text-center">
                  <p className="text-lg">{item.icon}</p>
                  <p className="mt-1 text-[10px] font-semibold text-[var(--muted)]">{item.label}</p>
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-5 rounded-2xl border border-[var(--border)] bg-white p-3">
            <div className="flex items-center justify-between text-sm">
              <p className="font-semibold text-[var(--foreground)]">Financeiro pendente</p>
              <p className="font-semibold text-amber-700">
                {pendingPayments.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
            </div>
          </section>
        </section>

        <nav className="fixed bottom-3 left-1/2 z-50 w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 rounded-2xl border border-[var(--border)] bg-white/95 p-2 shadow-lg backdrop-blur">
          <div className="grid grid-cols-5 gap-1 text-center">
            {[
              { label: "Início", href: "/dashboard", icon: "🏠", active: true },
              { label: "Agenda", href: "/agenda", icon: "🗓️" },
              { label: "Novo", href: "/clientes", icon: "➕" },
              { label: "Clientes", href: "/clientes", icon: "👥" },
              { label: "Mais", href: "/portal", icon: "⋯" },
            ].map((item) => (
              <Link key={item.label} href={item.href} className="rounded-xl px-1 py-1.5">
                <p className={`text-sm ${item.active ? "text-emerald-700" : "text-[var(--muted)]"}`}>{item.icon}</p>
                <p className={`text-[10px] font-semibold ${item.active ? "text-emerald-700" : "text-[var(--muted)]"}`}>{item.label}</p>
              </Link>
            ))}
          </div>
        </nav>
      </main>
    </AuthGuard>
  );
}