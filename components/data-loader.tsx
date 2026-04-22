"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useAppStore } from "@/lib/app-store";

/**
 * Carrega dados do banco (clientes, sessões, agenda, pagamentos)
 * para o Zustand store após login.
 * Também seta trainerName/Email no store usando a sessão NextAuth.
 */
export function DataLoader() {
  const { data: session, status } = useSession();
  const loadFromDB = useAppStore((state) => state.loadFromDB);
  const login      = useAppStore((state) => state.login);
  const loaded     = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;
    if (loaded.current) return;
    loaded.current = true;

    // Atualiza nome/email no store via login
    const email = session.user.email ?? "";
    const role  = ((session.user as { role?: string }).role ?? "trainer").toLowerCase() as "trainer" | "admin" | "client";
    login(email, role);

    // Carrega dados reais do banco
    loadFromDB();
  }, [status, session, loadFromDB, login]);

  return null;
}
