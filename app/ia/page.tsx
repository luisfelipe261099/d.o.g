"use client";

import { PageShell } from "@/components/page-shell";

export default function IaPage() {
  return (
    <PageShell
      kicker="IA"
      title="Assistente de protocolos"
      description="Monte o contexto do caso e gere um protocolo objetivo para usar na pr\u00f3xima sess\u00e3o."
      requireAuth="trainer"
    >
      <section className="flex flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-[var(--border)] bg-white/80 p-16 text-center shadow-sm">
        <span className="rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Em breve</span>
        <h2 className="mt-5 font-display text-3xl font-semibold text-[var(--foreground)]">Assistente de IA</h2>
        <p className="mt-3 max-w-md text-sm leading-7 text-[var(--muted)]">
          Gera\u00e7\u00e3o de protocolos com intelig\u00eancia artificial estar\u00e1 dispon\u00edvel em breve. Voc\u00ea poder\u00e1 montar o contexto do caso e receber um plano de sess\u00e3o objetivo baseado no hist\u00f3rico do c\u00e3o.
        </p>
      </section>
    </PageShell>
  );
}