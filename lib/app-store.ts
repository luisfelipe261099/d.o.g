"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type SessionStatus = "Confirmado" | "Pendente" | "Aguardando" | "Recorrente" | "Cancelado";
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

export type TrainingMediaItem = {
  id: string;
  dataUrl: string;
  thumbDataUrl?: string;
  width: number;
  height: number;
  sizeKb: number;
  mainSizeKb?: number;
  thumbSizeKb?: number;
  createdAt: string;
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
  media: TrainingMediaItem[];
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
  clientId?: string;
  title: string;
  description: string;
  completed: boolean;
};

export type PortalFeedback = {
  id: string;
  clientId?: string;
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
  setTrainerSubscriptionPlan: (plan: TrainerPlanName) => Promise<boolean>;
  setTrainerPaymentSettings: (payload: {
    paymentMethod: TrainerPaymentMethod;
    lessonPackage: TrainerLessonPackage;
    autoRenew: boolean;
  }) => void;
  setTrainerPaymentProfile: (payload: Partial<TrainerPaymentProfile>) => void;
  renewTrainerSubscription: () => Promise<boolean>;
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
  }) => Promise<boolean>;
  addTrainingSession: (payload: {
    number?: number;
    title: string;
    date: string;
    clientId?: string;
    clientName?: string;
    dogId?: string;
    dogName?: string;
    notes: TrainingNote[];
    media?: TrainingMediaItem[];
  }) => Promise<boolean>;
  toggleTask: (taskId: string) => void;
  addPortalTask: (title: string, description: string, clientId?: string) => Promise<void>;
  addPortalFeedback: (message: string, author?: PortalFeedback["author"], clientId?: string) => Promise<void>;
  setEventStatus: (eventId: string, status: SessionStatus) => Promise<boolean>;
  toggleEventStatus: (eventId: string) => void;
  addCalendarEvent: (payload: {
    day: string;
    time: string;
    dog: string;
    client: string;
    plan: string;
    sessionNumber: number;
    status?: SessionStatus;
  }) => Promise<boolean>;
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

const initialClients: ClientProfile[] = [];

const initialTrainingSessions: TrainingSession[] = [];

const initialCalendarEvents: CalendarEvent[] = [];

const initialPortalTasks: PortalTask[] = [];

const initialPortalFeedbacks: PortalFeedback[] = [];

const initialPayments: PaymentItem[] = [];

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
    media: session.media.map((item) => ({ ...item })),
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

function mapDbPlanToSubscriptionPlan(dbPlan?: string): TrainerPlanName {
  const normalized = (dbPlan ?? "").trim().toLowerCase();

  if (normalized === "pro") return "Pro";
  if (normalized === "premium" || normalized === "business") return "Business";
  if (normalized === "trial" || normalized === "essencial" || normalized === "starter") return "Starter";

  return "Pro";
}

