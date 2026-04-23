"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { PageShell } from "@/components/page-shell";
import { useAppStore } from "@/lib/app-store";

type PortalLinkStatus = "Ativo" | "Revogado" | "Expirado";

type PortalLinkInfo = {
  id: string;
  clientId: string;
  tokenPrefix: string;
  expiresAt: string;
  revokedAt: string | null;
  lastAccessAt: string | null;
  hasPin: boolean;
  status: PortalLinkStatus;
  shareUrl: string | null;
  previewPath: string;
};

function formatDateTime(value?: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return `${date.toLocaleDateString("pt-BR")} ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

export default function PortalPage() {
  const trainerName = useAppStore((state) => state.trainerName);
  const storeClients = useAppStore((state) => state.clients);
  const sessions = useAppStore((state) => state.trainingSessions);
  const events = useAppStore((state) => state.calendarEvents);
  const payments = useAppStore((state) => state.payments);
  const tasks = useAppStore((state) => state.portalTasks);
  const feedbacks = useAppStore((state) => state.portalFeedbacks);
  const toggleTask = useAppStore((state) => state.toggleTask);
  const addPortalTask = useAppStore((state) => state.addPortalTask);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedDogId, setSelectedDogId] = useState("");
  const [copyStatus, setCopyStatus] = useState<"idle" | "ok" | "error">("idle");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [portalLink, setPortalLink] = useState<PortalLinkInfo | null>(null);
  const [lastGeneratedUrl, setLastGeneratedUrl] = useState("");
  const [isLoadingLink, setIsLoadingLink] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [isRevokingLink, setIsRevokingLink] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [expiresInDays, setExpiresInDays] = useState(90);
  const [pinEnabled, setPinEnabled] = useState(false);
  const [pin, setPin] = useState("");

  const selectedClient = useMemo(() => {
    if (!storeClients.length) return null;
    return storeClients.find((client) => client.id === selectedClientId) ?? storeClients[0];
  }, [storeClients, selectedClientId]);

  const selectedDog = useMemo(() => {
    if (!selectedClient?.dogs.length) return null;
    return selectedClient.dogs.find((dog) => dog.id === selectedDogId) ?? selectedClient.dogs[0];
  }, [selectedClient, selectedDogId]);

  const selectedTasks = useMemo(
    () => tasks.filter((task) => !selectedClient || task.clientId === selectedClient.id),
    [tasks, selectedClient],
  );

  const selectedFeedbacks = useMemo(
    () => feedbacks.filter((feedback) => !selectedClient || feedback.clientId === selectedClient.id),
    [feedbacks, selectedClient],
  );

  useEffect(() => {
    async function loadPortalLink() {
      if (!selectedClient?.id) {
        setPortalLink(null);
        setLastGeneratedUrl("");
        return;
      }

      setIsLoadingLink(true);
      setLinkError("");

      try {
        const response = await fetch(`/api/portal-links?clientId=${encodeURIComponent(selectedClient.id)}`, {
          cache: "no-store",
        });

        if (!response.ok) throw new Error("Falha ao consultar link");

        const body = (await response.json()) as { link?: PortalLinkInfo | null };
        setPortalLink(body.link ?? null);
        setLastGeneratedUrl("");
      } catch {
        setLinkError("Nao foi possivel carregar o status do link deste tutor.");
      } finally {
        setIsLoadingLink(false);
      }
    }

    loadPortalLink();
  }, [selectedClient?.id]);

  async function handleAddTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!taskTitle.trim() || isAddingTask || !selectedClient?.id) return;
    setIsAddingTask(true);
    try {
      await addPortalTask(taskTitle, taskDesc, selectedClient.id);
      setTaskTitle("");
      setTaskDesc("");
    } finally {
      setIsAddingTask(false);
    }
  }

  async function handleTemplateTask(template: string) {
    if (isAddingTask || !selectedClient?.id) return;
    setIsAddingTask(true);
    try {
      await addPortalTask(template, "Tarefa sugerida pelo plano semanal", selectedClient.id);
    } finally {
      setIsAddingTask(false);
    }
  }
  const completed = selectedTasks.filter((task) => task.completed).length;
  const pendingTasks = selectedTasks.length - completed;

  const selectedEvents = useMemo(() => {
    if (!selectedClient) return [];

    return events.filter((event) => {
      const sameClient = event.client === selectedClient.name;
      const sameDog = selectedDog ? event.dog === selectedDog.name : true;
      return sameClient && sameDog;
    });
  }, [events, selectedClient, selectedDog]);

  const selectedSessions = useMemo(() => {
    if (!selectedClient) return [];

    return sessions.filter((session) => {
      const sameClient = session.clientName === selectedClient.name;
      const sameDog = selectedDog ? session.dogId === selectedDog.id || session.dogName === selectedDog.name : true;
      return sameClient && sameDog;
    });
  }, [sessions, selectedClient, selectedDog]);

  const selectedPayments = useMemo(() => {
    if (!selectedClient) return [];

    return payments.filter(
      (payment) => payment.clientId === selectedClient.id || payment.clientName === selectedClient.name,
    );
  }, [payments, selectedClient]);

  const pendingAmount = selectedPayments
    .filter((payment) => payment.status === "Pendente")
    .reduce((sum, payment) => sum + payment.amount, 0);

  async function handleGeneratePortalLink() {
    if (!selectedClient?.id || isGeneratingLink) return;
    if (pinEnabled && !/^\d{4}$/.test(pin)) {
      setLinkError("Defina um PIN de 4 digitos para proteger o link.");
      return;
    }

    setIsGeneratingLink(true);
    setLinkError("");
    setCopyStatus("idle");

    try {
      const response = await fetch("/api/portal-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: selectedClient.id, expiresInDays, pin: pinEnabled ? pin : null }),
      });

      if (!response.ok) throw new Error("Falha ao gerar link");

      const body = (await response.json()) as { link?: PortalLinkInfo };
      if (!body.link) throw new Error("Resposta sem link");

      setPortalLink(body.link);
      setLastGeneratedUrl(body.link.shareUrl ?? "");
    } catch {
      setLinkError("Nao foi possivel gerar o link deste tutor. Tente novamente.");
    } finally {
      setIsGeneratingLink(false);
    }
  }

  async function handleRevokePortalLink() {
    if (!selectedClient?.id || isRevokingLink) return;

    setIsRevokingLink(true);
    setLinkError("");

    try {
      const response = await fetch("/api/portal-links", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: selectedClient.id, action: "revoke" }),
      });

      if (!response.ok) throw new Error("Falha ao revogar link");

      setPortalLink((current) =>
        current
          ? {
              ...current,
              status: "Revogado",
              revokedAt: new Date().toISOString(),
              shareUrl: null,
            }
          : current,
      );
      setLastGeneratedUrl("");
    } catch {
      setLinkError("Nao foi possivel revogar o link agora.");
    } finally {
      setIsRevokingLink(false);
    }
  }

  async function handleCopyPortalLink() {
    if (!lastGeneratedUrl) {
      setCopyStatus("error");
      window.setTimeout(() => setCopyStatus("idle"), 2000);
      return;
    }

    try {
      await navigator.clipboard.writeText(lastGeneratedUrl);
      setCopyStatus("ok");
    } catch {
      setCopyStatus("error");
    }

    window.setTimeout(() => setCopyStatus("idle"), 2000);
  }

  return (
    <PageShell
      kicker="Portal"
      title="Portal do tutor"
      description="Entregue tarefas por caso, compartilhe o acesso com o tutor e acompanhe execução, agenda e financeiro no mesmo fluxo."
      requireAuth="trainer"
    >
      <section>
        <article className="rounded-[1.75rem] border border-[var(--border)] bg-slate-950 p-6 text-white shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Entrega para o tutor
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">Painel de acompanhamento por caso</h2>
              <p className="mt-2 text-sm text-slate-300">
                Adestrador: {trainerName || "Sem nome"}
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <label className="grid gap-1 text-xs uppercase tracking-[0.14em] text-slate-400">
                Cliente
                <select
                  value={selectedClient?.id ?? ""}
                  onChange={(event) => setSelectedClientId(event.target.value)}
                  className="min-w-56 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white outline-none"
                >
                  {storeClients.length === 0 ? <option value="">Sem clientes</option> : null}
                  {storeClients.map((client) => (
                    <option key={client.id} value={client.id} className="text-slate-900">
                      {client.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-xs uppercase tracking-[0.14em] text-slate-400">
                Cão
                <select
                  value={selectedDog?.id ?? ""}
                  onChange={(event) => setSelectedDogId(event.target.value)}
                  disabled={!selectedClient?.dogs.length}
                  className="min-w-56 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white outline-none disabled:opacity-60"
                >
                  {!selectedClient?.dogs.length ? <option value="">Sem cães</option> : null}
                  {(selectedClient?.dogs ?? []).map((dog) => (
                    <option key={dog.id} value={dog.id} className="text-slate-900">
                      {dog.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="mt-5 rounded-3xl bg-white/7 p-5">
            {!selectedClient || !selectedDog ? (
              <p className="text-sm text-slate-300">Selecione um cliente e um cão para montar a entrega do portal.</p>
            ) : (
              <>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {selectedDog.photoUrl ? (
                <Image
                  src={selectedDog.photoUrl}
                  alt={`Foto de ${selectedDog.name}`}
                  width={96}
                  height={96}
                  unoptimized
                  className="h-24 w-24 rounded-[1.5rem] object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-[1.5rem] bg-white/20 text-4xl">🐾</div>
              )}
              <div>
                <p className="text-sm text-slate-300">{portalLink?.previewPath || "Sem link gerado ainda"}</p>
                <h2 className="mt-4 font-display text-3xl font-semibold">Portal do {selectedDog.name}</h2>
                <p className="mt-2 text-sm text-slate-300">Tutor: {selectedClient.name} • Plano: {selectedClient.plan || "Não informado"}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGeneratePortalLink}
                    disabled={!selectedClient || isGeneratingLink}
                    className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-60"
                  >
                    {isGeneratingLink ? "Gerando..." : portalLink ? "Renovar link" : "Gerar link do tutor"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyPortalLink}
                    className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white"
                  >
                    Copiar ultimo link gerado
                  </button>
                  <button
                    type="button"
                    onClick={handleRevokePortalLink}
                    disabled={!portalLink || portalLink.status === "Revogado" || isRevokingLink}
                    className="rounded-full border border-rose-300/40 bg-rose-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-rose-100 disabled:opacity-60"
                  >
                    {isRevokingLink ? "Revogando..." : "Revogar link"}
                  </button>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-300">
                  <span>Validade (dias):</span>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={expiresInDays}
                    onChange={(event) => setExpiresInDays(Number(event.target.value || 90))}
                    className="w-20 rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-white outline-none"
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[7, 30, 90].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setExpiresInDays(preset)}
                      className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                        expiresInDays === preset
                          ? "border-emerald-200 bg-emerald-500/20 text-emerald-100"
                          : "border-white/20 bg-white/10 text-white"
                      }`}
                    >
                      {preset} dias
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-300">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={pinEnabled}
                      onChange={(event) => setPinEnabled(event.target.checked)}
                      className="h-4 w-4 rounded border-white/30 bg-white/10"
                    />
                    Proteger com PIN
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    pattern="[0-9]{4}"
                    value={pin}
                    onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
                    disabled={!pinEnabled}
                    placeholder="0000"
                    className="w-20 rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-white outline-none disabled:opacity-60"
                  />
                </div>
                <div className="mt-3 grid gap-1 text-xs text-slate-300">
                  <p>Status: {isLoadingLink ? "Carregando..." : portalLink?.status || "Nao gerado"}</p>
                  <p>Expira em: {formatDateTime(portalLink?.expiresAt)}</p>
                  <p>Ultimo acesso: {formatDateTime(portalLink?.lastAccessAt)}</p>
                  <p>PIN ativo: {portalLink?.hasPin ? "Sim" : "Nao"}</p>
                </div>
                {linkError ? <p className="mt-2 text-xs text-rose-300">{linkError}</p> : null}
                {copyStatus === "ok" ? <p className="mt-2 text-xs text-emerald-300">Link copiado com sucesso.</p> : null}
                {copyStatus === "error" ? <p className="mt-2 text-xs text-rose-300">Gere um novo link antes de copiar.</p> : null}
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/7 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Tarefas concluídas</p>
                <p className="mt-2 font-display text-4xl font-semibold">{completed}/{selectedTasks.length || 0}</p>
              </div>
              <div className="rounded-2xl bg-white/7 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Financeiro em aberto do caso</p>
                <p className="mt-2 font-display text-2xl font-semibold">
                  {pendingAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
              </div>
            </div>
            </>
            )}
          </div>
        </article>

        <div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Checklist do tutor
            </p>
            <h3 className="mt-2 font-display text-2xl font-semibold">Entregas para casa</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">Crie tarefas simples e objetivas para aumentar aderência entre sessões.</p>
            {selectedTasks.length === 0 ? (
              <p className="mt-4 text-sm text-[var(--muted)]">Nenhuma tarefa cadastrada. Adicione tarefas para o tutor acompanhar.</p>
            ) : null}
            <div className="mt-5 space-y-3">
              {selectedTasks.map((task, index) => (
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
                Pendentes: <span className="font-semibold text-[var(--foreground)]">{pendingTasks}</span>
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {[
                "Place 2x ao dia por 8 minutos",
                "Passeio com guia frouxa em 3 blocos",
                "Treino de foco antes das refeições",
              ].map((template) => (
                <button
                  key={template}
                  type="button"
                  onClick={() => handleTemplateTask(template)}
                  disabled={isAddingTask}
                  className="rounded-full border border-[var(--border)] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)] disabled:opacity-50"
                >
                  + {template}
                </button>
              ))}
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
                disabled={isAddingTask}
                className="pc-primary-action rounded-full px-5 py-3 text-sm font-semibold whitespace-nowrap disabled:opacity-60"
              >
                {isAddingTask ? "Adicionando..." : "Adicionar tarefa"}
              </button>
            </form>
        </article>

        <article className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Visão do caso</p>
          <h3 className="mt-2 font-display text-2xl font-semibold">Contexto para orientar o tutor</h3>

          {!selectedClient || !selectedDog ? (
            <p className="mt-4 text-sm text-[var(--muted)]">Selecione um caso para visualizar dados de atendimento.</p>
          ) : (
            <>
              <div className="mt-4 rounded-2xl border border-[var(--border)] bg-white p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Ambiente do tutor</p>
                <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{selectedClient.environment || "Sem observações registradas."}</p>
              </div>

              <div className="mt-3 rounded-2xl border border-[var(--border)] bg-white p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Focos atuais</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(selectedDog.trainingTypes ?? []).length === 0 ? (
                    <span className="text-sm text-[var(--muted)]">Nenhum foco cadastrado.</span>
                  ) : (
                    selectedDog.trainingTypes.map((type) => (
                      <span
                        key={type}
                        className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-sky-800"
                      >
                        {type}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-3 rounded-2xl border border-[var(--border)] bg-white p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Próximos atendimentos</p>
                <div className="mt-3 space-y-2">
                  {selectedEvents.slice(0, 3).map((event) => (
                    <div key={event.id} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-3">
                      <p className="text-sm font-semibold">{event.day} • {event.time}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">Sessão {event.sessionNumber} • {event.status}</p>
                    </div>
                  ))}
                  {selectedEvents.length === 0 ? <p className="text-sm text-[var(--muted)]">Sem atendimentos agendados para este caso.</p> : null}
                </div>
              </div>

              <div className="mt-3 rounded-2xl border border-[var(--border)] bg-white p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Últimas notas técnicas</p>
                <div className="mt-3 space-y-2">
                  {selectedSessions.slice(0, 2).map((session) => (
                    <div key={session.id} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-3">
                      <p className="text-sm font-semibold">{session.date} • {session.title}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">{session.notes[0]?.comment || "Sem comentários no registro."}</p>
                    </div>
                  ))}
                  {selectedSessions.length === 0 ? <p className="text-sm text-[var(--muted)]">Sem sessões registradas para este caso.</p> : null}
                </div>
              </div>

              <div className="mt-3 rounded-2xl border border-[var(--border)] bg-white p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Feedback recentes do tutor</p>
                  <span className="rounded-full bg-sky-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-800">
                    {selectedFeedbacks.length}
                  </span>
                </div>
                <div className="mt-2 space-y-2">
                      {selectedFeedbacks.slice(0, 2).map((feedback) => (
                    <div key={feedback.id} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">{feedback.author} • {feedback.createdAt}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">{feedback.message}</p>
                    </div>
                  ))}
                      {selectedFeedbacks.length === 0 ? <p className="text-sm text-[var(--muted)]">Sem feedback enviado pelo tutor ainda.</p> : null}
                </div>
              </div>
            </>
          )}
        </article>
        </div>
      </section>

    </PageShell>
  );
}