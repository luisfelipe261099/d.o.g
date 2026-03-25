export const navigation = [
  {
    href: "/",
    label: "Início",
    kicker: "Apresentação",
    description: "Landing comercial para contextualizar a proposta e a estrutura do produto.",
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    kicker: "Operação",
    description: "Home executiva com métricas, agendamentos e alertas rápidos.",
  },
  {
    href: "/clientes",
    label: "Clientes",
    kicker: "CRM",
    description: "Gestão de donos, múltiplos cães, contexto da casa e saúde.",
  },
  {
    href: "/treinos",
    label: "Treinos",
    kicker: "Core",
    description: "Timeline de sessões, blocos de treino e evolução por notas.",
  },
  {
    href: "/agenda",
    label: "Agenda",
    kicker: "Calendário",
    description: "Agenda semanal, recorrência, confirmação e alertas de saúde.",
  },
  {
    href: "/portal",
    label: "Portal Cliente",
    kicker: "Experiência externa",
    description: "Acompanhamento por link com tarefas, relatórios e galeria.",
  },
  {
    href: "/financeiro",
    label: "Financeiro",
    kicker: "Comercial",
    description: "Precificação, stack e fases para negociar o projeto.",
  },
];

export const highlightModules = [
  {
    kicker: "Módulo 01",
    title: "Treinos com memória",
    description:
      "Cada sessão puxa automaticamente resumo da aula anterior, prioridades do cliente e plano sugerido para o próximo encontro.",
  },
  {
    kicker: "Módulo 02",
    title: "Agenda confirmável",
    description:
      "Calendário visual com sessões recorrentes, status de confirmação e sincronização futura com Google Calendar e WhatsApp.",
  },
  {
    kicker: "Módulo 03",
    title: "Portal do dono",
    description:
      "Link simples para o cliente acompanhar tarefas, progresso, saúde do cão e conteúdo compartilhado pelo adestrador.",
  },
  {
    kicker: "Módulo 04",
    title: "Cobrança e planos",
    description:
      "Estrutura pensada para controlar quantidade de aulas, pagamentos pendentes e evolução futura para PIX, boleto e cartão.",
  },
];

export const dashboardMetrics = [
  { label: "Clientes ativos", value: "28", detail: "+3 nos últimos 30 dias" },
  { label: "Cães em evolução", value: "41", detail: "82% com nota média crescente" },
  { label: "Treinos esta semana", value: "17", detail: "12 já confirmados" },
  { label: "Cobranças pendentes", value: "R$ 3.480", detail: "4 contratos aguardando baixa" },
];

export const quickActions = [
  {
    title: "Novo cliente + novo cão",
    description: "Fluxo encadeado para não perder tempo entre cadastro do dono e abertura do perfil do cão.",
  },
  {
    title: "Novo agendamento",
    description: "Seleciona cliente, cão, duração, local e já envia confirmação externa com um clique.",
  },
  {
    title: "Gerar relatório em PDF",
    description: "Transforma o histórico de sessões em material profissional para entrega ao cliente por WhatsApp ou email.",
  },
];

export const upcomingSessions = [
  {
    time: "09:00",
    sessionNumber: 3,
    dog: "Mel",
    client: "Carla Nunes",
    focus: "Filhotes e mordidas em visita",
    status: "Confirmado",
  },
  {
    time: "14:30",
    sessionNumber: 8,
    dog: "Nina",
    client: "Rafael Prado",
    focus: "Obediência em ambientes externos",
    status: "Aguardando cliente",
  },
  {
    time: "18:30",
    sessionNumber: 6,
    dog: "Thor",
    client: "Marina Costa",
    focus: "Reatividade com outros cães",
    status: "Confirmado",
  },
];

export const trainerAlerts = [
  {
    title: "Vacina da Mel vence em 7 dias",
    type: "Saúde",
    detail: "Exibir no calendário e avisar a tutora antes da próxima sessão agendada.",
  },
  {
    title: "Contrato do Thor com 2 aulas restantes",
    type: "Comercial",
    detail: "Momento ideal para sugerir renovação do plano antes de acabar o pacote atual.",
  },
  {
    title: "Sessão de Nina ainda sem confirmação",
    type: "Agenda",
    detail: "Disparar lembrete automático 48h antes do horário reservado.",
  },
];

