"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

import { AuthGuard } from "@/components/auth-guard";
import { useAppStore } from "@/lib/app-store";

type EventStatus = "Confirmado" | "Pendente" | "Cancelado" | "Aguardando" | "Recorrente";

type WeekDay = {
  short: string;
  full: string;
};

const weekDays: WeekDay[] = [
  { short: "DOM", full: "Domingo" },
  { short: "SEG", full: "Segunda" },
  { short: "TER", full: "Terça" },
  { short: "QUA", full: "Quarta" },
  { short: "QUI", full: "Quinta" },
  { short: "SEX", full: "Sexta" },
  { short: "SAB", full: "Sábado" },
];

function normalizeDay(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function statusBadge(status: EventStatus): string {
  if (status === "Confirmado") return "bg-emerald-100 text-emerald-800";
  if (status === "Pendente" || status === "Aguardando") return "bg-amber-100 text-amber-900";
  if (status === "Recorrente") return "bg-sky-100 text-sky-800";
  return "bg-rose-100 text-rose-800";
}

function timelineDot(status: EventStatus): string {
  if (status === "Confirmado") return "bg-emerald-500";
  if (status === "Pendente" || status === "Aguardando") return "bg-amber-500";
  if (status === "Recorrente") return "bg-sky-500";
  return "bg-rose-500";
}

function TinyIcon({ name }: { name: "back" | "plus" | "filter" | "play" | "notes" | "whats" }) {
  if (name === "back") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
        <path d="m14.5 6-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "plus") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "filter") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
        <path d="M4 7h16M7 12h10M10 17h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "play") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
        <path d="m9 7 8 5-8 5V7Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "notes") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
        <rect x="5" y="4" width="14" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M8.5 9h7M8.5 13h7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <path d="M7 18h10a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3h-1l-1.2-2H9.2L8 6H7a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3Z" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="2.2" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function buildWeekDates(): number[] {
  const now = new Date();
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - now.getDay());
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(sunday);
    day.setDate(sunday.getDate() + index);
    return day.getDate();
  });
}

