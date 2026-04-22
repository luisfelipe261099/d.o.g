"use client";

import { useMemo } from "react";
import { useAppStore } from "@/lib/app-store";

const mockTrainers = [
  { id: "t-01", name: "Marina Costa",       email: "marina@adestramento.com.br",   joinedAt: "03/01/2026", status: "Ativo",  planType: "Pro",      monthlyValue: "R$ 690" },
  { id: "t-02", name: "Carla Nunes",        email: "carla@k9pro.com.br",           joinedAt: "07/01/2026", status: "Ativo",  planType: "Essencial",monthlyValue: "R$ 420" },
  { id: "t-03", name: "Rafael Prado",       email: "rafael@treinacan.com.br",      joinedAt: "10/01/2026", status: "Ativo",  planType: "Premium",  monthlyValue: "R$ 990" },
  { id: "t-04", name: "Juliana Mendes",     email: "ju@pettraining.com.br",        joinedAt: "12/01/2026", status: "Ativo",  planType: "Pro",      monthlyValue: "R$ 690" },
  { id: "t-05", name: "André Lima",         email: "andre@dogcare.com.br",         joinedAt: "14/01/2026", status: "Ativo",  planType: "Pro",      monthlyValue: "R$ 690" },
  { id: "t-06", name: "Patrícia Silveira",  email: "patricia@treinarcerto.com.br", joinedAt: "18/01/2026", status: "Ativo",  planType: "Essencial",monthlyValue: "R$ 420" },
  { id: "t-07", name: "Eduardo Rocha",      email: "edu@anicanis.com.br",          joinedAt: "21/01/2026", status: "Ativo",  planType: "Premium",  monthlyValue: "R$ 990" },
  { id: "t-08", name: "Fernanda Torres",    email: "fe@canislab.com.br",           joinedAt: "25/01/2026", status: "Ativo",  planType: "Pro",      monthlyValue: "R$ 690" },
  { id: "t-09", name: "Lucas Santana",      email: "lucas@treinodog.com.br",       joinedAt: "28/01/2026", status: "Ativo",  planType: "Pro",      monthlyValue: "R$ 690" },
  { id: "t-10", name: "Beatriz Cardoso",    email: "bea@escolacanina.com.br",      joinedAt: "01/02/2026", status: "Ativo",  planType: "Premium",  monthlyValue: "R$ 990" },
  { id: "t-11", name: "Roberto Alves",      email: "roberto@k9coach.com.br",       joinedAt: "05/02/2026", status: "Ativo",  planType: "Essencial",monthlyValue: "R$ 420" },
  { id: "t-12", name: "Camila Ferreira",    email: "camila@dogschool.com.br",      joinedAt: "08/02/2026", status: "Ativo",  planType: "Pro",      monthlyValue: "R$ 690" },
  { id: "t-13", name: "Diego Nascimento",   email: "diego@treinapet.com.br",       joinedAt: "10/02/2026", status: "Ativo",  planType: "Pro",      monthlyValue: "R$ 690" },
  { id: "t-14", name: "Aline Barbosa",      email: "aline@canismaster.com.br",     joinedAt: "14/02/2026", status: "Trial", planType: "Pro",      monthlyValue: "R$ 0" },
  { id: "t-15", name: "Thiago Oliveira",    email: "thiago@treinacerto.com.br",    joinedAt: "17/02/2026", status: "Trial", planType: "Essencial",monthlyValue: "R$ 0" },
  { id: "t-16", name: "Sabrina Costa",      email: "sabrina@petcoach.com.br",      joinedAt: "20/02/2026", status: "Ativo",  planType: "Premium",  monthlyValue: "R$ 990" },
  { id: "t-17", name: "Felipe Moraes",      email: "felipe@dogteam.com.br",        joinedAt: "22/02/2026", status: "Ativo",  planType: "Essencial",monthlyValue: "R$ 420" },
  { id: "t-18", name: "Vanessa Ribeiro",    email: "vanessa@educacan.com.br",      joinedAt: "25/02/2026", status: "Ativo",  planType: "Pro",      monthlyValue: "R$ 690" },
  { id: "t-19", name: "Marcelo Souza",      email: "marcelo@dogtreina.com.br",     joinedAt: "01/03/2026", status: "Ativo",  planType: "Pro",      monthlyValue: "R$ 690" },
  { id: "t-20", name: "Priscila Lopes",     email: "pri@labcanis.com.br",          joinedAt: "04/03/2026", status: "Trial", planType: "Premium",  monthlyValue: "R$ 0" },
];

