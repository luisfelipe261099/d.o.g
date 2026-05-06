import { NextResponse } from "next/server";

import { hashPortalToken, isPortalPinValid, isPortalTokenActive } from "@/lib/portal-access";
import { prisma } from "@/lib/prisma";
import {
  applyAction,
  buildPublicState,
  emptyRawGamification,
  maybeApplyDailyVisit,
  type ApplyActionInput,
  type RawGamification,
} from "@/lib/gamification-shared";

type Params = { params: Promise<{ token: string }> };

async function resolveLink(rawToken: string, pin?: string) {
  const token = (rawToken || "").trim();
  if (!token || token.length < 20) return null;

  const link = await prisma.portalAccessLink.findUnique({
    where: { tokenHash: hashPortalToken(token) },
  });

  if (!link) return null;
  if (!isPortalTokenActive({ revokedAt: link.revokedAt, expiresAt: link.expiresAt })) return null;
  if (!isPortalPinValid(link.pinHash, pin)) return "PIN_INVALID" as const;

  return link;
}

function deserializeWatched(raw: string | null | undefined): string[] {
  try {
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function deserializeRatings(raw: string | null | undefined): Record<string, number> {
  try {
    const parsed = JSON.parse(raw || "{}");
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const out: Record<string, number> = {};
      for (const [key, value] of Object.entries(parsed)) {
        const num = Number(value);
        if (Number.isFinite(num)) out[String(key)] = Math.max(1, Math.min(5, Math.round(num)));
      }
      return out;
    }
    return {};
  } catch {
    return {};
  }
}

async function loadOrCreateRaw(trainerId: string, clientId: string): Promise<{ raw: RawGamification; existed: boolean }> {
  const existing = await prisma.clientGamification.findUnique({ where: { clientId } });
  if (existing) {
    return {
      existed: true,
      raw: {
        points: existing.points,
        streakDays: existing.streakDays,
        lastVisitDate: existing.lastVisitDate ?? "",
        trainerRating: existing.trainerRating,
        totalTasksCompleted: existing.totalTasksCompleted,
        totalFeedbacks: existing.totalFeedbacks,
        watchedVideos: deserializeWatched(existing.watchedVideos),
        sessionRatings: deserializeRatings(existing.sessionRatings),
      },
    };
  }

  return { existed: false, raw: emptyRawGamification() };
}

async function persistRaw(trainerId: string, clientId: string, raw: RawGamification, existed: boolean) {
  const data = {
    points: raw.points,
    streakDays: raw.streakDays,
    lastVisitDate: raw.lastVisitDate || null,
    trainerRating: raw.trainerRating,
    totalTasksCompleted: raw.totalTasksCompleted,
    totalFeedbacks: raw.totalFeedbacks,
    watchedVideos: JSON.stringify(raw.watchedVideos ?? []),
    sessionRatings: JSON.stringify(raw.sessionRatings ?? {}),
  };

  if (existed) {
    await prisma.clientGamification.update({ where: { clientId }, data });
  } else {
    await prisma.clientGamification.create({ data: { ...data, clientId, trainerId } });
  }
}

export async function GET(request: Request, { params }: Params) {
  const { token } = await params;
  const url = new URL(request.url);
  const pin = url.searchParams.get("pin") ?? undefined;
  const link = await resolveLink(token, pin);

  if (link === "PIN_INVALID") {
    return NextResponse.json({ error: "PIN obrigatorio ou invalido", code: "PIN_REQUIRED" }, { status: 401 });
  }
  if (!link) {
    return NextResponse.json({ error: "Link invalido ou expirado" }, { status: 404 });
  }

  const { raw, existed } = await loadOrCreateRaw(link.trainerId, link.clientId);
  const visit = maybeApplyDailyVisit(raw);
  if (visit.earned > 0 || !existed) {
    await persistRaw(link.trainerId, link.clientId, visit.raw, existed);
  }

  const state = buildPublicState(visit.raw);
  return NextResponse.json({
    state,
    earned: visit.earned > 0 ? { points: visit.earned, reason: visit.reason } : null,
  });
}

export async function POST(request: Request, { params }: Params) {
  const { token } = await params;
  const url = new URL(request.url);
  const pin = url.searchParams.get("pin") ?? undefined;
  const link = await resolveLink(token, pin);

  if (link === "PIN_INVALID") {
    return NextResponse.json({ error: "PIN obrigatorio ou invalido", code: "PIN_REQUIRED" }, { status: 401 });
  }
  if (!link) {
    return NextResponse.json({ error: "Link invalido ou expirado" }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as Partial<ApplyActionInput> | null;
  if (!body || !body.action) {
    return NextResponse.json({ error: "Acao invalida" }, { status: 400 });
  }

  if (body.action === "trainer_rated" && (typeof body.rating !== "number")) {
    return NextResponse.json({ error: "Rating obrigatorio" }, { status: 400 });
  }
  if (body.action === "session_rated" && (typeof body.rating !== "number" || !body.sessionId)) {
    return NextResponse.json({ error: "sessionId e rating obrigatorios" }, { status: 400 });
  }
  if (body.action === "video_watched" && !body.videoId) {
    return NextResponse.json({ error: "videoId obrigatorio" }, { status: 400 });
  }

  const allowed: ApplyActionInput["action"][] = [
    "task_completed",
    "task_uncompleted",
    "feedback_sent",
    "trainer_rated",
    "session_rated",
    "video_watched",
  ];
  if (!allowed.includes(body.action as ApplyActionInput["action"])) {
    return NextResponse.json({ error: "Acao nao suportada" }, { status: 400 });
  }

  const { raw, existed } = await loadOrCreateRaw(link.trainerId, link.clientId);
  const result = applyAction(raw, body as ApplyActionInput);
  await persistRaw(link.trainerId, link.clientId, result.raw, existed);

  const state = buildPublicState(result.raw);
  return NextResponse.json({
    state,
    earned: result.earned > 0 ? { points: result.earned, reason: result.reason } : null,
  });
}
