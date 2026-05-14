"use client";

import { PageShell } from "@/components/page-shell";
import { useAppStore } from "@/lib/app-store";

const trainerFlow = [
  {
    title: "Cadastrar tutor e cão",
    why: "Essa é a base de todo o acompanhamento.",
    how: [
      "Registre nome do tutor, contato, ambiente onde o cão vive e plano combinado.",
      "No cadastro do cão, inclua raça, idade, peso e principais objetivos de treino.",
      "Use os focos de treino para deixar claro se o caso é guia, ansiedade, socialização, obediência ou outro tema.",
    ],
  },
  {
    title: "Organizar a agenda",
    why: "A agenda mostra quando o atendimento acontece e evita perda de histórico.",
    how: [
      "Associe cada aula ao tutor e ao cão corretos.",
      "Defina horário, número da sessão e status do atendimento.",
      "Use a agenda como referência para saber qual cão será atendido e em que etapa do plano ele está.",
    ],
  },
  {
    title: "Registrar a sessão de treino",
    why: "O registro transforma a aula em histórico técnico.",
    how: [
      "Anote o que foi treinado, como o cão respondeu e quais dificuldades apareceram.",
      "Use notas por bloco, como guia, foco, permanência, socialização ou manejo em casa.",
      "Inclua evidências quando fizer sentido, como foto da postura, ambiente ou exercício concluído.",
    ],
  },
  {
    title: "Definir tarefa para casa",
    why: "O tutor precisa saber exatamente o que repetir fora da aula.",
    how: [
      "Escreva uma orientação curta, prática e possível de executar na rotina do tutor.",
      "Explique frequência, duração e cuidado principal do exercício.",
      "Evite passar muitas tarefas ao mesmo tempo; uma tarefa bem feita vale mais que várias confusas.",
    ],
  },
  {
    title: "Usar a IA como apoio técnico",
    why: "A IA ajuda quando o adestrador precisa de ideia, estrutura ou próximo passo.",
    how: [
      "Informe o cão, raça, objetivo e dificuldade atual.",
      "Descreva o problema como você falaria para outro profissional: exemplo, treinamento de guia para Pastor Alemão que puxa na rua.",
      "Use a sugestão como roteiro inicial e ajuste conforme temperamento, ambiente e resposta do cão.",
    ],
  },
];

const assistantExamples = [
  {
    case: "Pastor Alemão puxando na guia",
    suggestion: "A IA deve sugerir aquecimento de foco, reforço por andar ao lado, mudanças de direção, pausas de contato visual e aumento gradual de distrações.",
  },
  {
    case: "Filhote pulando nas visitas",
    suggestion: "A IA deve propor manejo do ambiente, treino de senta para cumprimentar, recompensa por quatro patas no chão e prática com visitas controladas.",
  },
  {
    case: "Cão ansioso ao ficar sozinho",
    suggestion: "A IA deve montar passos curtos de dessensibilização, enriquecimento ambiental e registro de evolução sem forçar tempo excessivo.",
  },
];

const tutorGuidance = [
  "O tutor recebe um portal simples para ver tarefas, evolução e orientações.",
  "A linguagem das tarefas deve ser clara, sem termos técnicos demais.",
  "O objetivo é fazer o tutor praticar corretamente em casa, não apenas visualizar informações.",
  "Feedbacks do tutor ajudam a ajustar a próxima sessão.",
];

const statusLabels = [
  {
    label: "Tutores cadastrados",
    getValue: (clients: number, dogs: number) => `${clients} tutor(es), ${dogs} cão(es)`,
  },
  {
    label: "Sessões registradas",
    getValue: (_clients: number, _dogs: number, sessions: number) => `${sessions} sessão(ões)`,
  },
  {
    label: "Agendamentos ativos",
    getValue: (_clients: number, _dogs: number, _sessions: number, events: number) => `${events} agendamento(s)`,
  },
  {
    label: "Tarefas para tutores",
    getValue: (_clients: number, _dogs: number, _sessions: number, _events: number, tasks: number) => `${tasks} tarefa(s)`,
  },
];

export default function TutorialPage() {
  const clients = useAppStore((state) => state.clients);
  const sessions = useAppStore((state) => state.trainingSessions);
  const events = useAppStore((state) => state.calendarEvents);
  const portalTasks = useAppStore((state) => state.portalTasks);

  const totalDogs = clients.reduce((total, client) => total + client.dogs.length, 0);

  return (
    <PageShell
      kicker="Tutorial do adestrador"
      title="Como o Adestro organiza sua rotina"
      description="Um guia explicativo para entender o fluxo de atendimento, o portal do tutor e o papel correto do Assistente de IA."
      requireAuth="trainer"
    >
      <section className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2d6f99]">Ideia principal</p>
        <div className="mt-2 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="font-display text-2xl font-semibold text-[var(--foreground)]">O sistema acompanha o atendimento do começo ao pós-aula</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              O Adestro não é só uma lista de páginas. Ele funciona como uma rotina: primeiro você cadastra tutor e cão, depois agenda, registra o treino, orienta o tutor e usa a IA para preparar o próximo passo quando precisar de apoio técnico.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {statusLabels.map((item) => (
              <div key={item.label} className="rounded-2xl border border-[var(--border)] bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2d6f99]">{item.label}</p>
                <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">
                  {item.getValue(clients.length, totalDogs, sessions.length, events.length, portalTasks.length)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[1.5rem] border border-[var(--border)] bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2d6f99]">Fluxo de atendimento</p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-[var(--foreground)]">Como deve ser feito</h2>

          <ol className="mt-5 grid gap-3">
            {trainerFlow.map((step, index) => (
              <li key={step.title} className="rounded-2xl border border-[var(--border)] bg-[#f7fbff] p-4">
                <div className="flex gap-3">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#145a82] text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-[var(--foreground)]">{step.title}</h3>
                    <p className="mt-1 text-sm font-medium text-[#2d6f99]">{step.why}</p>
                    <ul className="mt-3 grid gap-2">
                      {step.how.map((item) => (
                        <li key={item} className="flex gap-2 text-sm leading-6 text-[var(--muted)]">
                          <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#1f8e80]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="grid gap-4">
          <section className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2d6f99]">Assistente de IA</p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-[var(--foreground)]">A IA sugere treino, não substitui o adestrador</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              A ideia correta é usar a IA quando você não lembra como estruturar um exercício, quer variar uma progressão ou precisa preparar uma próxima aula com base no caso do cão.
            </p>
            <div className="mt-4 grid gap-3">
              {assistantExamples.map((example) => (
                <article key={example.case} className="rounded-2xl border border-[var(--border)] bg-white p-4">
                  <p className="text-sm font-semibold text-[var(--foreground)]">{example.case}</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{example.suggestion}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-[var(--border)] bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2d6f99]">Portal do tutor</p>
            <h2 className="mt-1 font-display text-xl font-semibold text-[var(--foreground)]">Como orientar o cliente</h2>
            <div className="mt-4 grid gap-2">
              {tutorGuidance.map((item) => (
                <div key={item} className="rounded-2xl border border-[var(--border)] bg-[#f7fbff] p-3 text-sm leading-6 text-[var(--muted)]">
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-[var(--border)] bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2d6f99]">Regra prática</p>
            <h2 className="mt-1 font-display text-xl font-semibold text-[var(--foreground)]">Cada aula deve terminar com clareza</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Ao final da sessão, o adestrador precisa saber o que foi treinado, o tutor precisa saber o que praticar e o sistema precisa guardar histórico suficiente para apoiar a próxima decisão.
            </p>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