export default function SchedulePage() {
  const events = useAppStore((state) => state.calendarEvents);
  const clients = useAppStore((state) => state.clients);
  const setEventStatus = useAppStore((state) => state.setEventStatus);
  const addCalendarEvent = useAppStore((state) => state.addCalendarEvent);

  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id ?? "");
  const [selectedDogId, setSelectedDogId] = useState(clients[0]?.dogs[0]?.id ?? "");
  const [time, setTime] = useState("09:30");
  const [status, setStatus] = useState<EventStatus>("Pendente");
  const [busyEventId, setBusyEventId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showStatusFilters, setShowStatusFilters] = useState(false);
  const [agendaMessage, setAgendaMessage] = useState("");
  const [selectedDayIndex, setSelectedDayIndex] = useState(new Date().getDay());
  const [statusFilter, setStatusFilter] = useState<"Todos" | EventStatus>("Todos");

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === selectedClientId) ?? clients[0],
    [clients, selectedClientId],
  );

  const selectedDog = useMemo(
    () => selectedClient?.dogs.find((dog) => dog.id === selectedDogId) ?? selectedClient?.dogs[0],
    [selectedClient, selectedDogId],
  );

  const weekDates = useMemo(() => buildWeekDates(), []);

  const eventsForSelectedDay = useMemo(() => {
    const selectedDayName = weekDays[selectedDayIndex]?.full ?? "";
    return [...events]
      .filter((event) => normalizeDay(event.day) === normalizeDay(selectedDayName))
      .filter((event) => statusFilter === "Todos" || event.status === statusFilter)
      .sort((left, right) => left.time.localeCompare(right.time));
  }, [events, selectedDayIndex, statusFilter]);

  const totalConfirmed = useMemo(
    () => eventsForSelectedDay.filter((event) => event.status === "Confirmado").length,
    [eventsForSelectedDay],
  );

  const totalInProgress = useMemo(
    () => eventsForSelectedDay.filter((event) => event.status === "Pendente" || event.status === "Aguardando").length,
    [eventsForSelectedDay],
  );

  const totalCancelled = useMemo(
    () => eventsForSelectedDay.filter((event) => event.status === "Cancelado").length,
    [eventsForSelectedDay],
  );

  const dogPhotoByName = useMemo(() => {
    const map = new Map<string, string>();
    for (const client of clients) {
      for (const dog of client.dogs) {
        if (dog.photoUrl) map.set(dog.name, dog.photoUrl);
      }
    }
    return map;
  }, [clients]);

  const clientDogMetaByNames = useMemo(() => {
    const map = new Map<string, { clientId: string; dogId: string; phone: string }>();
    clients.forEach((client) => {
      client.dogs.forEach((dog) => {
        map.set(`${client.name}::${dog.name}`, { clientId: client.id, dogId: dog.id, phone: client.phone });
      });
    });
    return map;
  }, [clients]);

  function handleOpenWhatsApp(phone?: string, dogName?: string) {
    const normalizedPhone = (phone ?? "").replace(/\D/g, "");
    if (!normalizedPhone) {
      setAgendaMessage("Tutor sem telefone valido para abrir WhatsApp.");
      window.setTimeout(() => setAgendaMessage(""), 3000);
      return;
    }

    const message = encodeURIComponent(
      `Oi! Estou iniciando${dogName ? ` a sessao do ${dogName}` : " a sessao"} agora.`,
    );
    window.open(`https://wa.me/55${normalizedPhone}?text=${message}`, "_blank", "noopener,noreferrer");
  }

  async function handleSetStatus(eventId: string, newStatus: EventStatus) {
    if (busyEventId) return;
    setBusyEventId(eventId);
    try {
      const ok = await setEventStatus(eventId, newStatus);
      if (!ok) {
        setAgendaMessage("Nao foi possivel sincronizar o status agora.");
        window.setTimeout(() => setAgendaMessage(""), 3000);
      }
    } finally {
      setBusyEventId(null);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedClient || !selectedDog || isCreating) return;

    const dayName = weekDays[selectedDayIndex]?.full ?? "Segunda";

    setIsCreating(true);
    try {
      const ok = await addCalendarEvent({
        day: dayName,
        time,
        dog: selectedDog.name,
        client: selectedClient.name,
        plan: selectedClient.plan || "Sessao personalizada",
        sessionNumber: events.length + 1,
        status,
      });

      if (ok) {
        setStatus("Pendente");
        setShowForm(false);
      } else {
        setAgendaMessage("Nao foi possivel criar o agendamento agora.");
        window.setTimeout(() => setAgendaMessage(""), 3500);
      }
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <AuthGuard role="trainer">
      <main className="mx-auto w-full max-w-md px-3 pb-20 pt-3 sm:max-w-xl">
        <section className="rounded-[2rem] border border-[var(--border)] bg-[#f7fbff] p-3.5 shadow-[var(--shadow)]">
          <header className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[#145a82]">
                <TinyIcon name="back" />
              </Link>
              <div>
                <p className="text-base font-semibold text-[var(--foreground)]">Agenda de aulas</p>
                <p className="text-[11px] text-[var(--muted)]">Visualize e gerencie suas aulas e atendimentos.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowForm((value) => !value)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#145a82] text-white"
              aria-label="Novo agendamento"
            >
              <TinyIcon name="plus" />
            </button>
          </header>

          <section className="mt-3 flex items-center justify-between rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-xs text-[var(--muted)]">
            <p>{eventsForSelectedDay.length} aulas do dia</p>
            <button type="button" onClick={() => setShowStatusFilters((current) => !current)} className="inline-flex items-center gap-1 text-[#145a82]">
              <TinyIcon name="filter" />
              Filtros
            </button>
          </section>

          {showStatusFilters ? (
            <section className="mt-2 flex gap-2 overflow-x-auto pb-1">
              {(["Todos", "Confirmado", "Pendente", "Cancelado"] as const).map((filterValue) => (
                <button
                  key={filterValue}
                  type="button"
                  onClick={() => setStatusFilter(filterValue)}
                  className={`whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-semibold ${
                    statusFilter === filterValue
                      ? "bg-[#145a82] text-white"
                      : "border border-[var(--border)] bg-white text-[var(--muted)]"
                  }`}
                >
                  {filterValue}
                </button>
              ))}
            </section>
          ) : null}

          <section className="mt-3 grid grid-cols-7 gap-1.5">
            {weekDays.map((day, index) => (
              <button
                key={day.short}
                type="button"
                onClick={() => setSelectedDayIndex(index)}
                className={`rounded-xl px-1 py-2 text-center ${
                  selectedDayIndex === index
                    ? "bg-[#145a82] text-white"
                    : "border border-[var(--border)] bg-white text-[var(--muted)]"
                }`}
              >
                <p className="text-[9px] font-semibold uppercase">{day.short}</p>
                <p className="mt-1 text-sm font-semibold">{weekDates[index]}</p>
              </button>
            ))}
          </section>

          <section className="mt-3 grid grid-cols-2 gap-2">
            <article className="rounded-xl border border-[var(--border)] bg-white p-3">
              <p className="text-2xl font-semibold text-[var(--foreground)]">{eventsForSelectedDay.length}</p>
              <p className="text-xs text-[var(--muted)]">Aulas hoje</p>
            </article>
            <article className="rounded-xl border border-[var(--border)] bg-white p-3">
              <p className="text-2xl font-semibold text-[var(--foreground)]">{totalInProgress}</p>
              <p className="text-xs text-[var(--muted)]">Em andamento</p>
            </article>
            <article className="rounded-xl border border-[var(--border)] bg-white p-3">
              <p className="text-2xl font-semibold text-[var(--foreground)]">{totalConfirmed}</p>
              <p className="text-xs text-[var(--muted)]">Concluidas</p>
            </article>
            <article className="rounded-xl border border-[var(--border)] bg-white p-3">
              <p className="text-2xl font-semibold text-[var(--foreground)]">{totalCancelled}</p>
              <p className="text-xs text-[var(--muted)]">Canceladas</p>
            </article>
          </section>

          {agendaMessage ? (
            <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">{agendaMessage}</p>
          ) : null}

          <section className="mt-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-[var(--foreground)]">Aulas de hoje</p>
            <p className="text-[11px] text-[var(--muted)]">{weekDays[selectedDayIndex]?.full}</p>
          </section>

          <section className="mt-2 space-y-2.5">
            {eventsForSelectedDay.map((event) => {
              const photo = dogPhotoByName.get(event.dog);
              const relatedMeta = clientDogMetaByNames.get(`${event.client}::${event.dog}`);
              return (
                <article key={event.id} className="rounded-2xl border border-[var(--border)] bg-white p-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 pt-1 text-right">
                      <p className="text-[11px] font-semibold text-[var(--muted)]">{event.time}</p>
                      <span className={`mx-auto mt-1 block h-2.5 w-2.5 rounded-full ${timelineDot(event.status as EventStatus)}`} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-sky-50">
                            {photo ? (
                              <Image src={photo} alt={`Foto de ${event.dog}`} fill sizes="40px" unoptimized className="object-cover" />
                            ) : null}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[var(--foreground)]">{event.dog}</p>
                            <p className="text-[11px] text-[var(--muted)]">{event.client} • Sessao {event.sessionNumber}</p>
                          </div>
                        </div>
                        <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${statusBadge(event.status as EventStatus)}`}>
                          {event.status}
                        </span>
                      </div>

                      <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
                        <Link href={relatedMeta ? `/treinos/registro?clientId=${relatedMeta.clientId}&dogId=${relatedMeta.dogId}` : "/treinos/registro"} className="inline-flex items-center justify-center gap-1 rounded-lg border border-[var(--border)] bg-[#f7fbff] px-2 py-1.5 text-[#145a82]">
                          <TinyIcon name="play" />
                          Iniciar
                        </Link>
                        <Link href={relatedMeta ? `/treinos/registro?clientId=${relatedMeta.clientId}&dogId=${relatedMeta.dogId}` : "/treinos/registro"} className="inline-flex items-center justify-center gap-1 rounded-lg border border-[var(--border)] bg-[#f7fbff] px-2 py-1.5 text-[#145a82]">
                          <TinyIcon name="notes" />
                          Registro
                        </Link>
                        <button type="button" onClick={() => handleOpenWhatsApp(relatedMeta?.phone, event.dog)} className="inline-flex items-center justify-center gap-1 rounded-lg border border-[var(--border)] bg-[#f7fbff] px-2 py-1.5 text-[#145a82]">
                          <TinyIcon name="whats" />
                          WhatsApp
                        </button>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
                        <button
                          type="button"
                          onClick={() => handleSetStatus(event.id, "Confirmado")}
                          disabled={busyEventId === event.id}
                          className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-emerald-800 disabled:opacity-50"
                        >
                          Concluir
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetStatus(event.id, "Pendente")}
                          disabled={busyEventId === event.id}
                          className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-amber-900 disabled:opacity-50"
                        >
                          Em andamento
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetStatus(event.id, "Cancelado")}
                          disabled={busyEventId === event.id}
                          className="rounded-full border border-rose-300 bg-rose-50 px-2.5 py-1 text-rose-800 disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}

            {eventsForSelectedDay.length === 0 ? (
              <article className="rounded-2xl border border-dashed border-[var(--border)] bg-white p-4 text-xs text-[var(--muted)]">
                Nenhuma aula para este dia.
              </article>
            ) : null}
          </section>

          <section className="mt-4 rounded-2xl border border-[var(--border)] bg-sky-50 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">Organize as aulas de forma eficiente</p>
                <p className="text-xs text-[var(--muted)]">Agende nova aula e acompanhe os status.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm((value) => !value)}
                className="rounded-full bg-[#145a82] px-4 py-2 text-xs font-semibold text-white"
              >
                {showForm ? "Fechar" : "Nova aula"}
              </button>
            </div>
          </section>

          {showForm ? (
            <section className="mt-3 rounded-2xl border border-[var(--border)] bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Novo agendamento</p>
              <form onSubmit={onSubmit} className="mt-3 grid gap-2.5 sm:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-[11px] font-medium text-[var(--muted)]">Cliente</span>
                  <select
                    value={selectedClient?.id ?? ""}
                    onChange={(event) => {
                      const nextClient = clients.find((item) => item.id === event.target.value);
                      setSelectedClientId(event.target.value);
                      setSelectedDogId(nextClient?.dogs[0]?.id ?? "");
                    }}
                    className="rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none focus:border-sky-400"
                  >
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-1">
                  <span className="text-[11px] font-medium text-[var(--muted)]">Cao</span>
                  <select
                    value={selectedDog?.id ?? ""}
                    onChange={(event) => setSelectedDogId(event.target.value)}
                    className="rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none focus:border-sky-400"
                  >
                    {(selectedClient?.dogs ?? []).map((dog) => (
                      <option key={dog.id} value={dog.id}>{dog.name} • {dog.breed}</option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-1">
                  <span className="text-[11px] font-medium text-[var(--muted)]">Dia</span>
                  <input
                    value={weekDays[selectedDayIndex]?.full ?? "Segunda"}
                    readOnly
                    className="rounded-xl border border-[var(--border)] bg-[#f7fbff] px-3 py-2 text-sm text-[var(--foreground)]"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-[11px] font-medium text-[var(--muted)]">Horario</span>
                  <input
                    type="time"
                    value={time}
                    onChange={(event) => setTime(event.target.value)}
                    className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-sky-400"
                  />
                </label>

                <label className="grid gap-1 sm:col-span-2">
                  <span className="text-[11px] font-medium text-[var(--muted)]">Status inicial</span>
                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value as EventStatus)}
                    className="rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none focus:border-sky-400"
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Confirmado">Confirmado</option>
                    <option value="Cancelado">Cancelado</option>
                    <option value="Aguardando">Aguardando</option>
                  </select>
                </label>

                <button
                  type="submit"
                  disabled={isCreating || clients.length === 0}
                  className="rounded-full bg-[#145a82] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 sm:col-span-2"
                >
                  {isCreating ? "Criando..." : "Criar agendamento"}
                </button>
              </form>
            </section>
          ) : null}
        </section>
      </main>
    </AuthGuard>
  );
}