export const clients = [
  {
    name: "Marina Costa",
    phone: "(11) 99888-1122",
    propertyType: "Apartamento",
    environment:
      "Mora com duas crianças pequenas, elevador barulhento e fluxo intenso de visitas aos fins de semana.",
    plan: "Plano Pro • 12 sessões",
    dogs: [
      {
        name: "Thor",
        breed: "Border Collie",
        age: "2 anos",
        weight: "22 kg",
        photoUrl: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80",
        trainingTypes: ["Reatividade", "Obediência", "Place"],
        priorityIssues: [
          "Puxa muito na guia",
          "Late para cães no elevador",
          "Perde foco ao receber visitas",
        ],
        health: {
          vaccine: "V10 em dia • reforço em 12/04",
          deworming: "Simparic 02/03 • próxima dose 02/04",
          food: "Natural + ração premium",
          allergies: "Sensibilidade a frango",
        },
        tools: ["Guia longa", "Place", "Caixa de transporte"],
        notes:
          "Evolui rápido quando a rotina da casa está consistente. Cliente precisa reforçar exercícios curtos diariamente.",
      },
      {
        name: "Pipoca",
        breed: "SRD",
        age: "8 meses",
        weight: "11 kg",
        photoUrl: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=900&q=80",
        trainingTypes: ["Filhotes", "Socialização"],
        priorityIssues: ["Morde mãos", "Ansiedade no portão", "Xixi fora do tapete"],
        health: {
          vaccine: "Protocolo completo finalizado",
          deworming: "Em dia",
          food: "Ração super premium",
          allergies: "Nenhuma",
        },
        tools: ["Tapete higiênico", "Peitoral Y", "Brinquedo recheável"],
        notes:
          "Boa resposta com enriquecimento ambiental e reforço alimentar de alto valor.",
      },
    ],
  },
  {
    name: "Carla Nunes",
    phone: "(21) 97777-9910",
    propertyType: "Casa",
    environment: "Quintal amplo, dois gatos, portão eletrônico e rotina de trabalho remoto.",
    plan: "Visita inicial + 6 sessões",
    dogs: [
      {
        name: "Mel",
        breed: "Labrador",
        age: "6 meses",
        weight: "18 kg",
        photoUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=900&q=80",
        trainingTypes: ["Filhotes", "Guia"],
        priorityIssues: ["Pulando em pessoas", "Pegando objetos", "Mastigação excessiva"],
        health: {
          vaccine: "Próxima dose 18/04",
          deworming: "Próxima dose 04/04",
          food: "Ração para filhotes",
          allergies: "Nenhuma",
        },
        tools: ["Guia curta", "Brinquedos de enriquecimento"],
        notes: "Cliente bastante engajada e registrando vídeos entre uma aula e outra.",
      },
    ],
  },
];

export const trainingSessions = [
  {
    number: 1,
    date: "10/03/2026",
    title: "Visita inicial",
    notes: [
      { block: "Guia", score: 6, comment: "Puxava muito, melhorou com correção e mudança de ritmo." },
      { block: "Place", score: 4, comment: "Primeira introdução, ainda com resistência alta e muita quebra." },
    ],
  },
  {
    number: 4,
    date: "25/03/2026",
    title: "Foco em guia",
    notes: [
      { block: "Guia", score: 8, comment: "Evolução significativa, com melhor atenção em curvas e paradas." },
      { block: "Distrações", score: 5, comment: "Ainda reage em distância curta quando vê outro cão." },
    ],
  },
  {
    number: 6,
    date: "02/04/2026",
    title: "Generalização em rua movimentada",
    notes: [
      { block: "Guia", score: 8, comment: "Manteve padrão estável mesmo com ruídos moderados." },
      { block: "Place", score: 7, comment: "Já sustenta permanência por mais tempo com reforço intermitente." },
    ],
  },
];