function mapSubscriptionPlanToDbPlan(plan: TrainerPlanName): "Trial" | "Pro" | "Premium" {
  if (plan === "Business") return "Premium";
  if (plan === "Starter") return "Trial";
  return "Pro";
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

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
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
        pixKey: "",
        cardHolder: "",
        cardBrand: "Visa",
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
      setTrainerSubscriptionPlan: async (plan) => {
        try {
          const response = await fetch("/api/trainer/plan", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ plan: mapSubscriptionPlanToDbPlan(plan) }),
          });

          if (!response.ok) return false;
        } catch {
          return false;
        }

        set((state) => ({
          activePlan: plan,
          trainerSubscription: {
            ...state.trainerSubscription,
            planName: plan,
            amount: getPlanAmount(plan, state.trainerSubscription.lessonPackage),
            status: "Ativa",
          },
        }));
        return true;
      },
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
      renewTrainerSubscription: async () => {
        const { trainerSubscription } = get();
        try {
          const response = await fetch("/api/payments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              clientName: `Assinatura ${trainerSubscription.planName}`,
              amount: trainerSubscription.amount,
              source: "Assinatura",
              paymentMethod: trainerSubscription.paymentMethod,
              dueDate: trainerSubscription.nextChargeDate,
              reference: `${trainerSubscription.planName} \u2022 ${trainerSubscription.lessonPackage}`,
            }),
          });
          if (!response.ok) return false;
        } catch {
          return false;
        }

        set((state) => ({
          trainerSubscription: {
            ...state.trainerSubscription,
            status: "Ativa",
            nextChargeDate: getNextPackageReviewDate(state.trainerSubscription.lessonPackage),
          },
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
        }));

        await get().loadFromDB();
        return true;
      },
      addClientWithDog: async (payload) => {
        try {
          const response = await fetch("/api/clients", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!response.ok) return false;
          await get().loadFromDB();
          return true;
        } catch {
          return false;
        }
      },
      addTrainingSession: async (payload) => {
        try {
          const response = await fetch("/api/sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!response.ok) return false;
          await get().loadFromDB();
          return true;
        } catch {
          return false;
        }
      },
      toggleTask: async (taskId) => {
        const current = get().portalTasks.find((t) => t.id === taskId);
        if (!current) return;
        // Optimistic update
        set((state) => ({
          portalTasks: state.portalTasks.map((task) =>
            task.id === taskId ? { ...task, completed: !task.completed } : task,
          ),
        }));
        try {
          await fetch("/api/portal-tasks", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: taskId, completed: !current.completed }),
          });
        } catch {
          // keep optimistic state
        }
      },
      addPortalTask: async (title, description, clientId) => {
        const tempId = createId("task");
        const tempTask: PortalTask = { id: tempId, clientId, title, description, completed: false };

        // Optimistic add
        set((state) => ({ portalTasks: [...state.portalTasks, tempTask] }));

        try {
          const response = await fetch("/api/portal-tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, description, clientId }),
          });
          if (!response.ok) {
            set((state) => ({ portalTasks: state.portalTasks.filter((t) => t.id !== tempId) }));
            return;
          }
          await get().loadFromDB();
        } catch {
          set((state) => ({ portalTasks: state.portalTasks.filter((t) => t.id !== tempId) }));
        }
      },
      addPortalFeedback: async (message, author = "Tutor", clientId) => {
        const tempId = createId("fb");
        const tempFeedback: PortalFeedback = {
          id: tempId,
          clientId,
          author,
          message,
          createdAt: new Date().toISOString(),
        };

        // Optimistic add
        set((state) => ({ portalFeedbacks: [...state.portalFeedbacks, tempFeedback] }));

        try {
          const response = await fetch("/api/portal-feedbacks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message, author, clientId }),
          });
          if (!response.ok) {
            set((state) => ({ portalFeedbacks: state.portalFeedbacks.filter((f) => f.id !== tempId) }));
            return;
          }
          await get().loadFromDB();
        } catch {
          set((state) => ({ portalFeedbacks: state.portalFeedbacks.filter((f) => f.id !== tempId) }));
        }
      },
      setEventStatus: async (eventId, status) => {
        const currentEvent = get().calendarEvents.find((event) => event.id === eventId);
        if (!currentEvent) return false;

        // Optimistic update — reflects immediately in UI
        set((state) => ({
          calendarEvents: state.calendarEvents.map((event) =>
            event.id === eventId ? { ...event, status } : event,
          ),
        }));

        try {
          const response = await fetch("/api/events", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: eventId, status }),
          });

          if (!response.ok) {
            return false;
          }

          const body = await response.json() as { ok?: boolean };
          if (body.ok === false) return false;
          return true;
        } catch {
          return false;
        }
      },
      toggleEventStatus: async (eventId) => {
        const currentEvent = get().calendarEvents.find((event) => event.id === eventId);
        if (!currentEvent) return;

        const nextStatus =
          currentEvent.status === "Confirmado"
            ? "Pendente"
            : currentEvent.status === "Pendente"
            ? "Cancelado"
            : "Confirmado";

        await get().setEventStatus(eventId, nextStatus);
      },
      addCalendarEvent: async (payload) => {
        const tempId = createId("evt");
        const tempEvent: CalendarEvent = {
          id:            tempId,
          day:           payload.day,
          time:          payload.time,
          dog:           payload.dog,
          client:        payload.client,
          plan:          payload.plan,
          sessionNumber: payload.sessionNumber,
          status:        payload.status ?? "Pendente",
        };

        // Optimistic add — shows immediately in the list
        set((state) => ({
          calendarEvents: [tempEvent, ...state.calendarEvents],
        }));

        try {
          const response = await fetch("/api/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            return false;
          }

          const created = await response.json() as {
            id: string;
            day: string;
            time: string;
            dog: string;
            client: string;
            plan?: string;
            sessionNumber?: number;
            status?: SessionStatus;
          };

          // Replace temp with server event without full store reload.
          set((state) => ({
            calendarEvents: state.calendarEvents.map((event) =>
              event.id === tempId
                ? {
                    id: created.id,
                    day: created.day,
                    time: created.time,
                    dog: created.dog,
                    client: created.client,
                    plan: created.plan ?? "",
                    sessionNumber: Number(created.sessionNumber ?? payload.sessionNumber),
                    status: (created.status ?? payload.status ?? "Pendente") as SessionStatus,
                  }
                : event,
            ),
          }));
          return true;
        } catch {
          return false;
        }
      },
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
            pixKey: "",
            cardHolder: "",
            cardBrand: "Visa",
            cardLast4: "",
            boletoEmail: "",
          },
          trainerRenewalHistory: [],
          trialActive: false,
          trialMaxDays: 30,
          simulationDay: 1,
          demoActivities: [],
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
          const [meRes, clientsRes, sessionsRes, eventsRes, paymentsRes, tasksRes, feedbacksRes] = await Promise.all([
            fetch("/api/me", { cache: "no-store" }),
            fetch("/api/clients", { cache: "no-store" }),
            fetch("/api/sessions", { cache: "no-store" }),
            fetch("/api/events", { cache: "no-store" }),
            fetch("/api/payments", { cache: "no-store" }),
            fetch("/api/portal-tasks", { cache: "no-store" }),
            fetch("/api/portal-feedbacks", { cache: "no-store" }),
          ]);

          if (!clientsRes.ok || !sessionsRes.ok || !eventsRes.ok || !paymentsRes.ok) return;

          const [rawMe, rawClients, rawSessions, rawEvents, rawPayments, rawTasks, rawFeedbacks] = await Promise.all([
            meRes.ok ? meRes.json() : Promise.resolve(null),
            clientsRes.json(),
            sessionsRes.json(),
            eventsRes.json(),
            paymentsRes.json(),
            tasksRes.ok ? tasksRes.json() : Promise.resolve([]),
            feedbacksRes.ok ? feedbacksRes.json() : Promise.resolve([]),
          ]);

          const dbPlanName = mapDbPlanToSubscriptionPlan(
            (rawMe as { trainer?: { plan?: string } } | null)?.trainer?.plan,
          );

          const resolvedTrainerName = (() => {
            const fromMe = (rawMe as { name?: string } | null)?.name;
            if (fromMe && fromMe.trim()) return fromMe.trim();
            return undefined;
          })();

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
            media:      Array.isArray(s.media) ? (s.media as TrainingMediaItem[]) : [],
          }));

          const calendarEvents: CalendarEvent[] = (rawEvents as Array<Record<string, unknown>>).map((e) => ({
            id:            String(e.id),
            day:           String(e.day),
            time:          String(e.time),
            dog:           String(e.dog),
            client:        String(e.client),
            plan:          String(e.plan ?? ""),
            sessionNumber: Number(e.sessionNumber ?? 1),
            status:        (e.status ?? "Confirmado") as "Confirmado" | "Pendente" | "Aguardando" | "Recorrente" | "Cancelado",
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

          const portalTasks: PortalTask[] = (rawTasks as Array<Record<string, unknown>>).map((t) => ({
            id:          String(t.id),
            clientId:    t.clientId ? String(t.clientId) : undefined,
            title:       String(t.title),
            description: t.description ? String(t.description) : "",
            completed:   Boolean(t.completed),
          }));

          const portalFeedbacks: PortalFeedback[] = (rawFeedbacks as Array<Record<string, unknown>>).map((f) => ({
            id:        String(f.id),
            clientId:  f.clientId ? String(f.clientId) : undefined,
            author:    (f.author ?? "Tutor") as "Tutor" | "Adestrador",
            message:   String(f.message),
            createdAt: (() => {
              const d = new Date(String(f.createdAt));
              return (
                d.toLocaleDateString("pt-BR") +
                " \u2022 " +
                d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
              );
            })(),
          }));

          set((state) => ({
            clients,
            trainingSessions,
            calendarEvents,
            payments,
            portalTasks,
            portalFeedbacks,
            activePlan: dbPlanName,
            trainerSubscription: {
              ...state.trainerSubscription,
              planName: dbPlanName,
              amount: getPlanAmount(dbPlanName, state.trainerSubscription.lessonPackage),
              status: "Ativa",
            },
            trainerName: resolvedTrainerName ?? state.trainerName,
          }));
        } catch {
          // silently fail — store keeps current state
        }
      },
      startTrial: () =>
        set(() => ({
          trialActive: false,
          trialMaxDays: 30,
          simulationDay: 1,
          demoActivities: [],
        })),
      advanceTrialDays: (days) =>
        set((state) => ({
          simulationDay: Math.min(state.trialMaxDays, Math.max(1, state.simulationDay + Math.max(0, days))),
          trialActive: false,
          demoActivities: state.demoActivities,
        })),
      completeTrial: () => set((state) => ({
        simulationDay: state.trialMaxDays,
        trialActive: false,
        demoActivities: state.demoActivities,
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
