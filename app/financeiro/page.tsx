"use client";

import { useState } from "react";

import { PageShell } from "@/components/page-shell";
import { useAppStore } from "@/lib/app-store";

export default function FinancialPage() {
  const clients = useAppStore((state) => state.clients);
  const payments = useAppStore((state) => state.payments);
  const loadFromDB = useAppStore((state) => state.loadFromDB);
  const trainerSubscription = useAppStore((state) => state.trainerSubscription);
  const [busyPaymentId, setBusyPaymentId] = useState<string | null>(null);
  const [busyClientId, setBusyClientId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  const pendingPayments = payments.filter((payment) => payment.status === "Pendente");
  const paidPayments = payments.filter((payment) => payment.status === "Pago");
  const clientPayments = payments.filter((payment) => payment.source !== "Assinatura");
  const subscriptionPayments = payments.filter((payment) => payment.source === "Assinatura");

  const totalPending = pendingPayments.reduce((sum, item) => sum + item.amount, 0);
  const totalPaid = paidPayments.reduce((sum, item) => sum + item.amount, 0);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDueDate = tomorrow.toLocaleDateString("pt-BR");

  async function refreshFinance(messageText?: string) {
    await loadFromDB();
    if (messageText) {
      setMessage(messageText);
      window.setTimeout(() => setMessage(""), 2500);
    }
  }

  async function handleSetPaymentStatus(paymentId: string, status: "Pago" | "Pendente") {
    setBusyPaymentId(paymentId);

    try {
      const response = await fetch("/api/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: paymentId, status }),
      });

      if (!response.ok) {
        setMessage("Não foi possível atualizar o status agora.");
        return;
      }

      await refreshFinance(status === "Pago" ? "Cobrança marcada como paga." : "Cobrança reaberta como pendente.");
    } catch {
      setMessage("Erro de conexão ao atualizar cobrança.");
    } finally {
      setBusyPaymentId(null);
      window.setTimeout(() => setMessage(""), 2500);
    }
  }

  async function handleGenerateClientCharge(clientId: string) {
    const client = clients.find((item) => item.id === clientId);
    if (!client) return;

    const hasPendingOpen = payments.some(
      (payment) =>
        payment.source !== "Assinatura" &&
        payment.clientId === client.id &&
        payment.status === "Pendente",
    );

    if (hasPendingOpen) {
      setMessage("Este cliente já possui cobrança pendente. Marque como paga ou reabra antes de gerar outra.");
      window.setTimeout(() => setMessage(""), 3000);
      return;
    }

    setBusyClientId(clientId);

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: client.id,
          clientName: client.name,
          amount: client.contractAmount ?? 0,
          source: "Cliente",
          paymentMethod: client.paymentMethod,
          dueDate: client.nextChargeDate || defaultDueDate,
          reference: client.plan,
        }),
      });

      if (!response.ok) {
        setMessage("Não foi possível gerar o faturamento deste cliente.");
        return;
      }

      await refreshFinance("Faturamento gerado com sucesso.");
    } catch {
      setMessage("Erro de conexão ao gerar faturamento.");
    } finally {
      setBusyClientId(null);
      window.setTimeout(() => setMessage(""), 2500);
    }
  }

  return (
    <PageShell
      kicker="Financeiro"
      title="Planos, contratos e recebimentos"
      description="Acompanhe receita prevista, pagamentos confirmados e o pacote atual usado no controle do adestrador."
      requireAuth="trainer"
    >
      {message ? (
        <section>
          <article className="rounded-2xl border border-[var(--border)] bg-white/90 px-4 py-3 text-sm text-[var(--foreground)] shadow-sm">
            {message}
          </article>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[1.75rem] border border-[var(--border)] bg-white/90 p-5 shadow-sm">
          <p className="text-sm text-[var(--muted)]">Clientes com contrato ativo</p>
          <p className="mt-2 font-display text-4xl font-semibold">{clients.length}</p>
          <p className="mt-2 text-sm text-emerald-700">base com recorrência em andamento</p>
        </article>
        <article className="rounded-[1.75rem] border border-[var(--border)] bg-white/90 p-5 shadow-sm">
          <p className="text-sm text-[var(--muted)]">Recebido no período</p>
          <p className="mt-2 font-display text-4xl font-semibold">
            {totalPaid.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
          <p className="mt-2 text-sm text-emerald-700">caixa confirmado no ciclo atual</p>
        </article>
        <article className="hidden rounded-[1.75rem] border border-[var(--border)] bg-white/90 p-5 shadow-sm md:block">
          <p className="text-sm text-[var(--muted)]">Em aberto</p>
          <p className="mt-2 font-display text-4xl font-semibold">
            {totalPending.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
          <p className="mt-2 text-sm text-amber-800">pedidos que exigem ação de cobrança</p>
        </article>
      </section>

      <section>
        <article className="rounded-[1.75rem] border border-[var(--border)] bg-white/90 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Sua assinatura PegadaCerta</p>
          <div className="mt-3 grid gap-3 md:grid-cols-4">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Plano</p>
              <p className="mt-1 font-semibold text-[var(--foreground)]">{trainerSubscription.planName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Pagamento</p>
              <p className="mt-1 font-semibold text-[var(--foreground)]">{trainerSubscription.paymentMethod}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Pacote</p>
              <p className="mt-1 font-semibold text-[var(--foreground)]">{trainerSubscription.lessonPackage}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Próxima revisão</p>
              <p className="mt-1 font-semibold text-[var(--foreground)]">{trainerSubscription.nextChargeDate}</p>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Valor do pacote</p>
            <p className="mt-1 font-semibold text-[var(--foreground)]">{trainerSubscription.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
          </div>
        </article>
      </section>

      <section>
        <article className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Cobrança recorrente por cliente</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {clients.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[var(--border)] bg-white p-4 text-sm text-[var(--muted)] md:col-span-2">
                Nenhum cliente cadastrado. Cadastre clientes em <a href="/clientes" className="underline">Clientes</a> para gerar cobranças.
              </div>
            ) : null}
            {clients.map((client) => (
              <div key={client.id} className="rounded-3xl border border-[var(--border)] bg-white p-4">
                <p className="font-semibold">{client.name}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{(client.contractAmount ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} • {client.paymentMethod ?? "Pix"}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">Próximo vencimento: {client.nextChargeDate ?? "--/--/----"}</p>
                <button
                  type="button"
                  onClick={() => handleGenerateClientCharge(client.id)}
                  disabled={busyClientId === client.id}
                  className="mt-3 rounded-full border border-[var(--border)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--foreground)]"
                >
                  {busyClientId === client.id ? "Gerando..." : "Gerar faturamento"}
                </button>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Cobranças de clientes
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold">Visão de recebimentos por contrato</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">{clientPayments.length} cobranças de clientes ativas na carteira.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {clientPayments.map((payment, index) => (
              <div key={payment.id} className={`rounded-3xl border border-[var(--border)] bg-white p-4 ${index > 3 ? "hidden md:block" : ""}`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">{payment.clientName}</p>
                  {payment.source ? (
                    <span className="rounded-full border border-[var(--border)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                      {payment.source}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {payment.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {payment.paymentMethod ? `Método: ${payment.paymentMethod}` : "Método não informado"}
                  {payment.dueDate ? ` • Vencimento: ${payment.dueDate}` : ""}
                </p>
                {payment.reference ? (
                  <p className="mt-1 text-xs text-[var(--muted)]">{payment.reference}</p>
                ) : null}
                <button
                  type="button"
                  onClick={() =>
                    handleSetPaymentStatus(payment.id, payment.status === "Pago" ? "Pendente" : "Pago")
                  }
                  disabled={busyPaymentId === payment.id}
                  className={`mt-4 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${
                    payment.status === "Pago"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-900"
                  }`}
                >
                  {busyPaymentId === payment.id
                    ? "Atualizando..."
                    : payment.status === "Pago"
                    ? "Reabrir pendência"
                    : "Marcar como pago"}
                </button>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Cobranças de assinatura</p>
          <h2 className="mt-2 font-display text-2xl font-semibold">PegadaCerta</h2>
          <div className="mt-4 space-y-3">
            {subscriptionPayments.length ? (
              subscriptionPayments.map((payment) => (
                <div key={payment.id} className="rounded-3xl border border-[var(--border)] bg-white p-4">
                  <p className="font-semibold">{payment.clientName}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{payment.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">{payment.paymentMethod} • {payment.dueDate}</p>
                  {payment.reference ? <p className="mt-1 text-xs text-[var(--muted)]">{payment.reference}</p> : null}
                  <button
                    type="button"
                    onClick={() =>
                      handleSetPaymentStatus(payment.id, payment.status === "Pago" ? "Pendente" : "Pago")
                    }
                    disabled={busyPaymentId === payment.id}
                    className={`mt-4 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${
                      payment.status === "Pago"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    {busyPaymentId === payment.id
                      ? "Atualizando..."
                      : payment.status === "Pago"
                      ? "Reabrir pendência"
                      : "Marcar como pago"}
                  </button>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-[var(--border)] bg-white p-4 text-sm text-[var(--muted)]">
                Nenhuma cobrança de assinatura gerada ainda.
              </div>
            )}
          </div>
        </article>
      </section>
    </PageShell>
  );
}