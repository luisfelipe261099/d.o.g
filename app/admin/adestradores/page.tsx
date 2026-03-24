import { PageShell } from "@/components/page-shell";
import { AdestradoresClient } from "./adestradores-client";

export default function AdestradoresPage() {
  return (
    <PageShell
      kicker="Administração"
      title="Gerenciamento de Adestradores"
      description="Crie, edite e monitore todos os adestradores da plataforma."
      requireAuth="admin"
    >
      <AdestradoresClient />
    </PageShell>
  );
}
