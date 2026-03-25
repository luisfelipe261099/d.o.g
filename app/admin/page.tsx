import { PageShell } from "@/components/page-shell";
import { AdminDashboard } from "./admin-client";

export default function AdminPage() {
  return (
    <PageShell
      kicker="Admin"
      title="Painel administrativo"
      description="Acompanhe contas, planos, faturamento e indicadores da plataforma."
      requireAuth="admin"
    >
      <AdminDashboard />
    </PageShell>
  );
}
