"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type SessionStatus = "Confirmado" | "Pendente" | "Aguardando" | "Recorrente";
type PaymentStatus = "Pago" | "Pendente";
export type UserRole = "admin" | "trainer" | "client";
export type TrainerPlanName = "Starter" | "Pro" | "Business";
export type TrainerPaymentMethod = "Pix" | "Cartao" | "Boleto";
export type TrainerLessonPackage = "4 aulas" | "8 aulas" | "12 aulas";
export type TrainerCardBrand = "Visa" | "Mastercard" | "Elo";
export type ClientPaymentMethod = "Pix" | "Cartao" | "Boleto" | "Dinheiro";

export type DogProfile = {
  id: string;
  name: string;
  breed: string;
  age: string;
  weight: string;
  photoUrl?: string;
  trainingTypes: string[];
};

export type ClientProfile = {
  id: string;
  name: string;
  phone: string;
  propertyType: string;
  environment: string;
  plan: string;
  contractAmount: number;
  billingDay: number;
  paymentMethod: ClientPaymentMethod;
  nextChargeDate: string;
  dogs: DogProfile[];
};

export type TrainingNote = {
  block: string;
  score: number;
  comment: string;
};

export type TrainingSession = {
  id: string;
  number: number;
  date: string;
  title: string;
  clientId?: string;
  clientName?: string;
  dogId?: string;
  dogName?: string;
  notes: TrainingNote[];
};

export type CalendarEvent = {
  id: string;
  day: string;
  time: string;
  dog: string;
  client: string;
  plan: string;
  sessionNumber: number;
  status: SessionStatus;
};

export type PortalTask = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
};

export type PortalFeedback = {
  id: string;
  author: "Tutor" | "Adestrador";
  message: string;
  createdAt: string;
};

export type PaymentItem = {
  id: string;
  clientId?: string;
  clientName: string;
  amount: number;
  status: PaymentStatus;
  source?: "Cliente" | "Assinatura";
  paymentMethod?: ClientPaymentMethod | TrainerPaymentMethod;
  dueDate?: string;
  reference?: string;
};

export type DemoActivity = {
  id: string;
  day: number;
  title: string;
  detail: string;
  kind: "session" | "agenda" | "finance" | "portal";
};

export type TrainerSubscription = {
  planName: TrainerPlanName;
  status: "Ativa" | "Renovacao pendente";
  paymentMethod: TrainerPaymentMethod;
  lessonPackage: TrainerLessonPackage;
  nextChargeDate: string;
  amount: number;
  autoRenew: boolean;
};

export type TrainerPaymentProfile = {
  pixKey: string;
  cardHolder: string;
  cardBrand: TrainerCardBrand;
  cardLast4: string;
  boletoEmail: string;
};

export type TrainerRenewalRecord = {
  id: string;
  date: string;
  planName: TrainerPlanName;
  lessonPackage: TrainerLessonPackage;
  paymentMethod: TrainerPaymentMethod;
  amount: number;
  status: "Gerada" | "Pago";
};

type AppState = {
  hydrated: boolean;
  isAuthenticated: boolean;
  userRole: UserRole;
  trainerName: string;
  trainerEmail: string;
  activePlan: TrainerPlanName;
  trainerSubscription: TrainerSubscription;
  trainerPaymentProfile: TrainerPaymentProfile;
  trainerRenewalHistory: TrainerRenewalRecord[];
  clients: ClientProfile[];
  trainingSessions: TrainingSession[];
  calendarEvents: CalendarEvent[];
  portalTasks: PortalTask[];
  portalFeedbacks: PortalFeedback[];
  payments: PaymentItem[];
  trialActive: boolean;
  trialMaxDays: number;
  simulationDay: number;
  demoActivities: DemoActivity[];
  setHydrated: (value: boolean) => void;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
  setActivePlan: (plan: TrainerPlanName) => void;
  setTrainerSubscriptionPlan: (plan: TrainerPlanName) => void;
  setTrainerPaymentSettings: (payload: {
    paymentMethod: TrainerPaymentMethod;
    lessonPackage: TrainerLessonPackage;
    autoRenew: boolean;
  }) => void;
  setTrainerPaymentProfile: (payload: Partial<TrainerPaymentProfile>) => void;
  renewTrainerSubscription: () => void;
  addClientWithDog: (payload: {
    clientName: string;
    phone: string;
    propertyType: string;
    environment: string;
    plan: string;
    contractAmount: number;
    billingDay: number;
    paymentMethod: ClientPaymentMethod;
    dogName: string;
    breed: string;
    age: string;
    weight: string;
    trainingTypes: string[];
  }) => void;
  addTrainingSession: (payload: {
    number?: number;
    title: string;
    date: string;
    clientId?: string;
    clientName?: string;
    dogId?: string;
    dogName?: string;
    notes: TrainingNote[];
  }) => void;
  toggleTask: (taskId: string) => void;
  addPortalTask: (title: string, description: string) => void;
  addPortalFeedback: (message: string, author?: PortalFeedback["author"]) => void;
  toggleEventStatus: (eventId: string) => void;
  addCalendarEvent: (payload: {
    day: string;
    time: string;
    dog: string;
    client: string;
    plan: string;
    sessionNumber: number;
  }) => void;
  generateClientCharge: (clientId: string) => void;
  markPaymentPaid: (paymentId: string) => void;
  resetDemoData: () => void;
  clearAppData: () => void;
  loadFromDB: () => Promise<void>;
  startTrial: () => void;
  advanceTrialDays: (days: number) => void;
  completeTrial: () => void;
};

