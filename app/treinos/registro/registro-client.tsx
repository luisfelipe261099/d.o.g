"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";

import { AuthGuard } from "@/components/auth-guard";
import { type TrainingMediaItem, useAppStore } from "@/lib/app-store";

const MAX_IMAGES = 4;
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;
const MAX_DIMENSION = 1280;

type StarRatingProps = {
  value: number;
  onChange: (value: number) => void;
};

function StarRating({ value, onChange }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= value;
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`h-9 w-9 rounded-full border text-lg leading-none transition-colors ${
              active
                ? "border-amber-300 bg-amber-50 text-amber-500"
                : "border-[var(--border)] bg-white text-slate-300"
            }`}
            aria-label={`Definir ${star} estrela(s)`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

async function toCompressedMedia(file: File): Promise<TrainingMediaItem> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Falha ao ler imagem."));
    reader.readAsDataURL(file);
  });

  const image = new window.Image();
  image.src = dataUrl;
  await image.decode();

  const scale = Math.min(1, MAX_DIMENSION / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Nao foi possivel processar a imagem.");
  }

  ctx.drawImage(image, 0, 0, width, height);

  const compressedDataUrl = canvas.toDataURL("image/webp", 0.8);
  const base64 = compressedDataUrl.split(",")[1] ?? "";
  const sizeBytes = Math.ceil((base64.length * 3) / 4);

  return {
    id: `media-${Math.random().toString(36).slice(2, 10)}`,
    dataUrl: compressedDataUrl,
    width,
    height,
    sizeKb: Math.max(1, Math.round(sizeBytes / 1024)),
    createdAt: new Date().toISOString(),
  };
}

