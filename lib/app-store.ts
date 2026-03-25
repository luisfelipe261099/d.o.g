"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type SessionStatus = "Confirmado" | "Pendente" | "Aguardando" | "Recorrente";
type PaymentStatus = "Pago" | "Pendente";
export type UserRole = "admin" | "trainer" | "client";

export type DogProfile = {
  id: string;
  name: string;
  breed: string;
  age: string;
  weight: string;
  trainingTypes: string[];
};

export type ClientProfile = {
  id: string;
  name: string;
  phone: string;
  propertyType: string;
  environment: string;
  plan: string;
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

export type PaymentItem = {
  id: string;
  clientName: string;
  amount: number;
  status: PaymentStatus;
};

type AppState = {
  hydrated: boolean;
  isAuthenticated: boolean;
  userRole: UserRole;
  trainerName: string;
  trainerEmail: string;
  activePlan: "Starter" | "Pro" | "Business";
  clients: ClientProfile[];
  trainingSessions: TrainingSession[];
  calendarEvents: CalendarEvent[];
  portalTasks: PortalTask[];
  payments: PaymentItem[];
  setHydrated: (value: boolean) => void;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
  setActivePlan: (plan: "Starter" | "Pro" | "Business") => void;
  addClientWithDog: (payload: {
    clientName: string;
    phone: string;
    propertyType: string;
    environment: string;
    plan: string;
    dogName: string;
    breed: string;
    age: string;
    weight: string;
    trainingTypes: string[];
  }) => void;
  addTrainingSession: (payload: {
    title: string;
    date: string;
    block: string;
    score: number;
    comment: string;
  }) => void;
  toggleTask: (taskId: string) => void;
  toggleEventStatus: (eventId: string) => void;
  addCalendarEvent: (payload: {
    day: string;
    time: string;
    dog: string;
    client: string;
    plan: string;
    sessionNumber: number;
  }) => void;
  markPaymentPaid: (paymentId: string) => void;
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
    dogs: [
      {
        id: "dog-thor",
        name: "Thor",
        breed: "Border Collie",
        age: "2 anos",
        weight: "22 kg",
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
    dogs: [
      {
        id: "dog-mel",
        name: "Mel",
        breed: "Labrador",
        age: "6 meses",
        weight: "18 kg",
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

const initialPayments: PaymentItem[] = [
  { id: "pay-1", clientName: "Marina Costa", amount: 690, status: "Pendente" },
  { id: "pay-2", clientName: "Carla Nunes", amount: 420, status: "Pago" },
  { id: "pay-3", clientName: "Rafael Prado", amount: 490, status: "Pendente" },
];

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      hydrated: false,
      isAuthenticated: false,
      userRole: "trainer",
      trainerName: "",
      trainerEmail: "",
      activePlan: "Pro",
      clients: initialClients,
      trainingSessions: initialTrainingSessions,
      calendarEvents: initialCalendarEvents,
      portalTasks: initialPortalTasks,
      payments: initialPayments,
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
      addClientWithDog: (payload) =>
        set((state) => ({
          clients: [
            {
              id: createId("client"),
              name: payload.clientName,
              phone: payload.phone,
              propertyType: payload.propertyType,
              environment: payload.environment,
              plan: payload.plan,
              dogs: [
                {
                  id: createId("dog"),
                  name: payload.dogName,
                  breed: payload.breed,
                  age: payload.age,
                  weight: payload.weight,
                  trainingTypes: payload.trainingTypes,
                },
              ],
            },
            ...state.clients,
          ],
        })),
      addTrainingSession: (payload) =>
        set((state) => ({
          trainingSessions: [
            {
              id: createId("session"),
              number: state.trainingSessions.length + 1,
              date: payload.date,
              title: payload.title,
              notes: [
                {
                  block: payload.block,
                  score: payload.score,
                  comment: payload.comment,
                },
              ],
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
      toggleEventStatus: (eventId) =>
        set((state) => ({
          calendarEvents: state.calendarEvents.map((event) =>
            event.id === eventId
              ? {
                  ...event,
                  status: event.status === "Confirmado" ? "Pendente" : "Confirmado",
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
      markPaymentPaid: (paymentId) =>
        set((state) => ({
          payments: state.payments.map((payment) =>
            payment.id === paymentId ? { ...payment, status: "Pago" } : payment,
          ),
        })),
    }),
    {
      name: "dog-platform-store",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        userRole: state.userRole,
        trainerName: state.trainerName,
        trainerEmail: state.trainerEmail,
        activePlan: state.activePlan,
        clients: state.clients,
        trainingSessions: state.trainingSessions,
        calendarEvents: state.calendarEvents,
        portalTasks: state.portalTasks,
        payments: state.payments,
      }),
    },
  ),
);