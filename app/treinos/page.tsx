"use client";

import { FormEvent, useMemo, useState } from "react";

import { PageShell } from "@/components/page-shell";
import { useAppStore } from "@/lib/app-store";

export default function TrainingPage() {
  const trainingSessions = useAppStore((state) => state.trainingSessions);
  const addTrainingSession = useAppStore((state) => state.addTrainingSession);

  const [title, setTitle] = useState("Sessão prática");
  const [block, setBlock] = useState("Guia");
  const [score, setScore] = useState(7);
  const [comment, setComment] = useState("Boa evolução com reforço no timing.");

  const trainingBlocks = useMemo(() => {
    const map = new Map<string, number[]>();

    trainingSessions.forEach((session) => {
      session.notes.forEach((note) => {
        const values = map.get(note.block) ?? [];
        values.push(note.score);
        map.set(note.block, values);
      });
    });

    return Array.from(map.entries()).map(([name, progress]) => {
      const average = progress.reduce((acc, value) => acc + value, 0) / progress.length;
      return {
        name,
        average: `${average.toFixed(1)}/10`,
        progress,
      };
    });
  }, [trainingSessions]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    addTrainingSession({
      title,
      date: new Date().toLocaleDateString("pt-BR"),
      block,
      score,
      comment,
    });
  }

  return (
    <PageShell
      kicker="Técnica"
      title="Treinos e evolução"
      description="Registre e acompanhe sessões de treino por bloco com notas técnicas, scores e progresso evolutivo."
      requireAuth="trainer"
    >
      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Sessões registradas
          </p>
          <div className="mt-5 space-y-4">
            {trainingSessions.map((session) => (
              <div
                key={session.title}
                className="rounded-3xl border border-[var(--border)] bg-white/90 p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                      {session.date}
                    </p>
                    <h2 className="mt-2 font-display text-2xl font-semibold">
                      {session.title}
                    </h2>
                  </div>
                  <span className="rounded-full bg-amber-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-900">
                    Sessão {session.number}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {session.notes.map((note) => (
                    <div key={note.block} className="rounded-2xl border border-[var(--border)] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-semibold">{note.block}</h3>
                        <span className="text-sm font-semibold text-emerald-700">{note.score}/10</span>
                      </div>
                      <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{note.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>

        <div className="grid gap-4">
          <article className="rounded-[1.75rem] border border-[var(--border)] bg-white/90 p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Registrar treino
            </p>
            <form onSubmit={onSubmit} className="mt-4 grid gap-3">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="rounded-2xl border border-[var(--border)] px-4 py-3 text-sm outline-none focus:border-sky-400"
                placeholder="Título da sessão"
              />
              <input
                value={block}
                onChange={(event) => setBlock(event.target.value)}
                className="rounded-2xl border border-[var(--border)] px-4 py-3 text-sm outline-none focus:border-sky-400"
                placeholder="Bloco (ex: Guia, Place)"
              />
              <input
                type="number"
                min={1}
                max={10}
                value={score}
                onChange={(event) => setScore(Number(event.target.value))}
                className="rounded-2xl border border-[var(--border)] px-4 py-3 text-sm outline-none focus:border-sky-400"
              />
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                className="min-h-24 rounded-2xl border border-[var(--border)] px-4 py-3 text-sm outline-none focus:border-sky-400"
              />
              <button type="submit" className="rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-semibold text-white">
                Salvar sessão
              </button>
            </form>
          </article>

          <article className="rounded-[1.75rem] border border-[var(--border)] bg-slate-950 p-6 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Antes do treino
            </p>
            <div className="mt-5 space-y-3 text-sm leading-7 text-slate-300">
              <div className="rounded-3xl bg-white/7 p-4">
                <p className="font-semibold text-white">Última sessão</p>
                <p className="mt-2">Guia 8/10, place 7/10 e resistência leve a estímulos externos.</p>
              </div>
              <div className="rounded-3xl bg-white/7 p-4">
                <p className="font-semibold text-white">Plano sugerido</p>
                <p className="mt-2">Começar com aquecimento em ambiente controlado e progredir para rua com reforço intermitente.</p>
              </div>
              <div className="rounded-3xl bg-white/7 p-4">
                <p className="font-semibold text-white">Prioridades do cliente</p>
                <p className="mt-2">Passeio sem puxar, recepção de visitas e permanência no place durante refeições.</p>
              </div>
            </div>
          </article>

          <article className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel-strong)] p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Evolução por bloco
            </p>
            <div className="mt-5 space-y-4">
              {trainingBlocks.map((block) => (
                <div key={block.name} className="rounded-3xl border border-[var(--border)] bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-display text-2xl font-semibold">{block.name}</h2>
                    <span className="text-sm font-semibold text-emerald-700">Média {block.average}</span>
                  </div>
                  <div className="mt-4 flex items-end gap-2">
                    {block.progress.map((value, index) => (
                      <div key={`${block.name}-${index}`} className="flex-1">
                        <div
                          className="rounded-t-2xl bg-gradient-to-t from-sky-500 to-emerald-400"
                          style={{ height: `${value * 10}px` }}
                        />
                        <p className="mt-2 text-center text-xs text-[var(--muted)]">S{index + 1}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>
    </PageShell>
  );
}