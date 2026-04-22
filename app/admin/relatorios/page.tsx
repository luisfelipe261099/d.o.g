import { PageShell } from "@/components/page-shell";

export default function RelatoriosPage() {
  return (
    <PageShell
      kicker="Admin"
      title="Relatórios e Analytics"
      description="Visualize metricas de uso, crescimento e desempenho da base de adestradores da plataforma."
      requireAuth="admin"
    >
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Crescimento de Usuários */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] p-6">
            <h3 className="mb-4 font-display text-xl font-semibold">Crescimento de Adestradores</h3>
            <div className="space-y-3">
              {[
                { mes: "Jan", value: 8 },
                { mes: "Fev", value: 10 },
                { mes: "Mar", value: 3 },
              ].map((data) => (
                <div key={data.mes}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-slate-900">{data.mes}</p>
                    <p className="text-sm font-semibold text-slate-900">{data.value} novos</p>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div 
                      className="h-full bg-sky-500" 
                      style={{ width: `${(data.value / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Taxa de Retenção */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] p-6">
            <h3 className="mb-4 font-display text-xl font-semibold">Taxa de Retenção por Plano</h3>
            <div className="space-y-3">
              {[
                { plano: "Essencial", taxa: 72 },
                { plano: "Pro", taxa: 88 },
                { plano: "Premium", taxa: 95 },
              ].map((data) => (
                <div key={data.plano}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-slate-900">{data.plano}</p>
                    <p className="text-sm font-semibold text-slate-900">{data.taxa}%</p>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div 
                      className="h-full bg-emerald-500" 
                      style={{ width: `${data.taxa}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cães por Adestrador */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] p-6">
            <h3 className="mb-4 font-display text-xl font-semibold">Média de Cães por Adestrador</h3>
            <div className="text-center py-6">
              <p className="text-5xl font-bold text-sky-600">2.8</p>
              <p className="mt-2 text-sm text-slate-600">casos ativos por conta</p>
              <p className="mt-4 text-xs text-slate-500">8 cães monitorados por 3 adestradores ativos</p>
            </div>
          </div>

          {/* Sessões Realizadas */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] p-6">
            <h3 className="mb-4 font-display text-xl font-semibold">Sessões Realizadas este Mês</h3>
            <div className="text-center py-6">
              <p className="text-5xl font-bold text-emerald-600">24</p>
              <p className="mt-2 text-sm text-slate-600">sessões confirmadas e registradas</p>
              <p className="mt-4 text-xs text-slate-500">taxa de conclusão operacional: 92%</p>
            </div>
          </div>
        </div>

        {/* Tabela de Adestradores com Performance */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] p-6">
          <h3 className="mb-4 font-display text-xl font-semibold">Performance da base de adestradores</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-slate-50">
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">Adestrador</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">Cães</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">Sessões</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">Receita</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">Satisfação</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { nome: "Marina Costa", caes: 1, sessoes: 4, receita: "R$ 690", satisfacao: 92 },
                  { nome: "Carla Nunes", caes: 1, sessoes: 3, receita: "R$ 420", satisfacao: 88 },
                  { nome: "Rafael Prado", caes: 1, sessoes: 2, receita: "R$ 990", satisfacao: 95 },
                ].map((trainer, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-3 text-slate-900 font-medium">{trainer.nome}</td>
                    <td className="px-6 py-3 text-slate-600">{trainer.caes}</td>
                    <td className="px-6 py-3 text-slate-600">{trainer.sessoes}</td>
                    <td className="px-6 py-3 font-semibold text-slate-900">{trainer.receita}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-slate-200">
                          <div 
                            className="h-full bg-emerald-500" 
                            style={{ width: `${trainer.satisfacao}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-900">{trainer.satisfacao}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
