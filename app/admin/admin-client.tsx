"use client";

import { useMemo } from "react";
import { useAppStore } from "@/lib/app-store";

const mockTrainers = [
  {
    id: "trainer-1",
    name: "Marina Costa",
    email: "marina@email.com",
    joinedAt: "15/02/2024",
    status: "Ativo",
    planType: "Pro",
    monthlyValue: "R$ 690",
  },
  {
    id: "trainer-2",
    name: "Carla Nunes",
    email: "carla@email.com",
    joinedAt: "10/03/2024",
    status: "Ativo",
    planType: "Essencial",
    monthlyValue: "R$ 420",
  },
  {
    id: "trainer-3",
    name: "Rafael Prado",
    email: "rafael@email.com",
    joinedAt: "05/03/2024",
    status: "Ativo",
    planType: "Premium",
    monthlyValue: "R$ 990",
  },
];

export function AdminDashboard() {
  const clients = useAppStore((state) => state.clients);
  const payments = useAppStore((state) => state.payments);

  const stats = useMemo(() => {
    const totalTrainers = mockTrainers.length;
    const activeTrainers = mockTrainers.filter((t) => t.status === "Ativo").length;
    const totalRevenue = mockTrainers.reduce(
      (sum, trainer) => sum + parseInt(trainer.monthlyValue.replace(/\D/g, "")),
      0
    );
    const totalDogs = clients.reduce((sum, client) => sum + client.dogs.length, 0);
    const pendingPayments = payments.filter((p) => p.status === "Pendente").length;

    return {
      totalTrainers,
      activeTrainers,
      totalRevenue,
      totalDogs,
      pendingPayments,
    };
  }, [clients, payments]);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          {
            icon: "👥",
            label: "Adestradores Ativos",
            value: stats.activeTrainers.toString(),
            subtext: `de ${stats.totalTrainers} no total`,
          },
          {
            icon: "🐕",
            label: "Cães em Gestão",
            value: stats.totalDogs.toString(),
            subtext: "em todo o sistema",
          },
          {
            icon: "💰",
            label: "Receita Mensal",
            value: `R$ ${stats.totalRevenue.toLocaleString("pt-BR")}`,
            subtext: "MRR atual",
          },
          {
            icon: "⏳",
            label: "Pagamentos Pendentes",
            value: stats.pendingPayments.toString(),
            subtext: "aguardando confirmação",
          },
          {
            icon: "✅",
            label: "Taxa de Integridade",
            value: "98%",
            subtext: "dados completos",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] p-5 shadow-sm"
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
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Coluna esquerda - Adestradores */}
        <div className="lg:col-span-2 space-y-8">
          {/* Adestradores Ativos */}
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-display text-xl font-semibold">Adestradores Ativos</h3>
              <span className="text-sm font-medium text-slate-600">
                {stats.activeTrainers} de {stats.totalTrainers}
              </span>
            </div>

            <div className="space-y-3">
              {mockTrainers.map((trainer) => (
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
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] p-6 shadow-sm">
            <h3 className="mb-5 font-display text-xl font-semibold">Métricas de Plataforma</h3>

            <div className="space-y-4">
              {[
                { label: "Penetração (Planos ativos vs oferecidos)", current: 75, total: 100 },
                { label: "Renovação de Planos", current: 88, total: 100 },
                { label: "Satisfação (Clientes com 4+ sessões)", current: 92, total: 100 },
                { label: "Taxa de Retenção (Últimos 3 meses)", current: 85, total: 100 },
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
        <div className="space-y-6">
          {/* Info Admin */}
          <section className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Seu Acesso
            </p>
            <h3 className="mt-3 font-display text-2xl font-semibold">Administrador</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Você tem acesso total para gerenciar usuários, planos, relatórios e configurações da plataforma.
            </p>

            <div className="mt-5 space-y-2 border-t border-slate-700 pt-5">
              {[
                "✓ Criar/editar adestradores",
                "✓ Gerenciar planos e preços",
                "✓ Visualizar relatórios",
                "✓ Configurar permissões",
              ].map((item) => (
                <p key={item} className="text-sm text-slate-300">
                  {item}
                </p>
              ))}
            </div>
          </section>

          {/* Atividades Recentes */}
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] p-6 shadow-sm">
            <h3 className="mb-4 font-display text-lg font-semibold">Atividades Recentes</h3>

            <div className="space-y-3">
              {[
                { icon: "📝", text: "Novo adestrador registrado", time: "há 2 horas" },
                { icon: "💰", text: "Pagamento confirmado", time: "há 5 horas" },
                { icon: "📊", text: "Relatório gerado", time: "há 1 dia" },
                { icon: "🔄", text: "Plano atualizado", time: "há 2 dias" },
              ].map((activity, idx) => (
                <div key={idx} className="flex gap-3 text-sm">
                  <span className="text-xl">{activity.icon}</span>
                  <div className="flex-1">
                    <p className="text-slate-900">{activity.text}</p>
                    <p className="text-xs text-slate-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Status do Sistema */}
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] p-6 shadow-sm">
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