function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

const initialClients: ClientProfile[] = [
  {
    id: "client-marina",
    name: "Marina Costa",
    phone: "(11) 99888-1122",
    propertyType: "Apartamento",
    environment:
      "Duas crianças, visitas frequentes e elevador movimentado no período da noite.",
    plan: "Plano Pro • 12 sessões",
    contractAmount: 690,
    billingDay: 10,
    paymentMethod: "Pix",
    nextChargeDate: "10/05/2026",
    dogs: [
      {
        id: "dog-thor",
        name: "Thor",
        breed: "Border Collie",
        age: "2 anos",
        weight: "22 kg",
        photoUrl: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80",
        trainingTypes: ["Reatividade", "Obediência", "Place"],
      },
    ],
  },
  {
    id: "client-carla",
    name: "Carla Nunes",
    phone: "(21) 97777-9910",
    propertyType: "Casa",
    environment: "Quintal amplo, dois gatos e rotina home office.",
    plan: "Visita inicial + 6 sessões",
    contractAmount: 420,
    billingDay: 12,
    paymentMethod: "Cartao",
    nextChargeDate: "12/05/2026",
    dogs: [
      {
        id: "dog-mel",
        name: "Mel",
        breed: "Labrador",
        age: "6 meses",
        weight: "18 kg",
        photoUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=900&q=80",
        trainingTypes: ["Filhotes", "Guia"],
      },
    ],
  },
];

const initialTrainingSessions: TrainingSession[] = [
  {
    id: "session-1",
    number: 1,
    date: "10/03/2026",
    title: "Visita inicial",
    clientId: "client-marina",
    clientName: "Marina Costa",
    dogId: "dog-thor",
    dogName: "Thor",
    notes: [
      {
        block: "Guia",
        score: 6,
        comment: "Puxava muito, respondeu melhor após ajuste de ritmo.",
      },
      {
        block: "Place",
        score: 4,
        comment: "Primeira exposição ao comando, resistência ainda alta.",
      },
    ],
  },
  {
    id: "session-2",
    number: 4,
    date: "25/03/2026",
    title: "Foco em guia",
    clientId: "client-marina",
    clientName: "Marina Costa",
    dogId: "dog-thor",
    dogName: "Thor",
    notes: [
      {
        block: "Guia",
        score: 8,
        comment: "Evolução consistente com menos tração em ambiente externo.",
      },
      {
        block: "Distrações",
        score: 5,
        comment: "Ainda reage em distância curta com outros cães.",
      },
    ],
  },
  {
    id: "session-3",
    number: 2,
    date: "18/03/2026",
    title: "Filhote e autocontrole",
    clientId: "client-carla",
    clientName: "Carla Nunes",
    dogId: "dog-mel",
    dogName: "Mel",
    notes: [
      {
        block: "Guia",
        score: 5,
        comment: "Ainda alterna atenção, mas respondeu bem a trajetos curtos com pausa e reforço.",
      },
      {
        block: "Filhotes",
        score: 7,
        comment: "Boa recuperação quando redirecionada para brinquedo recheável e rotina previsível.",
      },
    ],
  },
];

const initialCalendarEvents: CalendarEvent[] = [
  {
    id: "event-1",
    day: "Segunda",
    time: "09:00",
    dog: "Mel",
    client: "Carla Nunes",
    plan: "Filhotes • caminhada com autocontrole",
    sessionNumber: 3,
    status: "Confirmado",
  },
  {
    id: "event-2",
    day: "Quarta",
    time: "18:30",
    dog: "Thor",
    client: "Marina Costa",
    plan: "Reatividade • rua com estímulos graduais",
    sessionNumber: 6,
    status: "Pendente",
  },
  {
    id: "event-3",
    day: "Sexta",
    time: "14:30",
    dog: "Nina",
    client: "Rafael Prado",
    plan: "Obediência • foco sob distração",
    sessionNumber: 8,
    status: "Aguardando",
  },
];

