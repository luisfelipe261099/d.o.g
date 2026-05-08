"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import Image from "next/image";

import { PageShell } from "@/components/page-shell";
import { GamificationPanel } from "@/components/gamification-panel";
import { useGamification } from "@/lib/gamification";

type PortalTask = {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
};

type PortalFeedback = {
  id: string;
  author: "Tutor" | "Adestrador";
  message: string;
  createdAt: string;
};

type PortalEvent = {
  id: string;
  day: string;
  time: string;
  status: string;
  plan: string | null;
  sessionNumber: number;
};

type PortalSession = {
  id: string;
  title: string;
  date: string;
  notes: Array<{ comment?: string; score?: number }>;
  media: Array<{ id?: string; dataUrl?: string; thumbDataUrl?: string }>;
};

type PortalData = {
  trainer: { id: string; name: string; phone: string | null };
  client: {
    id: string;
    name: string;
    phone: string | null;
    plan: string | null;
    dogs: Array<{
      id: string;
      name: string;
      breed: string | null;
      age: string | null;
      weight: string | null;
      photoUrl: string | null;
      trainingTypes: string;
    }>;
  };
  events: PortalEvent[];
  sessions: PortalSession[];
  tasks: PortalTask[];
  feedbacks: PortalFeedback[];
  linkMeta: { expiresAt: string; status: "Ativo" };
};

function formatDateTime(value?: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.toLocaleDateString("pt-BR")} ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

