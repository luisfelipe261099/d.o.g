import { PageShell } from "@/components/page-shell";
import { AdminDashboard } from "./admin-client";

export default function AdminPage() {
  return (
    <PageShell
      kicker="Administração"
      title="Dashboard da Plataforma"
      description="Visão centralizada de usuários, planos, faturamento e saúde do sistema."
      requireAuth="admin"
    >
      <AdminDashboard />
    </PageShell>
  );
}
