"use client";

import Link from "next/link";
import { useState } from "react";

import { AuthGuard } from "@/components/auth-guard";
import { useAppStore } from "@/lib/app-store";

function TinyIcon({ name }: { name: "back" | "plus" | "check" | "alert" }) {
  if (name === "back") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
        <path d="m14.5 6-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "plus") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "check") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
        <path d="M4 12l5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <circle cx="12" cy="18" r="1" fill="currentColor" />
      <path d="M12 2l10 18H2L12 2z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

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
    <AuthGuard role="trainer">
      <main className="mx-auto w-full max-w-md px-3 pb-24 pt-3 sm:max-w-xl">
        <section className="rounded-[2rem] border border-[var(--border)] bg-[#f7fbff] p-3.5 shadow-[var(--shadow)]">
          <header className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[#145a82]">
                <TinyIcon name="back" />
              </Link>
              <div>
                <p className="text-base font-semibold text-[var(--foreground)]">Financeiro</p>
                <p className="text-[11px] text-[var(--muted)]">Gerencie planos, contratos e recebimentos.</p>
              </div>
            </div>
          </header>

          {message ? (
            <div className="mt-3 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-800">
              {message}
            </div>
          ) : null}

          <section className="mt-4 grid grid-cols-2 gap-2">
            <article className="rounded-xl border border-[var(--border)] bg-white p-3">
              <p className="text-xs text-[var(--muted)]">Clientes</p>
              <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">{clients.length}</p>
            </article>
            <article className="rounded-xl border border-[var(--border)] bg-white p-3">
              <p className="text-xs text-[var(--muted)]">Recebido</p>
              <p className="mt-1 text-lg font-semibold text-emerald-700">
                {totalPaid.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
            </article>
            <article className="rounded-xl border border-[var(--border)] bg-white p-3">
              <p className="text-xs text-[var(--muted)]">Pendente</p>
              <p className="mt-1 text-lg font-semibold text-amber-800">
                {totalPending.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
            </article>
            <article className="rounded-xl border border-[var(--border)] bg-white p-3">
              <p className="text-xs text-[var(--muted)]">Plano</p>
              <p className="mt-1 text-sm font-semibold text-[#145a82]">{trainerSubscription.planName}</p>
            </article>
          </section>

          <section className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Sua assinatura Adestro</p>
            <div className="mt-3 rounded-2xl border border-[var(--border)] bg-white p-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-[var(--muted)]">Pacote</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">{trainerSubscription.lessonPackage}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--muted)]">Pagamento</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">{trainerSubscription.paymentMethod}</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-[var(--muted)]">Valor</p>
                  <p className="mt-1 text-sm font-semibold text-[#145a82]">
                    {trainerSubscription.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--muted)]">Próxima cobrança</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">{trainerSubscription.nextChargeDate}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">{clientPayments.length} cobranças de clientes</p>
            <div className="mt-3 space-y-2">
              {clientPayments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[var(--border)] bg-white p-4 text-xs text-[var(--muted)]">
                  Nenhuma cobrança de clientes. Gere faturamentos na seção abaixo.
                </div>
              ) : (
                clientPayments.map((payment) => (
                  <div key={payment.id} className="rounded-2xl border border-[var(--border)] bg-white p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[var(--foreground)]">{payment.clientName}</p>
                        <p className="mt-0.5 text-xs text-[var(--muted)]">
                          {payment.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </p>
                        <p className="mt-0.5 text-[10px] text-[var(--muted)]">
                          {payment.paymentMethod} • {payment.dueDate}
                        </p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                        payment.status === "Pago"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-900"
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleSetPaymentStatus(payment.id, payment.status === "Pago" ? "Pendente" : "Pago")
                      }
                      disabled={busyPaymentId === payment.id}
                      className="mt-2 w-full rounded-full border border-[var(--border)] bg-[#f7fbff] px-3 py-1.5 text-[10px] font-semibold text-[#145a82] disabled:opacity-50"
                    >
                      {busyPaymentId === payment.id
                        ? "Atualizando..."
                        : payment.status === "Pago"
                        ? "Reabrir"
                        : "Marcar pago"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">{subscriptionPayments.length} cobranças de assinatura</p>
            <div className="mt-3 space-y-2">
              {subscriptionPayments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[var(--border)] bg-white p-4 text-xs text-[var(--muted)]">
                  Nenhuma cobrança de assinatura gerada.
                </div>
              ) : (
                subscriptionPayments.map((payment) => (
                  <div key={payment.id} className="rounded-2xl border border-[var(--border)] bg-white p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[var(--foreground)]">{payment.clientName}</p>
                        <p className="mt-0.5 text-xs text-[var(--muted)]">
                          {payment.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </p>
                        <p className="mt-0.5 text-[10px] text-[var(--muted)]">
                          {payment.paymentMethod} • {payment.dueDate}
                        </p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                        payment.status === "Pago"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-900"
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleSetPaymentStatus(payment.id, payment.status === "Pago" ? "Pendente" : "Pago")
                      }
                      disabled={busyPaymentId === payment.id}
                      className="mt-2 w-full rounded-full border border-[var(--border)] bg-[#f7fbff] px-3 py-1.5 text-[10px] font-semibold text-[#145a82] disabled:opacity-50"
                    >
                      {busyPaymentId === payment.id
                        ? "Atualizando..."
                        : payment.status === "Pago"
                        ? "Reabrir"
                        : "Marcar pago"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Gerar cobranças</p>
            <div className="mt-3 space-y-2">
              {clients.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[var(--border)] bg-white p-4 text-xs text-[var(--muted)]">
                  Nenhum cliente cadastrado. Cadastre em <Link href="/clientes" className="font-semibold text-[#145a82]">Clientes</Link>.
                </div>
              ) : (
                clients.map((client) => (
                  <div key={client.id} className="rounded-2xl border border-[var(--border)] bg-white p-3">
                    <p className="text-sm font-semibold text-[var(--foreground)]">{client.name}</p>
                    <p className="mt-0.5 text-xs text-[var(--muted)]">
                      {(client.contractAmount ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} • {client.paymentMethod ?? "Pix"}
                    </p>
                    <p className="mt-0.5 text-[10px] text-[var(--muted)]">Próx: {client.nextChargeDate ?? "--/--/----"}</p>
                    <button
                      type="button"
                      onClick={() => handleGenerateClientCharge(client.id)}
                      disabled={busyClientId === client.id}
                      className="mt-2 w-full rounded-full bg-[#145a82] px-3 py-1.5 text-[10px] font-semibold text-white disabled:opacity-50"
                    >
                      {busyClientId === client.id ? "Gerando..." : "Gerar faturamento"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </section>
      </main>
    </AuthGuard>
  );
}