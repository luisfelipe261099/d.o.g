"use client";

import { PageShell } from "@/components/page-shell";
import { useAppStore } from "@/lib/app-store";
import { trainerAlerts } from "@/lib/mock-data";

export default function DashboardPage() {
  const clients = useAppStore((state) => state.clients);
  const events = useAppStore((state) => state.calendarEvents);
  const sessions = useAppStore((state) => state.trainingSessions);
  const payments = useAppStore((state) => state.payments);
  const trainerName = useAppStore((state) => state.trainerName);

  const confirmedEvents = events.filter((event) => event.status === "Confirmado").length;
  const pendingPayments = payments
    .filter((payment) => payment.status === "Pendente")
    .reduce((total, payment) => total + payment.amount, 0);

  const metrics = [
    { label: "Clientes ativos", value: String(clients.length), detail: "base atual" },
    {
      label: "Cães em evolução",
      value: String(clients.reduce((total, client) => total + client.dogs.length, 0)),
      detail: "com histórico técnico",
    },
    {
      label: "Treinos cadastrados",
      value: String(sessions.length),
      detail: "sessões com notas e observações",
    },
    {
      label: "Cobranças pendentes",
      value: `R$ ${pendingPayments.toLocaleString("pt-BR")}`,
      detail: "em aberto no período",
    },
  ];

  return (
    <PageShell
      kicker="Visão geral"
      title={`Painel do ${trainerName || "adestrador"}`}
      description="Visão central da operação com indicadores de clientes, treinos, agenda e financeiro em tempo real."
      requireAuth="trainer"
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article
            key={metric.label}
            className="rounded-[1.75rem] border border-[var(--border)] bg-white/85 p-5 shadow-sm"
          >
            <p className="text-sm text-[var(--muted)]">{metric.label}</p>
            <p className="mt-3 font-display text-4xl font-semibold">{metric.value}</p>
            <p className="mt-2 text-sm text-emerald-700">{metric.detail}</p>
          </article>
        ))}
      </section>

      <section>
        <article className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                Agenda do dia
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold">
                Próximos agendamentos
              </h2>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800">
              {confirmedEvents} confirmados
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {events.slice(0, 4).map((session) => (
              <div
                key={session.id}
                className="grid gap-3 rounded-3xl border border-[var(--border)] bg-white/85 p-4 md:grid-cols-[0.22fr_1fr_auto] md:items-center"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                    {session.time}
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted)]">Sessão {session.sessionNumber}</p>
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold">{session.dog}</h3>
                  <p className="text-sm text-[var(--muted)]">
                    {session.client} • {session.plan}
                  </p>
                </div>
                <div className="rounded-full border border-[var(--border)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  {session.status}
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
        <article className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel-strong)] p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Alertas inteligentes
          </p>
          <div className="mt-5 space-y-3">
            {trainerAlerts.map((alert) => (
              <div key={alert.title} className="rounded-3xl border border-[var(--border)] bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-xl font-semibold">{alert.title}</h3>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-900">
                    {alert.type}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{alert.detail}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Financeiro rápido
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold">
            Controle de cobrança e retenção
          </h2>
          <div className="mt-6 space-y-3">
            {payments.map((payment) => (
              <div key={payment.id} className="rounded-3xl border border-[var(--border)] bg-white/90 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{payment.clientName}</p>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                    payment.status === "Pago" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"
                  }`}>
                    {payment.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Valor: {payment.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </PageShell>
  );
}