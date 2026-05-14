"use client";

import Link from "next/link";

import { PageShell } from "@/components/page-shell";
import { useAppStore } from "@/lib/app-store";

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
  { label: "Dashboard com próximo atendimento e resumo da ultima aula", status: "Ajustado" },
  { label: "Tutores e caes separados, com busca", status: "Ajustado" },
  { label: "Agenda com novo tutor/cao no fluxo de agendamento", status: "Ajustado" },
  { label: "Assistente IA com resumo, lembrete e sugestao por historico", status: "Ajustado" },
  { label: "Portal do tutor com galeria, tarefas, avaliacoes e gamificacao", status: "Ajustado" },
  { label: "Configuracoes da conta", status: "Ajustado" },
  { label: "Cadastro explicando melhor plano, pacote e valor por aulas", status: "Ajustado" },
];

export default function TutorialPage() {
  const clients = useAppStore((state) => state.clients);
  const sessions = useAppStore((state) => state.trainingSessions);
  const events = useAppStore((state) => state.calendarEvents);
  const portalTasks = useAppStore((state) => state.portalTasks);

  const totalDogs = clients.reduce((total, client) => total + client.dogs.length, 0);
  const hasClients = clients.length > 0;
  const hasEvents = events.length > 0;
  const hasSessions = sessions.length > 0;
  const hasPortalTasks = portalTasks.length > 0;

  const operationalChecklist = [
    {
      label: "Cadastro inicial (tutor e cao)",
      done: hasClients && totalDogs > 0,
      detail: `${clients.length} tutor(es) e ${totalDogs} cao(es) cadastrados`,
      href: "/clientes",
      action: "Abrir tutores",
    },
    {
      label: "Primeira agenda criada",
      done: hasEvents,
      detail: `${events.length} agendamento(s) ativo(s)`,
      href: "/agenda",
      action: "Abrir agenda",
    },
    {
      label: "Treino registrado",
      done: hasSessions,
      detail: `${sessions.length} sessao(oes) registrada(s)`,
      href: "/treinos/registro",
      action: "Registrar treino",
    },
    {
      label: "Portal com tarefa para tutor",
      done: hasPortalTasks,
      detail: `${portalTasks.length} tarefa(s) criada(s)`,
      href: "/portal",
      action: "Abrir portal",
    },
  ];

  const completedSteps = operationalChecklist.filter((item) => item.done).length;
  const completionPercent = Math.round((completedSteps / operationalChecklist.length) * 100);

  const priorities = (() => {
    if (!hasClients || totalDogs === 0) {
      return [
        {
          title: "Base inicial nao criada",
          detail: "Cadastre tutor e cao para liberar agenda, treinos e portal.",
          level: "alta" as const,
          href: "/clientes",
          action: "Cadastrar base",
        },
      ];
    }

    const nextPriorities: Array<{
      title: string;
      detail: string;
      level: "alta" | "media";
      href: string;
      action: string;
    }> = [];

    if (hasClients && !hasEvents) {
      nextPriorities.push({
        title: "Carteira sem agenda",
        detail: "Ja existe cadastro, mas sem agendamento ativo para atendimento.",
        level: "alta",
        href: "/agenda",
        action: "Agendar aula",
      });
    }

    if (hasEvents && !hasSessions) {
      nextPriorities.push({
        title: "Aulas sem registro tecnico",
        detail: "Existem agendamentos, mas nenhum treino foi registrado no historico.",
        level: "alta",
        href: "/treinos/registro",
        action: "Registrar treino",
      });
    }

    if (hasSessions && !hasPortalTasks) {
      nextPriorities.push({
        title: "Tutor sem acompanhamento no portal",
        detail: "Ja ha sessoes registradas, mas sem tarefa para pratica em casa.",
        level: "media",
        href: "/portal",
        action: "Criar tarefa",
      });
    }

    if (!nextPriorities.length) {
      nextPriorities.push({
        title: "Operacao em dia",
        detail: "Fluxo principal completo. Use IA para acelerar preparacao da proxima aula.",
        level: "media",
        href: "/ia",
        action: "Revisar com IA",
      });
    }

    return nextPriorities;
  })();

  function getChecklistState(item: { label: string; done: boolean }): {
    text: string;
    className: string;
  } {
    if (item.done) {
      return {
        text: "Concluido",
        className: "bg-emerald-100 text-emerald-800",
      };
    }

    if (item.label === "Primeira agenda criada" && hasClients) {
      return {
        text: "Atencao",
        className: "bg-rose-100 text-rose-800",
      };
    }

    if (item.label === "Treino registrado" && hasEvents) {
      return {
        text: "Atencao",
        className: "bg-rose-100 text-rose-800",
      };
    }

    return {
      text: "Pendente",
      className: "bg-amber-100 text-amber-900",
    };
  }

  const nextStep = (() => {
    if (!hasClients || totalDogs === 0) {
      return {
        title: "Cadastre seu primeiro tutor e cao",
        detail: "Sem cadastro inicial, agenda e treinos ficam bloqueados no dia a dia.",
        href: "/clientes",
        action: "Cadastrar agora",
      };
    }

    if (!hasEvents) {
      return {
        title: "Crie o primeiro agendamento",
        detail: "A agenda organiza o atendimento e acelera o registro da aula.",
        href: "/agenda",
        action: "Agendar aula",
      };
    }

    if (!hasSessions) {
      return {
        title: "Registre a primeira sessao",
        detail: "Esse registro alimenta o historico, portal e sugestoes da IA.",
        href: "/treinos/registro",
        action: "Registrar sessao",
      };
    }

    if (!hasPortalTasks) {
      return {
        title: "Crie a primeira tarefa no portal",
        detail: "Assim o tutor acompanha a pratica em casa e gera engajamento.",
        href: "/portal",
        action: "Criar tarefa",
      };
    }

    return {
      title: "Fluxo principal concluido",
      detail: "Agora use a IA para preparar a proxima aula com base no historico.",
      href: "/ia",
      action: "Abrir IA",
    };
  })();

  const quickHelp = [
    {
      question: "Nao estou vendo o tutor na agenda",
      answer: "Confirme se o tutor e o cao foram cadastrados antes em Tutores e caes.",
      href: "/clientes",
      action: "Ver cadastros",
    },
    {
      question: "Nao consigo compartilhar o portal",
      answer: "Abra o Portal do Tutor, gere ou renove o link e copie novamente.",
      href: "/portal",
      action: "Abrir portal",
    },
    {
      question: "Quero registrar aula mais rapido",
      answer: "Use Treinos > Registro para preencher bloco tecnico, notas e evidencias.",
      href: "/treinos/registro",
      action: "Registrar aula",
    },
  ];

  return (
    <PageShell
      kicker="Tutorial"
      title="Como usar o Adestro na operação"
      description="Passo a passo para o adestrador conduzir o atendimento e para o tutor acompanhar o treino pelo portal."
      requireAuth="trainer"
    >
      <section className="mb-4 rounded-[1.5rem] border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2d6f99]">Comece por aqui</p>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-semibold text-[var(--foreground)]">{nextStep.title}</h2>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{nextStep.detail}</p>
          </div>
          <Link href={nextStep.href} className="rounded-full border border-[#145a82] bg-white px-4 py-2 text-xs font-semibold text-[#145a82]">
            {nextStep.action}
          </Link>
        </div>
      </section>

      <section className="mb-4 rounded-[1.5rem] border border-[var(--border)] bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2d6f99]">Prioridades de hoje</p>
        <div className="mt-3 space-y-2">
          {priorities.map((item) => (
            <div key={item.title} className="flex items-start justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[#f7fbff] p-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-[var(--foreground)]">{item.title}</p>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${item.level === "alta" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-900"}`}>
                    {item.level === "alta" ? "Alta" : "Media"}
                  </span>
                </div>
                <p className="text-xs text-[var(--muted)]">{item.detail}</p>
              </div>
              <Link href={item.href} className="rounded-full border border-[var(--border)] bg-white px-2.5 py-1 text-[10px] font-semibold text-[#145a82]">
                {item.action}
              </Link>
            </div>
          ))}
        </div>
      </section>

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
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2d6f99]">Progresso real</p>
                <h2 className="mt-1 font-display text-2xl font-semibold text-[var(--foreground)]">Checklist operacional</h2>
              </div>
              <span className="rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs font-semibold text-[#145a82]">
                {completionPercent}%
              </span>
            </div>

            <div className="mt-4 space-y-2">
              {operationalChecklist.map((item) => (
                (() => {
                  const state = getChecklistState(item);
                  return (
                    <div key={item.label} className="flex items-start justify-between gap-3 rounded-2xl border border-[var(--border)] bg-white p-3">
                      <div>
                        <p className="text-sm font-semibold text-[var(--foreground)]">{item.label}</p>
                        <p className="text-xs text-[var(--muted)]">{item.detail}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${state.className}`}>
                          {state.text}
                        </span>
                        <Link href={item.href} className="rounded-full border border-[var(--border)] bg-[#f7fbff] px-2.5 py-1 text-[10px] font-semibold text-[#145a82]">
                          {item.action}
                        </Link>
                      </div>
                    </div>
                  );
                })()
              ))}
            </div>
          </section>

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
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2d6f99]">Duvidas comuns</p>
            <h2 className="mt-1 font-display text-xl font-semibold text-[var(--foreground)]">Resolva rapido</h2>
            <div className="mt-4 space-y-2">
              {quickHelp.map((item) => (
                <div key={item.question} className="flex items-start justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[#f7fbff] px-3 py-2">
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">{item.question}</p>
                    <p className="text-xs text-[var(--muted)]">{item.answer}</p>
                  </div>
                  <Link href={item.href} className="rounded-full border border-[var(--border)] bg-white px-2.5 py-1 text-[10px] font-semibold text-[#145a82]">
                    {item.action}
                  </Link>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-[var(--border)] bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2d6f99]">Contexto do produto</p>
            <h2 className="mt-1 font-display text-xl font-semibold text-[var(--foreground)]">Ajustes implementados</h2>
            <div className="mt-4 space-y-2">
              {adjustmentStatus.map((item) => (
                <div key={item.label} className="flex items-start justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[#f7fbff] px-3 py-2">
                  <p className="text-sm text-[var(--muted)]">{item.label}</p>
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase text-emerald-800">
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
