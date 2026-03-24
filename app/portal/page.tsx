"use client";

import { PageShell } from "@/components/page-shell";
import { useAppStore } from "@/lib/app-store";
import { portalFeed, portalGallery } from "@/lib/mock-data";

export default function PortalPage() {
  const tasks = useAppStore((state) => state.portalTasks);
  const toggleTask = useAppStore((state) => state.toggleTask);
  const completed = tasks.filter((task) => task.completed).length;

  return (
    <PageShell
      kicker="Experiência do cliente"
      title="Portal externo sem login complexo"
      description="A visualização mostra como o dono do cão acompanha tarefas, aulas, saúde e mídia em uma URL personalizada pronta para compartilhar por link ou QR Code."
      requireAuth
    >
      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-[1.75rem] border border-[var(--border)] bg-slate-950 p-6 text-white shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Link externo
          </p>
          <div className="mt-5 rounded-3xl bg-white/7 p-5">
            <p className="text-sm text-slate-300">app.dominio.com/cliente/canil-prime/8fd2x1</p>
            <h2 className="mt-4 font-display text-3xl font-semibold">Portal do Thor</h2>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              Acesso simplificado com token seguro. O cliente consegue confirmar aula, ver tarefas e acompanhar a evolução sem depender de app nativo.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/7 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Aulas realizadas</p>
                <p className="mt-2 font-display text-4xl font-semibold">{completed + 4}/12</p>
              </div>
              <div className="rounded-2xl bg-white/7 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Próxima aula</p>
                <p className="mt-2 font-display text-2xl font-semibold">Qua, 18:30</p>
              </div>
            </div>
          </div>
        </article>

        <div className="grid gap-4">
          <article className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Tarefas do cliente
            </p>
            <div className="mt-5 space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.title}
                  className="flex items-start gap-3 rounded-3xl border border-[var(--border)] bg-white/90 p-4"
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
                    <p className="mt-1 text-sm leading-7 text-[var(--muted)]">{task.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel-strong)] p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Relatórios simplificados
            </p>
            <div className="mt-5 space-y-3">
              {portalFeed.map((item) => (
                <div key={item.title} className="rounded-3xl border border-[var(--border)] bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display text-xl font-semibold">{item.title}</h3>
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                      {item.date}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{item.summary}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Galeria compartilhável
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold">
              Fotos e vídeos por sessão
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-[var(--muted)]">
            A galeria organiza fotos e vídeos por sessão com acesso controlado para o cliente.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {portalGallery.map((item) => (
            <article
              key={item.title}
              className="overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-white"
            >
              <div className="h-44 bg-[linear-gradient(135deg,_rgba(14,165,233,0.22),_rgba(245,158,11,0.28)),linear-gradient(180deg,_rgba(255,255,255,0.4),_rgba(17,32,51,0.06))]" />
              <div className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-xl font-semibold">{item.title}</h3>
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                    {item.kind}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{item.caption}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}