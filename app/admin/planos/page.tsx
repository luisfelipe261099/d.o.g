"use client";

import { useMemo, useState } from "react";

import { PageShell } from "@/components/page-shell";

export default function PlanosPage() {
  const [plans, setPlans] = useState([
    { name: "Essencial", price: "R$ 420", features: ["Até 5 clientes", "Agenda básica", "Portal cliente", "Suporte por email"] },
    { name: "Pro", price: "R$ 690", features: ["Até 15 clientes", "Agenda avançada", "Portal completo", "Notas técnicas", "Suporte prioritário"] },
    { name: "Premium", price: "R$ 990", features: ["Clientes ilimitados", "Recursos avançados", "Analytics", "API access", "Suporte 24/7"] },
  ]);
  const [selectedPlanName, setSelectedPlanName] = useState("Essencial");
  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.name === selectedPlanName) ?? plans[0],
    [plans, selectedPlanName],
  );
  const [draftPrice, setDraftPrice] = useState("R$ 420");
  const [draftFeatures, setDraftFeatures] = useState("Até 5 clientes, Agenda básica, Portal cliente, Suporte por email");

  function startEdit(planName: string) {
    const plan = plans.find((item) => item.name === planName);
    if (!plan) return;
    setSelectedPlanName(plan.name);
    setDraftPrice(plan.price);
    setDraftFeatures(plan.features.join(", "));
  }

  function savePlan() {
    const nextFeatures = draftFeatures
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    setPlans((current) =>
      current.map((plan) =>
        plan.name === selectedPlanName
          ? { ...plan, price: draftPrice.trim() || plan.price, features: nextFeatures.length ? nextFeatures : plan.features }
          : plan,
      ),
    );
  }

  return (
    <PageShell
      kicker="Admin"
      title="Configuracao de planos"
      description="Defina precos, recursos e estrutura dos planos de assinatura da plataforma."
      requireAuth="admin"
    >
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] p-6">
          <h3 className="mb-6 font-display text-xl font-semibold">Planos Disponíveis</h3>
          <p className="mb-6 text-sm text-[var(--muted)]">Estruture ofertas para diferentes estágios de operação do adestrador.</p>
          
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <div key={plan.name} className="rounded-xl border border-slate-300 bg-slate-50 p-5">
                <h4 className="font-display text-2xl font-bold text-slate-900">{plan.name}</h4>
                <p className="mt-2 text-3xl font-bold text-slate-900">{plan.price}</p>
                <ul className="mt-4 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="text-base text-slate-800 font-medium flex items-start gap-2">
                      <span className="text-emerald-600 font-bold mt-0.5 text-lg">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => startEdit(plan.name)}
                  className="mt-5 w-full rounded-lg border-2 border-slate-900 bg-white px-4 py-3 text-base font-bold text-slate-900 hover:bg-slate-100"
                >
                  Editar
                </button>
              </div>
            ))}
          </div>
        </div>

          <aside className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Editor rápido
            </p>
            <h3 className="mt-2 font-display text-2xl font-semibold text-slate-900">
              {selectedPlan?.name}
            </h3>
            <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
              Ajuste posicionamento, preço e benefícios sem sair da tela.
            </p>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-[var(--muted)]">Preço</span>
                <input
                  value={draftPrice}
                  onChange={(event) => setDraftPrice(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-[var(--border)] px-4 py-3 text-sm outline-none focus:border-sky-400"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-[var(--muted)]">Benefícios</span>
                <textarea
                  value={draftFeatures}
                  onChange={(event) => setDraftFeatures(event.target.value)}
                  rows={8}
                  className="mt-2 w-full rounded-2xl border border-[var(--border)] px-4 py-3 text-sm outline-none focus:border-sky-400"
                />
              </label>

              <button
                type="button"
                onClick={savePlan}
                className="pc-primary-action w-full rounded-full px-5 py-3 text-sm font-semibold"
              >
                Salvar plano
              </button>
            </div>
          </aside>
        </div>
      </div>
    </PageShell>
  );
}
