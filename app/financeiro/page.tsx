"use client";

import { PageShell } from "@/components/page-shell";
import { useAppStore } from "@/lib/app-store";

export default function FinancialPage() {
  const clients = useAppStore((state) => state.clients);
  const payments = useAppStore((state) => state.payments);
  const markPaymentPaid = useAppStore((state) => state.markPaymentPaid);

  const pendingPayments = payments.filter((payment) => payment.status === "Pendente");
  const paidPayments = payments.filter((payment) => payment.status === "Pago");

  const totalPending = pendingPayments.reduce((sum, item) => sum + item.amount, 0);
  const totalPaid = paidPayments.reduce((sum, item) => sum + item.amount, 0);

  return (
    <PageShell
      kicker="Financeiro"
      title="Contratos, pacotes e cobranças"
      description="Acompanhe pagamentos pendentes, baixa financeira e renovação de pacotes por cliente."
      requireAuth
    >
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[1.75rem] border border-[var(--border)] bg-white/90 p-5 shadow-sm">
          <p className="text-sm text-[var(--muted)]">Clientes com contrato ativo</p>
          <p className="mt-2 font-display text-4xl font-semibold">{clients.length}</p>
          <p className="mt-2 text-sm text-emerald-700">carteira em acompanhamento</p>
        </article>
        <article className="rounded-[1.75rem] border border-[var(--border)] bg-white/90 p-5 shadow-sm">
          <p className="text-sm text-[var(--muted)]">Recebido no período</p>
          <p className="mt-2 font-display text-4xl font-semibold">
            {totalPaid.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
          <p className="mt-2 text-sm text-emerald-700">baixas confirmadas</p>
        </article>
        <article className="rounded-[1.75rem] border border-[var(--border)] bg-white/90 p-5 shadow-sm">
          <p className="text-sm text-[var(--muted)]">Em aberto</p>
          <p className="mt-2 font-display text-4xl font-semibold">
            {totalPending.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
          <p className="mt-2 text-sm text-amber-800">necessita cobrança</p>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Cobranças do período
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {payments.map((payment) => (
              <div key={payment.id} className="rounded-3xl border border-[var(--border)] bg-white p-4">
                <p className="font-semibold">{payment.clientName}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {payment.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
                <button
                  type="button"
                  onClick={() => markPaymentPaid(payment.id)}
                  className={`mt-4 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${
                    payment.status === "Pago"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-900"
                  }`}
                >
                  {payment.status === "Pago" ? "Pago" : "Marcar como pago"}
                </button>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[1.75rem] border border-[var(--border)] bg-slate-950 p-6 text-white shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Renovação de pacotes</p>
          <div className="mt-5 space-y-3">
            {clients.map((client, index) => (
              <div key={client.id} className="rounded-3xl bg-white/7 p-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-semibold">{client.name}</h2>
                  <span className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.14em] text-slate-300">
                    {index % 2 === 0 ? "renovar" : "ativo"}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-7 text-slate-300">{client.plan}</p>
                <p className="mt-1 text-sm leading-7 text-slate-300">
                  {index % 2 === 0
                    ? "Cliente próximo do limite de aulas contratadas."
                    : "Contrato em andamento com sessões dentro do previsto."}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </PageShell>
  );
}