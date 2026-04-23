"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

import { PageShell } from "@/components/page-shell";
import { useAppStore } from "@/lib/app-store";

type DraftTrainingNote = {
  id: string;
  block: string;
  score: number;
  comment: string;
};

type DraftTrainingMedia = {
  id: string;
  dataUrl: string;
  thumbDataUrl: string;
  width: number;
  height: number;
  sizeKb: number;
  mainSizeKb: number;
  thumbSizeKb: number;
  createdAt: string;
};

type HistoryPeriod = "all" | "30d" | "90d";

const MAX_MEDIA_ITEMS = 5;
const TARGET_MAIN_IMAGE_KB = 115;
const MAX_MAIN_IMAGE_KB = 170;
const TARGET_THUMB_KB = 24;
const MAX_THUMB_KB = 40;
const MAX_TOTAL_MEDIA_KB = 750;
const MAX_DIMENSION = 1280;
const THUMB_MAX_DIMENSION = 320;

function createDraftTrainingNote(block = "Guia"): DraftTrainingNote {
  return {
    id: `note-${Math.random().toString(36).slice(2, 10)}`,
    block,
    score: 7,
    comment: "Boa evolução com reforço no timing.",
  };
}

function parseBrazilianDate(date: string): number {
  const [day, month, year] = date.split("/").map(Number);

  if (!day || !month || !year) {
    return 0;
  }

  return new Date(year, month - 1, day).getTime();
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Falha ao ler arquivo"));
    reader.readAsDataURL(file);
  });
}

