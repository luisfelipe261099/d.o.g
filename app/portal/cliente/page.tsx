import Link from "next/link";

import { PageShell } from "@/components/page-shell";
import {
  calendarEvents,
  clients,
  healthAlerts,
  portalFeed,
  portalGallery,
  portalTasks,
} from "@/lib/mock-data";

export default function PortalClientePage() {
  const featuredClient = clients[0];
  const featuredDog = featuredClient?.dogs[0];
  const clientAgenda = calendarEvents.filter((event) => event.client === featuredClient?.name).slice(0, 3);

  return (
    <PageShell
      kicker="Acesso do cliente"
      title="Portal do tutor com dados do animal"
      description="Prévia da experiência que o cliente do adestrador recebe por link: dados do pet, agenda, tarefas, relatórios e galeria de fotos e vídeos."
      requireAuth={["trainer", "client"]}
    >
      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-[1.75rem] border border-[var(--border)] bg-slate-950 p-6 text-white shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Perfil do tutor</p>
          <h2 className="mt-3 font-display text-3xl font-semibold">{featuredClient?.name}</h2>
          <p className="mt-2 text-sm text-slate-300">{featuredClient?.phone} • {featuredClient?.propertyType}</p>
          <p className="mt-4 text-sm leading-7 text-slate-300">{featuredClient?.environment}</p>
          <div className="mt-5 rounded-3xl bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Plano atual</p>
            <p className="mt-2 font-semibold text-white">{featuredClient?.plan}</p>
          </div>
        </article>

        <article className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Dados do animal</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-[var(--border)] bg-white p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Nome</p>
              <p className="mt-2 font-display text-3xl font-semibold">{featuredDog?.name}</p>
              <p className="mt-2 text-sm text-[var(--muted)]">{featuredDog?.breed}</p>
            </div>
            <div className="rounded-3xl border border-[var(--border)] bg-white p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Detalhes</p>
              <p className="mt-2 text-sm text-[var(--muted)]">Idade: {featuredDog?.age}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">Peso: {featuredDog?.weight}</p>
            </div>
          </div>
          <div className="mt-4 rounded-3xl border border-[var(--border)] bg-white p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Focos de treino</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {featuredDog?.trainingTypes.map((type) => (
                <span
                  key={type}
                  className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-sky-800"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Agenda</p>
          <h2 className="mt-2 font-display text-2xl font-semibold">Próximos encontros</h2>
          <div className="mt-5 space-y-3">
            {clientAgenda.map((event) => (
              <div key={`${event.day}-${event.time}`} className="rounded-3xl border border-[var(--border)] bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{event.day} • {event.time}</p>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-amber-900">
                    {event.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[var(--muted)]">Sessão {event.sessionNumber} • {event.plan}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel-strong)] p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Tarefas da semana</p>
          <div className="mt-5 space-y-3">
            {portalTasks.map((task) => (
              <div key={task.title} className="rounded-3xl border border-[var(--border)] bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold">{task.title}</h3>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                      task.completed ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {task.completed ? "Concluida" : "Pendente"}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{task.description}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Fotos e videos</p>
            <h2 className="mt-2 font-display text-2xl font-semibold">Galeria do animal</h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-[var(--muted)]">
            Registros visuais compartilhados pelo adestrador apos cada sessao para mostrar progresso real.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {portalGallery.map((item) => (
            <article key={item.title} className="overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-white">
              <div className="h-44 bg-[linear-gradient(135deg,_rgba(14,165,233,0.22),_rgba(245,158,11,0.28)),linear-gradient(180deg,_rgba(255,255,255,0.4),_rgba(17,32,51,0.06))]" />
              <div className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-xl font-semibold">{item.title}</h3>
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{item.kind}</span>
                </div>
                <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{item.caption}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel-strong)] p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Relatorios</p>
          <div className="mt-5 space-y-3">
            {portalFeed.map((item) => (
              <div key={item.title} className="rounded-3xl border border-[var(--border)] bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-xl font-semibold">{item.title}</h3>
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{item.date}</span>
                </div>
                <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{item.summary}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[1.75rem] border border-[var(--border)] bg-slate-950 p-6 text-white shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Lembretes de saude</p>
          <div className="mt-5 space-y-3">
            {healthAlerts.map((alert) => (
              <div key={alert.title} className="rounded-3xl bg-white/10 p-4">
                <h3 className="font-display text-xl font-semibold">{alert.title}</h3>
                <p className="mt-2 text-sm text-slate-300">Prazo: {alert.deadline}</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">{alert.detail}</p>
              </div>
            ))}
          </div>
          <Link
            href="/portal"
            className="mt-5 inline-flex rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white"
          >
            Voltar para visao do adestrador
          </Link>
        </article>
      </section>
    </PageShell>
  );
}