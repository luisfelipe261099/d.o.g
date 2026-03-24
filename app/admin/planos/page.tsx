import { PageShell } from "@/components/page-shell";

export default function PlanosPage() {
  return (
    <PageShell
      kicker="Administração"
      title="Configuração de Planos"
      description="Crie e configure os planos oferecidos na plataforma."
      requireAuth="admin"
    >
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] p-6">
          <h3 className="mb-6 font-display text-xl font-semibold">Planos Disponíveis</h3>
          
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { name: "Essencial", price: "R$ 420", features: ["Até 5 clientes", "Agenda básica", "Portal cliente", "Suporte por email"] },
              { name: "Pro", price: "R$ 690", features: ["Até 15 clientes", "Agenda avançada", "Portal completo", "Notas técnicas", "Suporte prioritário"] },
              { name: "Premium", price: "R$ 990", features: ["Clientes ilimitados", "Recursos avançados", "Analytics", "API access", "Suporte 24/7"] },
            ].map((plan) => (
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
                <button className="mt-5 w-full rounded-lg border-2 border-slate-900 bg-white px-4 py-3 text-base font-bold text-slate-900 hover:bg-slate-100">
                  Editar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
