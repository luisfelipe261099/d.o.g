"use client";

import { useMemo, useState } from "react";

import { PageShell } from "@/components/page-shell";
import { useAppStore } from "@/lib/app-store";

type Goal = "guia" | "reatividade" | "obediencia" | "filhotes";
type Environment = "rua" | "condominio" | "casa" | "parque";

const goalLabels: Record<Goal, string> = {
  guia: "Guia sem puxar",
  reatividade: "Reduzir reatividade",
  obediencia: "Obediencia funcional",
  filhotes: "Base para filhotes",
};

const environmentLabels: Record<Environment, string> = {
  rua: "Rua movimentada",
  condominio: "Condominio/elevador",
  casa: "Ambiente interno",
  parque: "Parque/area aberta",
};

function buildProtocol(goal: Goal, environment: Environment, hasHistory: boolean, breed: string) {
  const intro = `Protocolo sugerido para ${goalLabels[goal].toLowerCase()} em ${environmentLabels[environment].toLowerCase()} (${breed}).`;

  const baseSteps: Record<Goal, string[]> = {
    guia: [
      "Aquecimento de 5 minutos com contato visual e mudancas de direcao curtas.",
      "Ciclos de 90 segundos de guia frouxa + 30 segundos de reset em local neutro.",
      "Registrar em nota qual lado da guia gerou melhor estabilidade.",
    ],
    reatividade: [
      "Iniciar com distancia segura do estimulo e criterio de sucesso sem latido.",
      "Aplicar 4 blocos curtos de exposicao com pausa ativa entre blocos.",
      "Encerrar com exercicio de permanencia para baixar ativacao residual.",
    ],
    obediencia: [
      "Abrir com comandos de alta taxa de acerto para criar ritmo.",
      "Alternar comandos de permanencia e deslocamento em ambiente real.",
      "Finalizar com generalizacao em 2 contextos diferentes no mesmo encontro.",
    ],
    filhotes: [
      "Blocos curtos de 2 a 4 minutos com reforco de alto valor.",
      "Priorizar rotina de nome, foco e manejo basico antes de comandos complexos.",
      "Concluir com orientacao clara ao tutor para pratica diaria de baixa friccao.",
    ],
  };

  const guardrails = hasHistory
    ? "Usar historico anterior para manter o que funcionou e evitar trocar metodo sem necessidade."
    : "Como e um caso sem historico, validar linha de base antes de aumentar dificuldade.";

  const risk =
    environment === "condominio"
      ? "Atencao para estimulos repentinos de elevador/portaria e espacos curtos."
      : environment === "parque"
        ? "Controlar excesso de estimulos e manter janelas curtas de foco."
        : "Monitorar variaveis do ambiente e registrar gatilhos observados.";

  return {
    intro,
    steps: baseSteps[goal],
    guardrails,
    risk,
    tutorMessage:
      "Tarefa do tutor: praticar 8 a 12 minutos diarios com criterio simples de sucesso e registrar 1 video curto.",
  };
}

export default function IaPage() {
  const clients = useAppStore((state) => state.clients);
  const sessions = useAppStore((state) => state.trainingSessions);

  const [breed, setBreed] = useState("Pastor Alemao");
  const [goal, setGoal] = useState<Goal>("guia");
  const [environment, setEnvironment] = useState<Environment>("rua");
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id ?? "");
  const [generated, setGenerated] = useState(false);

  function handleGenerate() {
    setGenerated(false);
    requestAnimationFrame(() => setGenerated(true));
  }

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === selectedClientId) ?? clients[0],
    [clients, selectedClientId],
  );

  const hasHistory = useMemo(() => {
    if (!selectedClient) return false;
    return sessions.some((session) => session.clientId === selectedClient.id);
  }, [selectedClient, sessions]);

  const protocol = useMemo(
    () => buildProtocol(goal, environment, hasHistory, breed.trim() || "cao"),
    [goal, environment, hasHistory, breed],
  );

  return (
    <PageShell
      kicker="IA"
      title="Assistente de protocolos"
      description="Monte o contexto do caso e gere um protocolo objetivo para usar na próxima sessão."
      requireAuth="trainer"
    >
      <section className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
        <article className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Entrada do caso</p>
          <h2 className="mt-2 font-display text-2xl font-semibold">Monte o contexto para a IA sugerir protocolo</h2>

          <div className="mt-5 grid gap-4">
            <label className="block">
              <span className="text-sm font-medium text-[var(--muted)]">Tutor/cliente</span>
              <select
                value={selectedClientId}
                onChange={(event) => setSelectedClientId(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-sky-400"
              >
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-[var(--muted)]">Raca do animal</span>
              <input
                value={breed}
                onChange={(event) => setBreed(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-sky-400"
                placeholder="Ex: Pastor Alemao"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-[var(--muted)]">Objetivo principal</span>
                <select
                  value={goal}
                  onChange={(event) => setGoal(event.target.value as Goal)}
                  className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-sky-400"
                >
                  {Object.entries(goalLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-[var(--muted)]">Contexto de treino</span>
                <select
                  value={environment}
                  onChange={(event) => setEnvironment(event.target.value as Environment)}
                  className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-sky-400"
                >
                  {Object.entries(environmentLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              className="pc-primary-action rounded-full px-5 py-3 text-sm font-semibold"
            >
              {generated ? "✓ Protocolo atualizado" : "Gerar protocolo com IA"}
            </button>
          </div>
        </article>

        <article className="rounded-[1.75rem] border border-[var(--border)] bg-slate-950 p-6 text-white shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Saida sugerida</p>
          <h2 className="mt-2 font-display text-2xl font-semibold">Plano de sessao sugerido</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">{protocol.intro}</p>

          <div className="mt-5 rounded-3xl bg-white/8 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">Passos recomendados</p>
            <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-200">
              {protocol.steps.map((step, index) => (
                <li key={step} className={index > 1 ? "hidden md:list-item" : "list-item"}>• {step}</li>
              ))}
            </ul>
          </div>

          <div className="mt-4 rounded-3xl bg-white/8 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">Guardrails</p>
            <p className="mt-2 text-sm leading-7 text-slate-200">{protocol.guardrails}</p>
          </div>

          <div className="mt-4 rounded-3xl bg-white/8 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">Resumo de risco</p>
            <p className="mt-2 text-sm leading-7 text-slate-200">{protocol.risk}</p>
          </div>

          <div className="mt-4 rounded-3xl border border-white/15 bg-[rgba(36,140,196,0.18)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#c8ecff]">Mensagem para tutor</p>
            <p className="mt-2 text-sm leading-7 text-white">{protocol.tutorMessage}</p>
          </div>
        </article>
      </section>
    </PageShell>
  );
}