"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useState } from "react";

import { PageShell } from "@/components/page-shell";
import { useAppStore, type ClientPaymentMethod } from "@/lib/app-store";

export default function ClientsPage() {
  const clients = useAppStore((state) => state.clients);
  const addClientWithDog = useAppStore((state) => state.addClientWithDog);

  const dogProfiles = clients.flatMap((client) =>
    client.dogs.map((dog) => ({
      client,
      dog,
    })),
  );

  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [dogName, setDogName] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [propertyType, setPropertyType] = useState("Apartamento");
  const [trainingTypesRaw, setTrainingTypesRaw] = useState("");
  const [planLabel, setPlanLabel] = useState("");
  const [contractAmount, setContractAmount] = useState("");
  const [billingDay, setBillingDay] = useState("10");
  const [paymentMethod, setPaymentMethod] = useState<ClientPaymentMethod>("Pix");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;
    const parsedAmount = Number(contractAmount.replace(/[^\d.,]/g, "").replace(",", "."));
    const parsedBillingDay = Number(billingDay);

    if (!clientName.trim() || !dogName.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0) return;

    const trainingTypes = trainingTypesRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    setIsSaving(true);
    try {
      await addClientWithDog({
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
        age: age.trim() || "Não informado",
        weight: weight.trim() || "Não informado",
        trainingTypes: trainingTypes.length > 0 ? trainingTypes : [],
      });
      setClientName("");
      setPhone("");
      setDogName("");
      setBreed("");
      setAge("");
      setWeight("");
      setPropertyType("Apartamento");
      setTrainingTypesRaw("");
      setPlanLabel("");
      setContractAmount("");
      setBillingDay("10");
      setPaymentMethod("Pix");
      setSaveMessage("Cliente cadastrado com sucesso.");
      window.setTimeout(() => setSaveMessage(""), 2500);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <PageShell
      kicker="Clientes"
      title="Carteira de tutores e cães"
      description="Veja a carteira, cadastre novos casos e entre direto no treino de cada cão."
      requireAuth="trainer"
    >
      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <article className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Tutores ativos
          </p>
          {clients.length === 0 ? (
            <div className="mt-5 rounded-3xl border border-dashed border-[var(--border)] bg-white/60 p-8 text-center">
              <p className="text-sm font-semibold text-[var(--foreground)]">Nenhum cliente cadastrado</p>
              <p className="mt-2 text-sm text-[var(--muted)]">Use o formulário ao lado para cadastrar seu primeiro cliente e cão.</p>
            </div>
          ) : null}
          <div className="mt-5 space-y-3">
            {clients.slice(0, 5).map((client) => (
              <div
                key={client.id}
                className="rounded-3xl border border-[var(--border)] bg-white/90 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {client.dogs[0]?.photoUrl ? (
                      <Image
                        src={client.dogs[0].photoUrl}
                        alt={`Foto de ${client.dogs[0].name}`}
                        width={56}
                        height={56}
                        unoptimized
                        className="h-14 w-14 rounded-2xl object-cover"
                      />
                    ) : null}
                    <div>
                    <h2 className="font-display text-xl font-semibold">{client.name}</h2>
                    <p className="text-sm text-[var(--muted)]">{client.phone}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-lagoon px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-sky-900">
                    {client.dogs.length} cães
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                  <span className="rounded-full border border-[var(--border)] px-3 py-2">{client.propertyType}</span>
                  <span className="rounded-full border border-[var(--border)] px-3 py-2">{client.plan}</span>
                  <span className="rounded-full border border-[var(--border)] px-3 py-2">
                    {(client.contractAmount ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                </div>
                <p className="mt-3 text-xs text-[var(--muted)]">
                  Pagamento: {client.paymentMethod ?? "Pix"} • vencimento dia {client.billingDay ?? 10}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {client.dogs.map((dog) => (
                    <Link
                      key={dog.id}
                      href={`/treinos?clientId=${client.id}&dogId=${dog.id}`}
                      className="pc-primary-action rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.08em]"
                    >
                      Abrir treino de {dog.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>

        <div className="grid gap-4">
          <article className="rounded-[1.75rem] border border-[var(--border)] bg-white/90 p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Novo cliente + novo cão
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold">
              Cadastro rápido para não perder oportunidade
            </h2>
            <form onSubmit={onSubmit} className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                value={clientName}
                onChange={(event) => setClientName(event.target.value)}
                placeholder="Nome do dono"
                className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-sky-400"
                required
              />
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Telefone"
                className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-sky-400"
              />
              <input
                value={dogName}
                onChange={(event) => setDogName(event.target.value)}
                placeholder="Nome do cão"
                className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-sky-400"
                required
              />
              <input
                value={breed}
                onChange={(event) => setBreed(event.target.value)}
                placeholder="Raça"
                className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-sky-400"
              />
              <input
                value={age}
                onChange={(event) => setAge(event.target.value)}
                placeholder="Idade do cão (ex: 2 anos)"
                className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-sky-400"
              />
              <input
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
                placeholder="Peso do cão (ex: 15 kg)"
                className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-sky-400"
              />
              <input
                value={trainingTypesRaw}
                onChange={(event) => setTrainingTypesRaw(event.target.value)}
                placeholder="Focos de treino (ex: Guia, Place, Reatividade)"
                className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-sky-400 sm:col-span-2"
              />
              <select
                value={propertyType}
                onChange={(event) => setPropertyType(event.target.value)}
                className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-sky-400"
              >
                <option value="Apartamento">Apartamento</option>
                <option value="Casa">Casa</option>
                <option value="Casa com quintal">Casa com quintal</option>
                <option value="Condomínio">Condomínio</option>
                <option value="Outro">Outro</option>
              </select>
              <input
                value={planLabel}
                onChange={(event) => setPlanLabel(event.target.value)}
                placeholder="Plano/contrato"
                className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-sky-400"
              />
              <input
                value={contractAmount}
                onChange={(event) => setContractAmount(event.target.value)}
                placeholder="Valor cobrado (R$)"
                className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-sky-400"
                required
              />
              <input
                type="number"
                min={1}
                max={28}
                value={billingDay}
                onChange={(event) => setBillingDay(event.target.value)}
                placeholder="Dia do vencimento"
                className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-sky-400"
              />
              <select
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value as ClientPaymentMethod)}
                className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-sky-400"
              >
                <option value="Pix">Pix</option>
                <option value="Cartao">Cartão</option>
                <option value="Boleto">Boleto</option>
                <option value="Dinheiro">Dinheiro</option>
              </select>
              {saveMessage ? (
                <p className="sm:col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{saveMessage}</p>
              ) : null}
              <button
                type="submit"
                disabled={isSaving}
                className="pc-primary-action sm:col-span-2 rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-60"
              >
                {isSaving ? "Salvando..." : "Salvar cadastro"}
              </button>
            </form>
          </article>

          <article className="rounded-[1.75rem] border border-[var(--border)] bg-white/90 p-5 shadow-sm lg:hidden">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Casos ativos</p>
            <div className="mt-3 space-y-2">
              {dogProfiles.slice(0, 4).map(({ client, dog }) => (
                <div key={dog.id} className="rounded-2xl border border-[var(--border)] p-3">
                  <p className="text-sm font-semibold text-[var(--foreground)]">{dog.name} • {dog.breed}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">Tutor: {client.name}</p>
                  <Link
                    href={`/treinos?clientId=${client.id}&dogId=${dog.id}`}
                    className="pc-primary-action mt-2 inline-flex rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em]"
                  >
                    Abrir treino
                  </Link>
                </div>
              ))}
            </div>
          </article>

          <div className="hidden lg:grid lg:gap-4">
          {dogProfiles.slice(0, 2).map(({ client, dog }) => (
            <article
              key={dog.id}
              className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel-strong)] p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                  {dog.photoUrl ? (
                    <Image
                      src={dog.photoUrl}
                      alt={`Foto de perfil de ${dog.name}`}
                      width={96}
                      height={96}
                      unoptimized
                      className="h-24 w-24 rounded-[1.5rem] object-cover shadow-sm"
                    />
                  ) : null}
                  <div>
                  <h2 className="mt-2 font-display text-3xl font-semibold">{dog.name}</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {dog.breed} • {dog.age} • {dog.weight}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">Tutor: {client.name}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-start justify-end gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                  {dog.trainingTypes.map((item) => (
                    <span key={item} className="rounded-full border border-[var(--border)] bg-white px-3 py-2">
                      {item}
                    </span>
                  ))}
                  <Link
                    href={`/treinos?clientId=${client.id}&dogId=${dog.id}`}
                    className="pc-primary-action rounded-full px-4 py-2"
                  >
                    Ir para treinos
                  </Link>
                </div>
              </div>

              <div className="mt-5 rounded-3xl bg-white p-4">
                <p className="text-sm font-semibold">Focos do caso</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                  {dog.trainingTypes.length > 0 ? (
                    dog.trainingTypes.map((item) => (
                      <span key={item} className="rounded-full border border-[var(--border)] px-3 py-2">
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className="text-[var(--muted)]">Não informado</span>
                  )}
                </div>
              </div>
            </article>
          ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}