"use client";

import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";

import { AuthGuard } from "@/components/auth-guard";
import { useAppStore, type ClientPaymentMethod } from "@/lib/app-store";

type ClientStatus = "ativos" | "pendentes" | "inativos";
type SortMode = "recentes" | "nome";

function parseBrazilianDate(date: string): number {
  const [day, month, year] = date.split("/").map(Number);
  if (!day || !month || !year) return 0;
  return new Date(year, month - 1, day).getTime();
}

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getClientStatus(params: { pendingAmount: number; hasRecentSession: boolean }): ClientStatus {
  if (params.pendingAmount > 0) return "pendentes";
  if (params.hasRecentSession) return "ativos";
  return "inativos";
}

function statusStyle(status: ClientStatus): string {
  if (status === "ativos") return "bg-sky-100 text-sky-800";
  if (status === "pendentes") return "bg-amber-100 text-amber-900";
  return "bg-slate-100 text-slate-700";
}

function statusLabel(status: ClientStatus): string {
  if (status === "ativos") return "Ativo";
  if (status === "pendentes") return "Em atencao";
  return "Inativo";
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function SmallIcon({ name }: { name: "search" | "filter" | "plus" | "dog" | "money" | "calendar" }) {
  if (name === "search") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
        <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.8" />
        <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "filter") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
        <path d="M5 7h14M8 12h8M10 17h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "plus") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "dog") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
        <circle cx="8" cy="8.5" r="1.7" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="7" r="1.7" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="16" cy="8.5" r="1.7" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 18.6c2.7 0 4.8-1.7 4.8-3.9 0-1.9-2-3.5-4.8-3.5s-4.8 1.6-4.8 3.5c0 2.2 2.1 3.9 4.8 3.9Z" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }

  if (name === "money") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
        <rect x="4" y="6" width="16" height="12" rx="3" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="12" cy="12" r="2.4" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <rect x="4" y="5" width="16" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 3.8v3.5M16 3.8v3.5M4 9h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export default function ClientsPage() {
  const clients = useAppStore((state) => state.clients);
  const sessions = useAppStore((state) => state.trainingSessions);
  const events = useAppStore((state) => state.calendarEvents);
  const payments = useAppStore((state) => state.payments);
  const addClientWithDog = useAppStore((state) => state.addClientWithDog);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos" | ClientStatus>("todos");
  const [showQuickFilters, setShowQuickFilters] = useState(true);
  const [sortMode, setSortMode] = useState<SortMode>("recentes");
  const [showForm, setShowForm] = useState(false);

  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [dogName, setDogName] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [dogPhotoUrl, setDogPhotoUrl] = useState("");
  const [dogPhotoPreview, setDogPhotoPreview] = useState("");
  const [propertyType, setPropertyType] = useState("Apartamento");
  const [trainingTypesRaw, setTrainingTypesRaw] = useState("");
  const [planLabel, setPlanLabel] = useState("");
  const [contractAmount, setContractAmount] = useState("");
  const [billingDay, setBillingDay] = useState("10");
  const [paymentMethod, setPaymentMethod] = useState<ClientPaymentMethod>("Pix");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  async function handleDogPhotoFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setSaveError("Selecione um arquivo de imagem valido.");
      event.target.value = "";
      return;
    }

    if (file.size > 1_500_000) {
      setSaveError("Imagem muito grande. Use um arquivo de ate 1.5MB.");
      event.target.value = "";
      return;
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(new Error("Falha ao ler imagem."));
      reader.readAsDataURL(file);
    }).catch(() => "");

    if (!dataUrl) {
      setSaveError("Nao foi possivel carregar a imagem.");
      event.target.value = "";
      return;
    }

    setSaveError("");
    setDogPhotoUrl("");
    setDogPhotoPreview(dataUrl);
  }

  const clientsWithMeta = useMemo(() => {
    const now = Date.now();
    const recentWindow = 45 * 24 * 60 * 60 * 1000;

    return clients.map((client, index) => {
      const pendingAmount = payments
        .filter(
          (payment) =>
            payment.status === "Pendente" &&
            (payment.clientId === client.id || payment.clientName === client.name),
        )
        .reduce((total, payment) => total + payment.amount, 0);

      const lastSessionDate = sessions
        .filter((session) => session.clientId === client.id || session.clientName === client.name)
        .map((session) => parseBrazilianDate(session.date))
        .sort((a, b) => b - a)[0] ?? 0;

      const hasRecentSession = lastSessionDate > 0 && now - lastSessionDate <= recentWindow;
      const status = getClientStatus({ pendingAmount, hasRecentSession });

      return {
        client,
        status,
        pendingAmount,
        lastSessionDate,
        insertionOrder: index,
      };
    });
  }, [clients, payments, sessions]);

  const filteredClients = useMemo(() => {
    const search = normalizeText(searchTerm.trim());

    return clientsWithMeta
      .filter((item) => {
        if (statusFilter !== "todos" && item.status !== statusFilter) return false;
        if (!search) return true;

        const searchable = normalizeText(
          [
            item.client.name,
            item.client.phone,
            item.client.plan,
            item.client.propertyType,
            ...item.client.dogs.map((dog) => `${dog.name} ${dog.breed} ${dog.trainingTypes.join(" ")}`),
          ].join(" "),
        );

        return searchable.includes(search);
      })
      .sort((a, b) => {
        if (sortMode === "nome") {
          return a.client.name.localeCompare(b.client.name, "pt-BR");
        }

        const bySession = b.lastSessionDate - a.lastSessionDate;
        if (bySession !== 0) return bySession;
        return b.insertionOrder - a.insertionOrder;
      });
  }, [clientsWithMeta, searchTerm, statusFilter, sortMode]);

  const totalDogs = clients.reduce((total, client) => total + client.dogs.length, 0);
  const activeClients = clientsWithMeta.filter((item) => item.status === "ativos").length;
  const pendingClients = clientsWithMeta.filter((item) => item.status === "pendentes").length;
  const adherenceRate = clients.length ? Math.round((activeClients / clients.length) * 100) : 0;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;

    const parsedAmount = Number(contractAmount.replace(/[^\d.,]/g, "").replace(",", "."));
    const parsedBillingDay = Number(billingDay);

    if (!clientName.trim() || !dogName.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0) return;

    const trainingTypes = trainingTypesRaw
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    setSaveError("");
    setIsSaving(true);

    try {
      const ok = await addClientWithDog({
        clientName: clientName.trim(),
        phone: phone.trim() || "(00) 00000-0000",
        propertyType: propertyType || "Apartamento",
        environment: "",
        plan: planLabel.trim() || "Plano personalizado",
        contractAmount: parsedAmount,
        billingDay: Number.isFinite(parsedBillingDay) ? Math.min(Math.max(parsedBillingDay, 1), 28) : 10,
        paymentMethod,
        dogName: dogName.trim(),
        breed: breed.trim() || "SRD",
        age: age.trim() || "Nao informado",
        weight: weight.trim() || "Nao informado",
        photoUrl: dogPhotoPreview || dogPhotoUrl.trim() || undefined,
        trainingTypes: trainingTypes.length ? trainingTypes : [],
      });

      if (!ok) {
        setSaveError("Erro ao cadastrar. Verifique sua conexao e tente novamente.");
        window.setTimeout(() => setSaveError(""), 4000);
        return;
      }

      setClientName("");
      setPhone("");
      setDogName("");
      setBreed("");
      setAge("");
      setWeight("");
      setDogPhotoUrl("");
      setDogPhotoPreview("");
      setPropertyType("Apartamento");
      setTrainingTypesRaw("");
      setPlanLabel("");
      setContractAmount("");
      setBillingDay("10");
      setPaymentMethod("Pix");
      setShowForm(false);
      setSaveMessage("Tutor e cao cadastrados com sucesso.");
      window.setTimeout(() => setSaveMessage(""), 3000);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AuthGuard role="trainer">
      <main className="mx-auto w-full max-w-md px-3 pb-10 pt-3 sm:max-w-xl">
        <section className="rounded-[2rem] border border-[var(--border)] bg-gradient-to-b from-[#f8fcff] to-[#f2f9ff] p-4 shadow-[var(--shadow)]">
          <header className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#2d6f99]">Painel de clientes</p>
              <h1 className="font-display text-2xl font-semibold leading-tight text-[var(--foreground)]">Tutores e caes</h1>
              <p className="mt-1 text-xs text-[var(--muted)]">Gestao rapida para cadastro, status e acesso ao treino.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowForm((current) => !current)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#145a82] text-white shadow-[0_10px_24px_rgba(20,90,130,0.28)]"
              aria-label="Abrir cadastro"
            >
              <SmallIcon name="plus" />
            </button>
          </header>

          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/agenda" className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#145a82]">
              Agenda
            </Link>
            <Link href="/treinos" className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#145a82]">
              Treinos
            </Link>
            <Link href="/portal" className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#145a82]">
              Portal
            </Link>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <label className="flex flex-1 items-center gap-2 rounded-xl border border-[#c9dfef] bg-white px-3 py-2 text-[var(--muted)] shadow-[0_6px_18px_rgba(17,73,110,0.08)]">
              <SmallIcon name="search" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar tutor ou cao"
                className="w-full border-none bg-transparent text-sm text-[var(--foreground)] outline-none"
              />
            </label>
            <button
              type="button"
              onClick={() => setShowQuickFilters((current) => !current)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#c9dfef] bg-white text-[#145a82] shadow-[0_6px_18px_rgba(17,73,110,0.08)]"
              aria-label="Opcoes"
            >
              <SmallIcon name="filter" />
            </button>
          </div>

          <div className={`mt-4 flex gap-2 overflow-x-auto pb-1 ${showQuickFilters ? "" : "hidden"}`}>
            {[
              { value: "todos", label: "Todos" },
              { value: "ativos", label: "Ativos" },
              { value: "pendentes", label: "Pendentes" },
              { value: "inativos", label: "Inativos" },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setStatusFilter(item.value as "todos" | ClientStatus)}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                  statusFilter === item.value
                    ? "bg-[#145a82] text-white shadow-[0_8px_18px_rgba(20,90,130,0.25)]"
                    : "border border-[#c9dfef] bg-white text-[var(--muted)]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <section className="mt-4 grid grid-cols-2 gap-2">
            <article className="rounded-xl border border-[var(--border)] bg-white p-3">
              <p className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#2d6f99]"><SmallIcon name="plus" /> Tutores</p>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{clients.length}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">Base cadastrada</p>
            </article>
            <article className="rounded-xl border border-[var(--border)] bg-white p-3">
              <p className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#2d6f99]"><SmallIcon name="dog" /> Caes</p>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{totalDogs}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">Total atendido</p>
            </article>
            <article className="rounded-xl border border-[var(--border)] bg-white p-3">
              <p className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#2d6f99]"><SmallIcon name="calendar" /> Agenda</p>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{events.length}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">Atendimentos</p>
            </article>
            <article className="rounded-xl border border-[var(--border)] bg-white p-3">
              <p className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#2d6f99]"><SmallIcon name="money" /> Financeiro</p>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{adherenceRate}%</p>
              <p className="mt-1 text-xs text-[var(--muted)]">Adesao ativa</p>
            </article>
          </section>

          <section className="mt-4 flex items-center justify-between rounded-xl border border-[#c9dfef] bg-white px-3 py-2 text-xs text-[var(--muted)]">
            <p>{filteredClients.length} tutores encontrados</p>
            <label className="flex items-center gap-1.5">
              Ordenar:
              <select
                value={sortMode}
                onChange={(event) => setSortMode(event.target.value as SortMode)}
                className="rounded-md border border-[var(--border)] bg-white px-2 py-1 text-xs text-[var(--foreground)] outline-none"
              >
                <option value="recentes">Recentes</option>
                <option value="nome">Nome</option>
              </select>
            </label>
          </section>

          <section className="mt-2 rounded-xl border border-[#d7e8f4] bg-[#eef6fc] px-3 py-2 text-xs text-[#245d84]">
            {pendingClients > 0 ? `${pendingClients} cliente(s) em atencao financeira.` : "Nenhum cliente com pendencia financeira hoje."}
          </section>

          <section className="mt-3 space-y-2">
            {filteredClients.length === 0 ? (
              <article className="rounded-2xl border border-[var(--border)] bg-white p-4 text-sm text-[var(--muted)]">
                Nenhum tutor encontrado com os filtros atuais.
              </article>
            ) : null}

            {filteredClients.map((item) => {
              const firstDog = item.client.dogs[0];
              const firstDogId = firstDog?.id;

              return (
                <article key={item.client.id} className="rounded-2xl border border-[#cfe4f3] bg-white p-3 shadow-[0_10px_24px_rgba(15,72,106,0.09)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="relative h-11 w-11 overflow-hidden rounded-full bg-sky-100">
                        {firstDog?.photoUrl ? (
                          <Image
                            src={firstDog.photoUrl}
                            alt={`Foto de ${firstDog.name}`}
                            fill
                            sizes="44px"
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[#145a82]">
                            <SmallIcon name="dog" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--foreground)]">{item.client.name}</p>
                        <p className="text-xs text-[var(--muted)]">
                          {firstDog ? `${firstDog.name} • ${firstDog.breed}` : "Sem cao cadastrado"}
                        </p>
                      </div>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${statusStyle(item.status)}`}>
                      {statusLabel(item.status)}
                    </span>
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-[var(--muted)]">
                    <p>Plano: {item.client.plan || "Personalizado"}</p>
                    <p>{item.client.propertyType || "Nao informado"}</p>
                    <p>{item.client.phone || "Sem telefone"}</p>
                    <p>{item.client.dogs.length} cao(es)</p>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-semibold uppercase text-[var(--muted)]">
                    <span className="inline-flex items-center gap-1 rounded-full border border-sky-100 bg-sky-50 px-2 py-1 text-[#145a82]">
                      <SmallIcon name="money" />
                      {item.pendingAmount > 0 ? "Pendente" : "Em dia"}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-sky-100 bg-sky-50 px-2 py-1 text-[#145a82]">
                      <SmallIcon name="calendar" />
                      Agenda
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-sky-100 bg-sky-50 px-2 py-1 text-[#145a82]">
                      <SmallIcon name="dog" />
                      Treino
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-[11px] font-medium text-[var(--muted)]">{formatCurrency(item.pendingAmount)}</p>
                    <Link
                      href={firstDogId ? `/treinos?clientId=${item.client.id}&dogId=${firstDogId}` : "/treinos"}
                      className="rounded-full border border-[var(--border)] bg-[#145a82] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-white"
                    >
                      Abrir treino
                    </Link>
                    <Link href="/portal" className="text-xs font-semibold text-[#145a82]">Portal</Link>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="mt-4 rounded-2xl border border-[var(--border)] bg-[#f1f8fe] p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">Novo tutor ou novo cao?</p>
                <p className="mt-1 text-xs text-[var(--muted)]">Cadastre agora e comece o acompanhamento.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm((current) => !current)}
                className="rounded-full bg-[#145a82] px-4 py-2 text-xs font-semibold text-white"
              >
                {showForm ? "Fechar" : "Cadastrar"}
              </button>
            </div>
          </section>

          {showForm ? (
            <section className="mt-4 rounded-2xl border border-[var(--border)] bg-white p-4">
              <p className="text-sm font-semibold text-[var(--foreground)]">Cadastro de tutor e cao</p>
              <form onSubmit={onSubmit} className="mt-3 grid gap-2 sm:grid-cols-2">
                <input
                  value={clientName}
                  onChange={(event) => setClientName(event.target.value)}
                  placeholder="Nome do tutor"
                  className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-sky-400"
                  required
                />
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Telefone"
                  className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-sky-400"
                />
                <input
                  value={dogName}
                  onChange={(event) => setDogName(event.target.value)}
                  placeholder="Nome do cao"
                  className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-sky-400"
                  required
                />
                <input
                  value={breed}
                  onChange={(event) => setBreed(event.target.value)}
                  placeholder="Raca"
                  className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-sky-400"
                />
                <input
                  value={age}
                  onChange={(event) => setAge(event.target.value)}
                  placeholder="Idade"
                  className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-sky-400"
                />
                <input
                  value={weight}
                  onChange={(event) => setWeight(event.target.value)}
                  placeholder="Peso"
                  className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-sky-400"
                />
                <input
                  value={dogPhotoUrl}
                  onChange={(event) => {
                    setDogPhotoUrl(event.target.value);
                    if (event.target.value.trim()) setDogPhotoPreview("");
                  }}
                  placeholder="URL da foto (opcional)"
                  className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-sky-400 sm:col-span-2"
                />
                <label className="sm:col-span-2 rounded-xl border border-dashed border-[var(--border)] bg-sky-50/40 px-3 py-2 text-xs text-[var(--muted)]">
                  Enviar foto do cachorro (opcional)
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleDogPhotoFileChange}
                    className="mt-1 block w-full text-xs text-[var(--muted)] file:mr-2 file:rounded-lg file:border file:border-[var(--border)] file:bg-white file:px-2 file:py-1 file:text-xs"
                  />
                </label>
                {dogPhotoPreview || dogPhotoUrl.trim() ? (
                  <div className="sm:col-span-2 flex items-center gap-3 rounded-xl border border-[var(--border)] bg-sky-50/40 px-3 py-2">
                    <div className="relative h-12 w-12 overflow-hidden rounded-full bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={dogPhotoPreview || dogPhotoUrl.trim()}
                        alt="Preview da foto do cachorro"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <p className="text-xs text-[var(--muted)]">Preview da foto que sera usada no cadastro.</p>
                  </div>
                ) : null}
                <p className="sm:col-span-2 text-[11px] text-[var(--muted)]">
                  Se nao enviar foto, o sistema aplica uma imagem padrao conforme a raca (ex.: Golden Retriever).
                </p>
                <input
                  value={trainingTypesRaw}
                  onChange={(event) => setTrainingTypesRaw(event.target.value)}
                  placeholder="Focos (Guia, Place, Reatividade)"
                  className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-sky-400 sm:col-span-2"
                />
                <select
                  value={propertyType}
                  onChange={(event) => setPropertyType(event.target.value)}
                  className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-sky-400"
                >
                  <option value="Apartamento">Apartamento</option>
                  <option value="Casa">Casa</option>
                  <option value="Casa com quintal">Casa com quintal</option>
                  <option value="Condomínio">Condominio</option>
                  <option value="Outro">Outro</option>
                </select>
                <input
                  value={planLabel}
                  onChange={(event) => setPlanLabel(event.target.value)}
                  placeholder="Plano"
                  className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-sky-400"
                />
                <input
                  value={contractAmount}
                  onChange={(event) => setContractAmount(event.target.value)}
                  placeholder="Valor (R$)"
                  className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-sky-400"
                  required
                />
                <input
                  type="number"
                  min={1}
                  max={28}
                  value={billingDay}
                  onChange={(event) => setBillingDay(event.target.value)}
                  placeholder="Vencimento"
                  className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-sky-400"
                />
                <select
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value as ClientPaymentMethod)}
                  className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-sky-400 sm:col-span-2"
                >
                  <option value="Pix">Pix</option>
                  <option value="Cartao">Cartao</option>
                  <option value="Boleto">Boleto</option>
                  <option value="Dinheiro">Dinheiro</option>
                </select>

                {saveMessage ? (
                  <p className="sm:col-span-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-800">{saveMessage}</p>
                ) : null}
                {saveError ? (
                  <p className="sm:col-span-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">{saveError}</p>
                ) : null}

                <button
                  type="submit"
                  disabled={isSaving}
                  className="pc-primary-action sm:col-span-2 rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-60"
                >
                  {isSaving ? "Salvando..." : "Salvar cadastro"}
                </button>
              </form>
            </section>
          ) : null}
        </section>
      </main>
    </AuthGuard>
  );
}
