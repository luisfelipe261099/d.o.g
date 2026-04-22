import type { UserRole } from "@/lib/app-store";

export type DemoAccount = {
  role: UserRole;
  label: string;
  email: string;
  password: string;
  route: string;
  objective: string;
};

export const demoAccounts: DemoAccount[] = [
  {
    role: "trainer",
    label: "Adestrador",
    email: "adestrador@pegadacerta.com.br",
    password: "123456",
    route: "/dashboard",
    objective: "Operar agenda, treinos, IA e portal do tutor.",
  },
  {
    role: "client",
    label: "Tutor",
    email: "tutor@pegadacerta.com.br",
    password: "123456",
    route: "/portal/cliente",
    objective: "Acompanhar agenda, tarefas e relatórios do cão.",
  },
  {
    role: "admin",
    label: "Administrador",
    email: "admin@pegadacerta.com.br",
    password: "123456",
    route: "/admin",
    objective: "Validar assinaturas, métricas e gestão da base.",
  },
];