export function PortalPublicClient({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<PortalData | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [sendingFeedback, setSendingFeedback] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState("");
  const [pin, setPin] = useState("");
  const [pinRequired, setPinRequired] = useState(false);
  const [unlockAttempt, setUnlockAttempt] = useState(0);
  const [openVideo, setOpenVideo] = useState<{ id: string; src: string; title: string } | null>(null);

  const gam = useGamification(token, { pin: pinRequired ? pin : undefined });

  const pinQuery = useMemo(() => (pinRequired && /^\d{4}$/.test(pin) ? `?pin=${encodeURIComponent(pin)}` : ""), [pinRequired, pin]);

  useEffect(() => {
    async function loadPortal() {
      setLoading(true);
      if (!pinRequired) setError("");
      try {
        const response = await fetch(`/api/portal-public/${encodeURIComponent(token)}${pinQuery}`, { cache: "no-store" });
        if (response.status === 401) {
          setPinRequired(true);
          setData(null);
          setLoading(false);
          return;
        }
        if (!response.ok) throw new Error("Link invalido");
        const payload = (await response.json()) as PortalData;
        setPinRequired(false);
        setData(payload);
      } catch {
        setError("Este link nao esta disponivel. Peca um novo link ao seu adestrador.");
      } finally {
        setLoading(false);
      }
    }

    loadPortal();
  }, [token, pinQuery, pinRequired, unlockAttempt]);

  const featuredDog = data?.client.dogs[0];

  const sessionGallery = useMemo(() => {
    if (!data) return [] as Array<{ id: string; src: string; sessionTitle: string; sessionDate: string }>;

    return data.sessions
      .flatMap((session) =>
        (session.media || []).map((media, index) => ({
          id: `${session.id}-${media.id || index}`,
          src: media.thumbDataUrl || media.dataUrl || "",
          sessionTitle: session.title,
          sessionDate: session.date,
        })),
      )
      .filter((item) => Boolean(item.src))
      .slice(0, 12);
  }, [data]);

  let latestSessionScore: { title: string; date: string; score: number } | null = null;
  for (const session of data?.sessions ?? []) {
    const scores = (session.notes || [])
      .map((note) => Number(note.score ?? 0))
      .filter((score) => Number.isFinite(score) && score > 0);

    if (scores.length) {
      const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      latestSessionScore = { title: session.title, date: session.date, score: average };
      break;
    }
  }

  async function handleToggleTask(task: PortalTask) {
    if (!data) return;

    const nextCompleted = !task.completed;
    setUpdatingTaskId(task.id);

    setData({
      ...data,
      tasks: data.tasks.map((item) => (item.id === task.id ? { ...item, completed: nextCompleted } : item)),
    });

    try {
      const response = await fetch(`/api/portal-public/${encodeURIComponent(token)}${pinQuery}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: task.id, completed: nextCompleted }),
      });

      if (response.status === 401) {
        setPinRequired(true);
        throw new Error("PIN requerido");
      }
      if (!response.ok) throw new Error("Falha ao atualizar tarefa");

      const result = (await response.json()) as { ok?: boolean };
      if (!result.ok) throw new Error("Tarefa nao encontrada");

      gam.award(
        nextCompleted ? "task_completed" : "task_uncompleted",
        nextCompleted ? `Tarefa: ${task.title}` : undefined,
        task.id,
      );
    } catch {
      setData({
        ...data,
        tasks: data.tasks.map((item) => (item.id === task.id ? { ...item, completed: task.completed } : item)),
      });
    } finally {
      setUpdatingTaskId("");
    }
  }

  async function handleSendFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!feedbackMessage.trim() || sendingFeedback || !data) return;

    setSendingFeedback(true);

    try {
      const response = await fetch(`/api/portal-public/${encodeURIComponent(token)}${pinQuery}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: feedbackMessage.trim(), author: "Tutor" }),
      });

      if (!response.ok) throw new Error("Falha ao enviar");
      const created = (await response.json()) as PortalFeedback;

      setData({
        ...data,
        feedbacks: [created, ...data.feedbacks],
      });
      setFeedbackMessage("");
      gam.award("feedback_sent", "Comentário enviado");
    } catch {
      setError("Nao foi possivel enviar o comentario agora.");
    } finally {
      setSendingFeedback(false);
    }
  }

  if (loading) {
    return (
      <PageShell
        kicker="Portal"
        title="Carregando portal do tutor"
        description="Validando acesso e carregando os dados do acompanhamento."
      >
        <p className="text-sm text-[var(--muted)]">Aguarde alguns segundos...</p>
      </PageShell>
    );
  }

  if (error || !data) {
    if (pinRequired) {
      return (
        <PageShell
          kicker="Portal"
          title="Este portal usa PIN"
          description="Digite o PIN de 4 digitos enviado pelo adestrador para liberar o acesso."
        >
          <form
            className="max-w-sm space-y-3 rounded-2xl border border-[var(--border)] bg-white p-5"
            onSubmit={(event) => {
              event.preventDefault();
              if (!/^\d{4}$/.test(pin)) {
                setError("Digite um PIN valido de 4 digitos.");
                return;
              }
              setError("");
              setPinRequired(true);
              setUnlockAttempt((value) => value + 1);
            }}
          >
            <label className="grid gap-2 text-sm font-medium">
              PIN de acesso
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                pattern="[0-9]{4}"
                value={pin}
                onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="0000"
                className="rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 outline-none focus:border-sky-400"
              />
            </label>
            <button type="submit" className="pc-primary-action rounded-full px-4 py-2 text-sm font-semibold">
              Desbloquear portal
            </button>
            {error ? <p className="text-sm text-rose-700">{error}</p> : null}
          </form>
        </PageShell>
      );
    }

    return (
      <PageShell
        kicker="Portal"
        title="Link indisponivel"
        description="Este acesso pode ter expirado, sido revogado ou digitado de forma incorreta."
      >
        <p className="text-sm text-[var(--muted)]">{error || "Solicite um novo link ao adestrador."}</p>
      </PageShell>
    );
  }

  const completedTasks = data.tasks.filter((task) => task.completed).length;
  const scoreStars = latestSessionScore ? Math.round(Math.min(Math.max(latestSessionScore.score, 0), 10) / 2) : 0;
  const nextEvent = data.events[0];
  const latestSession = data.sessions[0];

  return (
    <PageShell
      kicker="Portal do tutor"
      title={`${featuredDog?.name || "Seu cão"}: tarefas e próxima aula`}
      description="Veja o que fazer em casa, quando será a próxima aula e o resumo mais recente do treino."
    >
      <section className="space-y-4">
        <article className="rounded-[1.75rem] border border-[var(--border)] bg-slate-950 p-5 text-white shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {featuredDog?.photoUrl ? (
                <Image
                  src={featuredDog.photoUrl}
                  alt={`Foto de ${featuredDog.name}`}
                  width={90}
                  height={90}
                  unoptimized
                  className="h-20 w-20 rounded-[1.25rem] object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-[1.25rem] bg-white/10 text-3xl">🐾</div>
              )}
              <div>
                <h2 className="font-display text-2xl font-semibold">{featuredDog?.name || "Pet"}</h2>
                <p className="mt-1 text-sm text-slate-300">Tutor: {data.client.name}</p>
                <p className="text-sm text-slate-300">Adestrador: {data.trainer.name}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-xs text-slate-300">
              <p>Link: {data.linkMeta.status}</p>
              <p>Expira em: {formatDateTime(data.linkMeta.expiresAt)}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Tarefas</p>
              <p className="mt-2 text-2xl font-semibold">{completedTasks}/{data.tasks.length}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Próxima aula</p>
              <p className="mt-2 text-2xl font-semibold">{nextEvent ? nextEvent.time : "-"}</p>
              <p className="mt-1 text-xs text-slate-300">{nextEvent?.day || "Sem data"}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Último treino</p>
              <p className="mt-2 text-xl font-semibold">{latestSession?.date || "-"}</p>
              <p className="mt-1 text-xs text-slate-300">{latestSession?.title || "Sem registro"}</p>
            </div>
          </div>
        </article>

        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Tarefas de casa</p>
            <div className="mt-4 space-y-3">
              {data.tasks.length === 0 ? <p className="text-sm text-[var(--muted)]">Sem tarefas registradas para este caso.</p> : null}
              {data.tasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-white p-3">
                  <button
                    type="button"
                    disabled={updatingTaskId === task.id}
                    onClick={() => handleToggleTask(task)}
                    className={`mt-1 h-5 w-5 rounded border ${task.completed ? "bg-sky-500 border-sky-600" : "bg-white border-[var(--border)]"}`}
                  />
                  <div>
                    <p className="font-semibold">{task.title}</p>
                    <p className="text-sm text-[var(--muted)]">{task.description || "Sem descricao."}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Agenda e notas</p>
            <div className="mt-4 space-y-3">
              {data.events.slice(0, 3).map((event) => (
                <div key={event.id} className="rounded-2xl border border-[var(--border)] bg-white p-3">
                  <p className="font-semibold">{event.day} - {event.time}</p>
                  <p className="text-xs text-[var(--muted)]">Sessao {event.sessionNumber} - {event.status}</p>
                </div>
              ))}
              {data.events.length === 0 ? <p className="text-sm text-[var(--muted)]">Sem encontros na agenda.</p> : null}
            </div>

            <div className="mt-4 space-y-2">
              {data.sessions.slice(0, 2).map((session) => (
                <div key={session.id} className="rounded-2xl border border-[var(--border)] bg-white p-3">
                  <p className="font-semibold">{session.date} - {session.title}</p>
                  <p className="text-sm text-[var(--muted)]">{session.notes[0]?.comment || "Sem anotacoes detalhadas."}</p>
                </div>
              ))}
              {data.sessions.length === 0 ? <p className="text-sm text-[var(--muted)]">Sem sessoes registradas.</p> : null}
            </div>
          </article>
        </div>

        <article className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Avaliacao e evidencias</p>
          <div className="mt-3 rounded-2xl border border-[var(--border)] bg-white p-3">
            {latestSessionScore ? (
              <>
                <p className="text-sm font-semibold text-[var(--foreground)]">Ultima avaliacao: {latestSessionScore.title}</p>
                <p className="text-xs text-[var(--muted)]">{latestSessionScore.date}</p>
                <p className="mt-2 text-base text-amber-500">{"★".repeat(scoreStars)}{"☆".repeat(5 - scoreStars)}</p>
                <p className="text-xs text-[var(--muted)]">Media tecnica: {latestSessionScore.score.toFixed(1)}/10</p>
              </>
            ) : (
              <p className="text-sm text-[var(--muted)]">Ainda nao ha avaliacao numerica registrada.</p>
            )}
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {sessionGallery.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setOpenVideo({ id: item.id, src: item.src, title: item.sessionTitle });
                  gam.watchVideo(item.id);
                }}
                className="group overflow-hidden rounded-xl border border-[var(--border)] bg-white text-left transition hover:border-sky-300"
              >
                <div className="relative h-20 w-full">
                  <Image src={item.src} alt={`Treino ${item.sessionTitle}`} fill sizes="(min-width: 768px) 8rem, 30vw" unoptimized className="object-cover" />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-2xl text-white opacity-0 transition group-hover:opacity-100">▶</span>
                  {gam.state.watchedVideos.includes(item.id) ? (
                    <span className="absolute right-1 top-1 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-white">Visto</span>
                  ) : (
                    <span className="absolute right-1 top-1 rounded-full bg-amber-400 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-amber-900">+15 pts</span>
                  )}
                </div>
                <p className="truncate px-2 py-1 text-[10px] text-[var(--muted)]">{item.sessionDate}</p>
              </button>
            ))}
            {sessionGallery.length === 0 ? <p className="col-span-3 text-sm text-[var(--muted)]">Sem fotos anexadas nas sessões até o momento.</p> : null}
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Avalie as últimas aulas</p>
            <div className="mt-2 grid gap-2">
              {data.sessions.slice(0, 5).map((session) => {
                const current = gam.state.sessionRatings[session.id] ?? 0;
                return (
                  <div key={session.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[var(--border)] bg-white p-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--foreground)]">{session.title}</p>
                      <p className="text-[11px] text-[var(--muted)]">{session.date}</p>
                    </div>
                    <div className="flex items-center gap-1" role="radiogroup" aria-label={`Avaliar ${session.title}`}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => gam.rateSession(session.id, star)}
                          className={`text-xl leading-none ${current >= star ? "text-amber-400" : "text-slate-300"}`}
                          aria-label={`${star} estrelas`}
                        >★</button>
                      ))}
                      {current === 0 ? (
                        <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900">+15 pts</span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
              {data.sessions.length === 0 ? <p className="text-sm text-[var(--muted)]">Sem aulas registradas para avaliar.</p> : null}
            </div>
          </div>
        </article>

        <GamificationPanel
          state={gam.state}
          trainerName={data.trainer.name}
          onRateTrainer={gam.rateTrainer}
          lastEarned={gam.lastEarned}
          onDismissEarned={gam.dismissEarned}
        />

        <article className="rounded-[1.5rem] border border-[var(--border)] bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Fale com o adestrador</p>
          <form onSubmit={handleSendFeedback} className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
            <textarea
              value={feedbackMessage}
              onChange={(event) => setFeedbackMessage(event.target.value)}
              className="min-h-24 rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm outline-none focus:border-sky-400"
              placeholder="Conte como foi a pratica em casa e envie suas duvidas."
            />
            <button
              type="submit"
              disabled={sendingFeedback}
              className="pc-primary-action rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-60"
            >
              {sendingFeedback ? "Enviando..." : "Enviar comentario"}
            </button>
          </form>

          <div className="mt-4 space-y-2">
            {data.feedbacks.slice(0, 5).map((feedback) => (
              <div key={feedback.id} className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">{feedback.author}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{feedback.message}</p>
              </div>
            ))}
            {data.feedbacks.length === 0 ? <p className="text-sm text-[var(--muted)]">Nenhum comentario enviado ainda.</p> : null}
          </div>
        </article>
      </section>

      {openVideo ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true">
          <button type="button" aria-label="Fechar" className="absolute inset-0" onClick={() => setOpenVideo(null)} />
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] px-4 py-2">
              <p className="text-sm font-semibold text-[var(--foreground)]">{openVideo.title}</p>
              <button type="button" onClick={() => setOpenVideo(null)} className="rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs font-semibold">Fechar</button>
            </div>
            <div className="relative flex h-[60vh] items-center justify-center bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={openVideo.src} alt={openVideo.title} className="max-h-full max-w-full object-contain" />
            </div>
            <p className="px-4 py-2 text-xs text-emerald-700">+15 pts por assistir o material da aula.</p>
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
