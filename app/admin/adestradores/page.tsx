import { PageShell } from "@/components/page-shell";
import { AdestradoresClient } from "./adestradores-client";

export default function AdestradoresPage() {
  return (
    <PageShell
      kicker="Admin"
      title="Gerenciamento de Adestradores"
      description="Gerencie cadastro, status e plano dos adestradores ativos."
      requireAuth="admin"
    >
      <AdestradoresClient />
    </PageShell>
  );
}
