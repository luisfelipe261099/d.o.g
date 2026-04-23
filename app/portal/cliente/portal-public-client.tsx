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
  notes: Array<{ comment?: string; score?: number }>;
  media: Array<{ id?: string; dataUrl?: string; thumbDataUrl?: string }>;
};

type PortalPayment = {
  id: string;
  amount: number;
  status: string;
  dueDate: string | null;
  paymentMethod: string | null;
  reference: string | null;
  source: string | null;
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
  payments: PortalPayment[];
  linkMeta: { expiresAt: string; status: "Ativo" };
};

function formatDateTime(value?: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.toLocaleDateString("pt-BR")} ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function paymentStatusBadge(status: string): string {
  if (status === "Pago") return "border-sky-200 bg-sky-50 text-sky-800";
  return "border-amber-200 bg-amber-50 text-amber-900";
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
  const [copiedPaymentId, setCopiedPaymentId] = useState("");

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

  const pendingPayments = useMemo(() => {
    if (!data) return [];
    return data.payments.filter((payment) => payment.status === "Pendente");
  }, [data]);

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

  const latestSessionScore = useMemo(() => {
    if (!data?.sessions.length) return null;

    for (const session of data.sessions) {
      const scores = (session.notes || [])
        .map((note) => Number(note.score ?? 0))
        .filter((score) => Number.isFinite(score) && score > 0);

      if (scores.length) {
        const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        return { title: session.title, date: session.date, score: average };
      }
    }

    return null;
  }, [data]);

  function openWhatsAppForPayment() {
    if (!data?.trainer.phone) {
      setError("Telefone do adestrador nao disponivel para contato de pagamento.");
      return;
    }

    const normalizedPhone = data.trainer.phone.replace(/\D/g, "");
    if (!normalizedPhone) {
      setError("Telefone do adestrador invalido para contato de pagamento.");
      return;
    }

    const message = encodeURIComponent("Oi! Quero confirmar o pagamento do meu plano e enviar comprovante.");
    window.open(`https://wa.me/55${normalizedPhone}?text=${message}`, "_blank", "noopener,noreferrer");
  }

  function buildPaymentCopyText(payment: PortalPayment): string {
    const lines = [
      "Dados para pagamento",
      `Tutor: ${data?.client.name || "Nao informado"}`,
      `Adestrador: ${data?.trainer.name || "Nao informado"}`,
      `Valor: ${formatCurrency(Number(payment.amount || 0))}`,
      `Status: ${payment.status || "Nao informado"}`,
      `Vencimento: ${payment.dueDate || "Nao informado"}`,
      `Metodo: ${payment.paymentMethod || "Nao informado"}`,
      `Referencia: ${payment.reference || payment.source || "Mensalidade"}`,
    ];

    if (data?.trainer.phone) {
      lines.push(`Contato adestrador: ${data.trainer.phone}`);
    }

    lines.push("Mensagem: Segue comprovante do pagamento.");
    return lines.join("\n");
  }

  async function handleCopyPayment(payment: PortalPayment) {
    try {
      await navigator.clipboard.writeText(buildPaymentCopyText(payment));
      setCopiedPaymentId(payment.id);
      window.setTimeout(() => setCopiedPaymentId(""), 1800);
    } catch {
      setError("Nao foi possivel copiar os dados de pagamento.");
      window.setTimeout(() => setError(""), 2000);
    }
  }

  async function handleCopyPendingSummary() {
    const summary = [
      "Resumo financeiro pendente",
      `Tutor: ${data?.client.name || "Nao informado"}`,
      `Adestrador: ${data?.trainer.name || "Nao informado"}`,
      `Quantidade de pendencias: ${pendingPayments.length}`,
      `Total em aberto: ${formatCurrency(pendingAmount)}`,
      "Mensagem: Segue comprovante do pagamento pendente.",
    ].join("\n");

    try {
      await navigator.clipboard.writeText(summary);
      setCopiedPaymentId("summary");
      window.setTimeout(() => setCopiedPaymentId(""), 1800);
    } catch {
      setError("Nao foi possivel copiar o resumo financeiro.");
      window.setTimeout(() => setError(""), 2000);
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
  const scoreStars = latestSessionScore ? Math.round(Math.min(Math.max(latestSessionScore.score, 0), 10) / 2) : 0;

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
                {formatCurrency(pendingAmount)}
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-[1.5rem] border border-[var(--border)] bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Financeiro</p>
              <h3 className="mt-1 text-lg font-semibold text-[var(--foreground)]">Cobranças e pagamento</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">Acompanhe valores pendentes e fale com o adestrador para concluir o pagamento.</p>
            </div>
            <button
              type="button"
              onClick={openWhatsAppForPayment}
              className="rounded-full border border-[var(--border)] bg-[#145a82] px-3 py-1.5 text-xs font-semibold text-white"
            >
              Falar sobre pagamento
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {data.payments.slice(0, 6).map((payment) => (
              <article key={payment.id} className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[var(--foreground)]">{formatCurrency(payment.amount)}</p>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${paymentStatusBadge(payment.status)}`}>
                    {payment.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--muted)]">Vencimento: {payment.dueDate || "Nao informado"}</p>
                <p className="text-xs text-[var(--muted)]">Metodo: {payment.paymentMethod || "Nao informado"}</p>
                <p className="text-xs text-[var(--muted)]">Referencia: {payment.reference || payment.source || "Mensalidade"}</p>
                <button
                  type="button"
                  onClick={() => handleCopyPayment(payment)}
                  className="mt-2 rounded-full border border-[var(--border)] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#145a82]"
                >
                  {copiedPaymentId === payment.id ? "Dados copiados" : "Copiar dados"}
                </button>
              </article>
            ))}
            {data.payments.length === 0 ? <p className="text-sm text-[var(--muted)]">Sem cobrancas registradas para este caso.</p> : null}
          </div>
          {pendingPayments.length > 0 ? (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              <p>Existem {pendingPayments.length} cobranca(s) pendente(s). Total: {formatCurrency(pendingAmount)}.</p>
              <button
                type="button"
                onClick={handleCopyPendingSummary}
                className="mt-2 rounded-full border border-amber-300 bg-white px-2.5 py-1 font-semibold text-amber-900"
              >
                {copiedPaymentId === "summary" ? "Resumo copiado" : "Copiar resumo"}
              </button>
            </div>
          ) : null}
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
              <div key={item.id} className="overflow-hidden rounded-xl border border-[var(--border)] bg-white">
                <div className="relative h-20 w-full">
                  <Image src={item.src} alt={`Treino ${item.sessionTitle}`} fill sizes="(min-width: 768px) 8rem, 30vw" unoptimized className="object-cover" />
                </div>
                <p className="truncate px-2 py-1 text-[10px] text-[var(--muted)]">{item.sessionDate}</p>
              </div>
            ))}
            {sessionGallery.length === 0 ? <p className="col-span-3 text-sm text-[var(--muted)]">Sem fotos anexadas nas sessoes ate o momento.</p> : null}
          </div>
        </article>

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
