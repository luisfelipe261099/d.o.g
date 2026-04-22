import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/events
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const trainer = await prisma.trainer.findUnique({ where: { userId: session.user.id } });
  if (!trainer) return NextResponse.json({ error: "Adestrador não encontrado" }, { status: 404 });

  const events = await prisma.calendarEvent.findMany({
    where:   { trainerId: trainer.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(events);
}

// POST /api/events
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const trainer = await prisma.trainer.findUnique({ where: { userId: session.user.id } });
  if (!trainer) return NextResponse.json({ error: "Adestrador não encontrado" }, { status: 404 });

  const body = await request.json() as {
    day: string;
    time: string;
    dog: string;
    client: string;
    plan?: string;
    sessionNumber?: number;
    status?: "Confirmado" | "Pendente" | "Aguardando" | "Recorrente" | "Cancelado";
  };

  const created = await prisma.calendarEvent.create({
    data: {
      trainerId:     trainer.id,
      day:           body.day,
      time:          body.time,
      dog:           body.dog,
      client:        body.client,
      plan:          body.plan          ?? "",
      sessionNumber: body.sessionNumber ?? 1,
      status:        body.status        ?? "Pendente",
    },
  });

  return NextResponse.json(created, { status: 201 });
}

// PATCH /api/events – atualiza status de um evento
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const trainer = await prisma.trainer.findUnique({ where: { userId: session.user.id } });
  if (!trainer) return NextResponse.json({ error: "Adestrador não encontrado" }, { status: 404 });

  const body = await request.json() as {
    id: string;
    status: "Confirmado" | "Pendente" | "Aguardando" | "Recorrente" | "Cancelado";
  };

  const allowedStatuses = new Set(["Confirmado", "Pendente", "Aguardando", "Recorrente", "Cancelado"]);
  if (!allowedStatuses.has(body.status)) {
    return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  }

  const updated = await prisma.calendarEvent.updateMany({
    where: { id: body.id, trainerId: trainer.id },
    data: { status: body.status },
  });

  return NextResponse.json({ ok: updated.count > 0 });
}
