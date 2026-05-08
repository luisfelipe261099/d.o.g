import Link from "next/link";

import { PageShell } from "@/components/page-shell";

const trainerSteps = [
  {
    title: "Cadastrar tutor e cão",
    text: "Abra Tutores e cães, use Novo tutor ou Cadastrar cão, preencha contato, foto, raça, focos do treino e plano combinado.",
    href: "/clientes",
    action: "Ir para tutores",
  },
  {
    title: "Agendar primeira aula",
    text: "Na Agenda, escolha o dia, selecione tutor e cão, defina horário e status inicial da aula.",
    href: "/agenda",
    action: "Abrir agenda",
  },
  {
    title: "Registrar o treino",
    text: "Em Treinos, salve o título da sessão, avaliação, observações e imagens para alimentar histórico, portal e IA.",
    href: "/treinos/registro",
    action: "Registrar treino",
  },
  {
    title: "Usar a IA antes da próxima aula",
    text: "No Assistente IA, gere resumo a partir da transcrição e peça sugestão de próximo treino com base nas últimas semanas.",
    href: "/ia",
    action: "Abrir IA",
  },
  {
    title: "Enviar o portal do tutor",
    text: "No Portal do Tutor, gere um link com validade e PIN opcional para o tutor acompanhar tarefas, fotos, agenda e evolução.",
    href: "/portal",
    action: "Gerar portal",
  },
];

const tutorSteps = [
  "Abrir o link enviado pelo adestrador e informar o PIN, quando houver.",
  "Conferir próximas aulas, tarefas de casa e últimas anotações do treino.",
  "Marcar tarefas concluídas depois da prática em casa.",
  "Ver fotos ou evidências anexadas nas sessões.",
  "Avaliar aulas, enviar comentário e acompanhar os pontos de engajamento.",
];

const adjustmentStatus = [
  { label: "Dashboard com próximo atendimento e resumo da última aula", status: "Ajustado" },
  { label: "Tutores e cães separados, com busca", status: "Ajustado" },
  { label: "Agenda com novo tutor/cão no fluxo de agendamento", status: "Ajustado" },
  { label: "Assistente IA com resumo, lembrete e sugestão por histórico", status: "Ajustado" },
  { label: "Portal do tutor com galeria, tarefas, avaliações e gamificação", status: "Ajustado" },
  { label: "Configurações da conta", status: "Ajustado" },
  { label: "Cadastro explicando melhor plano, pacote e valor por aulas", status: "Ajustado" },
];

export default function TutorialPage() {
  return (
    <PageShell
      kicker="Tutorial"
      title="Como usar o Adestro na operação"
      description="Passo a passo para o adestrador conduzir o atendimento e para o tutor acompanhar o treino pelo portal."
      requireAuth="trainer"
    >
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[1.5rem] border border-[var(--border)] bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2d6f99]">Adestrador</p>
              <h2 className="mt-1 font-display text-2xl font-semibold text-[var(--foreground)]">Fluxo de atendimento</h2>
            </div>
            <Link href="/dashboard" className="rounded-full border border-[var(--border)] bg-[#f7fbff] px-3 py-1.5 text-xs font-semibold text-[#145a82]">
              Voltar ao dashboard
            </Link>
          </div>

          <ol className="mt-5 grid gap-3">
            {trainerSteps.map((step, index) => (
              <li key={step.title} className="rounded-2xl border border-[var(--border)] bg-[#f7fbff] p-4">
                <div className="flex gap-3">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#145a82] text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-[var(--foreground)]">{step.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{step.text}</p>
                    <Link href={step.href} className="mt-3 inline-flex rounded-full border border-[#145a82] bg-white px-3 py-1.5 text-xs font-semibold text-[#145a82]">
                      {step.action}
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="grid gap-4">
          <section className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2d6f99]">Tutor</p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-[var(--foreground)]">Como acompanhar pelo portal</h2>
            <div className="mt-4 space-y-2">
              {tutorSteps.map((step, index) => (
                <div key={step} className="flex gap-3 rounded-2xl border border-[var(--border)] bg-white p-3">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-sky-50 text-xs font-semibold text-[#145a82]">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-6 text-[var(--muted)]">{step}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-[var(--border)] bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2d6f99]">Checklist dos ajustes</p>
            <h2 className="mt-1 font-display text-xl font-semibold text-[var(--foreground)]">Status da validação</h2>
            <div className="mt-4 space-y-2">
              {adjustmentStatus.map((item) => (
                <div key={item.label} className="flex items-start justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[#f7fbff] px-3 py-2">
                  <p className="text-sm text-[var(--muted)]">{item.label}</p>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${item.status === "Ajustado" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