export const trainingBlocks = [
  { name: "Guia", average: "7.3/10", progress: [6, 7, 8, 8, 8] },
  { name: "Place", average: "6.1/10", progress: [4, 5, 6, 7, 8] },
  { name: "Distrações", average: "5.2/10", progress: [3, 4, 5, 6, 8] },
];

export const calendarEvents = [
  {
    day: "Segunda",
    time: "09:00",
    dog: "Mel",
    client: "Carla Nunes",
    plan: "Filhotes • caminhada + autocontrole",
    sessionNumber: 3,
    status: "Confirmado",
  },
  {
    day: "Quarta",
    time: "18:30",
    dog: "Thor",
    client: "Marina Costa",
    plan: "Reatividade • rua com estímulos graduais",
    sessionNumber: 6,
    status: "Confirmado",
  },
  {
    day: "Sexta",
    time: "14:30",
    dog: "Nina",
    client: "Rafael Prado",
    plan: "Obediência • foco sob distração",
    sessionNumber: 8,
    status: "Pendente",
  },
  {
    day: "Sábado",
    time: "10:00",
    dog: "Pipoca",
    client: "Marina Costa",
    plan: "Socialização • visitas em casa",
    sessionNumber: 2,
    status: "Recorrente",
  },
  {
    day: "Sábado",
    time: "16:00",
    dog: "Apolo",
    client: "Henrique Lima",
    plan: "Visita inicial • análise comportamental",
    sessionNumber: 1,
    status: "Aguardando",
  },
  {
    day: "Domingo",
    time: "08:30",
    dog: "Luna",
    client: "Beatriz Sá",
    plan: "Place • permanência durante refeições",
    sessionNumber: 5,
    status: "Confirmado",
  },
];

export const healthAlerts = [
  {
    title: "Reforço da V10 do Thor",
    deadline: "em 7 dias",
    detail: "Criar lembrete visível para a tutora e bloquear atividades externas intensas se estiver em atraso.",
  },
  {
    title: "Vermífugo da Mel",
    deadline: "em 5 dias",
    detail: "Aviso aparece no calendário e no portal para facilitar cumprimento da rotina.",
  },
];

export const portalTasks = [
  {
    title: "Praticar place por 10 minutos ao dia",
    description: "Reforçar permanência antes do jantar e registrar vídeo curto se houver dificuldade.",
    completed: true,
  },
  {
    title: "Passeio com 3 pausas de foco",
    description: "Parar, pedir atenção e só avançar quando a guia estiver frouxa.",
    completed: false,
  },
  {
    title: "Receber visita sem contato imediato",
    description: "Colocar no place antes de abrir a porta e liberar apenas quando relaxar.",
    completed: false,
  },
];

export const portalFeed = [
  {
    title: "Sessão 6 • Reatividade na rua",
    date: "02/04/2026",
    summary: "Thor conseguiu manter foco por mais tempo e reduziu intensidade dos latidos em distância média.",
  },
  {
    title: "Sessão 5 • Place com distração",
    date: "28/03/2026",
    summary: "Boa evolução dentro de casa. Próximo passo é generalizar quando chegam visitas no apartamento.",
  },
];

export const portalGallery = [
  {
    title: "Treino de guia",
    kind: "Foto",
    caption: "Comparativo antes e depois do ajuste de ritmo durante o passeio na rua.",
    imageUrl: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Place com visita",
    kind: "Vídeo",
    caption: "Demonstração de permanência enquanto uma pessoa entra no ambiente sem contato direto.",
    imageUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Rotina em casa",
    kind: "Foto",
    caption: "Registro do setup sugerido para facilitar consistência na rotina do cliente.",
    imageUrl: "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=1200&q=80",
  },
];

export const dogPhotoLibrary: Record<string, string> = {
  Thor: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80",
  Mel: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=900&q=80",
  Pipoca: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=900&q=80",
  Nina: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=900&q=80",
  Apolo: "https://images.unsplash.com/photo-1583512603806-077998240c7a?auto=format&fit=crop&w=900&q=80",
  Luna: "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=900&q=80",
};