export default function RegistroTreinoClientPage() {
  const searchParams = useSearchParams();
  const clients = useAppStore((state) => state.clients);
  const addTrainingSession = useAppStore((state) => state.addTrainingSession);
  const trainingSessions = useAppStore((state) => state.trainingSessions);

  const requestedClientId = searchParams.get("clientId") ?? "";
  const requestedDogId = searchParams.get("dogId") ?? "";

  const [selectedClientId, setSelectedClientId] = useState(requestedClientId || clients[0]?.id || "");
  const [selectedDogId, setSelectedDogId] = useState(requestedDogId || clients[0]?.dogs[0]?.id || "");
  const [title, setTitle] = useState("Treino de obediencia");
  const [rating, setRating] = useState(4);
  const [comment, setComment] = useState("Boa resposta aos comandos basicos.");
  const [draftMedia, setDraftMedia] = useState<TrainingMediaItem[]>([]);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === selectedClientId) ?? clients[0],
    [clients, selectedClientId],
  );

  const selectedDog = useMemo(
    () => selectedClient?.dogs.find((dog) => dog.id === selectedDogId) ?? selectedClient?.dogs[0],
    [selectedClient, selectedDogId],
  );

  useEffect(() => {
    if (!clients.length) return;

    if (requestedClientId) {
      const requestedClient = clients.find((client) => client.id === requestedClientId);
      if (requestedClient) {
        setSelectedClientId(requestedClient.id);

        const hasRequestedDog = requestedDogId
          ? requestedClient.dogs.some((dog) => dog.id === requestedDogId)
          : false;

        setSelectedDogId(hasRequestedDog ? requestedDogId : requestedClient.dogs[0]?.id ?? "");
        return;
      }
    }

    if (!selectedClientId) {
      setSelectedClientId(clients[0].id);
      setSelectedDogId(clients[0].dogs[0]?.id ?? "");
    }
  }, [clients, requestedClientId, requestedDogId, selectedClientId]);

  const nextSessionNumber = useMemo(() => {
    if (!selectedDog) return 1;

    const list = trainingSessions.filter((session) => {
      if (session.dogId) return session.dogId === selectedDog.id;
      return session.dogName === selectedDog.name;
    });

    if (!list.length) return 1;
    return Math.max(...list.map((session) => session.number)) + 1;
  }, [selectedDog, trainingSessions]);

  async function handleImages(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files?.length) return;

    setError("");

    if (draftMedia.length >= MAX_IMAGES) {
      setError(`Limite de ${MAX_IMAGES} imagens por registro.`);
      event.target.value = "";
      return;
    }

    const selectedFiles = Array.from(files).slice(0, MAX_IMAGES - draftMedia.length);

    for (const file of selectedFiles) {
      if (!file.type.startsWith("image/")) {
        setError("Somente imagens sao permitidas.");
        event.target.value = "";
        return;
      }

      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        setError("Cada imagem deve ter no maximo 2MB.");
        event.target.value = "";
        return;
      }
    }

    setIsProcessingImages(true);

    try {
      const converted = await Promise.all(selectedFiles.map((file) => toCompressedMedia(file)));
      setDraftMedia((current) => [...current, ...converted]);
    } catch {
      setError("Nao foi possivel processar uma ou mais imagens.");
    } finally {
      setIsProcessingImages(false);
      event.target.value = "";
    }
  }

  function removeMedia(mediaId: string) {
    setDraftMedia((current) => current.filter((item) => item.id !== mediaId));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;

    if (!selectedClient || !selectedDog) {
      setError("Selecione cliente e cachorro para salvar o treino.");
      return;
    }

    if (!title.trim() || !comment.trim()) {
      setError("Preencha o titulo e a avaliacao do treino.");
      return;
    }

    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      const ok = await addTrainingSession({
        number: nextSessionNumber,
        title: title.trim(),
        date: new Date().toLocaleDateString("pt-BR"),
        clientId: selectedClient.id,
        clientName: selectedClient.name,
        dogId: selectedDog.id,
        dogName: selectedDog.name,
        notes: [
          {
            block: "Avaliacao geral",
            score: rating * 2,
            comment: comment.trim(),
          },
        ],
        media: draftMedia,
      });

      if (!ok) {
        setError("Erro ao salvar registro. Tente novamente.");
        return;
      }

      setMessage("Registro de treino salvo com sucesso.");
      setTitle("Treino de obediencia");
      setRating(4);
      setComment("Boa resposta aos comandos basicos.");
      setDraftMedia([]);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AuthGuard role="trainer">
      <main className="mx-auto w-full max-w-md px-3 pb-24 pt-3 sm:max-w-xl">
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2d6f99]">Treinos</p>
              <h1 className="font-display text-2xl font-semibold text-[var(--foreground)]">Registro de treino</h1>
              <p className="mt-1 text-xs text-[var(--muted)]">Anexe imagens, avalie com estrelas e salve o historico do treino.</p>
            </div>
            <Link href="/treinos" className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[#145a82]">
              Voltar
            </Link>
          </div>

          {clients.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-[var(--border)] bg-white p-4 text-sm text-[var(--muted)]">
              Cadastre um cliente e um cachorro antes de registrar treino.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 grid gap-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-xs font-medium text-[var(--muted)]">Cliente</span>
                  <select
                    value={selectedClient?.id ?? ""}
                    onChange={(event) => {
                      const nextClientId = event.target.value;
                      const nextClient = clients.find((client) => client.id === nextClientId);
                      setSelectedClientId(nextClientId);
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
                  <span className="text-xs font-medium text-[var(--muted)]">Cachorro</span>
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
              </div>

              <label className="grid gap-1">
                <span className="text-xs font-medium text-[var(--muted)]">Titulo do treino</span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none focus:border-sky-400"
                  placeholder="Ex.: Treino de foco na guia"
                  required
                />
              </label>

              <div className="rounded-xl border border-[var(--border)] bg-white p-3">
                <p className="text-xs font-medium text-[var(--muted)]">Avaliacao (estrelas)</p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <StarRating value={rating} onChange={setRating} />
                  <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                    {rating}/5
                  </span>
                </div>
              </div>

              <label className="grid gap-1">
                <span className="text-xs font-medium text-[var(--muted)]">Observacoes do treino</span>
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  rows={4}
                  className="rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none focus:border-sky-400"
                  placeholder="Descreva pontos fortes, ajustes e plano da proxima sessao"
                  required
                />
              </label>

              <div className="rounded-xl border border-dashed border-[var(--border)] bg-sky-50/50 p-3">
                <p className="text-xs font-medium text-[var(--muted)]">Imagens do treino (opcional)</p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImages}
                  className="mt-2 block w-full text-xs text-[var(--muted)] file:mr-2 file:rounded-lg file:border file:border-[var(--border)] file:bg-white file:px-2 file:py-1 file:text-xs"
                />
                <p className="mt-1 text-[11px] text-[var(--muted)]">Ate {MAX_IMAGES} imagens, maximo 2MB por imagem.</p>

                {isProcessingImages ? <p className="mt-2 text-xs text-[#145a82]">Processando imagens...</p> : null}

                {draftMedia.length > 0 ? (
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {draftMedia.map((item) => (
                      <div key={item.id} className="rounded-xl border border-[var(--border)] bg-white p-1.5">
                        <div className="relative h-20 w-full overflow-hidden rounded-lg bg-slate-50">
                          <Image
                            src={item.dataUrl}
                            alt="Imagem anexada"
                            fill
                            unoptimized
                            sizes="120px"
                            className="object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMedia(item.id)}
                          className="mt-1 w-full rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              {message ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{message}</p> : null}
              {error ? <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p> : null}

              <button
                type="submit"
                disabled={isSaving || isProcessingImages}
                className="pc-primary-action rounded-full px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
              >
                {isSaving ? "Salvando registro..." : "Salvar registro do treino"}
              </button>
            </form>
          )}
        </section>
      </main>
    </AuthGuard>
  );
}