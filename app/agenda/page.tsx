"use client";

import { FormEvent, useState } from "react";

import { PageShell } from "@/components/page-shell";
import { useAppStore } from "@/lib/app-store";

export default function SchedulePage() {
  const events = useAppStore((state) => state.calendarEvents);
  const toggleEventStatus = useAppStore((state) => state.toggleEventStatus);
  const addCalendarEvent = useAppStore((state) => state.addCalendarEvent);

  const [dog, setDog] = useState("");
  const [client, setClient] = useState("");
  const [day, setDay] = useState("Terça");
  const [time, setTime] = useState("19:00");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dog.trim() || !client.trim()) return;

    addCalendarEvent({
      day,
      time,
      dog: dog.trim(),
      client: client.trim(),
      plan: "Sessão recorrente",
      sessionNumber: events.length + 1,
    });

    setDog("");
    setClient("");
  }

  return (
    <PageShell
      kicker="Agenda"
      title="Agenda de aulas"
      description="Organize rotas, confirme sessões e mantenha tutor e adestrador alinhados em tempo real."
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
              {events.length} eventos
            </span>
          </div>

          {events.length === 0 ? (
            <p className="mt-6 text-sm text-[var(--muted)]">Nenhum evento cadastrado. Use o formulário abaixo para criar agendamentos.</p>
          ) : null}
          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {events.map((event, index) => (
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
                  <button
                    type="button"
                    onClick={() => toggleEventStatus(event.id)}
                    className={`rounded-full px-3 py-2 ${
                      event.status === "Confirmado"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    {event.status}
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
            <button type="submit" className="pc-primary-action md:col-span-2 rounded-full px-5 py-3 text-sm font-semibold">
              Criar agendamento
            </button>
          </form>
        </article>
      </section>
    </PageShell>
  );
}