export function getDogPhotoUrl(name?: string) {
  if (!name) return dogPhotoLibrary.Thor;
  return dogPhotoLibrary[name] ?? dogPhotoLibrary.Thor;
}

export const recommendedStack = [
  {
    label: "Frontend",
    value: "Next.js + Tailwind",
    detail: "Entrega rápida, SSR, App Router e excelente base para PWA e portal responsivo.",
  },
  {
    label: "Banco e ORM",
    value: "PostgreSQL + Prisma",
    detail: "Estrutura sólida para Trainer, Clients, Dogs, Sessions, Products, Contracts e Payments.",
  },
  {
    label: "Auth",
    value: "NextAuth.js",
    detail: "Login social, email/senha e evolução futura para OTP simples no portal externo.",
  },
  {
    label: "Storage",
    value: "Supabase ou S3",
    detail: "Uploads de fotos, vídeos, PDFs e assets de marca com links seguros.",
  },
  {
    label: "Notificações",
    value: "BullMQ + WhatsApp API",
    detail: "Lembretes de agenda, saúde e cobrança disparados em segundo plano com confiabilidade.",
  },
  {
    label: "Observabilidade",
    value: "Sentry + PostHog",
    detail: "Monitoramento técnico e entendimento de uso real para evoluir o produto sem achismo.",
  },
];

export const mockRoadmap = [
  {
    phase: "MVP",
    timeline: "8 a 10 semanas",
    scope: "Cadastros, treinos, agenda básica e portal externo do cliente com dados essenciais.",
  },
  {
    phase: "V1",
    timeline: "+4 semanas",
    scope: "WhatsApp, PDFs, galeria de mídia e controle manual de pagamentos e contratos.",
  },
  {
    phase: "V2",
    timeline: "+4 semanas",
    scope: "Integração com Google Calendar, notificações automáticas e recursos de redes sociais.",
  },
  {
    phase: "V3",
    timeline: "+6 semanas",
    scope: "Pagamentos integrados via PIX/cartão, ERP básico e expansão multi-adestrador.",
  },
];

export const weekTrigger = [
  {
    week: "1",
    title: "Onboarding guiado e primeiro relatório",
    description: "O adestrador já percebe valor porque sai do setup para uma entrega profissional em poucos minutos.",
  },
  {
    week: "2",
    title: "Cliente acessa o portal e interage",
    description: "Quando o dono do cão usa tarefas, confirmações e relatórios, a plataforma vira parte do serviço prestado.",
  },
  {
    week: "3",
    title: "Gráficos de evolução ajudam a vender progresso",
    description: "Os dados visuais tornam a melhora concreta e estimulam renovação de planos e compartilhamento do resultado.",
  },
  {
    week: "4",
    title: "Cobrança e agenda automatizadas economizam tempo",
    description: "O adestrador passa a depender da plataforma para operar e não só para registrar aulas.",
  },
];

export const pricingPlans = [
  {
    name: "Starter",
    price: "R$ 49/mês",
    audience: "Autônomo em validação",
    summary: "Ideal para quem quer começar com poucos clientes e validar o portal como diferencial competitivo.",
    features: ["Até 5 clientes", "2GB de mídia", "Agenda básica", "Sem WhatsApp"],
    featured: false,
  },
  {
    name: "Pro",
    price: "R$ 99/mês",
    audience: "Operação recorrente",
    summary: "Plano principal para vender ganho de produtividade com portal externo, PDFs e comunicação automatizada.",
    features: ["Clientes ilimitados", "20GB de mídia", "WhatsApp", "PDFs", "Portal completo"],
    featured: true,
  },
  {
    name: "Business",
    price: "R$ 199/mês",
    audience: "Equipe ou franquia",
    summary: "Camada premium para multi-adestrador, ERP, white-label e integrações mais profundas.",
    features: ["Multi-adestrador", "ERP básico", "White-label", "API futura"],
    featured: false,
  },
];