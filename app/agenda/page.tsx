"use client";

import { FormEvent, useMemo, useState } from "react";

import { PageShell } from "@/components/page-shell";
import { useAppStore } from "@/lib/app-store";

type EventStatus = "Confirmado" | "Pendente" | "Cancelado";

const statusClassName: Record<EventStatus, string> = {
  Confirmado: "bg-emerald-100 text-emerald-800",
  Pendente: "bg-amber-100 text-amber-900",
  Cancelado: "bg-rose-100 text-rose-800",
};

const daysOfWeek = ["Segunda", "Ter\u00e7a", "Quarta", "Quinta", "Sexta", "S\u00e1bado", "Domingo"];

export default function SchedulePage() {
  const events = useAppStore((state) => state.calendarEvents);
  const clients = useAppStore((state) => state.clients);
  const setEventStatus = useAppStore((state) => state.setEventStatus);
  const addCalendarEvent = useAppStore((state) => state.addCalendarEvent);

  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id ?? "");
  const [selectedDogId, setSelectedDogId] = useState(clients[0]?.dogs[0]?.id ?? "");
  const [day, setDay] = useState("Ter\u00e7a");
  const [time, setTime] = useState("09:00");
  const [status, setStatus] = useState<EventStatus>("Pendente");
  const [busyEventId, setBusyEventId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createdSuccess, setCreatedSuccess] = useState(false);
  const [agendaMessage, setAgendaMessage] = useState("");

  const selectedClient = useMemo(
    () => clients.find((c) => c.id === selectedClientId) ?? clients[0],
    [clients, selectedClientId],
  );
  const selectedDog = useMemo(
    () => selectedClient?.dogs.find((d) => d.id === selectedDogId) ?? selectedClient?.dogs[0],
    [selectedClient, selectedDogId],
  );

  const orderedEvents = useMemo(
    () => [...events].sort((a, b) => Number(b.sessionNumber) - Number(a.sessionNumber)),
    [events],
  );

  async function handleSetStatus(eventId: string, newStatus: EventStatus) {
    if (busyEventId) return;
    setBusyEventId(eventId);
    try {
      const ok = await setEventStatus(eventId, newStatus);
      if (!ok) {
        setAgendaMessage("Não foi possível salvar o novo status agora. Mantivemos a alteração localmente.");
        window.setTimeout(() => setAgendaMessage(""), 3500);
      }
    } finally {
      setBusyEventId(null);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedClient || !selectedDog || isCreating) return;

    setIsCreating(true);
    try {
      const ok = await addCalendarEvent({
        day,
        time,
        dog: selectedDog.name,
        client: selectedClient.name,
        plan: "Sess\u00e3o recorrente",
        sessionNumber: events.length + 1,
        status,
      });
      if (ok) {
        setStatus("Pendente");
        setCreatedSuccess(true);
        setTimeout(() => setCreatedSuccess(false), 3000);
      } else {
        setAgendaMessage("Não foi possível sincronizar o novo agendamento agora. Ele ficou salvo localmente para não perder seu fluxo.");
        window.setTimeout(() => setAgendaMessage(""), 4000);
      }
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <PageShell
      kicker="Agenda"
      title="Agenda de aulas"
      description="Organize rotas e marque cada sess\u00e3o como confirmada, pendente ou cancelada com um clique."
      requireAuth="trainer"
    >
      <section>
        <article className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
          {agendaMessage ? (
            <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {agendaMessage}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                Semana atual
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold">
                Semana operacional do adestrador
              </h2>
            </div>
            <span className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              {orderedEvents.length} eventos
            </span>
          </div>

          {orderedEvents.length === 0 ? (
            <p className="mt-6 text-sm text-[var(--muted)]">Nenhum evento cadastrado. Use o formulário abaixo para criar agendamentos.</p>
          ) : null}
          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {orderedEvents.map((event, index) => (
              <div
                key={event.id}
                className="rounded-3xl border border-[var(--border)] bg-white/90 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                    {event.day}
                  </p>
                  <span className="rounded-full bg-lagoon px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-sky-900">
                    {event.time}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-xl font-semibold">{event.dog}</h3>
                <p className="text-sm text-[var(--muted)]">{event.client}</p>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{event.plan}</p>

                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.12em]">
                  <span className="rounded-full border border-[var(--border)] px-3 py-2 text-[var(--muted)]">
                    Sessão {event.sessionNumber}
                  </span>
                  <span className={`rounded-full px-3 py-2 ${statusClassName[event.status as EventStatus] ?? "bg-slate-100 text-slate-700"}`}>
                    {event.status}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-xs font-semibold uppercase tracking-[0.1em]">
                  <button
                    type="button"
                    onClick={() => handleSetStatus(event.id, "Confirmado")}
                    disabled={busyEventId === event.id}
                    className="rounded-full border border-emerald-300 bg-emerald-50 px-2 py-2 text-emerald-800 disabled:opacity-50"
                  >
                    Confirmar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetStatus(event.id, "Pendente")}
                    disabled={busyEventId === event.id}
                    className="rounded-full border border-amber-300 bg-amber-50 px-2 py-2 text-amber-900 disabled:opacity-50"
                  >
                    Pendente
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetStatus(event.id, "Cancelado")}
                    disabled={busyEventId === event.id}
                    className="rounded-full border border-rose-300 bg-rose-50 px-2 py-2 text-rose-800 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {clients.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-[var(--border)] bg-white/60 p-8 text-center">
              <p className="text-sm font-semibold text-[var(--foreground)]">Nenhum cliente cadastrado</p>
              <p className="mt-2 text-sm text-[var(--muted)]">Cadastre clientes primeiro na p\u00e1gina <a href="/clientes" className="underline">Clientes</a> para agendar atendimentos.</p>
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="mt-6 grid gap-3 rounded-3xl border border-[var(--border)] bg-white/95 p-4 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Cliente</label>
              <select
                value={selectedClient?.id ?? ""}
                onChange={(e) => {
                  const c = clients.find((x) => x.id === e.target.value);
                  setSelectedClientId(e.target.value);
                  setSelectedDogId(c?.dogs[0]?.id ?? "");
                }}
                disabled={clients.length === 0}
                className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-sky-400 disabled:opacity-50"
                required
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">C\u00e3o</label>
              <select
                value={selectedDog?.id ?? ""}
                onChange={(e) => setSelectedDogId(e.target.value)}
                disabled={!selectedClient?.dogs.length}
                className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-sky-400 disabled:opacity-50"
                required
              >
                {(selectedClient?.dogs ?? []).map((d) => (
                  <option key={d.id} value={d.id}>{d.name} • {d.breed}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Dia da semana</label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-sky-400"
              >
                {daysOfWeek.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Hor\u00e1rio</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="rounded-2xl border border-[var(--border)] px-4 py-3 text-sm outline-none focus:border-sky-400"
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Status inicial</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EventStatus)}
                className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-sky-400"
              >
                <option value="Pendente">Pendente</option>
                <option value="Confirmado">Confirmado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
            <button type="submit" disabled={isCreating || clients.length === 0} className="pc-primary-action md:col-span-2 rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-60">
              {isCreating ? "Criando..." : "Criar agendamento"}
            </button>
            {createdSuccess ? (
              <p className="md:col-span-2 text-center text-sm font-semibold text-emerald-700">Agendamento criado com sucesso.</p>
            ) : null}
          </form>
        </article>
      </section>
    </PageShell>
  );
}

