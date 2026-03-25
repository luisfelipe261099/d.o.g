"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";

import { PageShell } from "@/components/page-shell";
import { useAppStore } from "@/lib/app-store";
import { getDogPhotoUrl, healthAlerts } from "@/lib/mock-data";

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
      description="Organize as aulas, confirme sessões e acompanhe compromissos da semana."
      requireAuth="trainer"
    >
      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                Semana atual
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold">
                Visão semanal responsiva
              </h2>
            </div>
            <span className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              {events.length} eventos
            </span>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => (
              <div
                key={`${event.day}-${event.time}-${event.dog}`}
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
                <div className="mt-3">
                  <Image
                    src={getDogPhotoUrl(event.dog)}
                    alt={`Foto de ${event.dog}`}
                    width={420}
                    height={180}
                    unoptimized
                    className="h-28 w-full rounded-2xl object-cover"
                  />
                </div>
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
            <button type="submit" className="md:col-span-2 rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-semibold text-white">
              Criar agendamento
            </button>
          </form>
        </article>

        <div className="grid gap-4">
          <article className="rounded-[1.75rem] border border-[var(--border)] bg-slate-950 p-6 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              WhatsApp de confirmação
            </p>
            <div className="mt-5 rounded-3xl bg-white/7 p-5 text-sm leading-7 text-slate-300">
              <p className="font-semibold text-white">Mensagem automática</p>
              <p className="mt-3">
                Olá Marina! Seu treino do Thor está agendado para quarta, 18:30.
                Confirme aqui: dog.app/confirmar/8FD2.
              </p>
              <div className="mt-5 flex gap-3">
                <span className="rounded-full bg-emerald-500/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">
                  Confirmado pelo cliente
                </span>
                <span className="rounded-full border border-white/15 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                  Sincronizado com agenda
                </span>
              </div>
            </div>
          </article>

          <article className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel-strong)] p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Saúde na agenda
            </p>
            <div className="mt-5 space-y-3">
              {healthAlerts.map((alert) => (
                <div key={alert.title} className="rounded-3xl border border-[var(--border)] bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display text-xl font-semibold">{alert.title}</h3>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-900">
                      {alert.deadline}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{alert.detail}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>
    </PageShell>
  );
}