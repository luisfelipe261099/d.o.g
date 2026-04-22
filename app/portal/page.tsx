"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";

import { PageShell } from "@/components/page-shell";
import { useAppStore } from "@/lib/app-store";

export default function PortalPage() {
  const tasks = useAppStore((state) => state.portalTasks);
  const toggleTask = useAppStore((state) => state.toggleTask);
  const addPortalTask = useAppStore((state) => state.addPortalTask);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");

  function handleAddTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!taskTitle.trim()) return;
    addPortalTask(taskTitle, taskDesc);
    setTaskTitle("");
    setTaskDesc("");
  }
  const storeClients = useAppStore((state) => state.clients);
  const completed = tasks.filter((task) => task.completed).length;
  const featuredClient = storeClients[0];
  const featuredDog = featuredClient?.dogs[0];

  return (
    <PageShell
      kicker="Portal"
      title="Portal do tutor"
      description="Gerencie o acesso do tutor e acompanhe apenas o que ele precisa receber após cada sessão."
      requireAuth="trainer"
    >
      <section>
        <article className="rounded-[1.75rem] border border-[var(--border)] bg-slate-950 p-6 text-white shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Link externo
          </p>
          <div className="mt-5 rounded-3xl bg-white/7 p-5">
            {!featuredDog ? (
              <p className="text-sm text-slate-300">Cadastre um cliente para gerar o link do portal.</p>
            ) : (
            <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {featuredDog.photoUrl ? (
                <Image
                  src={featuredDog.photoUrl}
                  alt={`Foto de ${featuredDog.name}`}
                  width={96}
                  height={96}
                  unoptimized
                  className="h-24 w-24 rounded-[1.5rem] object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-[1.5rem] bg-white/20 text-4xl">🐾</div>
              )}
              <div>
                <p className="text-sm text-slate-300">app.pegadacerta.com.br/portal/{featuredDog.name.toLowerCase()}</p>
                <h2 className="mt-4 font-display text-3xl font-semibold">Portal do {featuredDog.name}</h2>
                <p className="mt-2 text-sm text-slate-300">Acesso individual liberado pelo adestrador com privacidade por caso.</p>
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/7 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Tarefas concluídas</p>
                <p className="mt-2 font-display text-4xl font-semibold">{completed}/{tasks.length || 0}</p>
              </div>
              <div className="rounded-2xl bg-white/7 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Tarefas pendentes</p>
                <p className="mt-2 font-display text-2xl font-semibold">{tasks.length - completed}</p>
              </div>
            </div>
            </>
            )}
          </div>
        </article>

        <article className="mt-4 rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Tarefas do tutor
            </p>
            {tasks.length === 0 ? (
              <p className="mt-4 text-sm text-[var(--muted)]">Nenhuma tarefa cadastrada. Adicione tarefas para o tutor acompanhar.</p>
            ) : null}
            <div className="mt-5 space-y-3">
              {tasks.map((task, index) => (
                <div
                  key={task.id}
                  className={`items-start gap-3 rounded-3xl border border-[var(--border)] bg-white/90 p-4 ${index > 2 ? "hidden md:flex" : "flex"}`}
                >
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    className={`mt-1 h-5 w-5 rounded-md border ${
                      task.completed ? "border-emerald-600 bg-emerald-500" : "border-[var(--border)] bg-white"
                    }`}
                  />
                  <div>
                    <h3 className="font-semibold">{task.title}</h3>
                    <p className="mt-1 hidden text-sm leading-7 text-[var(--muted)] sm:block">{task.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-[var(--border)] bg-white p-4 md:hidden">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Resumo rápido</p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Concluídas: <span className="font-semibold text-[var(--foreground)]">{completed}</span>
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Pendentes: <span className="font-semibold text-[var(--foreground)]">{tasks.length - completed}</span>
              </p>
            </div>

            <form onSubmit={handleAddTask} className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <input
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Título da tarefa"
                className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-sky-400"
                required
              />
              <input
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                placeholder="Descrição (opcional)"
                className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-sky-400"
              />
              <button
                type="submit"
                className="pc-primary-action rounded-full px-5 py-3 text-sm font-semibold whitespace-nowrap"
              >
                Adicionar tarefa
              </button>
            </form>
        </article>
      </section>

    </PageShell>
  );
}