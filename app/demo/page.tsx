"use client";

import Link from "next/link";

import { PageShell } from "@/components/page-shell";
import { useAppStore } from "@/lib/app-store";
import type { UserRole } from "@/lib/app-store";

type DemoStep = {
  title: string;
  description: string;
  href: string;
  roles: UserRole[];
};

type QaScenario = {
  id: number;
  title: string;
  href: string;
  roles: UserRole[];
};

const demoSteps: DemoStep[] = [
  {
    title: "Visao operacional",
    description: "Abrir painel com agenda do dia, alertas e receita pendente.",
    href: "/dashboard",
    roles: ["trainer"],
  },
  {
    title: "Treinos com memoria tecnica",
    description: "Registrar blocos da sessao e comparar evolucao historica por caso.",
    href: "/treinos",
    roles: ["trainer"],
  },
  {
    title: "Assistente IA",
    description: "Gerar protocolo por raca, objetivo e contexto em segundos.",
    href: "/ia",
    roles: ["trainer"],
  },
  {
    title: "Portal do tutor",
    description: "Mostrar como o tutor acompanha tarefas, agenda e relatorios.",
    href: "/portal",
    roles: ["trainer"],
  },
  {
    title: "Experiencia do tutor",
    description: "Testar login de cliente e validar acesso exclusivo ao proprio portal.",
    href: "/portal/cliente",
    roles: ["client"],
  },
  {
    title: "Backoffice admin",
    description: "Demonstrar crescimento de assinaturas e indicadores de retencao.",
    href: "/admin",
    roles: ["admin"],
  },
];

const qaScenarios: QaScenario[] = [
  { id: 1, title: "Login de adestrador", href: "/login", roles: ["trainer"] },
  { id: 2, title: "Dashboard exibe agenda e metricas", href: "/dashboard", roles: ["trainer"] },
  { id: 3, title: "Cadastro de novo cliente e cao", href: "/clientes", roles: ["trainer"] },
  { id: 4, title: "Treino com multiplos blocos", href: "/treinos", roles: ["trainer"] },
  { id: 5, title: "Assistente IA gera protocolo", href: "/ia", roles: ["trainer"] },
  { id: 6, title: "Agenda cria novo atendimento", href: "/agenda", roles: ["trainer"] },
  { id: 7, title: "Portal do tutor reflete tarefas", href: "/portal", roles: ["trainer"] },
  { id: 8, title: "Financeiro marca pagamento", href: "/financeiro", roles: ["trainer"] },
  { id: 9, title: "Troca para perfil de tutor", href: "/login", roles: ["client"] },
  { id: 10, title: "Tutor visualiza agenda semanal", href: "/portal/cliente", roles: ["client"] },
  { id: 11, title: "Tutor marca tarefa como concluida", href: "/portal/cliente", roles: ["client"] },
  { id: 12, title: "Troca para perfil de admin", href: "/login", roles: ["admin"] },
  { id: 13, title: "Admin visualiza progresso do trial", href: "/admin", roles: ["admin"] },
  { id: 14, title: "Admin edita dados de adestrador", href: "/admin/adestradores", roles: ["admin"] },
  { id: 15, title: "Conferir consistência com refresh", href: "/demo", roles: ["trainer", "admin", "client"] },
];

export default function DemoPage() {
  const userRole = useAppStore((state) => state.userRole);

  const visibleSteps = demoSteps.filter((step) => step.roles.includes(userRole));
  const visibleScenarios = qaScenarios.filter((scenario) => scenario.roles.includes(userRole));

  return (
    <PageShell
      kicker="Pitch"
      title="Roteiro operacional"
      description="Checklist de validação com dados reais em todas as rotas principais."
      requireAuth
    >
      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Passo a passo</p>
          <h2 className="mt-2 font-display text-2xl font-semibold">Mostre valor em menos de 7 minutos</h2>

          <div className="mt-5 space-y-3">
            {visibleSteps.map((step, index) => (
              <article key={step.title} className="rounded-3xl border border-[var(--border)] bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Passo {index + 1}</p>
                <h3 className="mt-2 font-display text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{step.description}</p>
                <Link
                  href={step.href}
                  className="pc-primary-action mt-3 inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em]"
                >
                  Abrir modulo
                </Link>
              </article>
            ))}
          </div>
        </article>

        <div className="grid gap-4">
          <article className="rounded-[1.75rem] border border-[var(--border)] bg-slate-950 p-6 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Conta atual</p>
            <h2 className="mt-2 font-display text-2xl font-semibold">
              Perfil ativo: {userRole === "admin" ? "Administrador" : userRole === "client" ? "Tutor" : "Adestrador"}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Use o login com perfis reais para alternar rapidamente entre visões do produto.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-flex rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white"
            >
              Trocar perfil
            </Link>
          </article>

          <article className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel-strong)] p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Ambiente real</p>
            <h2 className="mt-2 font-display text-2xl font-semibold">Sem dados mockados</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              Todas as rotas operam com dados persistidos no banco. Cadastros, agenda, treinos e financeiro são recarregados do backend.
            </p>
          </article>

          <article className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Validação de consistência</p>
            <h2 className="mt-2 font-display text-2xl font-semibold">Checklist recomendado</h2>
            <div className="mt-4 space-y-2 text-sm text-[var(--muted)]">
              <p>1. Criar cliente e confirmar entrada no financeiro.</p>
              <p>2. Registrar sessão em treinos e conferir histórico após refresh.</p>
              <p>3. Criar evento na agenda e alternar status.</p>
              <p>4. Marcar cobrança como paga e reabrir pendência.</p>
              <p>5. Trocar plano e validar persistência na recarga da página.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel-strong)] p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">QA de pitch</p>
            <h2 className="mt-2 font-display text-2xl font-semibold">Checklist de validacao do fluxo</h2>
          </div>
          <span className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            {visibleScenarios.length} cenarios para este perfil
          </span>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          {visibleScenarios.map((scenario) => (
            <article key={scenario.id} className="rounded-3xl border border-[var(--border)] bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Cenario {scenario.id}</p>
              <h3 className="mt-2 text-sm font-semibold text-[var(--foreground)]">{scenario.title}</h3>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-800">
                  pronto para teste
                </span>
                <Link
                  href={scenario.href}
                  className="rounded-full border border-[var(--border)] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground)]"
                >
                  abrir
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
