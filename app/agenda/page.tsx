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

export default function SchedulePage() {
  const events = useAppStore((state) => state.calendarEvents);
  const setEventStatus = useAppStore((state) => state.setEventStatus);
  const addCalendarEvent = useAppStore((state) => state.addCalendarEvent);

  const [dog, setDog] = useState("");
  const [client, setClient] = useState("");
  const [day, setDay] = useState("Ter\u00e7a");
  const [time, setTime] = useState("19:00");
  const [status, setStatus] = useState<EventStatus>("Pendente");

  const orderedEvents = useMemo(
    () => [...events].sort((a, b) => Number(b.sessionNumber) - Number(a.sessionNumber)),
    [events],
  );

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dog.trim() || !client.trim()) return;

    addCalendarEvent({
      day,
      time,
      dog: dog.trim(),
      client: client.trim(),
      plan: "Sess\u00e3o recorrente",
      sessionNumber: events.length + 1,
      status,
    });

    setDog("");
    setClient("");
    setStatus("Pendente");
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
                className={`rounded-3xl border border-[var(--border)] bg-white/90 p-4 ${index > 2 ? "hidden md:block" : ""}`}
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
                    onClick={() => setEventStatus(event.id, "Confirmado")}
                    className="rounded-full border border-emerald-300 bg-emerald-50 px-2 py-2 text-emerald-800"
                  >
                    Confirmar
                  </button>
                  <button
                    type="button"
                    onClick={() => setEventStatus(event.id, "Pendente")}
                    className="rounded-full border border-amber-300 bg-amber-50 px-2 py-2 text-amber-900"
                  >
                    Pendente
                  </button>
                  <button
                    type="button"
                    onClick={() => setEventStatus(event.id, "Cancelado")}
                    className="rounded-full border border-rose-300 bg-rose-50 px-2 py-2 text-rose-800"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={onSubmit} className="mt-6 grid gap-3 rounded-3xl border border-[var(--border)] bg-white/95 p-4 md:grid-cols-2">
            <input
              value={client}
              onChange={(event) => setClient(event.target.value)}
              placeholder="Cliente"
              className="rounded-2xl border border-[var(--border)] px-4 py-3 text-sm outline-none focus:border-sky-400"
              required
            />
            <input
              value={dog}
              onChange={(event) => setDog(event.target.value)}
              placeholder="Cão"
              className="rounded-2xl border border-[var(--border)] px-4 py-3 text-sm outline-none focus:border-sky-400"
              required
            />
            <input
              value={day}
              onChange={(event) => setDay(event.target.value)}
              placeholder="Dia"
              className="rounded-2xl border border-[var(--border)] px-4 py-3 text-sm outline-none focus:border-sky-400"
            />
            <input
              value={time}
              onChange={(event) => setTime(event.target.value)}
              placeholder="Hora"
              className="rounded-2xl border border-[var(--border)] px-4 py-3 text-sm outline-none focus:border-sky-400"
            />
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as EventStatus)}
              className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-sky-400 md:col-span-2"
            >
              <option value="Pendente">Pendente</option>
              <option value="Confirmado">Confirmado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
            <button type="submit" className="pc-primary-action md:col-span-2 rounded-full px-5 py-3 text-sm font-semibold">
              Criar agendamento
            </button>
          </form>
        </article>
      </section>
    </PageShell>
  );
}

