"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";

import { PageShell } from "@/components/page-shell";
import { useAppStore } from "@/lib/app-store";

const healthAlerts: { title: string; deadline: string; detail: string }[] = [];
const portalFeed: { title: string; date: string; summary: string }[] = [];
const portalGallery: { title: string; kind: string; caption: string; imageUrl: string }[] = [];

export default function PortalClientePage() {
  const [activeSection, setActiveSection] = useState<"resumo" | "agenda" | "tarefas" | "galeria" | "relatorios">("resumo");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const clients = useAppStore((state) => state.clients);
  const calendarEvents = useAppStore((state) => state.calendarEvents);
  const portalTasks = useAppStore((state) => state.portalTasks);
  const portalFeedbacks = useAppStore((state) => state.portalFeedbacks);
  const toggleTask = useAppStore((state) => state.toggleTask);
  const addPortalFeedback = useAppStore((state) => state.addPortalFeedback);
  const featuredClient = clients[0] ?? null;
  const featuredDog = featuredClient?.dogs[0];
  const clientAgenda = calendarEvents.filter((event) => event.client === featuredClient?.name).slice(0, 3);
  const pendingTasks = portalTasks.filter((task) => !task.completed).length;
  const doneTasks = portalTasks.length - pendingTasks;
  const visibleSections = {
    resumo: activeSection === "resumo",
    agenda: activeSection === "agenda",
    tarefas: activeSection === "tarefas",
    galeria: activeSection === "galeria",
    relatorios: activeSection === "relatorios",
  };

  function handleFeedbackSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!feedbackMessage.trim()) return;
    addPortalFeedback(feedbackMessage);
    setFeedbackMessage("");
  }

  return (
    <PageShell
      kicker="Meu portal"
      title="Acompanhamento do adestramento"
      description="Acompanhe agenda, tarefas e evolução do seu cão com informações claras após cada sessão."
      requireAuth="client"
    >
      <section className="mx-auto w-full max-w-5xl">
        <div className="rounded-[1.75rem] border border-[var(--border)] bg-[linear-gradient(150deg,_#0f172a,_#112033_45%,_#1e293b)] p-4 text-white shadow-[var(--shadow)] sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {featuredDog?.photoUrl ? (
                <Image
                  src={featuredDog.photoUrl}
                  alt={`Foto de ${featuredDog.name}`}
                  width={80}
                  height={80}
                  unoptimized
                  className="h-20 w-20 rounded-[1.5rem] object-cover"
                />
              ) : null}
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Meu pet</p>
                <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">{featuredDog?.name}</h2>
                <p className="mt-1 text-sm text-slate-300">{featuredDog?.breed} • {featuredDog?.age}</p>
              </div>
            </div>
            <div className="hidden rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-right sm:block">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Tutor</p>
              <p className="mt-1 text-sm font-semibold">{featuredClient?.name}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
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
              <p className="mt-2 text-2xl font-semibold">0</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Comentários</p>
              <p className="mt-2 text-2xl font-semibold">{portalFeedbacks.length}</p>
            </div>
          </div>
        </div>

        {visibleSections.resumo ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <article className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--panel)] p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Hoje</p>
            <div className="mt-3 space-y-2 text-sm text-[var(--muted)]">
              <p>Próximo encontro: <span className="font-semibold text-[var(--foreground)]">{clientAgenda[0]?.day ?? "Sem agenda"}{clientAgenda[0] ? ` • ${clientAgenda[0].time}` : ""}</span></p>
              <p>Tarefas pendentes: <span className="font-semibold text-[var(--foreground)]">{pendingTasks}</span></p>
              <p>Novos relatórios: <span className="font-semibold text-[var(--foreground)]">0</span></p>
            </div>
          </article>
          <article className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--panel-strong)] p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Próxima ação</p>
            <div className="mt-3 space-y-2 text-sm text-[var(--muted)]">
              <p className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2">Abra Agenda para confirmar o próximo encontro.</p>
              <p className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2">Abra Tarefas para marcar prática concluída.</p>
            </div>
          </article>
          <article className="rounded-[1.5rem] border border-[var(--border)] bg-white p-4 shadow-sm md:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Feedback e comentários</p>
                <p className="mt-1 text-sm text-[var(--muted)]">Use este campo para contar como foi a prática em casa ou enviar dúvidas rápidas ao adestrador.</p>
              </div>
              <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-sky-800">
                {portalFeedbacks.length} registros
              </span>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
              <textarea
                value={feedbackMessage}
                onChange={(event) => setFeedbackMessage(event.target.value)}
                placeholder="Ex.: Hoje ele conseguiu manter o place por 6 minutos, mas reagiu quando alguém bateu no portão."
                className="min-h-28 rounded-3xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3 text-sm outline-none focus:border-sky-400"
              />
              <button
                type="submit"
                className="pc-primary-action rounded-full px-5 py-3 text-sm font-semibold lg:self-start"
              >
                Enviar comentário
              </button>
            </form>

            <div className="mt-4 space-y-3">
              {portalFeedbacks.slice(0, 3).map((feedback) => (
                <div key={feedback.id} className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[var(--foreground)]">{feedback.author}</p>
                    <span className="text-xs text-[var(--muted)]">{feedback.createdAt}</span>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{feedback.message}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--border)] bg-white p-2 shadow-sm">
          {[
            "Resumo",
            "Agenda",
            "Tarefas",
            "Galeria",
            "Relatórios",
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
                (tab === "Relatórios" && activeSection === "relatorios")
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
            <h2 className="mt-2 font-display text-2xl font-semibold">Próximos encontros com o adestrador</h2>
            <div className="mt-4 space-y-3">
              {clientAgenda.map((event) => (
                <div key={`${event.day}-${event.time}`} className="rounded-2xl border border-[var(--border)] bg-white p-4">
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

          <article className="hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel-strong)] p-5 shadow-sm lg:block">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Perfil do animal</p>
            {featuredDog?.photoUrl ? (
              <div className="relative mt-4 h-52 w-full overflow-hidden rounded-[1.5rem]">
                <Image
                  src={featuredDog.photoUrl}
                  alt={`Perfil de ${featuredDog.name}`}
                  fill
                  sizes="(min-width: 1024px) 32vw, 100vw"
                  unoptimized
                  className="object-cover"
                />
              </div>
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
                <div key={task.id} className="rounded-2xl border border-[var(--border)] bg-white p-3">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold">{task.title}</h3>
                    <button
                      type="button"
                      onClick={() => toggleTask(task.id)}
                      className={`h-5 w-5 rounded-md border ${task.completed ? "border-emerald-600 bg-emerald-500" : "border-[var(--border)] bg-white"}`}
                      aria-label={`Marcar tarefa ${task.title}`}
                    />
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
            {portalGallery.length === 0 ? (
              <p className="mt-4 text-sm text-[var(--muted)]">Nenhuma mídia compartilhada ainda.</p>
            ) : null}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {portalGallery.map((item) => (
                <article key={item.title} className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white">
                  <div className="relative h-28 w-full overflow-hidden">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      sizes="(min-width: 640px) 24vw, 100vw"
                      unoptimized
                      className="object-cover"
                    />
                  </div>
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
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Relatórios recentes</p>
            {portalFeed.length === 0 ? (
              <p className="mt-4 text-sm text-[var(--muted)]">Nenhum relatório disponível ainda.</p>
            ) : null}
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
            {healthAlerts.length === 0 ? (
              <p className="mt-4 text-sm text-slate-300">Nenhum alerta de saúde cadastrado.</p>
            ) : null}
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
          <div className="grid grid-cols-5 gap-2">
            {[
              { label: "Inicio", value: "resumo" },
              { label: "Agenda", value: "agenda" },
              { label: "Tarefas", value: "tarefas" },
              { label: "Mídia", value: "galeria" },
              { label: "Relatórios", value: "relatorios" },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setActiveSection(item.value as "resumo" | "agenda" | "tarefas" | "galeria" | "relatorios")}
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