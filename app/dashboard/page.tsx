"use client";

import Link from "next/link";
import Image from "next/image";

import { AuthGuard } from "@/components/auth-guard";
import { useAppStore } from "@/lib/app-store";

function getFirstName(name: string): string {
  const first = name.trim().split(" ")[0];
  return first || "Adestrador";
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

type IconName =
  | "bell"
  | "chat"
  | "paw"
  | "user"
  | "train"
  | "money"
  | "portal"
  | "home"
  | "calendar"
  | "plus"
  | "users"
  | "more";

function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  if (name === "bell") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
        <path d="M15.5 17h-7a2 2 0 0 1-2-2v-2.2c0-.8.3-1.6.9-2.2l.3-.3V8a4.3 4.3 0 1 1 8.6 0v2.3l.3.3c.6.6.9 1.4.9 2.2V15a2 2 0 0 1-2 2Z" stroke="currentColor" strokeWidth="1.7" />
        <path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "chat") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
        <rect x="4" y="5" width="16" height="12" rx="3" stroke="currentColor" strokeWidth="1.7" />
        <path d="m9 17-3.2 2.6c-.4.3-.8-.1-.8-.5V17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "paw") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
        <circle cx="8" cy="8.5" r="1.7" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="7" r="1.7" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="16" cy="8.5" r="1.7" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 18.8c2.8 0 5-1.8 5-4.1 0-2-2.1-3.6-5-3.6s-5 1.6-5 3.6c0 2.3 2.2 4.1 5 4.1Z" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }

  if (name === "user") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
        <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.7" />
        <path d="M5.5 18a6.5 6.5 0 0 1 13 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "train") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
        <path d="M6 14h12M8 17h8M9 6h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <rect x="5" y="4" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }

  if (name === "money") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
        <rect x="4" y="6" width="16" height="12" rx="3" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }

  if (name === "portal") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
        <path d="M12 5v10m0 0 3-3m-3 3-3-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="5" y="15" width="14" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }

  if (name === "home") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
        <path d="m4 11 8-6 8 6v8a1 1 0 0 1-1 1h-4.5v-5h-5V20H5a1 1 0 0 1-1-1z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "calendar") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
        <rect x="4" y="5" width="16" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M8 3.8v3.5M16 3.8v3.5M4 9h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "plus") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "users") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
        <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="16" cy="10" r="2" stroke="currentColor" strokeWidth="1.7" />
        <path d="M4.5 18a4.5 4.5 0 0 1 9 0M13.5 18a3.5 3.5 0 0 1 5 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="6" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="18" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

function statusBadge(status: string): string {
  if (status === "Confirmado") return "bg-sky-100 text-sky-800";
  if (status === "Cancelado") return "bg-rose-100 text-rose-800";
  return "bg-amber-100 text-amber-900";
}