export function AdminDashboard() {
  const clients = useAppStore((state) => state.clients);
  const payments = useAppStore((state) => state.payments);
  const trialActive = useAppStore((state) => state.trialActive);
  const simulationDay = useAppStore((state) => state.simulationDay);
  const trialMaxDays = useAppStore((state) => state.trialMaxDays);
  const demoActivities = useAppStore((state) => state.demoActivities);

  const stats = useMemo(() => {
    const totalTrainers = mockTrainers.length;
    const activeTrainers = mockTrainers.filter((t) => t.status === "Ativo").length;
    const trialTrainers = mockTrainers.filter((t) => t.status === "Trial").length;
    const totalRevenue = mockTrainers.reduce(
      (sum, trainer) => sum + parseInt(trainer.monthlyValue.replace(/\D/g, "") || "0"),
      0
    );
    const totalDogs = clients.reduce((sum, client) => sum + client.dogs.length, 0);
    const pendingPayments = payments.filter((p) => p.status === "Pendente").length;

    return {
      totalTrainers,
      activeTrainers,
      trialTrainers,
      totalRevenue,
      totalDogs,
      pendingPayments,
    };
  }, [clients, payments]);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          {
            icon: "👥",
            label: "Adestradores Ativos",
            value: stats.activeTrainers.toString(),
            subtext: `+ ${stats.trialTrainers} em trial • ${stats.totalTrainers} contas criadas`,
          },
          {
            icon: "🐕",
            label: "Cães em Gestão",
            value: stats.totalDogs.toString(),
            subtext: "casos monitorados pela base ativa",
          },
          {
            icon: "💰",
            label: "MRR",
            value: `R$ ${stats.totalRevenue.toLocaleString("pt-BR")}`,
            subtext: "receita mensal recorrente consolidada",
          },
          {
            icon: "📈",
            label: "Crescimento",
            value: "+34%",
            subtext: "novos adestradores no último mês",
          },
          {
            icon: "🧪",
            label: "Trial Ativo",
            value: `Dia ${simulationDay}`,
            subtext: trialActive ? `de ${trialMaxDays} em andamento` : "ciclo concluido",
          },
        ].map((stat, index) => (
          <div
            key={stat.label}
            className={`rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] p-5 shadow-sm ${index > 2 ? "hidden sm:block" : ""}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-3xl font-semibold">{stat.value}</p>
                <p className="mt-1 text-sm font-medium text-[var(--muted)]">{stat.label}</p>
                <p className="mt-1 text-xs text-slate-500">{stat.subtext}</p>
              </div>
              <span className="text-2xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Grid de conteúdo principal */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Coluna esquerda - Adestradores */}
        <div className="space-y-5 lg:col-span-2">
          {/* Adestradores Ativos */}
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-display text-xl font-semibold">Adestradores Ativos</h3>
              <span className="hidden text-sm font-medium text-slate-600 sm:block">
                {stats.activeTrainers} ativos • {stats.trialTrainers} em trial
              </span>
            </div>

            <div className="space-y-3">
              {mockTrainers.slice(0, 4).map((trainer) => (
                <div
                  key={trainer.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{trainer.name}</p>
                    <p className="text-sm text-slate-600">{trainer.email}</p>
                    <p className="mt-1 text-xs text-slate-500">Entrou em {trainer.joinedAt}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{trainer.monthlyValue}</p>
                    <p className="text-sm text-slate-600">{trainer.planType}</p>
                    <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                      {trainer.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Relatório de Crescimento */}
          <section className="hidden rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] p-6 shadow-sm lg:block">
            <h3 className="mb-5 font-display text-xl font-semibold">Métricas de Plataforma</h3>

            <div className="space-y-4">
              {[
                { label: "Penetração de planos", current: 75, total: 100 },
                { label: "Renovação de assinaturas", current: 88, total: 100 },
                { label: "Satisfação percebida pelos tutores", current: 92, total: 100 },
                { label: "Retenção da base (90 dias)", current: 85, total: 100 },
              ].map((metric) => (
                <div key={metric.label}>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900">{metric.label}</p>
                    <p className="font-semibold text-slate-900">{metric.current}%</p>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-blue-600 transition-all"
                      style={{ width: `${metric.current}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Coluna direita - Info do administrador e ações */}
        <div className="space-y-5">
          {/* Info Admin */}
          <section className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Seu Acesso
            </p>
            <h3 className="mt-3 font-display text-2xl font-semibold">Administrador</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Visão completa da operação para gerir crescimento, receita recorrente e saúde da base de adestradores.
            </p>

            <div className="mt-4 space-y-2 border-t border-slate-700 pt-4">
              {[
                "✓ Criar/editar adestradores",
                "✓ Gerenciar planos e preços",
                "✓ Acompanhar receita e inadimplência",
                "✓ Auditar qualidade de uso",
              ].map((item) => (
                <p key={item} className="text-sm text-slate-300">
                  {item}
                </p>
              ))}
            </div>
          </section>

          {/* Atividades Recentes */}
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] p-5 shadow-sm">
            <h3 className="mb-4 font-display text-lg font-semibold">Atividades Recentes</h3>

            <div className="space-y-3">
              {demoActivities.slice(0, 3).map((activity) => (
                <div key={activity.id} className="flex gap-3 text-sm">
                  <span className="text-xl">{activity.kind === "finance" ? "💰" : activity.kind === "agenda" ? "📅" : activity.kind === "session" ? "📝" : "📣"}</span>
                  <div className="flex-1">
                    <p className="text-slate-900">{activity.title}</p>
                    <p className="text-xs text-slate-500">Dia {activity.day} • {activity.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Status do Sistema */}
          <section className="hidden rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] p-6 shadow-sm lg:block">
            <h3 className="mb-4 font-display text-lg font-semibold">Saúde do Sistema</h3>

            <div className="space-y-3">
              {[
                { name: "API", status: "Operacional", color: "emerald" },
                { name: "Database", status: "Operacional", color: "emerald" },
                { name: "Armazenamento", status: "Operacional", color: "emerald" },
              ].map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-900">{item.name}</p>
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full bg-${item.color}-500`}
                      style={{ backgroundColor: item.color === "emerald" ? "#10b981" : "#ef4444" }}
                    />
                    <p className="text-xs font-medium text-slate-600">{item.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
