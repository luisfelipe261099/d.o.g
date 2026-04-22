"use client";

import { PageShell } from "@/components/page-shell";
import { useAppStore } from "@/lib/app-store";

export default function DashboardPage() {
  const clients = useAppStore((state) => state.clients);
  const events = useAppStore((state) => state.calendarEvents);
  const sessions = useAppStore((state) => state.trainingSessions);
  const payments = useAppStore((state) => state.payments);
  const trainerName = useAppStore((state) => state.trainerName);
  const upcomingEvents = events.slice(0, 4);

  const confirmedEvents = events.filter((event) => event.status === "Confirmado").length;
  const pendingPayments = payments
    .filter((payment) => payment.status === "Pendente")
    .reduce((total, payment) => total + payment.amount, 0);

  const metrics = [
    { label: "Clientes ativos", value: String(clients.length), detail: "carteira acompanhada nesta semana" },
    {
      label: "Cães em evolução",
      value: String(clients.reduce((total, client) => total + client.dogs.length, 0)),
      detail: "com evolução monitorada por sessão",
    },
    {
      label: "Treinos cadastrados",
      value: String(sessions.length),
      detail: "sessões registradas com contexto técnico",
    },
    {
      label: "Cobranças pendentes",
      value: `R$ ${pendingPayments.toLocaleString("pt-BR")}`,
      detail: "receita prevista pendente de confirmação",
    },
  ];

  return (
    <PageShell
      kicker="Painel"
      title={`Painel do ${trainerName || "adestrador"}`}
      description="Veja o que precisa ser feito hoje e siga direto para a próxima ação da operação."
      requireAuth="trainer"
    >
      <section className="grid gap-3 sm:grid-cols-3">
        {[
          "1. Veja os atendimentos de hoje",
          "2. Registre o treino do caso",
          "3. Entregue tarefa no portal do tutor",
        ].map((step) => (
          <article key={step} className="rounded-2xl border border-[var(--border)] bg-white/90 p-3.5 sm:p-4">
            <p className="text-sm font-semibold leading-6 text-[var(--foreground)]">{step}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 md:hidden">
        {metrics.slice(0, 2).map((metric) => (
          <article
            key={metric.label}
            className="rounded-[1.5rem] border border-[var(--border)] bg-white/85 p-4 shadow-sm"
          >
            <p className="text-sm text-[var(--muted)]">{metric.label}</p>
            <p className="mt-2 font-display text-3xl font-semibold">{metric.value}</p>
            <p className="mt-2 text-sm text-emerald-700">{metric.detail}</p>
          </article>
        ))}
      </section>

      <section className="hidden gap-4 md:grid md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article
            key={metric.label}
            className="rounded-[1.75rem] border border-[var(--border)] bg-white/85 p-5 shadow-sm"
          >
            <p className="text-sm text-[var(--muted)]">{metric.label}</p>
            <p className="mt-3 font-display text-3xl font-semibold xl:text-4xl">{metric.value}</p>
            <p className="mt-2 text-sm text-emerald-700">{metric.detail}</p>
          </article>
        ))}
      </section>

      <section>
        <article className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                Agenda do dia
              </p>
              <h2 className="mt-2 font-display text-xl font-semibold md:text-2xl">
                Próximos atendimentos
              </h2>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800">
              {confirmedEvents} confirmados
            </span>
          </div>

          {events.length === 0 ? (
            <p className="mt-6 text-sm text-[var(--muted)]">Nenhum atendimento agendado. Cadastre eventos na Agenda.</p>
          ) : null}
          <div className="mt-6 space-y-4">
            {upcomingEvents.map((session) => (
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
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-2xl">
                    🐾
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold md:text-xl">{session.dog}</h3>
                    <p className="text-sm text-[var(--muted)]">
                      {session.client} • {session.plan}
                    </p>
                  </div>
                </div>
                <div className="rounded-full border border-[var(--border)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  {session.status}
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section>
        <article className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm md:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Financeiro rápido
          </p>
          <h2 className="mt-2 font-display text-xl font-semibold md:text-2xl">
            Receita recorrente e risco de cancelamento
          </h2>
          {payments.length === 0 ? (
            <p className="mt-6 text-sm text-[var(--muted)]">Nenhuma cobrança registrada. Adicione clientes para gerar cobranças.</p>
          ) : null}
          <div className="mt-6 space-y-3">
            {payments.slice(0, 2).map((payment) => (
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