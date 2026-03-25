"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { PageShell } from "@/components/page-shell";
import { useAppStore } from "@/lib/app-store";

export default function TrainingPage() {
  const clients = useAppStore((state) => state.clients);
  const trainingSessions = useAppStore((state) => state.trainingSessions);
  const calendarEvents = useAppStore((state) => state.calendarEvents);
  const addTrainingSession = useAppStore((state) => state.addTrainingSession);

  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id ?? "");
  const [selectedDogId, setSelectedDogId] = useState(clients[0]?.dogs[0]?.id ?? "");
  const [title, setTitle] = useState("Sessão prática");
  const [block, setBlock] = useState("Guia");
  const [score, setScore] = useState(7);
  const [comment, setComment] = useState("Boa evolução com reforço no timing.");

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === selectedClientId) ?? clients[0],
    [clients, selectedClientId],
  );
  const selectedDog = useMemo(
    () => selectedClient?.dogs.find((dog) => dog.id === selectedDogId) ?? selectedClient?.dogs[0],
    [selectedClient, selectedDogId],
  );

  useEffect(() => {
    if (!selectedClient && clients[0]) {
      setSelectedClientId(clients[0].id);
      setSelectedDogId(clients[0].dogs[0]?.id ?? "");
      return;
    }

    if (!selectedDog && selectedClient?.dogs[0]) {
      setSelectedDogId(selectedClient.dogs[0].id);
    }
  }, [clients, selectedClient, selectedDog]);

  useEffect(() => {
    if (selectedDog?.trainingTypes[0]) {
      setBlock(selectedDog.trainingTypes[0]);
    }
  }, [selectedDog?.id, selectedDog?.trainingTypes]);

  const selectedSessions = useMemo(() => {
    if (!selectedDog) return [];

    return trainingSessions.filter((session) => {
      if (session.dogId) {
        return session.dogId === selectedDog.id;
      }

      return session.dogName === selectedDog.name;
    });
  }, [selectedDog, trainingSessions]);

  const orderedSessions = useMemo(
    () => [...selectedSessions].sort((left, right) => right.number - left.number),
    [selectedSessions],
  );

  const blockSummaries = useMemo(() => {
    const map = new Map<string, number[]>();

    orderedSessions.forEach((session) => {
      session.notes.forEach((note) => {
        const values = map.get(note.block) ?? [];
        values.push(note.score);
        map.set(note.block, values);
      });
    });

    return Array.from(map.entries())
      .map(([name, progress]) => {
        const averageValue = progress.reduce((total, value) => total + value, 0) / progress.length;
        const lastScore = progress[progress.length - 1];
        const previousScore = progress.length > 1 ? progress[progress.length - 2] : lastScore;

        return {
          name,
          average: `${averageValue.toFixed(1)}/10`,
          averageValue,
          progress,
          lastScore,
          trend: lastScore - previousScore,
        };
      })
      .sort((left, right) => right.averageValue - left.averageValue);
  }, [orderedSessions]);

  const latestSession = orderedSessions[0];
  const upcomingSession = calendarEvents.find(
    (event) => event.dog === selectedDog?.name && event.client === selectedClient?.name,
  );
  const allNotes = orderedSessions.flatMap((session) => session.notes);
  const averageScore = allNotes.length
    ? (allNotes.reduce((total, note) => total + note.score, 0) / allNotes.length).toFixed(1)
    : "0.0";
  const strongestBlock = blockSummaries[0];
  const attentionBlock = [...blockSummaries].sort((left, right) => left.averageValue - right.averageValue)[0];
  const nextSessionNumber = orderedSessions.length + 1;
  const blockOptions = Array.from(
    new Set(["Guia", "Place", "Distrações", ...(selectedDog?.trainingTypes ?? []), ...blockSummaries.map((item) => item.name)]),
  );

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !block.trim() || !comment.trim() || !selectedClient || !selectedDog) return;

    addTrainingSession({
      title: title.trim(),
      date: new Date().toLocaleDateString("pt-BR"),
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      dogId: selectedDog.id,
      dogName: selectedDog.name,
      block,
      score,
      comment: comment.trim(),
    });

    setTitle("Sessão prática");
    setBlock(selectedDog.trainingTypes[0] ?? "Guia");
    setScore(7);
    setComment("Boa evolução com reforço no timing.");
  }

  return (
    <PageShell
      kicker="Treinos"
      title="Treinos com visão operacional"
      description="Organize a próxima aula, registre a sessão em poucos passos e acompanhe a evolução com leitura rápida."
      requireAuth="trainer"
    >
      <section className="grid gap-4 xl:grid-cols-[1.12fr_0.88fr]">
        <div className="grid gap-4">
          <article className="overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-slate-950 text-white shadow-sm">
            <div className="grid gap-5 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Próxima condução de treino
                </p>
                <h2 className="mt-3 font-display text-3xl font-semibold">
                  {selectedDog?.name ?? "Thor"} em foco para a sessão {nextSessionNumber}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                  Use esta área para alinhar o objetivo da aula antes de abrir o histórico completo.
                  O fluxo agora prioriza contexto, foco técnico e registro rápido.
                </p>

                <div className="mt-5 grid gap-3 lg:grid-cols-2">
                  <label className="rounded-3xl border border-white/10 bg-white/7 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Cliente</p>
                    <select
                      value={selectedClient?.id ?? ""}
                      onChange={(event) => setSelectedClientId(event.target.value)}
                      className="mt-3 w-full rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-sm text-white outline-none"
                    >
                      {clients.map((client) => (
                        <option key={client.id} value={client.id} className="text-slate-950">
                          {client.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="rounded-3xl border border-white/10 bg-white/7 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Cão</p>
                    <select
                      value={selectedDog?.id ?? ""}
                      onChange={(event) => setSelectedDogId(event.target.value)}
                      className="mt-3 w-full rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-sm text-white outline-none"
                    >
                      {(selectedClient?.dogs ?? []).map((dog) => (
                        <option key={dog.id} value={dog.id} className="text-slate-950">
                          {dog.name} • {dog.breed}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl border border-white/10 bg-white/7 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Cliente</p>
                    <p className="mt-2 text-lg font-semibold">{selectedClient?.name ?? "Marina Costa"}</p>
                    <p className="mt-1 text-sm text-slate-300">{selectedClient?.plan ?? "Plano Pro • 12 sessões"}</p>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/7 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Próximo encontro</p>
                    <p className="mt-2 text-lg font-semibold">
                      {upcomingSession?.day ?? "Quarta"} • {upcomingSession?.time ?? "18:30"}
                    </p>
                    <p className="mt-1 text-sm text-slate-300">{upcomingSession?.plan ?? "Sessão prática"}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/7 p-4">
                {selectedDog?.photoUrl ? (
                  <Image
                    src={selectedDog.photoUrl}
                    alt={`Foto de ${selectedDog.name}`}
                    width={720}
                    height={520}
                    unoptimized
                    className="h-64 w-full rounded-[1.25rem] object-cover"
                  />
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">
                  {(selectedDog?.trainingTypes ?? ["Guia", "Place", "Obediência"]).map((item) => (
                    <span key={item} className="rounded-full border border-white/12 px-3 py-2">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </article>

          <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            <article className="rounded-[1.5rem] border border-[var(--border)] bg-white/90 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Sessões</p>
              <p className="mt-3 font-display text-4xl font-semibold">{orderedSessions.length}</p>
              <p className="mt-2 text-sm text-[var(--muted)]">Histórico ativo de {selectedDog?.name ?? "um cão"}</p>
            </article>
            <article className="rounded-[1.5rem] border border-[var(--border)] bg-white/90 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Média geral</p>
              <p className="mt-3 font-display text-4xl font-semibold">{averageScore}</p>
              <p className="mt-2 text-sm text-emerald-700">Leitura consolidada das notas lançadas</p>
            </article>
            <article className="rounded-[1.5rem] border border-[var(--border)] bg-white/90 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Melhor resposta</p>
              <p className="mt-3 font-display text-3xl font-semibold">{strongestBlock?.name ?? "Guia"}</p>
              <p className="mt-2 text-sm text-[var(--muted)]">Média {strongestBlock?.average ?? "0.0/10"}</p>
            </article>
            <article className="rounded-[1.5rem] border border-[var(--border)] bg-white/90 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Pede atenção</p>
              <p className="mt-3 font-display text-3xl font-semibold">{attentionBlock?.name ?? "Place"}</p>
              <p className="mt-2 text-sm text-amber-700">Priorizar ajustes na próxima aula</p>
            </article>
          </div>

          <article className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Evolução por bloco
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold">
                  Leitura rápida do que está consolidando e do que exige intervenção
                </h2>
              </div>
              <span className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                {blockSummaries.length} blocos monitorados neste caso
              </span>
            </div>

            {blockSummaries.length ? (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {blockSummaries.map((item) => (
                <div key={item.name} className="rounded-3xl border border-[var(--border)] bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-display text-2xl font-semibold">{item.name}</h3>
                      <p className="mt-1 text-sm text-[var(--muted)]">Última nota {item.lastScore}/10</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-emerald-700">Média {item.average}</p>
                      <p className={`mt-1 text-xs font-semibold uppercase tracking-[0.14em] ${item.trend >= 0 ? "text-sky-700" : "text-amber-800"}`}>
                        {item.trend >= 0 ? `+${item.trend}` : item.trend} vs. sessão anterior
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-end gap-2">
                    {item.progress.map((value, index) => (
                      <div key={`${item.name}-${index}`} className="flex-1">
                        <div className="h-28 rounded-[1.25rem] bg-[rgba(15,23,42,0.06)] p-2">
                          <div
                            className="h-full rounded-[1rem] bg-gradient-to-t from-[var(--foreground)] via-sky-500 to-emerald-300"
                            style={{ height: `${Math.max(value * 10, 14)}%` }}
                          />
                        </div>
                        <p className="mt-2 text-center text-xs text-[var(--muted)]">S{index + 1}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            ) : (
            <div className="mt-6 rounded-3xl border border-dashed border-[var(--border)] bg-white/75 p-6 text-sm text-[var(--muted)]">
              Ainda não existem sessões vinculadas a {selectedDog?.name ?? "este cão"}. Selecione o caso e registre a primeira aula para começar o histórico.
            </div>
            )}
          </article>
        </div>

        <div className="grid gap-4">
          <article className="rounded-[1.75rem] border border-[var(--border)] bg-white/95 p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Registrar treino
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold">Lançamento rápido da sessão</h2>
              </div>
              <span className="rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white">
                Sessão {nextSessionNumber}
              </span>
            </div>

            <form onSubmit={onSubmit} className="mt-5 grid gap-3">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="rounded-2xl border border-[var(--border)] px-4 py-3 text-sm outline-none focus:border-sky-400"
                placeholder="Título da sessão"
                required
              />
              <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
                <select
                  value={block}
                  onChange={(event) => setBlock(event.target.value)}
                  className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-sky-400"
                >
                  {blockOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={score}
                  onChange={(event) => setScore(Number(event.target.value))}
                  className="rounded-2xl border border-[var(--border)] px-4 py-3 text-sm outline-none focus:border-sky-400"
                />
              </div>
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                className="min-h-32 rounded-2xl border border-[var(--border)] px-4 py-3 text-sm outline-none focus:border-sky-400"
                placeholder="O que aconteceu na sessão, onde houve avanço e qual ajuste precisa entrar na próxima aula"
                required
              />
              <button
                type="submit"
                className="rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-semibold text-white"
              >
                Salvar sessão
              </button>
            </form>

            <div className="mt-5 rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Resumo antes de salvar</p>
              <div className="mt-3 grid gap-3 text-sm text-[var(--muted)] sm:grid-cols-2">
                <div>
                  <p className="font-semibold text-[var(--foreground)]">Caso selecionado</p>
                  <p className="mt-1">{selectedClient?.name} • {selectedDog?.name}</p>
                </div>
                <div>
                  <p className="font-semibold text-[var(--foreground)]">Foco técnico</p>
                  <p className="mt-1">{block}</p>
                </div>
                <div>
                  <p className="font-semibold text-[var(--foreground)]">Escala escolhida</p>
                  <p className="mt-1">{score}/10</p>
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-[1.75rem] border border-[var(--border)] bg-slate-950 p-6 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Plano da próxima aula
            </p>
            <div className="mt-5 space-y-3 text-sm leading-7 text-slate-300">
              <div className="rounded-3xl bg-white/7 p-4">
                <p className="font-semibold text-white">Aquecimento</p>
                <p className="mt-2">
                  Retomar {strongestBlock?.name?.toLowerCase() ?? "o bloco mais consistente"} para entrar com resposta fácil e elevar foco logo no início.
                </p>
              </div>
              <div className="rounded-3xl bg-white/7 p-4">
                <p className="font-semibold text-white">Ponto principal</p>
                <p className="mt-2">
                  Priorizar {attentionBlock?.name?.toLowerCase() ?? "o bloco mais sensível"} com progressão curta, ambiente controlado e critério mais claro entre repetições.
                </p>
              </div>
              <div className="rounded-3xl bg-white/7 p-4">
                <p className="font-semibold text-white">Entrega para o cliente</p>
                <p className="mt-2">
                  Fechar a aula com uma tarefa simples e objetiva para casa, conectada ao bloco {attentionBlock?.name ?? block}.
                </p>
              </div>
              <div className="rounded-3xl bg-white/7 p-4">
                <p className="font-semibold text-white">Contexto do ambiente</p>
                <p className="mt-2">
                  {selectedClient?.environment ?? "Ambiente ainda não descrito para este cliente."}
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel-strong)] p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Última sessão lançada
            </p>
            <div className="mt-4 rounded-3xl border border-[var(--border)] bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl font-semibold">{latestSession?.title ?? "Sessão prática"}</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">{latestSession?.date ?? "02/04/2026"}</p>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-amber-900">
                  Sessão {latestSession?.number ?? nextSessionNumber - 1}
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {latestSession?.notes.map((note) => (
                  <div key={note.block} className="rounded-2xl border border-[var(--border)] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">{note.block}</p>
                      <span className="text-sm font-semibold text-emerald-700">{note.score}/10</span>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{note.comment}</p>
                  </div>
                )) ?? (
                  <div className="rounded-2xl border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">
                    Nenhuma sessão registrada ainda para este cão.
                  </div>
                )}
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="mt-4">
        <article className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                Histórico de sessões
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold">
                Timeline de {selectedDog?.name ?? "treinos"} para revisar o que foi feito sem competir com o formulário
              </h2>
            </div>
            <span className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              Ordem da mais recente para a mais antiga
            </span>
          </div>

          {orderedSessions.length ? (
          <div className="mt-6 space-y-4">
            {orderedSessions.map((session) => (
              <article key={session.id} className="rounded-3xl border border-[var(--border)] bg-white/90 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">{session.date}</p>
                    <h3 className="mt-2 font-display text-2xl font-semibold">{session.title}</h3>
                    <p className="mt-2 text-sm text-[var(--muted)]">{session.clientName ?? selectedClient?.name} • {session.dogName ?? selectedDog?.name}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.14em]">
                    <span className="rounded-full bg-slate-900 px-3 py-2 text-white">Sessão {session.number}</span>
                    <span className="rounded-full border border-[var(--border)] px-3 py-2 text-[var(--muted)]">
                      {session.notes.length} blocos avaliados
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 lg:grid-cols-2">
                  {session.notes.map((note) => (
                    <div key={`${session.id}-${note.block}`} className="rounded-2xl border border-[var(--border)] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="font-semibold">{note.block}</h4>
                        <span className="text-sm font-semibold text-emerald-700">{note.score}/10</span>
                      </div>
                      <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{note.comment}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
          ) : (
          <div className="mt-6 rounded-3xl border border-dashed border-[var(--border)] bg-white/80 p-6 text-sm leading-7 text-[var(--muted)]">
            Nenhuma sessão encontrada para {selectedDog?.name ?? "o cão selecionado"}. Use o formulário acima para criar o primeiro registro deste caso.
          </div>
          )}
        </article>
      </section>
    </PageShell>
  );
}