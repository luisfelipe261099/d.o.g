"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";

import { PageShell } from "@/components/page-shell";
import { useAppStore } from "@/lib/app-store";

export default function ClientsPage() {
  const clients = useAppStore((state) => state.clients);
  const addClientWithDog = useAppStore((state) => state.addClientWithDog);

  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [dogName, setDogName] = useState("");
  const [breed, setBreed] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!clientName.trim() || !dogName.trim()) return;

    addClientWithDog({
      clientName: clientName.trim(),
      phone: phone.trim() || "(00) 00000-0000",
      propertyType: "Apartamento",
      environment: "Ambiente cadastrado via formulário do sistema.",
      plan: "Plano Pro • 12 sessões",
      dogName: dogName.trim(),
      breed: breed.trim() || "SRD",
      age: "1 ano",
      weight: "15 kg",
      trainingTypes: ["Obediência", "Guia"],
    });

    setClientName("");
    setPhone("");
    setDogName("");
    setBreed("");
  }

  return (
    <PageShell
      kicker="Carteira"
      title="Meus clientes e cães"
      description="Gerencie todos os clientes e cães cadastrados com seus dados, planos e histórico de evolução."
      requireAuth="trainer"
    >
      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <article className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Lista de donos
          </p>
          <div className="mt-5 space-y-3">
            {clients.map((client) => (
              <div
                key={client.name}
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
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{client.environment}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                  <span className="rounded-full border border-[var(--border)] px-3 py-2">{client.propertyType}</span>
                  <span className="rounded-full border border-[var(--border)] px-3 py-2">{client.plan}</span>
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
              <button
                type="submit"
                className="sm:col-span-2 rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-semibold text-white"
              >
                Salvar cadastro
              </button>
            </form>
          </article>

          {(clients[0]?.dogs ?? []).map((dog) => (
            <article
              key={dog.name}
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
                      className="h-24 w-24 rounded-[1.5rem] object-cover shadow-sm"
                    />
                  ) : null}
                  <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">
                    Perfil do cão
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-semibold">{dog.name}</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {dog.breed} • {dog.age} • {dog.weight}
                  </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                  {dog.trainingTypes.map((item) => (
                    <span key={item} className="rounded-full border border-[var(--border)] bg-white px-3 py-2">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                <div className="rounded-3xl bg-white p-4">
                  <p className="text-sm font-semibold">Problemas prioritários</p>
                  <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--muted)]">
                    <li>• Puxa na guia em ambientes externos</li>
                    <li>• Reatividade em estímulos visuais</li>
                    <li>• Dificuldade em permanência no place</li>
                  </ul>
                </div>
                <div className="rounded-3xl bg-white p-4">
                  <p className="text-sm font-semibold">Saúde e rotina</p>
                  <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--muted)]">
                    <li>• Vacina: Protocolo em dia</li>
                    <li>• Vermífugo: Próxima dose em 15 dias</li>
                    <li>• Alimentação: Conforme orientação do tutor</li>
                    <li>• Alergias: Sem alerta crítico</li>
                  </ul>
                </div>
                <div className="rounded-3xl bg-slate-950 p-4 text-white">
                  <p className="text-sm font-semibold">Ferramentas e observações</p>
                  <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-300">
                    <li>• Guia longa</li>
                    <li>• Place</li>
                    <li>• Reforço alimentar</li>
                  </ul>
                  <p className="mt-4 text-sm leading-7 text-slate-300">
                    Ficha técnica completa do cão com histórico editável e acompanhamento contínuo.
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}