export default function DashboardPage() {
  const clients = useAppStore((state) => state.clients);
  const events = useAppStore((state) => state.calendarEvents);
  const sessions = useAppStore((state) => state.trainingSessions);
  const trainerName = useAppStore((state) => state.trainerName);
  const upcomingEvents = events.slice(0, 3);

  const totalDogs = clients.reduce((total, client) => total + client.dogs.length, 0);
  const pendingEvents = events.filter((event) => event.status === "Pendente" || event.status === "Aguardando").length;
  const todayEvent = upcomingEvents[0];

  const heroClient = clients.find((client) => client.name === todayEvent?.client) ?? clients[0];
  const heroDog = heroClient?.dogs.find((dog) => dog.name === todayEvent?.dog) ?? heroClient?.dogs[0];

  const lastSessionForDog = (() => {
    if (!heroDog) return undefined;
    const matches = sessions.filter((session) => session.dogId === heroDog.id || session.dogName === heroDog.name);
    if (!matches.length) return undefined;
    return [...matches].sort((a, b) => b.number - a.number)[0];
  })();
  const lastSessionSummary = lastSessionForDog?.notes?.[0]?.text ?? "";
  const dogProfileHref = heroClient && heroDog ? `/treinos?clientId=${heroClient.id}&dogId=${heroDog.id}` : "/clientes";
  const lastSessionHref = lastSessionForDog ? `/treinos?clientId=${heroClient?.id ?? ""}&dogId=${heroDog?.id ?? ""}` : dogProfileHref;

  const todaysLabel = todayEvent?.time ?? "10:00";
  const dogName = todayEvent?.dog ?? heroDog?.name ?? "Sem atendimento";
  const heroPlan = todayEvent?.plan || "Operação";

  const quickStats = [
    { value: String(events.length), label: "Atendimentos", link: "/agenda" },
    { value: String(sessions.length), label: "Treinos", link: "/treinos" },
    { value: String(totalDogs), label: "Cães ativos", link: "/clientes" },
    { value: String(pendingEvents), label: "Pendências", link: "/agenda" },
  ];

  return (
    <AuthGuard role="trainer">
      <main className="mx-auto w-full max-w-md px-3 pb-8 pt-3 sm:max-w-xl">
        <section className="rounded-[2rem] border border-[var(--border)] bg-[#f7fbff]/95 p-4 shadow-[var(--shadow)]">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-200 text-lg font-semibold text-[#145a82]">
                {getFirstName(trainerName || "Adestrador").slice(0, 1)}
              </div>
              <div>
                <p className="text-[1.12rem] font-semibold text-[var(--foreground)]">{getGreeting()}, {getFirstName(trainerName || "adestrador")}!</p>
                <p className="text-xs text-[var(--muted)]">Aqui está o resumo da sua operação.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[var(--muted)]">
              <Link href="/agenda" className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[#145a82]">
                <Icon name="bell" className="h-4.5 w-4.5" />
              </Link>
              <Link href="/portal" className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[#145a82]">
                <Icon name="chat" className="h-4.5 w-4.5" />
              </Link>
            </div>
          </header>

          <article className="mt-4 overflow-hidden rounded-2xl bg-[linear-gradient(140deg,#0f3d5e_0%,#145a82_56%,#2c7eab_100%)] p-4 text-white">
            <p className="text-[11px] uppercase tracking-[0.15em] text-sky-100">Próximo atendimento</p>
            <div className="mt-2.5 flex items-end justify-between gap-3">
              <div>
                <p className="text-4xl font-semibold leading-none">{todaysLabel}</p>
                <p className="mt-2 text-lg font-semibold">{dogName}</p>
                <p className="text-xs text-sky-100">{heroPlan}</p>
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
                  <div className="flex h-full w-full items-center justify-center text-sky-100">
                    <Icon name="paw" className="h-9 w-9" />
                  </div>
                )}
              </div>
            </div>
            <Link
              href="/agenda"
              className="mt-3 inline-flex rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Ver agenda completa
            </Link>
            {heroDog ? (
              <div className="mt-3 grid gap-2 rounded-xl bg-white/10 p-2.5 text-xs text-sky-50">
                <Link
                  href={dogProfileHref}
                  className="flex items-center justify-between gap-2 rounded-lg bg-white/10 px-2.5 py-1.5 font-semibold transition hover:bg-white/20"
                >
                  <span>Ficha do cão • {heroDog.name}</span>
                  <span aria-hidden>→</span>
                </Link>
                <Link
                  href={lastSessionHref}
                  className="rounded-lg bg-white/10 px-2.5 py-1.5 transition hover:bg-white/20"
                >
                  <p className="font-semibold">
                    Última aula{lastSessionForDog ? ` • ${lastSessionForDog.date}` : ""}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[11px] text-sky-100">
                    {lastSessionSummary || "Sem resumo registrado ainda. Toque para abrir o histórico."}
                  </p>
                </Link>
              </div>
            ) : null}
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
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-50 text-[#145a82]">
                      <Icon name="paw" className="h-4.5 w-4.5" />
                    </div>
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

          <section className="mt-5 rounded-2xl border border-[#cfe4f3] bg-white p-3">
            <p className="text-sm font-semibold text-[var(--foreground)]">Comece por aqui</p>
            <p className="mt-0.5 text-[11px] text-[var(--muted)]">Fluxo simples para colocar um caso novo no ar.</p>
            <ol className="mt-3 space-y-2">
              {[
                {
                  step: 1,
                  label: "Cadastre cliente e cão",
                  detail: "Crie a ficha do tutor com os dados do cão.",
                  href: "/clientes",
                  done: clients.length > 0,
                },
                {
                  step: 2,
                  label: "Agende a primeira sessão",
                  detail: "Defina dia e horário no calendário.",
                  href: "/agenda",
                  done: events.length > 0,
                },
                {
                  step: 3,
                  label: "Registre o treino realizado",
                  detail: "Anote evolução, notas e fotos.",
                  href: "/treinos",
                  done: sessions.length > 0,
                },
                {
                  step: 4,
                  label: "Compartilhe o portal com o tutor",
                  detail: "Envie um link seguro para acompanhamento.",
                  href: "/portal",
                  done: false,
                },
              ].map((item) => (
                <li key={item.step}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[#f7fbff] px-3 py-2 transition hover:bg-white"
                  >
                    <span
                      className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                        item.done
                          ? "bg-emerald-500 text-white"
                          : "bg-[#145a82] text-white"
                      }`}
                    >
                      {item.done ? "✓" : item.step}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[var(--foreground)]">{item.label}</p>
                      <p className="text-[10px] text-[var(--muted)]">{item.detail}</p>
                    </div>
                    <span className="text-[#145a82]" aria-hidden>→</span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[var(--foreground)]">Acesso rápido</p>
              <Link href="/portal" className="text-xs font-semibold text-[#145a82]">Portal</Link>
            </div>
            <div className="mt-3 grid gap-2">
              {[
                { label: "Novo cliente", href: "/cadastro", icon: "user" as const, detail: "Cadastrar cliente e cão" },
                { label: "Registrar treino", href: "/treinos", icon: "train" as const, detail: "Lançar sessão de hoje" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-white px-3 py-2"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-50 text-[#145a82]">
                      <Icon name={item.icon} className="h-4.5 w-4.5" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-[var(--foreground)]">{item.label}</p>
                      <p className="text-[10px] text-[var(--muted)]">{item.detail}</p>
                    </div>
                  </div>
                  <span className="text-[#145a82]">
                    <Icon name="more" className="h-4 w-4" />
                  </span>
                </Link>
              ))}
            </div>
          </section>

        </section>

      </main>
    </AuthGuard>
  );
}