"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import Image from "next/image";

import { PageShell } from "@/components/page-shell";

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
  notes: Array<{ comment?: string }>;
};

type PortalPayment = {
  id: string;
  amount: number;
  status: string;
  dueDate: string | null;
};

type PortalData = {
  trainer: { id: string; name: string };
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
  payments: PortalPayment[];
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

  const pendingAmount = useMemo(() => {
    if (!data) return 0;
    return data.payments
      .filter((payment) => payment.status === "Pendente")
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  }, [data]);

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

  return (
    <PageShell
      kicker="Portal do tutor"
      title={`Acompanhamento de ${featuredDog?.name || "seu pet"}`}
      description="Acesso rapido sem login para visualizar tarefas, agenda e progresso do adestramento."
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
              <p>Status do link: {data.linkMeta.status}</p>
              <p>Expira em: {formatDateTime(data.linkMeta.expiresAt)}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Tarefas</p>
              <p className="mt-2 text-2xl font-semibold">{completedTasks}/{data.tasks.length}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Agenda</p>
              <p className="mt-2 text-2xl font-semibold">{data.events.length}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Financeiro pendente</p>
              <p className="mt-2 text-xl font-semibold">
                {pendingAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
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
                    className={`mt-1 h-5 w-5 rounded border ${task.completed ? "bg-emerald-500 border-emerald-600" : "bg-white border-[var(--border)]"}`}
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
    </PageShell>
  );
}
