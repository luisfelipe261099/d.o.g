import { PageShell } from "@/components/page-shell";

export default function FaturamentoPage() {
  return (
    <PageShell
      kicker="Administração"
      title="Faturamento e Receitas"
      description="Monitore receitas, pagamentos e fluxo financeiro da plataforma."
      requireAuth="admin"
    >
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { icon: "💰", label: "Receita MRR", value: "R$ 2.100", change: "+12%" },
            { icon: "✅", label: "Pagamentos Confirmados", value: "R$ 1.110", change: "+5%" },
            { icon: "⏳", label: "Pagamentos Pendentes", value: "R$ 990", change: "-8%" },
            { icon: "📈", label: "ARR Estimado", value: "R$ 25.200", change: "+18%" },
          ].map((stat, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-300 bg-white p-5">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-base font-bold text-slate-900">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
                  <p className="mt-1 text-base font-bold text-emerald-700">{stat.change} vs mês anterior</p>
                </div>
                <span className="text-4xl">{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] p-6">
          <h3 className="mb-4 font-display text-xl font-semibold">Transações Recentes</h3>
          <div className="space-y-3">
            {[
              { adestrador: "Marina Costa", plano: "Pro", valor: "R$ 690", data: "24/03/2026", status: "Pendente" },
              { adestrador: "Carla Nunes", plano: "Essencial", valor: "R$ 420", data: "23/03/2026", status: "Pago" },
              { adestrador: "Rafael Prado", plano: "Premium", valor: "R$ 990", data: "22/03/2026", status: "Pago" },
            ].map((tx, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-lg border-2 border-slate-300 bg-white p-4">
                <div className="flex-1">
                  <p className="font-bold text-slate-900 text-base">{tx.adestrador}</p>
                  <p className="text-base font-medium text-slate-700">{tx.plano}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 text-base">{tx.valor}</p>
                  <p className="text-sm font-medium text-slate-600">{tx.data}</p>
                </div>
                <span className={`ml-4 inline-block rounded-full px-4 py-2 text-base font-bold ${
                  tx.status === "Pago" 
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}>
                  {tx.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