const initialPortalTasks: PortalTask[] = [
  {
    id: "task-1",
    title: "Praticar place por 10 min",
    description: "Antes do jantar e com reforço intermitente.",
    completed: true,
  },
  {
    id: "task-2",
    title: "Passeio com três pausas de foco",
    description: "Parar, pedir atenção e retomar apenas com guia frouxa.",
    completed: false,
  },
  {
    id: "task-3",
    title: "Receber visita com comando de permanência",
    description: "Entradas em casa sem contato imediato com o cão.",
    completed: false,
  },
];

const initialPortalFeedbacks: PortalFeedback[] = [
  {
    id: "feedback-1",
    author: "Tutor",
    message: "Thor respondeu melhor ao place na sala. Ainda ficou agitado quando o interfone tocou.",
    createdAt: "14/04/2026 • 19:20",
  },
];

const initialPayments: PaymentItem[] = [
  {
    id: "pay-1",
    clientId: "client-marina",
    source: "Cliente",
    clientName: "Marina Costa",
    amount: 690,
    status: "Pendente",
    paymentMethod: "Pix",
    dueDate: "10/04/2026",
    reference: "Plano Pro • 12 sessões",
  },
  {
    id: "pay-2",
    clientId: "client-carla",
    source: "Cliente",
    clientName: "Carla Nunes",
    amount: 420,
    status: "Pago",
    paymentMethod: "Cartao",
    dueDate: "12/04/2026",
    reference: "Visita inicial + 6 sessões",
  },
  {
    id: "pay-3",
    source: "Cliente",
    clientName: "Rafael Prado",
    amount: 490,
    status: "Pendente",
    paymentMethod: "Boleto",
    dueDate: "15/04/2026",
    reference: "Pacote de 8 aulas",
  },
];

function cloneClients(): ClientProfile[] {
  return initialClients.map((client) => ({
    ...client,
    dogs: client.dogs.map((dog) => ({ ...dog })),
  }));
}

function cloneTrainingSessions(): TrainingSession[] {
  return initialTrainingSessions.map((session) => ({
    ...session,
    notes: session.notes.map((note) => ({ ...note })),
  }));
}

function cloneCalendarEvents(): CalendarEvent[] {
  return initialCalendarEvents.map((event) => ({ ...event }));
}

function clonePortalTasks(): PortalTask[] {
  return initialPortalTasks.map((task) => ({ ...task }));
}

function clonePortalFeedbacks(): PortalFeedback[] {
  return initialPortalFeedbacks.map((feedback) => ({ ...feedback }));
}

function clonePayments(): PaymentItem[] {
  return initialPayments.map((payment) => ({ ...payment }));
}

function formatSimulationDate(day: number): string {
  const base = new Date(2026, 3, 1);
  base.setDate(base.getDate() + day - 1);
  return base.toLocaleDateString("pt-BR");
}

function getPlanAmount(plan: TrainerPlanName, lessonPackage: TrainerLessonPackage): number {
  const lessonRate = {
    Starter: 30,
    Pro: 42,
    Business: 55,
  } satisfies Record<TrainerPlanName, number>;
  const packageSize = {
    "4 aulas": 4,
    "8 aulas": 8,
    "12 aulas": 12,
  } satisfies Record<TrainerLessonPackage, number>;
  const packageDiscount = {
    "4 aulas": 1,
    "8 aulas": 0.95,
    "12 aulas": 0.9,
  } satisfies Record<TrainerLessonPackage, number>;

  return Math.round(lessonRate[plan] * packageSize[lessonPackage] * packageDiscount[lessonPackage]);
}

function getNextPackageReviewDate(lessonPackage: TrainerLessonPackage): string {
  const nextDate = new Date(2026, 3, 14);
  const reviewWindow = {
    "4 aulas": 21,
    "8 aulas": 45,
    "12 aulas": 75,
  } satisfies Record<TrainerLessonPackage, number>;

  nextDate.setDate(nextDate.getDate() + reviewWindow[lessonPackage]);

  return nextDate.toLocaleDateString("pt-BR");
}

function getNextClientChargeDate(billingDay: number): string {
  const now = new Date(2026, 3, 14);
  const safeDay = Math.min(Math.max(billingDay, 1), 28);
  const next = new Date(now.getFullYear(), now.getMonth(), safeDay);

  if (next <= now) {
    next.setMonth(next.getMonth() + 1);
  }

  return next.toLocaleDateString("pt-BR");
}