async function compressTrainingImage(file: File): Promise<DraftTrainingMedia> {
  const sourceDataUrl = await fileToDataUrl(file);
  const image = new window.Image();
  image.src = sourceDataUrl;
  await image.decode();

  const scale = Math.min(1, MAX_DIMENSION / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas nao disponivel");
  ctx.drawImage(image, 0, 0, width, height);

  function encodeWebpWithTarget(sourceCanvas: HTMLCanvasElement, targetKb: number) {
    const qualities = [0.82, 0.72, 0.62, 0.52, 0.42, 0.34];
    let bestDataUrl = "";
    let bestSizeKb = Number.POSITIVE_INFINITY;

    for (const quality of qualities) {
      const dataUrl = sourceCanvas.toDataURL("image/webp", quality);
      const base64Part = dataUrl.split(",")[1] ?? "";
      const sizeBytes = Math.ceil((base64Part.length * 3) / 4);
      const sizeKb = Math.round(sizeBytes / 1024);

      if (sizeKb < bestSizeKb) {
        bestDataUrl = dataUrl;
        bestSizeKb = sizeKb;
      }

      if (sizeKb <= targetKb) {
        bestDataUrl = dataUrl;
        bestSizeKb = sizeKb;
        break;
      }
    }

    return { dataUrl: bestDataUrl, sizeKb: bestSizeKb };
  }

  const mainEncoded = encodeWebpWithTarget(canvas, TARGET_MAIN_IMAGE_KB);

  const thumbScale = Math.min(1, THUMB_MAX_DIMENSION / Math.max(width, height));
  const thumbWidth = Math.max(1, Math.round(width * thumbScale));
  const thumbHeight = Math.max(1, Math.round(height * thumbScale));
  const thumbCanvas = document.createElement("canvas");
  thumbCanvas.width = thumbWidth;
  thumbCanvas.height = thumbHeight;
  const thumbCtx = thumbCanvas.getContext("2d");
  if (!thumbCtx) throw new Error("Canvas de miniatura nao disponivel");
  thumbCtx.drawImage(image, 0, 0, thumbWidth, thumbHeight);
  const thumbEncoded = encodeWebpWithTarget(thumbCanvas, TARGET_THUMB_KB);

  return {
    id: `media-${Math.random().toString(36).slice(2, 10)}`,
    dataUrl: mainEncoded.dataUrl,
    thumbDataUrl: thumbEncoded.dataUrl,
    width,
    height,
    sizeKb: mainEncoded.sizeKb + thumbEncoded.sizeKb,
    mainSizeKb: mainEncoded.sizeKb,
    thumbSizeKb: thumbEncoded.sizeKb,
    createdAt: new Date().toISOString(),
  };
}

export default function TrainingPage() {
  const searchParams = useSearchParams();
  const clients = useAppStore((state) => state.clients);
  const trainingSessions = useAppStore((state) => state.trainingSessions);
  const calendarEvents = useAppStore((state) => state.calendarEvents);
  const addTrainingSession = useAppStore((state) => state.addTrainingSession);

  const initialClientId = searchParams.get("clientId") ?? clients[0]?.id ?? "";
  const initialDogId = searchParams.get("dogId") ?? clients[0]?.dogs[0]?.id ?? "";

  const [selectedClientId, setSelectedClientId] = useState(initialClientId);
  const [selectedDogId, setSelectedDogId] = useState(initialDogId);
  const [historyPeriod, setHistoryPeriod] = useState<HistoryPeriod>("all");
  const [title, setTitle] = useState("Sessão prática");
  const [draftNotes, setDraftNotes] = useState<DraftTrainingNote[]>([createDraftTrainingNote()]);
  const [draftMedia, setDraftMedia] = useState<DraftTrainingMedia[]>([]);
  const [isCompressingMedia, setIsCompressingMedia] = useState(false);
  const [mediaError, setMediaError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === selectedClientId) ?? clients[0],
    [clients, selectedClientId],
  );
  const selectedDog = useMemo(
    () => selectedClient?.dogs.find((dog) => dog.id === selectedDogId) ?? selectedClient?.dogs[0],
    [selectedClient, selectedDogId],
  );

  const selectedClientValue = selectedClient?.id ?? "";
  const selectedDogValue = selectedDog?.id ?? "";

  const selectedSessions = useMemo(() => {
    if (!selectedDog) return [];

    return trainingSessions.filter((session) => {
      if (session.dogId) {
        return session.dogId === selectedDog.id;
      }

      return session.dogName === selectedDog.name;
    });
  }, [selectedDog, trainingSessions]);

  const orderedSessions = useMemo(
    () => [...selectedSessions].sort((left, right) => right.number - left.number),
    [selectedSessions],
  );

  const historySessions = useMemo(() => {
    if (historyPeriod === "all") {
      return orderedSessions;
    }

    const days = historyPeriod === "30d" ? 30 : 90;
    const threshold = Date.now() - days * 24 * 60 * 60 * 1000;

    return orderedSessions.filter((session) => parseBrazilianDate(session.date) >= threshold);
  }, [historyPeriod, orderedSessions]);

  const blockSummaries = useMemo(() => {
    const map = new Map<string, number[]>();

    orderedSessions.forEach((session) => {
      session.notes.forEach((note) => {
        const values = map.get(note.block) ?? [];
        values.push(note.score);
        map.set(note.block, values);
      });
    });

    return Array.from(map.entries())
      .map(([name, progress]) => {
        const averageValue = progress.reduce((total, value) => total + value, 0) / progress.length;
        const lastScore = progress[progress.length - 1];
        const previousScore = progress.length > 1 ? progress[progress.length - 2] : lastScore;

        return {
          name,
          average: `${averageValue.toFixed(1)}/10`,
          averageValue,
          progress,
          lastScore,
          trend: lastScore - previousScore,
        };
      })
      .sort((left, right) => right.averageValue - left.averageValue);
  }, [orderedSessions]);

  const latestSession = orderedSessions[0];
  const upcomingSession = calendarEvents.find(
    (event) => event.dog === selectedDog?.name && event.client === selectedClient?.name,
  );
  const allNotes = orderedSessions.flatMap((session) => session.notes);
  const averageScore = allNotes.length
    ? (allNotes.reduce((total, note) => total + note.score, 0) / allNotes.length).toFixed(1)
    : "0.0";
  const strongestBlock = blockSummaries[0];
  const attentionBlock = [...blockSummaries].sort((left, right) => left.averageValue - right.averageValue)[0];
  const nextSessionNumber = selectedSessions.length
    ? Math.max(...selectedSessions.map((session) => session.number)) + 1
    : 1;
  const blockOptions = Array.from(
    new Set([
      "Guia",
      "Place",
      "Distrações",
      ...(selectedDog?.trainingTypes ?? []),
      ...blockSummaries.map((item) => item.name),
    ]),
  );
  const averageDraftScore = draftNotes.length
    ? (draftNotes.reduce((total, note) => total + note.score, 0) / draftNotes.length).toFixed(1)
    : "0.0";
  const draftBlocksLabel = draftNotes.map((note) => note.block).join(" • ");
  const totalMediaKb = draftMedia.reduce((sum, item) => sum + item.sizeKb, 0);

  function resetDraftNotes(defaultBlock = selectedDog?.trainingTypes[0] ?? "Guia") {
    setDraftNotes([createDraftTrainingNote(defaultBlock)]);
  }

  function updateDraftNote(noteId: string, field: keyof Omit<DraftTrainingNote, "id">, value: string | number) {
    setDraftNotes((currentNotes) =>
      currentNotes.map((note) =>
        note.id === noteId
          ? {
              ...note,
              [field]: value,
            }
          : note,
      ),
    );
  }

  function addDraftNote() {
    setDraftNotes((currentNotes) => [
      ...currentNotes,
      createDraftTrainingNote(selectedDog?.trainingTypes[0] ?? blockOptions[0] ?? "Guia"),
    ]);
  }

  function removeDraftNote(noteId: string) {
    setDraftNotes((currentNotes) => {
      if (currentNotes.length === 1) {
        return currentNotes;
      }

      return currentNotes.filter((note) => note.id !== noteId);
    });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;

    const validNotes = draftNotes
      .map((note) => ({
        block: note.block.trim(),
        score: note.score,
        comment: note.comment.trim(),
      }))
      .filter((note) => note.block && note.comment);

    if (!title.trim() || !selectedClient || !selectedDog || !validNotes.length) return;
    if (totalMediaKb > MAX_TOTAL_MEDIA_KB) {
      setSaveError("As imagens da sessão excedem o limite total permitido.");
      return;
    }

    setSaveError("");
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
        notes: validNotes,
        media: draftMedia,
      });
      if (ok) {
        setTitle("Sessão prática");
        resetDraftNotes();
        setDraftMedia([]);
        setMediaError("");
      } else {
        setSaveError("Erro ao salvar sessão. Verifique sua conexão e tente novamente.");
        window.setTimeout(() => setSaveError(""), 4000);
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleMediaSelect(files: FileList | null) {
    if (!files?.length) return;

    setMediaError("");
    const room = MAX_MEDIA_ITEMS - draftMedia.length;
    if (room <= 0) {
      setMediaError(`Limite de ${MAX_MEDIA_ITEMS} imagens por sessão atingido.`);
      return;
    }

    const selected = Array.from(files).slice(0, room);
    setIsCompressingMedia(true);

    try {
      const compressed = await Promise.all(
        selected.map(async (file) => {
          if (!file.type.startsWith("image/")) {
            throw new Error("Apenas imagens sao permitidas.");
          }

          const media = await compressTrainingImage(file);
          if ((media.mainSizeKb ?? media.sizeKb) > MAX_MAIN_IMAGE_KB) {
            throw new Error(`Imagem principal acima do limite de ${MAX_MAIN_IMAGE_KB}KB.`);
          }

          if ((media.thumbSizeKb ?? 0) > MAX_THUMB_KB) {
            throw new Error(`Miniatura acima do limite de ${MAX_THUMB_KB}KB.`);
          }

          return media;
        }),
      );

      const nextMedia = [...draftMedia, ...compressed];
      const nextTotalKb = nextMedia.reduce((sum, item) => sum + item.sizeKb, 0);
      if (nextTotalKb > MAX_TOTAL_MEDIA_KB) {
        setMediaError(`Total de imagens excede ${MAX_TOTAL_MEDIA_KB}KB. Remova alguma imagem.`);
        return;
      }

      setDraftMedia(nextMedia);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao processar imagem.";
      setMediaError(message);
    } finally {
      setIsCompressingMedia(false);
    }
  }

  function removeDraftMedia(mediaId: string) {
    setDraftMedia((current) => current.filter((item) => item.id !== mediaId));
  }

  return (
    <PageShell
      kicker="Treinos"
      title="Treinos com mem\u00f3ria t\u00e9cnica"
      description="Selecione o caso, registre a sessão e acompanhe apenas os sinais principais de evolução."
      requireAuth="trainer"
    >
      {clients.length === 0 ? (
        <section className="flex flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-[var(--border)] bg-white/80 p-12 text-center shadow-sm">
          <p className="text-lg font-semibold text-[var(--foreground)]">Nenhum cliente cadastrado</p>
          <p className="mt-2 text-sm text-[var(--muted)]">Cadastre um cliente e seu cão na página Clientes para começar a registrar treinos.</p>
        </section>
      ) : (
      <>
      <section className="grid gap-4 xl:grid-cols-[1.12fr_0.88fr]">
        <div className="grid gap-4">
          <article className="overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-slate-950 text-white shadow-sm">
            <div className="grid gap-5 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Próxima condução de treino
                </p>
                <h2 className="mt-3 font-display text-3xl font-semibold">
                  {selectedDog ? `${selectedDog.name} em foco para a sessão ${nextSessionNumber}` : "Selecione um cliente e cão"}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                  Defina o caso e registre a aula sem excesso de informação na tela.
                </p>

                <div className="mt-5 grid gap-3 lg:grid-cols-2">
                  <label className="rounded-3xl border border-white/10 bg-white/7 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Cliente</p>
                    <select
                      value={selectedClientValue}
                      onChange={(event) => {
                        const nextClientId = event.target.value;
                        const nextClient = clients.find((client) => client.id === nextClientId);
                        const nextDog = nextClient?.dogs[0];

                        setSelectedClientId(nextClientId);
                        setSelectedDogId(nextDog?.id ?? "");
                        resetDraftNotes(nextDog?.trainingTypes[0] ?? "Guia");
                      }}
                      className="mt-3 w-full rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-sm text-white outline-none"
                    >
                      {clients.map((client) => (
                        <option key={client.id} value={client.id} className="text-slate-950">
                          {client.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="rounded-3xl border border-white/10 bg-white/7 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Cão</p>
                    <select
                      value={selectedDogValue}
                      onChange={(event) => {
                        const nextDogId = event.target.value;
                        const nextDog = selectedClient?.dogs.find((dog) => dog.id === nextDogId);

                        setSelectedDogId(nextDogId);
                        resetDraftNotes(nextDog?.trainingTypes[0] ?? "Guia");
                      }}
                      className="mt-3 w-full rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-sm text-white outline-none"
                    >
                      {(selectedClient?.dogs ?? []).map((dog) => (
                        <option key={dog.id} value={dog.id} className="text-slate-950">
                          {dog.name} • {dog.breed}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {selectedClient && (
                  <p className="mt-5 text-sm text-slate-300">
                    {selectedClient.name}{upcomingSession ? ` • ${upcomingSession.day} ${upcomingSession.time}` : ""}
                  </p>
                )}
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/7 p-4">
                {selectedDog?.photoUrl ? (
                  <div className="relative h-64 w-full overflow-hidden rounded-[1.25rem]">
                    <Image
                      src={selectedDog.photoUrl}
                      alt={`Foto de ${selectedDog.name}`}
                      fill
                      sizes="(min-width: 1280px) 28vw, (min-width: 1024px) 36vw, 100vw"
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">
                  {(selectedDog?.trainingTypes ?? []).map((item) => (
                    <span key={item} className="rounded-full border border-white/12 px-3 py-2">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </article>

          <div className="grid gap-4 sm:grid-cols-2">
            <article className="rounded-[1.5rem] border border-[var(--border)] bg-white/90 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Sessões</p>
              <p className="mt-3 font-display text-4xl font-semibold">{orderedSessions.length}</p>
              <p className="mt-2 text-sm text-[var(--muted)]">histórico técnico ativo{selectedDog ? ` de ${selectedDog.name}` : ""}</p>
            </article>
            <article className="rounded-[1.5rem] border border-[var(--border)] bg-white/90 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Média geral</p>
              <p className="mt-3 font-display text-4xl font-semibold">{averageScore}</p>
              <p className="mt-2 text-sm text-emerald-700">nível consolidado de execução técnica</p>
            </article>
          </div>

          <article className="rounded-[1.5rem] border border-[var(--border)] bg-white/90 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Resumo rápido</p>
            <div className="mt-3 space-y-2 text-sm text-[var(--muted)]">
              <p>
                Melhor bloco: <span className="font-semibold text-[var(--foreground)]">{strongestBlock?.name ?? "—"}</span>
              </p>
              <p>
                Atenção imediata: <span className="font-semibold text-[var(--foreground)]">{attentionBlock?.name ?? "—"}</span>
              </p>
              <p>
                Próxima sessão: <span className="font-semibold text-[var(--foreground)]">{upcomingSession ? `${upcomingSession.day} • ${upcomingSession.time}` : "Sem agenda"}</span>
              </p>
            </div>
          </article>

          <article className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Evolução essencial</p>
            <div className="mt-4 space-y-3">
              {blockSummaries.slice(0, 2).map((item) => (
                <div key={item.name} className="rounded-2xl border border-[var(--border)] bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[var(--foreground)]">{item.name}</p>
                    <p className="text-xs font-semibold text-emerald-700">{item.average}</p>
                  </div>
                  <p className="mt-1 text-xs text-[var(--muted)]">Última nota {item.lastScore}/10</p>
                </div>
              ))}
              {!blockSummaries.length ? (
                <div className="rounded-2xl border border-dashed border-[var(--border)] bg-white p-4 text-xs text-[var(--muted)]">
                  Registre a primeira sessão para gerar leitura de evolução.
                </div>
              ) : null}
            </div>
          </article>
        </div>

        <div className="grid gap-4">
          <article className="rounded-[1.75rem] border border-[var(--border)] bg-white/95 p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Registrar treino
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold">Registro operacional da sessão</h2>
              </div>
              <span className="rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white">
                Sessão {nextSessionNumber}
              </span>
            </div>

            <form onSubmit={onSubmit} className="mt-5 grid gap-4">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="rounded-2xl border border-[var(--border)] px-4 py-3 text-sm outline-none focus:border-sky-400"
                placeholder="Título da sessão"
                required
              />

              <div className="flex items-center justify-between gap-3 rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Blocos da sessão</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">Documente múltiplos focos técnicos na mesma aula para manter histórico rico.</p>
                </div>
                <button
                  type="button"
                  onClick={addDraftNote}
                  className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--foreground)]"
                >
                  Adicionar bloco
                </button>
              </div>

              <div className="space-y-3">
                {draftNotes.map((note, index) => (
                  <div key={note.id} className="rounded-3xl border border-[var(--border)] bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold">Bloco {index + 1}</p>
                      {draftNotes.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => removeDraftNote(note.id)}
                          className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-800"
                        >
                          Remover
                        </button>
                      ) : null}
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_120px]">
                      <select
                        value={note.block}
                        onChange={(event) => updateDraftNote(note.id, "block", event.target.value)}
                        className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none focus:border-sky-400"
                      >
                        {blockOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={note.score}
                        onChange={(event) => updateDraftNote(note.id, "score", Number(event.target.value))}
                        className="rounded-2xl border border-[var(--border)] px-4 py-3 text-sm outline-none focus:border-sky-400"
                      />
                    </div>

                    <textarea
                      value={note.comment}
                      onChange={(event) => updateDraftNote(note.id, "comment", event.target.value)}
                      className="mt-3 min-h-28 w-full rounded-2xl border border-[var(--border)] px-4 py-3 text-sm outline-none focus:border-sky-400"
                      placeholder="O que aconteceu neste bloco, onde houve avanço e qual ajuste precisa entrar na próxima aula"
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Imagens do treinamento</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      Compressao automatica para economizar Vercel/TiDB. Limite: {MAX_MEDIA_ITEMS} imagens, principal ate {MAX_MAIN_IMAGE_KB}KB e thumb ate {MAX_THUMB_KB}KB.
                    </p>
                  </div>
                  <label className="cursor-pointer rounded-full border border-[var(--border)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--foreground)]">
                    {isCompressingMedia ? "Comprimindo..." : "Adicionar imagens"}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={isCompressingMedia}
                      onChange={(event) => {
                        handleMediaSelect(event.target.files);
                        event.currentTarget.value = "";
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                <p className="mt-3 text-xs text-[var(--muted)]">
                  Total atual: {draftMedia.length}/{MAX_MEDIA_ITEMS} imagem(ns) • {totalMediaKb}/{MAX_TOTAL_MEDIA_KB}KB
                </p>

                {mediaError ? <p className="mt-2 text-xs text-rose-700">{mediaError}</p> : null}

                {draftMedia.length ? (
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    {draftMedia.map((media) => (
                      <div key={media.id} className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white">
                        <div className="relative h-28 w-full">
                          <Image
                            src={media.thumbDataUrl || media.dataUrl}
                            alt="Treino"
                            fill
                            sizes="(min-width: 640px) 20vw, 100vw"
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                        <div className="flex items-center justify-between gap-2 p-2 text-[11px] text-[var(--muted)]">
                          <span>{media.mainSizeKb ?? media.sizeKb} + {media.thumbSizeKb ?? 0}KB</span>
                          <button
                            type="button"
                            onClick={() => removeDraftMedia(media.id)}
                            className="font-semibold uppercase tracking-[0.12em] text-amber-800"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="pc-primary-action rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-60"
              >
                {isSaving ? "Salvando..." : "Salvar sess\u00e3o"}
              </button>
              {saveError ? (
                <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{saveError}</p>
              ) : null}
            </form>

            <div className="mt-5 rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Resumo antes de salvar</p>
              <div className="mt-3 grid gap-3 text-sm text-[var(--muted)] sm:grid-cols-2">
                <div>
                  <p className="font-semibold text-[var(--foreground)]">Caso selecionado</p>
                  <p className="mt-1">{selectedClient?.name} • {selectedDog?.name}</p>
                </div>
                <div>
                  <p className="font-semibold text-[var(--foreground)]">Blocos desta sessão</p>
                  <p className="mt-1">{draftBlocksLabel || "Nenhum bloco definido"}</p>
                </div>
                <div>
                  <p className="font-semibold text-[var(--foreground)]">Quantidade de blocos</p>
                  <p className="mt-1">{draftNotes.length}</p>
                </div>
                <div>
                  <p className="font-semibold text-[var(--foreground)]">Média prevista</p>
                  <p className="mt-1">{averageDraftScore}/10</p>
                </div>
                <div>
                  <p className="font-semibold text-[var(--foreground)]">Imagens</p>
                  <p className="mt-1">{draftMedia.length} arquivo(s) • {totalMediaKb}KB</p>
                </div>
              </div>
            </div>
          </article>

          <article className="hidden rounded-[1.75rem] border border-[var(--border)] bg-slate-950 p-6 text-white shadow-sm xl:block">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Plano da próxima aula
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold">Roteiro recomendado com base no histórico</h2>
            <div className="mt-5 space-y-3 text-sm leading-7 text-slate-300">
              <div className="rounded-3xl bg-white/7 p-4">
                <p className="font-semibold text-white">Aquecimento</p>
                <p className="mt-2">
                  Retomar {strongestBlock?.name?.toLowerCase() ?? "o bloco mais consistente"} para entrar com resposta fácil e elevar foco logo no início.
                </p>
              </div>
              <div className="rounded-3xl bg-white/7 p-4">
                <p className="font-semibold text-white">Ponto principal</p>
                <p className="mt-2">
                  Priorizar {attentionBlock?.name?.toLowerCase() ?? "o bloco mais sensível"} com progressão curta, ambiente controlado e critério mais claro entre repetições.
                </p>
              </div>
              <div className="rounded-3xl bg-white/7 p-4">
                <p className="font-semibold text-white">Entrega para o cliente</p>
                <p className="mt-2">
                  Fechar a aula com uma tarefa simples e objetiva para casa, conectada ao bloco {attentionBlock?.name ?? draftNotes[0]?.block ?? "Guia"}.
                </p>
              </div>
              <div className="rounded-3xl bg-white/7 p-4">
                <p className="font-semibold text-white">Contexto do ambiente</p>
                <p className="mt-2">
                  {selectedClient?.environment ?? "Ambiente ainda não descrito para este cliente."}
                </p>
              </div>
            </div>
          </article>

          <article className="hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel-strong)] p-6 shadow-sm xl:block">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Última sessão lançada
            </p>
            <div className="mt-4 rounded-3xl border border-[var(--border)] bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl font-semibold">{latestSession?.title ?? "Sessão prática"}</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">{latestSession?.date ?? "—"}</p>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-amber-900">
                  Sessão {latestSession?.number ?? "—"}
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {latestSession?.notes.map((note) => (
                  <div key={note.block} className="rounded-2xl border border-[var(--border)] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">{note.block}</p>
                      <span className="text-sm font-semibold text-emerald-700">{note.score}/10</span>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{note.comment}</p>
                  </div>
                )) ?? (
                  <div className="rounded-2xl border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">
                    Nenhuma sessão registrada ainda para este cão.
                  </div>
                )}
                {latestSession?.media?.length ? (
                  <div className="grid gap-3 sm:grid-cols-3">
                    {latestSession.media.map((media) => (
                      <div key={media.id} className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--panel)]">
                        <div className="relative h-24 w-full">
                          <Image
                            src={media.thumbDataUrl || media.dataUrl}
                            alt="Registro de treino"
                            fill
                            sizes="(min-width: 1280px) 8vw, 25vw"
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="mt-4 hidden xl:block">
        <article className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                Histórico de sessões
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold">
                Timeline de {selectedDog?.name ?? "treinos"} para revisar evolução, método aplicado e próximos ajustes
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { value: "all", label: "Tudo" },
                { value: "30d", label: "30 dias" },
                { value: "90d", label: "90 dias" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setHistoryPeriod(option.value as HistoryPeriod)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${historyPeriod === option.value ? "bg-slate-900 text-white" : "border border-[var(--border)] bg-white text-[var(--muted)]"}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {historySessions.length ? (
            <div className="mt-6 space-y-4">
              {historySessions.map((session) => (
                <article key={session.id} className="rounded-3xl border border-[var(--border)] bg-white/90 p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">{session.date}</p>
                      <h3 className="mt-2 font-display text-2xl font-semibold">{session.title}</h3>
                      <p className="mt-2 text-sm text-[var(--muted)]">{session.clientName ?? selectedClient?.name} • {session.dogName ?? selectedDog?.name}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.14em]">
                      <span className="rounded-full bg-slate-900 px-3 py-2 text-white">Sessão {session.number}</span>
                      <span className="rounded-full border border-[var(--border)] px-3 py-2 text-[var(--muted)]">
                        {session.notes.length} blocos avaliados
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 lg:grid-cols-2">
                    {session.notes.map((note) => (
                      <div key={`${session.id}-${note.block}`} className="rounded-2xl border border-[var(--border)] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="font-semibold">{note.block}</h4>
                          <span className="text-sm font-semibold text-emerald-700">{note.score}/10</span>
                        </div>
                        <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{note.comment}</p>
                      </div>
                    ))}
                  </div>
                  {session.media?.length ? (
                    <div className="mt-4 grid gap-3 lg:grid-cols-4">
                      {session.media.map((media) => (
                        <div key={media.id} className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--panel)]">
                          <div className="relative h-24 w-full">
                            <Image
                              src={media.thumbDataUrl || media.dataUrl}
                              alt="Imagem da sessão"
                              fill
                              sizes="(min-width: 1024px) 8vw, 25vw"
                              unoptimized
                              className="object-cover"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-dashed border-[var(--border)] bg-white/80 p-6 text-sm leading-7 text-[var(--muted)]">
              Nenhuma sessão encontrada para {selectedDog?.name ?? "o cão selecionado"} neste período. Ajuste o filtro ou registre uma nova sessão.
            </div>
          )}
        </article>
      </section>

      <section className="mt-4 xl:hidden">
        <article className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Timeline simplificada</p>
          <div className="mt-4 space-y-3">
            {historySessions.slice(0, 2).map((session) => (
              <div key={session.id} className="rounded-2xl border border-[var(--border)] bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-700">{session.date}</p>
                <h3 className="mt-1 text-base font-semibold text-[var(--foreground)]">{session.title}</h3>
                <p className="mt-1 text-xs text-[var(--muted)]">Sessão {session.number} • {session.notes.length} blocos</p>
              </div>
            ))}
            {!historySessions.length ? (
              <div className="rounded-2xl border border-dashed border-[var(--border)] bg-white p-4 text-xs text-[var(--muted)]">
                Sem sessões no período atual.
              </div>
            ) : null}
          </div>
        </article>
      </section>
      </>
      )}
    </PageShell>
  );
}