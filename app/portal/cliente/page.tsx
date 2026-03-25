"use client";

import Image from "next/image";
import { useState } from "react";

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
  const [activeSection, setActiveSection] = useState<"resumo" | "agenda" | "tarefas" | "galeria" | "relatorios">("resumo");
  const featuredClient = clients[0];
  const featuredDog = featuredClient?.dogs[0];
  const clientAgenda = calendarEvents.filter((event) => event.client === featuredClient?.name).slice(0, 3);
  const pendingTasks = portalTasks.filter((task) => !task.completed).length;
  const doneTasks = portalTasks.length - pendingTasks;
  const visibleSections = {
    resumo: activeSection === "resumo",
    agenda: activeSection === "resumo" || activeSection === "agenda",
    tarefas: activeSection === "resumo" || activeSection === "tarefas",
    galeria: activeSection === "resumo" || activeSection === "galeria",
    relatorios: activeSection === "resumo" || activeSection === "relatorios",
  };

  return (
    <PageShell
      kicker="Meu portal"
      title="Acompanhamento do treinamento"
      description="Consulte agenda, tarefas, evolução e registros do seu cão em um só lugar."
      requireAuth="client"
    >
      <section className="mx-auto w-full max-w-5xl">
        <div className="rounded-[2rem] border border-[var(--border)] bg-[linear-gradient(150deg,_#0f172a,_#112033_45%,_#1e293b)] p-5 text-white shadow-[var(--shadow)] sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {featuredDog?.photoUrl ? (
                <Image
                  src={featuredDog.photoUrl}
                  alt={`Foto de ${featuredDog.name}`}
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-[1.5rem] object-cover"
                />
              ) : null}
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Meu pet</p>
                <h2 className="mt-2 font-display text-3xl font-semibold">{featuredDog?.name}</h2>
                <p className="mt-1 text-sm text-slate-300">{featuredDog?.breed} • {featuredDog?.age}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-right">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Tutor</p>
              <p className="mt-1 text-sm font-semibold">{featuredClient?.name}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Agenda</p>
              <p className="mt-2 text-2xl font-semibold">{clientAgenda.length}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Tarefas</p>
              <p className="mt-2 text-2xl font-semibold">{doneTasks}/{portalTasks.length}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Midia</p>
              <p className="mt-2 text-2xl font-semibold">{portalGallery.length}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Alertas</p>
              <p className="mt-2 text-2xl font-semibold">{healthAlerts.length}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--border)] bg-white p-2 shadow-sm">
          {[
            "Resumo",
            "Agenda",
            "Tarefas",
            "Galeria",
            "Relatorios",
          ].map((tab, index) => (
            <button
              key={tab}
              type="button"
              onClick={() =>
                setActiveSection(
                  tab === "Resumo"
                    ? "resumo"
                    : tab === "Agenda"
                      ? "agenda"
                      : tab === "Tarefas"
                        ? "tarefas"
                        : tab === "Galeria"
                          ? "galeria"
                          : "relatorios",
                )
              }
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                (index === 0 && activeSection === "resumo") ||
                (tab === "Agenda" && activeSection === "agenda") ||
                (tab === "Tarefas" && activeSection === "tarefas") ||
                (tab === "Galeria" && activeSection === "galeria") ||
                (tab === "Relatorios" && activeSection === "relatorios")
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {visibleSections.agenda && (
        <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Agenda da semana</p>
            <div className="mt-4 space-y-3">
              {clientAgenda.map((event) => (
                <div key={`${event.day}-${event.time}`} className="rounded-2xl border border-[var(--border)] bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{event.day} • {event.time}</p>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-amber-900">
                      {event.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[var(--muted)]">Sessao {event.sessionNumber} • {event.plan}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel-strong)] p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Perfil do animal</p>
            {featuredDog?.photoUrl ? (
              <Image
                src={featuredDog.photoUrl}
                alt={`Perfil de ${featuredDog.name}`}
                width={720}
                height={416}
                className="mt-4 h-52 w-full rounded-[1.5rem] object-cover"
              />
            ) : null}
            <h3 className="mt-3 font-display text-3xl font-semibold">{featuredDog?.name}</h3>
            <p className="mt-1 text-sm text-[var(--muted)]">{featuredDog?.breed} • {featuredDog?.weight}</p>

            <div className="mt-4 rounded-2xl border border-[var(--border)] bg-white p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Focos atuais</p>
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

            <div className="mt-4 rounded-2xl border border-[var(--border)] bg-slate-950 p-4 text-white">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Plano do tutor</p>
              <p className="mt-2 font-semibold">{featuredClient?.plan}</p>
              <p className="mt-2 text-sm text-slate-300">{featuredClient?.phone}</p>
            </div>
          </article>
        </div>
        )}

        {visibleSections.tarefas || visibleSections.galeria ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          {visibleSections.tarefas ? (
          <article className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Checklist</p>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800">
                {pendingTasks} pendentes
              </span>
            </div>

            <div className="mt-4 space-y-2">
              {portalTasks.map((task) => (
                <div key={task.title} className="rounded-2xl border border-[var(--border)] bg-white p-3">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold">{task.title}</h3>
                    <span className={`h-3 w-3 rounded-full ${task.completed ? "bg-emerald-500" : "bg-amber-500"}`} />
                  </div>
                  <p className="mt-2 text-xs leading-6 text-[var(--muted)]">{task.description}</p>
                </div>
              ))}
            </div>
          </article>
          ) : <div />}

          {visibleSections.galeria ? (
          <article className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Galeria</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {portalGallery.map((item) => (
                <article key={item.title} className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    width={720}
                    height={224}
                    className="h-28 w-full object-cover"
                  />
                  <div className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold">{item.title}</h3>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{item.kind}</span>
                    </div>
                    <p className="mt-2 text-xs leading-6 text-[var(--muted)]">{item.caption}</p>
                  </div>
                </article>
              ))}
            </div>
          </article>
          ) : <div />}
        </div>
        ) : null}

        {visibleSections.relatorios && (
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <article className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel-strong)] p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Relatorios recentes</p>
            <div className="mt-4 space-y-3">
              {portalFeed.map((item) => (
                <div key={item.title} className="rounded-2xl border border-[var(--border)] bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold">{item.title}</h3>
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{item.date}</span>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{item.summary}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[1.75rem] border border-[var(--border)] bg-slate-950 p-5 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Saude e lembretes</p>
            <div className="mt-4 space-y-3">
              {healthAlerts.map((alert) => (
                <div key={alert.title} className="rounded-2xl bg-white/10 p-4">
                  <h3 className="font-semibold">{alert.title}</h3>
                  <p className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-300">Prazo: {alert.deadline}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-300">{alert.detail}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
        )}

        <div className="sticky bottom-3 mt-6 rounded-2xl border border-[var(--border)] bg-white/95 p-3 shadow-lg backdrop-blur md:mx-auto md:max-w-2xl">
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Inicio", value: "resumo" },
              { label: "Agenda", value: "agenda" },
              { label: "Midia", value: "galeria" },
              { label: "Relatorios", value: "relatorios" },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setActiveSection(item.value as "resumo" | "agenda" | "galeria" | "relatorios")}
                className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                  activeSection === item.value ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>


      </section>
    </PageShell>
  );
}