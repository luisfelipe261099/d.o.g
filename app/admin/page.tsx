import { PageShell } from "@/components/page-shell";
import { AdminDashboard } from "./admin-client";

export default function AdminPage() {
  return (
    <PageShell
      kicker="Admin"
      title="Painel administrativo"
      description="Gerencie adestradores assinantes, planos, faturamento e indicadores da Adestro."
      requireAuth="admin"
    >
      <AdminDashboard />
    </PageShell>
  );
}
