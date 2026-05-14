"use client";

import Link from "next/link";
import { PageShell } from "@/components/page-shell";

const clientSteps = [
  {
    title: "Acessar o Portal do Tutor",
    text: "Utilize o link enviado pelo adestrador para acessar o portal. Insira o PIN, se necessário.",
    href: "/portal",
    action: "Acessar Portal",
  },
  {
    title: "Visualizar Tarefas e Treinamentos",
    text: "Confira as tarefas recomendadas e os vídeos de treinamento enviados pelo adestrador.",
    href: "/portal/tarefas",
    action: "Ver Tarefas",
  },
  {
    title: "Marcar Tarefas como Concluídas",
    text: "Após realizar as tarefas, marque-as como concluídas para acompanhar o progresso.",
    href: "/portal/tarefas",
    action: "Marcar Concluído",
  },
  {
    title: "Avaliar Sessões de Treinamento",
    text: "Envie sua avaliação e comentários sobre as sessões realizadas para ajudar no acompanhamento.",
    href: "/portal/avaliacoes",
    action: "Avaliar Sessões",
  },
  {
    title: "Acompanhar Progresso do Cão",
    text: "Veja o histórico de treinos, fotos e evolução do seu cão ao longo do programa.",
    href: "/portal/progresso",
    action: "Ver Progresso",
  },
];

export default function ClientTutorialPage() {
  return (
    <PageShell>
      <section>
        <h1>Tutorial para Clientes</h1>
        <p>Bem-vindo ao portal do tutor! Aqui estão os passos para aproveitar ao máximo o acompanhamento do treinamento do seu cão:</p>
        {clientSteps.map((step, index) => (
          <div key={index}>
            <h2>{step.title}</h2>
            <p>{step.text}</p>
            <Link href={step.href}>{step.action}</Link>
          </div>
        ))}
      </section>
    </PageShell>
  );
}