function shiftClientChargeDate(currentDate: string, billingDay: number): string {
  const [day, month, year] = currentDate.split("/").map(Number);
  if (!day || !month || !year) {
    return getNextClientChargeDate(billingDay);
  }

  const next = new Date(year, month - 1, Math.min(Math.max(billingDay, 1), 28));
  next.setMonth(next.getMonth() + 1);
  return next.toLocaleDateString("pt-BR");
}

function createSimulationActivity(day: number): DemoActivity {
  if (day % 7 === 0) {
    return {
      id: createId("activity"),
      day,
      title: "Pacote revisado",
      detail: "Um pacote de aulas foi renovado e a previsao financeira do adestrador foi atualizada.",
      kind: "finance",
    };
  }

  if (day % 3 === 0) {
    return {
      id: createId("activity"),
      day,
      title: "Sessao registrada",
      detail: "Novo registro tecnico com notas por bloco e plano sugerido para a proxima aula.",
      kind: "session",
    };
  }

  if (day % 2 === 0) {
    return {
      id: createId("activity"),
      day,
      title: "Agenda atualizada",
      detail: "Um novo atendimento entrou na semana e foi marcado como aguardando confirmacao.",
      kind: "agenda",
    };
  }

  return {
    id: createId("activity"),
    day,
    title: "Portal do tutor acessado",
    detail: "Tutor visualizou tarefa e relatorio, aumentando aderencia ao plano de treino.",
    kind: "portal",
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      hydrated: false,
      isAuthenticated: false,
      userRole: "trainer",
      trainerName: "",
      trainerEmail: "",
      activePlan: "Pro",
      trainerSubscription: {
        planName: "Pro",
        status: "Ativa",
        paymentMethod: "Pix",
        lessonPackage: "8 aulas",
        nextChargeDate: getNextPackageReviewDate("8 aulas"),
        amount: getPlanAmount("Pro", "8 aulas"),
        autoRenew: true,
      },
      trainerPaymentProfile: {
        pixKey: "adestrador@pegadacerta.com.br",
        cardHolder: "Marina Costa",
        cardBrand: "Visa",
        cardLast4: "4456",
        boletoEmail: "adestrador@pegadacerta.com.br",
      },
      trainerRenewalHistory: [
        {
          id: "renewal-1",
          date: "14/03/2026",
          planName: "Pro",
          lessonPackage: "8 aulas",
          paymentMethod: "Pix",
          amount: getPlanAmount("Pro", "8 aulas"),
          status: "Pago",
        },
      ],
      clients: [],
      trainingSessions: [],
      calendarEvents: [],
      portalTasks: [],
      portalFeedbacks: [],
      payments: [],
      trialActive: false,
      trialMaxDays: 30,
      simulationDay: 1,
      demoActivities: [],
      setHydrated: (value) => set({ hydrated: value }),
      login: (email, role) => {
        const trainer = email.split("@")[0] || "Adestrador";
        const trainerName = trainer
          .split(/[._-]/)
          .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
          .join(" ");

        set({
          isAuthenticated: true,
          userRole: role,
          trainerEmail: email,
          trainerName,
        });
      },
      logout: () =>
        set({
          isAuthenticated: false,
          userRole: "trainer",
          trainerName: "",
          trainerEmail: "",
        }),
      setActivePlan: (plan) => set({ activePlan: plan }),
      setTrainerSubscriptionPlan: (plan) =>
        set((state) => ({
          activePlan: plan,
          trainerSubscription: {
            ...state.trainerSubscription,
            planName: plan,
            amount: getPlanAmount(plan, state.trainerSubscription.lessonPackage),
            status: "Ativa",
          },
        })),
      setTrainerPaymentSettings: ({ paymentMethod, lessonPackage, autoRenew }) =>
        set((state) => ({
          trainerSubscription: {
            ...state.trainerSubscription,
            paymentMethod,
            lessonPackage,
            autoRenew,
            amount: getPlanAmount(state.trainerSubscription.planName, lessonPackage),
            nextChargeDate: getNextPackageReviewDate(lessonPackage),
          },
        })),
      setTrainerPaymentProfile: (payload) =>
        set((state) => ({
          trainerPaymentProfile: {
            ...state.trainerPaymentProfile,
            ...payload,
          },
        })),
      renewTrainerSubscription: () =>
        set((state) => ({
          trainerSubscription: {
            ...state.trainerSubscription,
            status: "Ativa",
            nextChargeDate: getNextPackageReviewDate(state.trainerSubscription.lessonPackage),
          },
          payments: [
            {
              id: createId("pay"),
              clientName: `Assinatura ${state.trainerSubscription.planName}`,
              amount: state.trainerSubscription.amount,
              status: "Pendente",
              source: "Assinatura",
              paymentMethod: state.trainerSubscription.paymentMethod,
              dueDate: state.trainerSubscription.nextChargeDate,
              reference: `${state.trainerSubscription.planName} • ${state.trainerSubscription.lessonPackage}`,
            },
            ...state.payments,
          ],
          trainerRenewalHistory: [
            {
              id: createId("renewal"),
              date: new Date().toLocaleDateString("pt-BR"),
              planName: state.trainerSubscription.planName,
              lessonPackage: state.trainerSubscription.lessonPackage,
              paymentMethod: state.trainerSubscription.paymentMethod,
              amount: state.trainerSubscription.amount,
              status: "Gerada" as const,
            },
            ...state.trainerRenewalHistory,
          ].slice(0, 20),
        })),
      addClientWithDog: (payload) =>
        set((state) => {
          const newClientId = createId("client");
          const nextChargeDate = getNextClientChargeDate(payload.billingDay);

          return {
            clients: [
              {
                id: newClientId,
              name: payload.clientName,
              phone: payload.phone,
              propertyType: payload.propertyType,
              environment: payload.environment,
              plan: payload.plan,
              contractAmount: payload.contractAmount,
              billingDay: payload.billingDay,
              paymentMethod: payload.paymentMethod,
              nextChargeDate,
              dogs: [
                {
                  id: createId("dog"),
                  name: payload.dogName,
                  breed: payload.breed,
                  age: payload.age,
                  weight: payload.weight,
                  photoUrl: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=900&q=80",
                  trainingTypes: payload.trainingTypes,
                },
              ],
            },
            ...state.clients,
          ],
          payments: [
            {
              id: createId("pay"),
              clientId: newClientId,
              source: "Cliente",
              clientName: payload.clientName,
              amount: payload.contractAmount,
              status: "Pendente",
              paymentMethod: payload.paymentMethod,
              dueDate: nextChargeDate,
              reference: payload.plan,
            },
            ...state.payments,
          ],
          };
        }),
      addTrainingSession: (payload) =>
        set((state) => ({
          trainingSessions: [
            {
              id: createId("session"),
              number: payload.number ?? state.trainingSessions.length + 1,
              date: payload.date,
              title: payload.title,
              clientId: payload.clientId,
              clientName: payload.clientName,
              dogId: payload.dogId,
              dogName: payload.dogName,
              notes: payload.notes,
            },
            ...state.trainingSessions,
          ],
        })),
      toggleTask: (taskId) =>
        set((state) => ({
          portalTasks: state.portalTasks.map((task) =>
            task.id === taskId ? { ...task, completed: !task.completed } : task,
          ),
        })),
      addPortalTask: (title, description) =>
        set((state) => ({
          portalTasks: [
            ...state.portalTasks,
            {
              id: createId("task"),
              title: title.trim(),
              description: description.trim(),
              completed: false,
            },
          ],
        })),
      addPortalFeedback: (message, author = "Tutor") =>
        set((state) => ({
          portalFeedbacks: [
            {
              id: createId("feedback"),
              author,
              message: message.trim(),
              createdAt:
                new Date().toLocaleDateString("pt-BR") +
                " • " +
                new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
            },
            ...state.portalFeedbacks,
          ].slice(0, 20),
        })),
      toggleEventStatus: (eventId) =>
        set((state) => ({
          calendarEvents: state.calendarEvents.map((event) =>
            event.id === eventId
              ? {
                  ...event,
                  status:
                    event.status === "Aguardando"
                      ? "Confirmado"
                      : event.status === "Confirmado"
                      ? "Pendente"
                      : "Aguardando",
                }
              : event,
          ),
        })),
      addCalendarEvent: (payload) =>
        set((state) => ({
          calendarEvents: [
            {
              id: createId("event"),
              day: payload.day,
              time: payload.time,
              dog: payload.dog,
              client: payload.client,
              plan: payload.plan,
              sessionNumber: payload.sessionNumber,
              status: "Aguardando",
            },
            ...state.calendarEvents,
          ],
        })),
      generateClientCharge: (clientId) =>
        set((state) => {
          const client = state.clients.find((item) => item.id === clientId);
          if (!client) return state;

          const safeBillingDay = client.billingDay ?? 10;
          const safeContractAmount = client.contractAmount ?? 0;
          const safePaymentMethod = client.paymentMethod ?? "Pix";
          const safeNextChargeDate = client.nextChargeDate ?? getNextClientChargeDate(safeBillingDay);

          const hasPendingForCurrentDueDate = state.payments.some(
            (payment) =>
              payment.source === "Cliente" &&
              payment.clientId === client.id &&
              payment.status === "Pendente" &&
              payment.dueDate === safeNextChargeDate,
          );

          if (hasPendingForCurrentDueDate) {
            return state;
          }

          const nextClientDate = shiftClientChargeDate(safeNextChargeDate, safeBillingDay);

          return {
            clients: state.clients.map((item) =>
              item.id === client.id
                ? {
                    ...item,
                    nextChargeDate: nextClientDate,
                    billingDay: safeBillingDay,
                    contractAmount: safeContractAmount,
                    paymentMethod: safePaymentMethod,
                  }
                : item,
            ),
            payments: [
              {
                id: createId("pay"),
                clientId: client.id,
                source: "Cliente",
                clientName: client.name,
                amount: safeContractAmount,
                status: "Pendente",
                paymentMethod: safePaymentMethod,
                dueDate: safeNextChargeDate,
                reference: client.plan,
              },
              ...state.payments,
            ],
          };
        }),
      markPaymentPaid: (paymentId) =>
        set((state) => {
          const targetPayment = state.payments.find((item) => item.id === paymentId);
          if (!targetPayment || targetPayment.status === "Pago") {
            return state;
          }

          let nextClients = state.clients;
          let nextPayments = state.payments.map((payment) =>
            payment.id === paymentId ? { ...payment, status: "Pago" as const } : payment,
          );

          if (targetPayment.source === "Cliente" && targetPayment.clientId) {
            const client = state.clients.find((item) => item.id === targetPayment.clientId);

            if (client) {
              const safeBillingDay = client.billingDay ?? 10;
              const safeContractAmount = client.contractAmount ?? targetPayment.amount ?? 0;
              const safePaymentMethod = client.paymentMethod ?? "Pix";
              const safeNextChargeDate = client.nextChargeDate ?? getNextClientChargeDate(safeBillingDay);

              const nextClientDate = shiftClientChargeDate(safeNextChargeDate, safeBillingDay);
              nextClients = state.clients.map((item) =>
                item.id === client.id
                  ? {
                      ...item,
                      nextChargeDate: nextClientDate,
                      billingDay: safeBillingDay,
                      contractAmount: safeContractAmount,
                      paymentMethod: safePaymentMethod,
                    }
                  : item,
              );

              const hasPendingNext = nextPayments.some(
                (payment) =>
                  payment.source === "Cliente" &&
                  payment.clientId === client.id &&
                  payment.status === "Pendente" &&
                  payment.dueDate === nextClientDate,
              );

              if (!hasPendingNext) {
                nextPayments = [
                  {
                    id: createId("pay"),
                    clientId: client.id,
                    source: "Cliente",
                    clientName: client.name,
                    amount: safeContractAmount,
                    status: "Pendente",
                    paymentMethod: safePaymentMethod,
                    dueDate: nextClientDate,
                    reference: client.plan,
                  },
                  ...nextPayments,
                ];
              }
            }
          }

          return {
            clients: nextClients,
            payments: nextPayments,
          };
        }),
      resetDemoData: () =>
        set((state) => ({
          clients: cloneClients(),
          trainingSessions: cloneTrainingSessions(),
          calendarEvents: cloneCalendarEvents(),
          portalTasks: clonePortalTasks(),
          portalFeedbacks: clonePortalFeedbacks(),
          payments: clonePayments(),
          activePlan: "Pro",
          trainerSubscription: {
            planName: "Pro",
            status: "Ativa",
            paymentMethod: "Pix",
            lessonPackage: "8 aulas",
            nextChargeDate: getNextPackageReviewDate("8 aulas"),
            amount: getPlanAmount("Pro", "8 aulas"),
            autoRenew: true,
          },
          trainerPaymentProfile: {
            pixKey: "adestrador@pegadacerta.com.br",
            cardHolder: "Marina Costa",
            cardBrand: "Visa",
            cardLast4: "4456",
            boletoEmail: "adestrador@pegadacerta.com.br",
          },
          trainerRenewalHistory: [
            {
              id: "renewal-1",
              date: "14/03/2026",
              planName: "Pro",
              lessonPackage: "8 aulas",
              paymentMethod: "Pix",
              amount: getPlanAmount("Pro", "8 aulas"),
              status: "Pago",
            },
          ],
          trialActive: true,
          trialMaxDays: 30,
          simulationDay: 1,
          demoActivities: [
            {
              id: "activity-day-1",
              day: 1,
              title: "Trial reiniciado",
              detail: "Dados restaurados para uma nova rodada de demonstracao.",
              kind: "portal" as const,
            },
          ],
          userRole: state.userRole,
          isAuthenticated: state.isAuthenticated,
          trainerName: state.trainerName,
          trainerEmail: state.trainerEmail,
        })),
      clearAppData: () =>
        set({
          clients: [],
          trainingSessions: [],
          calendarEvents: [],
          portalTasks: [],
          portalFeedbacks: [],
          payments: [],
          demoActivities: [],
        }),
      loadFromDB: async () => {
        try {
          const [clientsRes, sessionsRes, eventsRes, paymentsRes] = await Promise.all([
            fetch("/api/clients"),
            fetch("/api/sessions"),
            fetch("/api/events"),
            fetch("/api/payments"),
          ]);

          if (!clientsRes.ok || !sessionsRes.ok || !eventsRes.ok || !paymentsRes.ok) return;

          const [rawClients, rawSessions, rawEvents, rawPayments] = await Promise.all([
            clientsRes.json(),
            sessionsRes.json(),
            eventsRes.json(),
            paymentsRes.json(),
          ]);

          const clients: ClientProfile[] = (rawClients as Array<Record<string, unknown>>).map((c) => ({
            id:             String(c.id),
            name:           String(c.name),
            phone:          String(c.phone ?? ""),
            propertyType:   String(c.propertyType ?? ""),
            environment:    String(c.environment ?? ""),
            plan:           String(c.plan ?? ""),
            contractAmount: Number(c.contractAmount ?? 0),
            billingDay:     Number(c.billingDay ?? 10),
            paymentMethod:  (c.paymentMethod ?? "Pix") as ClientPaymentMethod,
            nextChargeDate: String(c.nextChargeDate ?? ""),
            dogs: ((c.dogs as Array<Record<string, unknown>>) ?? []).map((d) => ({
              id:            String(d.id),
              name:          String(d.name),
              breed:         String(d.breed ?? ""),
              age:           String(d.age ?? ""),
              weight:        String(d.weight ?? ""),
              photoUrl:      d.photoUrl ? String(d.photoUrl) : undefined,
              trainingTypes: (() => {
                try { return JSON.parse(String(d.trainingTypes ?? "[]")); }
                catch { return []; }
              })(),
            })),
          }));

          const trainingSessions: TrainingSession[] = (rawSessions as Array<Record<string, unknown>>).map((s) => ({
            id:         String(s.id),
            number:     Number(s.number ?? 1),
            date:       String(s.date),
            title:      String(s.title),
            clientId:   s.clientId ? String(s.clientId) : undefined,
            clientName: String(s.clientName ?? ""),
            dogId:      s.dogId ? String(s.dogId) : undefined,
            dogName:    String(s.dogName ?? ""),
            notes:      Array.isArray(s.notes) ? (s.notes as TrainingNote[]) : [],
          }));

          const calendarEvents: CalendarEvent[] = (rawEvents as Array<Record<string, unknown>>).map((e) => ({
            id:            String(e.id),
            day:           String(e.day),
            time:          String(e.time),
            dog:           String(e.dog),
            client:        String(e.client),
            plan:          String(e.plan ?? ""),
            sessionNumber: Number(e.sessionNumber ?? 1),
            status:        (e.status ?? "Confirmado") as "Confirmado" | "Pendente" | "Aguardando" | "Recorrente",
          }));

          const payments: PaymentItem[] = (rawPayments as Array<Record<string, unknown>>).map((p) => ({
            id:            String(p.id),
            clientId:      p.clientId ? String(p.clientId) : undefined,
            clientName:    String(p.clientName),
            amount:        Number(p.amount ?? 0),
            status:        (p.status ?? "Pendente") as "Pago" | "Pendente",
            source:        (p.source ?? "Cliente") as "Cliente" | "Assinatura",
            paymentMethod: p.paymentMethod as ClientPaymentMethod | undefined,
            dueDate:       p.dueDate ? String(p.dueDate) : undefined,
            reference:     p.reference ? String(p.reference) : undefined,
          }));

          set({ clients, trainingSessions, calendarEvents, payments });
        } catch {
          // silently fail — store keeps current state
        }
      },
      startTrial: () =>
        set((state) => ({
          trialActive: true,
          trialMaxDays: 30,
          simulationDay: 1,
          demoActivities: [
            {
              id: createId("activity"),
              day: 1,
              title: "Trial de 30 dias ativado",
              detail: "A simulacao comecou no Dia 1 e sera alimentada conforme o uso.",
              kind: "portal" as const,
            },
            ...state.demoActivities,
          ].slice(0, 40),
        })),
      advanceTrialDays: (days) =>
        set((state) => {
          if (!state.trialActive || days <= 0) {
            return state;
          }

          let nextDay = state.simulationDay;
          const nextTrainingSessions = [...state.trainingSessions];
          const nextCalendarEvents = [...state.calendarEvents];
          const nextPayments = [...state.payments];
          const nextActivities = [...state.demoActivities];

          for (let index = 0; index < days; index += 1) {
            if (nextDay >= state.trialMaxDays) {
              break;
            }

            nextDay += 1;
            const leadClient = state.clients[0];
            const leadDog = leadClient?.dogs[0];
            const sessionCountByDog = nextTrainingSessions.filter((item) => item.dogId === leadDog?.id).length;

            if (nextDay % 3 === 0 && leadClient && leadDog) {
              nextTrainingSessions.unshift({
                id: createId("session"),
                number: sessionCountByDog + 1,
                date: formatSimulationDate(nextDay),
                title: `Sessao simulada Dia ${nextDay}`,
                clientId: leadClient.id,
                clientName: leadClient.name,
                dogId: leadDog.id,
                dogName: leadDog.name,
                notes: [
                  {
                    block: "Guia",
                    score: 6 + (nextDay % 4),
                    comment: "Evolucao gradual registrada automaticamente para simulacao de trial.",
                  },
                ],
              });
            }

            if (nextDay % 2 === 0 && leadClient && leadDog) {
              nextCalendarEvents.unshift({
                id: createId("event"),
                day: "Segunda",
                time: "17:30",
                dog: leadDog.name,
                client: leadClient.name,
                plan: `Treino orientado pela IA • Dia ${nextDay}`,
                sessionNumber: sessionCountByDog + 1,
                status: "Aguardando",
              });
            }

            if (nextDay % 7 === 0) {
              const pending = nextPayments.find((payment) => payment.status === "Pendente");
              if (pending) {
                pending.status = "Pago";
              }

              nextPayments.unshift({
                id: createId("pay"),
                clientName: leadClient?.name ?? "Conta simulada",
                amount: 490,
                status: "Pendente",
              });
            }

            nextActivities.unshift(createSimulationActivity(nextDay));
          }

          return {
            simulationDay: nextDay,
            trialActive: nextDay < state.trialMaxDays,
            trainingSessions: nextTrainingSessions,
            calendarEvents: nextCalendarEvents,
            payments: nextPayments,
            demoActivities: nextActivities.slice(0, 60),
          };
        }),
      completeTrial: () => set((state) => ({
        simulationDay: state.trialMaxDays,
        trialActive: false,
        demoActivities: [
          {
            id: createId("activity"),
            day: state.trialMaxDays,
            title: "Trial concluido",
            detail: "Ciclo de 30 dias finalizado com dados completos para analise de valor do produto.",
            kind: "finance" as const,
          },
          ...state.demoActivities,
        ].slice(0, 60),
      })),
    }),
    {
      name: "pegadacerta-store",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        userRole: state.userRole,
        trainerName: state.trainerName,
        trainerEmail: state.trainerEmail,
        activePlan: state.activePlan,
        trainerSubscription: state.trainerSubscription,
        trainerPaymentProfile: state.trainerPaymentProfile,
        trainerRenewalHistory: state.trainerRenewalHistory,
        clients: state.clients,
        trainingSessions: state.trainingSessions,
        calendarEvents: state.calendarEvents,
        portalTasks: state.portalTasks,
        portalFeedbacks: state.portalFeedbacks,
        payments: state.payments,
        trialActive: state.trialActive,
        trialMaxDays: state.trialMaxDays,
        simulationDay: state.simulationDay,
        demoActivities: state.demoActivities,
      }),
      version: 3,
      migrate: () => ({
        hydrated: false,
        isAuthenticated: false,
        userRole: "trainer" as const,
        trainerName: "",
        trainerEmail: "",
        activePlan: "Pro" as const,
        trainerSubscription: {
          planName: "Pro" as const,
          status: "Ativa" as const,
          paymentMethod: "Pix" as const,
          lessonPackage: "8 aulas" as const,
          nextChargeDate: "",
          amount: 0,
          autoRenew: true,
        },
        trainerPaymentProfile: {
          pixKey: "",
          cardHolder: "",
          cardBrand: "Visa" as const,
          cardLast4: "",
          boletoEmail: "",
        },
        trainerRenewalHistory: [],
        clients: [],
        trainingSessions: [],
        calendarEvents: [],
        portalTasks: [],
        portalFeedbacks: [],
        payments: [],
        trialActive: false,
        trialMaxDays: 30,
        simulationDay: 1,
        demoActivities: [],
      }),
    },
  ),
);